import { EasingMode, useInterpolatedColor } from 'hooks';
import * as React from 'mini-react';
import { Box, BoxProps, StyleProps } from 'ui';

import { useTheme } from '@app/contexts';

export const Background: React.FC<BoxProps> = props => {
    const { style, children, ...rest } = props;
    const theme = useTheme();

    const [backgroundColor] = useInterpolatedColor(theme.colors.background, 250, EasingMode.EaseInOut);

    const mergedStyle: StyleProps = {
        backgroundColor,
        width: '100%',
        height: '100%',
        ...style
    };

    return (
        <Box style={mergedStyle} {...rest}>
            {children}
        </Box>
    );
};
