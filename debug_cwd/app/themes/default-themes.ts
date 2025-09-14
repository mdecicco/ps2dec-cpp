import { Theme } from '@app/types';

// Base tokens that are shared between themes
const baseTokens = {
    typography: {
        size: {
            xs: '0.6rem',
            sm: '0.8rem',
            md: '1.0rem',
            lg: '1.2rem',
            xl: '1.4rem'
        }
    },
    spacing: {
        xxs: '0.06rem',
        xs: '0.12rem',
        sm: '0.24rem',
        md: '0.48rem',
        lg: '0.96rem',
        xl: '1.92rem',
        xxl: '3.84rem'
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
        primary: 'rgb(158, 138, 127)',
        secondary: 'rgb(95, 70, 50)',
        accent: 'rgb(202, 115, 34)',

        background: 'rgb(49, 49, 54)',
        surface: 'rgb(53, 60, 73)',
        text: 'rgb(214, 214, 214)',
        textSecondary: 'rgb(145, 145, 145)',
        border: 'rgba(255, 255, 255, 0.63)',

        // State colors
        success: 'rgb(90, 187, 106)',
        warning: 'rgb(168, 185, 90)',
        error: 'rgb(189, 90, 90)',
        info: 'rgb(96, 187, 194)',

        darkest: 'rgba(0, 0, 0, 0.5)',
        darker: 'rgba(0, 0, 0, 0.3)',
        dark: 'rgba(0, 0, 0, 0.1)',
        light: 'rgba(255, 255, 255, 0.1)',
        lighter: 'rgba(255, 255, 255, 0.3)',
        lightest: 'rgba(255, 255, 255, 0.5)'
    },
    durations: {
        short: 125,
        medium: 250,
        long: 500
    },
    highlights: {
        hover: 0.25,
        pressed: 0.45
    }
};

export const availableThemes = [darkTheme];
export const defaultTheme = darkTheme;
