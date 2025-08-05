export interface ThemeColors {
  primary: string;
  primaryDark: string;
  secondary: string;
  background: string;
  surface: string;
  surfaceVariant: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface Theme {
  colors: ThemeColors;
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

const commonTheme = {
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      xxl: '1.5rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
};

export const darkTheme: Theme = {
  ...commonTheme,
  colors: {
    primary: '#10b981', // Emerald green for hunting theme
    primaryDark: '#059669',
    secondary: '#f59e0b', // Amber for accents
    background: '#0f172a', // Dark slate
    surface: '#1e293b',
    surfaceVariant: '#334155',
    text: '#f8fafc',
    textSecondary: '#cbd5e1',
    border: '#475569',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
};

export const lightTheme: Theme = {
  ...commonTheme,
  colors: {
    primary: '#059669', // Darker emerald for light mode
    primaryDark: '#047857',
    secondary: '#d97706', // Darker amber
    background: '#ffffff',
    surface: '#f8fafc',
    surfaceVariant: '#e2e8f0',
    text: '#0f172a',
    textSecondary: '#475569',
    border: '#cbd5e1',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
};

// Media query helpers
export const mediaQueries = {
  sm: `@media (min-width: ${commonTheme.breakpoints.sm})`,
  md: `@media (min-width: ${commonTheme.breakpoints.md})`,
  lg: `@media (min-width: ${commonTheme.breakpoints.lg})`,
  xl: `@media (min-width: ${commonTheme.breakpoints.xl})`,
};
