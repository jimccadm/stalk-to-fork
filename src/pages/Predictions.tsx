import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { format, parseISO, getMonth } from 'date-fns';
import { TrendingUp, MapPin, Clock, Target, BarChart3, Calendar } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { DeerStalkingRecord, DEER_SPECIES } from '../types';
import { getDatabase } from '../database/database';
import { seedDatabase } from '../database/seedData';

const PredictionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
  max-width: 1200px;
  margin: 0 auto;
`;

const FiltersCard = styled(Card)`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.md};
`;

const AnalysisGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing.lg};
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

const PredictionItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: ${props => props.theme.colors.surfaceVariant};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const PredictionText = styled.div`
  flex: 1;
`;

const ConfidenceBar = styled.div<{ $confidence: number }>`
  width: 60px;
  height: 8px;
  background-color: ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.full};
  overflow: hidden;
  
  &::after {
    content: '';
    display: block;
    width: ${props => props.$confidence}%;
    height: 100%;
    background-color: ${props => props.theme.colors.primary};
    transition: width 0.3s ease;
  }
`;

const LocationList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const TimeSlot = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.sm};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

interface AnalysisData {
  speciesStats: { [species: string]: number };
  locationStats: { [location: string]: number };
  timeStats: { [time: string]: number };
  monthlyStats: { [month: string]: number };
  predictions: PredictionResult[];
}

interface PredictionResult {
  type: 'location' | 'time' | 'species';
  title: string;
  description: string;
  confidence: number;
  icon: React.ComponentType<{ size?: number }>;
}

export const Predictions: React.FC = () => {
  const [records, setRecords] = useState<DeerStalkingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecies, setSelectedSpecies] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  // Load records from database
  useEffect(() => {
    const loadRecords = async () => {
      try {
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

  // Filter records based on selected filters
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const speciesMatch = selectedSpecies === 'all' || record.species === selectedSpecies;
      const monthMatch = selectedMonth === 'all' || 
        getMonth(parseISO(record.date)).toString() === selectedMonth;
      
      return speciesMatch && monthMatch;
    });
  }, [records, selectedSpecies, selectedMonth]);

  // Analyze data for predictions
  const analysisData: AnalysisData = useMemo(() => {
    const speciesStats: { [species: string]: number } = {};
    const locationStats: { [location: string]: number } = {};
    const timeStats: { [time: string]: number } = {};
    const monthlyStats: { [month: string]: number } = {};

    filteredRecords.forEach(record => {
      // Species statistics
      speciesStats[record.species] = (speciesStats[record.species] || 0) + 1;
      
      // Location statistics
      locationStats[record.location] = (locationStats[record.location] || 0) + 1;
      
      // Time of day statistics
      timeStats[record.timeOfDay] = (timeStats[record.timeOfDay] || 0) + 1;
      
      // Monthly statistics
      const monthName = format(parseISO(record.date), 'MMMM');
      monthlyStats[monthName] = (monthlyStats[monthName] || 0) + 1;
    });

    // Generate predictions based on analysis
    const predictions: PredictionResult[] = [];

    // Most active location prediction
    const topLocation = Object.entries(locationStats)
      .sort(([,a], [,b]) => b - a)[0];
    if (topLocation) {
      predictions.push({
        type: 'location',
        title: `High Activity Zone: ${topLocation[0]}`,
        description: `${topLocation[1]} sightings recorded. ${Math.round((topLocation[1] / filteredRecords.length) * 100)}% of all activity.`,
        confidence: Math.min(95, (topLocation[1] / filteredRecords.length) * 100 + 20),
        icon: MapPin
      });
    }

    // Best time prediction
    const topTime = Object.entries(timeStats)
      .sort(([,a], [,b]) => b - a)[0];
    if (topTime) {
      predictions.push({
        type: 'time',
        title: `Optimal Time: ${topTime[0]}`,
        description: `${topTime[1]} sightings during ${topTime[0].toLowerCase()}. Best success rate.`,
        confidence: Math.min(90, (topTime[1] / filteredRecords.length) * 100 + 15),
        icon: Clock
      });
    }

    // Species-specific prediction
    const topSpecies = Object.entries(speciesStats)
      .sort(([,a], [,b]) => b - a)[0];
    if (topSpecies) {
      predictions.push({
        type: 'species',
        title: `Most Common: ${topSpecies[0]}`,
        description: `${topSpecies[1]} sightings. Highest probability species in this area.`,
        confidence: Math.min(85, (topSpecies[1] / filteredRecords.length) * 100 + 10),
        icon: Target
      });
    }

    // Advanced predictions based on patterns

    // Location-species correlation
    const locationSpeciesMap: { [location: string]: { [species: string]: number } } = {};
    filteredRecords.forEach(record => {
      if (!locationSpeciesMap[record.location]) {
        locationSpeciesMap[record.location] = {};
      }
      locationSpeciesMap[record.location][record.species] =
        (locationSpeciesMap[record.location][record.species] || 0) + 1;
    });

    // Find best location for specific species
    if (selectedSpecies !== 'all') {
      const bestLocationForSpecies = Object.entries(locationSpeciesMap)
        .map(([location, speciesCount]) => ({
          location,
          count: speciesCount[selectedSpecies] || 0
        }))
        .sort((a, b) => b.count - a.count)[0];

      if (bestLocationForSpecies && bestLocationForSpecies.count > 0) {
        predictions.push({
          type: 'location',
          title: `Best ${selectedSpecies} Location: ${bestLocationForSpecies.location}`,
          description: `${bestLocationForSpecies.count} ${selectedSpecies} sightings here. Highest success rate for this species.`,
          confidence: Math.min(90, (bestLocationForSpecies.count / (speciesStats[selectedSpecies] || 1)) * 100),
          icon: Target
        });
      }
    }

    // Time-species correlation
    const timeSpeciesMap: { [time: string]: { [species: string]: number } } = {};
    filteredRecords.forEach(record => {
      if (!timeSpeciesMap[record.timeOfDay]) {
        timeSpeciesMap[record.timeOfDay] = {};
      }
      timeSpeciesMap[record.timeOfDay][record.species] =
        (timeSpeciesMap[record.timeOfDay][record.species] || 0) + 1;
    });

    // Recent activity prediction
    const recentRecords = filteredRecords
      .filter(record => {
        const recordDate = parseISO(record.date);
        const daysDiff = Math.abs(Date.now() - recordDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 30; // Last 30 days
      });

    if (recentRecords.length > 0) {
      const recentLocationStats: { [location: string]: number } = {};
      recentRecords.forEach(record => {
        recentLocationStats[record.location] = (recentLocationStats[record.location] || 0) + 1;
      });

      const topRecentLocation = Object.entries(recentLocationStats)
        .sort(([,a], [,b]) => b - a)[0];

      if (topRecentLocation) {
        predictions.push({
          type: 'location',
          title: `Recent Hotspot: ${topRecentLocation[0]}`,
          description: `${topRecentLocation[1]} sightings in the last 30 days. Current high activity area.`,
          confidence: Math.min(80, (topRecentLocation[1] / recentRecords.length) * 100 + 25),
          icon: TrendingUp
        });
      }
    }

    return {
      speciesStats,
      locationStats,
      timeStats,
      monthlyStats,
      predictions
    };
  }, [filteredRecords, selectedSpecies]); // Fixed ESLint exhaustive-deps warning

  const speciesOptions = [
    { value: 'all', label: 'All Species' },
    ...DEER_SPECIES.map(species => ({ value: species, label: species }))
  ];

  const monthOptions = [
    { value: 'all', label: 'All Months' },
    { value: '0', label: 'January' },
    { value: '1', label: 'February' },
    { value: '2', label: 'March' },
    { value: '3', label: 'April' },
    { value: '4', label: 'May' },
    { value: '5', label: 'June' },
    { value: '6', label: 'July' },
    { value: '7', label: 'August' },
    { value: '8', label: 'September' },
    { value: '9', label: 'October' },
    { value: '10', label: 'November' },
    { value: '11', label: 'December' },
  ];

  if (loading) {
    return (
      <PredictionsContainer>
        <Card>
          <CardContent>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              Loading analysis data...
            </div>
          </CardContent>
        </Card>
      </PredictionsContainer>
    );
  }

  return (
    <PredictionsContainer>
      <FiltersCard>
        <CardHeader>
          <CardTitle>
            <TrendingUp size={24} />
            Deer Activity Predictions & Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FiltersGrid>
            <Select
              label="Filter by Species"
              value={selectedSpecies}
              onChange={(e) => setSelectedSpecies(e.target.value)}
              options={speciesOptions}
            />
            <Select
              label="Filter by Month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              options={monthOptions}
            />
          </FiltersGrid>
        </CardContent>
      </FiltersCard>

      <AnalysisGrid>
        <StatCard>
          <CardHeader>
            <CardTitle>
              <BarChart3 size={20} />
              Total Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StatValue>{filteredRecords.length}</StatValue>
            <StatLabel>Sightings analyzed</StatLabel>
          </CardContent>
        </StatCard>

        <StatCard>
          <CardHeader>
            <CardTitle>
              <Target size={20} />
              Species Diversity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StatValue>{Object.keys(analysisData.speciesStats).length}</StatValue>
            <StatLabel>Different species</StatLabel>
          </CardContent>
        </StatCard>

        <StatCard>
          <CardHeader>
            <CardTitle>
              <MapPin size={20} />
              Active Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StatValue>{Object.keys(analysisData.locationStats).length}</StatValue>
            <StatLabel>Hunting grounds</StatLabel>
          </CardContent>
        </StatCard>
      </AnalysisGrid>

      {/* Predictions Section */}
      <Card>
        <CardHeader>
          <CardTitle>
            <TrendingUp size={24} />
            Predictive Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analysisData.predictions.map((prediction, index) => (
            <PredictionItem key={index}>
              <prediction.icon size={20} />
              <PredictionText>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  {prediction.title}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {prediction.description}
                </div>
              </PredictionText>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                  {Math.round(prediction.confidence)}% confidence
                </div>
                <ConfidenceBar $confidence={prediction.confidence} />
              </div>
            </PredictionItem>
          ))}
        </CardContent>
      </Card>

      {/* Location Hotspots */}
      <Card>
        <CardHeader>
          <CardTitle>
            <MapPin size={24} />
            Location Hotspots
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LocationList>
            {Object.entries(analysisData.locationStats)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 10)
              .map(([location, count]) => (
                <TimeSlot key={location}>
                  <span>{location}</span>
                  <span style={{ fontWeight: 'bold' }}>
                    {count} sightings ({Math.round((count / filteredRecords.length) * 100)}%)
                  </span>
                </TimeSlot>
              ))}
          </LocationList>
        </CardContent>
      </Card>

      {/* Time Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Clock size={24} />
            Optimal Timing
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.entries(analysisData.timeStats)
            .sort(([,a], [,b]) => b - a)
            .map(([time, count]) => (
              <TimeSlot key={time}>
                <span>{time}</span>
                <span style={{ fontWeight: 'bold' }}>
                  {count} sightings ({Math.round((count / filteredRecords.length) * 100)}%)
                </span>
              </TimeSlot>
            ))}
        </CardContent>
      </Card>

      {/* Species Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Target size={24} />
            Species Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.entries(analysisData.speciesStats)
            .sort(([,a], [,b]) => b - a)
            .map(([species, count]) => (
              <TimeSlot key={species}>
                <span>{species}</span>
                <span style={{ fontWeight: 'bold' }}>
                  {count} sightings ({Math.round((count / filteredRecords.length) * 100)}%)
                </span>
              </TimeSlot>
            ))}
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Calendar size={24} />
            Seasonal Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.entries(analysisData.monthlyStats)
            .sort(([,a], [,b]) => b - a)
            .map(([month, count]) => (
              <TimeSlot key={month}>
                <span>{month}</span>
                <span style={{ fontWeight: 'bold' }}>
                  {count} sightings ({Math.round((count / filteredRecords.length) * 100)}%)
                </span>
              </TimeSlot>
            ))}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>
            <TrendingUp size={24} />
            Today's Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PredictionItem>
            <MapPin size={20} />
            <PredictionText>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                Recommended Location
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                {Object.entries(analysisData.locationStats).sort(([,a], [,b]) => b - a)[0]?.[0] || 'No data'}
                {' - '}Most consistent activity based on historical data
              </div>
            </PredictionText>
          </PredictionItem>

          <PredictionItem>
            <Clock size={20} />
            <PredictionText>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                Optimal Time Window
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                {Object.entries(analysisData.timeStats).sort(([,a], [,b]) => b - a)[0]?.[0] || 'No data'}
                {' - '}Peak activity period for your target species
              </div>
            </PredictionText>
          </PredictionItem>

          <PredictionItem>
            <Target size={20} />
            <PredictionText>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                Target Species
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                {Object.entries(analysisData.speciesStats).sort(([,a], [,b]) => b - a)[0]?.[0] || 'No data'}
                {' - '}Most frequently encountered in current conditions
              </div>
            </PredictionText>
          </PredictionItem>
        </CardContent>
      </Card>
    </PredictionsContainer>
  );
};
