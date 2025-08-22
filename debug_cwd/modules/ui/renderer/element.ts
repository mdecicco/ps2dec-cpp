import * as Yoga from 'yoga';
import { EventProducer } from 'event';
import { Window } from 'window';
import { vec2f } from 'math';
import { TreeNode } from 'mini-react/vdom';

import { KeyboardEvent, MouseEvent, ResizeEvent, ScrollEvent, UIEvent, WheelEvent } from '../types/events';
import { ParsedStyleProps } from '../types/style';
import { TextNode } from '../types/text-node';
import { UINode } from '../types/ui-node';
import { BoxNode } from '../types/box-node';
import type { BoxProps } from '../types/elements';
import { Geometry, TextGeometry, BoxGeometry, BoxProperties } from '../types/geometry';

import { Style } from './style';
import { getCompleteStyle, FontManager } from '../utils';
import { isChanged } from 'is-changed';
import { buildBoxGeometry } from 'ui/utils/box-geometry';
import { vec2 } from 'math-ext';

type ElementEvents = {
    click?: (event: MouseEvent) => void;
    mousedown?: (event: MouseEvent) => void;
    mouseup?: (event: MouseEvent) => void;
    mouseenter?: (event: MouseEvent) => void;
    mouseleave?: (event: MouseEvent) => void;
    mousemove?: (event: MouseEvent) => void;
    mouseout?: (event: MouseEvent) => void;
    mouseover?: (event: MouseEvent) => void;
    scroll?: (event: ScrollEvent) => void;
    mousewheel?: (event: WheelEvent) => void;
    keydown?: (event: KeyboardEvent) => void;
    keyup?: (event: KeyboardEvent) => void;
    focus?: (event: UIEvent) => void;
    blur?: (event: UIEvent) => void;
    resize?: (event: ResizeEvent) => void;
};

type RendererState = {
    isHovered: boolean;
};

export class Element extends EventProducer<ElementEvents> {
    /** @internal */ private m_treeNode: TreeNode;
    /** @internal */ private m_window: Window;
    /** @internal */ private m_source: UINode;
    /** @internal */ private m_root: Element | null;
    /** @internal */ private m_parent: Element | null;
    /** @internal */ private m_children: Element[];
    /** @internal */ private m_yogaNode: Yoga.YGNodeRef;
    /** @internal */ private m_fontManager: FontManager;
    /** @internal */ private m_geometry: Geometry | null;
    /** @internal */ private m_scrollOffset: vec2;
    /** @internal */ private m_contentSize: vec2;
    /** @internal */ private m_styleProps: ParsedStyleProps;
    /** @internal */ private m_style: Style;
    /** @internal */ private m_rendererState: RendererState;

