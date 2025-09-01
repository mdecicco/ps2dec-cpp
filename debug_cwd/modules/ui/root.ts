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

export * from './components';
export { StyleProps, StyleAttributes, ParsedStyleProps, ParsedStyleAttributes } from './types';

export class UIRoot extends ReactRoot {
    /** @internal */ private m_root: UINode | null;
    /** @internal */ private m_nodeStack: UINode[];
    /** @internal */ private m_fontMgr: FontManager;
    /** @internal */ private m_renderer: UIRenderer;
    /** @internal */ private m_isShutdown: boolean;

    /** @internal */
    constructor(window: Window) {
        super();

        this.m_root = null;
        this.m_nodeStack = [];
        this.m_fontMgr = new FontManager();
        this.m_renderer = new UIRenderer(window, this.m_fontMgr);
        this.m_isShutdown = false;
    }

    /** @internal */
    get mostRecentNode() {
        if (this.m_nodeStack.length === 0) return null;
        return this.m_nodeStack[this.m_nodeStack.length - 1];
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
    private parseNode(inputNode: TreeNode) {
        const props = inputNode.props;

        let node: UINode | null = null;

        if (React.isSpecificElement(inputNode.type, Box, props)) {
            node = new BoxNode(inputNode, this.mostRecentNode, props);
        } else if (React.isSpecificElement(inputNode.type, Geometry, props)) {
            node = new GeometryNode(inputNode, this.mostRecentNode, props);
        } else if (React.isSpecificElement(inputNode.type, TextFragment, props)) {
            node = new TextNode(inputNode, this.mostRecentNode);
        } else if (!this.m_root) {
            node = new RootNode(inputNode);
        }

        if (node) {
            const parent = this.mostRecentNode;
            if (parent) parent.addChild(node);
            this.beginProcessingNode(node);
        }

        for (const child of inputNode.children) {
            this.parseNode(child);
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
        this.parseNode(rootNode);
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

    addFontFamily(fontFamily: FontFamilyOptions, isDefault: boolean = false) {
        if (this.m_isShutdown) return;
        this.m_fontMgr.addFontFamily(fontFamily, isDefault);
    }
}

export function createRoot(window: Window) {
    return new UIRoot(window);
}
