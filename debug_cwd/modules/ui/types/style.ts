export type StyleAttributes = {
    minWidth: string;
    minHeight: string;
    maxWidth: string;
    maxHeight: string;
    width: string;
    height: string;
    position: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
    top: string;
    right: string;
    bottom: string;
    left: string;
    zIndex: number;
    flexDirection: 'row' | 'column';
    justifyContent: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
    alignItems: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
    flexWrap: 'nowrap' | 'wrap' | 'wrap-reverse';
    flexGrow: number;
    flexShrink: number;
    flexBasis: string;
    gap: string;
    lineHeight: string;
    letterSpacing: string;
    fontSize: string;
    fontWeight: number;
    fontFamily: string;
    fontStyle: 'normal' | 'italic' | 'oblique';
    textAlign: 'left' | 'center' | 'right' | 'justify';
    textDecoration: 'none' | 'underline' | 'overline' | 'line-through';
    whiteSpace: 'normal' | 'nowrap' | 'pre' | 'pre-wrap' | 'pre-line';
    wordBreak: 'normal' | 'break-all' | 'break-word';
    wordWrap: 'normal' | 'break-word';
    overflow: 'visible' | 'hidden' | 'scroll';
    textOverflow: 'clip' | 'ellipsis' | 'unset';
    cursor:
        | 'default'
        | 'arrow'
        | 'crosshair'
        | 'pointer'
        | 'i-beam'
        | 'size-all'
        | 'size-nesw'
        | 'size-ns'
        | 'size-nwse'
        | 'size-we'
        | 'up-arrow'
        | 'wait'
        | 'help';
    color: string;
    backgroundColor: string;
    opacity: number;
    borderTopWidth: string;
    borderRightWidth: string;
    borderBottomWidth: string;
    borderLeftWidth: string;
    borderTopColor: string;
    borderRightColor: string;
    borderBottomColor: string;
    borderLeftColor: string;
    borderTopStyle: 'none' | 'hidden' | 'dotted' | 'dashed' | 'solid' | 'double';
    borderRightStyle: 'none' | 'hidden' | 'dotted' | 'dashed' | 'solid' | 'double';
    borderBottomStyle: 'none' | 'hidden' | 'dotted' | 'dashed' | 'solid' | 'double';
    borderLeftStyle: 'none' | 'hidden' | 'dotted' | 'dashed' | 'solid' | 'double';
    borderTopLeftRadius: string;
    borderTopRightRadius: string;
    borderBottomLeftRadius: string;
    borderBottomRightRadius: string;
    paddingLeft: string;
    paddingRight: string;
    paddingTop: string;
    paddingBottom: string;
    marginLeft: string;
    marginRight: string;
    marginTop: string;
    marginBottom: string;
};

export type ShorthandStyleAttributes = {
    flex: number;
    border: string;
    padding: string;
    margin: string;
    borderRadius: string;
    borderWidth: string;
    borderColor: string;
    borderStyle: 'none' | 'hidden' | 'dotted' | 'dashed' | 'solid' | 'double';
};

export type StyleProps = Partial<StyleAttributes & ShorthandStyleAttributes>;

export enum Position {
    Static = 0,
    Relative = 1,
    Absolute = 2,
    Fixed = 3,
    Sticky = 4
}

export enum FlexDirection {
    Row = 0,
    Column = 1,
    RowReverse = 2,
    ColumnReverse = 3
}

export enum JustifyContent {
    FlexStart = 0,
    FlexEnd = 1,
    Center = 2,
    SpaceBetween = 3,
    SpaceAround = 4,
    SpaceEvenly = 5
}

export enum AlignItems {
    FlexStart = 0,
    FlexEnd = 1,
    Center = 2,
    Stretch = 3,
    Baseline = 4
}

export enum FlexWrap {
    NoWrap = 0,
    Wrap = 1,
    WrapReverse = 2
}

export enum FontStyle {
    Normal = 0,
    Italic = 1,
    Oblique = 2
}

export enum TextAlign {
    Left = 0,
    Center = 1,
    Right = 2,
    Justify = 3
}

export enum TextDecoration {
    None = 0,
    Underline = 1,
    Overline = 2,
    LineThrough = 3
}

export enum WhiteSpace {
    Normal = 0,
    Nowrap = 1,
    Pre = 2,
    PreWrap = 3,
    PreLine = 4
}

export enum WordBreak {
    Normal = 0,
    BreakAll = 1,
    BreakWord = 2
}

