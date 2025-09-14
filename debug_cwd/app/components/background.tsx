import { EasingMode, useInterpolatedColor } from 'hooks';
import * as React from 'mini-react';

import { useTheme } from '@app/contexts';
import { Flex, FlexProps } from '@app/components/flex';

export const Background: React.FC<FlexProps> = props => {
    const { children, ...rest } = props;
    const theme = useTheme();

    const [backgroundColor] = useInterpolatedColor(theme.colors.background, 250, EasingMode.EaseInOut);

    return (
        <Flex w='100%' h='100%' bg={backgroundColor} {...rest}>
            {children}
        </Flex>
    );
};
