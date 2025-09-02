import * as React from 'mini-react';
import { Box, StyleProps } from 'ui';
import { useCurrentWindow } from 'components';

import { BoxProps, MouseEvent } from 'ui/types';
import { EasingMode, useInterpolatedColor, useInterpolatedSize } from 'hooks';
import { useTheme } from '@app/contexts';
import { Theme } from '@app/types';

type ButtonProps = BoxProps & {
    variant?: 'primary' | 'outline' | 'transparent';
    size?: 'sm' | 'md' | 'lg';
};

function getButtonTheme(theme: Theme, variant: ButtonProps['variant']) {
    return {
        primary: {
            bgDefault: theme.colors.secondary,
            bgPressed: theme.colors.primary,
            bgHovered: theme.colors.secondary,
            borderDefault: theme.colors.accent,
            borderPressed: theme.colors.primary,
            borderHovered: theme.colors.primary,
            colorDefault: theme.colors.text,
            colorPressed: 'rgb(39, 39, 39)',
            colorHovered: theme.colors.text
        },
        outline: {
            bgDefault: 'rgba(0,0,0,0)',
            bgPressed: 'rgba(0,0,0,0)',
            bgHovered: 'rgba(0,0,0,0)',
            borderDefault: theme.colors.accent,
            borderPressed: theme.colors.primary,
            borderHovered: theme.colors.primary,
            colorDefault: theme.colors.text,
            colorPressed: theme.colors.text,
            colorHovered: theme.colors.text
        },
        transparent: {
            bgDefault: 'rgba(0,0,0,0)',
            bgPressed: 'rgba(255, 255, 255, 0.32)',
            bgHovered: 'rgba(255, 255, 255, 0.18)',
            borderDefault: 'rgba(0,0,0,0)',
            borderPressed: 'rgba(0,0,0,0)',
            borderHovered: 'rgba(0,0,0,0)',
            colorDefault: theme.colors.text,
            colorPressed: theme.colors.text,
            colorHovered: theme.colors.text
        }
    }[variant ?? 'primary'];
}

export const Button: React.FC<ButtonProps> = props => {
    const { window } = useCurrentWindow();
    const theme = useTheme();
    const buttonTheme = React.useMemo(() => getButtonTheme(theme, props.variant), [theme, props.variant]);
    const [isHovered, setIsHovered] = React.useState(false);
    const [isPressed, setIsPressed] = React.useState(false);

    const { style, onMouseDown, onMouseUp, onMouseEnter, onMouseLeave, children, ...rest } = props;

    const [backgroundColor] = useInterpolatedColor(
        isPressed ? buttonTheme.bgPressed : isHovered ? buttonTheme.bgHovered : buttonTheme.bgDefault,
        250,
        EasingMode.EaseInOut
    );

    const [borderColor] = useInterpolatedColor(
        isPressed ? buttonTheme.borderPressed : isHovered ? buttonTheme.borderHovered : buttonTheme.borderDefault,
        250,
        EasingMode.EaseInOut
    );

    const [color] = useInterpolatedColor(
        isPressed ? buttonTheme.colorPressed : isHovered ? buttonTheme.colorHovered : buttonTheme.colorDefault,
        250,
        EasingMode.EaseInOut
    );

    let pv = theme.spacing.sm;
    let ph = theme.spacing.md;
    let fontSize = theme.typography.size.sm;

    if (props.size) {
        switch (props.size) {
            case 'sm':
                pv = theme.spacing.xs;
                ph = theme.spacing.sm;
                fontSize = theme.typography.size.sm;
                break;
            case 'md':
                pv = theme.spacing.sm;
                ph = theme.spacing.md;
                fontSize = theme.typography.size.md;
                break;
            case 'lg':
                pv = theme.spacing.lg;
                ph = theme.spacing.xl;
                fontSize = theme.typography.size.lg;
                break;
        }
    }

    const [paddingVertical] = useInterpolatedSize(pv, 250, EasingMode.EaseInOut);
    const [paddingHorizontal] = useInterpolatedSize(ph, 250, EasingMode.EaseInOut);

    const ownStyle: StyleProps = {
        backgroundColor,
        color,
        border: `${theme.borders.width.sm} solid ${borderColor}`,
        paddingTop: paddingVertical,
        paddingBottom: paddingVertical,
        paddingLeft: paddingHorizontal,
        paddingRight: paddingHorizontal,
        borderRadius: theme.borders.radius.sm,
        ...style
    };

    const ownMouseDown = (e: MouseEvent) => {
        setIsPressed(true);
        onMouseDown?.(e);
    };

    const ownMouseUp = (e: MouseEvent) => {
        setIsPressed(false);
        onMouseUp?.(e);
    };

    const ownMouseEnter = (e: MouseEvent) => {
        setIsHovered(true);
        onMouseEnter?.(e);
        window.setCursorIcon(CursorIcon.Hand);
    };

    const ownMouseLeave = (e: MouseEvent) => {
        setIsHovered(false);
        onMouseLeave?.(e);
        window.setCursorIcon(CursorIcon.Default);
    };

    return (
        <Box
            style={ownStyle}
            onMouseDown={ownMouseDown}
            onMouseUp={ownMouseUp}
            onMouseEnter={ownMouseEnter}
            onMouseLeave={ownMouseLeave}
            {...rest}
        >
            {children}
        </Box>
    );
};
