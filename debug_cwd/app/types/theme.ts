export type ColorPalette = {
    primary: string;
    secondary: string;
    accent: string;

    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;

    success: string;
    warning: string;
    error: string;
    info: string;
};

export type TypographyScale = {
    size: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
    };
};

export type SpacingScale = {
    xxs: string;
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
};

export type BorderScale = {
    width: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
    };
    radius: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
    };
};

export type DurationScale = {
    short: number;
    medium: number;
    long: number;
};

export type HighlightOpacityScale = {
    hover: number;
    pressed: number;
};

export type Theme = {
    name: string;
    colors: ColorPalette;
    typography: TypographyScale;
    spacing: SpacingScale;
    borders: BorderScale;
    durations: DurationScale;
    highlights: HighlightOpacityScale;
};
