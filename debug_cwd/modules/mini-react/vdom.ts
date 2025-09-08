import { HookType, HookState, createHookState } from './hook';
import {
    ComponentProps,
    FunctionComponent,
    Key,
    ReactElement,
    ReactNode,
    isNodeIterable,
    isReactElement
} from './types';
import { compareProps, flattenChildren } from './logic';
import { EventProducer } from 'event';
import { decompiler } from 'decompiler';

export const TextFragment: FunctionComponent<{ value: string }> = props => {
    return null;
};
TextFragment.displayName = '#text';

type TreeNodeEvents = {
    'pre-render'?: (self: TreeNode) => void;
    'post-render'?: (self: TreeNode) => void;
    mount?: (self: TreeNode) => void;
    unmount?: (self: TreeNode) => void;
};

export class TreeNode extends EventProducer<TreeNodeEvents> {
    private static s_nodeStack: TreeNode[] = [];
    private m_root: ReactRoot;
    private m_parent: TreeNode | null;
    private m_indexInParent: number;
    private m_generator: FunctionComponent<any>;
    private m_children: TreeNode[];
    private m_key: Key | undefined;
    private m_props: Record<string, any>;
    private m_currentHookIdx: number;
    private m_initialHookCount: number;
    private m_hooks: HookState<any>[];
    private m_contexts: Map<number, any> | null;
    private m_isMounted: boolean;
    private m_isDirty: boolean;

    private constructor(root: ReactRoot, sourceNode: ReactElement<any>, parent: TreeNode | null) {
        super();

        this.m_root = root;
        this.m_parent = parent;
        this.m_indexInParent = -1;
        this.m_children = [];
        this.m_generator = sourceNode.type;
        this.m_key = sourceNode.key;
        this.m_props = sourceNode.props;
        this.m_currentHookIdx = 0;
        this.m_initialHookCount = -1;
        this.m_hooks = [];
        this.m_contexts = null;
        this.m_isMounted = false;
        this.m_isDirty = false;
    }

    get root(): ReactRoot {
        return this.m_root;
    }

    get parent(): TreeNode | null {
        return this.m_parent;
    }

    get children(): TreeNode[] {
        return this.m_children.slice();
    }

    get hasChildren(): boolean {
        return this.m_children.length > 0;
    }

    get type(): FunctionComponent<any> {
        return this.m_generator;
    }

    get key(): Key | undefined {
        return this.m_key;
    }

    get props(): Record<string, any> {
        return Object.assign({}, this.m_props);
    }

    get isMounted(): boolean {
        return this.m_isMounted;
    }

    get isDirty(): boolean {
        return this.m_isDirty;
    }

    get displayName(): string {
        return this.m_generator.displayName || this.m_generator.name || 'Unknown';
    }

    private matches(other: TreeNode): boolean {
        if (this.m_key !== null && this.m_key !== undefined && this.m_key === other.m_key) {
            // early exit for common case
            if (this.m_generator === other.m_generator) return true;
        }

        if (this.m_isMounted && other.m_isMounted) {
            if (this.m_hooks.length !== other.m_hooks.length) return false;
        }

        if (this.m_key !== other.m_key) return false;
        if (this.m_generator !== other.m_generator) return false;
        if (!this.m_key && this.m_indexInParent !== other.m_indexInParent) return false;

        if (this.m_parent && other.m_parent && !this.m_parent.matches(other.m_parent)) return false;
        else if (!this.m_parent !== !other.m_parent) return false;

        return true;
    }

    private onMount() {
        this.m_isMounted = true;
        this.m_contexts = new Map();
        this.dispatch('mount', this);
    }

    private onUnmount() {
        this.dispatch('unmount', this);
        this.m_root.onNodeUnmount(this);
        this.m_children.forEach(child => child.onUnmount());
        this.m_isMounted = false;
        this.m_isDirty = false;
        this.m_hooks.forEach(hook => {
            if (hook.onUnmount) hook.onUnmount();
        });

        this.m_children = [];
        this.m_contexts = null;
    }

