export * from './parser';
export * from './render-context';
export * from './draw-call';
export * from './text-draw';
export * from './font-mgr';

import { Color, ParsedStyleAttributes, ParsedStyleProps, Size, SizeUnit, StyleAttributes, StyleProps } from '../types';
import { StyleParser } from './parser';

export const DEFAULT_FONT_SIZE = 16;

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
        lineHeight: '1rem',
        letterSpacing: '0px',
        fontSize: `${DEFAULT_FONT_SIZE}px`,
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
        color: 'rgba(0, 0, 0, 1)',
        backgroundColor: 'rgba(0, 0, 0, 0)',
        borderWidth: '0px',
        borderColor: 'rgba(0, 0, 0, 1)',
        borderStyle: 'none',
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

const immutableDefaultStyle = Object.freeze(defaultStyle());
const parsedDefaultStyle = Object.freeze(StyleParser.parseStyleProps(immutableDefaultStyle));
const cascadingStyleProps = new Set<keyof ParsedStyleAttributes>([
    'lineHeight',
    'letterSpacing',
    'fontSize',
    'fontWeight',
    'fontFamily',
    'fontStyle',
    'textDecoration',
    'whiteSpace',
    'wordBreak',
    'wordWrap',
    'textOverflow',
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
    let result: ParsedStyleProps;

    if (childStyle) {
        if (parentStyle) {
            result = mergeStyle(parsedDefaultStyle, mergeStyle(parentStyle, childStyle));
        } else result = mergeStyle(parsedDefaultStyle, childStyle);
    } else if (parentStyle) {
        result = mergeStyle(parsedDefaultStyle, parentStyle);
    } else return parsedDefaultStyle;

    for (const key in parsedDefaultStyle) {
        if (!(key in result)) {
            (result as any)[key] = (parsedDefaultStyle as any)[key];
        }
    }

    return result as ParsedStyleAttributes;
}

export function px(value: number): Size {
    return { unit: SizeUnit.px, value };
}

export function percent(value: number): Size {
    return { unit: SizeUnit.percent, value };
}

export function em(value: number): Size {
    return { unit: SizeUnit.em, value };
}

export function rem(value: number): Size {
    return { unit: SizeUnit.rem, value };
}

export function vw(value: number): Size {
    return { unit: SizeUnit.vw, value };
}

export function vh(value: number): Size {
    return { unit: SizeUnit.vh, value };
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
