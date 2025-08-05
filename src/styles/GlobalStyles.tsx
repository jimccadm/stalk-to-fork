import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: ${props => props.theme.typography.fontFamily};
    font-size: ${props => props.theme.typography.fontSize.md};
    line-height: ${props => props.theme.typography.lineHeight.normal};
    color: ${props => props.theme.colors.text};
    background-color: ${props => props.theme.colors.background};
    transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    line-height: ${props => props.theme.typography.lineHeight.tight};
    color: ${props => props.theme.colors.text};
  }

  h1 {
    font-size: ${props => props.theme.typography.fontSize.xxl};
    font-weight: ${props => props.theme.typography.fontWeight.bold};
  }

  h2 {
    font-size: ${props => props.theme.typography.fontSize.xl};
  }

  h3 {
    font-size: ${props => props.theme.typography.fontSize.lg};
  }

  p {
    margin: 0;
    line-height: ${props => props.theme.typography.lineHeight.normal};
  }

  a {
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
    transition: color 0.2s ease-in-out;

    &:hover {
      color: ${props => props.theme.colors.primaryDark};
      text-decoration: underline;
    }
  }

  button {
    font-family: inherit;
  }

  input, select, textarea {
    font-family: inherit;
  }

  /* Focus styles for accessibility */
  *:focus-visible {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }

  /* Scrollbar styles */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.surface};
  }

  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border};
    border-radius: ${props => props.theme.borderRadius.full};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.colors.textSecondary};
  }

  /* Mobile-first responsive utilities */
  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 ${props => props.theme.spacing.md};

    @media (min-width: ${props => props.theme.breakpoints.sm}) {
      padding: 0 ${props => props.theme.spacing.lg};
    }

    @media (min-width: ${props => props.theme.breakpoints.lg}) {
      padding: 0 ${props => props.theme.spacing.xl};
    }
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Loading animation */
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  /* Fade in animation */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in {
    animation: fadeIn 0.3s ease-out;
  }
`;
