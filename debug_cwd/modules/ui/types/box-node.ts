import { TreeNode } from 'mini-react/vdom';
import { UINode } from './ui-node';
import { BoxProps } from './elements';

/** @internal */
export class BoxNode extends UINode {
    /** @internal */
    constructor(node: TreeNode, treeDepth: number, parent: UINode | null, props?: BoxProps) {
        super(node, treeDepth, parent, props);
    }

    toString() {
        return `BoxNode`;
    }
}
