import {
    AlignItems,
    Border,
    BorderStyle,
    Color,
    FlexDirection,
    FlexWrap,
    FontStyle,
    JustifyContent,
    Margin,
    Overflow,
    Padding,
    ParsedStyleAttributes,
    ParsedStyleProps,
    Position,
    Size,
    SizeInstruction,
    SizeUnit,
    StyleAttributes,
    StyleProps,
    TextAlign,
    TextDecoration,
    TextOverflow,
    WhiteSpace,
    WordBreak,
    WordWrap
} from '../types/style';

export class StyleParser {
    private m_index: number;
    private m_string: string;

    constructor(string: string) {
        this.m_index = 0;
        this.m_string = string;
    }

    get index(): number {
        return this.m_index;
    }

    get input(): string {
        return this.m_string;
    }

    get atEnd(): boolean {
        return this.m_index >= this.m_string.length;
    }

    get remainder(): string {
        return this.m_string.substring(this.m_index);
    }

    parseOpTail(expr: Size): boolean {
        if (this.atEnd) return false;

        const match = this.remainder.match(/^\s*([\+\-\*/])\s*/);
        if (!match) return false;

        const curIdx = this.m_index;
        this.m_index += match[0].length;

        const rhs = this.parseSize();
        if (!rhs) {
            this.m_index = curIdx;
            return false;
        }

        const instr = match[1];
        switch (instr) {
            case '+':
                expr.op = { instr: SizeInstruction.Add, value: rhs };
                break;
            case '-':
                expr.op = { instr: SizeInstruction.Sub, value: rhs };
                break;
            case '*':
                expr.op = { instr: SizeInstruction.Mul, value: rhs };
                break;
            case '/':
                expr.op = { instr: SizeInstruction.Div, value: rhs };
                break;
            default:
                this.m_index = curIdx;
                return false;
        }

        return true;
    }

    parseCalculatedSize(): Size | null {
        if (this.atEnd) return null;

        const match = this.remainder.match(/^\s*calc\((.*)\)\s*/);
        if (!match) return null;

        const p = new StyleParser(match[1]);

        const result = p.parseSize();
        if (!result) return null;

        if (!p.parseOpTail(result)) return null;

        this.m_index += match[0].length;
        return result;
    }

    parseSize(): Size | null {
        if (this.atEnd) return null;

        const calculatedSize = this.parseCalculatedSize();
        if (calculatedSize) return calculatedSize;

        const match = this.remainder.match(/^\s*(-?\d+(?:\.\d+)?)(px|%|em|rem|vw|vh)?\s*/);
        if (!match) return null;

        const value = parseFloat(match[1]);

        let unit: SizeUnit;
        switch (match[2]) {
            case 'px':
                unit = SizeUnit.px;
                break;
            case '%':
                unit = SizeUnit.percent;
                break;
            case 'em':
                unit = SizeUnit.em;
                break;
            case 'rem':
                unit = SizeUnit.rem;
                break;
            case 'vw':
                unit = SizeUnit.vw;
                break;
            case 'vh':
                unit = SizeUnit.vh;
                break;
            default:
                unit = SizeUnit.px;
                break;
        }

        this.m_index += match[0].length;
        return { value, unit, op: null };
    }

    parseWord(): string | null {
        if (this.atEnd) return null;

        const match = this.remainder.match(/^\s*([\w-]+)\s*/);
        if (!match) return null;

        const word = match[1];
        this.m_index += match[0].length;
        return word;
    }

    private decodeHexColorRGB(value: string): Color {
        const inv15 = 1.0 / 15.0;
        const r = parseInt(value.substring(0, 1), 16) * inv15;
        const g = parseInt(value.substring(1, 2), 16) * inv15;
        const b = parseInt(value.substring(2, 3), 16) * inv15;
        return { r, g, b, a: 1 };
    }

    private decodeHexColorRGBA(value: string): Color {
        const inv15 = 1.0 / 15.0;
        const r = parseInt(value.substring(0, 1), 16) * inv15;
        const g = parseInt(value.substring(1, 2), 16) * inv15;
        const b = parseInt(value.substring(2, 3), 16) * inv15;
        const a = parseInt(value.substring(3, 4), 16) * inv15;
        return { r, g, b, a };
    }

    private decodeHexColorRRGGBB(value: string): Color {
        const inv255 = 1.0 / 255.0;
        const r = parseInt(value.substring(0, 2), 16) * inv255;
        const g = parseInt(value.substring(2, 4), 16) * inv255;
        const b = parseInt(value.substring(4, 6), 16) * inv255;
        return { r, g, b, a: 1 };
    }

