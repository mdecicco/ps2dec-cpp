export * from './parser';
export * from './render-context';
export * from './draw-call';
export * from './text-draw';
export * from './font-mgr';
export * from './vertex-array';
export * from './instance-mgr';
export * from './vulkan';
import { StyleParser } from './parser';
import { FontManager } from './font-mgr';

import { vec2 } from 'math-ext';
import {
    ClientRect,
    Color,
    ParsedStyleAttributes,
    ParsedStyleProps,
    Size,
    SizeUnit,
    StyleAttributes,
    StyleProps
} from '../types';

export function defaultStyle(): StyleAttributes {
    return {
        minWidth: 'auto',
        minHeight: 'auto',
        maxWidth: 'auto',
        maxHeight: 'auto',
        width: 'auto',
        height: 'auto',
        position: 'static',
        top: 'auto',
        right: 'auto',
        bottom: 'auto',
        left: 'auto',
        zIndex: 'auto',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        flexWrap: 'nowrap',
        flexGrow: 0,
        flexShrink: 1,
        flexBasis: 'auto',
        gap: '0px',
        lineHeight: '1.2em',
        letterSpacing: '0px',
        fontSize: `${FontManager.defaultFontSize}px`,
        fontWeight: 400,
        fontFamily: 'default',
        fontStyle: 'normal',
        textAlign: 'left',
        textDecoration: 'none',
        whiteSpace: 'normal',
        wordBreak: 'normal',
        wordWrap: 'normal',
        overflow: 'visible',
        textOverflow: 'clip',
        cursor: 'default',
        color: 'rgba(0, 0, 0, 1)',
        backgroundColor: 'rgba(0, 0, 0, 0)',
        opacity: 1,
        borderTopWidth: '0px',
        borderTopColor: 'rgba(0, 0, 0, 1)',
        borderTopStyle: 'none',
        borderRightWidth: '0px',
        borderRightColor: 'rgba(0, 0, 0, 1)',
        borderRightStyle: 'none',
        borderBottomWidth: '0px',
        borderBottomColor: 'rgba(0, 0, 0, 1)',
        borderBottomStyle: 'none',
        borderLeftWidth: '0px',
        borderLeftColor: 'rgba(0, 0, 0, 1)',
        borderLeftStyle: 'none',
        borderTopLeftRadius: '0px',
        borderTopRightRadius: '0px',
        borderBottomLeftRadius: '0px',
        borderBottomRightRadius: '0px',
        paddingLeft: '0px',
        paddingRight: '0px',
        paddingTop: '0px',
        paddingBottom: '0px',
        marginLeft: '0px',
        marginRight: '0px',
        marginTop: '0px',
        marginBottom: '0px'
    };
}

// font size -> default style
const defaultStyleMap: Record<number, { props: StyleAttributes; parsed: ParsedStyleAttributes }> = {};

const cascadingStyleProps = new Set<keyof ParsedStyleAttributes>([
    'lineHeight',
    'letterSpacing',
    'fontSize',
    'fontWeight',
    'fontFamily',
    'fontStyle',
    'textAlign',
    'textDecoration',
    'whiteSpace',
    'wordBreak',
    'wordWrap',
    'textOverflow',
    'cursor',
    'color'
]);

export function mergeStyle(parent: ParsedStyleProps, child: ParsedStyleAttributes): ParsedStyleAttributes;
export function mergeStyle(parent: ParsedStyleProps, child: ParsedStyleProps): ParsedStyleProps;
export function mergeStyle(parent: ParsedStyleProps, child: ParsedStyleProps): ParsedStyleProps {
    const result: ParsedStyleProps = {};

    for (const key in parent) {
        if (cascadingStyleProps.has(key as keyof ParsedStyleAttributes)) {
            (result as any)[key] = (parent as any)[key];
        }
    }

    for (const key in child) {
        (result as any)[key] = (child as any)[key];
    }

    return result;
}

