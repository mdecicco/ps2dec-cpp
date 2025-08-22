import { compareProps } from './logic';
import { FunctionComponent, ReactNode } from './types';
import { useEffect } from './useEffect';
import { ReactRoot, TreeNode } from './vdom';

type ContextProps<T> = {
    value: T;
    children?: ReactNode;
};

export interface Context<T> {
    /** @internal */
    id: number;

    /** @internal */
    listeningNodes: Set<TreeNode>;

    Provider: FunctionComponent<ContextProps<T>>;
}

let nextContextId = 1;

export function createContext<T>(): Context<T> {
    const id = nextContextId++;
    const listeningNodes = new Set<TreeNode>();

    return {
        id,
        listeningNodes,
        Provider: (props: ContextProps<T>) => {
            const currentNode = TreeNode.current;
            currentNode!.provideContext(id, props.value);

            useEffect(() => {
                for (const node of listeningNodes) {
                    node.root.enqueueForRender(node);
                }
            }, [props.value]);

            return props.children;
        }
    };
}

export function useContext<T>(context: Context<T>): T | null {
    const currentNode = TreeNode.current;
    if (!currentNode) throw new Error('useContext can only be called inside a component');

    useEffect(() => {
        context.listeningNodes.add(currentNode);

        return () => {
            context.listeningNodes.delete(currentNode);
        };
    }, []);

    const contextValue = currentNode.getContext<T>(context.id);
    if (!contextValue) return null;

    return contextValue;
}

export type ContextTreeNode<T> = {
    value: T;
    children: ContextTreeNode<T>[];
};

function extractContextTree<T>(context: Context<T>, currentNode: TreeNode, parent: Omit<ContextTreeNode<T>, 'value'>) {
    const contextValue = currentNode.getOwnContext<T>(context.id);
    if (contextValue) {
        const node: ContextTreeNode<T> = {
            value: contextValue,
            children: []
        };

        currentNode.children.forEach(child => {
            extractContextTree(context, child, node);
        });

        parent.children.push(node);
        return;
    }

    currentNode.children.forEach(child => {
        extractContextTree(context, child, parent);
    });
}

export function useContextTree<T>(context: Context<T>, callback: (roots: ContextTreeNode<T>[]) => void) {
    const currentNode = TreeNode.current;
    if (!currentNode) throw new Error('useContextTree can only be called inside a component');

    useEffect(() => {
        const listener = currentNode.addListener('post-render', node => {
            const root: Omit<ContextTreeNode<T>, 'value'> = {
                children: []
            };

            node.children.forEach(child => {
                extractContextTree(context, child, root);
            });

            callback(root.children);
        });

        return () => {
            listener.remove();
        };
    }, []);
}