    private decodeHexColorRRGGBBAA(value: string): Color {
        const inv255 = 1.0 / 255.0;
        const r = parseInt(value.substring(0, 2), 16) * inv255;
        const g = parseInt(value.substring(2, 4), 16) * inv255;
        const b = parseInt(value.substring(4, 6), 16) * inv255;
        const a = parseInt(value.substring(6, 8), 16) * inv255;
        return { r, g, b, a };
    }

    parseHexColor(): Color | null {
        const match = this.remainder.match(/^\s*#([0-9a-fA-F]{3,8})\s*/);
        if (!match) return null;

        const hex = match[1];
        this.m_index += match[0].length;

        if (hex.length === 3) return this.decodeHexColorRGB(hex);
        if (hex.length === 4) return this.decodeHexColorRGBA(hex);
        if (hex.length === 6) return this.decodeHexColorRRGGBB(hex);
        if (hex.length === 8) return this.decodeHexColorRRGGBBAA(hex);

        return null;
    }

    parseRGBColor(): Color | null {
        if (this.atEnd) return null;

        const match = this.remainder.match(/^\s*rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)\s*/);
        if (!match) return null;

        const inv255 = 1.0 / 255.0;
        const r = parseInt(match[1]) * inv255;
        const g = parseInt(match[2]) * inv255;
        const b = parseInt(match[3]) * inv255;

        if (r > 1 || g > 1 || b > 1) return null;
        return { r, g, b, a: 1 };
    }

