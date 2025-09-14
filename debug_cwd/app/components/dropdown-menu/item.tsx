import * as React from 'mini-react';
import { Box, StyleProps, MouseEvent } from 'ui';
import { EasingMode, useInterpolatedNumber } from 'hooks';

import { Hotkey, useTheme, getHotkeyString } from '@app/contexts';
import { useDropdownMenuContext } from './context';
import { Flex, FlexProps } from '@app/components/flex';
import { extractStyleProps } from '@app/utils';

export type DropdownMenuItemProps = FlexProps & {
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    tip?: string;
    noCloseBehavior?: boolean;
    disabled?: boolean;
    hotkey?: Hotkey;
    onSelect?: () => void;
};

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = props => {
    const {
        style,
        children,
        prefix,
        suffix,
        tip,
        hotkey,
        noCloseBehavior,
        disabled,
        onMouseEnter,
        onMouseLeave,
        onClick,
        onSelect,
        ...rest
    } = props;

    const theme = useTheme();
    const { closeMenu } = useDropdownMenuContext();

    const [backgroundOpacity, setBackgroundOpacity] = useInterpolatedNumber(
        0,
        theme.durations.short,
        EasingMode.EaseInOut
    );

    const ownMouseEnter = (e: MouseEvent) => {
        if (disabled) return;
        setBackgroundOpacity(theme.highlights.hover);
        onMouseEnter?.(e);
    };

    const ownMouseLeave = (e: MouseEvent) => {
        if (disabled) return;
        setBackgroundOpacity(0);
        onMouseLeave?.(e);
    };

    const ownClick = (e: MouseEvent) => {
        if (disabled) return;
        onSelect?.();
        onClick?.(e);
        if (!noCloseBehavior) closeMenu();
    };

    const itemStyle: StyleProps = {
        ...style,
        ...extractStyleProps(props, theme),
        padding: theme.spacing.sm,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        justifyContent: 'space-between',
        backgroundColor: `rgba(255, 255, 255, ${backgroundOpacity})`,
        borderRadius: theme.borders.radius.sm,
        cursor: 'pointer',
        opacity: disabled ? 0.5 : 1
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

    let tipText: string | null = null;
    if (tip) tipText = tip;
    else if (hotkey) tipText = getHotkeyString(hotkey);

    return (
        <Flex style={itemStyle} onMouseEnter={ownMouseEnter} onMouseLeave={ownMouseLeave} onClick={ownClick} {...rest}>
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
                {tipText && <Box style={{ color: theme.colors.textSecondary, fontSize: '0.85em' }}>{tipText}</Box>}
                <Box style={prefixPostfixStyle}>{suffix}</Box>
            </Box>
        </Flex>
    );
};
