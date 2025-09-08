import { TreeNode } from 'mini-react/vdom';
import { UINode } from './ui-node';

/** @internal */
export class TextNode extends UINode {
    /** @internal */ private m_text: string;

    /** @internal */
    constructor(node: TreeNode, treeDepth: number, parent: UINode | null) {
        super(node, treeDepth, parent);
        this.m_text = node.props.value;
    }

    /** @internal */
    get text() {
        return this.m_text;
    }

    toString() {
        return `TextNode (${this.m_text})`;
    }
}
