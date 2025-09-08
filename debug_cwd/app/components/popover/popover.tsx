import {
    EasingMode,
    useInterpolatedColor,
    useInterpolatedNumber,
    useOptionallyControlledState,
    useRootElement
} from 'hooks';
import { EventListener } from 'event';
import * as React from 'mini-react';
import { BoxProps, Element, StyleProps } from 'ui';

import { useTheme } from '@app/contexts';

import { PopoverContainer } from './container';

export const PopoverTrigger: React.FC = props => {
    return props.children;
};

export const PopoverContent: React.FC<Omit<BoxProps, 'ref'>> = props => {
    return props.children;
};

export enum PopoverDirection {
    Down = 0,
    Right = 1
}

export type PopoverProps = {
    offsetX?: string;
    offsetY?: string;
    open?: boolean;
    direction?: PopoverDirection;
    onOpenChange?: (open: boolean) => void;
};

export const Popover: React.FC<PopoverProps> = props => {
    const theme = useTheme();
    const rootElement = useRootElement();

    const [isOpen, setIsOpen] = useOptionallyControlledState(false, props.open, props.onOpenChange);
    const triggerRef = React.useRef<Element | null>(null);
    const contentRef = React.useRef<Element | null>(null);
    const clickListener = React.useRef<EventListener | null>(null);

    const [backgroundColor] = useInterpolatedColor(theme.colors.surface, theme.durations.medium, EasingMode.EaseInOut);
    const [opacity] = useInterpolatedNumber(isOpen ? 1 : 0, theme.durations.short, EasingMode.EaseInOut);

    React.useEffect(() => {
        if (rootElement) {
            clickListener.current = rootElement.addListener('click', e => {
                if (!contentRef.current) return;
                if (contentRef.current.containsPoint(e.absolutePosition)) return;

                setIsOpen(false);
            });
        }

        return () => {
            if (!clickListener.current) return;
            clickListener.current.remove();
        };
    }, [rootElement]);

    const childrenArray = React.flattenChildren(props.children);
    let trigger: React.ReactElement | null = null;
    let content: React.ReactNode | null = null;
    let contentProps: BoxProps = {};

    for (const child of childrenArray) {
        if (!React.isReactElement(child)) continue;

        if (child.type === PopoverTrigger) {
            const triggerProps = child.props as any;
            const triggerChildren = React.flattenChildren(triggerProps.children);
            if (triggerChildren.length !== 1) continue;

            const triggerChild = triggerChildren[0];
            if (!React.isReactElement(triggerChild)) continue;

            const triggerChildProps = triggerChild.props as any;

            trigger = React.cloneElement<BoxProps>(triggerChild, {
                ref: triggerRef,
                onClick: e => {
                    setIsOpen(true);
                    if (triggerChildProps.onClick) triggerChildProps.onClick(e);
                    e.stopPropagation();
                }
            });
        } else if (child.type === PopoverContent) {
            content = child;
            contentProps = child.props as BoxProps;
        }
    }

    const { style, children, ...rest } = contentProps;

    const buttonRect = triggerRef.current?.clientRect;

    const direction = props.direction ?? PopoverDirection.Down;
    let left = `${buttonRect ? buttonRect.left : 0}px`;
    let top = `${buttonRect ? buttonRect.bottom : 0}px`;

    switch (direction) {
        case PopoverDirection.Right:
            left = `${buttonRect ? buttonRect.right : 0}px`;
            top = `${buttonRect ? buttonRect.top : 0}px`;
            break;
        default:
    }

    if (props.offsetX) {
        left = `calc(${left} + ${props.offsetX})`;
    }

    if (props.offsetY) {
        top = `calc(${top} + ${props.offsetY})`;
    }

    const contentStyle: StyleProps = {
        backgroundColor,
        position: 'absolute',
        left,
        top,
        padding: theme.spacing.sm,
        opacity,
        ...style
    };

    return (
        <>
            {trigger}
            {(isOpen || opacity !== 0) && (
                <PopoverContainer ref={contentRef} style={contentStyle} {...rest}>
                    {content}
                </PopoverContainer>
            )}
        </>
    );
};