    parseRGBAColor(): Color | null {
        if (this.atEnd) return null;

        const match = this.remainder.match(/^\s*rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+(?:.\d+)?)\s*\)\s*/);
        if (!match) return null;

        const inv255 = 1.0 / 255.0;
        const r = parseInt(match[1]) * inv255;
        const g = parseInt(match[2]) * inv255;
        const b = parseInt(match[3]) * inv255;
        const a = parseFloat(match[4]);

        if (r > 1 || g > 1 || b > 1 || a > 1) return null;
        return { r, g, b, a };
    }

    parseColor(): Color | null {
        if (this.atEnd) return null;

        let color: Color | null = null;

        color = this.parseHexColor();
        if (color) return color;

        color = this.parseRGBColor();
        if (color) return color;

        color = this.parseRGBAColor();
        if (color) return color;

        return null;
    }

    parsePosition(): Position | null {
        const word = this.parseWord();
        if (!word) return null;

        switch (word) {
            case 'static':
                return Position.Static;
            case 'relative':
                return Position.Relative;
            case 'absolute':
                return Position.Absolute;
            case 'fixed':
                return Position.Fixed;
            case 'sticky':
                return Position.Sticky;
            default:
        }

        return null;
    }

    parseFlexDirection(): FlexDirection | null {
        const word = this.parseWord();
        if (!word) return null;

        switch (word) {
            case 'row':
                return FlexDirection.Row;
            case 'column':
                return FlexDirection.Column;
            default:
        }

        return null;
    }

    parseJustifyContent(): JustifyContent | null {
        const word = this.parseWord();
        if (!word) return null;

        switch (word) {
            case 'flex-start':
                return JustifyContent.FlexStart;
            case 'flex-end':
                return JustifyContent.FlexEnd;
            case 'center':
                return JustifyContent.Center;
            case 'space-between':
                return JustifyContent.SpaceBetween;
            case 'space-around':
                return JustifyContent.SpaceAround;
            case 'space-evenly':
                return JustifyContent.SpaceEvenly;
            default:
        }

        return null;
    }

    parseAlignItems(): AlignItems | null {
        const word = this.parseWord();
        if (!word) return null;

        switch (word) {
            case 'flex-start':
                return AlignItems.FlexStart;
            case 'flex-end':
                return AlignItems.FlexEnd;
            case 'center':
                return AlignItems.Center;
            case 'stretch':
                return AlignItems.Stretch;
            case 'baseline':
                return AlignItems.Baseline;
            default:
        }

        return null;
    }

    parseFlexWrap(): FlexWrap | null {
        const word = this.parseWord();
        if (!word) return null;

        switch (word) {
            case 'nowrap':
                return FlexWrap.NoWrap;
            case 'wrap':
                return FlexWrap.Wrap;
            case 'wrap-reverse':
                return FlexWrap.WrapReverse;
            default:
        }

        return null;
    }

    parseFontStyle(): FontStyle | null {
        const word = this.parseWord();
        if (!word) return null;

        switch (word) {
            case 'normal':
                return FontStyle.Normal;
            case 'italic':
                return FontStyle.Italic;
            case 'oblique':
                return FontStyle.Oblique;
            default:
        }

        return null;
    }

    parseTextAlign(): TextAlign | null {
        const word = this.parseWord();
        if (!word) return null;

        switch (word) {
            case 'left':
                return TextAlign.Left;
            case 'center':
                return TextAlign.Center;
            case 'right':
                return TextAlign.Right;
            case 'justify':
                return TextAlign.Justify;
            default:
        }

        return null;
    }

    parseTextDecoration(): TextDecoration | null {
        const word = this.parseWord();
        if (!word) return null;

        switch (word) {
            case 'none':
                return TextDecoration.None;
            case 'underline':
                return TextDecoration.Underline;
            case 'overline':
                return TextDecoration.Overline;
            case 'line-through':
                return TextDecoration.LineThrough;
            default:
        }

        return null;
    }

    parseWhiteSpace(): WhiteSpace | null {
        const word = this.parseWord();
        if (!word) return null;

        switch (word) {
            case 'normal':
                return WhiteSpace.Normal;
            case 'nowrap':
                return WhiteSpace.Nowrap;
            case 'pre':
                return WhiteSpace.Pre;
            case 'pre-wrap':
                return WhiteSpace.PreWrap;
            case 'pre-line':
                return WhiteSpace.PreLine;
            default:
        }

        return null;
    }

    parseWordBreak(): WordBreak | null {
        const word = this.parseWord();
        if (!word) return null;

        switch (word) {
            case 'normal':
                return WordBreak.Normal;
            case 'break-all':
                return WordBreak.BreakAll;
            case 'break-word':
                return WordBreak.BreakWord;
            default:
        }

        return null;
    }

    parseWordWrap(): WordWrap | null {
        const word = this.parseWord();
        if (!word) return null;

        switch (word) {
            case 'normal':
                return WordWrap.Normal;
            case 'break-word':
                return WordWrap.BreakWord;
            default:
        }

        return null;
    }

    parseOverflow(): Overflow | null {
        const word = this.parseWord();
        if (!word) return null;

        switch (word) {
            case 'visible':
                return Overflow.Visible;
            case 'hidden':
                return Overflow.Hidden;
            case 'scroll':
                return Overflow.Scroll;
            default:
        }

        return null;
    }

    parseTextOverflow(): TextOverflow | null {
        const word = this.parseWord();
        if (!word) return null;

        switch (word) {
            case 'clip':
                return TextOverflow.Clip;
            case 'ellipsis':
                return TextOverflow.Ellipsis;
            case 'unset':
                return TextOverflow.Unset;
            default:
        }

        return null;
    }

    parseBorderStyle(): BorderStyle | null {
        const word = this.parseWord();
        if (!word) return null;

        switch (word) {
            case 'none':
                return BorderStyle.None;
            case 'hidden':
                return BorderStyle.Hidden;
            case 'dotted':
                return BorderStyle.Dotted;
            case 'dashed':
                return BorderStyle.Dashed;
            case 'solid':
                return BorderStyle.Solid;
            case 'double':
                return BorderStyle.Double;
            default:
        }

        return null;
    }

    parseCursor(): CursorIcon | null {
        const word = this.parseWord();
        if (!word) return null;

        switch (word) {
            case 'default':
                return CursorIcon.Default;
            case 'arrow':
                return CursorIcon.Arrow;
            case 'crosshair':
                return CursorIcon.Crosshair;
            case 'pointer':
                return CursorIcon.Hand;
            case 'i-beam':
                return CursorIcon.IBeam;
            case 'size-all':
                return CursorIcon.SizeAll;
            case 'size-nesw':
                return CursorIcon.SizeNESW;
            case 'size-ns':
                return CursorIcon.SizeNS;
            case 'size-nwse':
                return CursorIcon.SizeNWSE;
            case 'size-we':
                return CursorIcon.SizeWE;
            case 'up-arrow':
                return CursorIcon.UpArrow;
            case 'wait':
                return CursorIcon.Wait;
            case 'help':
                return CursorIcon.Help;
            default:
        }

        return null;
    }

    parseBorder(current: Border) {
        const width = this.parseSize();
        if (!width) return;

        const style = this.parseBorderStyle();
        if (!style) return;

        const color = this.parseColor();
        if (!color) return;

        current.top = { width, style, color };
        current.right = { width, style, color };
        current.bottom = { width, style, color };
        current.left = { width, style, color };
    }

    parsePadding(current: Padding) {
        const sizes: Size[] = [];
        for (let i = 0; i < 4; i++) {
            const size = this.parseSize();
            if (!size) break;
            sizes.push(size);
        }

        if (sizes.length === 1) {
            current.left = sizes[0];
            current.right = Object.assign({}, sizes[0]);
            current.top = Object.assign({}, sizes[0]);
            current.bottom = Object.assign({}, sizes[0]);
        } else if (sizes.length === 2) {
            current.top = sizes[0];
            current.bottom = Object.assign({}, sizes[0]);
            current.left = sizes[1];
            current.right = Object.assign({}, sizes[1]);
        } else if (sizes.length === 3) {
            current.top = sizes[0];
            current.bottom = sizes[2];
            current.left = sizes[1];
            current.right = Object.assign({}, sizes[1]);
        } else if (sizes.length === 4) {
            current.top = sizes[0];
            current.right = sizes[1];
            current.bottom = sizes[2];
            current.left = sizes[3];
        }
    }

    parseMargin(current: Margin) {
        const sizes: Size[] = [];
        for (let i = 0; i < 4; i++) {
            const size = this.parseSize();
            if (!size) break;
            sizes.push(size);
        }

        if (sizes.length === 1) {
            current.left = sizes[0];
            current.right = Object.assign({}, sizes[0]);
            current.top = Object.assign({}, sizes[0]);
            current.bottom = Object.assign({}, sizes[0]);
        } else if (sizes.length === 2) {
            current.top = sizes[0];
            current.bottom = Object.assign({}, sizes[0]);
            current.left = sizes[1];
            current.right = Object.assign({}, sizes[1]);
        } else if (sizes.length === 3) {
            current.top = sizes[0];
            current.bottom = sizes[2];
            current.left = sizes[1];
            current.right = Object.assign({}, sizes[1]);
        } else if (sizes.length === 4) {
            current.top = sizes[0];
            current.right = sizes[1];
            current.bottom = sizes[2];
            current.left = sizes[3];
        }
    }

    parseBorderRadius(current: Border) {
        const value = this.parseSize();
        if (!value) return;

        current.topLeftRadius = value;
        current.topRightRadius = Object.assign({}, value);
        current.bottomLeftRadius = Object.assign({}, value);
        current.bottomRightRadius = Object.assign({}, value);
    }

    static parseStyleProps(props: StyleAttributes): ParsedStyleAttributes;
    static parseStyleProps(props: StyleProps): ParsedStyleProps;
    static parseStyleProps(props: StyleProps): ParsedStyleProps {
        const parsedProps: ParsedStyleProps = {};

        const ensureBorder = () => {
            if (parsedProps.border) return parsedProps.border;

            parsedProps.border = {
                top: {
                    width: { value: 0, unit: SizeUnit.px, op: null },
                    style: BorderStyle.None,
                    color: { r: 0, g: 0, b: 0, a: 1 }
                },
                right: {
                    width: { value: 0, unit: SizeUnit.px, op: null },
                    style: BorderStyle.None,
                    color: { r: 0, g: 0, b: 0, a: 1 }
                },
                bottom: {
                    width: { value: 0, unit: SizeUnit.px, op: null },
                    style: BorderStyle.None,
                    color: { r: 0, g: 0, b: 0, a: 1 }
                },
                left: {
                    width: { value: 0, unit: SizeUnit.px, op: null },
                    style: BorderStyle.None,
                    color: { r: 0, g: 0, b: 0, a: 1 }
                },
                topLeftRadius: { value: 0, unit: SizeUnit.px, op: null },
                topRightRadius: { value: 0, unit: SizeUnit.px, op: null },
                bottomLeftRadius: { value: 0, unit: SizeUnit.px, op: null },
                bottomRightRadius: { value: 0, unit: SizeUnit.px, op: null }
            };

            return parsedProps.border;
        };

        const ensurePadding = () => {
            if (parsedProps.padding) return parsedProps.padding;

            parsedProps.padding = {
                left: { value: 0, unit: SizeUnit.px, op: null },
                right: { value: 0, unit: SizeUnit.px, op: null },
                top: { value: 0, unit: SizeUnit.px, op: null },
                bottom: { value: 0, unit: SizeUnit.px, op: null }
            };

            return parsedProps.padding;
        };

        const ensureMargin = () => {
            if (parsedProps.margin) return parsedProps.margin;

            parsedProps.margin = {
                left: { value: 0, unit: SizeUnit.px, op: null },
                right: { value: 0, unit: SizeUnit.px, op: null },
                top: { value: 0, unit: SizeUnit.px, op: null },
                bottom: { value: 0, unit: SizeUnit.px, op: null }
            };

            return parsedProps.margin;
        };

        const ensureFlex = () => {
            if (parsedProps.flex) return parsedProps.flex;

            parsedProps.flex = {
                direction: FlexDirection.Row,
                justifyContent: JustifyContent.FlexStart,
                alignItems: AlignItems.FlexStart,
                wrap: FlexWrap.NoWrap,
                grow: 0,
                shrink: 1,
                basis: null,
                gap: { value: 0, unit: SizeUnit.px, op: null }
            };

            return parsedProps.flex;
        };

        for (const key in props) {
            if (props[key as keyof StyleProps] === undefined) continue;

            switch (key) {
                case 'minWidth': {
                    if (props.minWidth!.trim() === 'auto') {
                        parsedProps.minWidth = null;
                        break;
                    }

                    const parser = new StyleParser(props.minWidth!);
                    const minWidth = parser.parseSize();
                    if (!minWidth || minWidth.value < 0) break;

                    parsedProps.minWidth = minWidth;
                    break;
                }
                case 'minHeight': {
                    if (props.minHeight!.trim() === 'auto') {
                        parsedProps.minHeight = null;
                        break;
                    }

                    const parser = new StyleParser(props.minHeight!);
                    const minHeight = parser.parseSize();
                    if (!minHeight || minHeight.value < 0) break;

                    parsedProps.minHeight = minHeight;
                    break;
                }
                case 'maxWidth': {
                    if (props.maxWidth!.trim() === 'auto') {
                        parsedProps.maxWidth = null;
                        break;
                    }

                    const parser = new StyleParser(props.maxWidth!);
                    const maxWidth = parser.parseSize();
                    if (!maxWidth || maxWidth.value < 0) break;

                    parsedProps.maxWidth = maxWidth;
                    break;
                }
                case 'maxHeight': {
                    if (props.maxHeight!.trim() === 'auto') {
                        parsedProps.maxHeight = null;
                        break;
                    }

                    const parser = new StyleParser(props.maxHeight!);
                    const maxHeight = parser.parseSize();
                    if (!maxHeight || maxHeight.value < 0) break;

                    parsedProps.maxHeight = maxHeight;
                    break;
                }
                case 'width': {
                    if (props.width!.trim() === 'auto') {
                        parsedProps.width = null;
                        break;
                    }

                    const parser = new StyleParser(props.width!);
                    const width = parser.parseSize();
                    if (!width || width.value < 0) break;

                    parsedProps.width = width;
                    break;
                }
                case 'height': {
                    if (props.height!.trim() === 'auto') {
                        parsedProps.height = null;
                        break;
                    }

                    const parser = new StyleParser(props.height!);
                    const height = parser.parseSize();
                    if (!height || height.value < 0) break;

                    parsedProps.height = height;
                    break;
                }
                case 'position': {
                    const parser = new StyleParser(props.position!);
                    const position = parser.parsePosition();
                    if (position === null) break;

                    parsedProps.position = position;
                    break;
                }
                case 'top': {
                    if (props.top!.trim() === 'auto') {
                        parsedProps.top = null;
                        break;
                    }

                    const parser = new StyleParser(props.top!);
                    const top = parser.parseSize();
                    if (!top) break;

                    parsedProps.top = top;
                    break;
                }
                case 'right': {
                    if (props.right!.trim() === 'auto') {
                        parsedProps.right = null;
                        break;
                    }

                    const parser = new StyleParser(props.right!);
                    const right = parser.parseSize();
                    if (!right) break;

                    parsedProps.right = right;
                    break;
                }
                case 'bottom': {
                    if (props.bottom!.trim() === 'auto') {
                        parsedProps.bottom = null;
                        break;
                    }

                    const parser = new StyleParser(props.bottom!);
                    const bottom = parser.parseSize();
                    if (!bottom) break;

                    parsedProps.bottom = bottom;
                    break;
                }
                case 'left': {
                    if (props.left!.trim() === 'auto') {
                        parsedProps.left = null;
                        break;
                    }

                    const parser = new StyleParser(props.left!);
                    const left = parser.parseSize();
                    if (!left) break;

                    parsedProps.left = left;
                    break;
                }
                case 'zIndex': {
                    if (props.zIndex!.trim() === 'auto') {
                        parsedProps.zIndex = null;
                        break;
                    }

                    const zIndex = parseFloat(props.zIndex!);
                    if (isNaN(zIndex) || zIndex < 0 || zIndex !== Math.floor(zIndex)) break;

                    parsedProps.zIndex = zIndex;
                    break;
                }
                case 'flexDirection': {
                    const parser = new StyleParser(props.flexDirection!);
                    const flexDirection = parser.parseFlexDirection();
                    if (flexDirection === null) break;

                    ensureFlex().direction = flexDirection;
                    break;
                }
                case 'justifyContent': {
                    const parser = new StyleParser(props.justifyContent!);
                    const justifyContent = parser.parseJustifyContent();
                    if (justifyContent === null) break;

                    ensureFlex().justifyContent = justifyContent;
                    break;
                }
                case 'alignItems': {
                    const parser = new StyleParser(props.alignItems!);
                    const alignItems = parser.parseAlignItems();
                    if (alignItems === null) break;

                    ensureFlex().alignItems = alignItems;
                    break;
                }
                case 'flexWrap': {
                    const parser = new StyleParser(props.flexWrap!);
                    const flexWrap = parser.parseFlexWrap();
                    if (flexWrap === null) break;

                    ensureFlex().wrap = flexWrap;
                    break;
                }
                case 'flexGrow': {
                    if (props.flexGrow! < 0) break;
                    ensureFlex().grow = props.flexGrow!;
                    break;
                }
                case 'flexShrink': {
                    if (props.flexShrink! < 0) break;
                    ensureFlex().shrink = props.flexShrink!;
                    break;
                }
                case 'flexBasis': {
                    if (props.flexBasis!.trim() === 'auto') {
                        ensureFlex().basis = null;
                        break;
                    }

                    const parser = new StyleParser(props.flexBasis!);
                    const flexBasis = parser.parseSize();
                    if (!flexBasis) break;

                    ensureFlex().basis = flexBasis;
                    break;
                }
                case 'flex': {
                    if (props.flex! < 0) break;
                    const flex = ensureFlex();
                    flex.grow = props.flex!;
                    flex.shrink = props.flex!;
                    flex.basis = { value: 0, unit: SizeUnit.px, op: null };
                    break;
                }
                case 'gap': {
                    const parser = new StyleParser(props.gap!);
                    const gap = parser.parseSize();
                    if (!gap) break;

                    ensureFlex().gap = gap;
                    break;
                }
                case 'lineHeight': {
                    const parser = new StyleParser(props.lineHeight!);
                    const lineHeight = parser.parseSize();
                    if (!lineHeight) break;

                    parsedProps.lineHeight = lineHeight;
                    break;
                }
                case 'letterSpacing': {
                    const parser = new StyleParser(props.letterSpacing!);
                    const letterSpacing = parser.parseSize();
                    if (!letterSpacing) break;

                    parsedProps.letterSpacing = letterSpacing;
                    break;
                }
                case 'fontSize': {
                    const parser = new StyleParser(props.fontSize!);
                    const fontSize = parser.parseSize();
                    if (!fontSize) break;

                    parsedProps.fontSize = fontSize;
                    break;
                }
                case 'fontWeight': {
                    if (props.fontWeight! < 0 || props.fontWeight! !== Math.floor(props.fontWeight!)) break;
                    parsedProps.fontWeight = props.fontWeight;
                    break;
                }
                case 'fontFamily': {
                    parsedProps.fontFamily = props.fontFamily!.trim();
                    break;
                }
                case 'fontStyle': {
                    const parser = new StyleParser(props.fontStyle!);
                    const fontStyle = parser.parseFontStyle();
                    if (fontStyle === null) break;

                    parsedProps.fontStyle = fontStyle;
                    break;
                }
                case 'textAlign': {
                    const parser = new StyleParser(props.textAlign!);
                    const textAlign = parser.parseTextAlign();
                    if (textAlign === null) break;

                    parsedProps.textAlign = textAlign;
                    break;
                }
                case 'textDecoration': {
                    const parser = new StyleParser(props.textDecoration!);
                    const textDecoration = parser.parseTextDecoration();
                    if (textDecoration === null) break;

                    parsedProps.textDecoration = textDecoration;
                    break;
                }
                case 'whiteSpace': {
                    const parser = new StyleParser(props.whiteSpace!);
                    const whiteSpace = parser.parseWhiteSpace();
                    if (whiteSpace === null) break;

                    parsedProps.whiteSpace = whiteSpace;
                    break;
                }
                case 'wordBreak': {
                    const parser = new StyleParser(props.wordBreak!);
                    const wordBreak = parser.parseWordBreak();
                    if (wordBreak === null) break;

                    parsedProps.wordBreak = wordBreak;
                    break;
                }
                case 'wordWrap': {
                    const parser = new StyleParser(props.wordWrap!);
                    const wordWrap = parser.parseWordWrap();
                    if (wordWrap === null) break;

                    parsedProps.wordWrap = wordWrap;
                    break;
                }
                case 'overflow': {
                    const parser = new StyleParser(props.overflow!);
                    const overflow = parser.parseOverflow();
                    if (overflow === null) break;

                    parsedProps.overflow = overflow;
                    break;
                }
                case 'textOverflow': {
                    const parser = new StyleParser(props.textOverflow!);
                    const textOverflow = parser.parseTextOverflow();
                    if (textOverflow === null) break;

                    parsedProps.textOverflow = textOverflow;
                    break;
                }
                case 'cursor': {
                    const parser = new StyleParser(props.cursor!);
                    const cursor = parser.parseCursor();
                    if (cursor === null) break;

                    parsedProps.cursor = cursor;
                    break;
                }
                case 'color': {
                    const parser = new StyleParser(props.color!);
                    const color = parser.parseColor();
                    if (!color) break;

                    parsedProps.color = color;
                    break;
                }
                case 'backgroundColor': {
                    const parser = new StyleParser(props.backgroundColor!);
                    const backgroundColor = parser.parseColor();
                    if (!backgroundColor) break;

                    parsedProps.backgroundColor = backgroundColor;
                    break;
                }
                case 'opacity': {
                    if (props.opacity! < 0 || props.opacity! > 1) break;
                    parsedProps.opacity = props.opacity!;
                    break;
                }
                case 'border': {
                    const parser = new StyleParser(props.border!);
                    parser.parseBorder(ensureBorder());
                    break;
                }
                case 'borderWidth': {
                    const parser = new StyleParser(props.borderWidth!);
                    const size = parser.parseSize();
                    if (!size) break;

                    const border = ensureBorder();
                    border.top.width = size;
                    border.right.width = size;
                    border.bottom.width = size;
                    border.left.width = size;
                    break;
                }
                case 'borderColor': {
                    const parser = new StyleParser(props.borderColor!);
                    const color = parser.parseColor();
                    if (!color) break;

                    const border = ensureBorder();
                    border.top.color = color;
                    border.right.color = color;
                    border.bottom.color = color;
                    border.left.color = color;
                    break;
                }
                case 'borderStyle': {
                    const parser = new StyleParser(props.borderStyle!);
                    const style = parser.parseBorderStyle();
                    if (!style) break;

                    const border = ensureBorder();
                    border.top.style = style;
                    border.right.style = style;
                    border.bottom.style = style;
                    border.left.style = style;
                    break;
                }
                case 'borderTopWidth': {
                    const parser = new StyleParser(props.borderTopWidth!);
                    const size = parser.parseSize();
                    if (!size) break;

                    const border = ensureBorder();
                    border.top.width = size;
                    break;
                }
                case 'borderRightWidth': {
                    const parser = new StyleParser(props.borderRightWidth!);
                    const size = parser.parseSize();
                    if (!size) break;

                    const border = ensureBorder();
                    border.right.width = size;
                    break;
                }
                case 'borderBottomWidth': {
                    const parser = new StyleParser(props.borderBottomWidth!);
                    const size = parser.parseSize();
                    if (!size) break;

                    const border = ensureBorder();
                    border.bottom.width = size;
                    break;
                }
                case 'borderLeftWidth': {
                    const parser = new StyleParser(props.borderLeftWidth!);
                    const size = parser.parseSize();
                    if (!size) break;

                    const border = ensureBorder();
                    border.left.width = size;
                    break;
                }
                case 'borderTopColor': {
                    const parser = new StyleParser(props.borderTopColor!);
                    const color = parser.parseColor();
                    if (!color) break;

                    const border = ensureBorder();
                    border.top.color = color;
                    break;
                }
                case 'borderRightColor': {
                    const parser = new StyleParser(props.borderRightColor!);
                    const color = parser.parseColor();
                    if (!color) break;

                    const border = ensureBorder();
                    border.right.color = color;
                    break;
                }
                case 'borderBottomColor': {
                    const parser = new StyleParser(props.borderBottomColor!);
                    const color = parser.parseColor();
                    if (!color) break;

                    const border = ensureBorder();
                    border.bottom.color = color;
                    break;
                }
                case 'borderLeftColor': {
                    const parser = new StyleParser(props.borderLeftColor!);
                    const color = parser.parseColor();
                    if (!color) break;

                    const border = ensureBorder();
                    border.left.color = color;
                    break;
                }
                case 'borderTopStyle': {
                    const parser = new StyleParser(props.borderTopStyle!);
                    const style = parser.parseBorderStyle();
                    if (!style) break;

                    const border = ensureBorder();
                    border.top.style = style;
                    break;
                }
                case 'borderRightStyle': {
                    const parser = new StyleParser(props.borderRightStyle!);
                    const style = parser.parseBorderStyle();
                    if (!style) break;

                    const border = ensureBorder();
                    border.right.style = style;
                    break;
                }
                case 'borderBottomStyle': {
                    const parser = new StyleParser(props.borderBottomStyle!);
                    const style = parser.parseBorderStyle();
                    if (!style) break;

                    const border = ensureBorder();
                    border.bottom.style = style;
                    break;
                }
                case 'borderLeftStyle': {
                    const parser = new StyleParser(props.borderLeftStyle!);
                    const style = parser.parseBorderStyle();
                    if (!style) break;

                    const border = ensureBorder();
                    border.left.style = style;
                    break;
                }
                case 'borderRadius': {
                    const parser = new StyleParser(props.borderRadius!);
                    parser.parseBorderRadius(ensureBorder());
                    break;
                }
                case 'borderTopLeftRadius': {
                    const parser = new StyleParser(props.borderTopLeftRadius!);
                    const size = parser.parseSize();
                    if (!size) break;

                    const border = ensureBorder();
                    border.topLeftRadius = size;
                    break;
                }
                case 'borderTopRightRadius': {
                    const parser = new StyleParser(props.borderTopRightRadius!);
                    const size = parser.parseSize();
                    if (!size) break;

                    const border = ensureBorder();
                    border.topRightRadius = size;
                    break;
                }
                case 'borderBottomLeftRadius': {
                    const parser = new StyleParser(props.borderBottomLeftRadius!);
                    const size = parser.parseSize();
                    if (!size) break;

                    const border = ensureBorder();
                    border.bottomLeftRadius = size;
                    break;
                }
                case 'borderBottomRightRadius': {
                    const parser = new StyleParser(props.borderBottomRightRadius!);
                    const size = parser.parseSize();
                    if (!size) break;

                    const border = ensureBorder();
                    border.bottomRightRadius = size;
                    break;
                }
                case 'padding': {
                    const parser = new StyleParser(props.padding!);
                    parser.parsePadding(ensurePadding());
                    break;
                }
                case 'paddingLeft': {
                    const parser = new StyleParser(props.paddingLeft!);
                    const size = parser.parseSize();
                    if (!size) break;

                    const padding = ensurePadding();
                    padding.left = size;
                    break;
                }
                case 'paddingRight': {
                    const parser = new StyleParser(props.paddingRight!);
                    const size = parser.parseSize();
                    if (!size) break;

                    const padding = ensurePadding();
                    padding.right = size;
                    break;
                }
                case 'paddingTop': {
                    const parser = new StyleParser(props.paddingTop!);
                    const size = parser.parseSize();
                    if (!size) break;

                    const padding = ensurePadding();
                    padding.top = size;
                    break;
                }
                case 'paddingBottom': {
                    const parser = new StyleParser(props.paddingBottom!);
                    const size = parser.parseSize();
                    if (!size) break;

                    const padding = ensurePadding();
                    padding.bottom = size;
                    break;
                }
                case 'margin': {
                    const parser = new StyleParser(props.margin!);
                    parser.parseMargin(ensureMargin());
                    break;
                }
                case 'marginLeft': {
                    const parser = new StyleParser(props.marginLeft!);
                    const size = parser.parseSize();
                    if (!size) break;

                    const margin = ensureMargin();
                    margin.left = size;
                    break;
                }
                case 'marginRight': {
                    const parser = new StyleParser(props.marginRight!);
                    const size = parser.parseSize();
                    if (!size) break;

                    const margin = ensureMargin();
                    margin.right = size;
                    break;
                }
                case 'marginTop': {
                    const parser = new StyleParser(props.marginTop!);
                    const size = parser.parseSize();
                    if (!size) break;

                    const margin = ensureMargin();
                    margin.top = size;
                    break;
                }
                case 'marginBottom': {
                    const parser = new StyleParser(props.marginBottom!);
                    const size = parser.parseSize();
                    if (!size) break;

                    const margin = ensureMargin();
                    margin.bottom = size;
                    break;
                }
            }
        }

        return parsedProps;
    }
}
