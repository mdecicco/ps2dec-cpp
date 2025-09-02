import { EasingMode, useInterpolatedColor } from 'hooks';
import * as React from 'mini-react';
import { Box, BoxProps, StyleProps } from 'ui';

import { useTheme } from '@app/contexts';

type ToolbarProps = BoxProps & {};

export const Toolbar: React.FC<ToolbarProps> = props => {
    const { style, children, ...rest } = props;
    const theme = useTheme();

    const [backgroundColor] = useInterpolatedColor(theme.colors.surface, 250, EasingMode.EaseInOut);

    const mergedStyle: StyleProps = {
        backgroundColor,
        width: '100%',
        padding: theme.spacing.sm,
        borderBottomColor: theme.colors.accent,
        borderBottomWidth: '1px',
        borderBottomStyle: 'solid',
        flexDirection: 'row',
        gap: theme.spacing.sm,
        ...style
    };

    return (
        <Box style={mergedStyle} {...rest}>
            {children}
        </Box>
    );
};
