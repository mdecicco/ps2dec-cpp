import { vec2, vec4 } from 'math-ext';

export class Vertex {
    position: vec4;
    color: vec4;
    uv: vec2;
    clipRectIndex: i32;

    constructor(position: vec4, color: vec4, uv?: vec2, clipRectIndex?: i32) {
        this.position = position;
        this.color = color;
        this.uv = uv || new vec2(0, 0);
        this.clipRectIndex = clipRectIndex || -1;
    }
}
