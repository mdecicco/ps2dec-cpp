import * as Yoga from 'yoga';
import { Window } from 'window';

import { Element } from './element';
import { IElementRecursion } from './tree-recurse';
import { px } from '../utils';
import { ResizeEvent } from '../types/events';

export class LayoutEngine extends IElementRecursion {
    private m_window: Window;
    private m_root: Element;

    constructor(window: Window, root: Element) {
        super();
        this.m_window = window;
        this.m_root = root;
    }

    printNode(node: Element, indent: number) {
        const str = ' '.repeat(indent) + node.treeNode.displayName + ' ' + JSON.stringify(node.style.clientRect);
        console.log(str);

        for (const child of node.children) {
            this.printNode(child, indent + 2);
        }
    }

    execute() {
        if (!this.m_window.isOpen) return;

        const windowSize = this.m_window.size;
        this.m_root.style.width = px(windowSize.x);
        this.m_root.style.minWidth = px(windowSize.x);
        this.m_root.style.maxWidth = px(windowSize.x);
        this.m_root.style.height = px(windowSize.y);
        this.m_root.style.minHeight = px(windowSize.y);
        this.m_root.style.maxHeight = px(windowSize.y);

        Element.__internal_beforeLayout(this.m_root);
        Yoga.YGNodeCalculateLayout(this.m_root.yogaNode, windowSize.x, windowSize.y, Yoga.YGDirection.YGDirectionLTR);
        Element.__internal_afterLayout(this.m_root);
        // this.printNode(this.m_root, 0);
    }
}
