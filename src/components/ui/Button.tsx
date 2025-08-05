import React from 'react';
import styled, { css } from 'styled-components';
import { Theme } from '../../styles/theme';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const getVariantStyles = (variant: string, theme: Theme) => {
  switch (variant) {
    case 'primary':
      return css`
        background-color: ${theme.colors.primary};
        color: white;
        border: 1px solid ${theme.colors.primary};
        
        &:hover:not(:disabled) {
          background-color: ${theme.colors.primaryDark};
          border-color: ${theme.colors.primaryDark};
        }
      `;
    case 'secondary':
      return css`
        background-color: ${theme.colors.secondary};
        color: white;
        border: 1px solid ${theme.colors.secondary};
        
        &:hover:not(:disabled) {
          opacity: 0.9;
        }
      `;
    case 'outline':
      return css`
        background-color: transparent;
        color: ${theme.colors.primary};
        border: 1px solid ${theme.colors.primary};
        
        &:hover:not(:disabled) {
          background-color: ${theme.colors.primary};
          color: white;
        }
      `;
    case 'ghost':
      return css`
        background-color: transparent;
        color: ${theme.colors.text};
        border: 1px solid transparent;
        
        &:hover:not(:disabled) {
          background-color: ${theme.colors.surfaceVariant};
        }
      `;
    default:
      return css``;
  }
};

const getSizeStyles = (size: string, theme: Theme) => {
  switch (size) {
    case 'sm':
      return css`
        padding: ${theme.spacing.sm} ${theme.spacing.md};
        font-size: ${theme.typography.fontSize.sm};
        min-height: 2rem;
      `;
    case 'lg':
      return css`
        padding: ${theme.spacing.md} ${theme.spacing.xl};
        font-size: ${theme.typography.fontSize.lg};
        min-height: 3rem;
      `;
    default: // md
      return css`
        padding: ${theme.spacing.sm} ${theme.spacing.lg};
        font-size: ${theme.typography.fontSize.md};
        min-height: 2.5rem;
      `;
  }
};

const StyledButton = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  font-family: ${props => props.theme.typography.fontFamily};
  line-height: ${props => props.theme.typography.lineHeight.normal};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-decoration: none;
  white-space: nowrap;
  
  ${props => getVariantStyles(props.variant || 'primary', props.theme)}
  ${props => getSizeStyles(props.size || 'md', props.theme)}
  
  ${props => props.fullWidth && css`
    width: 100%;
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }
  
  ${props => props.loading && css`
    cursor: wait;
    opacity: 0.7;
  `}
`;

const LoadingSpinner = styled.div`
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const Button: React.FC<ButtonProps> = ({
  children,
  loading,
  disabled,
  ...props
}) => {
  return (
    <StyledButton {...props} disabled={disabled || loading}>
      {loading && <LoadingSpinner />}
      {children}
    </StyledButton>
  );
};