    /** @internal */
    constructor(
        window: Window,
        source: UINode,
        root: Element | null,
        parent: Element | null,
        fontManager: FontManager
    ) {
        super();

        this.m_window = window;
        this.m_source = source;
        this.m_root = root;
        this.m_treeNode = source.node;
        this.m_parent = parent;
        this.m_children = [];
        this.m_yogaNode = Yoga.YGNodeNew();
        this.m_fontManager = fontManager;
        this.m_geometry = null;
        this.m_scrollOffset = new vec2();
        this.m_contentSize = new vec2();
        this.m_styleProps = source.style;
        this.m_style = new Style(
            this.m_yogaNode,
            getCompleteStyle(this.m_parent?.m_styleProps, this.m_styleProps),
            this.m_parent ? this.m_parent.m_style : null,
            this.m_root ? this.m_root.m_style : null,
            this.m_window
        );
        this.m_rendererState = {
            isHovered: false
        };

        Yoga.YGConfigSetUseWebDefaults(Yoga.YGConfigGetDefault(), true);

        if (this.m_source instanceof TextNode) {
            Yoga.YGNodeSetNodeType(this.m_yogaNode, Yoga.YGNodeType.YGNodeTypeText);
            Yoga.YGNodeSetMeasureFunc(this.m_yogaNode, (width, widthMode, height, heightMode) => {
                if (!(this.m_source instanceof TextNode)) return new vec2f(0.0, 0.0);

                let maxWidth = 0.0;
                let maxHeight = 0.0;

                switch (widthMode) {
                    case Yoga.YGMeasureMode.YGMeasureModeUndefined:
                        maxWidth = Infinity;
                        break;
                    case Yoga.YGMeasureMode.YGMeasureModeExactly:
                        maxWidth = width;
                        break;
                    case Yoga.YGMeasureMode.YGMeasureModeAtMost:
                        maxWidth = width;
                        break;
                }

                switch (heightMode) {
                    case Yoga.YGMeasureMode.YGMeasureModeUndefined:
                        maxHeight = Infinity;
                        break;
                    case Yoga.YGMeasureMode.YGMeasureModeExactly:
                        maxHeight = height;
                        break;
                    case Yoga.YGMeasureMode.YGMeasureModeAtMost:
                        maxHeight = height;
                        break;
                }

                const textProperties = FontManager.extractTextProperties(this.m_style, maxWidth, maxHeight);
                const fontFamily = this.m_fontManager.findFontFamily(textProperties);
                if (!fontFamily) {
                    return new vec2f(0, 0);
                }

                this.m_geometry = fontFamily.createTextGeometry(this.m_source.text, textProperties);

                return new vec2f(
                    Math.min(maxWidth, this.m_geometry.width),
                    Math.min(maxHeight, this.m_geometry.height)
                );
            });
        }

        this.bindListeners();
    }

    /** @internal */
    get yogaNode() {
        return this.m_yogaNode;
    }

    /** @internal */
    get treeNode() {
        return this.m_treeNode;
    }

    /** @internal */
    get source() {
        return this.m_source;
    }

    /** @internal */
    get rendererState() {
        return this.m_rendererState;
    }

    get window() {
        return this.m_window;
    }

    get root() {
        return this.m_root;
    }

    get parent() {
        return this.m_parent;
    }

    get children() {
        return Array.from(this.m_children);
    }

    get style() {
        return this.m_style;
    }

    get geometry() {
        return this.m_geometry;
    }

    get scrollOffset() {
        return this.m_scrollOffset;
    }

    set scrollOffset(offset: vec2) {
        if (this.m_scrollOffset.x === offset.x && this.m_scrollOffset.y === offset.y) return;
        const delta = new vec2();
        vec2.sub(delta, offset, this.m_scrollOffset);
        this.dispatch('scroll', new ScrollEvent(this, delta));
        this.m_scrollOffset = offset;
    }

    get scrollX() {
        return this.m_scrollOffset.x;
    }

    set scrollX(x: number) {
        if (this.m_scrollOffset.x === x) return;
        const delta = new vec2(x - this.m_scrollOffset.x, 0);
        this.dispatch('scroll', new ScrollEvent(this, delta));
        this.m_scrollOffset.x = x;
    }

    get scrollY() {
        return this.m_scrollOffset.y;
    }

    set scrollY(y: number) {
        if (this.m_scrollOffset.y === y) return;
        const delta = new vec2(0, y - this.m_scrollOffset.y);
        this.dispatch('scroll', new ScrollEvent(this, delta));
        this.m_scrollOffset.y = y;
    }

    get contentSize() {
        return this.m_contentSize;
    }

