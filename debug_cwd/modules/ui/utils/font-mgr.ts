import { FontAtlas, FontGlyph, loadFont, loadFontWithCharset } from 'msdf';
import { CommandPool, LogicalDevice } from 'render';

import { Direction, GeometryType, TextGeometry, TextProperties, Vertex } from '../types';
import { Style } from '../renderer/style';
import { vec2, vec4 } from 'math-ext';

export type FontFamilyOptions = {
    name: string;
    filePath: string;
    sdfFactorMin?: f32;
    sdfFactorMax?: f32;
    codepoints?: (u32 | string)[];
};

export class FontFamily {
    private m_atlas: FontAtlas | null;
    private m_name: string;
    private m_filePath: string;
    private m_sdfFactors: [f32, f32];
    private m_codepoints: u32[];
    private m_glyphs: Map<u32, FontGlyph>;
    private m_kerning: Map<u32, Map<u32, f32>>;

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

    private renderSingleGlyph(
        cursor: vec2,
        geometry: TextGeometry,
        codepoint: u32,
        nextCodepoint: u32 | null,
        properties: TextProperties
    ) {
        if (!this.m_atlas) return;

        const glyph = this.m_glyphs.get(codepoint);
        if (!glyph) return;

        const wFrac = glyph.u1 - glyph.u0;
        const hFrac = glyph.v1 - glyph.v0;
        const fontHeight = this.m_atlas.ascender - this.m_atlas.descender;
        const invFontScale = 1.0 / fontHeight;
        let advance = glyph.advance * this.m_atlas.emSize * invFontScale * properties.fontSize;

        if (nextCodepoint !== null) {
            const kerningMap = this.m_kerning.get(codepoint);
            if (kerningMap) {
                const kerning = kerningMap.get(nextCodepoint);
                if (kerning) {
                    advance += kerning * this.m_atlas.emSize * invFontScale * properties.fontSize;
                }
            }
        }

        if (wFrac === 0 || hFrac === 0) {
            cursor.x += advance;
            return;
        }

        let width = glyph.width * this.m_atlas.emSize;
        let height = glyph.height * this.m_atlas.emSize;
        let x = glyph.bearingX * this.m_atlas.emSize;
        let y = -glyph.bearingY * this.m_atlas.emSize + this.m_atlas.ascender + this.m_atlas.descender;

        width *= invFontScale * properties.fontSize;
        height *= invFontScale * properties.fontSize;
        x *= invFontScale * properties.fontSize;
        y *= invFontScale * properties.fontSize;

        x += cursor.x;
        y += cursor.y;

        const p0 = new vec4(x, y, 0.1, 0.0);
        const p1 = new vec4(x + width, y, 0.1, 0.0);
        const p2 = new vec4(x + width, y + height, 0.1, 0.0);
        const p3 = new vec4(x, y + height, 0.1, 0.0);
        const uv0 = new vec2(glyph.u0, glyph.v1);
        const uv1 = new vec2(glyph.u1, glyph.v1);
        const uv2 = new vec2(glyph.u1, glyph.v0);
        const uv3 = new vec2(glyph.u0, glyph.v0);

        if (x + width > geometry.width) geometry.width = x + width;
        if (y + height > geometry.height) geometry.height = y + height;

        const color = properties.color;

        geometry.vertices.push(new Vertex(p0, new vec4(color.r, color.g, color.b, color.a), uv0));
        geometry.vertices.push(new Vertex(p1, new vec4(color.r, color.g, color.b, color.a), uv1));
        geometry.vertices.push(new Vertex(p2, new vec4(color.r, color.g, color.b, color.a), uv2));
        geometry.vertices.push(new Vertex(p0, new vec4(color.r, color.g, color.b, color.a), uv0));
        geometry.vertices.push(new Vertex(p2, new vec4(color.r, color.g, color.b, color.a), uv2));
        geometry.vertices.push(new Vertex(p3, new vec4(color.r, color.g, color.b, color.a), uv3));

        cursor.x += advance;
    }

    createGlyphGeometry(codepoint: u32, properties: TextProperties): TextGeometry {
        const geometry: TextGeometry = {
            type: GeometryType.Text,
            text: String.fromCharCode(codepoint),
            textProperties: properties,
            width: 0,
            height: 0,
            offsetPosition: new vec4(),
            vertices: []
        };

        this.renderSingleGlyph(new vec2(0, 0), geometry, codepoint, null, properties);

        return geometry;
    }

    createTextGeometry(text: string, properties: TextProperties): TextGeometry {
        const geometry: TextGeometry = {
            type: GeometryType.Text,
            text,
            textProperties: properties,
            width: 0,
            height: 0,
            offsetPosition: new vec4(),
            vertices: []
        };

        const cursor = new vec2(0, 0);

        for (let i = 0; i < text.length; i++) {
            const codepoint = text.charCodeAt(i);
            const nextCodepoint = i < text.length - 1 ? text.charCodeAt(i + 1) : null;
            this.renderSingleGlyph(cursor, geometry, codepoint, nextCodepoint, properties);
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
            maxWidth: maxWidth,
            maxHeight: maxHeight,
            lineHeight: style.resolveSize(style.lineHeight, Direction.Vertical),
            color: style.color
        };

        return properties;
    }
}
