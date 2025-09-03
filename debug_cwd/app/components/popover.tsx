import { EasingMode, useInterpolatedColor, useInterpolatedNumber, useRootElement } from 'hooks';
import * as React from 'mini-react';
import { Box, BoxProps, Element, StyleProps } from 'ui';

import { useTheme } from '@app/contexts';
import { EventListener } from 'event';

export const PopoverTrigger: React.FC = props => {
    return props.children;
};

export const PopoverContent: React.FC<Omit<BoxProps, 'ref'>> = props => {
    return props.children;
};

export type PopoverProps = {
    offsetX?: string;
    offsetY?: string;
};

export const Popover: React.FC<PopoverProps> = props => {
    const theme = useTheme();
    const rootElement = useRootElement();

    const [isOpen, setIsOpen] = React.useState(false);
    const triggerRef = React.useRef<Element | null>(null);
    const contentRef = React.useRef<Element | null>(null);
    const clickListener = React.useRef<EventListener | null>(null);

    const [backgroundColor] = useInterpolatedColor(theme.colors.surface, theme.durations.medium, EasingMode.EaseInOut);
    const [opacity, setOpacity, { onComplete: onOpacityComplete }] = useInterpolatedNumber(
        0,
        theme.durations.short,
        EasingMode.EaseInOut
    );

    onOpacityComplete(o => {
        if (o !== 0) return;
        setIsOpen(false);
    });

    React.useEffect(() => {
        if (rootElement) {
            clickListener.current = rootElement.addListener('click', e => {
                if (!contentRef.current) return;
                if (contentRef.current.containsPoint(e.absolutePosition)) return;

                setOpacity(0);
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
                    setOpacity(1);
                    if (triggerChildProps.onClick) triggerChildProps.onClick();
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
    const contentX = buttonRect ? buttonRect.left : 0;
    const contentY = buttonRect ? buttonRect.bottom : 0;

    const contentStyle: StyleProps = {
        backgroundColor,
        position: 'absolute',
        left: `${contentX}px`,
        top: `${contentY}px`,
        marginLeft: props.offsetX,
        marginTop: props.offsetY,
        padding: theme.spacing.sm,
        opacity,
        ...style
    };

    return (
        <>
            {trigger}
            {isOpen && (
                <Box ref={contentRef} style={contentStyle} {...rest}>
                    {content}
                </Box>
            )}
        </>
    );
};
