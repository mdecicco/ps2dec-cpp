import { TreeNode } from 'mini-react/vdom';
import { UINode } from './ui-node';
import { GeometryProps } from './elements';

/** @internal */
export class GeometryNode extends UINode {
    /** @internal */
    constructor(node: TreeNode, treeDepth: number, parent: UINode | null, props?: GeometryProps) {
        super(node, treeDepth, parent, props);
    }

    toString() {
        return `GeometryNode`;
    }
}
