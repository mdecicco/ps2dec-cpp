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

export type GeometryVertex = {
    position: { x: f32; y: f32; z?: f32 };
    color?: { r: f32; g: f32; b: f32; a?: f32 };
    uv?: { u: f32; v: f32 };
};

export type GeometryProps = {
    /**
     * Must be a multiple of 3. Every 3 vertices form a triangle.
     * The front-face of the triangle must have the vertices in clockwise order.
     * Positions are relative to wherever the layout algorithm chooses to place this element
     */
    vertices: GeometryVertex[];

    /**
     * The version of the geometry.
     * This is used to determine if the geometry has changed since the last render
     */
    version: u32;
} & ElementBaseProps;

export type ElementProps = BoxProps | GeometryProps;
