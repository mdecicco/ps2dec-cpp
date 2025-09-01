import { Theme } from '@app/types';

// Base tokens that are shared between themes
const baseTokens = {
    typography: {
        size: {
            xs: '0.8rem',
            sm: '1.0rem',
            md: '1.1rem',
            lg: '1.4rem',
            xl: '2.0rem'
        }
    },
    spacing: {
        xs: '0.12rem',
        sm: '0.24rem',
        md: '0.48rem',
        lg: '0.96rem',
        xl: '1.92rem'
    },
    borders: {
        width: {
            xs: '1px',
            sm: '2px',
            md: '4px',
            lg: '8px',
            xl: '12px'
        },
        radius: {
            xs: '0.12rem',
            sm: '0.24rem',
            md: '0.48rem',
            lg: '0.96rem',
            xl: '1.92rem'
        }
    }
};

export const darkTheme: Theme = {
    name: 'Dark',
    ...baseTokens,
    colors: {
        // Primary colors
        primary: 'rgb(127, 138, 158)',
        secondary: 'rgb(50, 74, 95)',
        accent: 'rgba(204, 201, 220)',

        // Neutral colors
        background: 'rgba(12, 24, 33, 1)',
        surface: 'rgba(20, 33, 49, 1)',
        text: 'rgba(255, 255, 255, 1)',
        textSecondary: 'rgb(197, 197, 197)',
        border: 'rgba(127, 138, 158, 1)',

        // State colors
        success: 'rgb(90, 187, 106)',
        warning: 'rgb(168, 185, 90)',
        error: 'rgb(189, 90, 90)',
        info: 'rgb(96, 187, 194)'
    }
};

export const availableThemes = [darkTheme];
export const defaultTheme = darkTheme;
