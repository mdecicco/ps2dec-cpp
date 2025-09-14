import * as React from 'mini-react';
import { StyleProps } from 'ui';

import { Popover, PopoverContent, PopoverProps, PopoverTrigger } from '@app/components/popover';
import { FlexProps } from '@app/components/flex';
import { Hotkey, useManyHotkeys, useTheme } from '@app/contexts';

import { DropdownMenuContent } from './content';
import { DropdownMenuProvider } from './context';
import { DropdownMenuItem, DropdownMenuItemProps } from './item';

type DropdownMenuProps = PopoverProps & {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};

export const DropdownMenuTrigger: React.FC = props => {
    return props.children;
};

export const DropdownMenu: React.FC<DropdownMenuProps> = props => {
    const theme = useTheme();
    const { children, open, onOpenChange, ...rest } = props;
    const [isOpen, setIsOpen] = React.useState(false);

    React.useEffect(() => {
        if (open === undefined || open === isOpen) return;
        setIsOpen(open ?? false);
    }, [open]);

    React.useEffect(() => {
        if (onOpenChange === undefined) return;
        onOpenChange(isOpen);
    }, [isOpen, onOpenChange]);

    const childrenArray = React.flattenChildren(props.children);
    let trigger: React.ReactElement | null = null;
    let content: React.ReactNode | null = null;
    let contentProps: FlexProps = {};
    const hotkeys: { callback: () => void; hotkey: Hotkey; name: string }[] = [];

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
            contentProps = child.props as FlexProps;

            const contentChildrenArray = React.flattenChildren(contentProps.children);
            for (const contentChild of contentChildrenArray) {
                if (!React.isReactElement(contentChild)) continue;
                if (contentChild.type === DropdownMenuItem) {
                    const { children, hotkey, onSelect } = contentChild.props as DropdownMenuItemProps;
                    if (!hotkey || !onSelect) continue;
                    hotkeys.push({
                        callback: onSelect,
                        hotkey,
                        name: typeof children === 'string' ? children : ''
                    });
                }
            }
        }
    }

    useManyHotkeys(hotkeys);

    const { style, children: contentChildren, ...contentRest } = contentProps;

    const contentStyle: StyleProps = {
        ...style,
        color: theme.colors.text,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.borders.radius.sm,
        flexDirection: 'column'
    };

    const close = React.useMemo(() => () => setIsOpen(false));

    return (
        <DropdownMenuProvider closeMenu={close}>
            <Popover open={isOpen} onOpenChange={setIsOpen} {...rest}>
                <PopoverTrigger>{trigger}</PopoverTrigger>
                <PopoverContent style={contentStyle} {...contentRest}>
                    {content}
                </PopoverContent>
            </Popover>
        </DropdownMenuProvider>
    );
};
