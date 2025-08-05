import styled, { css } from 'styled-components';

interface CardProps {
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const getPaddingStyles = (padding: string, theme: any) => {
  switch (padding) {
    case 'sm':
      return css`padding: ${theme.spacing.md};`;
    case 'lg':
      return css`padding: ${theme.spacing.xl};`;
    default: // md
      return css`padding: ${theme.spacing.lg};`;
  }
};

const getShadowStyles = (shadow: string, theme: any) => {
  switch (shadow) {
    case 'sm':
      return css`box-shadow: ${theme.shadows.sm};`;
    case 'lg':
      return css`box-shadow: ${theme.shadows.lg};`;
    default: // md
      return css`box-shadow: ${theme.shadows.md};`;
  }
};

export const Card = styled.div<CardProps>`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.colors.border};
  transition: all 0.2s ease-in-out;
  
  ${props => getPaddingStyles(props.padding || 'md', props.theme)}
  ${props => getShadowStyles(props.shadow || 'sm', props.theme)}
  
  ${props => props.hover && css`
    cursor: pointer;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: ${props.theme.shadows.lg};
    }
  `}
`;

export const CardHeader = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const CardTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => props.theme.spacing.xs} 0;
  line-height: ${props => props.theme.typography.lineHeight.tight};
`;

export const CardDescription = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
  line-height: ${props => props.theme.typography.lineHeight.normal};
`;

export const CardContent = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
  padding-top: ${props => props.theme.spacing.lg};
  border-top: 1px solid ${props => props.theme.colors.border};
`;
