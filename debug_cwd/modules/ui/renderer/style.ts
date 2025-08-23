import * as Yoga from 'yoga';
import { isChanged } from 'is-changed';
import { Window } from 'window';

import {
    AlignItems,
    BorderStyle,
    ClientRect,
    Color,
    FlexDirection,
    FlexWrap,
    FontStyle,
    JustifyContent,
    Margin,
    Overflow,
    Padding,
    ParsedStyleAttributes,
    Position,
    Size,
    SizeUnit,
    TextAlign,
    TextDecoration,
    TextOverflow,
    WhiteSpace,
    WordBreak,
    WordWrap
} from '../types/style';
import { Direction } from '../types';
import { DEFAULT_FONT_SIZE } from '../utils';

export class Style {
    private m_yogaNode: Yoga.YGNodeRef;
    private m_styleData: ParsedStyleAttributes;
    private m_parent: Style | null;
    private m_root: Style | null;
    private m_clientRect: ClientRect;
    private m_window: Window;

    constructor(
        yogaNode: Yoga.YGNodeRef,
        styleData: ParsedStyleAttributes,
        parent: Style | null,
        root: Style | null,
        window: Window
    ) {
        this.m_yogaNode = yogaNode;
        this.m_styleData = styleData;
        this.m_parent = parent;
        this.m_root = root;
        this.m_window = window;
        this.m_clientRect = {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            topLeftRadius: 0,
            topRightRadius: 0,
            bottomLeftRadius: 0,
            bottomRightRadius: 0,
            paddingLeft: 0,
            paddingRight: 0,
            paddingTop: 0,
            paddingBottom: 0,
            marginLeft: 0,
            marginRight: 0,
            marginTop: 0,
            marginBottom: 0,
            depth: 0
        };

        this.configureYogaNode();
    }

    get clientRect() {
        return this.m_clientRect;
    }

    get parent() {
        return this.m_parent;
    }

    get root() {
        return this.m_root;
    }

    get window() {
        return this.m_window;
    }

    set minWidth(value: Size | null) {
        if (!isChanged(value, this.m_styleData.minWidth)) return;

        this.m_styleData.minWidth = value;
        if (value) {
            if (value.unit === SizeUnit.percent) {
                Yoga.YGNodeStyleSetMinWidthPercent(this.m_yogaNode, value.value);
            } else {
                Yoga.YGNodeStyleSetMinWidth(this.m_yogaNode, this.resolveSize(value, Direction.Horizontal));
            }
        } else {
            Yoga.YGNodeStyleSetWidthAuto(this.m_yogaNode);
        }
    }

    get minWidth() {
        return this.m_styleData.minWidth;
    }

    set minHeight(value: Size | null) {
        if (!isChanged(value, this.m_styleData.minHeight)) return;

        this.m_styleData.minHeight = value;
        if (value) {
            if (value.unit === SizeUnit.percent) {
                Yoga.YGNodeStyleSetMinHeightPercent(this.m_yogaNode, value.value);
            } else {
                Yoga.YGNodeStyleSetMinHeight(this.m_yogaNode, this.resolveSize(value, Direction.Vertical));
            }
        } else {
            Yoga.YGNodeStyleSetHeightAuto(this.m_yogaNode);
        }
    }

    get minHeight() {
        return this.m_styleData.minHeight;
    }

    set maxWidth(value: Size | null) {
        if (!isChanged(value, this.m_styleData.maxWidth)) return;

        this.m_styleData.maxWidth = value;
        if (value) {
            if (value.unit === SizeUnit.percent) {
                Yoga.YGNodeStyleSetMaxWidthPercent(this.m_yogaNode, value.value);
            } else {
                Yoga.YGNodeStyleSetMaxWidth(this.m_yogaNode, this.resolveSize(value, Direction.Horizontal));
            }
        } else {
            Yoga.YGNodeStyleSetWidthAuto(this.m_yogaNode);
        }
    }

    get maxWidth() {
        return this.m_styleData.maxWidth;
    }

    set maxHeight(value: Size | null) {
        if (!isChanged(value, this.m_styleData.maxHeight)) return;

        this.m_styleData.maxHeight = value;
        if (value) {
            if (value.unit === SizeUnit.percent) {
                Yoga.YGNodeStyleSetMaxHeightPercent(this.m_yogaNode, value.value);
            } else {
                Yoga.YGNodeStyleSetMaxHeight(this.m_yogaNode, this.resolveSize(value, Direction.Vertical));
            }
        } else {
            Yoga.YGNodeStyleSetHeightAuto(this.m_yogaNode);
        }
    }

    get maxHeight() {
        return this.m_styleData.maxHeight;
    }

    set width(value: Size | null) {
        if (!isChanged(value, this.m_styleData.width)) return;

        this.m_styleData.width = value;
        if (value) {
            if (value.unit === SizeUnit.percent) {
                Yoga.YGNodeStyleSetWidthPercent(this.m_yogaNode, value.value);
            } else {
                Yoga.YGNodeStyleSetWidth(this.m_yogaNode, this.resolveSize(value, Direction.Horizontal));
            }
        } else {
            Yoga.YGNodeStyleSetWidthAuto(this.m_yogaNode);
        }
    }

    get width() {
        return this.m_styleData.width;
    }

    set height(value: Size | null) {
        if (!isChanged(value, this.m_styleData.height)) return;

        this.m_styleData.height = value;
        if (value) {
            if (value.unit === SizeUnit.percent) {
                Yoga.YGNodeStyleSetHeightPercent(this.m_yogaNode, value.value);
            } else {
                Yoga.YGNodeStyleSetHeight(this.m_yogaNode, this.resolveSize(value, Direction.Vertical));
            }
        } else {
            Yoga.YGNodeStyleSetHeightAuto(this.m_yogaNode);
        }
    }

    get height() {
        return this.m_styleData.height;
    }

    set position(value: Position) {
        if (value === this.m_styleData.position) return;

        this.m_styleData.position = value;
        switch (this.m_styleData.position) {
            case Position.Static:
                Yoga.YGNodeStyleSetPositionType(this.m_yogaNode, Yoga.YGPositionType.YGPositionTypeStatic);
                break;
            case Position.Relative:
                Yoga.YGNodeStyleSetPositionType(this.m_yogaNode, Yoga.YGPositionType.YGPositionTypeRelative);
                break;
            case Position.Absolute:
                Yoga.YGNodeStyleSetPositionType(this.m_yogaNode, Yoga.YGPositionType.YGPositionTypeAbsolute);
                break;
            case Position.Fixed:
                // todo: What's different?
                Yoga.YGNodeStyleSetPositionType(this.m_yogaNode, Yoga.YGPositionType.YGPositionTypeAbsolute);
                break;
            case Position.Sticky:
                // todo: What's different?
                Yoga.YGNodeStyleSetPositionType(this.m_yogaNode, Yoga.YGPositionType.YGPositionTypeAbsolute);
                break;
        }
    }

    get position() {
        return this.m_styleData.position;
    }

