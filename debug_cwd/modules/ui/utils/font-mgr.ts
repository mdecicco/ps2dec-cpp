import { FontAtlas, FontGlyph, loadFont, loadFontWithCharset } from 'msdf';
import { CommandPool, LogicalDevice } from 'render';

import { Direction, GeometryType, TextGeometry, TextProperties, Vertex } from '../types';
import { Style } from '../renderer/style';
import { vec2, vec4 } from 'math-ext';
import { VertexArray } from './vertex-array';

export type FontFamilyOptions = {
    name: string;
    filePath: string;
    sdfFactorMin?: f32;
    sdfFactorMax?: f32;
    codepoints?: (u32 | string)[];
};

type GlyphRect = {
    x: f32;
    y: f32;
    width: f32;
    height: f32;
    u0: f32;
    v0: f32;
    u1: f32;
    v1: f32;
    isWhitespace: boolean;
};

type MeasureTextResult = {
    width: f32;
    height: f32;
    cursorAfter: vec2;
    glyphRects: GlyphRect[];
};

export class FontFamily {
    private m_atlas: FontAtlas | null;
    private m_name: string;
    private m_filePath: string;
    private m_sdfFactors: [f32, f32];
    private m_codepoints: u32[];
    private m_glyphs: Map<u32, FontGlyph>;
    private m_kerning: Map<u32, Map<u32, f32>>;
    private m_ascender: f32;
    private m_descender: f32;
    private m_emSize: f32;

    constructor(options: FontFamilyOptions) {
        this.m_atlas = null;
        this.m_name = options.name;
        this.m_filePath = options.filePath;
        this.m_sdfFactors = [Math.max(options.sdfFactorMin ?? 0.0, 0.0), Math.min(options.sdfFactorMax ?? 1.0, 1.0)];
        this.m_codepoints = options.codepoints
            ? options.codepoints.map(c => (typeof c === 'string' ? c.charCodeAt(0) : c))
            : [];
        this.m_glyphs = new Map<u32, FontGlyph>();
        this.m_kerning = new Map<u32, Map<u32, f32>>();
        this.m_ascender = 0.0;
        this.m_descender = 0.0;
        this.m_emSize = 0.0;
    }

    get isLoaded() {
        return this.m_atlas !== null;
    }

    get atlas() {
        return this.m_atlas;
    }

    get name() {
        return this.m_name;
    }

    get filePath() {
        return this.m_filePath;
    }

    get sdfFactorMin() {
        return this.m_sdfFactors[0];
    }

    get sdfFactorMax() {
        return this.m_sdfFactors[1];
    }

    get pixelRange() {
        return this.m_atlas?.pixelRange ?? 0.0;
    }

    init(device: LogicalDevice, cmdPool: CommandPool) {
        if (this.m_atlas !== null) return;

        if (this.m_codepoints.length > 0) {
            this.m_atlas = loadFontWithCharset(this.m_filePath, this.m_codepoints, device, cmdPool)!;
        } else {
            this.m_atlas = loadFont(this.m_filePath, device, cmdPool)!;
        }

        this.m_ascender = this.m_atlas.ascender;
        this.m_descender = this.m_atlas.descender;
        this.m_emSize = this.m_atlas.emSize;

        for (const glyph of this.m_atlas.glyphs) {
            this.m_glyphs.set(glyph.codepoint, glyph);
        }

        for (const kerning of this.m_atlas.kerning) {
            let kerningMap: Map<u32, f32>;
            if (!this.m_kerning.has(kerning.codepoint1)) {
                kerningMap = new Map<u32, f32>();
                this.m_kerning.set(kerning.codepoint1, kerningMap);
            } else {
                kerningMap = this.m_kerning.get(kerning.codepoint1)!;
            }

            kerningMap.set(kerning.codepoint2, kerning.kerning);
        }
    }

    shutdown() {
        if (this.m_atlas === null) return;
        this.m_atlas = null;
    }

    supports(textProps: TextProperties): boolean {
        // todo: might some fonts not support text properties?
        return true;
    }

