import React from 'react';
import styled from 'styled-components';
import { Navigation } from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${props => props.theme.colors.background};
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ContentContainer = styled.div`
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: ${props => props.theme.spacing.lg} ${props => props.theme.spacing.md};
  
  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    padding: ${props => props.theme.spacing.xl} ${props => props.theme.spacing.lg};
  }
  
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    padding: ${props => props.theme.spacing.xl};
  }
`;

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <LayoutContainer>
      <Navigation />
      <MainContent>
        <ContentContainer>
          {children}
        </ContentContainer>
      </MainContent>
    </LayoutContainer>
  );
};
