import { FontAtlas, FontGlyph, loadFont, loadFontWithCharset } from 'msdf';
import { CommandPool, LogicalDevice } from 'render';

import {
    Direction,
    GeometryType,
    TextGeometry,
    TextProperties,
    WhiteSpace,
    WordBreak,
    WordWrap,
    TextAlign,
    TextOverflow
} from '../types';
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

enum TokenType {
    Word = 0,
    Space = 1,
    Newline = 2
}

type Token = {
    type: TokenType;
    text: string;
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

        const z = 0;
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

        const tokens = this.tokenize(text, properties.whiteSpace);

        type Line = { glyphs: GlyphRect[]; width: number; cursorY: number };
        const lines: Line[] = [];
        let currentLine: Line = { glyphs: [], width: 0, cursorY: 0 };

        let cursor = new vec2(0, 0);
        let isLineStart = true;
        let isFirstContent = true; // first non-space content in the whole text

        const wrappingAllowed = properties.whiteSpace !== WhiteSpace.Nowrap && properties.whiteSpace !== WhiteSpace.Pre;
        const preservesSpaces =
            properties.whiteSpace === WhiteSpace.Pre || properties.whiteSpace === WhiteSpace.PreWrap;
        const allowBreakWithinWord =
            wrappingAllowed &&
            (properties.wordBreak === WordBreak.BreakAll ||
                properties.wordBreak === WordBreak.BreakWord ||
                properties.wordWrap === WordWrap.BreakWord);

        const pushLine = () => {
            lines.push(currentLine);
            cursor.x = 0;
            cursor.y += properties.lineHeight;
            currentLine = { glyphs: [], width: 0, cursorY: cursor.y };
            isLineStart = true;
        };

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            if (token.type === TokenType.Newline) {
                pushLine();
                continue;
            }

            if (token.type === TokenType.Space) {
                if (!preservesSpaces && isLineStart) continue;

                const result = this.measureText(cursor, token.text, false, properties);

                if (wrappingAllowed && result.cursorAfter.x > properties.maxWidth && !isLineStart) {
                    pushLine();
                    continue; // drop trailing space
                }

                // Accept advance; record a synthetic whitespace run to enable justify handling
                if (result.width > 0) {
                    const ws: GlyphRect = {
                        x: cursor.x,
                        y: cursor.y,
                        width: result.width,
                        height: 0,
                        u0: 0,
                        v0: 0,
                        u1: 0,
                        v1: 0,
                        isWhitespace: true
                    };
                    currentLine.glyphs.push(ws);
                }
                cursor.x = result.cursorAfter.x;
                cursor.y = result.cursorAfter.y;
                currentLine.width = cursor.x;
                isLineStart = false;
                continue;
            }

            // token.type === TokenType.Word
            const result = this.measureText(cursor, token.text, isFirstContent, properties);

            if (wrappingAllowed && result.cursorAfter.x > properties.maxWidth) {
                if (!isLineStart) pushLine();

                const retry = this.measureText(cursor, token.text, isFirstContent, properties);
                if (retry.cursorAfter.x > properties.maxWidth) {
                    if (allowBreakWithinWord) {
                        let remaining = token.text;
                        while (remaining.length > 0) {
                            const widthLeft = Math.max(0, properties.maxWidth - cursor.x);
                            const fit = this.fitPrefixByWidth(cursor, remaining, properties, widthLeft, isFirstContent);

                            if (fit.count === 0) {
                                if (!isLineStart) {
                                    pushLine();
                                    continue;
                                } else {
                                    const force = this.fitPrefixByWidth(
                                        cursor,
                                        remaining,
                                        properties,
                                        Number.MAX_SAFE_INTEGER,
                                        isFirstContent,
                                        1
                                    );
                                    for (const glyphRect of force.glyphs) currentLine.glyphs.push(glyphRect);
                                    cursor.x += force.width;
                                    currentLine.width = cursor.x;
                                    remaining = remaining.slice(force.count);
                                    isLineStart = false;
                                    isFirstContent = false;
                                    continue;
                                }
                            }

                            for (const glyphRect of fit.glyphs) currentLine.glyphs.push(glyphRect);
                            cursor.x += fit.width;
                            currentLine.width = cursor.x;
                            remaining = remaining.slice(fit.count);
                            isLineStart = false;
                            isFirstContent = false;

                            if (remaining.length > 0) pushLine();
                        }
                        continue;
                    } else {
                        // No breaking within words; place on this line beyond maxWidth
                        for (const glyphRect of retry.glyphRects) currentLine.glyphs.push(glyphRect);
                        cursor.x = retry.cursorAfter.x;
                        cursor.y = retry.cursorAfter.y;
                        currentLine.width = cursor.x;
                        isLineStart = false;
                        isFirstContent = false;
                        continue;
                    }
                }

                // Accept retry on new line
                for (const glyphRect of retry.glyphRects) currentLine.glyphs.push(glyphRect);
                cursor.x = retry.cursorAfter.x;
                cursor.y = retry.cursorAfter.y;
                currentLine.width = cursor.x;
                isLineStart = false;
                isFirstContent = false;
                continue;
            }

            // Accept placement on this line
            for (const glyphRect of result.glyphRects) currentLine.glyphs.push(glyphRect);
            cursor.x = result.cursorAfter.x;
            cursor.y = result.cursorAfter.y;
            currentLine.width = cursor.x;
            isLineStart = false;
            if (token.text.trim().length > 0) isFirstContent = false;
        }

        // Push final line if any glyphs
        if (currentLine.glyphs.length > 0 || lines.length === 0) lines.push(currentLine);

        // Trim trailing whitespace in non-preserve modes so justify/alignment don't count it
        if (properties.whiteSpace !== WhiteSpace.Pre && properties.whiteSpace !== WhiteSpace.PreWrap) {
            for (let li = 0; li < lines.length; li++) {
                const line = lines[li];
                let idx = line.glyphs.length - 1;
                while (idx >= 0 && line.glyphs[idx].isWhitespace) {
                    line.glyphs.pop();
                    idx--;
                }
                if (line.glyphs.length > 0) {
                    const lastG = line.glyphs[line.glyphs.length - 1];
                    line.width = lastG.x + lastG.width;
                } else {
                    line.width = 0;
                }
            }
        }

        // Determine visible lines based on maxHeight
        let maxLines =
            properties.maxHeight > 0
                ? Math.max(
                      1,
                      Math.floor(
                          properties.lineHeight > 0
                              ? properties.maxHeight / properties.lineHeight
                              : Number.MAX_SAFE_INTEGER
                      )
                  )
                : Number.MAX_SAFE_INTEGER;
        const visibleCount = Math.min(lines.length, maxLines);

        // Apply textOverflow=ellipsis on the last visible line if needed (truncated by height or width overflow on last line)
        if (properties.textOverflow === TextOverflow.Ellipsis && visibleCount > 0) {
            const lastIdx = visibleCount - 1;
            const last = lines[lastIdx];

            // Measure ellipsis width (try '…', fallback to '...')
            const ellipsisTry = this.measureText(new vec2(last.width, last.cursorY), '…', false, properties);
            const useFallback = ellipsisTry.glyphRects.length === 0;
            const ellipsisMeasure = useFallback
                ? this.measureText(new vec2(last.width, last.cursorY), '...', false, properties)
                : ellipsisTry;
            const ellipsisWidth = ellipsisMeasure.width;

            let needsEllipsis = lines.length > visibleCount || last.width > properties.maxWidth;
            if (needsEllipsis && ellipsisWidth > 0) {
                // Trim trailing whitespace glyphs
                while (last.glyphs.length > 0 && last.glyphs[last.glyphs.length - 1].isWhitespace) last.glyphs.pop();

                // Trim until ellipsis fits within maxWidth
                while (last.glyphs.length > 0 && last.width + ellipsisWidth > properties.maxWidth) {
                    const g = last.glyphs.pop()!;
                    // Recompute width to the new last content glyph
                    if (last.glyphs.length > 0) {
                        const lastG = last.glyphs[last.glyphs.length - 1];
                        last.width = lastG.x + lastG.width;
                    } else {
                        last.width = 0;
                    }
                }

                // Append ellipsis glyphs at the end position
                for (const g of ellipsisMeasure.glyphRects) last.glyphs.push(g);
                last.width += ellipsisMeasure.width;

                // Truncate lines by height
                lines.length = visibleCount;
            }
        } else {
            // If clip/unset, still truncate by height
            if (lines.length > visibleCount) lines.length = visibleCount;
        }

        // Compute offsets and justify extras
        const offsets: number[] = new Array(lines.length);
        const gapExtra: number[] = new Array(lines.length).fill(0);
        for (let li = 0; li < lines.length; li++) {
            const line = lines[li];

            if (properties.textAlign === TextAlign.Justify && li < lines.length - 1) {
                const extra = Math.max(0, properties.maxWidth - line.width);
                if (extra > 0) {
                    // Count eligible gaps: groups of whitespace between non-whitespace on both sides
                    let gaps = 0;
                    let hasWordBefore = false;
                    let inSpace = false;
                    for (let gi = 0; gi < line.glyphs.length; gi++) {
                        const g = line.glyphs[gi];
                        if (g.isWhitespace) {
                            if (hasWordBefore) inSpace = true;
                        } else {
                            if (inSpace) {
                                gaps++;
                                inSpace = false;
                            }
                            hasWordBefore = true;
                        }
                    }
                    if (gaps > 0) gapExtra[li] = extra / gaps;
                }
                offsets[li] = 0; // justify starts at left edge
            } else {
                switch (properties.textAlign) {
                    case TextAlign.Center:
                        offsets[li] = Math.max(0, (properties.maxWidth - line.width) * 0.5);
                        break;
                    case TextAlign.Right:
                        offsets[li] = Math.max(0, properties.maxWidth - line.width);
                        break;
                    default:
                        offsets[li] = 0;
                        break;
                }
            }
            if (geometry.width < line.width + offsets[li]) geometry.width = line.width + offsets[li];
        }

        // Render with offsets and justify gap expansion
        for (let li = 0; li < lines.length; li++) {
            const line = lines[li];
            const dxBase = offsets[li];
            const perGap = gapExtra[li];
            let added = 0;
            let seenWord = false;
            let inSpace = false;

            for (let gi = 0; gi < line.glyphs.length; gi++) {
                const g = line.glyphs[gi];
                if (g.isWhitespace) {
                    if (seenWord) inSpace = true;
                    continue; // skip rendering whitespace
                }
                if (inSpace && perGap > 0) {
                    added += perGap;
                    inSpace = false;
                }
                const shifted: GlyphRect = {
                    x: g.x + dxBase + added,
                    y: g.y,
                    width: g.width,
                    height: g.height,
                    u0: g.u0,
                    v0: g.v0,
                    u1: g.u1,
                    v1: g.v1,
                    isWhitespace: g.isWhitespace
                };
                this.renderSingleGlyph(shifted, geometry, properties, instanceIdx);
                seenWord = true;
            }
        }

        geometry.height = lines.length * properties.lineHeight;
        return geometry;
    }

    private tokenize(text: string, mode: WhiteSpace): Token[] {
        // Build tokens according to CSS white-space rules (subset for step 1)
        const tokens: Token[] = [];

        if (mode === WhiteSpace.Pre) {
            // Preserve all characters, break on \n, group spaces/tabs as space tokens
            let i = 0;
            while (i < text.length) {
                const ch = text[i];
                if (ch === '\n') {
                    tokens.push({ type: TokenType.Newline, text: '\n' });
                    i++;
                } else if (ch === ' ' || ch === '\t') {
                    let j = i + 1;
                    while (j < text.length && (text[j] === ' ' || text[j] === '\t')) j++;
                    tokens.push({ type: TokenType.Space, text: text.slice(i, j).replace(/\t/g, ' ') });
                    i = j;
                } else {
                    let j = i + 1;
                    while (j < text.length && text[j] !== ' ' && text[j] !== '\t' && text[j] !== '\n') j++;
                    tokens.push({ type: TokenType.Word, text: text.slice(i, j) });
                    i = j;
                }
            }
            return tokens;
        }

        if (mode === WhiteSpace.PreWrap) {
            // Preserve spaces and newlines; allow wrapping later
            let i = 0;
            while (i < text.length) {
                const ch = text[i];
                if (ch === '\n') {
                    tokens.push({ type: TokenType.Newline, text: '\n' });
                    i++;
                } else if (ch === ' ' || ch === '\t') {
                    let j = i + 1;
                    while (j < text.length && (text[j] === ' ' || text[j] === '\t')) j++;
                    tokens.push({ type: TokenType.Space, text: text.slice(i, j).replace(/\t/g, ' ') });
                    i = j;
                } else {
                    let j = i + 1;
                    while (j < text.length && text[j] !== ' ' && text[j] !== '\t' && text[j] !== '\n') j++;
                    tokens.push({ type: TokenType.Word, text: text.slice(i, j) });
                    i = j;
                }
            }
            return tokens;
        }

        if (mode === WhiteSpace.PreLine) {
            // Collapse spaces/tabs to single spaces, but preserve newlines as breaks
            const lines = text.split('\n');
            for (let li = 0; li < lines.length; li++) {
                const line = lines[li].replace(/[\t ]+/g, ' ');
                const parts = line.split(' ');
                for (let pi = 0; pi < parts.length; pi++) {
                    const part = parts[pi];
                    if (part.length === 0) continue;
                    if (pi > 0) tokens.push({ type: TokenType.Space, text: ' ' });
                    tokens.push({ type: TokenType.Word, text: part });
                }
                if (li < lines.length - 1) tokens.push({ type: TokenType.Newline, text: '\n' });
            }
            return tokens;
        }

        // Normal and Nowrap: collapse all whitespace (including newlines) to single spaces
        {
            const collapsed = text.replace(/\s+/g, ' ').trim();
            if (collapsed.length === 0) return tokens;
            const parts = collapsed.split(' ');
            for (let i = 0; i < parts.length; i++) {
                if (i > 0) tokens.push({ type: TokenType.Space, text: ' ' });
                tokens.push({ type: TokenType.Word, text: parts[i] });
            }
            return tokens;
        }
    }

    private fitPrefixByWidth(
        originCursor: vec2,
        text: string,
        properties: TextProperties,
        maxAdvance: number,
        isFirstInText: boolean,
        forceMinChars: number | null = null
    ): { count: number; width: number; glyphs: GlyphRect[] } {
        // Iterate characters, using getGlyphRect to respect kerning, until exceeding maxAdvance
        let accWidth = 0;
        let glyphs: GlyphRect[] = [];
        let count = 0;
        let cursor = new vec2(originCursor.x, originCursor.y);

        for (let i = 0; i < text.length; i++) {
            const codepoint = text.charCodeAt(i);
            const nextCodepoint = i < text.length - 1 ? text.charCodeAt(i + 1) : null;
            const isFirst = isFirstInText && i === 0;
            const glyphRect = this.getGlyphRect(cursor, codepoint, nextCodepoint, isFirst, properties);
            if (!glyphRect) continue;
            const advance = glyphRect.width;

            if (maxAdvance >= 0 && accWidth + advance > maxAdvance) {
                if (forceMinChars !== null && count < forceMinChars) {
                    glyphs.push(glyphRect);
                    accWidth += advance;
                    count++;
                }
                break;
            }

            glyphs.push(glyphRect);
            accWidth += advance;
            count++;
            cursor.x += advance;
        }

        return { count, width: accWidth, glyphs };
    }
}

export class FontManager {
    private static m_defaultFontSize: number = 16;
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

    static set defaultFontSize(size: number) {
        this.m_defaultFontSize = size;
    }

    static get defaultFontSize() {
        return this.m_defaultFontSize;
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
