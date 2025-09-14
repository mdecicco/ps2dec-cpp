import { useCurrentWindow } from 'components';
import { EasingMode, useDepthLayer, useInjectRef, useInterpolatedNumber, useRootElement } from 'hooks';
import { vec2 } from 'math-ext';
import * as React from 'mini-react';
import { Box, BoxProps, Element, StyleProps } from 'ui';
import { ClientRect, Direction } from 'ui/types';
import { StyleParser } from 'ui/utils';

import { useTheme } from '@app/contexts';
import { Flex, FlexProps } from '@app/components/flex';

type PaneProps = FlexProps & {
    children?: React.ReactNode;
    resizeLeft?: boolean;
    resizeRight?: boolean;
    resizeTop?: boolean;
    resizeBottom?: boolean;
    resizeHandleThreshold?: number;
};

enum Side {
    Left = 0,
    Right = 1,
    Top = 2,
    Bottom = 3
}

type ResizeState = {
    side: Side;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
};

let nextPaneId = 0;
const hoveredSidePaneIds: Record<Side, Set<number>> = {
    [Side.Left]: new Set(),
    [Side.Right]: new Set(),
    [Side.Top]: new Set(),
    [Side.Bottom]: new Set()
};
const resizingPaneIds = new Set<number>();

function cursorOverLeftHandle(cursorPos: vec2, rect: ClientRect, threshold: number) {
    if (cursorPos.y < rect.y || cursorPos.y > rect.bottom) return false;
    return Math.abs(cursorPos.x - rect.left) < threshold;
}

function cursorOverRightHandle(cursorPos: vec2, rect: ClientRect, threshold: number) {
    if (cursorPos.y < rect.y || cursorPos.y > rect.bottom) return false;
    return Math.abs(cursorPos.x - rect.right) < threshold;
}

function cursorOverTopHandle(cursorPos: vec2, rect: ClientRect, threshold: number) {
    if (cursorPos.x < rect.x || cursorPos.x > rect.right) return false;
    return Math.abs(cursorPos.y - rect.top) < threshold;
}

function cursorOverBottomHandle(cursorPos: vec2, rect: ClientRect, threshold: number) {
    if (cursorPos.x < rect.x || cursorPos.x > rect.right) return false;
    return Math.abs(cursorPos.y - rect.bottom) < threshold;
}

const DefaultResizeHandleThreshold = 8;

