import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import styled from 'styled-components';
import { format } from 'date-fns';
import { MapPin } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { DeerStalkingRecord, DEER_SPECIES } from '../types';
import { getDatabase } from '../database/database';
import { seedDatabase } from '../database/seedData';
import { gridRefToLatLng, testGridRefConversion } from '../utils/gridReference';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapContainerStyled = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
  min-height: calc(100vh - 120px);
`;

const MapControls = styled.div`
  display: grid;
  gap: ${props => props.theme.spacing.md};
  grid-template-columns: 1fr;
  
  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: 1fr 1fr;
  }
  
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 2fr 1fr 1fr 1fr;
  }
`;

const MapWrapper = styled.div`
  flex: 1;
  min-height: 500px;
  height: 70vh;
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${props => props.theme.shadows.md};

  .leaflet-container {
    height: 100%;
    width: 100%;
  }

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    min-height: 600px;
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const StatCard = styled(Card)`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xxl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

// Custom marker icons for different species
const createCustomIcon = (species: string, color: string) => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: white;
        font-weight: bold;
      ">
        ${species.charAt(0)}
      </div>
    `,
    className: 'custom-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const speciesColors: { [key: string]: string } = {
  'Fallow Deer': '#10b981',
  'Muntjac': '#f59e0b',
  'Roe Deer': '#3b82f6',
  'Red Deer': '#ef4444',
  'Fox': '#8b5cf6',
  'Unknown': '#6b7280',
};

// Component to fit map bounds to markers
const FitBounds: React.FC<{ markers: Array<{ lat: number; lng: number }> }> = ({ markers }) => {
  const map = useMap();
  
  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, markers]);
  
  return null;
};

