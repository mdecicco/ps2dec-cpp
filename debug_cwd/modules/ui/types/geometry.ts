import { vec4 } from 'math-ext';
import { BorderStyle, ClientRect, Color, FontStyle, Overflow, TextAlign } from './style';
import { Vertex } from './vertex';
import { GeometryVertex } from './elements';

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
    vertices: Vertex[];
};

export type BoxProperties = {
    rect: ClientRect;
    scrollX: f32;
    scrollY: f32;
    contentWidth: f32;
    contentHeight: f32;
    borderWidth: f32;
    borderColor: Color;
    borderStyle: BorderStyle;
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
    vertices: Vertex[];
};

export type CustomGeometry = {
    type: GeometryType.Custom;
    version: u32;
    offsetPosition: vec4;
    width: f32;
    height: f32;
    vertices: GeometryVertex[];
};

export type Geometry = TextGeometry | BoxGeometry | CustomGeometry;
