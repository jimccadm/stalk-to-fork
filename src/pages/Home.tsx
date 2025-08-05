import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Plus, History, Map, Target, TrendingUp, MapPin, Calendar } from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { DeerStalkingRecord } from '../types';
import { getDatabase } from '../database/database';
import { seedDatabase } from '../database/seedData';

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xl};
`;

const HeroSection = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl} 0;
`;

const HeroTitle = styled.h1`
  font-size: ${props => props.theme.typography.fontSize.xxl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.md};
  
  @media (min-width: ${props => props.theme.breakpoints.md}) {
    font-size: 3rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: ${props => props.theme.typography.fontSize.lg};
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: ${props => props.theme.spacing.xl};
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const QuickActions = styled.div`
  display: grid;
  gap: ${props => props.theme.spacing.lg};
  grid-template-columns: 1fr;
  
  @media (min-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const ActionCard = styled(Card)`
  text-align: center;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const ActionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.primary};
  color: white;
  margin: 0 auto ${props => props.theme.spacing.md} auto;
`;

const ActionTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const ActionDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const StatsSection = styled.div`
  display: grid;
  gap: ${props => props.theme.spacing.lg};
  grid-template-columns: 1fr;
  
  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: repeat(4, 1fr);
  }
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.xs};
`;

const RecentActivity = styled.div`
  display: grid;
  gap: ${props => props.theme.spacing.lg};
  
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 2fr 1fr;
  }
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.surfaceVariant};
  border-radius: ${props => props.theme.borderRadius.md};
`;

const ActivityIcon = styled.div<{ species: string }>`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: ${props => {
    const colors: { [key: string]: string } = {
      'Fallow Deer': '#10b981',
      'Muntjac': '#f59e0b',
      'Roe Deer': '#3b82f6',
      'Red Deer': '#ef4444',
      'Fox': '#8b5cf6',
    };
    return colors[props.species] || '#6b7280';
  }};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const ActivityDetails = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const ActivityMeta = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

export const Home: React.FC = () => {
  const [stats, setStats] = useState({
    totalRecords: 0,
    speciesCount: 0,
    locationCount: 0,
    totalWeight: 0,
  });
  const [recentRecords, setRecentRecords] = useState<DeerStalkingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const db = getDatabase();
        let records = db.getAllRecords();
        
        // If no records exist, seed the database
        if (records.length === 0) {
          console.log('No records found, seeding database...');
          const insertedCount = seedDatabase();
          console.log(`Inserted ${insertedCount} records`);
          records = db.getAllRecords();
        }
        
        // Calculate stats
        const speciesSet = new Set(records.map(r => r.species));
        const locationSet = new Set(records.map(r => r.location));
        const totalWeight = records.reduce((sum, r) => sum + (r.weight || 0), 0);
        
        setStats({
          totalRecords: records.length,
          speciesCount: speciesSet.size,
          locationCount: locationSet.size,
          totalWeight: Math.round(totalWeight * 10) / 10,
        });
        
        // Get recent records (last 5)
        setRecentRecords(records.slice(0, 5));
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const quickActions = [
    {
      icon: Plus,
      title: 'New Entry',
      description: 'Record a new deer stalking entry with all the details',
      link: '/entry',
      color: '#10b981',
    },
    {
      icon: History,
      title: 'View History',
      description: 'Browse and search through all your historic entries',
      link: '/history',
      color: '#3b82f6',
    },
    {
      icon: Map,
      title: 'Activity Map',
      description: 'Visualize your stalking activity on an interactive map',
      link: '/map',
      color: '#f59e0b',
    },
  ];

  return (
    <HomeContainer>
      <HeroSection>
        <HeroTitle>
          <Target size={48} style={{ marginRight: '1rem', color: '#10b981' }} />
          Stalk to Fork
        </HeroTitle>
        <HeroSubtitle>
          Your comprehensive deer stalking record management system. 
          Track, analyze, and visualize your hunting activities across Herefordshire and beyond.
        </HeroSubtitle>
      </HeroSection>

      <QuickActions>
        {quickActions.map((action) => (
          <Link key={action.link} to={action.link} style={{ textDecoration: 'none' }}>
            <ActionCard hover>
              <CardContent>
                <ActionIcon style={{ backgroundColor: action.color }}>
                  <action.icon size={24} />
                </ActionIcon>
                <ActionTitle>{action.title}</ActionTitle>
                <ActionDescription>{action.description}</ActionDescription>
                <Button variant="outline" fullWidth>
                  Get Started
                </Button>
              </CardContent>
            </ActionCard>
          </Link>
        ))}
      </QuickActions>

      {!loading && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>
                <TrendingUp size={20} style={{ marginRight: '0.5rem' }} />
                Activity Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StatsSection>
                <StatCard>
                  <CardContent>
                    <StatValue>{stats.totalRecords}</StatValue>
                    <StatLabel>
                      <Target size={16} />
                      Total Records
                    </StatLabel>
                  </CardContent>
                </StatCard>
                <StatCard>
                  <CardContent>
                    <StatValue>{stats.speciesCount}</StatValue>
                    <StatLabel>
                      <Target size={16} />
                      Species Tracked
                    </StatLabel>
                  </CardContent>
                </StatCard>
                <StatCard>
                  <CardContent>
                    <StatValue>{stats.locationCount}</StatValue>
                    <StatLabel>
                      <MapPin size={16} />
                      Locations
                    </StatLabel>
                  </CardContent>
                </StatCard>
                <StatCard>
                  <CardContent>
                    <StatValue>{stats.totalWeight}kg</StatValue>
                    <StatLabel>
                      <TrendingUp size={16} />
                      Total Weight
                    </StatLabel>
                  </CardContent>
                </StatCard>
              </StatsSection>
            </CardContent>
          </Card>

          <RecentActivity>
            <Card>
              <CardHeader>
                <CardTitle>
                  <Calendar size={20} style={{ marginRight: '0.5rem' }} />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityList>
                  {recentRecords.map((record) => (
                    <ActivityItem key={record.id}>
                      <ActivityIcon species={record.species}>
                        {record.species.charAt(0)}
                      </ActivityIcon>
                      <ActivityDetails>
                        <ActivityTitle>
                          {record.species} - {record.sex} {record.maturity}
                        </ActivityTitle>
                        <ActivityMeta>
                          {record.location} • {record.date} • {record.weight}kg
                        </ActivityMeta>
                      </ActivityDetails>
                    </ActivityItem>
                  ))}
                </ActivityList>
                <div style={{ marginTop: '1rem' }}>
                  <Link to="/history">
                    <Button variant="outline" fullWidth>
                      View All Records
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </RecentActivity>
        </>
      )}
    </HomeContainer>
  );
};