    set top(value: Size | null) {
        if (!isChanged(value, this.m_styleData.top)) return;

        this.m_styleData.top = value;
        if (value) {
            if (value.unit === SizeUnit.percent) {
                Yoga.YGNodeStyleSetPositionPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeTop, value.value);
            } else {
                Yoga.YGNodeStyleSetPosition(
                    this.m_yogaNode,
                    Yoga.YGEdge.YGEdgeTop,
                    this.resolveSize(value, Direction.Vertical)
                );
            }
        } else {
            Yoga.YGNodeStyleSetPositionAuto(this.m_yogaNode, Yoga.YGEdge.YGEdgeTop);
        }
    }

    get top() {
        return this.m_styleData.top;
    }

    set right(value: Size | null) {
        if (!isChanged(value, this.m_styleData.right)) return;

        this.m_styleData.right = value;
        if (value) {
            if (value.unit === SizeUnit.percent) {
                Yoga.YGNodeStyleSetPositionPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeRight, value.value);
            } else {
                Yoga.YGNodeStyleSetPosition(
                    this.m_yogaNode,
                    Yoga.YGEdge.YGEdgeRight,
                    this.resolveSize(value, Direction.Horizontal)
                );
            }
        } else {
            Yoga.YGNodeStyleSetPositionAuto(this.m_yogaNode, Yoga.YGEdge.YGEdgeRight);
        }
    }

    get right() {
        return this.m_styleData.right;
    }

    set bottom(value: Size | null) {
        if (!isChanged(value, this.m_styleData.bottom)) return;

        this.m_styleData.bottom = value;
        if (value) {
            if (value.unit === SizeUnit.percent) {
                Yoga.YGNodeStyleSetPositionPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeBottom, value.value);
            } else {
                Yoga.YGNodeStyleSetPosition(
                    this.m_yogaNode,
                    Yoga.YGEdge.YGEdgeBottom,
                    this.resolveSize(value, Direction.Vertical)
                );
            }
        } else {
            Yoga.YGNodeStyleSetPositionAuto(this.m_yogaNode, Yoga.YGEdge.YGEdgeBottom);
        }
    }

    get bottom() {
        return this.m_styleData.bottom;
    }

    set left(value: Size | null) {
        if (!isChanged(value, this.m_styleData.left)) return;

        this.m_styleData.left = value;
        if (value) {
            if (value.unit === SizeUnit.percent) {
                Yoga.YGNodeStyleSetPositionPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeLeft, value.value);
            } else {
                Yoga.YGNodeStyleSetPosition(
                    this.m_yogaNode,
                    Yoga.YGEdge.YGEdgeLeft,
                    this.resolveSize(value, Direction.Horizontal)
                );
            }
        } else {
            Yoga.YGNodeStyleSetPositionAuto(this.m_yogaNode, Yoga.YGEdge.YGEdgeLeft);
        }
    }

    get left() {
        return this.m_styleData.left;
    }

    set zIndex(value: number | null) {
        if (value === this.m_styleData.zIndex) return;

        this.m_styleData.zIndex = value;
    }

    get zIndex() {
        return this.m_styleData.zIndex;
    }

    set flexDirection(value: FlexDirection) {
        if (value === this.m_styleData.flex.direction) return;

        this.m_styleData.flex.direction = value;
        switch (value) {
            case FlexDirection.Row:
                Yoga.YGNodeStyleSetFlexDirection(this.m_yogaNode, Yoga.YGFlexDirection.YGFlexDirectionRow);
                break;
            case FlexDirection.RowReverse:
                Yoga.YGNodeStyleSetFlexDirection(this.m_yogaNode, Yoga.YGFlexDirection.YGFlexDirectionRowReverse);
                break;
            case FlexDirection.Column:
                Yoga.YGNodeStyleSetFlexDirection(this.m_yogaNode, Yoga.YGFlexDirection.YGFlexDirectionColumn);
                break;
            case FlexDirection.ColumnReverse:
                Yoga.YGNodeStyleSetFlexDirection(this.m_yogaNode, Yoga.YGFlexDirection.YGFlexDirectionColumnReverse);
                break;
        }
    }

    get flexDirection() {
        return this.m_styleData.flex.direction;
    }

    set justifyContent(value: JustifyContent) {
        if (value === this.m_styleData.flex.justifyContent) return;

        this.m_styleData.flex.justifyContent = value;
        switch (value) {
            case JustifyContent.FlexStart:
                Yoga.YGNodeStyleSetJustifyContent(this.m_yogaNode, Yoga.YGJustify.YGJustifyFlexStart);
                break;
            case JustifyContent.FlexEnd:
                Yoga.YGNodeStyleSetJustifyContent(this.m_yogaNode, Yoga.YGJustify.YGJustifyFlexEnd);
                break;
            case JustifyContent.Center:
                Yoga.YGNodeStyleSetJustifyContent(this.m_yogaNode, Yoga.YGJustify.YGJustifyCenter);
                break;
            case JustifyContent.SpaceBetween:
                Yoga.YGNodeStyleSetJustifyContent(this.m_yogaNode, Yoga.YGJustify.YGJustifySpaceBetween);
                break;
            case JustifyContent.SpaceAround:
                Yoga.YGNodeStyleSetJustifyContent(this.m_yogaNode, Yoga.YGJustify.YGJustifySpaceAround);
                break;
            case JustifyContent.SpaceEvenly:
                Yoga.YGNodeStyleSetJustifyContent(this.m_yogaNode, Yoga.YGJustify.YGJustifySpaceEvenly);
                break;
        }
    }

    get justifyContent() {
        return this.m_styleData.flex.justifyContent;
    }

    set alignItems(value: AlignItems) {
        if (value === this.m_styleData.flex.alignItems) return;

        this.m_styleData.flex.alignItems = value;
        switch (value) {
            case AlignItems.FlexStart:
                Yoga.YGNodeStyleSetAlignItems(this.m_yogaNode, Yoga.YGAlign.YGAlignFlexStart);
                break;
            case AlignItems.FlexEnd:
                Yoga.YGNodeStyleSetAlignItems(this.m_yogaNode, Yoga.YGAlign.YGAlignFlexEnd);
                break;
            case AlignItems.Center:
                Yoga.YGNodeStyleSetAlignItems(this.m_yogaNode, Yoga.YGAlign.YGAlignCenter);
                break;
            case AlignItems.Stretch:
                Yoga.YGNodeStyleSetAlignItems(this.m_yogaNode, Yoga.YGAlign.YGAlignStretch);
                break;
            case AlignItems.Baseline:
                Yoga.YGNodeStyleSetAlignItems(this.m_yogaNode, Yoga.YGAlign.YGAlignBaseline);
                break;
        }
    }

    get alignItems() {
        return this.m_styleData.flex.alignItems;
    }

    set flexWrap(value: FlexWrap) {
        if (value === this.m_styleData.flex.wrap) return;

        this.m_styleData.flex.wrap = value;
        switch (value) {
            case FlexWrap.NoWrap:
                Yoga.YGNodeStyleSetFlexWrap(this.m_yogaNode, Yoga.YGWrap.YGWrapNoWrap);
                break;
            case FlexWrap.Wrap:
                Yoga.YGNodeStyleSetFlexWrap(this.m_yogaNode, Yoga.YGWrap.YGWrapWrap);
                break;
            case FlexWrap.WrapReverse:
                Yoga.YGNodeStyleSetFlexWrap(this.m_yogaNode, Yoga.YGWrap.YGWrapWrapReverse);
                break;
        }
    }

    get flexWrap() {
        return this.m_styleData.flex.wrap;
    }

    set flexGrow(value: number) {
        if (value === this.m_styleData.flex.grow) return;

        this.m_styleData.flex.grow = value;
        Yoga.YGNodeStyleSetFlexGrow(this.m_yogaNode, value);
    }

    get flexGrow() {
        return this.m_styleData.flex.grow;
    }

    set flexShrink(value: number) {
        if (value === this.m_styleData.flex.shrink) return;

        this.m_styleData.flex.shrink = value;
        Yoga.YGNodeStyleSetFlexShrink(this.m_yogaNode, value);
    }

    get flexShrink() {
        return this.m_styleData.flex.shrink;
    }

    set flexBasis(value: Size | null) {
        if (!isChanged(value, this.m_styleData.flex.basis)) return;

        this.m_styleData.flex.basis = value;
        if (value) {
            if (value.unit === SizeUnit.percent) {
                Yoga.YGNodeStyleSetFlexBasisPercent(this.m_yogaNode, value.value);
            } else {
                Yoga.YGNodeStyleSetFlexBasis(this.m_yogaNode, this.resolveSize(value, Direction.Horizontal));
            }
        } else {
            Yoga.YGNodeStyleSetFlexBasisAuto(this.m_yogaNode);
        }
    }

    get flexBasis() {
        return this.m_styleData.flex.basis;
    }

    set flex(value: number) {
        this.flexGrow = value;
        this.flexShrink = value;
        this.flexBasis = null;
    }

    set gap(value: Size) {
        if (!isChanged(value, this.m_styleData.flex.gap)) return;

        this.m_styleData.flex.gap = value;
        if (value.unit === SizeUnit.percent) {
            Yoga.YGNodeStyleSetGapPercent(this.m_yogaNode, Yoga.YGGutter.YGGutterColumn, value.value);
            Yoga.YGNodeStyleSetGapPercent(this.m_yogaNode, Yoga.YGGutter.YGGutterRow, value.value);
        } else {
            Yoga.YGNodeStyleSetGap(
                this.m_yogaNode,
                Yoga.YGGutter.YGGutterColumn,
                this.resolveSize(value, Direction.Vertical)
            );
            Yoga.YGNodeStyleSetGap(
                this.m_yogaNode,
                Yoga.YGGutter.YGGutterRow,
                this.resolveSize(value, Direction.Horizontal)
            );
        }
    }

    get gap() {
        return this.m_styleData.flex.gap;
    }

    set lineHeight(value: Size) {
        if (!isChanged(value, this.m_styleData.lineHeight)) return;

        this.m_styleData.lineHeight = value;
    }

    get lineHeight() {
        return this.m_styleData.lineHeight;
    }

    set letterSpacing(value: Size) {
        if (!isChanged(value, this.m_styleData.letterSpacing)) return;

        this.m_styleData.letterSpacing = value;
    }

    get letterSpacing() {
        return this.m_styleData.letterSpacing;
    }

    set fontSize(value: Size) {
        if (!isChanged(value, this.m_styleData.fontSize)) return;

        this.m_styleData.fontSize = value;
    }

    get fontSize() {
        return this.m_styleData.fontSize;
    }

    set fontWeight(value: number) {
        if (value === this.m_styleData.fontWeight) return;

        this.m_styleData.fontWeight = value;
    }

    get fontWeight() {
        return this.m_styleData.fontWeight;
    }

    set fontFamily(value: string) {
        if (value === this.m_styleData.fontFamily) return;

        this.m_styleData.fontFamily = value;
    }

    get fontFamily() {
        return this.m_styleData.fontFamily;
    }

    set fontStyle(value: FontStyle) {
        if (value === this.m_styleData.fontStyle) return;

        this.m_styleData.fontStyle = value;
    }

    get fontStyle() {
        return this.m_styleData.fontStyle;
    }

    set textAlign(value: TextAlign) {
        if (value === this.m_styleData.textAlign) return;

        this.m_styleData.textAlign = value;
    }

    get textAlign() {
        return this.m_styleData.textAlign;
    }

    set textDecoration(value: TextDecoration) {
        if (value === this.m_styleData.textDecoration) return;

        this.m_styleData.textDecoration = value;
    }

    get textDecoration() {
        return this.m_styleData.textDecoration;
    }

    set whiteSpace(value: WhiteSpace) {
        if (value === this.m_styleData.whiteSpace) return;

        this.m_styleData.whiteSpace = value;
    }

    get whiteSpace() {
        return this.m_styleData.whiteSpace;
    }

    set wordBreak(value: WordBreak) {
        if (value === this.m_styleData.wordBreak) return;

        this.m_styleData.wordBreak = value;
    }

    get wordBreak() {
        return this.m_styleData.wordBreak;
    }

    set wordWrap(value: WordWrap) {
        if (value === this.m_styleData.wordWrap) return;

        this.m_styleData.wordWrap = value;
    }

    get wordWrap() {
        return this.m_styleData.wordWrap;
    }

    set overflow(value: Overflow) {
        if (value === this.m_styleData.overflow) return;

        this.m_styleData.overflow = value;

        switch (this.m_styleData.overflow) {
            case Overflow.Visible:
                Yoga.YGNodeStyleSetOverflow(this.m_yogaNode, Yoga.YGOverflow.YGOverflowVisible);
                break;
            case Overflow.Hidden:
                Yoga.YGNodeStyleSetOverflow(this.m_yogaNode, Yoga.YGOverflow.YGOverflowHidden);
                break;
            case Overflow.Scroll:
                Yoga.YGNodeStyleSetOverflow(this.m_yogaNode, Yoga.YGOverflow.YGOverflowScroll);
                break;
        }
    }

    get overflow() {
        return this.m_styleData.overflow;
    }

    set textOverflow(value: TextOverflow) {
        if (value === this.m_styleData.textOverflow) return;

        this.m_styleData.textOverflow = value;
    }

    get textOverflow() {
        return this.m_styleData.textOverflow;
    }

    set color(value: Color) {
        if (!isChanged(value, this.m_styleData.color)) return;

        this.m_styleData.color = value;
    }

    get color() {
        return this.m_styleData.color;
    }

    set backgroundColor(value: Color) {
        if (!isChanged(value, this.m_styleData.backgroundColor)) return;

        this.m_styleData.backgroundColor = value;
    }

    get backgroundColor() {
        return this.m_styleData.backgroundColor;
    }

    set borderWidth(value: Size) {
        if (!isChanged(value, this.m_styleData.border.width)) return;

        this.m_styleData.border.width = value;
        Yoga.YGNodeStyleSetBorder(
            this.m_yogaNode,
            Yoga.YGEdge.YGEdgeLeft,
            this.resolveSize(value, Direction.Horizontal)
        );
        Yoga.YGNodeStyleSetBorder(
            this.m_yogaNode,
            Yoga.YGEdge.YGEdgeRight,
            this.resolveSize(value, Direction.Horizontal)
        );
        Yoga.YGNodeStyleSetBorder(this.m_yogaNode, Yoga.YGEdge.YGEdgeTop, this.resolveSize(value, Direction.Vertical));
        Yoga.YGNodeStyleSetBorder(
            this.m_yogaNode,
            Yoga.YGEdge.YGEdgeBottom,
            this.resolveSize(value, Direction.Vertical)
        );
    }

    get borderWidth() {
        return this.m_styleData.border.width;
    }

    set borderColor(value: Color) {
        if (!isChanged(value, this.m_styleData.border.color)) return;

        this.m_styleData.border.color = value;
    }

    get borderColor() {
        return this.m_styleData.border.color;
    }

    set borderStyle(value: BorderStyle) {
        if (value === this.m_styleData.border.style) return;

        this.m_styleData.border.style = value;
    }

    get borderStyle() {
        return this.m_styleData.border.style;
    }

    set borderRadius(value: Size) {
        if (!isChanged(value, this.m_styleData.border.topLeftRadius)) return;

        this.m_styleData.border.topLeftRadius = value;
        this.m_styleData.border.topRightRadius = value;
        this.m_styleData.border.bottomLeftRadius = value;
        this.m_styleData.border.bottomRightRadius = value;
    }

    get borderRadius() {
        return this.m_styleData.border.topLeftRadius;
    }

    set borderTopLeftRadius(value: Size) {
        if (!isChanged(value, this.m_styleData.border.topLeftRadius)) return;

        this.m_styleData.border.topLeftRadius = value;
    }

    get borderTopLeftRadius() {
        return this.m_styleData.border.topLeftRadius;
    }

    set borderTopRightRadius(value: Size) {
        if (!isChanged(value, this.m_styleData.border.topRightRadius)) return;

        this.m_styleData.border.topRightRadius = value;
    }

    get borderTopRightRadius() {
        return this.m_styleData.border.topRightRadius;
    }

    set borderBottomLeftRadius(value: Size) {
        if (!isChanged(value, this.m_styleData.border.bottomLeftRadius)) return;

        this.m_styleData.border.bottomLeftRadius = value;
    }

    get borderBottomLeftRadius() {
        return this.m_styleData.border.bottomLeftRadius;
    }

    set borderBottomRightRadius(value: Size) {
        if (!isChanged(value, this.m_styleData.border.bottomRightRadius)) return;

        this.m_styleData.border.bottomRightRadius = value;
    }

    get borderBottomRightRadius() {
        return this.m_styleData.border.bottomRightRadius;
    }

    set margin(value: Size) {
        if (isChanged(value, this.m_styleData.margin.left)) {
            this.m_styleData.margin.left = value;

            if (value.unit === SizeUnit.percent) {
                Yoga.YGNodeStyleSetMarginPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeLeft, value.value);
            } else {
                Yoga.YGNodeStyleSetMargin(
                    this.m_yogaNode,
                    Yoga.YGEdge.YGEdgeLeft,
                    this.resolveSize(value, Direction.Horizontal)
                );
            }
        }

        if (isChanged(value, this.m_styleData.margin.right)) {
            this.m_styleData.margin.right = value;

            if (value.unit === SizeUnit.percent) {
                Yoga.YGNodeStyleSetMarginPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeRight, value.value);
            } else {
                Yoga.YGNodeStyleSetMargin(
                    this.m_yogaNode,
                    Yoga.YGEdge.YGEdgeRight,
                    this.resolveSize(value, Direction.Horizontal)
                );
            }
        }

        if (isChanged(value, this.m_styleData.margin.top)) {
            this.m_styleData.margin.top = value;

            if (value.unit === SizeUnit.percent) {
                Yoga.YGNodeStyleSetMarginPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeTop, value.value);
            } else {
                Yoga.YGNodeStyleSetMargin(
                    this.m_yogaNode,
                    Yoga.YGEdge.YGEdgeTop,
                    this.resolveSize(value, Direction.Vertical)
                );
            }
        }

        if (isChanged(value, this.m_styleData.margin.bottom)) {
            this.m_styleData.margin.bottom = value;

            if (value.unit === SizeUnit.percent) {
                Yoga.YGNodeStyleSetMarginPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeBottom, value.value);
            } else {
                Yoga.YGNodeStyleSetMargin(
                    this.m_yogaNode,
                    Yoga.YGEdge.YGEdgeBottom,
                    this.resolveSize(value, Direction.Vertical)
                );
            }
        }
    }

    get margin(): Margin {
        return this.m_styleData.margin;
    }

    set marginLeft(value: Size) {
        if (!isChanged(value, this.m_styleData.margin.left)) return;

        this.m_styleData.margin.left = value;
        if (value.unit === SizeUnit.percent) {
            Yoga.YGNodeStyleSetMarginPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeLeft, value.value);
        } else {
            Yoga.YGNodeStyleSetMargin(
                this.m_yogaNode,
                Yoga.YGEdge.YGEdgeLeft,
                this.resolveSize(value, Direction.Horizontal)
            );
        }
    }

    get marginLeft() {
        return this.m_styleData.margin.left;
    }

    set marginRight(value: Size) {
        if (!isChanged(value, this.m_styleData.margin.right)) return;

        this.m_styleData.margin.right = value;
        if (value.unit === SizeUnit.percent) {
            Yoga.YGNodeStyleSetMarginPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeRight, value.value);
        } else {
            Yoga.YGNodeStyleSetMargin(
                this.m_yogaNode,
                Yoga.YGEdge.YGEdgeRight,
                this.resolveSize(value, Direction.Horizontal)
            );
        }
    }

    get marginRight() {
        return this.m_styleData.margin.right;
    }

    set marginTop(value: Size) {
        if (!isChanged(value, this.m_styleData.margin.top)) return;

        this.m_styleData.margin.top = value;
        if (value.unit === SizeUnit.percent) {
            Yoga.YGNodeStyleSetMarginPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeTop, value.value);
        } else {
            Yoga.YGNodeStyleSetMargin(
                this.m_yogaNode,
                Yoga.YGEdge.YGEdgeTop,
                this.resolveSize(value, Direction.Vertical)
            );
        }
    }

    get marginTop() {
        return this.m_styleData.margin.top;
    }

    set marginBottom(value: Size) {
        if (!isChanged(value, this.m_styleData.margin.bottom)) return;

        this.m_styleData.margin.bottom = value;
        if (value.unit === SizeUnit.percent) {
            Yoga.YGNodeStyleSetMarginPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeBottom, value.value);
        } else {
            Yoga.YGNodeStyleSetMargin(
                this.m_yogaNode,
                Yoga.YGEdge.YGEdgeBottom,
                this.resolveSize(value, Direction.Vertical)
            );
        }
    }

    get marginBottom() {
        return this.m_styleData.margin.bottom;
    }

    set padding(value: Size) {
        if (isChanged(value, this.m_styleData.padding.left)) {
            this.m_styleData.padding.left = value;

            if (value.unit === SizeUnit.percent) {
                Yoga.YGNodeStyleSetPaddingPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeLeft, value.value);
            } else {
                Yoga.YGNodeStyleSetPadding(
                    this.m_yogaNode,
                    Yoga.YGEdge.YGEdgeLeft,
                    this.resolveSize(value, Direction.Horizontal)
                );
            }
        }

        if (isChanged(value, this.m_styleData.padding.right)) {
            this.m_styleData.padding.right = value;

            if (value.unit === SizeUnit.percent) {
                Yoga.YGNodeStyleSetPaddingPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeRight, value.value);
            } else {
                Yoga.YGNodeStyleSetPadding(
                    this.m_yogaNode,
                    Yoga.YGEdge.YGEdgeRight,
                    this.resolveSize(value, Direction.Horizontal)
                );
            }
        }

        if (isChanged(value, this.m_styleData.padding.top)) {
            this.m_styleData.padding.top = value;

            if (value.unit === SizeUnit.percent) {
                Yoga.YGNodeStyleSetPaddingPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeTop, value.value);
            } else {
                Yoga.YGNodeStyleSetPadding(
                    this.m_yogaNode,
                    Yoga.YGEdge.YGEdgeTop,
                    this.resolveSize(value, Direction.Vertical)
                );
            }
        }

        if (isChanged(value, this.m_styleData.padding.bottom)) {
            this.m_styleData.padding.bottom = value;

            if (value.unit === SizeUnit.percent) {
                Yoga.YGNodeStyleSetPaddingPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeBottom, value.value);
            } else {
                Yoga.YGNodeStyleSetPadding(
                    this.m_yogaNode,
                    Yoga.YGEdge.YGEdgeBottom,
                    this.resolveSize(value, Direction.Vertical)
                );
            }
        }
    }

    get padding(): Padding {
        return this.m_styleData.padding;
    }

    set paddingLeft(value: Size) {
        if (!isChanged(value, this.m_styleData.padding.left)) return;

        this.m_styleData.padding.left = value;
        if (value.unit === SizeUnit.percent) {
            Yoga.YGNodeStyleSetPaddingPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeLeft, value.value);
        } else {
            Yoga.YGNodeStyleSetPadding(
                this.m_yogaNode,
                Yoga.YGEdge.YGEdgeLeft,
                this.resolveSize(value, Direction.Horizontal)
            );
        }
    }

    get paddingLeft() {
        return this.m_styleData.padding.left;
    }

    set paddingRight(value: Size) {
        if (!isChanged(value, this.m_styleData.padding.right)) return;

        this.m_styleData.padding.right = value;
        if (value.unit === SizeUnit.percent) {
            Yoga.YGNodeStyleSetPaddingPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeRight, value.value);
        } else {
            Yoga.YGNodeStyleSetPadding(
                this.m_yogaNode,
                Yoga.YGEdge.YGEdgeRight,
                this.resolveSize(value, Direction.Horizontal)
            );
        }
    }

    get paddingRight() {
        return this.m_styleData.padding.right;
    }

    set paddingTop(value: Size) {
        if (!isChanged(value, this.m_styleData.padding.top)) return;

        this.m_styleData.padding.top = value;
        if (value.unit === SizeUnit.percent) {
            Yoga.YGNodeStyleSetPaddingPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeTop, value.value);
        } else {
            Yoga.YGNodeStyleSetPadding(
                this.m_yogaNode,
                Yoga.YGEdge.YGEdgeTop,
                this.resolveSize(value, Direction.Vertical)
            );
        }
    }

    get paddingTop() {
        return this.m_styleData.padding.top;
    }

    set paddingBottom(value: Size) {
        if (!isChanged(value, this.m_styleData.padding.bottom)) return;

        this.m_styleData.padding.bottom = value;
        if (value.unit === SizeUnit.percent) {
            Yoga.YGNodeStyleSetPaddingPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeBottom, value.value);
        } else {
            Yoga.YGNodeStyleSetPadding(
                this.m_yogaNode,
                Yoga.YGEdge.YGEdgeBottom,
                this.resolveSize(value, Direction.Vertical)
            );
        }
    }

    get paddingBottom() {
        return this.m_styleData.padding.bottom;
    }

    get computedFontSize() {
        return this.resolveFontSize(this.m_styleData.fontSize);
    }

    /** @internal */
    resolveFontSize(size: Size): number {
        switch (size.unit) {
            case SizeUnit.px:
                return size.value;
            case SizeUnit.percent:
                if (!this.m_parent) return size.value * 0.01 * DEFAULT_FONT_SIZE;
                return size.value * 0.01 * this.m_parent.resolveFontSize(this.m_parent.m_styleData.fontSize);
            case SizeUnit.em:
                if (!this.m_parent) return size.value * DEFAULT_FONT_SIZE;
                return size.value * this.m_parent.resolveFontSize(this.m_parent.m_styleData.fontSize);
            case SizeUnit.rem:
                if (!this.m_root) return size.value * DEFAULT_FONT_SIZE;
                return size.value * this.m_root.resolveFontSize(this.m_root.m_styleData.fontSize);
            case SizeUnit.vw:
                return size.value * 0.01 * this.m_window.getSize().x;
            case SizeUnit.vh:
                return size.value * 0.01 * this.m_window.getSize().y;
        }
    }

    /** @internal */
    resolveSize(size: Size, axis: Direction): number {
        switch (size.unit) {
            case SizeUnit.px:
                return size.value;
            case SizeUnit.percent:
                let percentOf: number;
                if (!this.m_parent) {
                    if (axis === Direction.Horizontal) percentOf = this.m_window.getSize().x;
                    else percentOf = this.m_window.getSize().y;
                } else {
                    if (axis === Direction.Horizontal) percentOf = this.m_parent.clientRect.width;
                    else percentOf = this.m_parent.clientRect.height;
                }

                return size.value * 0.01 * percentOf;
            case SizeUnit.em:
                return size.value * this.resolveFontSize(this.m_styleData.fontSize);
            case SizeUnit.rem:
                if (!this.m_root) return size.value * DEFAULT_FONT_SIZE;
                return size.value * this.m_root.resolveFontSize(this.m_root.m_styleData.fontSize);
            case SizeUnit.vw:
                return size.value * 0.01 * this.m_window.getSize().x;
            case SizeUnit.vh:
                return size.value * 0.01 * this.m_window.getSize().y;
        }
    }

    /** @internal */
    resolveBorderRadius(size: Size, calculatedWidth: number, calculatedHeight: number, axis: Direction): number {
        switch (size.unit) {
            case SizeUnit.px:
                return size.value;
            case SizeUnit.percent:
                let percentOf: number;

                if (axis === Direction.Horizontal) percentOf = calculatedWidth;
                else percentOf = calculatedHeight;

                return size.value * 0.01 * percentOf;
            case SizeUnit.em:
                return size.value * this.resolveFontSize(this.m_styleData.fontSize);
            case SizeUnit.rem:
                if (!this.m_root) return size.value * DEFAULT_FONT_SIZE;
                return size.value * this.m_root.resolveFontSize(this.m_root.m_styleData.fontSize);
            case SizeUnit.vw:
                return size.value * 0.01 * this.m_window.getSize().x;
            case SizeUnit.vh:
                return size.value * 0.01 * this.m_window.getSize().y;
        }
    }

    /** @internal */
    resolveBorderWidth(size: Size): number {
        switch (size.unit) {
            case SizeUnit.px:
                return size.value;
            case SizeUnit.percent:
                return 0;
            case SizeUnit.em:
                return size.value * this.resolveFontSize(this.m_styleData.fontSize);
            case SizeUnit.rem:
                if (!this.m_root) return size.value * DEFAULT_FONT_SIZE;
                return size.value * this.m_root.resolveFontSize(this.m_root.m_styleData.fontSize);
            case SizeUnit.vw:
                return size.value * 0.01 * this.m_window.getSize().x;
            case SizeUnit.vh:
                return size.value * 0.01 * this.m_window.getSize().y;
        }
    }

    /** @internal */
    private configureDimensions() {
        if (this.m_styleData.minWidth) {
            if (this.m_styleData.minWidth.unit === SizeUnit.percent) {
                Yoga.YGNodeStyleSetMinWidthPercent(this.m_yogaNode, this.m_styleData.minWidth.value);
            } else {
                Yoga.YGNodeStyleSetMinWidth(
                    this.m_yogaNode,
                    this.resolveSize(this.m_styleData.minWidth, Direction.Horizontal)
                );
            }
        }

        if (this.m_styleData.minHeight) {
            if (this.m_styleData.minHeight.unit === SizeUnit.percent) {
                Yoga.YGNodeStyleSetMinHeightPercent(this.m_yogaNode, this.m_styleData.minHeight.value);
            } else {
                Yoga.YGNodeStyleSetMinHeight(
                    this.m_yogaNode,
                    this.resolveSize(this.m_styleData.minHeight, Direction.Vertical)
                );
            }
        }

        if (this.m_styleData.maxWidth) {
            if (this.m_styleData.maxWidth.unit === SizeUnit.percent) {
                Yoga.YGNodeStyleSetMaxWidthPercent(this.m_yogaNode, this.m_styleData.maxWidth.value);
            } else {
                Yoga.YGNodeStyleSetMaxWidth(
                    this.m_yogaNode,
                    this.resolveSize(this.m_styleData.maxWidth, Direction.Horizontal)
                );
            }
        }

        if (this.m_styleData.maxHeight) {
            if (this.m_styleData.maxHeight.unit === SizeUnit.percent) {
                Yoga.YGNodeStyleSetMaxHeightPercent(this.m_yogaNode, this.m_styleData.maxHeight.value);
            } else {
                Yoga.YGNodeStyleSetMaxHeight(
                    this.m_yogaNode,
                    this.resolveSize(this.m_styleData.maxHeight, Direction.Vertical)
                );
            }
        }

        if (this.m_styleData.width) {
            if (this.m_styleData.width.unit === SizeUnit.percent) {
                Yoga.YGNodeStyleSetWidthPercent(this.m_yogaNode, this.m_styleData.width.value);
            } else {
                Yoga.YGNodeStyleSetWidth(
                    this.m_yogaNode,
                    this.resolveSize(this.m_styleData.width, Direction.Horizontal)
                );
            }
        } else {
            Yoga.YGNodeStyleSetWidthAuto(this.m_yogaNode);
        }

        if (this.m_styleData.height) {
            if (this.m_styleData.height.unit === SizeUnit.percent) {
                Yoga.YGNodeStyleSetHeightPercent(this.m_yogaNode, this.m_styleData.height.value);
            } else {
                Yoga.YGNodeStyleSetHeight(
                    this.m_yogaNode,
                    this.resolveSize(this.m_styleData.height, Direction.Vertical)
                );
            }
        } else {
            Yoga.YGNodeStyleSetHeightAuto(this.m_yogaNode);
        }
    }

    /** @internal */
    private configurePositioning() {
        switch (this.m_styleData.position) {
            case Position.Static:
                Yoga.YGNodeStyleSetPositionType(this.m_yogaNode, Yoga.YGPositionType.YGPositionTypeStatic);
                break;
            case Position.Relative:
                Yoga.YGNodeStyleSetPositionType(this.m_yogaNode, Yoga.YGPositionType.YGPositionTypeRelative);
                break;
            case Position.Absolute:
                Yoga.YGNodeStyleSetPositionType(this.m_yogaNode, Yoga.YGPositionType.YGPositionTypeAbsolute);
                break;
            case Position.Fixed:
                // todo: What's different?
                Yoga.YGNodeStyleSetPositionType(this.m_yogaNode, Yoga.YGPositionType.YGPositionTypeAbsolute);
                break;
            case Position.Sticky:
                // todo: What's different?
                Yoga.YGNodeStyleSetPositionType(this.m_yogaNode, Yoga.YGPositionType.YGPositionTypeAbsolute);
                break;
        }

        if (this.m_styleData.top) {
            if (this.m_styleData.top.unit === SizeUnit.percent) {
                Yoga.YGNodeStyleSetPositionPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeTop, this.m_styleData.top.value);
            } else {
                Yoga.YGNodeStyleSetPosition(
                    this.m_yogaNode,
                    Yoga.YGEdge.YGEdgeTop,
                    this.resolveSize(this.m_styleData.top, Direction.Vertical)
                );
            }
        } else {
            Yoga.YGNodeStyleSetPositionAuto(this.m_yogaNode, Yoga.YGEdge.YGEdgeTop);
        }

        if (this.m_styleData.right) {
            if (this.m_styleData.right.unit === SizeUnit.percent) {
                Yoga.YGNodeStyleSetPositionPercent(
                    this.m_yogaNode,
                    Yoga.YGEdge.YGEdgeRight,
                    this.m_styleData.right.value
                );
            } else {
                Yoga.YGNodeStyleSetPosition(
                    this.m_yogaNode,
                    Yoga.YGEdge.YGEdgeRight,
                    this.resolveSize(this.m_styleData.right, Direction.Horizontal)
                );
            }
        } else {
            Yoga.YGNodeStyleSetPositionAuto(this.m_yogaNode, Yoga.YGEdge.YGEdgeRight);
        }

        if (this.m_styleData.bottom) {
            if (this.m_styleData.bottom.unit === SizeUnit.percent) {
                Yoga.YGNodeStyleSetPositionPercent(
                    this.m_yogaNode,
                    Yoga.YGEdge.YGEdgeBottom,
                    this.m_styleData.bottom.value
                );
            } else {
                Yoga.YGNodeStyleSetPosition(
                    this.m_yogaNode,
                    Yoga.YGEdge.YGEdgeBottom,
                    this.resolveSize(this.m_styleData.bottom, Direction.Vertical)
                );
            }
        } else {
            Yoga.YGNodeStyleSetPositionAuto(this.m_yogaNode, Yoga.YGEdge.YGEdgeBottom);
        }

        if (this.m_styleData.left) {
            if (this.m_styleData.left.unit === SizeUnit.percent) {
                Yoga.YGNodeStyleSetPositionPercent(
                    this.m_yogaNode,
                    Yoga.YGEdge.YGEdgeLeft,
                    this.m_styleData.left.value
                );
            } else {
                Yoga.YGNodeStyleSetPosition(
                    this.m_yogaNode,
                    Yoga.YGEdge.YGEdgeLeft,
                    this.resolveSize(this.m_styleData.left, Direction.Horizontal)
                );
            }
        } else {
            Yoga.YGNodeStyleSetPositionAuto(this.m_yogaNode, Yoga.YGEdge.YGEdgeLeft);
        }
    }

    /** @internal */
    private configureFlex() {
        switch (this.m_styleData.flex.direction) {
            case FlexDirection.Row:
                Yoga.YGNodeStyleSetFlexDirection(this.m_yogaNode, Yoga.YGFlexDirection.YGFlexDirectionRow);
                break;
            case FlexDirection.RowReverse:
                Yoga.YGNodeStyleSetFlexDirection(this.m_yogaNode, Yoga.YGFlexDirection.YGFlexDirectionRowReverse);
                break;
            case FlexDirection.Column:
                Yoga.YGNodeStyleSetFlexDirection(this.m_yogaNode, Yoga.YGFlexDirection.YGFlexDirectionColumn);
                break;
            case FlexDirection.ColumnReverse:
                Yoga.YGNodeStyleSetFlexDirection(this.m_yogaNode, Yoga.YGFlexDirection.YGFlexDirectionColumnReverse);
                break;
        }

        switch (this.m_styleData.flex.justifyContent) {
            case JustifyContent.FlexStart:
                Yoga.YGNodeStyleSetJustifyContent(this.m_yogaNode, Yoga.YGJustify.YGJustifyFlexStart);
                break;
            case JustifyContent.FlexEnd:
                Yoga.YGNodeStyleSetJustifyContent(this.m_yogaNode, Yoga.YGJustify.YGJustifyFlexEnd);
                break;
            case JustifyContent.Center:
                Yoga.YGNodeStyleSetJustifyContent(this.m_yogaNode, Yoga.YGJustify.YGJustifyCenter);
                break;
            case JustifyContent.SpaceBetween:
                Yoga.YGNodeStyleSetJustifyContent(this.m_yogaNode, Yoga.YGJustify.YGJustifySpaceBetween);
                break;
            case JustifyContent.SpaceAround:
                Yoga.YGNodeStyleSetJustifyContent(this.m_yogaNode, Yoga.YGJustify.YGJustifySpaceAround);
                break;
            case JustifyContent.SpaceEvenly:
                Yoga.YGNodeStyleSetJustifyContent(this.m_yogaNode, Yoga.YGJustify.YGJustifySpaceEvenly);
                break;
        }

        switch (this.m_styleData.flex.alignItems) {
            case AlignItems.FlexStart:
                Yoga.YGNodeStyleSetAlignItems(this.m_yogaNode, Yoga.YGAlign.YGAlignFlexStart);
                break;
            case AlignItems.FlexEnd:
                Yoga.YGNodeStyleSetAlignItems(this.m_yogaNode, Yoga.YGAlign.YGAlignFlexEnd);
                break;
            case AlignItems.Center:
                Yoga.YGNodeStyleSetAlignItems(this.m_yogaNode, Yoga.YGAlign.YGAlignCenter);
                break;
            case AlignItems.Stretch:
                Yoga.YGNodeStyleSetAlignItems(this.m_yogaNode, Yoga.YGAlign.YGAlignStretch);
                break;
            case AlignItems.Baseline:
                Yoga.YGNodeStyleSetAlignItems(this.m_yogaNode, Yoga.YGAlign.YGAlignBaseline);
                break;
        }

        switch (this.m_styleData.flex.wrap) {
            case FlexWrap.NoWrap:
                Yoga.YGNodeStyleSetFlexWrap(this.m_yogaNode, Yoga.YGWrap.YGWrapNoWrap);
                break;
            case FlexWrap.Wrap:
                Yoga.YGNodeStyleSetFlexWrap(this.m_yogaNode, Yoga.YGWrap.YGWrapWrap);
                break;
            case FlexWrap.WrapReverse:
                Yoga.YGNodeStyleSetFlexWrap(this.m_yogaNode, Yoga.YGWrap.YGWrapWrapReverse);
                break;
        }

        Yoga.YGNodeStyleSetFlexGrow(this.m_yogaNode, this.m_styleData.flex.grow);

        Yoga.YGNodeStyleSetFlexShrink(this.m_yogaNode, this.m_styleData.flex.shrink);

        if (this.m_styleData.flex.basis) {
            if (this.m_styleData.flex.basis.unit === SizeUnit.percent) {
                Yoga.YGNodeStyleSetFlexBasisPercent(this.m_yogaNode, this.m_styleData.flex.basis.value);
            } else {
                Yoga.YGNodeStyleSetFlexBasis(
                    this.m_yogaNode,
                    this.resolveSize(this.m_styleData.flex.basis, Direction.Horizontal)
                );
            }
        } else {
            Yoga.YGNodeStyleSetFlexBasisAuto(this.m_yogaNode);
        }

        if (this.m_styleData.flex.gap.unit === SizeUnit.percent) {
            Yoga.YGNodeStyleSetGapPercent(
                this.m_yogaNode,
                Yoga.YGGutter.YGGutterColumn,
                this.m_styleData.flex.gap.value
            );
            Yoga.YGNodeStyleSetGapPercent(this.m_yogaNode, Yoga.YGGutter.YGGutterRow, this.m_styleData.flex.gap.value);
        } else {
            Yoga.YGNodeStyleSetGap(
                this.m_yogaNode,
                Yoga.YGGutter.YGGutterColumn,
                this.resolveSize(this.m_styleData.flex.gap, Direction.Vertical)
            );

            Yoga.YGNodeStyleSetGap(
                this.m_yogaNode,
                Yoga.YGGutter.YGGutterRow,
                this.resolveSize(this.m_styleData.flex.gap, Direction.Horizontal)
            );
        }
    }

    /** @internal */
    private configureBorders() {
        Yoga.YGNodeStyleSetBorder(
            this.m_yogaNode,
            Yoga.YGEdge.YGEdgeTop,
            this.resolveSize(this.m_styleData.border.width, Direction.Vertical)
        );

        Yoga.YGNodeStyleSetBorder(
            this.m_yogaNode,
            Yoga.YGEdge.YGEdgeRight,
            this.resolveSize(this.m_styleData.border.width, Direction.Horizontal)
        );

        Yoga.YGNodeStyleSetBorder(
            this.m_yogaNode,
            Yoga.YGEdge.YGEdgeBottom,
            this.resolveSize(this.m_styleData.border.width, Direction.Vertical)
        );

        Yoga.YGNodeStyleSetBorder(
            this.m_yogaNode,
            Yoga.YGEdge.YGEdgeLeft,
            this.resolveSize(this.m_styleData.border.width, Direction.Horizontal)
        );
    }

    /** @internal */
    private configurePadding() {
        if (this.m_styleData.padding.top.unit === SizeUnit.percent) {
            Yoga.YGNodeStyleSetPaddingPercent(
                this.m_yogaNode,
                Yoga.YGEdge.YGEdgeTop,
                this.m_styleData.padding.top.value
            );
        } else {
            Yoga.YGNodeStyleSetPadding(
                this.m_yogaNode,
                Yoga.YGEdge.YGEdgeTop,
                this.resolveSize(this.m_styleData.padding.top, Direction.Vertical)
            );
        }

        if (this.m_styleData.padding.right.unit === SizeUnit.percent) {
            Yoga.YGNodeStyleSetPaddingPercent(
                this.m_yogaNode,
                Yoga.YGEdge.YGEdgeRight,
                this.m_styleData.padding.right.value
            );
        } else {
            Yoga.YGNodeStyleSetPadding(
                this.m_yogaNode,
                Yoga.YGEdge.YGEdgeRight,
                this.resolveSize(this.m_styleData.padding.right, Direction.Horizontal)
            );
        }

        if (this.m_styleData.padding.bottom.unit === SizeUnit.percent) {
            Yoga.YGNodeStyleSetPaddingPercent(
                this.m_yogaNode,
                Yoga.YGEdge.YGEdgeBottom,
                this.m_styleData.padding.bottom.value
            );
        } else {
            Yoga.YGNodeStyleSetPadding(
                this.m_yogaNode,
                Yoga.YGEdge.YGEdgeBottom,
                this.resolveSize(this.m_styleData.padding.bottom, Direction.Vertical)
            );
        }

        if (this.m_styleData.padding.left.unit === SizeUnit.percent) {
            Yoga.YGNodeStyleSetPaddingPercent(
                this.m_yogaNode,
                Yoga.YGEdge.YGEdgeLeft,
                this.m_styleData.padding.left.value
            );
        } else {
            Yoga.YGNodeStyleSetPadding(
                this.m_yogaNode,
                Yoga.YGEdge.YGEdgeLeft,
                this.resolveSize(this.m_styleData.padding.left, Direction.Horizontal)
            );
        }
    }

    /** @internal */
    private configureMargin() {
        if (this.m_styleData.margin.top.unit === SizeUnit.percent) {
            Yoga.YGNodeStyleSetMarginPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeTop, this.m_styleData.margin.top.value);
        } else {
            Yoga.YGNodeStyleSetMargin(
                this.m_yogaNode,
                Yoga.YGEdge.YGEdgeTop,
                this.resolveSize(this.m_styleData.margin.top, Direction.Vertical)
            );
        }

        if (this.m_styleData.margin.right.unit === SizeUnit.percent) {
            Yoga.YGNodeStyleSetMarginPercent(
                this.m_yogaNode,
                Yoga.YGEdge.YGEdgeRight,
                this.m_styleData.margin.right.value
            );
        } else {
            Yoga.YGNodeStyleSetMargin(
                this.m_yogaNode,
                Yoga.YGEdge.YGEdgeRight,
                this.resolveSize(this.m_styleData.margin.right, Direction.Horizontal)
            );
        }

        if (this.m_styleData.margin.bottom.unit === SizeUnit.percent) {
            Yoga.YGNodeStyleSetMarginPercent(
                this.m_yogaNode,
                Yoga.YGEdge.YGEdgeBottom,
                this.m_styleData.margin.bottom.value
            );
        } else {
            Yoga.YGNodeStyleSetMargin(
                this.m_yogaNode,
                Yoga.YGEdge.YGEdgeBottom,
                this.resolveSize(this.m_styleData.margin.bottom, Direction.Vertical)
            );
        }

        if (this.m_styleData.margin.left.unit === SizeUnit.percent) {
            Yoga.YGNodeStyleSetMarginPercent(
                this.m_yogaNode,
                Yoga.YGEdge.YGEdgeLeft,
                this.m_styleData.margin.left.value
            );
        } else {
            Yoga.YGNodeStyleSetMargin(
                this.m_yogaNode,
                Yoga.YGEdge.YGEdgeLeft,
                this.resolveSize(this.m_styleData.margin.left, Direction.Horizontal)
            );
        }
    }

    private configureOverflow() {
        switch (this.m_styleData.overflow) {
            case Overflow.Visible:
                Yoga.YGNodeStyleSetOverflow(this.m_yogaNode, Yoga.YGOverflow.YGOverflowVisible);
                break;
            case Overflow.Hidden:
                Yoga.YGNodeStyleSetOverflow(this.m_yogaNode, Yoga.YGOverflow.YGOverflowHidden);
                break;
            case Overflow.Scroll:
                Yoga.YGNodeStyleSetOverflow(this.m_yogaNode, Yoga.YGOverflow.YGOverflowScroll);
                break;
        }
    }

    /** @internal */
    configureYogaNode() {
        Yoga.YGNodeStyleSetDisplay(this.m_yogaNode, Yoga.YGDisplay.YGDisplayFlex);

        this.configureDimensions();
        this.configurePositioning();
        this.configureFlex();
        this.configureBorders();
        this.configurePadding();
        this.configureMargin();
        this.configureOverflow();
    }

    /** @internal */
    readLayout() {
        const left = Yoga.YGNodeLayoutGetLeft(this.m_yogaNode);
        const top = Yoga.YGNodeLayoutGetTop(this.m_yogaNode);
        const width = Yoga.YGNodeLayoutGetWidth(this.m_yogaNode);
        const height = Yoga.YGNodeLayoutGetHeight(this.m_yogaNode);

        const topLeftRadius = this.resolveBorderRadius(
            this.m_styleData.border.topLeftRadius,
            width,
            height,
            Direction.Horizontal
        );

        const topRightRadius = this.resolveBorderRadius(
            this.m_styleData.border.topRightRadius,
            width,
            height,
            Direction.Horizontal
        );

        const bottomLeftRadius = this.resolveBorderRadius(
            this.m_styleData.border.bottomLeftRadius,
            width,
            height,
            Direction.Horizontal
        );

        const bottomRightRadius = this.resolveBorderRadius(
            this.m_styleData.border.bottomRightRadius,
            width,
            height,
            Direction.Horizontal
        );

        const paddingLeft = this.resolveSize(this.m_styleData.padding.left, Direction.Horizontal);
        const paddingRight = this.resolveSize(this.m_styleData.padding.right, Direction.Horizontal);
        const paddingTop = this.resolveSize(this.m_styleData.padding.top, Direction.Vertical);
        const paddingBottom = this.resolveSize(this.m_styleData.padding.bottom, Direction.Vertical);
        const marginLeft = this.resolveSize(this.m_styleData.margin.left, Direction.Horizontal);
        const marginRight = this.resolveSize(this.m_styleData.margin.right, Direction.Horizontal);
        const marginTop = this.resolveSize(this.m_styleData.margin.top, Direction.Vertical);
        const marginBottom = this.resolveSize(this.m_styleData.margin.bottom, Direction.Vertical);

        this.m_clientRect = {
            x: left,
            y: top,
            top,
            left,
            right: left + width,
            bottom: top + height,
            width,
            height,
            topLeftRadius,
            topRightRadius,
            bottomLeftRadius,
            bottomRightRadius,
            paddingLeft,
            paddingRight,
            paddingTop,
            paddingBottom,
            marginLeft,
            marginRight,
            marginTop,
            marginBottom,
            depth: 0
        };

        if (this.m_parent) {
            switch (this.m_parent.m_styleData.position) {
                case Position.Static:
                case Position.Relative:
                    const parentRect = this.m_parent.m_clientRect;
                    this.m_clientRect.x += parentRect.x;
                    this.m_clientRect.y += parentRect.y;
                    this.m_clientRect.left += parentRect.x;
                    this.m_clientRect.top += parentRect.y;
                    this.m_clientRect.right += parentRect.x;
                    this.m_clientRect.bottom += parentRect.y;
                    break;
                default:
                    break;
            }
        }
    }
}
