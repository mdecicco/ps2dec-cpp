import { vec4 } from 'math-ext';
import { BorderStyle, ClientRect, Color, FontStyle, TextAlign } from './style';
import { Vertex } from './vertex';

export enum GeometryType {
    Box = 0,
    Text = 1
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
    borderWidth: f32;
    borderColor: Color;
    style: BorderStyle;
    color: Color;
};

export type BoxGeometry = {
    type: GeometryType.Box;
    properties: BoxProperties;
    offsetPosition: vec4;
    vertices: Vertex[];
};

export type Geometry = TextGeometry | BoxGeometry;
