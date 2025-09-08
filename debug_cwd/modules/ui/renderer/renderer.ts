import { Window } from 'window';
import { mat4, Transform } from 'math-ext';
import { EventListener } from 'event';

import { TreeGenerator } from './generator';
import { LayoutEngine } from './layout';
import { Element } from './element';
import { RenderContext } from '../utils/render-context';
import { DrawCall } from '../utils/draw-call';
import { TextDraw } from '../utils/text-draw';
import {
    ClientRect,
    UINode,
    BoxNode,
    TextNode,
    GeometryNode,
    TextGeometry,
    BoxGeometry,
    Overflow,
    CustomGeometry
} from '../types';
import { FontFamily, FontManager } from '../utils/font-mgr';
import { DepthManager } from '../utils/depth-mgr';
import { UIEventManager } from '../utils/event-mgr';
import { VertexArray } from '../utils/vertex-array';

function clipRectsIntersect(a: ClientRect, b: ClientRect): boolean {
    if (b.x + b.width < a.x || b.x > a.x + a.width) return false;
    if (b.y + b.height < a.y || b.y > a.y + a.height) return false;

    return true;
}

export class UIRenderer {
    private m_window: Window;
    private m_fontMgr: FontManager;
    private m_depthMgr: DepthManager;
    private m_eventMgr: UIEventManager;
    private m_renderContext: RenderContext;
    private m_treeGenerator: TreeGenerator;
    private m_lastTree: Element | null;
    private m_resizeListener: EventListener | null;
    private m_boxDraw: DrawCall | null;
    private m_windowSize: { width: u32; height: u32 };
    private m_textDraws: Map<FontFamily, TextDraw>;
    private m_draws: { drawCall: DrawCall; vertices: VertexArray; depth: f32 }[];

    constructor(window: Window, fontMgr: FontManager, depthMgr: DepthManager) {
        this.m_window = window;
        this.m_fontMgr = fontMgr;
        this.m_depthMgr = depthMgr;
        this.m_eventMgr = new UIEventManager(window);
        this.m_renderContext = new RenderContext(window);
        this.m_treeGenerator = new TreeGenerator(window, fontMgr, depthMgr, this.m_renderContext.instances);
        this.m_lastTree = null;
        this.m_resizeListener = null;
        this.m_boxDraw = null;
        this.m_textDraws = new Map<FontFamily, TextDraw>();
        this.m_draws = [];

        const windowSize = window.size;
        this.m_windowSize = { width: windowSize.x, height: windowSize.y };
    }

    init() {
        this.m_renderContext.init();
        this.m_resizeListener = this.m_window.addListener('resize', this.onResize.bind(this));
        this.m_eventMgr.init();

        this.m_boxDraw = this.m_renderContext.allocateDrawCall(32768);

        const { logicalDevice, frameManager } = this.m_renderContext.renderContext;
        this.m_fontMgr.init(logicalDevice, frameManager.getCommandPool());
        this.updateMatrices();
    }

    shutdown() {
        if (this.m_resizeListener) {
            this.m_resizeListener.remove();
            this.m_resizeListener = null;
        }

        this.m_eventMgr.shutdown();
        this.m_fontMgr.shutdown();
        this.m_renderContext.shutdown();
    }

    private updateMatrices() {
        const proj = mat4.identity();
        Transform.ortho(proj, 0, this.m_windowSize.width, 0, this.m_windowSize.height, 0, 1);

        if (this.m_boxDraw) {
            this.m_boxDraw.uniforms.projection = proj.transposed;
        }

        for (const [fontFamily, textDraw] of this.m_textDraws.entries()) {
            textDraw.drawCall.uniforms.projection = proj.transposed;
        }
    }

    private getTextDraw(fontFamily: FontFamily) {
        let textDraw = this.m_textDraws.get(fontFamily);
        if (textDraw) return textDraw;

        const proj = mat4.identity();
        Transform.ortho(proj, 0, this.m_windowSize.width, 0, this.m_windowSize.height, 0, 1);

        textDraw = this.m_renderContext.allocateTextDraw(65536, fontFamily);
        this.m_textDraws.set(fontFamily, textDraw);
        textDraw.drawCall.uniforms.projection = proj.transposed;
        return textDraw;
    }

    private onResize(width: u32, height: u32) {
        this.m_windowSize = { width, height };

        if (this.m_boxDraw) {
            this.m_renderContext.freeDrawCall(this.m_boxDraw);
            this.m_boxDraw = this.m_renderContext.allocateDrawCall(32768);
        }

        for (const [fontFamily, textDraw] of this.m_textDraws.entries()) {
            this.m_renderContext.freeDrawCall(textDraw.drawCall);
            const newTextDraw = this.m_renderContext.allocateTextDraw(65536, fontFamily);
            this.m_textDraws.set(fontFamily, newTextDraw);
        }

        this.updateMatrices();
        this.doLayout();
    }

