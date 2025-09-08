import { TreeNode } from 'mini-react/vdom';
import type { ElementProps } from './elements';
import type { ParsedStyleProps } from './style';
import { StyleParser } from '../utils/parser';

/** @internal */
export abstract class UINode {
    /** @internal */ private m_node: TreeNode;
    /** @internal */ private m_treeDepth: number;
    /** @internal */ private m_parent: UINode | null;
    /** @internal */ private m_children: UINode[];
    /** @internal */ private m_props: ElementProps;
    /** @internal */ private m_style: ParsedStyleProps;

    /** @internal */
    constructor(node: TreeNode, treeDepth: number, parent: UINode | null, props?: ElementProps) {
        this.m_node = node;
        this.m_treeDepth = treeDepth;
        this.m_parent = parent;
        this.m_children = [];
        this.m_props = props ?? {};
        this.m_style = props && props.style ? StyleParser.parseStyleProps(props.style) : {};
    }

    /** @internal */
    get node() {
        return this.m_node;
    }

    get treeDepth() {
        return this.m_treeDepth;
    }

    get parent() {
        return this.m_parent;
    }

    get props() {
        return this.m_props;
    }

    get style() {
        return this.m_style;
    }

    get children() {
        return Array.from(this.m_children);
    }

    /** @internal */
    addChild(child: UINode) {
        this.m_children.push(child);
    }

    /** @internal */
    debugPrint(indentation: number = 0) {
        console.log(`${' '.repeat(indentation)}${this.constructor.name}`);
        console.log(`${' '.repeat(indentation + 2)}style:`);

        for (const key in this.m_style) {
            const propValue = JSON.stringify(this.m_style[key as keyof ParsedStyleProps]);
            console.log(`${' '.repeat(indentation + 4)}${key}: ${propValue}`);
        }

        if (this.m_children.length === 0) return;

        console.log(`${' '.repeat(indentation + 2)}children:`);
        for (const child of this.m_children) {
            child.debugPrint(indentation + 4);
        }
    }

    abstract toString(): string;
}