export enum WordWrap {
    Normal = 0,
    BreakWord = 1
}

export enum Overflow {
    Visible = 0,
    Hidden = 1,
    Scroll = 2
}

export enum TextOverflow {
    Clip = 0,
    Ellipsis = 1,
    Unset = 2
}

export enum BorderStyle {
    None = 0,
    Hidden = 1,
    Dotted = 2,
    Dashed = 3,
    Solid = 4,
    Double = 5
}

export enum SizeUnit {
    px = 0,
    percent = 1,
    em = 2,
    rem = 3,
    vw = 4,
    vh = 5
}

export enum SizeInstruction {
    Add = 0,
    Sub,
    Mul,
    Div
}

export type Size = {
    value: number;
    unit: SizeUnit;
    op: {
        instr: SizeInstruction;
        value: Size;
    } | null;
};

export type Color = {
    r: number;
    g: number;
    b: number;
    a: number;
};

export type BorderComponent = {
    width: Size;
    color: Color;
    style: BorderStyle;
};

export type Border = {
    top: BorderComponent;
    right: BorderComponent;
    bottom: BorderComponent;
    left: BorderComponent;
    topLeftRadius: Size;
    topRightRadius: Size;
    bottomLeftRadius: Size;
    bottomRightRadius: Size;
};

export type Margin = {
    left: Size;
    right: Size;
    top: Size;
    bottom: Size;
};

export type Padding = {
    left: Size;
    right: Size;
    top: Size;
    bottom: Size;
};

export type Flex = {
    direction: FlexDirection;
    justifyContent: JustifyContent;
    alignItems: AlignItems;
    wrap: FlexWrap;
    grow: number;
    shrink: number;
    /** null means auto */
    basis: Size | null;
    gap: Size;
};

export type ParsedStyleAttributes = {
    /** null means auto */
    minWidth: Size | null;
    /** null means auto */
    minHeight: Size | null;
    /** null means auto */
    maxWidth: Size | null;
    /** null means auto */
    maxHeight: Size | null;
    /** null means auto */
    width: Size | null;
    /** null means auto */
    height: Size | null;
    position: Position;
    /** null means auto */
    top: Size | null;
    /** null means auto */
    right: Size | null;
    /** null means auto */
    bottom: Size | null;
    /** null means auto */
    left: Size | null;
    zIndex: number;
    flex: Flex;
    lineHeight: Size;
    letterSpacing: Size;
    fontSize: Size;
    fontWeight: number;
    fontFamily: string;
    fontStyle: FontStyle;
    textAlign: TextAlign;
    textDecoration: TextDecoration;
    whiteSpace: WhiteSpace;
    wordBreak: WordBreak;
    wordWrap: WordWrap;
    overflow: Overflow;
    textOverflow: TextOverflow;
    cursor: CursorIcon;
    color: Color;
    backgroundColor: Color;
    opacity: number;
    border: Border;
    margin: Margin;
    padding: Padding;
};

export type ParsedStyleProps = Partial<ParsedStyleAttributes>;

export type ClientRect = {
    /** The x coordinate of the element's left edge in pixels */
    x: number;
    /** The y coordinate of the element's top edge in pixels */
    y: number;
    /** The width of the element in pixels */
    width: number;
    /** The height of the element in pixels */
    height: number;
    /** The y coordinate of the element's top edge in pixels */
    top: number;
    /** The y coordinate of the element's bottom edge in pixels */
    bottom: number;
    /** The x coordinate of the element's right edge in pixels */
    right: number;
    /** The x coordinate of the element's left edge in pixels */
    left: number;
    /** The radius of the element's top-left corner in pixels */
    topLeftRadius: number;
    /** The radius of the element's top-right corner in pixels */
    topRightRadius: number;
    /** The radius of the element's bottom-left corner in pixels */
    bottomLeftRadius: number;
    /** The radius of the element's bottom-right corner in pixels */
    bottomRightRadius: number;
    /** The width of the element's left padding in pixels */
    paddingLeft: number;
    /** The width of the element's right padding in pixels */
    paddingRight: number;
    /** The width of the element's top padding in pixels */
    paddingTop: number;
    /** The width of the element's bottom padding in pixels */
    paddingBottom: number;
    /** The width of the element's left margin in pixels */
    marginLeft: number;
    /** The width of the element's right margin in pixels */
    marginRight: number;
    /** The width of the element's top margin in pixels */
    marginTop: number;
    /** The width of the element's bottom margin in pixels */
    marginBottom: number;
};