    private getGlyphRect(
        cursor: vec2,
        codepoint: u32,
        nextCodepoint: u32 | null,
        isFirst: boolean,
        properties: TextProperties
    ): GlyphRect | null {
        const glyph = this.m_glyphs.get(codepoint);
        if (!glyph) return null;

        const fontHeight = this.m_ascender - this.m_descender;
        const invFontScale = 1.0 / fontHeight;
        const scale = invFontScale * properties.fontSize;
        let advance = glyph.advance * this.m_emSize * scale;

        if (nextCodepoint !== null) {
            const kerningMap = this.m_kerning.get(codepoint);
            if (kerningMap) {
                const kerning = kerningMap.get(nextCodepoint);
                if (kerning) {
                    advance += kerning * this.m_emSize * scale;
                }
            }
        }

        if (glyph.width === 0 || glyph.height === 0) {
            return {
                x: cursor.x,
                y: cursor.y,
                width: advance,
                height: 0,
                u0: 0,
                v0: 0,
                u1: 0,
                v1: 0,
                isWhitespace: true
            };
        }

        let width = glyph.width * this.m_emSize;
        let height = glyph.height * this.m_emSize;
        let x = isFirst ? 0 : glyph.bearingX * this.m_emSize;
        let y = -glyph.bearingY * this.m_emSize + this.m_ascender + this.m_descender;

        y = -glyph.bearingY * this.m_emSize + this.m_ascender;

        width *= scale;
        height *= scale;
        x *= scale;
        y *= scale;

        y += properties.lineHeight * 0.5;
        y -= fontHeight * scale * 0.5;

        x += cursor.x;
        y += cursor.y;

        return { x, y, width, height, u0: glyph.u0, v0: glyph.v0, u1: glyph.u1, v1: glyph.v1, isWhitespace: false };
    }

    private measureText(cursor: vec2, text: string, isFirst: boolean, properties: TextProperties): MeasureTextResult {
        const result: MeasureTextResult = {
            width: 0,
            height: 0,
            cursorAfter: new vec2(cursor.x, cursor.y),
            glyphRects: []
        };

        for (let i = 0; i < text.length; i++) {
            const codepoint = text.charCodeAt(i);
            const nextCodepoint = i < text.length - 1 ? text.charCodeAt(i + 1) : null;

            const glyphRect = this.getGlyphRect(
                result.cursorAfter,
                codepoint,
                nextCodepoint,
                isFirst && i === 0,
                properties
            );
            if (!glyphRect) continue;

            const { width, height } = glyphRect;

            result.width += width;
            if (height > result.height) result.height = height;

            result.cursorAfter.x += width;

            if (glyphRect.isWhitespace) continue;
            result.glyphRects.push(glyphRect);
        }

        return result;
    }

    private renderSingleGlyph(
        glyphRect: GlyphRect,
        geometry: TextGeometry,
        properties: TextProperties,
        instanceIdx: u32
    ) {
        if (!this.m_atlas) return;

        const z = 0.1;
        const { x, y, width, height, u0, v0, u1, v1, isWhitespace } = glyphRect;

        if (isWhitespace) return;

        const { r, g, b, a } = properties.color;

        geometry.vertices.push(x, y, z, r, g, b, a, u0, v1, instanceIdx);
        geometry.vertices.push(x + width, y, z, r, g, b, a, u1, v1, instanceIdx);
        geometry.vertices.push(x + width, y + height, z, r, g, b, a, u1, v0, instanceIdx);
        geometry.vertices.push(x, y, z, r, g, b, a, u0, v1, instanceIdx);
        geometry.vertices.push(x + width, y + height, z, r, g, b, a, u1, v0, instanceIdx);
        geometry.vertices.push(x, y + height, z, r, g, b, a, u0, v0, instanceIdx);
    }

    createGlyphGeometry(codepoint: u32, properties: TextProperties, instanceIdx: u32): TextGeometry | null {
        const cursor = new vec2(0, 0);

        const glyphRect = this.getGlyphRect(cursor, codepoint, null, true, properties);
        if (!glyphRect) return null;

        const { x, y, width, height } = glyphRect;

        const geometry: TextGeometry = {
            type: GeometryType.Text,
            text: String.fromCharCode(codepoint),
            textProperties: properties,
            width: x + width,
            height: y + height,
            offsetPosition: new vec4(),
            vertices: new VertexArray()
        };

        geometry.vertices.init(6);

        this.renderSingleGlyph(glyphRect, geometry, properties, instanceIdx);

        return geometry;
    }