export function getCompleteStyle(parentStyle?: ParsedStyleProps, childStyle?: ParsedStyleProps): ParsedStyleAttributes {
    let defaults: { props: StyleProps; parsed: ParsedStyleAttributes } | null = null;
    if (FontManager.defaultFontSize in defaultStyleMap) {
        defaults = defaultStyleMap[FontManager.defaultFontSize];
    } else {
        const immutableDefaultStyle = Object.freeze(defaultStyle());
        const parsedDefaultStyle = Object.freeze(StyleParser.parseStyleProps(immutableDefaultStyle));
        defaults = defaultStyleMap[FontManager.defaultFontSize] = {
            props: immutableDefaultStyle,
            parsed: parsedDefaultStyle
        };
    }

    let result: ParsedStyleProps;

    if (childStyle) {
        if (parentStyle) {
            result = mergeStyle(defaults.parsed, mergeStyle(parentStyle, childStyle));
        } else result = mergeStyle(defaults.parsed, childStyle);
    } else if (parentStyle) {
        result = mergeStyle(defaults.parsed, parentStyle);
    } else return defaults.parsed;

    for (const key in defaults.parsed) {
        if (!(key in result)) {
            (result as any)[key] = (defaults.parsed as any)[key];
        }
    }

    return result as ParsedStyleAttributes;
}

export function px(value: number): Size {
    return { unit: SizeUnit.px, value, op: null };
}

export function percent(value: number): Size {
    return { unit: SizeUnit.percent, value, op: null };
}

export function em(value: number): Size {
    return { unit: SizeUnit.em, value, op: null };
}

export function rem(value: number): Size {
    return { unit: SizeUnit.rem, value, op: null };
}

export function vw(value: number): Size {
    return { unit: SizeUnit.vw, value, op: null };
}

export function vh(value: number): Size {
    return { unit: SizeUnit.vh, value, op: null };
}

export function rgb(r: number, g: number, b: number): Color {
    return { r, g, b, a: 1 };
}

export function rgba(r: number, g: number, b: number, a: number): Color {
    return { r, g, b, a };
}

export function parseColor(value: string): Color {
    const parser = new StyleParser(value);
    const color = parser.parseColor();
    if (!color) throw new Error(`Invalid color: ${value}`);
    return color;
}

export function pointInClientRect(pos: vec2, rect: ClientRect): boolean {
    if (pos.x < rect.left || pos.x > rect.right) return false;
    if (pos.y < rect.top || pos.y > rect.bottom) return false;

    const inTopLeft = pos.x < rect.left + rect.topLeftRadius && pos.y < rect.top + rect.topLeftRadius;
    const inTopRight = pos.x > rect.right - rect.topRightRadius && pos.y < rect.top + rect.topRightRadius;
    const inBottomRight = pos.x > rect.right - rect.bottomRightRadius && pos.y > rect.bottom - rect.bottomRightRadius;
    const inBottomLeft = pos.x < rect.left + rect.bottomLeftRadius && pos.y > rect.bottom - rect.bottomLeftRadius;

    if (inTopLeft && rect.topLeftRadius > 0.0) {
        const center = new vec2(rect.left + rect.topLeftRadius, rect.top + rect.topLeftRadius);
        const diff = new vec2();
        vec2.sub(diff, pos, center);
        if (diff.lengthSq > rect.topLeftRadius * rect.topLeftRadius) return false;
    } else if (inTopRight && rect.topRightRadius > 0.0) {
        const center = new vec2(rect.right - rect.topRightRadius, rect.top + rect.topRightRadius);
        const diff = new vec2();
        vec2.sub(diff, pos, center);
        if (diff.lengthSq > rect.topRightRadius * rect.topRightRadius) return false;
    } else if (inBottomRight && rect.bottomRightRadius > 0.0) {
        const center = new vec2(rect.right - rect.bottomRightRadius, rect.bottom - rect.bottomRightRadius);
        const diff = new vec2();
        vec2.sub(diff, pos, center);
        if (diff.lengthSq > rect.bottomRightRadius * rect.bottomRightRadius) return false;
    } else if (inBottomLeft && rect.bottomLeftRadius > 0.0) {
        const center = new vec2(rect.left + rect.bottomLeftRadius, rect.bottom - rect.bottomLeftRadius);
        const diff = new vec2();
        vec2.sub(diff, pos, center);
        if (diff.lengthSq > rect.bottomLeftRadius * rect.bottomLeftRadius) return false;
    }

    return true;
}
