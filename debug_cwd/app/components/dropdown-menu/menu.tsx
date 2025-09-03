import * as React from 'mini-react';
import { BoxProps, StyleProps } from 'ui';

import { Popover, PopoverContent, PopoverProps, PopoverTrigger } from '@app/components/popover';
import { useTheme } from '@app/contexts';
import { DropdownMenuContent } from './content';

type DropdownMenuProps = PopoverProps & {};

export const DropdownMenuTrigger: React.FC = props => {
    return props.children;
};

export const DropdownMenu: React.FC<DropdownMenuProps> = props => {
    const theme = useTheme();
    const { children, ...rest } = props;

    const childrenArray = React.flattenChildren(props.children);
    let trigger: React.ReactElement | null = null;
    let content: React.ReactNode | null = null;
    let contentProps: BoxProps = {};

    for (const child of childrenArray) {
        if (!React.isReactElement(child)) continue;
        if (child.type === DropdownMenuTrigger) {
            const triggerProps = child.props as any;
            const triggerChildren = React.flattenChildren(triggerProps.children);
            if (triggerChildren.length !== 1) continue;

            const triggerChild = triggerChildren[0];
            if (!React.isReactElement(triggerChild)) continue;

            trigger = triggerChild;
        } else if (child.type === DropdownMenuContent) {
            content = child;
            contentProps = child.props as BoxProps;
        }
    }

    const { style, children: contentChildren, ...contentRest } = contentProps;

    const contentStyle: StyleProps = {
        ...style,
        color: theme.colors.text,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.borders.radius.sm,
        flexDirection: 'column'
    };

    return (
        <Popover {...rest}>
            <PopoverTrigger>{trigger}</PopoverTrigger>
            <PopoverContent style={contentStyle} {...contentRest}>
                {content}
            </PopoverContent>
        </Popover>
    );
};
