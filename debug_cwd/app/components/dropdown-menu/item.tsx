import * as React from 'mini-react';
import { Box, BoxProps, StyleProps, MouseEvent } from 'ui';
import { EasingMode, useInterpolatedNumber } from 'hooks';

import { useTheme } from '@app/contexts';
import { useDropdownMenuContext } from './context';

type DropdownMenuItemProps = BoxProps & {
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    tip?: string;
    noCloseBehavior?: boolean;
};

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = props => {
    const { style, children, prefix, suffix, tip, onMouseEnter, onMouseLeave, onClick, noCloseBehavior, ...rest } =
        props;
    const theme = useTheme();
    const { closeMenu } = useDropdownMenuContext();

    const [backgroundOpacity, setBackgroundOpacity] = useInterpolatedNumber(
        0,
        theme.durations.short,
        EasingMode.EaseInOut
    );

    const ownMouseEnter = (e: MouseEvent) => {
        setBackgroundOpacity(theme.highlights.hover);
        onMouseEnter?.(e);
    };

    const ownMouseLeave = (e: MouseEvent) => {
        setBackgroundOpacity(0);
        onMouseLeave?.(e);
    };

    const ownClick = (e: MouseEvent) => {
        onClick?.(e);
        if (!noCloseBehavior) closeMenu();
    };

    const itemStyle: StyleProps = {
        ...style,
        padding: theme.spacing.sm,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: `rgba(255, 255, 255, ${backgroundOpacity})`,
        borderRadius: theme.borders.radius.sm,
        cursor: 'pointer'
    };

    const childrenStyle: StyleProps = {
        flexGrow: 1,
        paddingLeft: theme.spacing.sm,
        paddingRight: theme.spacing.sm
    };

    const prefixPostfixStyle: StyleProps = {
        minWidth: '1em',
        maxWidth: '1em',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '0.9em'
    };

    return (
        <Box style={itemStyle} onMouseEnter={ownMouseEnter} onMouseLeave={ownMouseLeave} onClick={ownClick} {...rest}>
            <Box style={prefixPostfixStyle}>{prefix}</Box>
            <Box style={childrenStyle}>{children}</Box>
            <Box
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: theme.spacing.sm
                }}
            >
                {tip && <Box style={{ color: theme.colors.textSecondary, fontSize: '0.85em' }}>{tip}</Box>}
                <Box style={prefixPostfixStyle}>{suffix}</Box>
            </Box>
        </Box>
    );
};
