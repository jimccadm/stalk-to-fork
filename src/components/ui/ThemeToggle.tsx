import React from 'react';
import styled from 'styled-components';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const ToggleButton = styled.button<{ $isActive: boolean }>`
  position: relative;
  width: 3rem;
  height: 1.5rem;
  border-radius: ${props => props.theme.borderRadius.full};
  border: 1px solid ${props => props.theme.colors.border};
  background-color: ${props => props.$isActive ? props.theme.colors.primary : props.theme.colors.surfaceVariant};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  padding: 0;

  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }

  &:hover {
    opacity: 0.8;
  }
`;

const ToggleSlider = styled.div<{ $isActive: boolean }>`
  position: absolute;
  top: 1px;
  left: ${props => props.$isActive ? '1.375rem' : '1px'};
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  background-color: white;
  transition: left 0.2s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${props => props.theme.shadows.sm};
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 0.75rem;
  height: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const Label = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    display: none;
  }
`;

export const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <ToggleContainer>
      <Label>{isDark ? 'Dark' : 'Light'}</Label>
      <ToggleButton
        $isActive={isDark}
        onClick={toggleTheme}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        type="button"
      >
        <ToggleSlider $isActive={isDark}>
          <IconWrapper>
            {isDark ? <Moon size={12} /> : <Sun size={12} />}
          </IconWrapper>
        </ToggleSlider>
      </ToggleButton>
    </ToggleContainer>
  );
};
