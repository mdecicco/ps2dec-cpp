import { useDepthLayer } from 'hooks';
import * as React from 'mini-react';

import { Flex, FlexProps } from '@app/components/flex';

export const PopoverContainer: React.FC<FlexProps> = props => {
    const depthLayer = useDepthLayer();
    const { style, children, ...rest } = props;

    return (
        <Flex style={{ ...style, zIndex: depthLayer }} {...rest}>
            {children}
        </Flex>
    );
};