    /** @internal */
    bindListeners() {
        if (!(this.m_source instanceof BoxNode)) return;

        this.addListener('click', e => {
            const props = this.m_source.node.props as BoxProps;
            if (props.onClick) {
                props.onClick(e);
            }
        });

        this.addListener('mousedown', e => {
            const props = this.m_source.node.props as BoxProps;
            if (props.onMouseDown) {
                props.onMouseDown(e);
            }
        });

        this.addListener('mouseup', e => {
            const props = this.m_source.node.props as BoxProps;
            if (props.onMouseUp) {
                props.onMouseUp(e);
            }
        });

        this.addListener('mouseenter', e => {
            const props = this.m_source.node.props as BoxProps;
            if (props.onMouseEnter) {
                props.onMouseEnter(e);
            }
        });

        this.addListener('mouseleave', e => {
            const props = this.m_source.node.props as BoxProps;
            if (props.onMouseLeave) {
                props.onMouseLeave(e);
            }
        });

        this.addListener('mousemove', e => {
            const props = this.m_source.node.props as BoxProps;
            if (props.onMouseMove) {
                props.onMouseMove(e);
            }
        });

        this.addListener('mouseout', e => {
            const props = this.m_source.node.props as BoxProps;
            if (props.onMouseOut) {
                props.onMouseOut(e);
            }
        });

        this.addListener('mouseover', e => {
            const props = this.m_source.node.props as BoxProps;
            if (props.onMouseOver) {
                props.onMouseOver(e);
            }
        });

        this.addListener('scroll', e => {
            const props = this.m_source.node.props as BoxProps;
            if (props.onScroll) {
                props.onScroll(e);
            }
        });

        this.addListener('mousewheel', e => {
            const props = this.m_source.node.props as BoxProps;
            if (props.onMouseWheel) {
                props.onMouseWheel(e);
            }
        });

        this.addListener('keydown', e => {
            const props = this.m_source.node.props as BoxProps;
            if (props.onKeyDown) {
                props.onKeyDown(e);
            }
        });

        this.addListener('keyup', e => {
            const props = this.m_source.node.props as BoxProps;
            if (props.onKeyUp) {
                props.onKeyUp(e);
            }
        });

        this.addListener('focus', e => {
            const props = this.m_source.node.props as BoxProps;
            if (props.onFocus) {
                props.onFocus(e);
            }
        });

        this.addListener('blur', e => {
            const props = this.m_source.node.props as BoxProps;
            if (props.onBlur) {
                props.onBlur(e);
            }
        });

        this.addListener('resize', e => {
            const props = this.m_source.node.props as BoxProps;
            if (props.onResize) {
                props.onResize(e);
            }
        });
    }

    /** @internal */
    static __internal_setChildren(parent: Element, children: Element[]) {
        for (const child of parent.m_children) {
            if (children.findIndex(c => c === child) === -1) {
                // node was removed
                Yoga.YGNodeFreeRecursive(child.m_yogaNode);
            }
        }

        parent.m_children = children;
        Yoga.YGNodeSetChildren(
            parent.m_yogaNode,
            children.map(c => c.m_yogaNode)
        );
    }

