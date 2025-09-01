import * as Yoga from 'yoga';
import { EventProducer } from 'event';
import { Window } from 'window';
import { vec2f } from 'math';
import { TreeNode } from 'mini-react/vdom';
import { vec2, vec4 } from 'math-ext';
import { isChanged } from 'is-changed';

import { KeyboardEvent, MouseEvent, ResizeEvent, ScrollEvent, UIEvent, WheelEvent } from '../types/events';
import { Overflow, ParsedStyleAttributes, WhiteSpace } from '../types/style';
import { TextNode } from '../types/text-node';
import { UINode } from '../types/ui-node';
import { BoxNode } from '../types/box-node';
import { GeometryNode } from '../types/geometry-node';
import type { BoxProps, GeometryProps } from '../types/elements';
import {
    Geometry,
    TextGeometry,
    CustomGeometry,
    BoxGeometry,
    BoxProperties,
    GeometryType,
    Direction
} from '../types/geometry';

import { Style } from './style';
import { getCompleteStyle, FontManager, VertexArray } from '../utils';
import { buildBoxGeometry } from '../utils/box-geometry';

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
    verticalScrollValueStart: f32;
    horizontalScrollValueStart: f32;
    verticalScrollBarHovered: boolean;
    horizontalScrollBarHovered: boolean;
    verticalScrollBarDragStart: vec2 | null;
    horizontalScrollBarDragStart: vec2 | null;
    verticalScrollBarDragMultiplier: f32;
    horizontalScrollBarDragMultiplier: f32;
    instanceIdx: u32;
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
    /** @internal */ private m_styleProps: ParsedStyleAttributes;
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
        this.m_styleProps = getCompleteStyle(this.m_parent?.m_styleProps, source.style);
        this.m_style = new Style(
            this.m_yogaNode,
            this.m_styleProps,
            this.m_parent ? this.m_parent.m_style : null,
            this.m_root ? this.m_root.m_style : null,
            this.m_window
        );
        this.m_rendererState = {
            isHovered: false,
            verticalScrollValueStart: 0.0,
            horizontalScrollValueStart: 0.0,
            verticalScrollBarHovered: false,
            horizontalScrollBarHovered: false,
            verticalScrollBarDragStart: null,
            horizontalScrollBarDragStart: null,
            verticalScrollBarDragMultiplier: 1.0,
            horizontalScrollBarDragMultiplier: 1.0,
            instanceIdx: -1
        };

        Yoga.YGConfigSetUseWebDefaults(Yoga.YGConfigGetDefault(), true);

        if (this.m_source instanceof GeometryNode) {
            Yoga.YGNodeSetMeasureFunc(this.m_yogaNode, (width, widthMode, height, heightMode) => {
                if (!(this.m_source instanceof GeometryNode)) return new vec2f(0.0, 0.0);

                let geometryWidth = 0.0;
                let geometryHeight = 0.0;

                const props = this.m_source.node.props as GeometryProps;
                const geometry = this.m_geometry as CustomGeometry | null;
                if (!geometry || props.version !== geometry.version) {
                    for (const vertex of props.vertices) {
                        geometryWidth = Math.max(geometryWidth, vertex.position.x);
                        geometryHeight = Math.max(geometryHeight, vertex.position.y);
                    }

                    this.m_geometry = {
                        type: GeometryType.Custom,
                        version: props.version,
                        offsetPosition: new vec4(),
                        width: geometryWidth,
                        height: geometryHeight,
                        vertices: new VertexArray()
                    };

                    this.m_geometry.vertices.init(props.vertices.length);

                    for (const vertex of props.vertices) {
                        this.m_geometry.vertices.push(
                            vertex.position.x,
                            vertex.position.y,
                            vertex.position.z ?? 0.0,
                            vertex.color?.r ?? this.style.color.r,
                            vertex.color?.g ?? this.style.color.g,
                            vertex.color?.b ?? this.style.color.b,
                            vertex.color?.a ?? this.style.color.a,
                            vertex.uv?.u ?? 0.0,
                            vertex.uv?.v ?? 0.0,
                            this.rendererState.instanceIdx
                        );
                    }
                }

                let outWidth = geometryWidth;
                let outHeight = geometryHeight;

                switch (widthMode) {
                    case Yoga.YGMeasureMode.YGMeasureModeUndefined:
                        break;
                    case Yoga.YGMeasureMode.YGMeasureModeExactly:
                        outWidth = width;
                        break;
                    case Yoga.YGMeasureMode.YGMeasureModeAtMost:
                        outWidth = Math.min(width, geometryWidth);
                        break;
                }

                switch (heightMode) {
                    case Yoga.YGMeasureMode.YGMeasureModeUndefined:
                        break;
                    case Yoga.YGMeasureMode.YGMeasureModeExactly:
                        outHeight = height;
                        break;
                    case Yoga.YGMeasureMode.YGMeasureModeAtMost:
                        outHeight = Math.min(height, geometryHeight);
                        break;
                }

                return new vec2f(outWidth, outHeight);
            });
        }

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

                if (this.m_parent && this.m_parent.m_style.overflow === Overflow.Scroll) {
                    maxWidth = Infinity;
                    maxHeight = Infinity;
                }

                const textProperties = FontManager.extractTextProperties(this.m_style, maxWidth, maxHeight);
                const fontFamily = this.m_fontManager.findFontFamily(textProperties);
                if (!fontFamily) {
                    return new vec2f(0, 0);
                }

                const previousGeometry = this.m_geometry as TextGeometry | null;
                if (!previousGeometry || isChanged(textProperties, previousGeometry.textProperties)) {
                    const start = Date.now();
                    this.m_geometry = fontFamily.createTextGeometry(
                        this.m_source.text,
                        textProperties,
                        this.rendererState.instanceIdx
                    );
                    const end = Date.now();
                }

                const currentGeometry = this.m_geometry as TextGeometry;

                return new vec2f(
                    Math.min(maxWidth, currentGeometry.width),
                    Math.min(maxHeight, currentGeometry.height)
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
        const constrainedOffset = new vec2(
            Math.max(0, Math.min(offset.x, this.m_contentSize.x - this.m_style.clientRect.width)),
            Math.max(0, Math.min(offset.y, this.m_contentSize.y - this.m_style.clientRect.height))
        );

        if (this.m_scrollOffset.x === constrainedOffset.x && this.m_scrollOffset.y === constrainedOffset.y) return;
        const delta = new vec2();
        vec2.sub(delta, constrainedOffset, this.m_scrollOffset);
        this.dispatch('scroll', new ScrollEvent(this, delta));
        this.m_scrollOffset = constrainedOffset;
        this.m_treeNode.root.enqueueForRender(this.m_treeNode);
    }

    get scrollX() {
        return this.m_scrollOffset.x;
    }

    set scrollX(x: number) {
        const constrainedX = Math.max(0, Math.min(x, this.m_contentSize.x - this.m_style.clientRect.width));

        if (this.m_scrollOffset.x === constrainedX) return;
        const delta = new vec2(constrainedX - this.m_scrollOffset.x, 0);
        this.dispatch('scroll', new ScrollEvent(this, delta));
        this.m_scrollOffset.x = constrainedX;
        this.m_treeNode.root.enqueueForRender(this.m_treeNode);
    }

    get scrollY() {
        return this.m_scrollOffset.y;
    }

    set scrollY(y: number) {
        const constrainedY = Math.max(0, Math.min(y, this.m_contentSize.y - this.m_style.clientRect.height));

        if (this.m_scrollOffset.y === constrainedY) return;
        const delta = new vec2(0, constrainedY - this.m_scrollOffset.y);
        this.dispatch('scroll', new ScrollEvent(this, delta));
        this.m_scrollOffset.y = constrainedY;
        this.m_treeNode.root.enqueueForRender(this.m_treeNode);
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

            if (e.defaultPrevented || this.m_style.overflow !== Overflow.Scroll) return;

            if (this.m_contentSize.x > this.m_style.clientRect.width) {
                this.scrollX = this.scrollX - e.delta.x * 3;
            }

            if (this.m_contentSize.y > this.m_style.clientRect.height) {
                this.scrollY = this.scrollY - e.delta.y * 3;
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

            const scrollHeight = Math.max(0, this.m_contentSize.y - this.m_style.clientRect.height);
            const scrollWidth = Math.max(0, this.m_contentSize.x - this.m_style.clientRect.width);
            let didChange = false;
            if (this.m_scrollOffset.x > scrollWidth) {
                this.m_scrollOffset.x = scrollWidth;
                didChange = true;
            }

            if (this.m_scrollOffset.y > scrollHeight) {
                this.m_scrollOffset.y = scrollHeight;
                didChange = true;
            }

            if (didChange) {
                this.m_treeNode.root.enqueueForRender(this.m_treeNode);
            }
        });
    }

    /** @internal */
    static __internal_setChildren(parent: Element, children: Element[]) {
        parent.m_children = children;
        Yoga.YGNodeSetChildren(
            parent.m_yogaNode,
            children.map(c => c.m_yogaNode)
        );
    }

    /** @internal */
    static __internal_updateElement(element: Element, newSource: UINode) {
        element.m_source = newSource;
        element.m_styleProps = getCompleteStyle(element.m_parent?.m_styleProps, newSource.style);

        const s = element.m_styleProps;
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
        element.m_style.borderTopWidth = s.border.top.width;
        element.m_style.borderRightWidth = s.border.right.width;
        element.m_style.borderBottomWidth = s.border.bottom.width;
        element.m_style.borderLeftWidth = s.border.left.width;
        element.m_style.borderTopColor = s.border.top.color;
        element.m_style.borderRightColor = s.border.right.color;
        element.m_style.borderBottomColor = s.border.bottom.color;
        element.m_style.borderLeftColor = s.border.left.color;
        element.m_style.borderTopStyle = s.border.top.style;
        element.m_style.borderRightStyle = s.border.right.style;
        element.m_style.borderBottomStyle = s.border.bottom.style;
        element.m_style.borderLeftStyle = s.border.left.style;
        element.m_style.borderRadius = s.border.topLeftRadius;
        element.m_style.borderTopLeftRadius = s.border.topLeftRadius;
        element.m_style.borderTopRightRadius = s.border.topRightRadius;
        element.m_style.borderBottomLeftRadius = s.border.bottomLeftRadius;
        element.m_style.borderBottomRightRadius = s.border.bottomRightRadius;
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
    }

    /** @internal */
    static __internal_beforeLayout(element: Element) {
        if (element.m_source instanceof GeometryNode) {
            const props = element.m_source.node.props as GeometryProps;
            const geometry = element.m_geometry as CustomGeometry | null;
            if (!geometry || props.version !== geometry.version) {
                let width = 0.0;
                let height = 0.0;

                for (const vertex of props.vertices) {
                    width = Math.max(width, vertex.position.x);
                    height = Math.max(height, vertex.position.y);
                }

                element.m_geometry = {
                    type: GeometryType.Custom,
                    version: props.version,
                    offsetPosition: new vec4(),
                    width,
                    height,
                    vertices: new VertexArray()
                };

                element.m_geometry.vertices.init(props.vertices.length);

                for (const vertex of props.vertices) {
                    element.m_geometry.vertices.push(
                        vertex.position.x,
                        vertex.position.y,
                        vertex.position.z ?? 0.0,
                        vertex.color?.r ?? element.style.color.r,
                        vertex.color?.g ?? element.style.color.g,
                        vertex.color?.b ?? element.style.color.b,
                        vertex.color?.a ?? element.style.color.a,
                        vertex.uv?.u ?? 0.0,
                        vertex.uv?.v ?? 0.0,
                        element.rendererState.instanceIdx
                    );
                }

                Yoga.YGNodeMarkDirty(element.m_yogaNode);
            }
        } else if (element.m_source instanceof TextNode) {
            const geometry = element.m_geometry as TextGeometry | null;

            let shouldConstrainWidth = false;
            let shouldConstrainHeight = false;

            // TODO: Not sure if this is correct
            if (element.m_style.whiteSpace !== WhiteSpace.Nowrap) {
                shouldConstrainWidth = true;
            }

            let maxWidth = shouldConstrainWidth ? element.m_style.clientRect.width : Infinity;
            let maxHeight = shouldConstrainHeight ? element.m_style.clientRect.height : Infinity;

            const textProperties = FontManager.extractTextProperties(element.m_style, maxWidth, maxHeight);
            if (!geometry || isChanged(geometry.textProperties, textProperties)) {
                Yoga.YGNodeMarkDirty(element.m_yogaNode);
            }
        }

        for (const child of element.m_children) {
            Element.__internal_beforeLayout(child);
        }
    }

    /** @internal */
    static __internal_afterLayout(element: Element) {
        const prevWidth = element.m_style.clientRect.width;
        const prevHeight = element.m_style.clientRect.height;
        element.m_style.readLayout();
        const newWidth = element.m_style.clientRect.width;
        const newHeight = element.m_style.clientRect.height;

        if (element.m_source instanceof TextNode) {
            const geometry = element.m_geometry as TextGeometry | null;
            if (geometry) {
                element.m_style.clientRect.width = geometry.width;
                element.m_style.clientRect.height = geometry.height;
                element.m_style.clientRect.right = element.m_style.clientRect.left + geometry.width;
                element.m_style.clientRect.bottom = element.m_style.clientRect.top + geometry.height;
            }
        }

        let contentWidth = 0.0;
        let contentHeight = 0.0;

        for (const child of element.m_children) {
            Element.__internal_afterLayout(child);

            const { x, y, width, height } = child.m_style.clientRect;

            const childEndX = x + width - element.m_style.clientRect.x;
            const childEndY = y + height - element.m_style.clientRect.y;

            contentWidth = Math.max(contentWidth, childEndX);
            contentHeight = Math.max(contentHeight, childEndY);
        }

        const { paddingLeft, paddingRight, paddingTop, paddingBottom } = element.m_style.clientRect;

        element.m_contentSize.x = contentWidth + paddingLeft + paddingRight;
        element.m_contentSize.y = contentHeight + paddingTop + paddingBottom;

        if (element.m_source instanceof BoxNode) {
            const boxProps: BoxProperties = {
                rect: element.m_style.clientRect,
                borderTop: {
                    width: element.m_style.resolveSize(element.m_style.borderTopWidth, Direction.Vertical),
                    color: element.m_style.borderTopColor,
                    style: element.m_style.borderTopStyle
                },
                borderRight: {
                    width: element.m_style.resolveSize(element.m_style.borderRightWidth, Direction.Horizontal),
                    color: element.m_style.borderRightColor,
                    style: element.m_style.borderRightStyle
                },
                borderBottom: {
                    width: element.m_style.resolveSize(element.m_style.borderBottomWidth, Direction.Vertical),
                    color: element.m_style.borderBottomColor,
                    style: element.m_style.borderBottomStyle
                },
                borderLeft: {
                    width: element.m_style.resolveSize(element.m_style.borderLeftWidth, Direction.Horizontal),
                    color: element.m_style.borderLeftColor,
                    style: element.m_style.borderLeftStyle
                },
                overflow: element.m_style.overflow,
                color: element.m_style.backgroundColor,
                scrollX: element.m_scrollOffset.x,
                scrollY: element.m_scrollOffset.y,
                contentWidth: element.m_contentSize.x,
                contentHeight: element.m_contentSize.y,
                verticalScrollBarHovered: element.rendererState.verticalScrollBarHovered,
                horizontalScrollBarHovered: element.rendererState.horizontalScrollBarHovered,
                verticalScrollBarDragging: element.rendererState.verticalScrollBarDragStart !== null,
                horizontalScrollBarDragging: element.rendererState.horizontalScrollBarDragStart !== null
            };

            const geometry = element.m_geometry as BoxGeometry | null;
            if (!geometry || isChanged(boxProps, geometry.properties)) {
                element.m_geometry = buildBoxGeometry(boxProps, element.rendererState.instanceIdx);
            }
        }

        if (newWidth !== prevWidth || newHeight !== prevHeight) {
            element.dispatch('resize', new ResizeEvent(element, newWidth, newHeight, prevWidth, prevHeight));
        }
    }

    /** @internal */
    static __internal_unmount(element: Element) {
        Yoga.YGNodeSetMeasureFunc(element.m_yogaNode, null);
        Yoga.YGNodeFree(element.m_yogaNode);
    }
}
