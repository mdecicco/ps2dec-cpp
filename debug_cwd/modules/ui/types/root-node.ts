import { TreeNode } from 'mini-react/vdom';
import { UINode } from './ui-node';

/** @internal */
export class RootNode extends UINode {
    /** @internal */
    constructor(node: TreeNode) {
        const style = {
            minWidth: '100%',
            minHeight: '100%',
            maxWidth: '100%',
            maxHeight: '100%',
            width: '100%',
            height: '100%'
        };

        super(node, null, { style });
    }
}
