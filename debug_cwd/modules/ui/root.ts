import * as React from 'mini-react';
import { ReactRoot, TextFragment, TreeNode } from 'mini-react/vdom';
import { Box, Geometry } from './components';
import { Window } from 'window';
import { UIRenderer } from './renderer/renderer';
import { UINode } from './types/ui-node';
import { BoxNode } from './types/box-node';
import { TextNode } from './types/text-node';
import { RootNode } from './types/root-node';
import { GeometryNode } from './types/geometry-node';
import { FontFamilyOptions, FontManager } from './utils/font-mgr';
import { Element } from './renderer/element';
import { DepthManager } from './utils/depth-mgr';

export * from './components';
export { StyleProps, StyleAttributes, ParsedStyleProps, ParsedStyleAttributes } from './types';

export class UIRoot extends ReactRoot {
    /** @internal */ private m_root: UINode | null;
    /** @internal */ private m_nodeStack: UINode[];
    /** @internal */ private m_fontMgr: FontManager;
    /** @internal */ private m_depthMgr: DepthManager;
    /** @internal */ private m_renderer: UIRenderer;
    /** @internal */ private m_isShutdown: boolean;

    /** @internal */
    constructor(window: Window) {
        super();

        this.m_root = null;
        this.m_nodeStack = [];
        this.m_fontMgr = new FontManager();
        this.m_depthMgr = new DepthManager();
        this.m_renderer = new UIRenderer(window, this.m_fontMgr, this.m_depthMgr);
        this.m_isShutdown = false;
    }

    /** @internal */
    get mostRecentNode() {
        if (this.m_nodeStack.length === 0) return null;
        return this.m_nodeStack[this.m_nodeStack.length - 1];
    }

    /** @internal */
    get depthMgr() {
        return this.m_depthMgr;
    }

    /** @internal */
    private beginProcessingNode(node: UINode) {
        if (!this.m_root) this.m_root = node;
        this.m_nodeStack.push(node);
    }

    /** @internal */
    private endProcessingNode(node: UINode) {
        this.m_nodeStack.pop();
    }

    /** @internal */
    private parseNode(inputNode: TreeNode, treeDepth: number) {
        const props = inputNode.props;
        this.m_depthMgr.currentTreeDepth = treeDepth;

        let node: UINode | null = null;

        if (React.isSpecificElement(inputNode.type, Box, props)) {
            node = new BoxNode(inputNode, treeDepth, this.mostRecentNode, props);
        } else if (React.isSpecificElement(inputNode.type, Geometry, props)) {
            node = new GeometryNode(inputNode, treeDepth, this.mostRecentNode, props);
        } else if (React.isSpecificElement(inputNode.type, TextFragment, props)) {
            node = new TextNode(inputNode, treeDepth, this.mostRecentNode);
        } else if (!this.m_root) {
            node = new RootNode(inputNode);
        }

        if (node) {
            const parent = this.mostRecentNode;
            if (parent) parent.addChild(node);
            this.beginProcessingNode(node);
        }

        for (const child of inputNode.children) {
            this.parseNode(child, treeDepth + 1);
        }

        if (node) this.endProcessingNode(node);
    }

    /** @internal */
    private debugPrint() {
        if (!this.m_root) return;
        this.m_root.debugPrint();
    }

    /** @internal */
    private renderToWindow() {
        if (!this.m_root) return;
        this.m_renderer.render(this.m_root);
    }

    /** @internal */
    onAfterRender(rootNode: TreeNode) {
        if (this.m_isShutdown) return;
        this.m_root = null;
        this.m_depthMgr.maxTreeDepth = 0;
        this.parseNode(rootNode, 0);
        this.renderToWindow();
    }

    /** @internal */
    unmount() {
        if (this.m_isShutdown) return;
        this.m_root = null;
        this.m_nodeStack = [];
        this.m_fontMgr.shutdown();
        this.m_renderer.shutdown();
        this.m_isShutdown = true;
    }

    get rootElement(): Element | null {
        return this.m_renderer.root;
    }

    addFontFamily(fontFamily: FontFamilyOptions, isDefault: boolean = false) {
        if (this.m_isShutdown) return;
        this.m_fontMgr.addFontFamily(fontFamily, isDefault);
    }
}

export function createRoot(window: Window) {
    return new UIRoot(window);
}
