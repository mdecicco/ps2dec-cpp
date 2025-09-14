import { useTheme } from '@app/contexts';
import * as React from 'mini-react';
import { StyleProps } from 'ui';

import { Flex, FlexProps } from '@app/components/flex';

type IconProps = FlexProps & {
    icon: string;
    size?: 'xs' | 'sm' | 'md' | 'lg';
};

export const Icon: React.FC<IconProps> = props => {
    const { icon, size, style, children, ...rest } = props;
    const theme = useTheme();

    let fontSize = style?.fontSize;

    if (size) {
        switch (size) {
            case 'xs':
                fontSize = theme.typography.size.xs;
                break;
            case 'sm':
                fontSize = theme.typography.size.sm;
                break;
            case 'md':
                fontSize = theme.typography.size.md;
                break;
            case 'lg':
                fontSize = theme.typography.size.lg;
                break;
        }
    }

    const iconStyle: StyleProps = {
        ...style,
        fontSize,
        fontFamily: 'FontAwesome'
    };

    return (
        <Flex {...rest} style={iconStyle}>
            {icon}
        </Flex>
    );
};
