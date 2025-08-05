import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  variant?: 'default' | 'filled';
}

const InputContainer = styled.div<{ $fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};

  ${props => props.$fullWidth && css`
    width: 100%;
  `}
`;

const Label = styled.label`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text};
  line-height: ${props => props.theme.typography.lineHeight.tight};
`;

const StyledInput = styled.input<{ $hasError?: boolean; $variant?: string }>`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  font-family: ${props => props.theme.typography.fontFamily};
  line-height: ${props => props.theme.typography.lineHeight.normal};
  transition: all 0.2s ease-in-out;
  min-height: 2.5rem;
  
  ${props => props.$variant === 'filled' ? css`
    background-color: ${props.theme.colors.surfaceVariant};
    border: 1px solid transparent;
    color: ${props.theme.colors.text};

    &:focus {
      background-color: ${props.theme.colors.surface};
      border-color: ${props.theme.colors.primary};
      outline: none;
      box-shadow: 0 0 0 2px ${props.theme.colors.primary}20;
    }
  ` : css`
    background-color: ${props.theme.colors.surface};
    border: 1px solid ${props.theme.colors.border};
    color: ${props.theme.colors.text};

    &:focus {
      border-color: ${props.theme.colors.primary};
      outline: none;
      box-shadow: 0 0 0 2px ${props.theme.colors.primary}20;
    }
  `}

  ${props => props.$hasError && css`
    border-color: ${props.theme.colors.error};

    &:focus {
      border-color: ${props.theme.colors.error};
      box-shadow: 0 0 0 2px ${props.theme.colors.error}20;
    }
  `}
  
  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: ${props => props.theme.colors.surfaceVariant};
  }
`;

const ErrorText = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.error};
  line-height: ${props => props.theme.typography.lineHeight.tight};
`;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth, variant = 'default', className, ...props }, ref) => {
    return (
      <InputContainer $fullWidth={fullWidth} className={className}>
        {label && <Label>{label}</Label>}
        <StyledInput
          ref={ref}
          $hasError={!!error}
          $variant={variant}
          {...props}
        />
        {error && <ErrorText>{error}</ErrorText>}
      </InputContainer>
    );
  }
);

Input.displayName = 'Input';
