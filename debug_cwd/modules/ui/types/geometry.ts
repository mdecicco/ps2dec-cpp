import { vec4 } from 'math-ext';
import { BorderStyle, ClientRect, Color, FontStyle, Overflow, TextAlign } from './style';
import { VertexArray } from '../utils/vertex-array';

export enum Direction {
    Horizontal = 0,
    Vertical = 1
}

export enum GeometryType {
    Box = 0,
    Text = 1,
    Custom = 2
}

export type TextProperties = {
    fontSize: f32;
    fontFamily: string;
    fontWeight: f32;
    fontStyle: FontStyle;
    textAlign: TextAlign;
    maxWidth: f32;
    maxHeight: f32;
    lineHeight: f32;
    color: Color;
};

export type TextGeometry = {
    type: GeometryType.Text;
    text: string;
    textProperties: TextProperties;
    width: f32;
    height: f32;
    offsetPosition: vec4;
    vertices: VertexArray;
};

export type BoxBorderProperties = {
    width: f32;
    color: Color;
    style: BorderStyle;
};

export type BoxProperties = {
    rect: ClientRect;
    scrollX: f32;
    scrollY: f32;
    contentWidth: f32;
    contentHeight: f32;
    borderTop: BoxBorderProperties;
    borderRight: BoxBorderProperties;
    borderBottom: BoxBorderProperties;
    borderLeft: BoxBorderProperties;
    overflow: Overflow;
    color: Color;
    verticalScrollBarHovered: boolean;
    horizontalScrollBarHovered: boolean;
    verticalScrollBarDragging: boolean;
    horizontalScrollBarDragging: boolean;
};

export type BoxGeometry = {
    type: GeometryType.Box;
    properties: BoxProperties;
    offsetPosition: vec4;
    vertices: VertexArray;
};

export type CustomGeometry = {
    type: GeometryType.Custom;
    version: u32;
    offsetPosition: vec4;
    width: f32;
    height: f32;
    vertices: VertexArray;
};

export type Geometry = TextGeometry | BoxGeometry | CustomGeometry;