    private findMatchingChild(element: TreeNode): TreeNode | null {
        for (const child of this.m_children) {
            if (child.matches(element)) return child;
        }

        return null;
    }

    private handleGeneratorResult(result: ReactNode) {
        const updateNodes: Map<TreeNode, ComponentProps<any>> = new Map();
        const addNodes: TreeNode[] = [];
        const newChildren: TreeNode[] = [];

        const directChildren = flattenChildren(result);
        let c = 0;
        for (const child of directChildren) {
            const childNode = TreeNode.fromReactNode(this.m_root, child, this);
            if (childNode) {
                childNode.m_indexInParent = c;

                const replaces = this.findMatchingChild(childNode);
                if (replaces) {
                    updateNodes.set(replaces, childNode.props);
                    replaces.m_indexInParent = c;
                    newChildren.push(replaces);
                } else {
                    addNodes.push(childNode);
                    newChildren.push(childNode);
                }

                c++;
            }
        }

        for (let i = this.m_children.length - 1; i >= 0; i--) {
            if (!updateNodes.has(this.m_children[i])) {
                this.m_children[i].onUnmount();
            }
        }

        this.m_children = newChildren;

        for (const [node, props] of updateNodes) {
            node.m_isDirty = true;
            node.render(props);
        }

        for (const element of addNodes) {
            element.render(element.props);
        }
    }

    render(props: ComponentProps<any>) {
        if (this.m_isMounted && !this.m_isDirty && compareProps(this.m_props, props)) {
            return;
        }

        // Rerender all children
        this.m_children.forEach(child => {
            child.m_isDirty = true;
        });

        TreeNode.s_nodeStack.push(this);

        try {
            const isFirstRender = !this.m_isMounted;
            if (isFirstRender) this.onMount();
            this.m_currentHookIdx = 0;
            this.m_props = props;
            this.m_isDirty = false;

            this.dispatch('pre-render', this);
            const result = this.m_generator(props);

            if (isFirstRender) {
                this.m_initialHookCount = this.m_hooks.length;
            }

            this.handleGeneratorResult(result);
            this.dispatch('post-render', this);
        } catch (error) {
            console.error(error);
            this.printNodeStack();
        } finally {
            TreeNode.s_nodeStack.pop();
        }
    }

    executeHook<T, CreateParams extends any[]>(
        hookType: HookType,
        createCallback: (...createParams: CreateParams) => T,
        ...createCallbackParams: CreateParams
    ): HookState<T> {
        if (this.m_currentHookIdx === this.m_hooks.length) {
            if (this.m_initialHookCount > -1 && this.m_initialHookCount < this.m_hooks.length) {
                // Initial hook count has been set, and we're attempting to add a hook that would
                // increase the hook count beyond that. One (or more) hooks are being added that
                // did not exist when the component was initially rendered.
                throw new Error('Detected conditional hook usage');
            }

            const hookState = createHookState(hookType, createCallback(...createCallbackParams));
            this.m_hooks.push(hookState);
            this.m_currentHookIdx++;
            return hookState;
        }

        const hookState = this.m_hooks[this.m_currentHookIdx];
        this.m_currentHookIdx++;

        if (hookState.type !== hookType) {
            throw new Error('Detected a change in the hook usage order');
        }

        return hookState;
    }

    provideContext(contextId: number, value: any) {
        if (!this.m_contexts) {
            throw new Error('provideContext can only be called on a mounted component');
        }

        this.m_contexts.set(contextId, value);
    }

    getOwnContext<T>(contextId: number): T | undefined {
        if (!this.m_contexts) {
            throw new Error('getOwnContext can only be called on a mounted component');
        }

        return this.m_contexts.get(contextId);
    }

    getContext<T>(contextId: number): T | undefined {
        if (!this.m_contexts) {
            throw new Error('getContext can only be called on a mounted component');
        }

        if (this.m_contexts.has(contextId)) {
            return this.m_contexts.get(contextId) as T;
        }

        if (this.m_parent) {
            return this.m_parent.getContext(contextId);
        }

        return undefined;
    }

