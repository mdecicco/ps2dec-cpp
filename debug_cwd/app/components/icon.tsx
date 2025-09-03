import * as React from 'mini-react';
import { Box, BoxProps, StyleProps } from 'ui';

type IconProps = BoxProps & {
    icon: string;
};

export const Icon: React.FC<IconProps> = props => {
    const { icon, style, children, ...rest } = props;

    const iconStyle: StyleProps = {
        ...style,
        fontFamily: 'FontAwesome'
    };

    return (
        <Box {...rest} style={iconStyle}>
            {icon}
        </Box>
    );
};
