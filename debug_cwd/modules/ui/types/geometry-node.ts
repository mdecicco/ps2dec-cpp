import { TreeNode } from 'mini-react/vdom';
import { UINode } from './ui-node';
import { GeometryProps } from './elements';

/** @internal */
export class GeometryNode extends UINode {
    /** @internal */
    constructor(node: TreeNode, parent: UINode | null, props?: GeometryProps) {
        super(node, parent, props);
    }
}
