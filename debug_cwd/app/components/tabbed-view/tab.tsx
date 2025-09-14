import * as React from 'mini-react';
import { Box, MouseEvent, StyleProps } from 'ui';

import { useTheme } from '@app/contexts';
import { EasingMode, useInterpolatedNumber } from 'hooks';
import { CloseButton } from '../close-button';
import { Flex, FlexProps } from '@app/components/flex';

type TabProps = FlexProps & {
    isActive: boolean;
    label: string;
    onClick?: () => void;
    onClose?: () => void;
};

export const Tab: React.FC<TabProps> = props => {
    const { children, isActive, label, onClose, onMouseEnter, onMouseLeave, ...rest } = props;
    const theme = useTheme();

    const [isHovered, setIsHovered] = React.useState(false);

    const ownMouseEnter = (e: MouseEvent) => {
        setIsHovered(true);
        onMouseEnter?.(e);
    };

    const ownMouseLeave = (e: MouseEvent) => {
        setIsHovered(false);
        onMouseLeave?.(e);
    };

    const [closeOpacity] = useInterpolatedNumber(isHovered ? 1 : 0.25, theme.durations.short, EasingMode.EaseInOut);

    const tabStyle: StyleProps = {
        color: theme.colors.text,
        padding: theme.spacing.sm,
        borderTopLeftRadius: theme.borders.radius.sm,
        borderTopRightRadius: theme.borders.radius.sm,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        minWidth: '5em',
        fontSize: theme.typography.size.sm,
        cursor: 'pointer'
    };

    return (
        <Flex
            style={{
                ...tabStyle,
                backgroundColor: isActive ? theme.colors.surface : theme.colors.background
            }}
            onMouseEnter={ownMouseEnter}
            onMouseLeave={ownMouseLeave}
            {...rest}
        >
            <Box style={{ flexGrow: 1 }}>{label}</Box>
            {onClose && <CloseButton onClick={onClose} style={{ opacity: closeOpacity }} />}
        </Flex>
    );
};