    private drawText(node: Element, geometry: TextGeometry, clipRectIndex: u32) {
        const fontFamily = this.m_fontMgr.findFontFamily(geometry.textProperties);
        if (fontFamily) {
            const textDraw = this.getTextDraw(fontFamily);

            let offsetX = 0;
            let offsetY = 0;

            if (node.parent) {
                const offset = node.parent.scrollOffset;
                offsetX = -offset.x;
                offsetY = -offset.y;
            }

            const { x, y } = node.style.clientRect;

            const depth = this.m_depthMgr.getDepthValue(node.style.zIndex, node.treeDepth);

            this.m_renderContext.instances.updateInstance(node, {
                offsetX: x + offsetX,
                offsetY: y + offsetY,
                offsetZ: depth,
                opacity: node.style.computedOpacity,
                clipRectIndex: clipRectIndex
            });

            // textDraw.drawCall.addVertices(geometry.vertices);
            this.m_draws.push({
                drawCall: textDraw.drawCall,
                vertices: geometry.vertices,
                depth
            });
        }
    }

    private drawBox(node: Element, geometry: BoxGeometry, clipRectIndex: u32) {
        const { vertices } = geometry;

        let offsetX = 0;
        let offsetY = 0;

        if (node.parent) {
            const offset = node.parent.scrollOffset;
            offsetX = -offset.x;
            offsetY = -offset.y;
        }

        const depth = this.m_depthMgr.getDepthValue(node.style.zIndex, node.treeDepth);

        this.m_renderContext.instances.updateInstance(node, {
            offsetX: geometry.offsetPosition.x + offsetX,
            offsetY: geometry.offsetPosition.y + offsetY,
            offsetZ: geometry.offsetPosition.z + depth,
            opacity: node.style.computedOpacity,
            clipRectIndex: clipRectIndex
        });

        // this.m_boxDraw!.addVertices(vertices);
        this.m_draws.push({
            drawCall: this.m_boxDraw!,
            vertices: vertices,
            depth
        });
    }

    private drawCustom(node: Element, geometry: CustomGeometry, clipRectIndex: u32) {
        const { vertices } = geometry;
        const { x, y } = node.style.clientRect;

        let offsetX = 0;
        let offsetY = 0;

        if (node.parent) {
            const offset = node.parent.scrollOffset;
            offsetX = -offset.x;
            offsetY = -offset.y;
        }

        const depth = this.m_depthMgr.getDepthValue(node.style.zIndex, node.treeDepth);

        this.m_renderContext.instances.updateInstance(node, {
            offsetX: geometry.offsetPosition.x + x + offsetX,
            offsetY: geometry.offsetPosition.y + y + offsetY,
            offsetZ: geometry.offsetPosition.z + depth,
            opacity: node.style.computedOpacity,
            clipRectIndex: clipRectIndex
        });

        // this.m_boxDraw!.addVertices(vertices);
        this.m_draws.push({
            drawCall: this.m_boxDraw!,
            vertices: vertices,
            depth
        });
    }

    private drawNode(node: Element) {
        if (!this.m_boxDraw || node.style.computedOpacity === 0) return;

        const clipRects = this.m_renderContext.clipRects;
        const clip = clipRects.currentClip;

        if (clipRectsIntersect(clip.rect, node.style.clientRect)) {
            if (node.source instanceof BoxNode) {
                const geometry = node.geometry as BoxGeometry | null;
                if (geometry) this.drawBox(node, geometry, clip.index);
            } else if (node.source instanceof GeometryNode) {
                const geometry = node.geometry as CustomGeometry | null;
                if (geometry) this.drawCustom(node, geometry, clip.index);
            } else if (node.source instanceof TextNode) {
                const geometry = node.geometry as TextGeometry | null;
                if (geometry) this.drawText(node, geometry, clip.index);
            }
        } else if (node.style.overflow !== Overflow.Visible) {
            // Element and all children will be invisible. Even if a child is
            // positioned such that it would be within the current clip rect,
            // because this element is fully outside the clip rect and its
            // overflow is hidden
            return;
        }

        clipRects.beginElement(node);
        for (const child of node.children) {
            this.drawNode(child);
        }
        clipRects.endElement(node);
    }

    private doLayout() {
        if (!this.m_lastTree) return;
        if (!this.m_window.isOpen) return;
        if (!this.m_renderContext.isInitialized) this.init();
        if (!this.m_boxDraw) return;

        let start = Date.now();
        const layoutEngine = new LayoutEngine(this.m_window, this.m_lastTree);
        layoutEngine.execute();
        let end = Date.now();
        // console.debug(`Layout time: ${end - start}ms`);

        // console.log('begin render ----------------------------------------');
        // this.m_lastTree.debugPrint();

        start = Date.now();
        if (this.m_renderContext.begin()) {
            this.m_renderContext.clipRects.reset();
            this.m_boxDraw.resetUsedVertices();
            for (const textDraw of this.m_textDraws.values()) {
                textDraw.resetUsedVertices();
            }

            this.m_draws = [];
            this.drawNode(this.m_lastTree);

            // sort draws by depth
            this.m_draws.sort((a, b) => b.depth - a.depth);
            for (const draw of this.m_draws) {
                draw.drawCall.addVertices(draw.vertices);
            }

            this.m_renderContext.beginRenderPass();
            this.m_renderContext.endRenderPass();
            this.m_renderContext.end();
            end = Date.now();
            // console.debug(`Render time: ${end - start}ms`);
        }
    }

    get root(): Element | null {
        return this.m_lastTree;
    }

    render(root: UINode) {
        this.m_lastTree = this.m_treeGenerator.generate(root);
        this.m_eventMgr.setTreeRoot(this.m_lastTree);
        this.doLayout();
    }
}
