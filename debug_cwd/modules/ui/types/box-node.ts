import { TreeNode } from 'mini-react/vdom';
import { UINode } from './ui-node';
import { BoxProps } from './elements';

/** @internal */
export class BoxNode extends UINode {
    /** @internal */
    constructor(node: TreeNode, parent: UINode | null, props?: BoxProps) {
        super(node, parent, props);
    }
}
