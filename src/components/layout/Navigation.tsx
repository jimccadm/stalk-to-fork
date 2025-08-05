import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { Menu, X, Plus, History, Map, Target, TrendingUp } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';

const NavContainer = styled.nav`
  background-color: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: ${props => props.theme.shadows.sm};
`;

const NavContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4rem;
  
  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    padding: 0 ${props => props.theme.spacing.lg};
  }
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text};
  text-decoration: none;
  
  &:hover {
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
  }
`;

const LogoIcon = styled(Target)`
  color: ${props => props.theme.colors.primary};
`;

const DesktopNav = styled.div`
  display: none;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};
  
  @media (min-width: ${props => props.theme.breakpoints.md}) {
    display: flex;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const NavLink = styled(Link)<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.textSecondary};
  text-decoration: none;
  transition: all 0.2s ease-in-out;
  
  ${props => props.$isActive && css`
    background-color: ${props.theme.colors.primary};
    color: white;
  `}

  &:hover {
    background-color: ${props => props.$isActive ? props.theme.colors.primaryDark : props.theme.colors.surfaceVariant};
    color: ${props => props.$isActive ? 'white' : props.theme.colors.text};
    text-decoration: none;
  }
`;

const MobileMenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  background: none;
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  border-radius: ${props => props.theme.borderRadius.md};
  transition: background-color 0.2s ease-in-out;
  
  &:hover {
    background-color: ${props => props.theme.colors.surfaceVariant};
  }
  
  @media (min-width: ${props => props.theme.breakpoints.md}) {
    display: none;
  }
`;

const MobileMenu = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 4rem;
  left: 0;
  right: 0;
  background-color: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  box-shadow: ${props => props.theme.shadows.lg};
  transform: translateY(${props => props.$isOpen ? '0' : '-100%'});
  opacity: ${props => props.$isOpen ? '1' : '0'};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease-in-out;
  z-index: 99;
  
  @media (min-width: ${props => props.theme.breakpoints.md}) {
    display: none;
  }
`;

const MobileNavLinks = styled.div`
  padding: ${props => props.theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const MobileNavLink = styled(Link)<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.textSecondary};
  text-decoration: none;
  transition: all 0.2s ease-in-out;
  
  ${props => props.$isActive && css`
    background-color: ${props.theme.colors.primary};
    color: white;
  `}

  &:hover {
    background-color: ${props => props.$isActive ? props.theme.colors.primaryDark : props.theme.colors.surfaceVariant};
    color: ${props => props.$isActive ? 'white' : props.theme.colors.text};
    text-decoration: none;
  }
`;

const ThemeToggleContainer = styled.div`
  display: flex;
  align-items: center;
`;

const navItems = [
  { path: '/entry', label: 'New Entry', icon: Plus },
  { path: '/history', label: 'History', icon: History },
  { path: '/map', label: 'Map', icon: Map },
  { path: '/predictions', label: 'Predictions', icon: TrendingUp },
];

export const Navigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <NavContainer>
        <NavContent>
          <Logo to="/" onClick={closeMobileMenu}>
            <LogoIcon size={24} />
            Stalk to Fork
          </Logo>

          <DesktopNav>
            <NavLinks>
              {navItems.map(({ path, label, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  $isActive={location.pathname === path}
                >
                  <Icon size={16} />
                  {label}
                </NavLink>
              ))}
            </NavLinks>
            <ThemeToggleContainer>
              <ThemeToggle />
            </ThemeToggleContainer>
          </DesktopNav>

          <MobileMenuButton onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </MobileMenuButton>
        </NavContent>
      </NavContainer>

      <MobileMenu $isOpen={isMobileMenuOpen}>
        <MobileNavLinks>
          {navItems.map(({ path, label, icon: Icon }) => (
            <MobileNavLink
              key={path}
              to={path}
              $isActive={location.pathname === path}
              onClick={closeMobileMenu}
            >
              <Icon size={20} />
              {label}
            </MobileNavLink>
          ))}
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid var(--border)` }}>
            <ThemeToggle />
          </div>
        </MobileNavLinks>
      </MobileMenu>
    </>
  );
};
