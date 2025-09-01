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
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
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

export type Theme = {
    name: string;
    colors: ColorPalette;
    typography: TypographyScale;
    spacing: SpacingScale;
    borders: BorderScale;
};
