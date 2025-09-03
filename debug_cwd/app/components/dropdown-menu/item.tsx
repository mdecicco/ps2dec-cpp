import * as React from 'mini-react';
import { Box, BoxProps, StyleProps } from 'ui';

import { useTheme } from '@app/contexts';
import { MouseEvent } from 'ui';
import { EasingMode, useInterpolatedNumber } from 'hooks';

type DropdownMenuItemProps = BoxProps & {
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    tip?: string;
};

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = props => {
    const { style, children, prefix, suffix, tip, onMouseEnter, onMouseLeave, ...rest } = props;
    const theme = useTheme();

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
        <Box style={itemStyle} onMouseEnter={ownMouseEnter} onMouseLeave={ownMouseLeave} {...rest}>
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
