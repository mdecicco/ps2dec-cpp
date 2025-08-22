import { TreeNode } from 'mini-react/vdom';
import { UINode } from './ui-node';

/** @internal */
export class TextNode extends UINode {
    /** @internal */ private m_text: string;

    /** @internal */
    constructor(node: TreeNode, parent: UINode | null) {
        super(node, parent);
        this.m_text = node.props.value;
    }

    /** @internal */
    get text() {
        return this.m_text;
    }
}
