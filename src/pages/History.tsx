import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { DeerStalkingRecord, DEER_SPECIES } from '../types';
import { getDatabase } from '../database/database';
import { seedDatabase, importFromCSVFile } from '../database/seedData';

const HistoryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const FiltersContainer = styled.div`
  display: grid;
  gap: ${props => props.theme.spacing.md};
  grid-template-columns: 1fr;
  
  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: 2fr 1fr 1fr;
  }
  
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 3fr 1fr 1fr 1fr;
  }
`;

const RecordsContainer = styled.div`
  display: grid;
  gap: ${props => props.theme.spacing.md};
  
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  }
`;

const RecordCard = styled(Card)`
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const RecordHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.md};
`;

const RecordTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const RecordDate = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const RecordDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const DetailLabel = styled.span`
  font-size: ${props => props.theme.typography.fontSize.xs};
  color: ${props => props.theme.colors.textSecondary};
  text-transform: uppercase;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const DetailValue = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const RecordActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  justify-content: flex-end;
  padding-top: ${props => props.theme.spacing.md};
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const ActionButton = styled(Button)`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  min-height: auto;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
`;

const PaginationInfo = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xxl};
  color: ${props => props.theme.colors.textSecondary};
`;

const ITEMS_PER_PAGE = 6;

export const History: React.FC = () => {
  const [records, setRecords] = useState<DeerStalkingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [importing, setImporting] = useState(false);

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

  // Function to import CSV data
  const handleCSVImport = async () => {
    setImporting(true);
    try {
      const result = await importFromCSVFile();
      console.log('CSV import completed:', result);

      if (result.imported > 0) {
        // Reload records after import
        const db = getDatabase();
        const dbRecords = db.getAllRecords();
        setRecords(dbRecords);

        alert(`Successfully imported ${result.imported} new records! (${result.skipped} duplicates skipped)`);
      } else {
        alert(`No new records imported. ${result.skipped} duplicates found.`);
      }
    } catch (error) {
      console.error('Error importing CSV:', error);
      alert('Error importing CSV data. Please check the console for details.');
    } finally {
      setImporting(false);
    }
  };

  // Filter and search records
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchesSearch = !searchTerm ||
        record.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.shooter.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.remarks?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSpecies = !speciesFilter || record.species === speciesFilter;
      const matchesLocation = !locationFilter || record.location.toLowerCase().includes(locationFilter.toLowerCase());

      return matchesSearch && matchesSpecies && matchesLocation;
    });
  }, [records, searchTerm, speciesFilter, locationFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleView = (record: DeerStalkingRecord) => {
    console.log('View record:', record);
    // TODO: Implement view modal or navigate to detail page
  };

  const handleEdit = (record: DeerStalkingRecord) => {
    console.log('Edit record:', record);
    // TODO: Implement edit functionality
  };

  const handleDelete = (record: DeerStalkingRecord) => {
    console.log('Delete record:', record);
    // TODO: Implement delete functionality with confirmation
  };

  const speciesOptions = [
    { value: '', label: 'All Species' },
    ...DEER_SPECIES.map(species => ({ value: species, label: species }))
  ];

  return (
    <HistoryContainer>
      <Card>
        <CardHeader>
          <CardTitle>Historic Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <FiltersContainer>
            <Input
              placeholder="Search by species, location, shooter, or remarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
            />
            <Select
              options={speciesOptions}
              value={speciesFilter}
              onChange={(e) => setSpeciesFilter(e.target.value)}
              fullWidth
            />
            <Input
              placeholder="Filter by location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              fullWidth
            />
          </FiltersContainer>

          {/* CSV Import Button */}
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <Button
              onClick={handleCSVImport}
              disabled={importing}
              variant="secondary"
            >
              {importing ? 'Importing...' : 'Import CSV Data (2stalk.csv)'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <EmptyState>
          <p>Loading records...</p>
        </EmptyState>
      ) : paginatedRecords.length === 0 ? (
        <EmptyState>
          <p>No records found matching your criteria.</p>
        </EmptyState>
      ) : (
        <>
          <RecordsContainer>
            {paginatedRecords.map((record) => (
              <RecordCard key={record.id} onClick={() => handleView(record)}>
                <RecordHeader>
                  <div>
                    <RecordTitle>{record.species}</RecordTitle>
                    <RecordDate>{format(new Date(record.date), 'dd MMM yyyy')}</RecordDate>
                  </div>
                </RecordHeader>

                <RecordDetails>
                  <DetailItem>
                    <DetailLabel>Sex</DetailLabel>
                    <DetailValue>{record.sex}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Weight</DetailLabel>
                    <DetailValue>{record.weight}kg</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Location</DetailLabel>
                    <DetailValue>{record.location}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Shooter</DetailLabel>
                    <DetailValue>{record.shooter}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Time</DetailLabel>
                    <DetailValue>{record.timeOfDay}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Grid Ref</DetailLabel>
                    <DetailValue>{record.gridRef}</DetailValue>
                  </DetailItem>
                </RecordDetails>

                {record.remarks && (
                  <DetailItem style={{ marginBottom: '1rem' }}>
                    <DetailLabel>Remarks</DetailLabel>
                    <DetailValue>{record.remarks}</DetailValue>
                  </DetailItem>
                )}

                <RecordActions onClick={(e) => e.stopPropagation()}>
                  <ActionButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleView(record)}
                  >
                    <Eye size={16} />
                  </ActionButton>
                  <ActionButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(record)}
                  >
                    <Edit size={16} />
                  </ActionButton>
                  <ActionButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(record)}
                  >
                    <Trash2 size={16} />
                  </ActionButton>
                </RecordActions>
              </RecordCard>
            ))}
          </RecordsContainer>

          {totalPages > 1 && (
            <PaginationContainer>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <ChevronLeft size={16} />
                Previous
              </Button>
              
              <PaginationInfo>
                Page {currentPage} of {totalPages} ({filteredRecords.length} records)
              </PaginationInfo>
              
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
                <ChevronRight size={16} />
              </Button>
            </PaginationContainer>
          )}
        </>
      )}
    </HistoryContainer>
  );
};
