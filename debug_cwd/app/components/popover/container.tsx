import { useDepthLayer } from 'hooks';
import * as React from 'mini-react';
import { Box, BoxProps, StyleProps } from 'ui';

export const PopoverContainer: React.FC<BoxProps> = props => {
    const depthLayer = useDepthLayer();
    const { style, children, ...rest } = props;

    const styleProps: StyleProps = {
        ...style,
        zIndex: depthLayer
    };

    return (
        <Box style={styleProps} {...rest}>
            {children}
        </Box>
    );
};
