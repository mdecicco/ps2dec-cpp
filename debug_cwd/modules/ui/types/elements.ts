import * as React from 'mini-react';
import type { KeyboardEvent, MouseEvent, ResizeEvent, ScrollEvent, UIEvent, WheelEvent } from './events';
import type { StyleProps } from './style';
import type { Element } from '../renderer/element';

export type ElementRef = React.Ref<Element | null> | ((element: Element | null) => void);

export type ElementBaseProps = {
    ref?: ElementRef;
    style?: StyleProps;
};

export type BoxProps = {
    children?: React.ReactNode;
    onClick?: (event: MouseEvent) => void;
    onMouseDown?: (event: MouseEvent) => void;
    onMouseUp?: (event: MouseEvent) => void;
    onMouseEnter?: (event: MouseEvent) => void;
    onMouseLeave?: (event: MouseEvent) => void;
    onMouseMove?: (event: MouseEvent) => void;
    onMouseOut?: (event: MouseEvent) => void;
    onMouseOver?: (event: MouseEvent) => void;
    onMouseWheel?: (event: WheelEvent) => void;
    onScroll?: (event: ScrollEvent) => void;
    onKeyDown?: (event: KeyboardEvent) => void;
    onKeyUp?: (event: KeyboardEvent) => void;
    onFocus?: (event: UIEvent) => void;
    onBlur?: (event: UIEvent) => void;
    onResize?: (event: ResizeEvent) => void;
} & ElementBaseProps;

export type ElementProps = BoxProps;