    createTextGeometry(text: string, properties: TextProperties, instanceIdx: u32): TextGeometry {
        const geometry: TextGeometry = {
            type: GeometryType.Text,
            text,
            textProperties: properties,
            width: 0,
            height: 0,
            offsetPosition: new vec4(),
            vertices: new VertexArray()
        };

        geometry.vertices.init(6 * text.length);

        const cursor = new vec2(0, 0);
        const words = text.split(' ');

        const spaceWidth = this.getGlyphRect(cursor, 32, null, false, properties)?.width ?? 0;

        let wordIdx = 0;
        let isLineStart = true;
        while (wordIdx < words.length) {
            const word = words[wordIdx];

            if (!isLineStart) {
                cursor.x += spaceWidth;
                if (cursor.x > properties.maxWidth) {
                    cursor.x = 0;
                    cursor.y += properties.lineHeight;
                    isLineStart = true;
                    continue;
                }
            }

            const result = this.measureText(cursor, word, wordIdx === 0, properties);

            if (result.cursorAfter.x > properties.maxWidth) {
                cursor.x = 0;
                cursor.y += properties.lineHeight;
                isLineStart = true;

                if (result.width > properties.maxWidth) {
                    // text could not possibly fit
                    break;
                }

                continue;
            }

            cursor.x = result.cursorAfter.x;
            cursor.y = result.cursorAfter.y;
            if (cursor.x > geometry.width) geometry.width = cursor.x;
            if (cursor.y > geometry.height) geometry.height = cursor.y;

            for (const glyphRect of result.glyphRects) {
                this.renderSingleGlyph(glyphRect, geometry, properties, instanceIdx);
            }

            wordIdx++;
            isLineStart = false;
        }

        return geometry;
    }
}

export class FontManager {
    private m_fontFamilies: Map<string, FontFamily[]>;
    private m_defaultFont: FontFamily | null;

    constructor() {
        this.m_fontFamilies = new Map<string, FontFamily[]>();
        this.m_defaultFont = null;
    }

    init(device: LogicalDevice, cmdPool: CommandPool) {
        for (const families of this.m_fontFamilies.values()) {
            for (const family of families) {
                console.log(`Initializing font family: ${family.name}`);
                family.init(device, cmdPool);
            }
        }
    }

    shutdown() {
        for (const families of this.m_fontFamilies.values()) {
            for (const family of families) {
                console.log(`Shutting down font family: ${family.name}`);
                family.shutdown();
            }
        }
    }

    addFontFamily(fontFamily: FontFamilyOptions, isDefault: boolean = false) {
        let families = this.m_fontFamilies.get(fontFamily.name);
        if (!families) {
            families = [];
            this.m_fontFamilies.set(fontFamily.name, families);
        }

        const family = new FontFamily(fontFamily);
        families.push(family);

        if (isDefault) this.m_defaultFont = family;

        return family;
    }

    findFontFamily(textProps: TextProperties): FontFamily | null {
        const families = this.m_fontFamilies.get(textProps.fontFamily);
        if (!families) return this.m_defaultFont;

        for (const family of families) {
            if (family.supports(textProps)) return family;
        }

        return this.m_defaultFont;
    }

    static extractTextProperties(style: Style, maxWidth: number, maxHeight: number): TextProperties {
        const properties: TextProperties = {
            fontSize: style.computedFontSize,
            fontFamily: style.fontFamily,
            fontWeight: style.fontWeight,
            fontStyle: style.fontStyle,
            textAlign: style.textAlign,
            textDecoration: style.textDecoration,
            whiteSpace: style.whiteSpace,
            wordBreak: style.wordBreak,
            wordWrap: style.wordWrap,
            textOverflow: style.textOverflow,
            maxWidth: maxWidth,
            maxHeight: maxHeight,
            lineHeight: style.resolveSize(style.lineHeight, Direction.Vertical),
            color: style.color
        };

        return properties;
    }
}
