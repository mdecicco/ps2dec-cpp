import { FontAtlas, FontGlyph } from 'msdf';
import { vec2, vec4 } from 'math-ext';

import { DrawCall } from './draw-call';
import { TextGeometry, Vertex } from '../types';

export class TextDraw {
    private m_drawCall: DrawCall;
    private m_fontAtlas: FontAtlas;
    private m_fontName: string;
    private m_glyphs: Map<u32, FontGlyph>;
    private m_kerning: Map<u32, Map<u32, f32>>;

    constructor(drawCall: DrawCall, fontAtlas: FontAtlas, fontName: string) {
        this.m_drawCall = drawCall;
        this.m_fontAtlas = fontAtlas;
        this.m_fontName = fontName;
        this.m_glyphs = new Map<u32, FontGlyph>();
        this.m_kerning = new Map<u32, Map<u32, f32>>();

        for (const glyph of this.m_fontAtlas.glyphs) {
            this.m_glyphs.set(glyph.codepoint, glyph);
        }

        for (const kerning of this.m_fontAtlas.kerning) {
            let kerningMap: Map<u32, f32>;
            if (!this.m_kerning.has(kerning.codepoint1)) {
                kerningMap = new Map<u32, f32>();
                this.m_kerning.set(kerning.codepoint1, kerningMap);
            } else {
                kerningMap = this.m_kerning.get(kerning.codepoint1)!;
            }

            kerningMap.set(kerning.codepoint2, kerning.kerning);
        }

        this.m_drawCall.uniforms.isText = true;
        this.m_drawCall.uniforms.fontPixelRange = this.m_fontAtlas.pixelRange;
    }

    get fontName() {
        return this.m_fontName;
    }

    set drawCall(drawCall: DrawCall) {
        this.m_drawCall = drawCall;
        this.m_drawCall.uniforms.isText = true;
        this.m_drawCall.uniforms.fontPixelRange = this.m_fontAtlas.pixelRange;
    }

    get drawCall() {
        return this.m_drawCall;
    }

    resetUsedVertices() {
        this.m_drawCall.resetUsedVertices();
    }

    drawText(geometry: TextGeometry) {
        this.m_drawCall.addVertices(geometry.vertices);
    }
}
