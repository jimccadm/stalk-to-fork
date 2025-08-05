import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  variant?: 'default' | 'filled';
  options: SelectOption[];
  placeholder?: string;
}

const SelectContainer = styled.div<{ $fullWidth?: boolean }>`
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

const SelectWrapper = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
`;

const StyledSelect = styled.select<{ $hasError?: boolean; $variant?: string }>`
  width: 100%;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  padding-right: 2.5rem;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  font-family: ${props => props.theme.typography.fontFamily};
  line-height: ${props => props.theme.typography.lineHeight.normal};
  transition: all 0.2s ease-in-out;
  min-height: 2.5rem;
  appearance: none;
  cursor: pointer;
  
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
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: ${props => props.theme.colors.surfaceVariant};
  }
  
  option {
    background-color: ${props => props.theme.colors.surface};
    color: ${props => props.theme.colors.text};
  }
`;

const ChevronIcon = styled(ChevronDown)`
  position: absolute;
  right: ${props => props.theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: ${props => props.theme.colors.textSecondary};
  pointer-events: none;
`;

const ErrorText = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.error};
  line-height: ${props => props.theme.typography.lineHeight.tight};
`;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, fullWidth, variant = 'default', options, placeholder, className, ...props }, ref) => {
    return (
      <SelectContainer $fullWidth={fullWidth} className={className}>
        {label && <Label>{label}</Label>}
        <SelectWrapper>
          <StyledSelect
            ref={ref}
            $hasError={!!error}
            $variant={variant}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </StyledSelect>
          <ChevronIcon />
        </SelectWrapper>
        {error && <ErrorText>{error}</ErrorText>}
      </SelectContainer>
    );
  }
);

Select.displayName = 'Select';
