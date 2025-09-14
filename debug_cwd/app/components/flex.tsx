import * as React from 'mini-react';
import { Box, BoxProps, StyleProps } from 'ui';

import { ShorthandStyleProps } from '@app/types';
import { extractStyleProps } from '@app/utils';
import { useTheme } from '@app/contexts';

export type FlexProps = BoxProps & ShorthandStyleProps;

export const Flex: React.FC<FlexProps> = props => {
    const { children, style, ...rest } = props;
    const theme = useTheme();

    const combinedStyle: StyleProps = {
        ...style,
        ...extractStyleProps(props, theme)
    };

    return (
        <Box style={combinedStyle} {...rest}>
            {children}
        </Box>
    );
};