export const Map: React.FC = () => {
  const [records, setRecords] = useState<DeerStalkingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [speciesFilter, setSpeciesFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  // Load records from database
  useEffect(() => {
    const loadRecords = async () => {
      try {
        // Test grid reference conversion
        testGridRefConversion();

        const db = getDatabase();
        let dbRecords = db.getAllRecords();

        // If no records exist, seed the database
        if (dbRecords.length === 0) {
          console.log('No records found, seeding database...');
          const insertedCount = seedDatabase();
          console.log(`Inserted ${insertedCount} records`);
          dbRecords = db.getAllRecords();
        }

        setRecords(dbRecords);
      } catch (error) {
        console.error('Error loading records:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, []);

  // Filter records and convert to map markers
  const mapMarkers = useMemo(() => {
    const filteredRecords = records.filter(record => {
      const matchesSpecies = !speciesFilter || record.species === speciesFilter;
      const matchesLocation = !locationFilter || record.location.toLowerCase().includes(locationFilter.toLowerCase());
      
      let matchesDateRange = true;
      if (dateFromFilter || dateToFilter) {
        const recordDate = new Date(record.date);
        if (dateFromFilter) {
          matchesDateRange = matchesDateRange && recordDate >= new Date(dateFromFilter);
        }
        if (dateToFilter) {
          matchesDateRange = matchesDateRange && recordDate <= new Date(dateToFilter);
        }
      }
      
      return matchesSpecies && matchesLocation && matchesDateRange;
    });

    return filteredRecords
      .map(record => {
        if (!record.gridRef) return null;
        
        const latLng = gridRefToLatLng(record.gridRef);
        if (!latLng) return null;
        
        return {
          ...latLng,
          record,
          icon: createCustomIcon(record.species, speciesColors[record.species] || speciesColors['Unknown'])
        };
      })
      .filter(Boolean) as Array<{ lat: number; lng: number; record: DeerStalkingRecord; icon: L.DivIcon }>;
  }, [records, speciesFilter, locationFilter, dateFromFilter, dateToFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const filteredRecords = mapMarkers.map(m => m.record);
    const speciesCount = new Set(filteredRecords.map(r => r.species)).size;
    const locationCount = new Set(filteredRecords.map(r => r.location)).size;
    const totalWeight = filteredRecords.reduce((sum, r) => sum + (r.weight || 0), 0);
    
    return {
      totalRecords: filteredRecords.length,
      speciesCount,
      locationCount,
      totalWeight: Math.round(totalWeight * 10) / 10,
    };
  }, [mapMarkers]);

  const speciesOptions = [
    { value: '', label: 'All Species' },
    ...DEER_SPECIES.map(species => ({ value: species, label: species })),
    { value: 'Fox', label: 'Fox' }
  ];

  // Default center on Herefordshire (more accurate coordinates)
  const defaultCenter: [number, number] = [52.05, -2.65];

  if (loading) {
    return (
      <MapContainerStyled>
        <Card>
          <CardContent>
            <p>Loading map data...</p>
          </CardContent>
        </Card>
      </MapContainerStyled>
    );
  }

  return (
    <MapContainerStyled>
      <Card>
        <CardHeader>
          <CardTitle>
            <MapPin size={24} style={{ marginRight: '0.5rem' }} />
            Deer Stalking Activity Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MapControls>
            <Input
              placeholder="Filter by location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              fullWidth
            />
            <Select
              options={speciesOptions}
              value={speciesFilter}
              onChange={(e) => setSpeciesFilter(e.target.value)}
              fullWidth
            />
            <Input
              label="From Date"
              type="date"
              value={dateFromFilter}
              onChange={(e) => setDateFromFilter(e.target.value)}
              fullWidth
            />
            <Input
              label="To Date"
              type="date"
              value={dateToFilter}
              onChange={(e) => setDateToFilter(e.target.value)}
              fullWidth
            />
          </MapControls>
        </CardContent>
      </Card>

      <StatsContainer>
        <StatCard>
          <CardContent>
            <StatValue>{stats.totalRecords}</StatValue>
            <StatLabel>Total Records</StatLabel>
          </CardContent>
        </StatCard>
        <StatCard>
          <CardContent>
            <StatValue>{stats.speciesCount}</StatValue>
            <StatLabel>Species</StatLabel>
          </CardContent>
        </StatCard>
        <StatCard>
          <CardContent>
            <StatValue>{stats.locationCount}</StatValue>
            <StatLabel>Locations</StatLabel>
          </CardContent>
        </StatCard>
        <StatCard>
          <CardContent>
            <StatValue>{stats.totalWeight}kg</StatValue>
            <StatLabel>Total Weight</StatLabel>
          </CardContent>
        </StatCard>
      </StatsContainer>

      <MapWrapper>
        <MapContainer
          center={defaultCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <FitBounds markers={mapMarkers} />
          
          {mapMarkers.map((marker, index) => (
            <Marker
              key={`${marker.record.id}-${index}`}
              position={[marker.lat, marker.lng]}
              icon={marker.icon}
            >
              <Popup>
                <div style={{ minWidth: '200px' }}>
                  <h4 style={{ margin: '0 0 8px 0', color: speciesColors[marker.record.species] }}>
                    {marker.record.species}
                  </h4>
                  <p><strong>Date:</strong> {format(new Date(marker.record.date), 'dd MMM yyyy')}</p>
                  <p><strong>Location:</strong> {marker.record.location}</p>
                  <p><strong>Grid Ref:</strong> {marker.record.gridRef}</p>
                  <p><strong>Sex:</strong> {marker.record.sex}</p>
                  <p><strong>Maturity:</strong> {marker.record.maturity}</p>
                  {marker.record.weight > 0 && (
                    <p><strong>Weight:</strong> {marker.record.weight}kg</p>
                  )}
                  <p><strong>Time:</strong> {marker.record.timeOfDay}</p>
                  <p><strong>Shooter:</strong> {marker.record.shooter}</p>
                  {marker.record.remarks && (
                    <p><strong>Remarks:</strong> {marker.record.remarks}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </MapWrapper>
    </MapContainerStyled>
  );
};