    raiseDirtyFlag() {
        this.m_isDirty = true;
    }

    toString() {
        const props = JSON.stringify(this.m_props, (key, value) => {
            if (key === 'children') return undefined;

            if (typeof value === 'string') {
                if (value.length > 16) {
                    return value.slice(0, 16) + '...';
                }
            }

            return value;
        });

        return `${this.displayName} ${props}`;
    }

    debugPrint(indentation: number = 0) {
        const indent = ' '.repeat(indentation);
        console.log(`${indent}${this}`);

        for (const child of this.m_children) {
            child.debugPrint(indentation + 2);
        }
    }

    printNodeStack() {
        console.error('The above error occurred in the following node stack (most recent first):');

        let n: TreeNode | null = this;
        while (n) {
            console.error(`    ${n.displayName}`);
            n = n.m_parent;
        }
    }

    static fromReactNode(root: ReactRoot, sourceNode: ReactElement<any>, parent: TreeNode | null): TreeNode;
    static fromReactNode(root: ReactRoot, sourceNode: ReactNode, parent: TreeNode | null): TreeNode | null;
    static fromReactNode(root: ReactRoot, sourceNode: ReactNode, parent: TreeNode | null): TreeNode | null {
        if (sourceNode === null || sourceNode === undefined || sourceNode === false) return null;

        if (isNodeIterable(sourceNode)) {
            return null;
        }

        if (isReactElement(sourceNode)) {
            return new TreeNode(root, sourceNode, parent);
        }

        const ele = {
            type: TextFragment,
            props: { value: String(sourceNode) },
            key: undefined
        };

        return new TreeNode(root, ele, parent);
    }

    static get current(): TreeNode | null {
        if (TreeNode.s_nodeStack.length === 0) return null;
        return TreeNode.s_nodeStack[TreeNode.s_nodeStack.length - 1];
    }
}

export class ReactRoot {
    /** @internal */
    private m_rootNode: TreeNode | null;

    /** @internal */
    private m_renderQueue: TreeNode[];

    /** @internal */
    private m_isRendering: boolean;

    /** @internal */
    constructor() {
        this.m_rootNode = null;
        this.m_renderQueue = [];
        this.m_isRendering = false;
    }

    /** @internal */
    get isRendering(): boolean {
        return this.m_isRendering;
    }

    /** @internal */
    private processRenderQueue() {
        if (!this.m_rootNode || this.m_renderQueue.length === 0) return;

        const rerenderQueue = this.m_renderQueue;
        this.m_renderQueue = [];

        this.m_isRendering = true;

        rerenderQueue.forEach(node => {
            if (!node.isMounted) return;
            node.render(node.props);
        });

        this.m_isRendering = false;

        this.onAfterRender(this.m_rootNode);
    }

    render(node: ReactElement<any>) {
        if (this.m_rootNode) {
            throw new Error(`ReactRoot.render should only be called once`);
        }

        decompiler.onService(() => {
            this.processRenderQueue();
        });

        this.m_rootNode = TreeNode.fromReactNode(this, node, null);

        this.m_isRendering = true;
        this.m_rootNode.render(this.m_rootNode.props);
        this.m_isRendering = false;

        if (this.m_renderQueue.length === 0) {
            this.onAfterRender(this.m_rootNode);
        }
    }

    /** @internal */
    onNodeUnmount(node: TreeNode) {
        this.m_renderQueue = this.m_renderQueue.filter(n => n !== node);
    }

    /** @internal */
    enqueueForRender(node: TreeNode) {
        node.raiseDirtyFlag();
        if (this.m_renderQueue.indexOf(node) !== -1) return;

        this.m_renderQueue.push(node);
    }

    /** @internal */
    onAfterRender(rootNode: TreeNode) {}
}

export function createRoot() {
    return new ReactRoot();
}