export const Pane: React.FC<PaneProps> = props => {
    const { ref, style, children, resizeLeft, resizeRight, resizeTop, resizeBottom, resizeHandleThreshold, ...rest } =
        props;
    const theme = useTheme();
    const root = useRootElement();
    const { window } = useCurrentWindow();
    const boxRef = useInjectRef<Element | null>(null, ref);
    const paneId = React.useMemo(() => nextPaneId++, []);

    const [leftResizeHovered, setLeftResizeHovered] = React.useState(false);
    const [rightResizeHovered, setRightResizeHovered] = React.useState(false);
    const [topResizeHovered, setTopResizeHovered] = React.useState(false);
    const [bottomResizeHovered, setBottomResizeHovered] = React.useState(false);
    const [width, setWidth] = React.useState<number | null>(null);
    const [height, setHeight] = React.useState<number | null>(null);
    const handleZIndex = useDepthLayer();
    const resizeState = React.useRef<ResizeState | null>(null);
    const resizeLeftRef = React.useRef(resizeLeft);
    const resizeRightRef = React.useRef(resizeRight);
    const resizeTopRef = React.useRef(resizeTop);
    const resizeBottomRef = React.useRef(resizeBottom);
    const minWidthRef = React.useRef<number | null>(null);
    const maxWidthRef = React.useRef<number | null>(null);
    const minHeightRef = React.useRef<number | null>(null);
    const maxHeightRef = React.useRef<number | null>(null);
    const resizeHandleThresholdRef = React.useRef(resizeHandleThreshold);

    resizeLeftRef.current = resizeLeft;
    resizeRightRef.current = resizeRight;
    resizeTopRef.current = resizeTop;
    resizeBottomRef.current = resizeBottom;
    resizeHandleThresholdRef.current = resizeHandleThreshold;

    React.useEffect(() => {
        if (!boxRef.current) return;
        if (!style || !style.minWidth) {
            minWidthRef.current = null;
            return;
        }

        const parser = new StyleParser(style.minWidth);
        const minWidth = parser.parseSize();
        if (!minWidth || minWidth.value < 0) {
            minWidthRef.current = null;
        } else {
            minWidthRef.current = boxRef.current.style.resolveSize(minWidth, Direction.Horizontal);
        }
    }, [style?.minWidth, boxRef.current]);

    React.useEffect(() => {
        if (!boxRef.current) return;
        if (!style || !style.maxWidth) {
            maxWidthRef.current = null;
            return;
        }

        const parser = new StyleParser(style.maxWidth);
        const maxWidth = parser.parseSize();
        if (!maxWidth || maxWidth.value < 0) {
            maxHeightRef.current = null;
        } else {
            maxWidthRef.current = boxRef.current.style.resolveSize(maxWidth, Direction.Horizontal);
        }
    }, [style?.maxWidth, boxRef.current]);

    React.useEffect(() => {
        if (!boxRef.current) return;
        if (!style || !style.minHeight) {
            minHeightRef.current = null;
            return;
        }

        const parser = new StyleParser(style.minHeight);
        const minHeight = parser.parseSize();
        if (!minHeight || minHeight.value < 0) {
            minHeightRef.current = null;
        } else {
            minHeightRef.current = boxRef.current.style.resolveSize(minHeight, Direction.Vertical);
        }
    }, [style?.minHeight, boxRef.current]);

    React.useEffect(() => {
        if (!boxRef.current) return;
        if (!style || !style.maxHeight) {
            maxHeightRef.current = null;
            return;
        }

        const parser = new StyleParser(style.maxHeight);
        const maxHeight = parser.parseSize();
        if (!maxHeight || maxHeight.value < 0) {
            maxHeightRef.current = null;
        } else {
            maxHeightRef.current = boxRef.current.style.resolveSize(maxHeight, Direction.Vertical);
        }
    }, [style?.maxHeight, boxRef.current]);

    const [leftHandleOpacity] = useInterpolatedNumber(
        leftResizeHovered ? 1 : 0,
        theme.durations.short,
        EasingMode.Linear
    );
    const [rightHandleOpacity] = useInterpolatedNumber(
        rightResizeHovered ? 1 : 0,
        theme.durations.short,
        EasingMode.Linear
    );
    const [topHandleOpacity] = useInterpolatedNumber(
        topResizeHovered ? 1 : 0,
        theme.durations.short,
        EasingMode.Linear
    );
    const [bottomHandleOpacity] = useInterpolatedNumber(
        bottomResizeHovered ? 1 : 0,
        theme.durations.short,
        EasingMode.Linear
    );

    React.useEffect(() => {
        if (!root) return;

        const mousedownListener = root.addListener('mousedown', event => {
            if (event.defaultPrevented || !boxRef.current) return;

            const rect = boxRef.current.clientRect;
            const pos = event.absolutePosition;

            const threshold = resizeHandleThresholdRef.current ?? DefaultResizeHandleThreshold;

            if (resizeLeftRef.current && cursorOverLeftHandle(pos, rect, threshold)) {
                resizeState.current = {
                    side: Side.Left,
                    startX: pos.x,
                    startY: pos.y,
                    startWidth: rect.width,
                    startHeight: rect.height
                };
                resizingPaneIds.add(paneId);
            } else if (resizeRightRef.current && cursorOverRightHandle(pos, rect, threshold)) {
                resizeState.current = {
                    side: Side.Right,
                    startX: pos.x,
                    startY: pos.y,
                    startWidth: rect.width,
                    startHeight: rect.height
                };
                resizingPaneIds.add(paneId);
            } else if (resizeTopRef.current && cursorOverTopHandle(pos, rect, threshold)) {
                resizeState.current = {
                    side: Side.Top,
                    startX: pos.x,
                    startY: pos.y,
                    startWidth: rect.width,
                    startHeight: rect.height
                };
                resizingPaneIds.add(paneId);
            } else if (resizeBottomRef.current && cursorOverBottomHandle(pos, rect, threshold)) {
                resizeState.current = {
                    side: Side.Bottom,
                    startX: pos.x,
                    startY: pos.y,
                    startWidth: rect.width,
                    startHeight: rect.height
                };
                resizingPaneIds.add(paneId);
            } else {
                resizingPaneIds.delete(paneId);
            }
        });

        const mouseupListener = root.addListener('mouseup', event => {
            if (event.defaultPrevented) return;

            if (resizeState.current) {
                resizeState.current = null;
            }

            resizingPaneIds.delete(paneId);
        });

        const mousemoveListener = root.addListener('mousemove', event => {
            if (event.defaultPrevented || !boxRef.current) return;

            const pos = event.absolutePosition;

            if (resizeState.current) {
                const { side, startX, startY, startWidth, startHeight } = resizeState.current;
                switch (side) {
                    case Side.Left: {
                        let newWidth = startWidth - (pos.x - startX);
                        if (minWidthRef.current) newWidth = Math.max(newWidth, minWidthRef.current);
                        if (maxWidthRef.current) newWidth = Math.min(newWidth, maxWidthRef.current);
                        setWidth(newWidth);
                        break;
                    }
                    case Side.Right: {
                        let newWidth = startWidth + pos.x - startX;
                        if (minWidthRef.current) newWidth = Math.max(newWidth, minWidthRef.current);
                        if (maxWidthRef.current) newWidth = Math.min(newWidth, maxWidthRef.current);
                        setWidth(newWidth);
                        break;
                    }
                    case Side.Top: {
                        let newHeight = startHeight - (pos.y - startY);
                        if (minHeightRef.current) newHeight = Math.max(newHeight, minHeightRef.current);
                        if (maxHeightRef.current) newHeight = Math.min(newHeight, maxHeightRef.current);
                        setHeight(newHeight);
                        break;
                    }
                    case Side.Bottom: {
                        let newHeight = startHeight + pos.y - startY;
                        if (minHeightRef.current) newHeight = Math.max(newHeight, minHeightRef.current);
                        if (maxHeightRef.current) newHeight = Math.min(newHeight, maxHeightRef.current);
                        setHeight(newHeight);
                        break;
                    }
                }
                return;
            }

            const rect = boxRef.current.clientRect;

            const threshold = resizeHandleThresholdRef.current ?? DefaultResizeHandleThreshold;

            if (resizeLeftRef.current && cursorOverLeftHandle(pos, rect, threshold)) {
                setLeftResizeHovered(true);
                setRightResizeHovered(false);
                setTopResizeHovered(false);
                setBottomResizeHovered(false);
            } else if (resizeRightRef.current && cursorOverRightHandle(pos, rect, threshold)) {
                setLeftResizeHovered(false);
                setRightResizeHovered(true);
                setTopResizeHovered(false);
                setBottomResizeHovered(false);
            } else if (resizeTopRef.current && cursorOverTopHandle(pos, rect, threshold)) {
                setLeftResizeHovered(false);
                setRightResizeHovered(false);
                setTopResizeHovered(true);
                setBottomResizeHovered(false);
            } else if (resizeBottomRef.current && cursorOverBottomHandle(pos, rect, threshold)) {
                setLeftResizeHovered(false);
                setRightResizeHovered(false);
                setTopResizeHovered(false);
                setBottomResizeHovered(true);
            } else {
                setLeftResizeHovered(false);
                setRightResizeHovered(false);
                setTopResizeHovered(false);
                setBottomResizeHovered(false);
            }
        });

        return () => {
            mousedownListener.remove();
            mouseupListener.remove();
            mousemoveListener.remove();
        };
    }, [root]);

    React.useEffect(() => {
        if (leftResizeHovered) hoveredSidePaneIds[Side.Left].add(paneId);
        else hoveredSidePaneIds[Side.Left].delete(paneId);

        if (rightResizeHovered) hoveredSidePaneIds[Side.Right].add(paneId);
        else hoveredSidePaneIds[Side.Right].delete(paneId);

        if (topResizeHovered) hoveredSidePaneIds[Side.Top].add(paneId);
        else hoveredSidePaneIds[Side.Top].delete(paneId);

        if (bottomResizeHovered) hoveredSidePaneIds[Side.Bottom].add(paneId);
        else hoveredSidePaneIds[Side.Bottom].delete(paneId);

        let hasHorizontalResize = hoveredSidePaneIds[Side.Left].size > 0 || hoveredSidePaneIds[Side.Right].size > 0;
        let hasVerticalResize = hoveredSidePaneIds[Side.Top].size > 0 || hoveredSidePaneIds[Side.Bottom].size > 0;
        if (hasHorizontalResize && hasVerticalResize) {
            window.cursorOverride = CursorIcon.SizeAll;
        } else if (hasHorizontalResize) {
            window.cursorOverride = CursorIcon.SizeWE;
        } else if (hasVerticalResize) {
            window.cursorOverride = CursorIcon.SizeNS;
        } else {
            window.cursorOverride = null;
        }
    }, [leftResizeHovered, rightResizeHovered, topResizeHovered, bottomResizeHovered]);

    React.useEffect(() => {
        return () => {
            hoveredSidePaneIds[Side.Left].delete(paneId);
            hoveredSidePaneIds[Side.Right].delete(paneId);
            hoveredSidePaneIds[Side.Top].delete(paneId);
            hoveredSidePaneIds[Side.Bottom].delete(paneId);
        };
    }, []);

    React.useEffect(() => {
        if (!boxRef.current) return;

        let { width: currentWidth, height: currentHeight } = boxRef.current.clientRect;

        if ((resizeLeft || resizeRight) && width === null) {
            if (minWidthRef.current) currentWidth = Math.max(currentWidth, minWidthRef.current);
            if (maxWidthRef.current) currentWidth = Math.min(currentWidth, maxWidthRef.current);
            setWidth(currentWidth);
        }

        if ((resizeTop || resizeBottom) && height === null) {
            if (minHeightRef.current) currentHeight = Math.max(currentHeight, minHeightRef.current);
            if (maxHeightRef.current) currentHeight = Math.min(currentHeight, maxHeightRef.current);
            setHeight(currentHeight);
        }
    }, [width, height, boxRef.current]);

    const outerStyle: StyleProps = {
        ...style,
        position: 'relative'
    };

    if (width) {
        outerStyle.width = `${width}px`;
        outerStyle.minWidth = `${width}px`;
        outerStyle.maxWidth = `${width}px`;
    }

    if (height) {
        outerStyle.height = `${height}px`;
        outerStyle.minHeight = `${height}px`;
        outerStyle.maxHeight = `${height}px`;
    }

    const commonResizeProps: Omit<BoxProps, 'children'> = {
        style: {
            position: 'absolute',
            backgroundColor: theme.colors.accent,
            zIndex: handleZIndex
        }
    };

    const rightResizeProps: Omit<BoxProps, 'children'> = {
        ...commonResizeProps,
        style: {
            ...commonResizeProps.style,
            right: '-1px',
            top: '0px',
            width: '3px',
            height: '100%',
            opacity: rightHandleOpacity
        }
    };

    const leftResizeProps: Omit<BoxProps, 'children'> = {
        ...commonResizeProps,
        style: {
            ...commonResizeProps.style,
            left: '-1px',
            top: '0px',
            width: '3px',
            height: '100%',
            opacity: leftHandleOpacity
        }
    };

    const topResizeProps: Omit<BoxProps, 'children'> = {
        ...commonResizeProps,
        style: {
            ...commonResizeProps.style,
            left: '0px',
            top: '-1px',
            width: '100%',
            height: '3px',
            opacity: topHandleOpacity
        }
    };

    const bottomResizeProps: Omit<BoxProps, 'children'> = {
        ...commonResizeProps,
        style: {
            ...commonResizeProps.style,
            left: '0px',
            bottom: '-1px',
            width: '100%',
            height: '3px',
            opacity: bottomHandleOpacity
        }
    };

    return (
        <Flex ref={boxRef} style={outerStyle} {...rest}>
            {children}
            <Box {...rightResizeProps} />
            <Box {...leftResizeProps} />
            <Box {...topResizeProps} />
            <Box {...bottomResizeProps} />
        </Flex>
    );
};
