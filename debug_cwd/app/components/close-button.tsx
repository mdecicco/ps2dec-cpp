import { FaXmark } from 'font-awesome-solid';
import * as React from 'mini-react';
import { MouseEvent, StyleProps } from 'ui';
import { EasingMode, useInterpolatedColor } from 'hooks';

import { useTheme } from '@app/contexts';
import { FlexProps } from '@app/components/flex';
import { Icon } from './icon';

export const CloseButton: React.FC<FlexProps> = props => {
    const { style, children, onMouseOver, onMouseOut, ...rest } = props;
    const theme = useTheme();

    const [isHovered, setIsHovered] = React.useState(false);
    const [color] = useInterpolatedColor(
        isHovered ? theme.colors.text : theme.colors.textSecondary,
        250,
        EasingMode.EaseInOut
    );

    const ownMouseOver = (e: MouseEvent) => {
        setIsHovered(true);
        onMouseOver?.(e);
    };

    const ownMouseOut = (e: MouseEvent) => {
        setIsHovered(false);
        onMouseOut?.(e);
    };

    const iconStyle: StyleProps = {
        ...props.style,
        color
    };

    return (
        <Icon
            icon={FaXmark}
            size='xs'
            style={iconStyle}
            onMouseOver={ownMouseOver}
            onMouseOut={ownMouseOut}
            {...rest}
        />
    );
};
