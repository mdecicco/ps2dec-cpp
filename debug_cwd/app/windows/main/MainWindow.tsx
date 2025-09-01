import * as React from 'mini-react';
import { Box, StyleProps } from 'ui';

import { WindowComponent } from '@app/windows/types';
import { BoxProps, MouseEvent } from 'ui/types';
import { EasingMode, useInterpolatedColor } from 'hooks';
import { useTheme } from '@app/contexts';
import { Theme } from '@app/types';

type ButtonProps = BoxProps & {
    variant?: 'primary' | 'outline';
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
        }
    }[variant ?? 'primary'];
}

const Button: React.FC<ButtonProps> = props => {
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

    const ownStyle: StyleProps = {
        backgroundColor,
        color,
        border: `${theme.borders.width.sm} solid ${borderColor}`,
        paddingTop: theme.spacing.sm,
        paddingBottom: theme.spacing.sm,
        paddingLeft: theme.spacing.lg,
        paddingRight: theme.spacing.lg,
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
    };

    const ownMouseLeave = (e: MouseEvent) => {
        setIsHovered(false);
        onMouseLeave?.(e);
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

export const MainWindow: WindowComponent = () => {
    return (
        <Box style={{ color: 'rgba(255, 255, 255, 1)' }}>
            <Button variant='outline'>Click me</Button>
        </Box>
    );
};

MainWindow.title = 'ps2dec';
MainWindow.width = 400;
MainWindow.height = 400;