    /** @internal */
    static __internal_updateElement(element: Element, newSource: UINode) {
        const prevSource = element.m_source;
        element.m_source = newSource;
        element.m_styleProps = newSource.style;

        const s = getCompleteStyle(element.m_parent?.m_styleProps, element.m_source.style);
        element.m_style.minHeight = s.minHeight;
        element.m_style.minWidth = s.minWidth;
        element.m_style.maxHeight = s.maxHeight;
        element.m_style.maxWidth = s.maxWidth;
        element.m_style.width = s.width;
        element.m_style.height = s.height;
        element.m_style.position = s.position;
        element.m_style.top = s.top;
        element.m_style.right = s.right;
        element.m_style.bottom = s.bottom;
        element.m_style.left = s.left;
        element.m_style.zIndex = s.zIndex;
        element.m_style.flexDirection = s.flex.direction;
        element.m_style.justifyContent = s.flex.justifyContent;
        element.m_style.alignItems = s.flex.alignItems;
        element.m_style.flexWrap = s.flex.wrap;
        element.m_style.flexGrow = s.flex.grow;
        element.m_style.flexShrink = s.flex.shrink;
        element.m_style.flexBasis = s.flex.basis;
        element.m_style.gap = s.flex.gap;
        element.m_style.lineHeight = s.lineHeight;
        element.m_style.letterSpacing = s.letterSpacing;
        element.m_style.fontSize = s.fontSize;
        element.m_style.fontWeight = s.fontWeight;
        element.m_style.fontFamily = s.fontFamily;
        element.m_style.fontStyle = s.fontStyle;
        element.m_style.textAlign = s.textAlign;
        element.m_style.textDecoration = s.textDecoration;
        element.m_style.whiteSpace = s.whiteSpace;
        element.m_style.wordBreak = s.wordBreak;
        element.m_style.wordWrap = s.wordWrap;
        element.m_style.overflow = s.overflow;
        element.m_style.textOverflow = s.textOverflow;
        element.m_style.color = s.color;
        element.m_style.backgroundColor = s.backgroundColor;
        element.m_style.borderWidth = s.border.width;
        element.m_style.borderColor = s.border.color;
        element.m_style.borderStyle = s.border.style;
        element.m_style.borderRadius = s.border.topLeftRadius;
        element.m_style.borderTopLeftRadius = s.border.topLeftRadius;
        element.m_style.borderTopRightRadius = s.border.topRightRadius;
        element.m_style.borderBottomLeftRadius = s.border.bottomLeftRadius;
        element.m_style.borderBottomRightRadius = s.border.bottomRightRadius;
        element.m_style.marginLeft = s.margin.left;
        element.m_style.marginRight = s.margin.right;
        element.m_style.marginTop = s.margin.top;
        element.m_style.marginBottom = s.margin.bottom;
        element.m_style.paddingLeft = s.padding.left;
        element.m_style.paddingRight = s.padding.right;
        element.m_style.paddingTop = s.padding.top;
        element.m_style.paddingBottom = s.padding.bottom;

        if (newSource instanceof TextNode && prevSource instanceof TextNode) {
            const geometry = element.m_geometry as TextGeometry | null;
            let maxWidth = element.m_style.clientRect.width;
            let maxHeight = element.m_style.clientRect.height;

            if (geometry) {
                maxWidth = geometry.textProperties.maxWidth;
                maxHeight = geometry.textProperties.maxHeight;
            }

            const textProperties = FontManager.extractTextProperties(element.m_style, maxWidth, maxHeight);
            if (geometry && isChanged(geometry.textProperties, textProperties)) {
                Yoga.YGNodeMarkDirty(element.m_yogaNode);
            } else {
                Yoga.YGNodeMarkDirty(element.m_yogaNode);
            }
        }
    }

    /** @internal */
    static __internal_afterLayout(element: Element) {
        if (element.m_source instanceof BoxNode) {
            const boxProps: BoxProperties = {
                rect: element.m_style.clientRect,
                borderWidth: element.m_style.resolveBorderWidth(element.m_style.borderWidth),
                borderColor: element.m_style.borderColor,
                style: element.m_style.borderStyle,
                color: element.m_style.backgroundColor
            };

            const geometry = element.m_geometry as BoxGeometry | null;
            if (!geometry || isChanged(boxProps, geometry.properties)) {
                element.m_geometry = buildBoxGeometry(boxProps);
            }
        }

        let contentWidth = 0.0;
        let contentHeight = 0.0;

        for (const child of element.m_children) {
            Element.__internal_afterLayout(child);

            const { x, y, width, height } = child.m_style.clientRect;
            contentWidth = Math.max(contentWidth, x + width);
            contentHeight = Math.max(contentHeight, y + height);
        }

        const { paddingLeft, paddingRight, paddingTop, paddingBottom } = element.m_style.clientRect;

        element.m_contentSize.x = contentWidth + paddingLeft + paddingRight;
        element.m_contentSize.y = contentHeight + paddingTop + paddingBottom;
    }
}
