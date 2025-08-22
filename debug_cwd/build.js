"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
define("modules/plugin", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IPlugin = void 0;
    class IPlugin {
        constructor(name) {
            this.m_name = name;
        }
        get name() {
            return this.m_name;
        }
        onInitialize() { }
        onShutdown() { }
        onService() { }
    }
    exports.IPlugin = IPlugin;
});
define("modules/plugin-manager", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class PluginManager {
        constructor() {
            this.m_plugins = [];
            this.m_initialized = false;
        }
        addPlugin(plugin) {
            if (this.m_initialized) {
                throw new Error(`Plugin ${plugin.name} cannot be added after initialization`);
            }
            console.log(`Adding plugin ${plugin.name}`);
            this.m_plugins.push(plugin);
        }
        initialize() {
            if (this.m_initialized) {
                throw new Error(`PluginManager already initialized`);
            }
            this.m_initialized = true;
            for (const plugin of this.m_plugins) {
                console.log(`Initializing plugin ${plugin.name}`);
                plugin.onInitialize();
            }
        }
        shutdown() {
            if (!this.m_initialized) {
                throw new Error(`PluginManager not initialized`);
            }
            this.m_initialized = false;
            for (const plugin of this.m_plugins) {
                console.log(`Shutting down plugin ${plugin.name}`);
                plugin.onShutdown();
            }
        }
    }
    const Manager = new PluginManager();
    exports.default = Manager;
});
define("modules/mini-react/hook", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HookType = void 0;
    exports.createHookState = createHookState;
    var HookType;
    (function (HookType) {
        HookType[HookType["State"] = 0] = "State";
        HookType[HookType["Effect"] = 1] = "Effect";
        HookType[HookType["Ref"] = 2] = "Ref";
        HookType[HookType["Memo"] = 3] = "Memo";
    })(HookType || (exports.HookType = HookType = {}));
    function createHookState(type, value, onUnmount) {
        return {
            type,
            value,
            onUnmount
        };
    }
});
define("modules/mini-react/types", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isReactElement = isReactElement;
    exports.isNodeIterable = isNodeIterable;
    exports.isSpecificElement = isSpecificElement;
    function isReactElement(element) {
        if (!element)
            return false;
        return typeof element === 'object' && 'type' in element && 'props' in element;
    }
    function isNodeIterable(node) {
        if (node === null || node === undefined)
            return false;
        if (typeof node !== 'object')
            return false;
        if ('type' in node)
            return false;
        if (typeof node[Symbol.iterator] !== 'function')
            return false;
        return true;
    }
    function isSpecificElement(type, compareTo, props) {
        return type === compareTo;
    }
});
define("modules/is-changed", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isChanged = isChanged;
    /**
     * Recursively determines if two values of the same type are different in any way
     *
     * @template T Type of value to check
     * @param a First value
     * @param b Second value
     * @returns `true` if `a` and `b` are different in any way, otherwise `false`
     */
    function isChanged(a, b) {
        if (a === undefined && b === undefined)
            return false;
        if (a === null && b === null)
            return false;
        if ((a === undefined) !== (b === undefined))
            return true;
        if ((a === null) !== (b === null))
            return true;
        if (a === null || b === null)
            return false;
        if (Array.isArray(a)) {
            if (!Array.isArray(b) || b.length !== a.length)
                return true;
            return a.some((ele, idx) => isChanged(ele, b[idx]));
        }
        if (typeof a === 'object') {
            if (typeof b !== 'object')
                return true;
            if (Object.keys(a).some(k => isChanged(a[k], b[k])))
                return true;
            if (Object.keys(b).some(k => isChanged(a[k], b[k])))
                return true;
            return false;
        }
        return a !== b;
    }
});
define("modules/mini-react/logic", ["require", "exports", "modules/mini-react/types", "modules/is-changed"], function (require, exports, types_1, is_changed_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.compareProps = compareProps;
    exports.comparePropsDeep = comparePropsDeep;
    exports.flattenChildren = flattenChildren;
    /**
     * Compares two props objects for equality.
     *
     * @param a - The first props object
     * @param b - The second props object
     *
     * @returns True if the props objects are equal, false otherwise.
     */
    function compareProps(a, b) {
        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);
        if (aKeys.length !== bKeys.length)
            return false;
        for (const key of aKeys) {
            if (key === 'children')
                continue;
            if (!(key in b))
                return false;
            if (a[key] !== b[key])
                return false;
        }
        return true;
    }
    /**
     * Deeply compares two props objects for equality.
     *
     * @param a - The first props object
     * @param b - The second props object
     *
     * @returns True if the props objects are equal, including nested objects and arrays recursively, false otherwise.
     */
    function comparePropsDeep(a, b) {
        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);
        if (aKeys.length !== bKeys.length)
            return false;
        for (const key of aKeys) {
            if (key === 'children')
                continue;
            if ((0, is_changed_1.isChanged)(a[key], b[key]))
                return false;
        }
        return true;
    }
    function flattenChildren(children) {
        if (children === null || children === undefined)
            return [];
        if ((0, types_1.isNodeIterable)(children)) {
            const result = [];
            for (const child of children) {
                result.push(...flattenChildren(child));
            }
            return result;
        }
        return [children];
    }
});
define("modules/event", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EventProducer = void 0;
    class EventProducer {
        constructor() {
            this.m_nextId = 1;
            this.m_listeners = {};
        }
        addListener(event, callback, options) {
            const id = this.m_nextId++;
            if (!(event in this.m_listeners)) {
                this.m_listeners[event] = [];
            }
            const map = this.m_listeners[event];
            map.push({
                id,
                callback,
                options: options !== null && options !== void 0 ? options : EventProducer.defaultOptions
            });
            return {
                id,
                remove: () => {
                    const index = map.findIndex(l => l.id === id);
                    if (index !== -1)
                        map.splice(index, 1);
                }
            };
        }
        dispatch(event, ...args) {
            if (!(event in this.m_listeners))
                return [];
            const listeners = this.m_listeners[event];
            const removeIndices = [];
            listeners.forEach((cb, idx) => {
                try {
                    cb.callback(...args);
                }
                catch (err) {
                    console.error(err);
                }
                finally {
                    if (cb.options.once)
                        removeIndices.push(idx);
                }
            });
            for (let i = removeIndices.length - 1; i >= 0; i--) {
                listeners.splice(removeIndices[i], 1);
            }
        }
        dispatchReverse(event, ...args) {
            if (!(event in this.m_listeners))
                return [];
            const listeners = this.m_listeners[event];
            for (let i = listeners.length - 1; i >= 0; i--) {
                const cb = listeners[i];
                try {
                    cb.callback(...args);
                }
                catch (err) {
                    console.error(err);
                }
                finally {
                    if (cb.options.once)
                        listeners.splice(i, 1);
                }
            }
        }
    }
    exports.EventProducer = EventProducer;
    EventProducer.defaultOptions = {
        once: false
    };
});
define("modules/mini-react/vdom", ["require", "exports", "modules/mini-react/hook", "modules/mini-react/types", "modules/mini-react/logic", "modules/event"], function (require, exports, hook_1, types_2, logic_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReactRoot = exports.TreeNode = exports.TextFragment = void 0;
    exports.createRoot = createRoot;
    const TextFragment = props => {
        return null;
    };
    exports.TextFragment = TextFragment;
    exports.TextFragment.displayName = '#text';
    class TreeNode extends event_1.EventProducer {
        constructor(root, sourceNode, parent) {
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
        get root() {
            return this.m_root;
        }
        get parent() {
            return this.m_parent;
        }
        get children() {
            return this.m_children.slice();
        }
        get hasChildren() {
            return this.m_children.length > 0;
        }
        get type() {
            return this.m_generator;
        }
        get key() {
            return this.m_key;
        }
        get props() {
            return Object.assign({}, this.m_props);
        }
        get isMounted() {
            return this.m_isMounted;
        }
        get isDirty() {
            return this.m_isDirty;
        }
        get displayName() {
            return this.m_generator.displayName || this.m_generator.name || 'Unknown';
        }
        matches(other) {
            if (this.m_key !== null && this.m_key !== undefined && this.m_key === other.m_key) {
                // early exit for common case
                if (this.m_generator === other.m_generator)
                    return true;
            }
            if (this.m_isMounted && other.m_isMounted) {
                if (this.m_hooks.length !== other.m_hooks.length)
                    return false;
            }
            if (this.m_key !== other.m_key)
                return false;
            if (this.m_generator !== other.m_generator)
                return false;
            if (!this.m_key && this.m_indexInParent !== other.m_indexInParent)
                return false;
            if (this.m_parent && other.m_parent && !this.m_parent.matches(other.m_parent))
                return false;
            else if (!this.m_parent !== !other.m_parent)
                return false;
            return true;
        }
        onMount() {
            this.m_isMounted = true;
            this.m_contexts = new Map();
            this.dispatch('mount', this);
        }
        onUnmount() {
            this.dispatch('unmount', this);
            this.m_children.forEach(child => child.onUnmount());
            this.m_isMounted = false;
            this.m_isDirty = false;
            this.m_hooks.forEach(hook => {
                if (hook.onUnmount)
                    hook.onUnmount();
            });
            this.m_children = [];
            this.m_contexts = null;
        }
        addChild(node) {
            node.m_indexInParent = this.m_children.length;
            this.m_children.push(node);
        }
        findMatchingChild(element) {
            for (const child of this.m_children) {
                if (child.matches(element))
                    return child;
            }
            return null;
        }
        handleGeneratedDirectChild(child, updateMap, addNodes) {
            const replaces = this.findMatchingChild(child);
            if (replaces)
                updateMap.set(replaces, child.props);
            else
                addNodes.push(child);
        }
        handleGeneratorResult(result) {
            const updateNodes = new Map();
            const addNodes = [];
            const directChildren = (0, logic_1.flattenChildren)(result);
            let c = 0;
            for (const child of directChildren) {
                const childNode = TreeNode.fromReactNode(this.m_root, child, this);
                if (childNode) {
                    childNode.m_indexInParent = c;
                    this.handleGeneratedDirectChild(childNode, updateNodes, addNodes);
                    c++;
                }
            }
            for (const [node, props] of updateNodes) {
                node.render(props);
            }
            const removeIndices = [];
            for (let i = this.m_children.length - 1; i >= 0; i--) {
                if (!updateNodes.has(this.m_children[i])) {
                    removeIndices.push(i);
                    this.m_children[i].onUnmount();
                }
            }
            for (const index of removeIndices) {
                this.m_children.splice(index, 1);
            }
            for (const element of addNodes) {
                this.addChild(element);
                element.render(element.props);
            }
        }
        render(props) {
            if (this.m_isMounted && !this.m_isDirty && (0, logic_1.compareProps)(this.m_props, props)) {
                return;
            }
            TreeNode.s_nodeStack.push(this);
            try {
                const isFirstRender = !this.m_isMounted;
                if (isFirstRender)
                    this.onMount();
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
            }
            catch (error) {
                console.error(error);
                this.printNodeStack();
            }
            finally {
                TreeNode.s_nodeStack.pop();
            }
        }
        executeHook(hookType, createCallback, ...createCallbackParams) {
            if (this.m_currentHookIdx === this.m_hooks.length) {
                if (this.m_initialHookCount > -1 && this.m_initialHookCount < this.m_hooks.length) {
                    // Initial hook count has been set, and we're attempting to add a hook that would
                    // increase the hook count beyond that. One (or more) hooks are being added that
                    // did not exist when the component was initially rendered.
                    throw new Error('Detected conditional hook usage');
                }
                const hookState = (0, hook_1.createHookState)(hookType, createCallback(...createCallbackParams));
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
        provideContext(contextId, value) {
            if (!this.m_contexts) {
                throw new Error('provideContext can only be called on a mounted component');
            }
            this.m_contexts.set(contextId, value);
        }
        getOwnContext(contextId) {
            if (!this.m_contexts) {
                throw new Error('getOwnContext can only be called on a mounted component');
            }
            return this.m_contexts.get(contextId);
        }
        getContext(contextId) {
            if (!this.m_contexts) {
                throw new Error('getContext can only be called on a mounted component');
            }
            if (this.m_contexts.has(contextId)) {
                return this.m_contexts.get(contextId);
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
                if (key === 'children')
                    return undefined;
                if (typeof value === 'string') {
                    if (value.length > 16) {
                        return value.slice(0, 16) + '...';
                    }
                }
                return value;
            });
            return `${this.displayName} ${props}`;
        }
        debugPrint(indentation = 0) {
            const indent = ' '.repeat(indentation);
            console.log(`${indent}${this}`);
            for (const child of this.m_children) {
                child.debugPrint(indentation + 2);
            }
        }
        printNodeStack() {
            console.error('The above error occurred in the following node stack (most recent first):');
            let n = this;
            while (n) {
                console.error(`    ${n.displayName}`);
                n = n.m_parent;
            }
        }
        static fromReactNode(root, sourceNode, parent) {
            if (sourceNode === null || sourceNode === undefined)
                return null;
            if ((0, types_2.isNodeIterable)(sourceNode)) {
                return null;
            }
            if ((0, types_2.isReactElement)(sourceNode)) {
                return new TreeNode(root, sourceNode, parent);
            }
            const ele = {
                type: exports.TextFragment,
                props: { value: String(sourceNode) },
                key: undefined
            };
            return new TreeNode(root, ele, parent);
        }
        static get current() {
            if (TreeNode.s_nodeStack.length === 0)
                return null;
            return TreeNode.s_nodeStack[TreeNode.s_nodeStack.length - 1];
        }
    }
    exports.TreeNode = TreeNode;
    TreeNode.s_nodeStack = [];
    class ReactRoot {
        /** @internal */
        constructor() {
            this.m_rootNode = null;
            this.m_renderQueue = [];
            this.m_isRendering = false;
        }
        /** @internal */
        get isRendering() {
            return this.m_isRendering;
        }
        /** @internal */
        processRenderQueue(depth = 0) {
            if (!this.m_rootNode || this.m_renderQueue.length === 0)
                return;
            const rerenderQueue = this.m_renderQueue;
            this.m_renderQueue = [];
            this.m_isRendering = true;
            rerenderQueue.forEach(node => {
                node.render(node.props);
            });
            this.m_isRendering = false;
            if (depth === 0) {
                this.processRenderQueue(depth + 1);
            }
            this.onAfterRender(this.m_rootNode);
        }
        render(node) {
            if (this.m_rootNode) {
                throw new Error(`ReactRoot.render should only be called once`);
            }
            this.m_rootNode = TreeNode.fromReactNode(this, node, null);
            this.m_isRendering = true;
            this.m_rootNode.render(this.m_rootNode.props);
            this.m_isRendering = false;
            if (this.m_renderQueue.length === 0) {
                this.onAfterRender(this.m_rootNode);
            }
            this.processRenderQueue();
        }
        /** @internal */
        enqueueForRender(node) {
            node.raiseDirtyFlag();
            if (this.m_renderQueue.indexOf(node) !== -1)
                return;
            this.m_renderQueue.push(node);
            if (!this.m_isRendering) {
                this.processRenderQueue();
            }
        }
        /** @internal */
        onAfterRender(rootNode) { }
    }
    exports.ReactRoot = ReactRoot;
    function createRoot() {
        return new ReactRoot();
    }
});
define("modules/mini-react/element", ["require", "exports", "modules/mini-react/logic"], function (require, exports, logic_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createElement = createElement;
    function createElement(type, componentProps, ...children) {
        const props = componentProps !== null && componentProps !== void 0 ? componentProps : {};
        if ('children' in props) {
            throw new Error('children should not be provided as a prop');
        }
        return {
            type,
            props: Object.assign(Object.assign({}, props), { children: (0, logic_2.flattenChildren)(children) }),
            key: props.key
        };
    }
});
define("modules/mini-react/useState", ["require", "exports", "modules/mini-react/vdom", "modules/mini-react/hook"], function (require, exports, vdom_1, hook_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useState = useState;
    function makeStateData(value) {
        return {
            current: value,
            next: null
        };
    }
    function useState(initialValue) {
        const currentNode = vdom_1.TreeNode.current;
        if (!currentNode)
            throw new Error('useState can only be called inside a component');
        const hookState = currentNode.executeHook(hook_2.HookType.State, makeStateData, initialValue);
        if (hookState.value.next) {
            hookState.value.current = hookState.value.next.value;
            hookState.value.next = null;
        }
        const setter = (value) => {
            if (hookState.value.current === value)
                return;
            hookState.value.next = {
                value
            };
            currentNode.root.enqueueForRender(currentNode);
        };
        return [hookState.value.current, setter];
    }
});
define("modules/mini-react/useEffect", ["require", "exports", "modules/mini-react/vdom", "modules/mini-react/hook"], function (require, exports, vdom_2, hook_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useEffect = useEffect;
    function createEffectHookData(dependencies) {
        return {
            cleanupCallback: null,
            dependencies,
            justMounted: true
        };
    }
    function checkEffectDependency(prev, current) {
        if (prev.length !== current.length)
            return true;
        for (let i = 0; i < prev.length; i++) {
            if (prev[i] !== current[i])
                return true;
        }
        return false;
    }
    function useEffect(callback, dependencies) {
        const currentNode = vdom_2.TreeNode.current;
        if (!currentNode)
            throw new Error('useEffect can only be called inside a component');
        const hookState = currentNode.executeHook(hook_3.HookType.Effect, createEffectHookData, dependencies);
        if (hookState.value.dependencies.length !== dependencies.length) {
            throw new Error('Number of useEffect dependencies must not change between renders');
        }
        if (hookState.value.justMounted || checkEffectDependency(hookState.value.dependencies, dependencies)) {
            hookState.value.justMounted = false;
            hookState.value.dependencies = dependencies;
            if (hookState.value.cleanupCallback) {
                try {
                    hookState.value.cleanupCallback();
                }
                catch (error) {
                    console.error('Error in useEffect cleanup callback');
                    console.error(error);
                }
            }
            try {
                const cleanup = callback();
                if (cleanup)
                    hookState.value.cleanupCallback = cleanup;
                else
                    hookState.value.cleanupCallback = null;
                hookState.onUnmount = () => {
                    if (hookState.value.cleanupCallback) {
                        try {
                            hookState.value.cleanupCallback();
                        }
                        catch (error) {
                            console.error('Error in useEffect cleanup callback');
                            console.error(error);
                        }
                    }
                };
            }
            catch (error) {
                console.error('Error in useEffect callback');
                console.error(error);
            }
        }
    }
});
define("modules/mini-react/useRef", ["require", "exports", "modules/mini-react/vdom", "modules/mini-react/hook"], function (require, exports, vdom_3, hook_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useRef = useRef;
    function makeRefData(value) {
        return {
            current: value
        };
    }
    function useRef(initialValue) {
        const currentNode = vdom_3.TreeNode.current;
        if (!currentNode)
            throw new Error('useState can only be called inside a component');
        const hookState = currentNode.executeHook(hook_4.HookType.Ref, makeRefData, initialValue);
        return hookState.value;
    }
});
define("modules/mini-react/useMemo", ["require", "exports", "modules/mini-react/vdom", "modules/mini-react/hook"], function (require, exports, vdom_4, hook_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useMemo = useMemo;
    function createMemoHookData(callback, dependencies) {
        try {
            return {
                value: callback(null),
                dependencies
            };
        }
        catch (error) {
            console.error('Error in useMemo callback', String(error));
            throw error;
        }
    }
    function checkMemoDependency(prev, current) {
        if (prev.length !== current.length)
            return true;
        for (let i = 0; i < prev.length; i++) {
            if (prev[i] !== current[i])
                return true;
        }
        return false;
    }
    function useMemo(callback, dependencies = []) {
        const currentNode = vdom_4.TreeNode.current;
        if (!currentNode)
            throw new Error('useMemo can only be called inside a component');
        const hookState = currentNode.executeHook(hook_5.HookType.Memo, createMemoHookData, callback, dependencies);
        if (hookState.value.dependencies.length !== dependencies.length) {
            throw new Error('Number of useEffect dependencies must not change between renders');
        }
        if (checkMemoDependency(hookState.value.dependencies, dependencies)) {
            hookState.value.dependencies = dependencies;
            try {
                hookState.value.value = callback({ value: hookState.value.value });
            }
            catch (error) {
                console.error('Error in useMemo callback');
                console.error(error);
            }
        }
        return hookState.value.value;
    }
});
define("modules/mini-react/context", ["require", "exports", "modules/mini-react/useEffect", "modules/mini-react/vdom"], function (require, exports, useEffect_1, vdom_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createContext = createContext;
    exports.useContext = useContext;
    exports.useContextTree = useContextTree;
    let nextContextId = 1;
    function createContext() {
        const id = nextContextId++;
        const listeningNodes = new Set();
        return {
            id,
            listeningNodes,
            Provider: (props) => {
                const currentNode = vdom_5.TreeNode.current;
                currentNode.provideContext(id, props.value);
                (0, useEffect_1.useEffect)(() => {
                    for (const node of listeningNodes) {
                        node.root.enqueueForRender(node);
                    }
                }, [props.value]);
                return props.children;
            }
        };
    }
    function useContext(context) {
        const currentNode = vdom_5.TreeNode.current;
        if (!currentNode)
            throw new Error('useContext can only be called inside a component');
        (0, useEffect_1.useEffect)(() => {
            context.listeningNodes.add(currentNode);
            return () => {
                context.listeningNodes.delete(currentNode);
            };
        }, []);
        const contextValue = currentNode.getContext(context.id);
        if (!contextValue)
            return null;
        return contextValue;
    }
    function extractContextTree(context, currentNode, parent) {
        const contextValue = currentNode.getOwnContext(context.id);
        if (contextValue) {
            const node = {
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
    function useContextTree(context, callback) {
        const currentNode = vdom_5.TreeNode.current;
        if (!currentNode)
            throw new Error('useContextTree can only be called inside a component');
        (0, useEffect_1.useEffect)(() => {
            const listener = currentNode.addListener('post-render', node => {
                const root = {
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
});
define("modules/mini-react/fragment", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Fragment = void 0;
    const Fragment = props => {
        return props.children;
    };
    exports.Fragment = Fragment;
});
define("modules/mini-react/index", ["require", "exports", "modules/mini-react/vdom", "modules/mini-react/element", "modules/mini-react/useState", "modules/mini-react/useEffect", "modules/mini-react/useRef", "modules/mini-react/useMemo", "modules/mini-react/context", "modules/mini-react/fragment", "modules/mini-react/logic", "modules/mini-react/types"], function (require, exports, vdom_6, element_1, useState_1, useEffect_2, useRef_1, useMemo_1, context_1, fragment_1, logic_3, types_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.comparePropsDeep = exports.compareProps = exports.flattenChildren = exports.Fragment = exports.useContextTree = exports.useContext = exports.createContext = exports.useMemo = exports.useRef = exports.useEffect = exports.useState = exports.createElement = exports.createRoot = void 0;
    Object.defineProperty(exports, "createRoot", { enumerable: true, get: function () { return vdom_6.createRoot; } });
    Object.defineProperty(exports, "createElement", { enumerable: true, get: function () { return element_1.createElement; } });
    Object.defineProperty(exports, "useState", { enumerable: true, get: function () { return useState_1.useState; } });
    Object.defineProperty(exports, "useEffect", { enumerable: true, get: function () { return useEffect_2.useEffect; } });
    Object.defineProperty(exports, "useRef", { enumerable: true, get: function () { return useRef_1.useRef; } });
    Object.defineProperty(exports, "useMemo", { enumerable: true, get: function () { return useMemo_1.useMemo; } });
    Object.defineProperty(exports, "createContext", { enumerable: true, get: function () { return context_1.createContext; } });
    Object.defineProperty(exports, "useContext", { enumerable: true, get: function () { return context_1.useContext; } });
    Object.defineProperty(exports, "useContextTree", { enumerable: true, get: function () { return context_1.useContextTree; } });
    Object.defineProperty(exports, "Fragment", { enumerable: true, get: function () { return fragment_1.Fragment; } });
    Object.defineProperty(exports, "flattenChildren", { enumerable: true, get: function () { return logic_3.flattenChildren; } });
    Object.defineProperty(exports, "compareProps", { enumerable: true, get: function () { return logic_3.compareProps; } });
    Object.defineProperty(exports, "comparePropsDeep", { enumerable: true, get: function () { return logic_3.comparePropsDeep; } });
    __exportStar(types_3, exports);
});
define("modules/components/window", ["require", "exports", "modules/mini-react/index"], function (require, exports, React) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WindowProvider = void 0;
    exports.useCurrentWindow = useCurrentWindow;
    const Context = React.createContext();
    const WindowProvider = props => {
        var _a, _b, _c, _d;
        const [isOpen, setIsOpen] = React.useState(false);
        const [isFocused, setIsFocused] = React.useState(false);
        const [size, setSize] = React.useState({ width: (_a = props.width) !== null && _a !== void 0 ? _a : 0, height: (_b = props.height) !== null && _b !== void 0 ? _b : 0 });
        const [position, setPosition] = React.useState({ x: (_c = props.x) !== null && _c !== void 0 ? _c : 0, y: (_d = props.y) !== null && _d !== void 0 ? _d : 0 });
        const { window } = props;
        React.useEffect(() => {
            const sz = window.getSize();
            const p = window.getPosition();
            if (sz.x !== size.width || sz.y !== size.height) {
                setSize({ width: sz.x, height: sz.y });
            }
            if (p.x !== position.x || p.y !== position.y) {
                setPosition({ x: p.x, y: p.y });
            }
            const openListener = window.onOpen(() => {
                setIsOpen(true);
                if (props.onOpen)
                    props.onOpen();
            });
            const closeListener = window.onClose(() => {
                setIsOpen(false);
                if (props.onClose)
                    props.onClose();
            });
            const focusListener = window.onFocus(() => {
                setIsFocused(true);
                if (props.onFocus)
                    props.onFocus();
            });
            const blurListener = window.onBlur(() => {
                setIsFocused(false);
                if (props.onBlur)
                    props.onBlur();
            });
            const resizeListener = window.onResize((width, height) => {
                setSize({ width, height });
                if (props.onResize)
                    props.onResize(width, height);
            });
            const moveListener = window.onMove((x, y) => {
                setPosition({ x, y });
                if (props.onMove)
                    props.onMove(x, y);
            });
            return () => {
                console.log(`Destroying window ${window.getTitle()}`);
                window.offOpen(openListener);
                window.offClose(closeListener);
                window.offFocus(focusListener);
                window.offBlur(blurListener);
                window.offResize(resizeListener);
                window.offMove(moveListener);
                window.destroy();
            };
        }, []);
        React.useEffect(() => {
            if (props.title) {
                window.setTitle(props.title);
            }
        }, [props.title]);
        React.useEffect(() => {
            var _a, _b;
            if (props.width || props.height) {
                let newWidth = (_a = props.width) !== null && _a !== void 0 ? _a : size.width;
                let newHeight = (_b = props.height) !== null && _b !== void 0 ? _b : size.height;
                if (newWidth !== size.width || newHeight !== size.height) {
                    window.setSize(newWidth, newHeight);
                }
            }
        }, [props.width, props.height]);
        React.useEffect(() => {
            var _a, _b;
            if (props.x || props.y) {
                let newX = (_a = props.x) !== null && _a !== void 0 ? _a : position.x;
                let newY = (_b = props.y) !== null && _b !== void 0 ? _b : position.y;
                if (newX !== position.x || newY !== position.y) {
                    window.setPosition(newX, newY);
                }
            }
        }, [props.x, props.y, position]);
        React.useEffect(() => {
            if (props.open === true && !isOpen) {
                window.setOpen(true);
            }
            else if (props.open === false && isOpen) {
                window.setOpen(false);
            }
        }, [isOpen, props.open]);
        React.useEffect(() => {
            if (props.onKeyDown && window) {
                const listener = window.onKeyDown(props.onKeyDown);
                return () => {
                    window.offKeyDown(listener);
                };
            }
        }, [props.onKeyDown]);
        React.useEffect(() => {
            if (props.onKeyUp && window) {
                const listener = window.onKeyUp(props.onKeyUp);
                return () => {
                    window.offKeyUp(listener);
                };
            }
        }, [props.onKeyUp]);
        React.useEffect(() => {
            if (props.onMouseMove && window) {
                const listener = window.onMouseMove(props.onMouseMove);
                return () => {
                    window.offMouseMove(listener);
                };
            }
        }, [props.onMouseMove]);
        React.useEffect(() => {
            if (props.onMouseDown && window) {
                const listener = window.onMouseDown(props.onMouseDown);
                return () => {
                    window.offMouseDown(listener);
                };
            }
        }, [props.onMouseDown]);
        React.useEffect(() => {
            if (props.onMouseUp && window) {
                const listener = window.onMouseUp(props.onMouseUp);
                return () => {
                    window.offMouseUp(listener);
                };
            }
        }, [props.onMouseUp]);
        React.useEffect(() => {
            if (props.onScroll && window) {
                const listener = window.onScroll(props.onScroll);
                return () => {
                    window.offScroll(listener);
                };
            }
        }, [props.onScroll]);
        if (!isOpen)
            return null;
        return (React.createElement(Context.Provider, { value: {
                window,
                isOpen,
                isFocused,
                size,
                position
            } }, props.children));
    };
    exports.WindowProvider = WindowProvider;
    function useCurrentWindow() {
        const context = React.useContext(Context);
        if (!context) {
            throw new Error('useCurrentWindow must be used within a Window component');
        }
        return context;
    }
});
define("modules/components/vulkan/logic", ["require", "exports", "render", "vulkan"], function (require, exports, Render, vulkan_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.defaultChoosePhysicalDevice = defaultChoosePhysicalDevice;
    function defaultChoosePhysicalDevice(instance, surface) {
        const swapChainSupport = new Render.SwapChainSupport();
        const preferredFormat = vulkan_1.VkFormat.VK_FORMAT_B8G8R8A8_SRGB;
        const preferredColorSpace = vulkan_1.VkColorSpaceKHR.VK_COLOR_SPACE_SRGB_NONLINEAR_KHR;
        const preferredPresentMode = vulkan_1.VkPresentModeKHR.VK_PRESENT_MODE_FIFO_KHR;
        const devices = Render.PhysicalDevice.list(instance);
        for (const device of devices) {
            if (!device.isDiscrete())
                continue;
            if (!device.isExtensionAvailable('VK_KHR_swapchain'))
                continue;
            if (!device.getSurfaceSwapChainSupport(surface, swapChainSupport))
                continue;
            if (!swapChainSupport.isValid())
                continue;
            if (!swapChainSupport.hasFormat(preferredFormat, preferredColorSpace))
                continue;
            if (!swapChainSupport.hasPresentMode(preferredPresentMode))
                continue;
            const capabilities = swapChainSupport.getCapabilities();
            if (capabilities.maxImageCount > 0 && capabilities.maxImageCount < 3)
                continue;
            return device;
        }
        return null;
    }
});
define("modules/components/vulkan/root", ["require", "exports", "modules/mini-react/index", "render", "modules/event", "modules/components/window", "modules/components/vulkan/logic"], function (require, exports, React, Render, event_2, window_1, logic_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Root = void 0;
    exports.useVulkan = useVulkan;
    const Context = React.createContext();
    Context.Provider.displayName = 'VulkanRootProvider';
    function createContext(window, props) {
        var _a, _b, _c, _d;
        const extensions = (_a = props.extensions) !== null && _a !== void 0 ? _a : [];
        let instance = null;
        let surface = null;
        let physicalDevice = null;
        let logicalDevice = null;
        const abort = (message) => {
            if (logicalDevice)
                logicalDevice.destroy();
            if (physicalDevice)
                physicalDevice.destroy();
            if (surface)
                surface.destroy();
            if (instance) {
                window.removeNestedLogger(instance);
                instance.destroy();
            }
            throw new Error(message);
        };
        instance = new Render.Instance();
        window.addNestedLogger(instance);
        if (props.enableValidation)
            instance.enableValidation();
        if (!instance.initialize()) {
            abort('Failed to initialize Vulkan instance');
        }
        surface = new Render.Surface(instance, window);
        if (!surface.init()) {
            abort('Failed to initialize Vulkan surface');
        }
        try {
            if (props.selectPhysicalDevice) {
                physicalDevice = props.selectPhysicalDevice(Render.PhysicalDevice.list(instance));
            }
            else {
                physicalDevice = (0, logic_4.defaultChoosePhysicalDevice)(instance, surface);
            }
        }
        catch (e) {
            abort(`Caught exception while selecting physical device: ${String(e)}`);
        }
        if (!physicalDevice) {
            abort('Failed to find suitable physical device');
        }
        physicalDevice = new Render.PhysicalDevice(physicalDevice);
        logicalDevice = new Render.LogicalDevice(physicalDevice);
        for (const extension of extensions) {
            if (!logicalDevice.enableExtension(extension)) {
                abort(`Failed to enable extension: ${extension}`);
            }
        }
        let result = logicalDevice.init((_b = props.needsGraphics) !== null && _b !== void 0 ? _b : false, (_c = props.needsCompute) !== null && _c !== void 0 ? _c : false, (_d = props.needsTransfer) !== null && _d !== void 0 ? _d : false, surface);
        if (!result)
            abort('Failed to initialize logical device');
        return {
            instance,
            physicalDevice: physicalDevice,
            logicalDevice,
            surface,
            eventSource: new event_2.EventProducer()
        };
    }
    function shutdownContext(window, ctx) {
        ctx.eventSource.dispatchReverse('before-shutdown');
        if (ctx.logicalDevice)
            ctx.logicalDevice.destroy();
        if (ctx.surface)
            ctx.surface.destroy();
        if (ctx.instance) {
            window.removeNestedLogger(ctx.instance);
            ctx.instance.destroy();
        }
    }
    const Root = props => {
        const { window } = (0, window_1.useCurrentWindow)();
        const context = React.useRef(null);
        const error = React.useRef(null);
        const prevProps = React.useRef(null);
        React.useEffect(() => {
            if (error.current)
                return;
            if (!window) {
                if (context.current) {
                    shutdownContext(window, context.current);
                    context.current = null;
                    error.current = null;
                }
                return;
            }
            if (!prevProps.current) {
                prevProps.current = props;
                try {
                    context.current = createContext(window, props);
                    error.current = null;
                }
                catch (e) {
                    console.error('Failed to create Vulkan root context', String(e));
                    context.current = null;
                    error.current = e;
                }
                return;
            }
            if (!context.current) {
                prevProps.current = props;
                try {
                    context.current = createContext(window, props);
                    error.current = null;
                }
                catch (e) {
                    console.error('Failed to create Vulkan root context', String(e));
                    context.current = null;
                    error.current = e;
                }
                return;
            }
            if (!React.comparePropsDeep(prevProps.current, props)) {
                prevProps.current = props;
                let newContext = null;
                try {
                    newContext = createContext(window, props);
                    shutdownContext(window, context.current);
                    context.current = newContext;
                    error.current = null;
                }
                catch (e) {
                    console.error('Failed to create Vulkan root context', String(e));
                    if (newContext) {
                        try {
                            shutdownContext(window, newContext);
                        }
                        catch (e1) {
                            console.error('Failed to shutdown vulkan root context that was created but not used due to another error', String(e1));
                        }
                    }
                    context.current = null;
                    error.current = e;
                }
                return;
            }
        }, [window, context, props, error]);
        React.useEffect(() => {
            return () => {
                if (context.current) {
                    shutdownContext(window, context.current);
                    context.current = null;
                    error.current = null;
                }
            };
        }, []);
        if (!context.current)
            return null;
        return React.createElement(Context.Provider, { value: context.current }, props.children);
    };
    exports.Root = Root;
    function useVulkan() {
        const context = React.useContext(Context);
        if (!context)
            throw new Error('useVulkan must be used within a Vulkan.Root component');
        const addListener = context.eventSource.addListener.bind(context.eventSource);
        return {
            instance: context.instance,
            physicalDevice: context.physicalDevice,
            logicalDevice: context.logicalDevice,
            surface: context.surface,
            addListener
        };
    }
});
define("modules/components/vulkan/render-pass", ["require", "exports", "modules/mini-react/index", "render", "vulkan", "modules/components/vulkan/root", "modules/components/window"], function (require, exports, React, Render, vulkan_2, root_1, window_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RenderPass = void 0;
    exports.useRenderPass = useRenderPass;
    const Context = React.createContext();
    Context.Provider.displayName = 'RenderPassProvider';
    function createContext(props, vulkan, prevSwapChain) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        let swapChainSupport = null;
        let swapChain = null;
        let renderPass = null;
        let frameManager = null;
        let shaderCompiler = null;
        let vboFactory = null;
        let uboFactory = null;
        let dsFactory = null;
        const abort = (message) => {
            if (uboFactory)
                uboFactory.destroy();
            if (dsFactory)
                dsFactory.destroy();
            if (vboFactory)
                vboFactory.destroy();
            if (shaderCompiler) {
                vulkan.instance.removeNestedLogger(shaderCompiler);
                shaderCompiler.destroy();
            }
            if (frameManager) {
                vulkan.instance.removeNestedLogger(frameManager);
                frameManager.destroy();
            }
            if (renderPass)
                renderPass.destroy();
            if (swapChain)
                swapChain.destroy();
            if (swapChainSupport)
                swapChainSupport.destroy();
            throw new Error(message);
        };
        swapChainSupport = new Render.SwapChainSupport();
        if (!vulkan.physicalDevice.getSurfaceSwapChainSupport(vulkan.surface, swapChainSupport)) {
            abort(`Failed to get swap chain support for ${vulkan.physicalDevice.getName()}`);
        }
        swapChain = new Render.SwapChain();
        const result = swapChain.init(vulkan.surface, vulkan.logicalDevice, swapChainSupport, (_a = props.imageFormat) !== null && _a !== void 0 ? _a : vulkan_2.VkFormat.VK_FORMAT_B8G8R8A8_SRGB, (_b = props.imageColorSpace) !== null && _b !== void 0 ? _b : vulkan_2.VkColorSpaceKHR.VK_COLOR_SPACE_SRGB_NONLINEAR_KHR, (_c = props.presentMode) !== null && _c !== void 0 ? _c : vulkan_2.VkPresentModeKHR.VK_PRESENT_MODE_FIFO_KHR, (_d = props.imageCount) !== null && _d !== void 0 ? _d : 3, (_e = props.usage) !== null && _e !== void 0 ? _e : vulkan_2.VkImageUsageFlags.VK_IMAGE_USAGE_COLOR_ATTACHMENT_BIT, (_f = props.compositeAlpha) !== null && _f !== void 0 ? _f : vulkan_2.VkCompositeAlphaFlagsKHR.VK_COMPOSITE_ALPHA_OPAQUE_BIT_KHR, prevSwapChain);
        if (!result) {
            abort('Failed to initialize swap chain');
        }
        if (!swapChain.isValid()) {
            abort('Swap chain is invalid');
        }
        renderPass = new Render.RenderPass(swapChain);
        if (!renderPass.init()) {
            abort('Failed to initialize render pass');
        }
        frameManager = new Render.FrameManager(swapChain, renderPass);
        vulkan.instance.addNestedLogger(frameManager);
        if (!frameManager.init()) {
            abort('Failed to initialize frame manager');
        }
        shaderCompiler = new Render.ShaderCompiler(vulkan.logicalDevice);
        vulkan.instance.addNestedLogger(shaderCompiler);
        if (!shaderCompiler.init()) {
            abort('Failed to initialize shader compiler');
        }
        vboFactory = new Render.VertexBufferFactory(vulkan.logicalDevice, (_g = props.vertexPoolSize) !== null && _g !== void 0 ? _g : 8096);
        uboFactory = new Render.UniformObjectFactory(vulkan.logicalDevice, (_h = props.uniformPoolSize) !== null && _h !== void 0 ? _h : 1024);
        dsFactory = new Render.DescriptorFactory(vulkan.logicalDevice, (_j = props.descriptorPoolSize) !== null && _j !== void 0 ? _j : 256);
        return {
            swapChainSupport,
            swapChain,
            renderPass,
            frameManager,
            shaderCompiler,
            vboFactory,
            uboFactory,
            dsFactory
        };
    }
    function shutdownContext(ctx, device) {
        device.waitForIdle();
        if (ctx.dsFactory)
            ctx.dsFactory.destroy();
        if (ctx.uboFactory)
            ctx.uboFactory.destroy();
        if (ctx.vboFactory)
            ctx.vboFactory.destroy();
        if (ctx.shaderCompiler)
            ctx.shaderCompiler.destroy();
        if (ctx.frameManager)
            ctx.frameManager.destroy();
        if (ctx.renderPass)
            ctx.renderPass.destroy();
        if (ctx.swapChain)
            ctx.swapChain.destroy();
        if (ctx.swapChainSupport)
            ctx.swapChainSupport.destroy();
    }
    const RenderPass = props => {
        const vulkan = (0, root_1.useVulkan)();
        const { size } = (0, window_2.useCurrentWindow)();
        const context = React.useRef(null);
        const error = React.useRef(null);
        const prevProps = React.useRef(null);
        const shutdown = () => {
            if (!context.current)
                return;
            shutdownContext(context.current, vulkan.logicalDevice);
            context.current = null;
            error.current = null;
        };
        React.useEffect(() => {
            if (!context.current)
                return;
            try {
                vulkan.logicalDevice.waitForIdle();
                vulkan.instance.removeNestedLogger(context.current.frameManager);
                context.current.frameManager.destroy();
                vulkan.logicalDevice.waitForIdle();
                context.current.swapChain.recreate();
                context.current.frameManager = new Render.FrameManager(context.current.swapChain, context.current.renderPass);
                vulkan.instance.addNestedLogger(context.current.frameManager);
                if (!context.current.frameManager.init()) {
                    throw new Error('Failed to recreate frame manager');
                }
            }
            catch (e) {
                console.error('Failed to recreate swap chain after window resize', String(e));
                shutdown();
            }
        }, [size.width, size.height]);
        React.useEffect(() => {
            if (error.current)
                return;
            if (!prevProps.current) {
                prevProps.current = props;
                try {
                    context.current = createContext(props, vulkan, null);
                    error.current = null;
                }
                catch (e) {
                    console.error('Failed to create render pass context', String(e));
                    context.current = null;
                    error.current = e;
                }
                return;
            }
            if (!context.current) {
                prevProps.current = props;
                try {
                    context.current = createContext(props, vulkan, null);
                    error.current = null;
                }
                catch (e) {
                    console.error('Failed to create render pass context', String(e));
                    context.current = null;
                    error.current = e;
                }
                return;
            }
            if (!React.comparePropsDeep(prevProps.current, props)) {
                prevProps.current = props;
                let nextContext = null;
                try {
                    nextContext = createContext(props, vulkan, context.current.swapChain);
                    shutdown();
                    context.current = nextContext;
                    error.current = null;
                }
                catch (e) {
                    console.error('Failed to create render pass context', String(e));
                    try {
                        if (nextContext)
                            shutdownContext(nextContext, vulkan.logicalDevice);
                    }
                    catch (e1) {
                        console.error('Failed to shutdown render pass context that was created but not used due to another error', String(e1));
                    }
                    context.current = null;
                    error.current = e;
                }
                return;
            }
        }, [context, props, error]);
        React.useEffect(() => {
            const listener = vulkan.addListener('before-shutdown', shutdown);
            return () => {
                listener.remove();
                shutdown();
            };
        }, []);
        if (!context.current)
            return null;
        return React.createElement(Context.Provider, { value: context.current }, props.children);
    };
    exports.RenderPass = RenderPass;
    function useRenderPass() {
        const context = React.useContext(Context);
        if (!context)
            throw new Error('useRenderPass must be used within a Vulkan.RenderPass component');
        return context;
    }
});
define("modules/components/vulkan/graph", ["require", "exports", "modules/mini-react/index", "decompiler", "modules/components/window", "modules/components/vulkan/render-pass"], function (require, exports, React, decompiler_1, window_3, render_pass_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RenderNode = exports.RenderGraph = void 0;
    exports.useRender = useRender;
    const RenderContext = React.createContext();
    RenderContext.Provider.displayName = 'RenderGraphProvider';
    const RenderNodeContext = React.createContext();
    RenderNodeContext.Provider.displayName = 'RenderNodeProvider';
    function beforeRenderNode(node, frame) {
        if (node.value.beforeRender)
            node.value.beforeRender(frame);
        for (const child of node.children)
            beforeRenderNode(child, frame);
    }
    function renderNode(node, frame) {
        if (node.value.render)
            node.value.render(frame);
        for (const child of node.children)
            renderNode(child, frame);
    }
    const RenderGraph = props => {
        const { size } = (0, window_3.useCurrentWindow)();
        const renderPass = (0, render_pass_1.useRenderPass)();
        const needsRender = React.useRef(true);
        const renderTrees = React.useRef([]);
        React.useContextTree(RenderNodeContext, trees => {
            renderTrees.current = trees;
        });
        const render = () => {
            if (!needsRender.current || !renderPass.frameManager)
                return;
            needsRender.current = false;
            const frame = renderPass.frameManager.getFrame();
            if (frame.begin()) {
                for (const tree of renderTrees.current) {
                    beforeRenderNode(tree, frame);
                }
                for (const tree of renderTrees.current) {
                    renderNode(tree, frame);
                }
                frame.end();
            }
            renderPass.frameManager.releaseFrame(frame);
        };
        React.useEffect(() => {
            const l = decompiler_1.decompiler.onService(render);
            return () => {
                decompiler_1.decompiler.offService(l);
            };
        }, [renderPass.frameManager]);
        React.useEffect(() => {
            needsRender.current = true;
            // windows blocks event polling on resize, so we must render now to update the view
            render();
        }, [size.width, size.height]);
        const setNeedsRender = (value) => {
            needsRender.current = value;
        };
        const ctx = React.useRef({
            setNeedsRender
        });
        return React.createElement(RenderContext.Provider, { value: ctx.current }, props.children);
    };
    exports.RenderGraph = RenderGraph;
    function useRender() {
        const ctx = React.useContext(RenderContext);
        if (!ctx)
            throw new Error('useRenderer must be used within a RenderProvider component');
        const requestAdditionalFrame = () => {
            ctx.setNeedsRender(true);
        };
        return {
            requestAdditionalFrame
        };
    }
    const RenderNode = props => {
        const renderCtx = React.useContext(RenderContext);
        if (!renderCtx)
            throw new Error('RenderNode must be used within a RenderProvider component');
        renderCtx.setNeedsRender(true);
        const nodeData = {
            beforeRender: props.beforeRender || null,
            render: props.execute || null
        };
        return React.createElement(RenderNodeContext.Provider, { value: nodeData }, props.children);
    };
    exports.RenderNode = RenderNode;
});
define("modules/components/vulkan/debug", ["require", "exports", "modules/mini-react/index", "render", "modules/components/vulkan/render-pass", "modules/components/vulkan/graph"], function (require, exports, React, Render, render_pass_2, graph_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DebugDraw = void 0;
    exports.useDebugDraw = useDebugDraw;
    const Context = React.createContext();
    Context.Provider.displayName = 'DebugDrawProvider';
    const DebugDraw = props => {
        const { children, maxLines } = props;
        const renderPass = (0, render_pass_2.useRenderPass)();
        const context = React.useRef(null);
        React.useEffect(() => {
            if (!context.current) {
                const debugDraw = new Render.SimpleDebugDraw();
                const result = debugDraw.init(renderPass.shaderCompiler, renderPass.swapChain, renderPass.renderPass, renderPass.vboFactory, renderPass.uboFactory, renderPass.dsFactory, maxLines !== null && maxLines !== void 0 ? maxLines : 4096);
                if (!result) {
                    console.error('Failed to initialize debug draw');
                    return;
                }
                context.current = { debugDraw };
            }
            return () => {
                if (context.current) {
                    renderPass.renderPass.getDevice().waitForIdle();
                    context.current.debugDraw.destroy();
                    context.current = null;
                }
            };
        }, []);
        if (!context.current)
            return null;
        const { debugDraw } = context.current;
        return (React.createElement(Context.Provider, { value: context.current },
            React.createElement(graph_1.RenderNode, { execute: frame => {
                    debugDraw.begin(frame.getSwapChainImageIndex());
                } }),
            children,
            React.createElement(graph_1.RenderNode, { execute: frame => {
                    const cb = frame.getCommandBuffer();
                    debugDraw.end(cb);
                    cb.beginRenderPass(debugDraw.getPipeline(), frame.getFramebuffer());
                    debugDraw.draw(cb);
                    cb.endRenderPass();
                } })));
    };
    exports.DebugDraw = DebugDraw;
    function useDebugDraw() {
        const context = React.useContext(Context);
        if (!context)
            throw new Error('useDebugDraw must be used within a DebugDraw component');
        return context.debugDraw;
    }
});
define("modules/components/vulkan/graphics-pipeline", ["require", "exports", "modules/mini-react/index", "render", "modules/components/vulkan/root", "vulkan", "modules/components/vulkan/render-pass", "modules/components/vulkan/graph"], function (require, exports, React, Render, root_2, vulkan_3, render_pass_3, graph_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GraphicsPipeline = void 0;
    exports.useGraphicsPipeline = useGraphicsPipeline;
    const Context = React.createContext();
    Context.Provider.displayName = 'GraphicsPipelineProvider';
    function createContext(props, vulkan, renderPass) {
        const pipeline = new Render.GraphicsPipeline(renderPass.shaderCompiler, vulkan.logicalDevice, renderPass.swapChain, renderPass.renderPass);
        vulkan.instance.addNestedLogger(pipeline);
        if (props.vertexFormat)
            pipeline.setVertexFormat(props.vertexFormat);
        if (props.uniformBlocks) {
            props.uniformBlocks.forEach(block => {
                pipeline.addUniformBlock(block.bindIndex, block.format, block.stages);
            });
        }
        if (props.samplers) {
            props.samplers.forEach(sampler => {
                pipeline.addSampler(sampler.bindIndex, sampler.stages);
            });
        }
        if (props.dynamicStateFields) {
            props.dynamicStateFields.forEach(field => pipeline.addDynamicState(field));
        }
        if (props.vertexShaderSource) {
            if (!pipeline.setVertexShader(props.vertexShaderSource)) {
                throw new Error('Failed to set vertex shader');
            }
        }
        if (props.fragmentShaderSource) {
            if (!pipeline.setFragmentShader(props.fragmentShaderSource)) {
                throw new Error('Failed to set fragment shader');
            }
        }
        if (props.geometryShaderSource) {
            if (!pipeline.setGeometryShader(props.geometryShaderSource)) {
                throw new Error('Failed to set geometry shader');
            }
        }
        if (!pipeline.init()) {
            throw new Error('Failed to initialize graphics pipeline');
        }
        return {
            pipeline,
            vertexFormat: props.vertexFormat || null,
            uniformBlocks: props.uniformBlocks || [],
            samplers: props.samplers || []
        };
    }
    function shutdownContext(context, vulkan) {
        if (context.pipeline) {
            try {
                vulkan.logicalDevice.waitForIdle();
                vulkan.instance.removeNestedLogger(context.pipeline);
                context.pipeline.destroy();
            }
            catch (e) {
                console.error('Failed to shutdown graphics pipeline', String(e));
            }
        }
    }
    const GraphicsPipeline = props => {
        const vulkan = (0, root_2.useVulkan)();
        const renderPass = (0, render_pass_3.useRenderPass)();
        const context = React.useRef(null);
        const error = React.useRef(null);
        const prevProps = React.useRef(null);
        const init = () => {
            let newContext = null;
            try {
                vulkan.logicalDevice.waitForIdle();
                newContext = createContext(props, vulkan, renderPass);
                if (context.current)
                    shutdownContext(context.current, vulkan);
                context.current = newContext;
                error.current = null;
            }
            catch (e) {
                console.error('Failed to create graphics pipeline context', String(e));
                error.current = e;
                if (newContext) {
                    try {
                        if (newContext)
                            shutdownContext(newContext, vulkan);
                    }
                    catch (e1) {
                        console.error('Failed to shutdown graphics pipeline context that was created but not used due to another error', String(e1));
                    }
                }
            }
        };
        const shutdown = () => {
            if (!context.current)
                return;
            shutdownContext(context.current, vulkan);
        };
        React.useEffect(init, [
            vulkan.logicalDevice,
            renderPass.shaderCompiler,
            renderPass.swapChain,
            renderPass.renderPass
        ]);
        React.useEffect(() => {
            if (error.current)
                return;
            if (!prevProps.current || !React.comparePropsDeep(prevProps.current, props))
                init();
            prevProps.current = props;
        }, [props]);
        React.useEffect(() => {
            const listener = vulkan.addListener('before-shutdown', shutdown);
            return () => {
                listener.remove();
                shutdown();
            };
        }, []);
        if (!context.current)
            return null;
        const { pipeline } = context.current;
        return (React.createElement(Context.Provider, { value: context.current },
            React.createElement(graph_2.RenderNode, { execute: frame => {
                    const cb = frame.getCommandBuffer();
                    cb.beginRenderPass(pipeline, frame.getFramebuffer());
                    cb.bindPipeline(pipeline, vulkan_3.VkPipelineBindPoint.VK_PIPELINE_BIND_POINT_GRAPHICS);
                } }),
            props.children,
            React.createElement(graph_2.RenderNode, { execute: frame => {
                    const cb = frame.getCommandBuffer();
                    cb.endRenderPass();
                } })));
    };
    exports.GraphicsPipeline = GraphicsPipeline;
    function useGraphicsPipeline() {
        const ctx = React.useContext(Context);
        if (!ctx)
            throw new Error('useGraphicsPipeline must be used within a Vulkan.GraphicsPipeline component');
        const { vboFactory, uboFactory, dsFactory } = (0, render_pass_3.useRenderPass)();
        const allocateVertices = (count) => {
            if (!ctx.vertexFormat)
                throw new Error('Vertex format not set');
            return vboFactory.allocate(ctx.vertexFormat, count);
        };
        const allocateUniformObject = (forBindingIndex) => {
            const block = ctx.uniformBlocks.find(b => b.bindIndex === forBindingIndex);
            if (!block) {
                throw new Error(`No uniform block found in the pipeline for the specified binding index: ${forBindingIndex}`);
            }
            return uboFactory.allocate(block.format);
        };
        const allocateDescriptorSet = () => {
            return dsFactory.allocate(ctx.pipeline);
        };
        return {
            pipeline: ctx.pipeline,
            allocateVertices,
            allocateUniformObject,
            allocateDescriptorSet
        };
    }
});
define("modules/components/vulkan/index", ["require", "exports", "modules/components/vulkan/root", "modules/components/vulkan/render-pass", "modules/components/vulkan/graph", "modules/components/vulkan/debug", "modules/components/vulkan/graphics-pipeline"], function (require, exports, root_3, render_pass_4, graph_3, debug_1, graphics_pipeline_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(root_3, exports);
    __exportStar(render_pass_4, exports);
    __exportStar(graph_3, exports);
    __exportStar(debug_1, exports);
    __exportStar(graphics_pipeline_1, exports);
});
define("modules/components/index", ["require", "exports", "modules/components/window", "modules/components/vulkan/index"], function (require, exports, window_4, Vulkan) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Vulkan = void 0;
    __exportStar(window_4, exports);
    exports.Vulkan = Vulkan;
});
define("modules/ui/types/style", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SizeUnit = exports.BorderStyle = exports.TextOverflow = exports.Overflow = exports.WordWrap = exports.WordBreak = exports.WhiteSpace = exports.TextDecoration = exports.TextAlign = exports.FontStyle = exports.FlexWrap = exports.AlignItems = exports.JustifyContent = exports.FlexDirection = exports.Position = void 0;
    var Position;
    (function (Position) {
        Position[Position["Static"] = 0] = "Static";
        Position[Position["Relative"] = 1] = "Relative";
        Position[Position["Absolute"] = 2] = "Absolute";
        Position[Position["Fixed"] = 3] = "Fixed";
        Position[Position["Sticky"] = 4] = "Sticky";
    })(Position || (exports.Position = Position = {}));
    var FlexDirection;
    (function (FlexDirection) {
        FlexDirection[FlexDirection["Row"] = 0] = "Row";
        FlexDirection[FlexDirection["Column"] = 1] = "Column";
        FlexDirection[FlexDirection["RowReverse"] = 2] = "RowReverse";
        FlexDirection[FlexDirection["ColumnReverse"] = 3] = "ColumnReverse";
    })(FlexDirection || (exports.FlexDirection = FlexDirection = {}));
    var JustifyContent;
    (function (JustifyContent) {
        JustifyContent[JustifyContent["FlexStart"] = 0] = "FlexStart";
        JustifyContent[JustifyContent["FlexEnd"] = 1] = "FlexEnd";
        JustifyContent[JustifyContent["Center"] = 2] = "Center";
        JustifyContent[JustifyContent["SpaceBetween"] = 3] = "SpaceBetween";
        JustifyContent[JustifyContent["SpaceAround"] = 4] = "SpaceAround";
        JustifyContent[JustifyContent["SpaceEvenly"] = 5] = "SpaceEvenly";
    })(JustifyContent || (exports.JustifyContent = JustifyContent = {}));
    var AlignItems;
    (function (AlignItems) {
        AlignItems[AlignItems["FlexStart"] = 0] = "FlexStart";
        AlignItems[AlignItems["FlexEnd"] = 1] = "FlexEnd";
        AlignItems[AlignItems["Center"] = 2] = "Center";
        AlignItems[AlignItems["Stretch"] = 3] = "Stretch";
        AlignItems[AlignItems["Baseline"] = 4] = "Baseline";
    })(AlignItems || (exports.AlignItems = AlignItems = {}));
    var FlexWrap;
    (function (FlexWrap) {
        FlexWrap[FlexWrap["NoWrap"] = 0] = "NoWrap";
        FlexWrap[FlexWrap["Wrap"] = 1] = "Wrap";
        FlexWrap[FlexWrap["WrapReverse"] = 2] = "WrapReverse";
    })(FlexWrap || (exports.FlexWrap = FlexWrap = {}));
    var FontStyle;
    (function (FontStyle) {
        FontStyle[FontStyle["Normal"] = 0] = "Normal";
        FontStyle[FontStyle["Italic"] = 1] = "Italic";
        FontStyle[FontStyle["Oblique"] = 2] = "Oblique";
    })(FontStyle || (exports.FontStyle = FontStyle = {}));
    var TextAlign;
    (function (TextAlign) {
        TextAlign[TextAlign["Left"] = 0] = "Left";
        TextAlign[TextAlign["Center"] = 1] = "Center";
        TextAlign[TextAlign["Right"] = 2] = "Right";
        TextAlign[TextAlign["Justify"] = 3] = "Justify";
    })(TextAlign || (exports.TextAlign = TextAlign = {}));
    var TextDecoration;
    (function (TextDecoration) {
        TextDecoration[TextDecoration["None"] = 0] = "None";
        TextDecoration[TextDecoration["Underline"] = 1] = "Underline";
        TextDecoration[TextDecoration["Overline"] = 2] = "Overline";
        TextDecoration[TextDecoration["LineThrough"] = 3] = "LineThrough";
    })(TextDecoration || (exports.TextDecoration = TextDecoration = {}));
    var WhiteSpace;
    (function (WhiteSpace) {
        WhiteSpace[WhiteSpace["Normal"] = 0] = "Normal";
        WhiteSpace[WhiteSpace["Nowrap"] = 1] = "Nowrap";
        WhiteSpace[WhiteSpace["Pre"] = 2] = "Pre";
        WhiteSpace[WhiteSpace["PreWrap"] = 3] = "PreWrap";
        WhiteSpace[WhiteSpace["PreLine"] = 4] = "PreLine";
    })(WhiteSpace || (exports.WhiteSpace = WhiteSpace = {}));
    var WordBreak;
    (function (WordBreak) {
        WordBreak[WordBreak["Normal"] = 0] = "Normal";
        WordBreak[WordBreak["BreakAll"] = 1] = "BreakAll";
        WordBreak[WordBreak["BreakWord"] = 2] = "BreakWord";
    })(WordBreak || (exports.WordBreak = WordBreak = {}));
    var WordWrap;
    (function (WordWrap) {
        WordWrap[WordWrap["Normal"] = 0] = "Normal";
        WordWrap[WordWrap["BreakWord"] = 1] = "BreakWord";
    })(WordWrap || (exports.WordWrap = WordWrap = {}));
    var Overflow;
    (function (Overflow) {
        Overflow[Overflow["Visible"] = 0] = "Visible";
        Overflow[Overflow["Hidden"] = 1] = "Hidden";
        Overflow[Overflow["Scroll"] = 2] = "Scroll";
    })(Overflow || (exports.Overflow = Overflow = {}));
    var TextOverflow;
    (function (TextOverflow) {
        TextOverflow[TextOverflow["Clip"] = 0] = "Clip";
        TextOverflow[TextOverflow["Ellipsis"] = 1] = "Ellipsis";
        TextOverflow[TextOverflow["Unset"] = 2] = "Unset";
    })(TextOverflow || (exports.TextOverflow = TextOverflow = {}));
    var BorderStyle;
    (function (BorderStyle) {
        BorderStyle[BorderStyle["None"] = 0] = "None";
        BorderStyle[BorderStyle["Hidden"] = 1] = "Hidden";
        BorderStyle[BorderStyle["Dotted"] = 2] = "Dotted";
        BorderStyle[BorderStyle["Dashed"] = 3] = "Dashed";
        BorderStyle[BorderStyle["Solid"] = 4] = "Solid";
        BorderStyle[BorderStyle["Double"] = 5] = "Double";
    })(BorderStyle || (exports.BorderStyle = BorderStyle = {}));
    var SizeUnit;
    (function (SizeUnit) {
        SizeUnit[SizeUnit["px"] = 0] = "px";
        SizeUnit[SizeUnit["percent"] = 1] = "percent";
        SizeUnit[SizeUnit["em"] = 2] = "em";
        SizeUnit[SizeUnit["rem"] = 3] = "rem";
        SizeUnit[SizeUnit["vw"] = 4] = "vw";
        SizeUnit[SizeUnit["vh"] = 5] = "vh";
    })(SizeUnit || (exports.SizeUnit = SizeUnit = {}));
});
define("modules/math-ext/vec2", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.vec2 = void 0;
    class vec2 {
        constructor(x = 0, y = 0) {
            this.x = x;
            this.y = y;
        }
        set(other) {
            this.x = other.x;
            this.y = other.y;
        }
        get lengthSq() {
            return this.x * this.x + this.y * this.y;
        }
        get length() {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        }
        get normalized() {
            const invLength = 1.0 / this.length;
            return new vec2(this.x * invLength, this.y * invLength);
        }
        normalize() {
            const invLength = 1.0 / this.length;
            this.x *= invLength;
            this.y *= invLength;
        }
        dot(other) {
            return this.x * other.x + this.y * other.y;
        }
        toString() {
            return `vec2(${this.x}, ${this.y})`;
        }
        static add(out, lhs, rhs) {
            out.x = lhs.x + rhs.x;
            out.y = lhs.y + rhs.y;
        }
        static sub(out, lhs, rhs) {
            out.x = lhs.x - rhs.x;
            out.y = lhs.y - rhs.y;
        }
        static mul(out, lhs, rhs) {
            out.x = lhs.x * rhs.x;
            out.y = lhs.y * rhs.y;
        }
        static div(out, lhs, rhs) {
            out.x = lhs.x / rhs.x;
            out.y = lhs.y / rhs.y;
        }
        static addScalar(out, lhs, rhs) {
            out.x = lhs.x + rhs;
            out.y = lhs.y + rhs;
        }
        static subScalar(out, lhs, rhs) {
            out.x = lhs.x - rhs;
            out.y = lhs.y - rhs;
        }
        static mulScalar(out, lhs, rhs) {
            out.x = lhs.x * rhs;
            out.y = lhs.y * rhs;
        }
        static divScalar(out, lhs, rhs) {
            out.x = lhs.x / rhs;
            out.y = lhs.y / rhs;
        }
    }
    exports.vec2 = vec2;
});
define("modules/math-ext/vec3", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.vec3 = void 0;
    class vec3 {
        constructor(x = 0, y = 0, z = 0) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        set(other) {
            this.x = other.x;
            this.y = other.y;
            this.z = other.z;
        }
        get lengthSq() {
            return this.x * this.x + this.y * this.y + this.z * this.z;
        }
        get length() {
            return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        }
        get normalized() {
            const invLength = 1.0 / this.length;
            return new vec3(this.x * invLength, this.y * invLength, this.z * invLength);
        }
        normalize() {
            const invLength = 1.0 / this.length;
            this.x *= invLength;
            this.y *= invLength;
            this.z *= invLength;
        }
        dot(other) {
            return this.x * other.x + this.y * other.y + this.z * other.z;
        }
        cross(other) {
            return new vec3(this.y * other.z - this.z * other.y, this.z * other.x - this.x * other.z, this.x * other.y - this.y * other.x);
        }
        static add(out, lhs, rhs) {
            out.x = lhs.x + rhs.x;
            out.y = lhs.y + rhs.y;
            out.z = lhs.z + rhs.z;
        }
        static sub(out, lhs, rhs) {
            out.x = lhs.x - rhs.x;
            out.y = lhs.y - rhs.y;
            out.z = lhs.z - rhs.z;
        }
        static mul(out, lhs, rhs) {
            out.x = lhs.x * rhs.x;
            out.y = lhs.y * rhs.y;
            out.z = lhs.z * rhs.z;
        }
        static div(out, lhs, rhs) {
            out.x = lhs.x / rhs.x;
            out.y = lhs.y / rhs.y;
            out.z = lhs.z / rhs.z;
        }
        static addScalar(out, lhs, rhs) {
            out.x = lhs.x + rhs;
            out.y = lhs.y + rhs;
            out.z = lhs.z + rhs;
        }
        static subScalar(out, lhs, rhs) {
            out.x = lhs.x - rhs;
            out.y = lhs.y - rhs;
            out.z = lhs.z - rhs;
        }
        static mulScalar(out, lhs, rhs) {
            out.x = lhs.x * rhs;
            out.y = lhs.y * rhs;
            out.z = lhs.z * rhs;
        }
        static divScalar(out, lhs, rhs) {
            out.x = lhs.x / rhs;
            out.y = lhs.y / rhs;
            out.z = lhs.z / rhs;
        }
    }
    exports.vec3 = vec3;
});
define("modules/math-ext/mat3", ["require", "exports", "modules/math-ext/vec3"], function (require, exports, vec3_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mat3 = void 0;
    class mat3 {
        constructor(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        set(other) {
            this.x.set(other.x);
            this.y.set(other.y);
            this.z.set(other.z);
        }
        row(index) {
            switch (index) {
                case 0:
                    return this.x;
                case 1:
                    return this.y;
                case 2:
                    return this.z;
                default:
                    throw new Error('Invalid index');
            }
        }
        col(index) {
            switch (index) {
                case 0:
                    return new vec3_1.vec3(this.x.x, this.y.x, this.z.x);
                case 1:
                    return new vec3_1.vec3(this.x.y, this.y.y, this.z.y);
                case 2:
                    return new vec3_1.vec3(this.x.z, this.y.z, this.z.z);
                default:
                    throw new Error('Invalid index');
            }
        }
        static mul(out, lhs, rhs) {
            if (out instanceof mat3 && rhs instanceof mat3) {
                return this.mulMM(out, lhs, rhs);
            }
            else if (out instanceof vec3_1.vec3 && rhs instanceof vec3_1.vec3) {
                return this.mulMV(out, lhs, rhs);
            }
            throw new Error('mat3.mul: Invalid arguments');
        }
        static mulMV(out, lhs, rhs) {
            const x = lhs.x.x * rhs.x + lhs.x.y * rhs.y + lhs.x.z * rhs.z;
            const y = lhs.y.x * rhs.x + lhs.y.y * rhs.y + lhs.y.z * rhs.z;
            const z = lhs.z.x * rhs.x + lhs.z.y * rhs.y + lhs.z.z * rhs.z;
            out.x = x;
            out.y = y;
            out.z = z;
        }
        static mulMM(out, lhs, rhs) {
            const xx = lhs.x.x * rhs.x.x + lhs.x.y * rhs.y.x + lhs.x.z * rhs.z.x;
            const xy = lhs.x.x * rhs.x.y + lhs.x.y * rhs.y.y + lhs.x.z * rhs.z.y;
            const xz = lhs.x.x * rhs.x.z + lhs.x.y * rhs.y.z + lhs.x.z * rhs.z.z;
            const yx = lhs.y.x * rhs.x.x + lhs.y.y * rhs.y.x + lhs.y.z * rhs.z.x;
            const yy = lhs.y.x * rhs.x.y + lhs.y.y * rhs.y.y + lhs.y.z * rhs.z.y;
            const yz = lhs.y.x * rhs.x.z + lhs.y.y * rhs.y.z + lhs.y.z * rhs.z.z;
            const zx = lhs.z.x * rhs.x.x + lhs.z.y * rhs.y.x + lhs.z.z * rhs.z.x;
            const zy = lhs.z.x * rhs.x.y + lhs.z.y * rhs.y.y + lhs.z.z * rhs.z.y;
            const zz = lhs.z.x * rhs.x.z + lhs.z.y * rhs.y.z + lhs.z.z * rhs.z.z;
            out.x.x = xx;
            out.x.y = xy;
            out.x.z = xz;
            out.y.x = yx;
            out.y.y = yy;
            out.y.z = yz;
            out.z.x = zx;
            out.z.y = zy;
            out.z.z = zz;
        }
        static identity(out) {
            out.x.x = 1;
            out.x.y = 0;
            out.x.z = 0;
            out.y.x = 0;
            out.y.y = 1;
            out.y.z = 0;
            out.z.x = 0;
            out.z.y = 0;
            out.z.z = 1;
        }
        /**
         * Creates a scale matrix.
         *
         * @param out - The output matrix.
         * @param x - The x-coordinate of the scale.
         * @param y - The y-coordinate of the scale.
         * @param z - The z-coordinate of the scale.
         */
        static scale(out, x, y, z) {
            out.x.x = x;
            out.x.y = 0;
            out.x.z = 0;
            out.y.x = 0;
            out.y.y = y;
            out.y.z = 0;
            out.z.x = 0;
            out.z.y = 0;
            out.z.z = z;
        }
        /**
         * Creates a rotation matrix around the X axis.
         *
         * @param angle - The angle of rotation in radians.
         */
        static rotationX(out, angle) {
            const s = Math.sin(angle);
            const c = Math.cos(angle);
            out.x.x = 1;
            out.x.y = 0;
            out.x.z = 0;
            out.y.x = 0;
            out.y.y = c;
            out.y.z = s;
            out.z.x = 0;
            out.z.y = -s;
            out.z.z = c;
        }
        /**
         * Creates a rotation matrix around the Y axis.
         *
         * @param out - The output matrix.
         * @param angle - The angle of rotation in radians.
         */
        static rotationY(out, angle) {
            const s = Math.sin(angle);
            const c = Math.cos(angle);
            out.x.x = c;
            out.x.y = 0;
            out.x.z = -s;
            out.y.x = 0;
            out.y.y = 1;
            out.y.z = 0;
            out.z.x = s;
            out.z.y = 0;
            out.z.z = c;
        }
        /**
         * Creates a rotation matrix around the Z axis.
         *
         * @param out - The output matrix.
         * @param angle - The angle of rotation in radians.
         */
        static rotationZ(out, angle) {
            const s = Math.sin(angle);
            const c = Math.cos(angle);
            out.x.x = c;
            out.x.y = -s;
            out.x.z = 0;
            out.y.x = s;
            out.y.y = c;
            out.y.z = 0;
            out.z.x = 0;
            out.z.y = 0;
            out.z.z = 1;
        }
    }
    exports.mat3 = mat3;
});
define("modules/math-ext/vec4", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.vec4 = void 0;
    class vec4 {
        constructor(x = 0, y = 0, z = 0, w = 0) {
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
        }
        set(other) {
            this.x = other.x;
            this.y = other.y;
            this.z = other.z;
            this.w = other.w;
        }
        get lengthSq() {
            return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
        }
        get length() {
            return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
        }
        get normalized() {
            const invLength = 1.0 / this.length;
            return new vec4(this.x * invLength, this.y * invLength, this.z * invLength, this.w * invLength);
        }
        normalize() {
            const invLength = 1.0 / this.length;
            this.x *= invLength;
            this.y *= invLength;
            this.z *= invLength;
            this.w *= invLength;
        }
        dot(other) {
            return this.x * other.x + this.y * other.y + this.z * other.z + this.w * other.w;
        }
        cross(other) {
            return new vec4(this.y * other.z - this.z * other.y, this.z * other.x - this.x * other.z, this.x * other.y - this.y * other.x, 0);
        }
        static from(xyz, w = 0) {
            return new vec4(xyz.x, xyz.y, xyz.z, w);
        }
        static add(out, lhs, rhs) {
            out.x = lhs.x + rhs.x;
            out.y = lhs.y + rhs.y;
            out.z = lhs.z + rhs.z;
            out.w = lhs.w + rhs.w;
        }
        static sub(out, lhs, rhs) {
            out.x = lhs.x - rhs.x;
            out.y = lhs.y - rhs.y;
            out.z = lhs.z - rhs.z;
            out.w = lhs.w - rhs.w;
        }
        static mul(out, lhs, rhs) {
            out.x = lhs.x * rhs.x;
            out.y = lhs.y * rhs.y;
            out.z = lhs.z * rhs.z;
            out.w = lhs.w * rhs.w;
        }
        static div(out, lhs, rhs) {
            out.x = lhs.x / rhs.x;
            out.y = lhs.y / rhs.y;
            out.z = lhs.z / rhs.z;
            out.w = lhs.w / rhs.w;
        }
        static addScalar(out, lhs, rhs) {
            out.x = lhs.x + rhs;
            out.y = lhs.y + rhs;
            out.z = lhs.z + rhs;
            out.w = lhs.w + rhs;
        }
        static subScalar(out, lhs, rhs) {
            out.x = lhs.x - rhs;
            out.y = lhs.y - rhs;
            out.z = lhs.z - rhs;
            out.w = lhs.w - rhs;
        }
        static mulScalar(out, lhs, rhs) {
            out.x = lhs.x * rhs;
            out.y = lhs.y * rhs;
            out.z = lhs.z * rhs;
            out.w = lhs.w * rhs;
        }
        static divScalar(out, lhs, rhs) {
            out.x = lhs.x / rhs;
            out.y = lhs.y / rhs;
            out.z = lhs.z / rhs;
            out.w = lhs.w / rhs;
        }
        static equals(lhs, rhs) {
            return lhs.x === rhs.x && lhs.y === rhs.y && lhs.z === rhs.z && lhs.w === rhs.w;
        }
    }
    exports.vec4 = vec4;
});
define("modules/math-ext/mat4", ["require", "exports", "modules/math-ext/vec4"], function (require, exports, vec4_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mat4 = void 0;
    class mat4 {
        constructor(x, y, z, w) {
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
        }
        set(other) {
            this.x.set(other.x);
            this.y.set(other.y);
            this.z.set(other.z);
            this.w.set(other.w);
        }
        row(index) {
            switch (index) {
                case 0:
                    return this.x;
                case 1:
                    return this.y;
                case 2:
                    return this.z;
                case 3:
                    return this.w;
                default:
                    throw new Error('Invalid index');
            }
        }
        col(index) {
            switch (index) {
                case 0:
                    return new vec4_1.vec4(this.x.x, this.y.x, this.z.x, this.w.x);
                case 1:
                    return new vec4_1.vec4(this.x.y, this.y.y, this.z.y, this.w.y);
                case 2:
                    return new vec4_1.vec4(this.x.z, this.y.z, this.z.z, this.w.z);
                case 3:
                    return new vec4_1.vec4(this.x.w, this.y.w, this.z.w, this.w.w);
                default:
                    throw new Error('Invalid index');
            }
        }
        toArray() {
            return [
                this.x.x,
                this.x.y,
                this.x.z,
                this.x.w,
                this.y.x,
                this.y.y,
                this.y.z,
                this.y.w,
                this.z.x,
                this.z.y,
                this.z.z,
                this.z.w,
                this.w.x,
                this.w.y,
                this.w.z,
                this.w.w
            ];
        }
        serialize(view, offset) {
            view.setFloat32(offset + 0, this.x.x, true);
            view.setFloat32(offset + 4, this.x.y, true);
            view.setFloat32(offset + 8, this.x.z, true);
            view.setFloat32(offset + 12, this.x.w, true);
            view.setFloat32(offset + 16, this.y.x, true);
            view.setFloat32(offset + 20, this.y.y, true);
            view.setFloat32(offset + 24, this.y.z, true);
            view.setFloat32(offset + 28, this.y.w, true);
            view.setFloat32(offset + 32, this.z.x, true);
            view.setFloat32(offset + 36, this.z.y, true);
            view.setFloat32(offset + 40, this.z.z, true);
            view.setFloat32(offset + 44, this.z.w, true);
            view.setFloat32(offset + 48, this.w.x, true);
            view.setFloat32(offset + 52, this.w.y, true);
            view.setFloat32(offset + 56, this.w.z, true);
            view.setFloat32(offset + 60, this.w.w, true);
        }
        transpose() {
            const xy = this.x.y;
            const xz = this.x.z;
            const xw = this.x.w;
            const yx = this.y.x;
            const yz = this.y.z;
            const yw = this.y.w;
            const zx = this.z.x;
            const zy = this.z.y;
            const zw = this.z.w;
            const wx = this.w.x;
            const wy = this.w.y;
            const wz = this.w.z;
            this.x.y = yx;
            this.x.z = zx;
            this.x.w = wx;
            this.y.x = xy;
            this.y.z = zy;
            this.y.w = wy;
            this.z.x = xz;
            this.z.y = yz;
            this.z.w = wz;
            this.w.x = xw;
            this.w.y = yw;
            this.w.z = zw;
        }
        get transposed() {
            return new mat4(new vec4_1.vec4(this.x.x, this.y.x, this.z.x, this.w.x), new vec4_1.vec4(this.x.y, this.y.y, this.z.y, this.w.y), new vec4_1.vec4(this.x.z, this.y.z, this.z.z, this.w.z), new vec4_1.vec4(this.x.w, this.y.w, this.z.w, this.w.w));
        }
        static mul(out, ...args) {
            if (out instanceof mat4) {
                if (args.length === 0) {
                    mat4.identity(out);
                    return;
                }
                const first = args[0];
                if (!(first instanceof mat4))
                    throw new Error('mat4.mul: Invalid arguments');
                out.set(first);
                for (let i = 1; i < args.length; i++) {
                    const next = args[i];
                    if (!(next instanceof mat4)) {
                        throw new Error('mat4.mul: Invalid arguments');
                    }
                    this.mulMM(out, out, next);
                }
                return;
            }
            if (out instanceof vec4_1.vec4) {
                if (args.length != 2)
                    throw new Error('mat4.mul: Invalid arguments');
                const lhs = args[0];
                const rhs = args[1];
                if (!(lhs instanceof mat4) || !(rhs instanceof vec4_1.vec4))
                    throw new Error('mat4.mul: Invalid arguments');
                this.mulMV(out, lhs, rhs);
                return;
            }
            throw new Error('mat4.mul: Invalid arguments');
        }
        static mulMV(out, lhs, rhs) {
            const x = lhs.x.x * rhs.x + lhs.x.y * rhs.y + lhs.x.z * rhs.z + lhs.x.w * rhs.w;
            const y = lhs.y.x * rhs.x + lhs.y.y * rhs.y + lhs.y.z * rhs.z + lhs.y.w * rhs.w;
            const z = lhs.z.x * rhs.x + lhs.z.y * rhs.y + lhs.z.z * rhs.z + lhs.z.w * rhs.w;
            const w = lhs.w.x * rhs.x + lhs.w.y * rhs.y + lhs.w.z * rhs.z + lhs.w.w * rhs.w;
            out.x = x;
            out.y = y;
            out.z = z;
            out.w = w;
        }
        static mulMM(out, lhs, rhs) {
            const xx = lhs.x.x * rhs.x.x + lhs.x.y * rhs.y.x + lhs.x.z * rhs.z.x + lhs.x.w * rhs.w.x;
            const xy = lhs.x.x * rhs.x.y + lhs.x.y * rhs.y.y + lhs.x.z * rhs.z.y + lhs.x.w * rhs.w.y;
            const xz = lhs.x.x * rhs.x.z + lhs.x.y * rhs.y.z + lhs.x.z * rhs.z.z + lhs.x.w * rhs.w.z;
            const xw = lhs.x.x * rhs.x.w + lhs.x.y * rhs.y.w + lhs.x.z * rhs.z.w + lhs.x.w * rhs.w.w;
            const yx = lhs.y.x * rhs.x.x + lhs.y.y * rhs.y.x + lhs.y.z * rhs.z.x + lhs.y.w * rhs.w.x;
            const yy = lhs.y.x * rhs.x.y + lhs.y.y * rhs.y.y + lhs.y.z * rhs.z.y + lhs.y.w * rhs.w.y;
            const yz = lhs.y.x * rhs.x.z + lhs.y.y * rhs.y.z + lhs.y.z * rhs.z.z + lhs.y.w * rhs.w.z;
            const yw = lhs.y.x * rhs.x.w + lhs.y.y * rhs.y.w + lhs.y.z * rhs.z.w + lhs.y.w * rhs.w.w;
            const zx = lhs.z.x * rhs.x.x + lhs.z.y * rhs.y.x + lhs.z.z * rhs.z.x + lhs.z.w * rhs.w.x;
            const zy = lhs.z.x * rhs.x.y + lhs.z.y * rhs.y.y + lhs.z.z * rhs.z.y + lhs.z.w * rhs.w.y;
            const zz = lhs.z.x * rhs.x.z + lhs.z.y * rhs.y.z + lhs.z.z * rhs.z.z + lhs.z.w * rhs.w.z;
            const zw = lhs.z.x * rhs.x.w + lhs.z.y * rhs.y.w + lhs.z.z * rhs.z.w + lhs.z.w * rhs.w.w;
            const wx = lhs.w.x * rhs.x.x + lhs.w.y * rhs.y.x + lhs.w.z * rhs.z.x + lhs.w.w * rhs.w.x;
            const wy = lhs.w.x * rhs.x.y + lhs.w.y * rhs.y.y + lhs.w.z * rhs.z.y + lhs.w.w * rhs.w.y;
            const wz = lhs.w.x * rhs.x.z + lhs.w.y * rhs.y.z + lhs.w.z * rhs.z.z + lhs.w.w * rhs.w.z;
            const ww = lhs.w.x * rhs.x.w + lhs.w.y * rhs.y.w + lhs.w.z * rhs.z.w + lhs.w.w * rhs.w.w;
            out.x.x = xx;
            out.x.y = xy;
            out.x.z = xz;
            out.x.w = xw;
            out.y.x = yx;
            out.y.y = yy;
            out.y.z = yz;
            out.y.w = yw;
            out.z.x = zx;
            out.z.y = zy;
            out.z.z = zz;
            out.z.w = zw;
            out.w.x = wx;
            out.w.y = wy;
            out.w.z = wz;
            out.w.w = ww;
        }
        static identity(out) {
            if (!out) {
                return new mat4(new vec4_1.vec4(1, 0, 0, 0), new vec4_1.vec4(0, 1, 0, 0), new vec4_1.vec4(0, 0, 1, 0), new vec4_1.vec4(0, 0, 0, 1));
            }
            out.x.x = 1;
            out.x.y = 0;
            out.x.z = 0;
            out.x.w = 0;
            out.y.x = 0;
            out.y.y = 1;
            out.y.z = 0;
            out.y.w = 0;
            out.z.x = 0;
            out.z.y = 0;
            out.z.z = 1;
            out.z.w = 0;
            out.w.x = 0;
            out.w.y = 0;
            out.w.z = 0;
            out.w.w = 1;
        }
        /**
         * Creates a translation matrix.
         *
         * @param out - The output matrix.
         * @param x - The x-coordinate of the translation.
         * @param y - The y-coordinate of the translation.
         * @param z - The z-coordinate of the translation.
         */
        static translation(out, x, y, z) {
            out.x.x = 1;
            out.x.y = 0;
            out.x.z = 0;
            out.x.w = x;
            out.y.x = 0;
            out.y.y = 1;
            out.y.z = 0;
            out.y.w = y;
            out.z.x = 0;
            out.z.y = 0;
            out.z.z = 1;
            out.z.w = z;
            out.w.x = 0;
            out.w.y = 0;
            out.w.z = 0;
            out.w.w = 1;
        }
        /**
         * Creates a scale matrix.
         *
         * @param out - The output matrix.
         * @param x - The x-coordinate of the scale.
         * @param y - The y-coordinate of the scale.
         * @param z - The z-coordinate of the scale.
         */
        static scale(out, x, y, z) {
            out.x.x = x;
            out.x.y = 0;
            out.x.z = 0;
            out.x.w = 0;
            out.y.x = 0;
            out.y.y = y;
            out.y.z = 0;
            out.y.w = 0;
            out.z.x = 0;
            out.z.y = 0;
            out.z.z = z;
            out.z.w = 0;
            out.w.x = 0;
            out.w.y = 0;
            out.w.z = 0;
            out.w.w = 1;
        }
        /**
         * Creates a rotation matrix around the X axis.
         *
         * @param angle - The angle of rotation in radians.
         */
        static rotationX(out, angle) {
            const s = Math.sin(angle);
            const c = Math.cos(angle);
            out.x.x = 1;
            out.x.y = 0;
            out.x.z = 0;
            out.x.w = 0;
            out.y.x = 0;
            out.y.y = c;
            out.y.z = s;
            out.y.w = 0;
            out.z.x = 0;
            out.z.y = -s;
            out.z.z = c;
            out.z.w = 0;
            out.w.x = 0;
            out.w.y = 0;
            out.w.z = 0;
            out.w.w = 1;
        }
        /**
         * Creates a rotation matrix around the Y axis.
         *
         * @param out - The output matrix.
         * @param angle - The angle of rotation in radians.
         */
        static rotationY(out, angle) {
            const s = Math.sin(angle);
            const c = Math.cos(angle);
            out.x.x = c;
            out.x.y = 0;
            out.x.z = -s;
            out.x.w = 0;
            out.y.x = 0;
            out.y.y = 1;
            out.y.z = 0;
            out.y.w = 0;
            out.z.x = s;
            out.z.y = 0;
            out.z.z = c;
            out.z.w = 0;
            out.w.x = 0;
            out.w.y = 0;
            out.w.z = 0;
            out.w.w = 1;
        }
        /**
         * Creates a rotation matrix around the Z axis.
         *
         * @param out - The output matrix.
         * @param angle - The angle of rotation in radians.
         */
        static rotationZ(out, angle) {
            const s = Math.sin(angle);
            const c = Math.cos(angle);
            out.x.x = c;
            out.x.y = -s;
            out.x.z = 0;
            out.x.w = 0;
            out.y.x = s;
            out.y.y = c;
            out.y.z = 0;
            out.y.w = 0;
            out.z.x = 0;
            out.z.y = 0;
            out.z.z = 1;
            out.z.w = 0;
            out.w.x = 0;
            out.w.y = 0;
            out.w.z = 0;
            out.w.w = 1;
        }
    }
    exports.mat4 = mat4;
});
define("modules/math-ext/utils", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.radians = radians;
    exports.degrees = degrees;
    function radians(degrees) {
        return (degrees * Math.PI) / 180;
    }
    function degrees(radians) {
        return (radians * 180) / Math.PI;
    }
});
define("modules/math-ext/transform", ["require", "exports", "modules/math-ext/mat4", "modules/math-ext/mat3"], function (require, exports, mat4_1, mat3_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.translation = translation;
    exports.scale = scale;
    exports.rotationX = rotationX;
    exports.rotationY = rotationY;
    exports.rotationZ = rotationZ;
    exports.frustum = frustum;
    exports.perspective = perspective;
    exports.ortho = ortho;
    function translation(out, x, y, z) {
        mat4_1.mat4.translation(out, x, y, z);
    }
    function scale(out, x, y, z) {
        if (out instanceof mat3_1.mat3) {
            mat3_1.mat3.scale(out, x, y, z);
        }
        else {
            mat4_1.mat4.scale(out, x, y, z);
        }
    }
    function rotationX(out, angle) {
        if (out instanceof mat3_1.mat3) {
            mat3_1.mat3.rotationX(out, angle);
        }
        else {
            mat4_1.mat4.rotationX(out, angle);
        }
    }
    function rotationY(out, angle) {
        if (out instanceof mat3_1.mat3) {
            mat3_1.mat3.rotationY(out, angle);
        }
        else {
            mat4_1.mat4.rotationY(out, angle);
        }
    }
    function rotationZ(out, angle) {
        if (out instanceof mat3_1.mat3) {
            mat3_1.mat3.rotationZ(out, angle);
        }
        else {
            mat4_1.mat4.rotationZ(out, angle);
        }
    }
    function frustum(out, left, right, top, bottom, near, far) {
        const a = 2.0 * near;
        const w = right - left;
        const h = top - bottom;
        const d = far - near;
        const invW = 1.0 / w;
        const invH = 1.0 / h;
        const invD = 1.0 / d;
        out.x.x = a * invW;
        out.x.y = 0;
        out.x.z = (right + left) * invW;
        out.x.w = 0;
        out.y.x = 0;
        out.y.y = a * invH;
        out.y.z = (top + bottom) * invH;
        out.y.w = 0;
        out.z.x = 0;
        out.z.y = 0;
        out.z.z = (-far - near) * invD;
        out.z.w = -a * far * invD;
        out.w.x = 0;
        out.w.y = 0;
        out.w.z = -1.0;
        out.w.w = 0;
    }
    function perspective(out, fov, aspect, near, far) {
        const yMax = near * Math.tan(fov * 0.5);
        const xMax = yMax * aspect;
        frustum(out, -xMax, xMax, -yMax, yMax, near, far);
    }
    function ortho(out, left, right, top, bottom, near, far) {
        const w = right - left;
        const h = top - bottom;
        const d = far - near;
        out.x.x = 2 / w;
        out.x.y = 0;
        out.x.z = 0;
        out.x.w = -(left + right) / w;
        out.y.x = 0;
        out.y.y = 2 / h;
        out.y.z = 0;
        out.y.w = -(top + bottom) / h;
        out.z.x = 0;
        out.z.y = 0;
        out.z.z = -2 / d;
        out.z.w = (far + near) / d;
        out.w.x = 0;
        out.w.y = 0;
        out.w.z = 0;
        out.w.w = 1;
    }
});
define("modules/math-ext/index", ["require", "exports", "modules/math-ext/vec2", "modules/math-ext/vec3", "modules/math-ext/mat3", "modules/math-ext/vec4", "modules/math-ext/mat4", "modules/math-ext/utils", "modules/math-ext/transform"], function (require, exports, vec2_1, vec3_2, mat3_2, vec4_2, mat4_2, utils_1, Transform) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Transform = void 0;
    __exportStar(vec2_1, exports);
    __exportStar(vec3_2, exports);
    __exportStar(mat3_2, exports);
    __exportStar(vec4_2, exports);
    __exportStar(mat4_2, exports);
    __exportStar(utils_1, exports);
    exports.Transform = Transform;
});
define("modules/ui/utils/parser", ["require", "exports", "modules/ui/types/style"], function (require, exports, style_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StyleParser = void 0;
    class StyleParser {
        constructor(string) {
            this.m_index = 0;
            this.m_string = string;
        }
        get index() {
            return this.m_index;
        }
        get input() {
            return this.m_string;
        }
        get atEnd() {
            return this.m_index >= this.m_string.length;
        }
        get remainder() {
            return this.m_string.substring(this.m_index);
        }
        parseSize() {
            if (this.atEnd)
                return null;
            const match = this.remainder.match(/^\s*(-?\d+(?:\.\d+)?)(px|%|em|rem|vw|vh)\s*/);
            if (!match)
                return null;
            const value = parseFloat(match[1]);
            let unit;
            switch (match[2]) {
                case 'px':
                    unit = style_1.SizeUnit.px;
                    break;
                case '%':
                    unit = style_1.SizeUnit.percent;
                    break;
                case 'em':
                    unit = style_1.SizeUnit.em;
                    break;
                case 'rem':
                    unit = style_1.SizeUnit.rem;
                    break;
                case 'vw':
                    unit = style_1.SizeUnit.vw;
                    break;
                case 'vh':
                    unit = style_1.SizeUnit.vh;
                    break;
                default:
                    return null;
            }
            this.m_index += match[0].length;
            return { value, unit };
        }
        parseWord() {
            if (this.atEnd)
                return null;
            const match = this.remainder.match(/^\s*([\w-]+)\s*/);
            if (!match)
                return null;
            const word = match[1];
            this.m_index += match[0].length;
            return word;
        }
        decodeHexColorRGB(value) {
            const inv15 = 1.0 / 15.0;
            const r = parseInt(value.substring(0, 1), 16) * inv15;
            const g = parseInt(value.substring(1, 2), 16) * inv15;
            const b = parseInt(value.substring(2, 3), 16) * inv15;
            return { r, g, b, a: 1 };
        }
        decodeHexColorRGBA(value) {
            const inv15 = 1.0 / 15.0;
            const r = parseInt(value.substring(0, 1), 16) * inv15;
            const g = parseInt(value.substring(1, 2), 16) * inv15;
            const b = parseInt(value.substring(2, 3), 16) * inv15;
            const a = parseInt(value.substring(3, 4), 16) * inv15;
            return { r, g, b, a };
        }
        decodeHexColorRRGGBB(value) {
            const inv255 = 1.0 / 255.0;
            const r = parseInt(value.substring(0, 2), 16) * inv255;
            const g = parseInt(value.substring(2, 4), 16) * inv255;
            const b = parseInt(value.substring(4, 6), 16) * inv255;
            return { r, g, b, a: 1 };
        }
        decodeHexColorRRGGBBAA(value) {
            const inv255 = 1.0 / 255.0;
            const r = parseInt(value.substring(0, 2), 16) * inv255;
            const g = parseInt(value.substring(2, 4), 16) * inv255;
            const b = parseInt(value.substring(4, 6), 16) * inv255;
            const a = parseInt(value.substring(6, 8), 16) * inv255;
            return { r, g, b, a };
        }
        parseHexColor() {
            const match = this.remainder.match(/^\s*#([0-9a-fA-F]{3,8})\s*/);
            if (!match)
                return null;
            const hex = match[1];
            this.m_index += match[0].length;
            if (hex.length === 3)
                return this.decodeHexColorRGB(hex);
            if (hex.length === 4)
                return this.decodeHexColorRGBA(hex);
            if (hex.length === 6)
                return this.decodeHexColorRRGGBB(hex);
            if (hex.length === 8)
                return this.decodeHexColorRRGGBBAA(hex);
            return null;
        }
        parseRGBColor() {
            if (this.atEnd)
                return null;
            const match = this.remainder.match(/^\s*rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)\s*/);
            if (!match)
                return null;
            const inv255 = 1.0 / 255.0;
            const r = parseInt(match[1]) * inv255;
            const g = parseInt(match[2]) * inv255;
            const b = parseInt(match[3]) * inv255;
            if (r > 1 || g > 1 || b > 1)
                return null;
            return { r, g, b, a: 1 };
        }
        parseRGBAColor() {
            if (this.atEnd)
                return null;
            const match = this.remainder.match(/^\s*rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+(?:.\d+)?)\s*\)\s*/);
            if (!match)
                return null;
            const inv255 = 1.0 / 255.0;
            const r = parseInt(match[1]) * inv255;
            const g = parseInt(match[2]) * inv255;
            const b = parseInt(match[3]) * inv255;
            const a = parseFloat(match[4]);
            if (r > 1 || g > 1 || b > 1 || a > 1)
                return null;
            return { r, g, b, a };
        }
        parseColor() {
            if (this.atEnd)
                return null;
            let color = null;
            color = this.parseHexColor();
            if (color)
                return color;
            color = this.parseRGBColor();
            if (color)
                return color;
            color = this.parseRGBAColor();
            if (color)
                return color;
            return null;
        }
        parsePosition() {
            const word = this.parseWord();
            if (!word)
                return null;
            switch (word) {
                case 'static':
                    return style_1.Position.Static;
                case 'relative':
                    return style_1.Position.Relative;
                case 'absolute':
                    return style_1.Position.Absolute;
                case 'fixed':
                    return style_1.Position.Fixed;
                case 'sticky':
                    return style_1.Position.Sticky;
                default:
            }
            return null;
        }
        parseFlexDirection() {
            const word = this.parseWord();
            if (!word)
                return null;
            switch (word) {
                case 'row':
                    return style_1.FlexDirection.Row;
                case 'column':
                    return style_1.FlexDirection.Column;
                default:
            }
            return null;
        }
        parseJustifyContent() {
            const word = this.parseWord();
            if (!word)
                return null;
            switch (word) {
                case 'flex-start':
                    return style_1.JustifyContent.FlexStart;
                case 'flex-end':
                    return style_1.JustifyContent.FlexEnd;
                case 'center':
                    return style_1.JustifyContent.Center;
                case 'space-between':
                    return style_1.JustifyContent.SpaceBetween;
                case 'space-around':
                    return style_1.JustifyContent.SpaceAround;
                case 'space-evenly':
                    return style_1.JustifyContent.SpaceEvenly;
                default:
            }
            return null;
        }
        parseAlignItems() {
            const word = this.parseWord();
            if (!word)
                return null;
            switch (word) {
                case 'flex-start':
                    return style_1.AlignItems.FlexStart;
                case 'flex-end':
                    return style_1.AlignItems.FlexEnd;
                case 'center':
                    return style_1.AlignItems.Center;
                case 'stretch':
                    return style_1.AlignItems.Stretch;
                case 'baseline':
                    return style_1.AlignItems.Baseline;
                default:
            }
            return null;
        }
        parseFlexWrap() {
            const word = this.parseWord();
            if (!word)
                return null;
            switch (word) {
                case 'nowrap':
                    return style_1.FlexWrap.NoWrap;
                case 'wrap':
                    return style_1.FlexWrap.Wrap;
                case 'wrap-reverse':
                    return style_1.FlexWrap.WrapReverse;
                default:
            }
            return null;
        }
        parseFontStyle() {
            const word = this.parseWord();
            if (!word)
                return null;
            switch (word) {
                case 'normal':
                    return style_1.FontStyle.Normal;
                case 'italic':
                    return style_1.FontStyle.Italic;
                case 'oblique':
                    return style_1.FontStyle.Oblique;
                default:
            }
            return null;
        }
        parseTextAlign() {
            const word = this.parseWord();
            if (!word)
                return null;
            switch (word) {
                case 'left':
                    return style_1.TextAlign.Left;
                case 'center':
                    return style_1.TextAlign.Center;
                case 'right':
                    return style_1.TextAlign.Right;
                case 'justify':
                    return style_1.TextAlign.Justify;
                default:
            }
            return null;
        }
        parseTextDecoration() {
            const word = this.parseWord();
            if (!word)
                return null;
            switch (word) {
                case 'none':
                    return style_1.TextDecoration.None;
                case 'underline':
                    return style_1.TextDecoration.Underline;
                case 'overline':
                    return style_1.TextDecoration.Overline;
                case 'line-through':
                    return style_1.TextDecoration.LineThrough;
                default:
            }
            return null;
        }
        parseWhiteSpace() {
            const word = this.parseWord();
            if (!word)
                return null;
            switch (word) {
                case 'normal':
                    return style_1.WhiteSpace.Normal;
                case 'nowrap':
                    return style_1.WhiteSpace.Nowrap;
                case 'pre':
                    return style_1.WhiteSpace.Pre;
                case 'pre-wrap':
                    return style_1.WhiteSpace.PreWrap;
                case 'pre-line':
                    return style_1.WhiteSpace.PreLine;
                default:
            }
            return null;
        }
        parseWordBreak() {
            const word = this.parseWord();
            if (!word)
                return null;
            switch (word) {
                case 'normal':
                    return style_1.WordBreak.Normal;
                case 'break-all':
                    return style_1.WordBreak.BreakAll;
                case 'break-word':
                    return style_1.WordBreak.BreakWord;
                default:
            }
            return null;
        }
        parseWordWrap() {
            const word = this.parseWord();
            if (!word)
                return null;
            switch (word) {
                case 'normal':
                    return style_1.WordWrap.Normal;
                case 'break-word':
                    return style_1.WordWrap.BreakWord;
                default:
            }
            return null;
        }
        parseOverflow() {
            const word = this.parseWord();
            if (!word)
                return null;
            switch (word) {
                case 'visible':
                    return style_1.Overflow.Visible;
                case 'hidden':
                    return style_1.Overflow.Hidden;
                case 'scroll':
                    return style_1.Overflow.Scroll;
                default:
            }
            return null;
        }
        parseTextOverflow() {
            const word = this.parseWord();
            if (!word)
                return null;
            switch (word) {
                case 'clip':
                    return style_1.TextOverflow.Clip;
                case 'ellipsis':
                    return style_1.TextOverflow.Ellipsis;
                case 'unset':
                    return style_1.TextOverflow.Unset;
                default:
            }
            return null;
        }
        parseBorderStyle() {
            const word = this.parseWord();
            if (!word)
                return null;
            switch (word) {
                case 'none':
                    return style_1.BorderStyle.None;
                case 'hidden':
                    return style_1.BorderStyle.Hidden;
                case 'dotted':
                    return style_1.BorderStyle.Dotted;
                case 'dashed':
                    return style_1.BorderStyle.Dashed;
                case 'solid':
                    return style_1.BorderStyle.Solid;
                case 'double':
                    return style_1.BorderStyle.Double;
                default:
            }
            return null;
        }
        parseBorder(current) {
            const width = this.parseSize();
            if (!width)
                return;
            const style = this.parseBorderStyle();
            if (!style)
                return;
            const color = this.parseColor();
            if (!color)
                return;
            current.width = width;
            current.style = style;
            current.color = color;
        }
        parsePadding(current) {
            const sizes = [];
            for (let i = 0; i < 4; i++) {
                const size = this.parseSize();
                if (!size)
                    break;
                sizes.push(size);
            }
            if (sizes.length === 1) {
                current.left = sizes[0];
                current.right = Object.assign({}, sizes[0]);
                current.top = Object.assign({}, sizes[0]);
                current.bottom = Object.assign({}, sizes[0]);
            }
            else if (sizes.length === 2) {
                current.top = sizes[0];
                current.bottom = Object.assign({}, sizes[0]);
                current.left = sizes[1];
                current.right = Object.assign({}, sizes[1]);
            }
            else if (sizes.length === 3) {
                current.top = sizes[0];
                current.bottom = sizes[2];
                current.left = sizes[1];
                current.right = Object.assign({}, sizes[1]);
            }
            else if (sizes.length === 4) {
                current.top = sizes[0];
                current.right = sizes[1];
                current.bottom = sizes[2];
                current.left = sizes[3];
            }
        }
        parseMargin(current) {
            const sizes = [];
            for (let i = 0; i < 4; i++) {
                const size = this.parseSize();
                if (!size)
                    break;
                sizes.push(size);
            }
            if (sizes.length === 1) {
                current.left = sizes[0];
                current.right = Object.assign({}, sizes[0]);
                current.top = Object.assign({}, sizes[0]);
                current.bottom = Object.assign({}, sizes[0]);
            }
            else if (sizes.length === 2) {
                current.top = sizes[0];
                current.bottom = Object.assign({}, sizes[0]);
                current.left = sizes[1];
                current.right = Object.assign({}, sizes[1]);
            }
            else if (sizes.length === 3) {
                current.top = sizes[0];
                current.bottom = sizes[2];
                current.left = sizes[1];
                current.right = Object.assign({}, sizes[1]);
            }
            else if (sizes.length === 4) {
                current.top = sizes[0];
                current.right = sizes[1];
                current.bottom = sizes[2];
                current.left = sizes[3];
            }
        }
        parseBorderRadius(current) {
            const value = this.parseSize();
            if (!value)
                return;
            current.topLeftRadius = value;
            current.topRightRadius = Object.assign({}, value);
            current.bottomLeftRadius = Object.assign({}, value);
            current.bottomRightRadius = Object.assign({}, value);
        }
        static parseStyleProps(props) {
            const parsedProps = {};
            const ensureBorder = () => {
                if (parsedProps.border)
                    return parsedProps.border;
                parsedProps.border = {
                    width: { value: 0, unit: style_1.SizeUnit.px },
                    style: style_1.BorderStyle.None,
                    color: { r: 0, g: 0, b: 0, a: 1 },
                    topLeftRadius: { value: 0, unit: style_1.SizeUnit.px },
                    topRightRadius: { value: 0, unit: style_1.SizeUnit.px },
                    bottomLeftRadius: { value: 0, unit: style_1.SizeUnit.px },
                    bottomRightRadius: { value: 0, unit: style_1.SizeUnit.px }
                };
                return parsedProps.border;
            };
            const ensurePadding = () => {
                if (parsedProps.padding)
                    return parsedProps.padding;
                parsedProps.padding = {
                    left: { value: 0, unit: style_1.SizeUnit.px },
                    right: { value: 0, unit: style_1.SizeUnit.px },
                    top: { value: 0, unit: style_1.SizeUnit.px },
                    bottom: { value: 0, unit: style_1.SizeUnit.px }
                };
                return parsedProps.padding;
            };
            const ensureMargin = () => {
                if (parsedProps.margin)
                    return parsedProps.margin;
                parsedProps.margin = {
                    left: { value: 0, unit: style_1.SizeUnit.px },
                    right: { value: 0, unit: style_1.SizeUnit.px },
                    top: { value: 0, unit: style_1.SizeUnit.px },
                    bottom: { value: 0, unit: style_1.SizeUnit.px }
                };
                return parsedProps.margin;
            };
            const ensureFlex = () => {
                if (parsedProps.flex)
                    return parsedProps.flex;
                parsedProps.flex = {
                    direction: style_1.FlexDirection.Row,
                    justifyContent: style_1.JustifyContent.FlexStart,
                    alignItems: style_1.AlignItems.FlexStart,
                    wrap: style_1.FlexWrap.NoWrap,
                    grow: 0,
                    shrink: 1,
                    basis: null,
                    gap: { value: 0, unit: style_1.SizeUnit.px }
                };
                return parsedProps.flex;
            };
            for (const key in props) {
                switch (key) {
                    case 'minWidth': {
                        if (props.minWidth.trim() === 'auto') {
                            parsedProps.minWidth = null;
                            break;
                        }
                        const parser = new StyleParser(props.minWidth);
                        const minWidth = parser.parseSize();
                        if (!minWidth || minWidth.value < 0)
                            break;
                        parsedProps.minWidth = minWidth;
                        break;
                    }
                    case 'minHeight': {
                        if (props.minHeight.trim() === 'auto') {
                            parsedProps.minHeight = null;
                            break;
                        }
                        const parser = new StyleParser(props.minHeight);
                        const minHeight = parser.parseSize();
                        if (!minHeight || minHeight.value < 0)
                            break;
                        parsedProps.minHeight = minHeight;
                        break;
                    }
                    case 'maxWidth': {
                        if (props.maxWidth.trim() === 'auto') {
                            parsedProps.maxWidth = null;
                            break;
                        }
                        const parser = new StyleParser(props.maxWidth);
                        const maxWidth = parser.parseSize();
                        if (!maxWidth || maxWidth.value < 0)
                            break;
                        parsedProps.maxWidth = maxWidth;
                        break;
                    }
                    case 'maxHeight': {
                        if (props.maxHeight.trim() === 'auto') {
                            parsedProps.maxHeight = null;
                            break;
                        }
                        const parser = new StyleParser(props.maxHeight);
                        const maxHeight = parser.parseSize();
                        if (!maxHeight || maxHeight.value < 0)
                            break;
                        parsedProps.maxHeight = maxHeight;
                        break;
                    }
                    case 'width': {
                        if (props.width.trim() === 'auto') {
                            parsedProps.width = null;
                            break;
                        }
                        const parser = new StyleParser(props.width);
                        const width = parser.parseSize();
                        if (!width || width.value < 0)
                            break;
                        parsedProps.width = width;
                        break;
                    }
                    case 'height': {
                        if (props.height.trim() === 'auto') {
                            parsedProps.height = null;
                            break;
                        }
                        const parser = new StyleParser(props.height);
                        const height = parser.parseSize();
                        if (!height || height.value < 0)
                            break;
                        parsedProps.height = height;
                        break;
                    }
                    case 'position': {
                        const parser = new StyleParser(props.position);
                        const position = parser.parsePosition();
                        if (position === null)
                            break;
                        parsedProps.position = position;
                        break;
                    }
                    case 'top': {
                        if (props.top.trim() === 'auto') {
                            parsedProps.top = null;
                            break;
                        }
                        const parser = new StyleParser(props.top);
                        const top = parser.parseSize();
                        if (!top)
                            break;
                        parsedProps.top = top;
                        break;
                    }
                    case 'right': {
                        if (props.right.trim() === 'auto') {
                            parsedProps.right = null;
                            break;
                        }
                        const parser = new StyleParser(props.right);
                        const right = parser.parseSize();
                        if (!right)
                            break;
                        parsedProps.right = right;
                        break;
                    }
                    case 'bottom': {
                        if (props.bottom.trim() === 'auto') {
                            parsedProps.bottom = null;
                            break;
                        }
                        const parser = new StyleParser(props.bottom);
                        const bottom = parser.parseSize();
                        if (!bottom)
                            break;
                        parsedProps.bottom = bottom;
                        break;
                    }
                    case 'left': {
                        if (props.left.trim() === 'auto') {
                            parsedProps.left = null;
                            break;
                        }
                        const parser = new StyleParser(props.left);
                        const left = parser.parseSize();
                        if (!left)
                            break;
                        parsedProps.left = left;
                        break;
                    }
                    case 'zIndex': {
                        if (props.zIndex.trim() === 'auto') {
                            parsedProps.zIndex = null;
                            break;
                        }
                        const zIndex = parseFloat(props.zIndex);
                        if (isNaN(zIndex) || zIndex < 0 || zIndex !== Math.floor(zIndex))
                            break;
                        parsedProps.zIndex = zIndex;
                        break;
                    }
                    case 'flexDirection': {
                        const parser = new StyleParser(props.flexDirection);
                        const flexDirection = parser.parseFlexDirection();
                        if (flexDirection === null)
                            break;
                        ensureFlex().direction = flexDirection;
                        break;
                    }
                    case 'justifyContent': {
                        const parser = new StyleParser(props.justifyContent);
                        const justifyContent = parser.parseJustifyContent();
                        if (justifyContent === null)
                            break;
                        ensureFlex().justifyContent = justifyContent;
                        break;
                    }
                    case 'alignItems': {
                        const parser = new StyleParser(props.alignItems);
                        const alignItems = parser.parseAlignItems();
                        if (alignItems === null)
                            break;
                        ensureFlex().alignItems = alignItems;
                        break;
                    }
                    case 'flexWrap': {
                        const parser = new StyleParser(props.flexWrap);
                        const flexWrap = parser.parseFlexWrap();
                        if (flexWrap === null)
                            break;
                        ensureFlex().wrap = flexWrap;
                        break;
                    }
                    case 'flexGrow': {
                        if (props.flexGrow < 0)
                            break;
                        ensureFlex().grow = props.flexGrow;
                        break;
                    }
                    case 'flexShrink': {
                        if (props.flexShrink < 0)
                            break;
                        ensureFlex().shrink = props.flexShrink;
                        break;
                    }
                    case 'flexBasis': {
                        if (props.flexBasis.trim() === 'auto') {
                            ensureFlex().basis = null;
                            break;
                        }
                        const parser = new StyleParser(props.flexBasis);
                        const flexBasis = parser.parseSize();
                        if (!flexBasis)
                            break;
                        ensureFlex().basis = flexBasis;
                        break;
                    }
                    case 'flex': {
                        if (props.flex < 0)
                            break;
                        const flex = ensureFlex();
                        flex.grow = props.flex;
                        flex.shrink = props.flex;
                        flex.basis = { value: 0, unit: style_1.SizeUnit.px };
                        break;
                    }
                    case 'gap': {
                        const parser = new StyleParser(props.gap);
                        const gap = parser.parseSize();
                        if (!gap)
                            break;
                        ensureFlex().gap = gap;
                        break;
                    }
                    case 'lineHeight': {
                        const parser = new StyleParser(props.lineHeight);
                        const lineHeight = parser.parseSize();
                        if (!lineHeight)
                            break;
                        parsedProps.lineHeight = lineHeight;
                        break;
                    }
                    case 'letterSpacing': {
                        const parser = new StyleParser(props.letterSpacing);
                        const letterSpacing = parser.parseSize();
                        if (!letterSpacing)
                            break;
                        parsedProps.letterSpacing = letterSpacing;
                        break;
                    }
                    case 'fontSize': {
                        const parser = new StyleParser(props.fontSize);
                        const fontSize = parser.parseSize();
                        if (!fontSize)
                            break;
                        parsedProps.fontSize = fontSize;
                        break;
                    }
                    case 'fontWeight': {
                        if (props.fontWeight < 0 || props.fontWeight !== Math.floor(props.fontWeight))
                            break;
                        parsedProps.fontWeight = props.fontWeight;
                        break;
                    }
                    case 'fontFamily': {
                        parsedProps.fontFamily = props.fontFamily.trim();
                        break;
                    }
                    case 'fontStyle': {
                        const parser = new StyleParser(props.fontStyle);
                        const fontStyle = parser.parseFontStyle();
                        if (fontStyle === null)
                            break;
                        parsedProps.fontStyle = fontStyle;
                        break;
                    }
                    case 'textAlign': {
                        const parser = new StyleParser(props.textAlign);
                        const textAlign = parser.parseTextAlign();
                        if (textAlign === null)
                            break;
                        parsedProps.textAlign = textAlign;
                        break;
                    }
                    case 'textDecoration': {
                        const parser = new StyleParser(props.textDecoration);
                        const textDecoration = parser.parseTextDecoration();
                        if (textDecoration === null)
                            break;
                        parsedProps.textDecoration = textDecoration;
                        break;
                    }
                    case 'whiteSpace': {
                        const parser = new StyleParser(props.whiteSpace);
                        const whiteSpace = parser.parseWhiteSpace();
                        if (whiteSpace === null)
                            break;
                        parsedProps.whiteSpace = whiteSpace;
                        break;
                    }
                    case 'wordBreak': {
                        const parser = new StyleParser(props.wordBreak);
                        const wordBreak = parser.parseWordBreak();
                        if (wordBreak === null)
                            break;
                        parsedProps.wordBreak = wordBreak;
                        break;
                    }
                    case 'wordWrap': {
                        const parser = new StyleParser(props.wordWrap);
                        const wordWrap = parser.parseWordWrap();
                        if (wordWrap === null)
                            break;
                        parsedProps.wordWrap = wordWrap;
                        break;
                    }
                    case 'overflow': {
                        const parser = new StyleParser(props.overflow);
                        const overflow = parser.parseOverflow();
                        if (overflow === null)
                            break;
                        parsedProps.overflow = overflow;
                        break;
                    }
                    case 'textOverflow': {
                        const parser = new StyleParser(props.textOverflow);
                        const textOverflow = parser.parseTextOverflow();
                        if (textOverflow === null)
                            break;
                        parsedProps.textOverflow = textOverflow;
                        break;
                    }
                    case 'color': {
                        const parser = new StyleParser(props.color);
                        const color = parser.parseColor();
                        if (!color)
                            break;
                        parsedProps.color = color;
                        break;
                    }
                    case 'backgroundColor': {
                        const parser = new StyleParser(props.backgroundColor);
                        const backgroundColor = parser.parseColor();
                        if (!backgroundColor)
                            break;
                        parsedProps.backgroundColor = backgroundColor;
                        break;
                    }
                    case 'border': {
                        const parser = new StyleParser(props.border);
                        parser.parseBorder(ensureBorder());
                        break;
                    }
                    case 'borderWidth': {
                        const parser = new StyleParser(props.borderWidth);
                        const size = parser.parseSize();
                        if (!size)
                            break;
                        const border = ensureBorder();
                        border.width = size;
                        break;
                    }
                    case 'borderColor': {
                        const parser = new StyleParser(props.borderColor);
                        const color = parser.parseColor();
                        if (!color)
                            break;
                        const border = ensureBorder();
                        border.color = color;
                        break;
                    }
                    case 'borderStyle': {
                        const parser = new StyleParser(props.borderStyle);
                        const style = parser.parseBorderStyle();
                        if (!style)
                            break;
                        const border = ensureBorder();
                        border.style = style;
                        break;
                    }
                    case 'borderRadius': {
                        const parser = new StyleParser(props.borderRadius);
                        parser.parseBorderRadius(ensureBorder());
                        break;
                    }
                    case 'borderTopLeftRadius': {
                        const parser = new StyleParser(props.borderTopLeftRadius);
                        const size = parser.parseSize();
                        if (!size)
                            break;
                        const border = ensureBorder();
                        border.topLeftRadius = size;
                        break;
                    }
                    case 'borderTopRightRadius': {
                        const parser = new StyleParser(props.borderTopRightRadius);
                        const size = parser.parseSize();
                        if (!size)
                            break;
                        const border = ensureBorder();
                        border.topRightRadius = size;
                        break;
                    }
                    case 'borderBottomLeftRadius': {
                        const parser = new StyleParser(props.borderBottomLeftRadius);
                        const size = parser.parseSize();
                        if (!size)
                            break;
                        const border = ensureBorder();
                        border.bottomLeftRadius = size;
                        break;
                    }
                    case 'borderBottomRightRadius': {
                        const parser = new StyleParser(props.borderBottomRightRadius);
                        const size = parser.parseSize();
                        if (!size)
                            break;
                        const border = ensureBorder();
                        border.bottomRightRadius = size;
                        break;
                    }
                    case 'padding': {
                        const parser = new StyleParser(props.padding);
                        parser.parsePadding(ensurePadding());
                        break;
                    }
                    case 'paddingLeft': {
                        const parser = new StyleParser(props.paddingLeft);
                        const size = parser.parseSize();
                        if (!size)
                            break;
                        const padding = ensurePadding();
                        padding.left = size;
                        break;
                    }
                    case 'paddingRight': {
                        const parser = new StyleParser(props.paddingRight);
                        const size = parser.parseSize();
                        if (!size)
                            break;
                        const padding = ensurePadding();
                        padding.right = size;
                        break;
                    }
                    case 'paddingTop': {
                        const parser = new StyleParser(props.paddingTop);
                        const size = parser.parseSize();
                        if (!size)
                            break;
                        const padding = ensurePadding();
                        padding.top = size;
                        break;
                    }
                    case 'paddingBottom': {
                        const parser = new StyleParser(props.paddingBottom);
                        const size = parser.parseSize();
                        if (!size)
                            break;
                        const padding = ensurePadding();
                        padding.bottom = size;
                        break;
                    }
                    case 'margin': {
                        const parser = new StyleParser(props.margin);
                        parser.parseMargin(ensureMargin());
                        break;
                    }
                    case 'marginLeft': {
                        const parser = new StyleParser(props.marginLeft);
                        const size = parser.parseSize();
                        if (!size)
                            break;
                        const margin = ensureMargin();
                        margin.left = size;
                        break;
                    }
                    case 'marginRight': {
                        const parser = new StyleParser(props.marginRight);
                        const size = parser.parseSize();
                        if (!size)
                            break;
                        const margin = ensureMargin();
                        margin.right = size;
                        break;
                    }
                    case 'marginTop': {
                        const parser = new StyleParser(props.marginTop);
                        const size = parser.parseSize();
                        if (!size)
                            break;
                        const margin = ensureMargin();
                        margin.top = size;
                        break;
                    }
                    case 'marginBottom': {
                        const parser = new StyleParser(props.marginBottom);
                        const size = parser.parseSize();
                        if (!size)
                            break;
                        const margin = ensureMargin();
                        margin.bottom = size;
                        break;
                    }
                }
            }
            return parsedProps;
        }
    }
    exports.StyleParser = StyleParser;
});
define("modules/ui/types/ui-node", ["require", "exports", "modules/ui/utils/parser"], function (require, exports, parser_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UINode = void 0;
    /** @internal */
    class UINode {
        /** @internal */
        constructor(node, parent, props) {
            this.m_node = node;
            this.m_parent = parent;
            this.m_children = [];
            this.m_props = props !== null && props !== void 0 ? props : {};
            this.m_style = props && props.style ? parser_1.StyleParser.parseStyleProps(props.style) : {};
        }
        /** @internal */
        get node() {
            return this.m_node;
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
        addChild(child) {
            this.m_children.push(child);
        }
        /** @internal */
        debugPrint(indentation = 0) {
            console.log(`${' '.repeat(indentation)}${this.constructor.name}`);
            console.log(`${' '.repeat(indentation + 2)}style:`);
            for (const key in this.m_style) {
                const propValue = JSON.stringify(this.m_style[key]);
                console.log(`${' '.repeat(indentation + 4)}${key}: ${propValue}`);
            }
            if (this.m_children.length === 0)
                return;
            console.log(`${' '.repeat(indentation + 2)}children:`);
            for (const child of this.m_children) {
                child.debugPrint(indentation + 4);
            }
        }
    }
    exports.UINode = UINode;
});
define("modules/ui/types/text-node", ["require", "exports", "modules/ui/types/ui-node"], function (require, exports, ui_node_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextNode = void 0;
    /** @internal */
    class TextNode extends ui_node_1.UINode {
        /** @internal */
        constructor(node, parent) {
            super(node, parent);
            this.m_text = node.props.value;
        }
        /** @internal */
        get text() {
            return this.m_text;
        }
    }
    exports.TextNode = TextNode;
});
define("modules/ui/types/box-node", ["require", "exports", "modules/ui/types/ui-node"], function (require, exports, ui_node_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BoxNode = void 0;
    /** @internal */
    class BoxNode extends ui_node_2.UINode {
        /** @internal */
        constructor(node, parent, props) {
            super(node, parent, props);
        }
    }
    exports.BoxNode = BoxNode;
});
define("modules/ui/types/vertex", ["require", "exports", "modules/math-ext/index"], function (require, exports, math_ext_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Vertex = void 0;
    class Vertex {
        constructor(position, color, uv, clipRectIndex) {
            this.position = position;
            this.color = color;
            this.uv = uv || new math_ext_1.vec2(0, 0);
            this.clipRectIndex = clipRectIndex || -1;
        }
    }
    exports.Vertex = Vertex;
});
define("modules/ui/types/geometry", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GeometryType = void 0;
    var GeometryType;
    (function (GeometryType) {
        GeometryType[GeometryType["Box"] = 0] = "Box";
        GeometryType[GeometryType["Text"] = 1] = "Text";
    })(GeometryType || (exports.GeometryType = GeometryType = {}));
});
define("modules/ui/types/uniforms", ["require", "exports", "modules/math-ext/index"], function (require, exports, math_ext_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Uniforms = void 0;
    class Uniforms {
        constructor(uniforms, ds) {
            const format = uniforms.getBuffer().getFormat();
            this.m_uniformObject = uniforms;
            this.m_uniformData = new ArrayBuffer(format.getUniformBlockSize());
            this.m_uniformDataView = new DataView(this.m_uniformData);
            this.m_ds = ds;
            this.m_projection = math_ext_2.mat4.identity();
            this.m_view = math_ext_2.mat4.identity();
            this.m_model = math_ext_2.mat4.identity();
            this.m_mvp = math_ext_2.mat4.identity();
            this.m_mvpNeedsUpdate = true;
            this.m_fontPixelRange = 0.0;
            this.m_isFont = false;
            this.m_fontPixelRangeNeedsUpdate = true;
            this.m_isFontNeedsUpdate = true;
        }
        get uniformObject() {
            return this.m_uniformObject;
        }
        get descriptorSet() {
            return this.m_ds;
        }
        set projection(projection) {
            this.m_projection = projection;
            this.m_mvpNeedsUpdate = true;
        }
        set view(view) {
            this.m_view = view;
            this.m_mvpNeedsUpdate = true;
        }
        set model(model) {
            this.m_model = model;
            this.m_mvpNeedsUpdate = true;
        }
        set fontPixelRange(fontPixelRange) {
            this.m_fontPixelRange = fontPixelRange;
            this.m_fontPixelRangeNeedsUpdate = true;
        }
        set isText(isText) {
            this.m_isFont = isText;
            this.m_isFontNeedsUpdate = true;
        }
        update(cb) {
            let uniformsNeedUpdate = this.m_mvpNeedsUpdate || this.m_fontPixelRangeNeedsUpdate || this.m_isFontNeedsUpdate;
            if (this.m_mvpNeedsUpdate) {
                math_ext_2.mat4.mul(this.m_mvp, this.m_projection, this.m_view, this.m_model);
                this.m_mvp.serialize(this.m_uniformDataView, 0);
                this.m_mvpNeedsUpdate = false;
            }
            if (this.m_fontPixelRangeNeedsUpdate) {
                this.m_uniformDataView.setFloat32(64, this.m_fontPixelRange, true);
                this.m_fontPixelRangeNeedsUpdate = false;
            }
            if (this.m_isFontNeedsUpdate) {
                this.m_uniformDataView.setInt32(68, this.m_isFont ? 1 : 0, true);
                this.m_isFontNeedsUpdate = false;
            }
            if (uniformsNeedUpdate) {
                this.m_uniformObject.write(this.m_uniformData);
                this.m_uniformObject.getBuffer().submitUpdates(cb);
            }
        }
    }
    exports.Uniforms = Uniforms;
});
define("modules/ui/types/push-constants", ["require", "exports", "modules/math-ext/index", "vulkan"], function (require, exports, math_ext_3, vulkan_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PushConstants = void 0;
    class PushConstants {
        constructor(format) {
            this.m_data = new ArrayBuffer(format.getUniformBlockSize());
            this.m_dataView = new DataView(this.m_data);
            console.log(format.getUniformBlockSize());
            this.m_clipEnabled = false;
            this.m_clipRect = new math_ext_3.vec4(0, 0, 0, 0);
            this.m_clipRectRadii = new math_ext_3.vec4(0, 0, 0, 0);
            this.m_didChange = true;
        }
        set clipEnabled(clipEnabled) {
            if (this.m_clipEnabled === clipEnabled)
                return;
            this.m_clipEnabled = clipEnabled;
            this.m_didChange = true;
        }
        set clipRect(clipRect) {
            if (math_ext_3.vec4.equals(this.m_clipRect, clipRect))
                return;
            this.m_clipRect = clipRect;
            this.m_didChange = true;
        }
        set clipRectRadii(clipRectRadii) {
            if (math_ext_3.vec4.equals(this.m_clipRectRadii, clipRectRadii))
                return;
            this.m_clipRectRadii = clipRectRadii;
            this.m_didChange = true;
        }
        update(cb) {
            if (!this.m_didChange)
                return;
            this.m_dataView.setInt32(0, this.m_clipEnabled ? 1 : 0, true);
            this.m_dataView.setFloat32(16, this.m_clipRect.x, true);
            this.m_dataView.setFloat32(20, this.m_clipRect.y, true);
            this.m_dataView.setFloat32(24, this.m_clipRect.z, true);
            this.m_dataView.setFloat32(28, this.m_clipRect.w, true);
            this.m_dataView.setFloat32(32, this.m_clipRectRadii.x, true);
            this.m_dataView.setFloat32(36, this.m_clipRectRadii.y, true);
            this.m_dataView.setFloat32(40, this.m_clipRectRadii.z, true);
            this.m_dataView.setFloat32(44, this.m_clipRectRadii.w, true);
            cb.updatePushConstants(0, this.m_data, vulkan_4.VkShaderStageFlags.VK_SHADER_STAGE_ALL);
        }
    }
    exports.PushConstants = PushConstants;
});
define("modules/ui/utils/draw-call", ["require", "exports", "modules/math-ext/index", "modules/ui/types/uniforms", "vulkan"], function (require, exports, math_ext_4, uniforms_1, vulkan_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DrawCall = void 0;
    class DrawCall {
        constructor(vertices, uniforms, ds, vertexCount, vertexSize) {
            this.m_vertices = vertices;
            this.m_vertexData = new ArrayBuffer(vertexCount * vertexSize);
            this.m_vertexDataView = new DataView(this.m_vertexData);
            this.m_vertexDataDirty = true;
            this.m_uniforms = new uniforms_1.Uniforms(uniforms, ds);
            this.m_ds = ds;
            this.m_vertexCount = vertexCount;
            this.m_vertexSize = vertexSize;
            this.m_usedVertices = 0;
        }
        get vertices() {
            return this.m_vertices;
        }
        get uniforms() {
            return this.m_uniforms;
        }
        set descriptorSet(ds) {
            this.m_ds = ds;
        }
        get descriptorSet() {
            return this.m_ds;
        }
        updateVertexData() {
            if (!this.m_vertices.beginUpdate())
                throw new Error('Failed to update vertex data');
            this.m_vertices.write(this.m_vertexData, 0, this.m_vertexCount);
            this.m_vertices.endUpdate();
        }
        getVertex(index) {
            if (index >= this.m_vertexCount)
                throw new RangeError(`Index out of bounds: ${index} >= ${this.m_vertexCount}`);
            const offset = index * this.m_vertexSize;
            return {
                position: new math_ext_4.vec4(this.m_vertexDataView.getFloat32(offset, true), this.m_vertexDataView.getFloat32(offset + 4, true), this.m_vertexDataView.getFloat32(offset + 8, true), this.m_vertexDataView.getFloat32(offset + 12, true)),
                color: new math_ext_4.vec4(this.m_vertexDataView.getFloat32(offset + 16, true), this.m_vertexDataView.getFloat32(offset + 20, true), this.m_vertexDataView.getFloat32(offset + 24, true), this.m_vertexDataView.getFloat32(offset + 28, true))
            };
        }
        setVertex(index, vertex) {
            if (index >= this.m_vertexCount)
                throw new RangeError(`Index out of bounds: ${index} >= ${this.m_vertexCount}`);
            const offset = index * this.m_vertexSize;
            this.m_vertexDataView.setFloat32(offset, vertex.position.x, true);
            this.m_vertexDataView.setFloat32(offset + 4, vertex.position.y, true);
            this.m_vertexDataView.setFloat32(offset + 8, vertex.position.z, true);
            this.m_vertexDataView.setFloat32(offset + 12, vertex.position.w, true);
            this.m_vertexDataView.setFloat32(offset + 16, vertex.color.x, true);
            this.m_vertexDataView.setFloat32(offset + 20, vertex.color.y, true);
            this.m_vertexDataView.setFloat32(offset + 24, vertex.color.z, true);
            this.m_vertexDataView.setFloat32(offset + 28, vertex.color.w, true);
            this.m_vertexDataView.setFloat32(offset + 32, vertex.uv.x, true);
            this.m_vertexDataView.setFloat32(offset + 36, vertex.uv.y, true);
            this.m_vertexDataView.setInt32(offset + 40, vertex.clipRectIndex, true);
            this.m_vertexDataDirty = true;
        }
        addVertex(vertex) {
            this.setVertex(this.m_usedVertices, vertex);
            this.m_usedVertices++;
        }
        beforeRenderPass(cb) {
            if (this.m_vertexDataDirty) {
                this.updateVertexData();
                this.m_vertexDataDirty = false;
            }
            this.m_uniforms.update(cb);
        }
        resetUsedVertices() {
            this.m_usedVertices = 0;
        }
        draw(cb) {
            cb.bindVertexBuffer(this.m_vertices.getBuffer(), 0);
            cb.bindDescriptorSet(this.m_uniforms.descriptorSet, vulkan_5.VkPipelineBindPoint.VK_PIPELINE_BIND_POINT_GRAPHICS);
            cb.drawSubset(this.m_usedVertices, 0, 1, 0);
        }
    }
    exports.DrawCall = DrawCall;
});
define("modules/ui/utils/text-draw", ["require", "exports", "modules/math-ext/index", "modules/ui/types/index"], function (require, exports, math_ext_5, types_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextDraw = void 0;
    class TextDraw {
        constructor(drawCall, fontAtlas, fontName) {
            this.m_drawCall = drawCall;
            this.m_fontAtlas = fontAtlas;
            this.m_fontName = fontName;
            this.m_cursorPos = new math_ext_5.vec2(0, 0);
            this.m_glyphs = new Map();
            this.m_kerning = new Map();
            for (const glyph of this.m_fontAtlas.glyphs) {
                this.m_glyphs.set(glyph.codepoint, glyph);
            }
            for (const kerning of this.m_fontAtlas.kerning) {
                let kerningMap;
                if (!this.m_kerning.has(kerning.codepoint1)) {
                    kerningMap = new Map();
                    this.m_kerning.set(kerning.codepoint1, kerningMap);
                }
                else {
                    kerningMap = this.m_kerning.get(kerning.codepoint1);
                }
                kerningMap.set(kerning.codepoint2, kerning.kerning);
            }
            this.m_drawCall.uniforms.isText = true;
            this.m_drawCall.uniforms.fontPixelRange = this.m_fontAtlas.pixelRange;
        }
        get fontName() {
            return this.m_fontName;
        }
        set drawCall(drawCall) {
            this.m_drawCall = drawCall;
            this.m_drawCall.uniforms.isText = true;
            this.m_drawCall.uniforms.fontPixelRange = this.m_fontAtlas.pixelRange;
        }
        get drawCall() {
            return this.m_drawCall;
        }
        resetUsedVertices() {
            this.m_drawCall.resetUsedVertices();
        }
        drawText(x, y, geometry, clipRectIndex) {
            this.m_cursorPos.x = x;
            this.m_cursorPos.y = y;
            for (const vertex of geometry.vertices) {
                const pos = new math_ext_5.vec4(vertex.position.x + x, vertex.position.y + y, vertex.position.z, vertex.position.w);
                this.m_drawCall.addVertex(new types_4.Vertex(pos, vertex.color, vertex.uv, clipRectIndex));
            }
        }
    }
    exports.TextDraw = TextDraw;
});
define("modules/ui/utils/clip-rect-mgr", ["require", "exports", "render", "modules/ui/types/index", "vulkan"], function (require, exports, Render, types_5, vulkan_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ClipRectManager = void 0;
    const CLIP_RECT_SIZE = 4 * 8;
    class ClipRectManager {
        constructor(rootWidth, rootHeight) {
            this.m_clipRects = [
                {
                    x: 0,
                    y: 0,
                    width: rootWidth,
                    height: rootHeight,
                    top: 0,
                    left: 0,
                    right: rootWidth,
                    bottom: rootHeight,
                    topLeftRadius: 0,
                    topRightRadius: 0,
                    bottomLeftRadius: 0,
                    bottomRightRadius: 0,
                    paddingLeft: 0,
                    paddingRight: 0,
                    paddingTop: 0,
                    paddingBottom: 0,
                    marginLeft: 0,
                    marginRight: 0,
                    marginTop: 0,
                    marginBottom: 0,
                    depth: 0
                }
            ];
            this.m_clipRectIndexStack = [0];
            this.m_rootWidth = rootWidth;
            this.m_rootHeight = rootHeight;
        }
        get currentClip() {
            const index = this.m_clipRectIndexStack[this.m_clipRectIndexStack.length - 1];
            return {
                rect: this.m_clipRects[index],
                index
            };
        }
        setRootSize(size) {
            this.m_rootWidth = size.width;
            this.m_rootHeight = size.height;
        }
        reset() {
            this.m_clipRects = [
                {
                    x: 0,
                    y: 0,
                    width: this.m_rootWidth,
                    height: this.m_rootHeight,
                    top: 0,
                    left: 0,
                    right: this.m_rootWidth,
                    bottom: this.m_rootHeight,
                    topLeftRadius: 0,
                    topRightRadius: 0,
                    bottomLeftRadius: 0,
                    bottomRightRadius: 0,
                    paddingLeft: 0,
                    paddingRight: 0,
                    paddingTop: 0,
                    paddingBottom: 0,
                    marginLeft: 0,
                    marginRight: 0,
                    marginTop: 0,
                    marginBottom: 0,
                    depth: 0
                }
            ];
            this.m_clipRectIndexStack = [0];
        }
        beginElement(element) {
            if (element.style.overflow === types_5.Overflow.Visible) {
                // No clip rect to apply
                return;
            }
            this.m_clipRectIndexStack.push(this.m_clipRects.length);
            this.m_clipRects.push(element.style.clientRect);
        }
        endElement(element) {
            if (element.style.overflow === types_5.Overflow.Visible) {
                // No clip rect applied
                return;
            }
            if (this.m_clipRectIndexStack.length === 0)
                return;
            this.m_clipRectIndexStack.pop();
        }
        generateBuffer(logicalDevice) {
            const buffer = new Render.Buffer(logicalDevice);
            let status;
            const size = Math.max(CLIP_RECT_SIZE * this.m_clipRects.length, 64);
            status = buffer.init(size, vulkan_6.VkBufferUsageFlags.VK_BUFFER_USAGE_STORAGE_BUFFER_BIT, vulkan_6.VkSharingMode.VK_SHARING_MODE_EXCLUSIVE, vulkan_6.VkMemoryPropertyFlags.VK_MEMORY_PROPERTY_DEVICE_LOCAL_BIT |
                vulkan_6.VkMemoryPropertyFlags.VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT);
            if (!status) {
                throw new Error('Failed to initialize clip rect buffer');
            }
            const data = new ArrayBuffer(size);
            const dataView = new DataView(data);
            for (let i = 0; i < this.m_clipRects.length; i++) {
                const clipRect = this.m_clipRects[i];
                const offset = i * CLIP_RECT_SIZE;
                dataView.setFloat32(offset + 0, clipRect.left, true);
                dataView.setFloat32(offset + 4, clipRect.top, true);
                dataView.setFloat32(offset + 8, clipRect.right, true);
                dataView.setFloat32(offset + 12, clipRect.bottom, true);
                dataView.setFloat32(offset + 16, clipRect.topLeftRadius, true);
                dataView.setFloat32(offset + 20, clipRect.topRightRadius, true);
                dataView.setFloat32(offset + 24, clipRect.bottomLeftRadius, true);
                dataView.setFloat32(offset + 28, clipRect.bottomRightRadius, true);
            }
            if (!buffer.map()) {
                buffer.shutdown();
                buffer.destroy();
                throw new Error('Failed to map clip rect buffer');
            }
            if (!buffer.write(data, 0, data.byteLength)) {
                buffer.shutdown();
                buffer.destroy();
                throw new Error('Failed to write clip rect buffer');
            }
            if (!buffer.flush(0, data.byteLength)) {
                buffer.shutdown();
                buffer.destroy();
                throw new Error('Failed to flush clip rect buffer');
            }
            buffer.unmap();
            return buffer;
        }
    }
    exports.ClipRectManager = ClipRectManager;
});
define("modules/ui/utils/font-mgr", ["require", "exports", "msdf", "modules/ui/types/index", "modules/math-ext/index"], function (require, exports, msdf_1, types_6, math_ext_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FontManager = exports.FontFamily = void 0;
    class FontFamily {
        constructor(options) {
            var _a, _b;
            this.m_atlas = null;
            this.m_name = options.name;
            this.m_filePath = options.filePath;
            this.m_sdfFactors = [Math.max((_a = options.sdfFactorMin) !== null && _a !== void 0 ? _a : 0.0, 0.0), Math.min((_b = options.sdfFactorMax) !== null && _b !== void 0 ? _b : 1.0, 1.0)];
            this.m_codepoints = options.codepoints
                ? options.codepoints.map(c => (typeof c === 'string' ? c.charCodeAt(0) : c))
                : [];
            this.m_glyphs = new Map();
            this.m_kerning = new Map();
        }
        get isLoaded() {
            return this.m_atlas !== null;
        }
        get atlas() {
            return this.m_atlas;
        }
        get name() {
            return this.m_name;
        }
        get filePath() {
            return this.m_filePath;
        }
        get sdfFactorMin() {
            return this.m_sdfFactors[0];
        }
        get sdfFactorMax() {
            return this.m_sdfFactors[1];
        }
        get pixelRange() {
            var _a, _b;
            return (_b = (_a = this.m_atlas) === null || _a === void 0 ? void 0 : _a.pixelRange) !== null && _b !== void 0 ? _b : 0.0;
        }
        init(device, cmdPool) {
            if (this.m_atlas !== null)
                return;
            if (this.m_codepoints.length > 0) {
                this.m_atlas = (0, msdf_1.loadFontWithCharset)(this.m_filePath, this.m_codepoints, device, cmdPool);
            }
            else {
                this.m_atlas = (0, msdf_1.loadFont)(this.m_filePath, device, cmdPool);
            }
            for (const glyph of this.m_atlas.glyphs) {
                this.m_glyphs.set(glyph.codepoint, glyph);
            }
            for (const kerning of this.m_atlas.kerning) {
                let kerningMap;
                if (!this.m_kerning.has(kerning.codepoint1)) {
                    kerningMap = new Map();
                    this.m_kerning.set(kerning.codepoint1, kerningMap);
                }
                else {
                    kerningMap = this.m_kerning.get(kerning.codepoint1);
                }
                kerningMap.set(kerning.codepoint2, kerning.kerning);
            }
        }
        shutdown() {
            if (this.m_atlas === null)
                return;
            this.m_atlas = null;
        }
        supports(textProps) {
            // todo: might some fonts not support text properties?
            return true;
        }
        renderSingleGlyph(cursor, geometry, codepoint, nextCodepoint, properties) {
            if (!this.m_atlas)
                return;
            const glyph = this.m_glyphs.get(codepoint);
            if (!glyph)
                return;
            const wFrac = glyph.u1 - glyph.u0;
            const hFrac = glyph.v1 - glyph.v0;
            const fontHeight = this.m_atlas.ascender - this.m_atlas.descender;
            const invFontScale = 1.0 / fontHeight;
            let advance = glyph.advance * this.m_atlas.emSize * invFontScale * properties.fontSize;
            if (nextCodepoint !== null) {
                const kerningMap = this.m_kerning.get(codepoint);
                if (kerningMap) {
                    const kerning = kerningMap.get(nextCodepoint);
                    if (kerning) {
                        advance += kerning * this.m_atlas.emSize * invFontScale * properties.fontSize;
                    }
                }
            }
            if (wFrac === 0 || hFrac === 0) {
                cursor.x += advance;
                return;
            }
            let width = glyph.width * this.m_atlas.emSize;
            let height = glyph.height * this.m_atlas.emSize;
            let x = glyph.bearingX * this.m_atlas.emSize;
            let y = -glyph.bearingY * this.m_atlas.emSize + this.m_atlas.ascender + this.m_atlas.descender;
            width *= invFontScale * properties.fontSize;
            height *= invFontScale * properties.fontSize;
            x *= invFontScale * properties.fontSize;
            y *= invFontScale * properties.fontSize;
            x += cursor.x;
            y += cursor.y;
            const p0 = new math_ext_6.vec4(x, y, 0.1, 0.0);
            const p1 = new math_ext_6.vec4(x + width, y, 0.1, 0.0);
            const p2 = new math_ext_6.vec4(x + width, y + height, 0.1, 0.0);
            const p3 = new math_ext_6.vec4(x, y + height, 0.1, 0.0);
            const uv0 = new math_ext_6.vec2(glyph.u0, glyph.v1);
            const uv1 = new math_ext_6.vec2(glyph.u1, glyph.v1);
            const uv2 = new math_ext_6.vec2(glyph.u1, glyph.v0);
            const uv3 = new math_ext_6.vec2(glyph.u0, glyph.v0);
            if (x + width > geometry.width)
                geometry.width = x + width;
            if (y + height > geometry.height)
                geometry.height = y + height;
            const color = properties.color;
            geometry.vertices.push(new types_6.Vertex(p0, new math_ext_6.vec4(color.r, color.g, color.b, color.a), uv0));
            geometry.vertices.push(new types_6.Vertex(p1, new math_ext_6.vec4(color.r, color.g, color.b, color.a), uv1));
            geometry.vertices.push(new types_6.Vertex(p2, new math_ext_6.vec4(color.r, color.g, color.b, color.a), uv2));
            geometry.vertices.push(new types_6.Vertex(p0, new math_ext_6.vec4(color.r, color.g, color.b, color.a), uv0));
            geometry.vertices.push(new types_6.Vertex(p2, new math_ext_6.vec4(color.r, color.g, color.b, color.a), uv2));
            geometry.vertices.push(new types_6.Vertex(p3, new math_ext_6.vec4(color.r, color.g, color.b, color.a), uv3));
            cursor.x += advance;
        }
        createGlyphGeometry(codepoint, properties) {
            const geometry = {
                type: types_6.GeometryType.Text,
                text: String.fromCharCode(codepoint),
                textProperties: properties,
                width: 0,
                height: 0,
                offsetPosition: new math_ext_6.vec4(),
                vertices: []
            };
            this.renderSingleGlyph(new math_ext_6.vec2(0, 0), geometry, codepoint, null, properties);
            return geometry;
        }
        createTextGeometry(text, properties) {
            const geometry = {
                type: types_6.GeometryType.Text,
                text,
                textProperties: properties,
                width: 0,
                height: 0,
                offsetPosition: new math_ext_6.vec4(),
                vertices: []
            };
            const cursor = new math_ext_6.vec2(0, 0);
            for (let i = 0; i < text.length; i++) {
                const codepoint = text.charCodeAt(i);
                const nextCodepoint = i < text.length - 1 ? text.charCodeAt(i + 1) : null;
                this.renderSingleGlyph(cursor, geometry, codepoint, nextCodepoint, properties);
            }
            return geometry;
        }
    }
    exports.FontFamily = FontFamily;
    class FontManager {
        constructor() {
            this.m_fontFamilies = new Map();
            this.m_defaultFont = null;
        }
        init(device, cmdPool) {
            for (const families of this.m_fontFamilies.values()) {
                for (const family of families) {
                    console.log(`Initializing font family: ${family.name}`);
                    family.init(device, cmdPool);
                }
            }
        }
        shutdown() {
            for (const families of this.m_fontFamilies.values()) {
                for (const family of families) {
                    console.log(`Shutting down font family: ${family.name}`);
                    family.shutdown();
                }
            }
        }
        addFontFamily(fontFamily, isDefault = false) {
            let families = this.m_fontFamilies.get(fontFamily.name);
            if (!families) {
                families = [];
                this.m_fontFamilies.set(fontFamily.name, families);
            }
            const family = new FontFamily(fontFamily);
            families.push(family);
            if (isDefault)
                this.m_defaultFont = family;
            return family;
        }
        findFontFamily(textProps) {
            const families = this.m_fontFamilies.get(textProps.fontFamily);
            if (!families)
                return this.m_defaultFont;
            for (const family of families) {
                if (family.supports(textProps))
                    return family;
            }
            return this.m_defaultFont;
        }
        static extractTextProperties(style, maxWidth, maxHeight) {
            const properties = {
                fontSize: style.computedFontSize,
                fontFamily: style.fontFamily,
                fontWeight: style.fontWeight,
                fontStyle: style.fontStyle,
                textAlign: style.textAlign,
                maxWidth: maxWidth,
                maxHeight: maxHeight,
                lineHeight: style.resolveSize(style.lineHeight, types_6.Direction.Vertical),
                color: style.color
            };
            return properties;
        }
    }
    exports.FontManager = FontManager;
});
define("modules/ui/utils/render-context", ["require", "exports", "render", "math", "vulkan", "modules/components/vulkan/logic", "modules/ui/utils/draw-call", "modules/ui/utils/text-draw", "modules/ui/utils/clip-rect-mgr"], function (require, exports, Render, math_1, vulkan_7, logic_5, draw_call_1, text_draw_1, clip_rect_mgr_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RenderContext = void 0;
    class RenderContext {
        constructor(window) {
            const size = window.getSize();
            this.m_window = window;
            this.m_instance = null;
            this.m_surface = null;
            this.m_physicalDevice = null;
            this.m_logicalDevice = null;
            this.m_shaderCompiler = null;
            this.m_swapChainSupport = null;
            this.m_swapChain = null;
            this.m_renderPass = null;
            this.m_frameManager = null;
            this.m_graphicsPipeline = null;
            this.m_vboFactory = null;
            this.m_uboFactory = null;
            this.m_dsFactory = null;
            this.m_vertexFormat = null;
            this.m_uniformFormat = null;
            this.m_defaultTexture = null;
            this.m_windowSize = { width: size.x, height: size.y };
            this.m_resizeListener = null;
            this.m_currentFrame = null;
            this.m_clipRectManager = new clip_rect_mgr_1.ClipRectManager(size.x, size.y);
            this.m_currentClipRectBuffer = null;
            this.m_renderPassStarted = false;
            this.m_drawCalls = [];
        }
        get renderContext() {
            if (!this.m_instance) {
                throw new Error('RenderContext.renderContext used before RenderContext.init()');
            }
            return {
                instance: this.m_instance,
                surface: this.m_surface,
                physicalDevice: this.m_physicalDevice,
                logicalDevice: this.m_logicalDevice,
                shaderCompiler: this.m_shaderCompiler,
                swapChainSupport: this.m_swapChainSupport,
                swapChain: this.m_swapChain,
                renderPass: this.m_renderPass,
                frameManager: this.m_frameManager,
                graphicsPipeline: this.m_graphicsPipeline,
                vertexFormat: this.m_vertexFormat,
                uniformFormat: this.m_uniformFormat,
                vboFactory: this.m_vboFactory,
                uboFactory: this.m_uboFactory,
                dsFactory: this.m_dsFactory,
                windowSize: this.m_windowSize,
                defaultTexture: this.m_defaultTexture
            };
        }
        get currentFrame() {
            if (!this.m_currentFrame)
                throw new Error('RenderContext.currentFrame used before RenderContext.begin()');
            return this.m_currentFrame;
        }
        get commandBuffer() {
            if (!this.m_currentFrame)
                throw new Error('RenderContext.commandBuffer used before RenderContext.begin()');
            return this.m_currentFrame.getCommandBuffer();
        }
        get isInitialized() {
            return this.m_instance !== null;
        }
        get clipRects() {
            return this.m_clipRectManager;
        }
        init() {
            this.m_instance = new Render.Instance();
            this.m_window.addNestedLogger(this.m_instance);
            this.m_instance.enableValidation();
            if (!this.m_instance.initialize()) {
                this.shutdown();
                throw new Error('Failed to initialize Vulkan instance');
            }
            this.m_surface = new Render.Surface(this.m_instance, this.m_window);
            if (!this.m_surface.init()) {
                this.shutdown();
                throw new Error('Failed to initialize Vulkan surface');
            }
            const physicalDevice = (0, logic_5.defaultChoosePhysicalDevice)(this.m_instance, this.m_surface);
            if (!physicalDevice) {
                this.shutdown();
                throw new Error('Failed to find suitable physical device');
            }
            this.m_physicalDevice = new Render.PhysicalDevice(physicalDevice);
            this.m_logicalDevice = new Render.LogicalDevice(this.m_physicalDevice);
            this.m_logicalDevice.enableExtension('VK_KHR_swapchain');
            if (!this.m_logicalDevice.init(true, false, false, this.m_surface)) {
                this.shutdown();
                throw new Error('Failed to initialize Vulkan logical device');
            }
            this.m_swapChainSupport = new Render.SwapChainSupport();
            if (!this.m_physicalDevice.getSurfaceSwapChainSupport(this.m_surface, this.m_swapChainSupport)) {
                this.shutdown();
                throw new Error('Failed to get swap chain support');
            }
            this.m_swapChain = new Render.SwapChain();
            const swapChainResult = this.m_swapChain.init(this.m_surface, this.m_logicalDevice, this.m_swapChainSupport, vulkan_7.VkFormat.VK_FORMAT_B8G8R8A8_SRGB, vulkan_7.VkColorSpaceKHR.VK_COLOR_SPACE_SRGB_NONLINEAR_KHR, vulkan_7.VkPresentModeKHR.VK_PRESENT_MODE_FIFO_KHR, 3, vulkan_7.VkImageUsageFlags.VK_IMAGE_USAGE_COLOR_ATTACHMENT_BIT, vulkan_7.VkCompositeAlphaFlagsKHR.VK_COMPOSITE_ALPHA_OPAQUE_BIT_KHR, null);
            if (!swapChainResult) {
                this.shutdown();
                throw new Error('Failed to initialize swap chain');
            }
            if (!this.m_swapChain.isValid()) {
                this.shutdown();
                throw new Error('Swap chain is invalid');
            }
            this.m_resizeListener = this.m_window.onResize((width, height) => {
                this.onResize(width, height);
            });
            this.m_renderPass = new Render.RenderPass(this.m_swapChain);
            if (!this.m_renderPass.init()) {
                this.shutdown();
                throw new Error('Failed to initialize render pass');
            }
            this.m_frameManager = new Render.FrameManager(this.m_swapChain, this.m_renderPass);
            this.m_instance.addNestedLogger(this.m_frameManager);
            if (!this.m_frameManager.init()) {
                this.shutdown();
                throw new Error('Failed to initialize frame manager');
            }
            this.m_shaderCompiler = new Render.ShaderCompiler(this.m_logicalDevice);
            this.m_instance.addNestedLogger(this.m_shaderCompiler);
            if (!this.m_shaderCompiler.init()) {
                this.shutdown();
                throw new Error('Failed to initialize shader compiler');
            }
            this.m_graphicsPipeline = new Render.GraphicsPipeline(this.m_shaderCompiler, this.m_logicalDevice, this.m_swapChain, this.m_renderPass);
            this.m_instance.addNestedLogger(this.m_graphicsPipeline);
            this.m_vertexFormat = new Render.DataFormat();
            this.m_vertexFormat.addAttr(Render.DataType.Vec4f, 0, 1); // position
            this.m_vertexFormat.addAttr(Render.DataType.Vec4f, 16, 1); // color
            this.m_vertexFormat.addAttr(Render.DataType.Vec2f, 32, 1); // uv
            this.m_vertexFormat.addAttr(Render.DataType.Int, 40, 1); // clipRectIndex
            this.m_uniformFormat = new Render.DataFormat();
            this.m_uniformFormat.addAttr(Render.DataType.Mat4f, 0, 1); // mvp
            this.m_uniformFormat.addAttr(Render.DataType.Float, 64, 1); // fontPixelRange
            this.m_uniformFormat.addAttr(Render.DataType.Int, 68, 1); // isFont
            this.m_graphicsPipeline.setVertexFormat(this.m_vertexFormat);
            this.m_graphicsPipeline.addUniformBlock(0, this.m_uniformFormat, vulkan_7.VkShaderStageFlags.VK_SHADER_STAGE_VERTEX_BIT | vulkan_7.VkShaderStageFlags.VK_SHADER_STAGE_FRAGMENT_BIT);
            this.m_graphicsPipeline.addStorageBuffer(1, vulkan_7.VkShaderStageFlags.VK_SHADER_STAGE_FRAGMENT_BIT);
            this.m_graphicsPipeline.addSampler(2, vulkan_7.VkShaderStageFlags.VK_SHADER_STAGE_FRAGMENT_BIT);
            this.m_graphicsPipeline.addDynamicState(vulkan_7.VkDynamicState.VK_DYNAMIC_STATE_VIEWPORT);
            this.m_graphicsPipeline.addDynamicState(vulkan_7.VkDynamicState.VK_DYNAMIC_STATE_SCISSOR);
            this.m_graphicsPipeline.setColorBlendEnabled(true);
            this.m_graphicsPipeline.setColorBlendOp(Render.BlendOp.Add);
            this.m_graphicsPipeline.setAlphaBlendOp(Render.BlendOp.Add);
            this.m_graphicsPipeline.setSrcColorBlendFactor(Render.BlendFactor.SrcAlpha);
            this.m_graphicsPipeline.setDstColorBlendFactor(Render.BlendFactor.OneMinusSrcAlpha);
            this.m_graphicsPipeline.setSrcAlphaBlendFactor(Render.BlendFactor.One);
            this.m_graphicsPipeline.setDstAlphaBlendFactor(Render.BlendFactor.OneMinusSrcAlpha);
            this.m_graphicsPipeline.setVertexShader(`
            #version 450

            layout(std140, binding = 0) uniform Data {
                mat4 mvp;
                float fontPixelRange;
                int isFont;
            };

            layout(location = 0) in vec4 position;
            layout(location = 1) in vec4 color;
            layout(location = 2) in vec2 uv;
            layout(location = 3) in int clipRectIndex;

            layout(location = 0) out vec4 v_color;
            layout(location = 1) out vec2 v_uv;
            layout(location = 2) flat out int v_clipRectIndex;
            layout(location = 3) out vec2 v_pos;

            void main() {
                gl_Position = mvp * vec4(position.x, position.y, position.z, 1.0);
                v_color = color;
                v_uv = uv;
                v_clipRectIndex = clipRectIndex;
                v_pos = position.xy;
            }
        `);
            this.m_graphicsPipeline.setFragmentShader(`
            #version 450

            struct ClippingInfo {
                float left;
                float top;
                float right;
                float bottom;
                float topLeftRadius;
                float topRightRadius;
                float bottomLeftRadius;
                float bottomRightRadius;
            };

            layout(std140, binding = 0) uniform Data {
                mat4 mvp;
                float fontPixelRange;
                int isFont;
            };

            layout(std140, binding = 1) buffer ClipRectBuffer {
                ClippingInfo clipRects[];
            };

            layout(binding = 2) uniform sampler2D fontAtlas;

            layout(location = 0) in vec4 v_color;
            layout(location = 1) in vec2 v_uv;
            layout(location = 2) flat in int v_clipRectIndex;
            layout(location = 3) in vec2 v_pos;

            layout(location = 0) out vec4 outColor;

            float screenPxRange() {
                vec2 unitRange = vec2(fontPixelRange) / vec2(textureSize(fontAtlas, 0));
                vec2 screenTexSize = vec2(1.0) / fwidth(v_uv);
                return max(0.5 * dot(unitRange, screenTexSize), 1.0);
            }

            float median(float r, float g, float b) {
                return max(min(r, g), min(max(r, g), b));
            }

            void main() {
                if (v_clipRectIndex != -1) {
                    ClippingInfo clip = clipRects[v_clipRectIndex];
                    if (v_pos.x < clip.left) discard;
                    if (v_pos.x > clip.right) discard;
                    if (v_pos.y < clip.top) discard;
                    if (v_pos.y > clip.bottom) discard;

                    float bl = clip.bottomLeftRadius;

                    // Check which corner we're potentially in
                    bool inTopLeft = v_pos.x < clip.left + clip.topLeftRadius && v_pos.y < clip.top + clip.topLeftRadius;
                    bool inTopRight = v_pos.x > clip.right - clip.topRightRadius && v_pos.y < clip.top + clip.topRightRadius;
                    bool inBottomRight = v_pos.x > clip.right - clip.bottomRightRadius && v_pos.y > clip.bottom - clip.bottomRightRadius;
                    bool inBottomLeft = v_pos.x < clip.left + clip.bottomLeftRadius && v_pos.y > clip.bottom - clip.bottomLeftRadius;
                    
                    // Only test corners that have non-zero radius and we're actually in
                    if (inTopLeft && clip.topLeftRadius > 0.0) {
                        vec2 center = vec2(clip.left + clip.topLeftRadius, clip.top + clip.topLeftRadius);
                        vec2 diff = v_pos - center;
                        if (dot(diff, diff) > clip.topLeftRadius * clip.topLeftRadius) discard;
                    } else if (inTopRight && clip.topRightRadius > 0.0) {
                        vec2 center = vec2(clip.right - clip.topRightRadius, clip.top + clip.topRightRadius);
                        vec2 diff = v_pos - center;
                        if (dot(diff, diff) > clip.topRightRadius * clip.topRightRadius) discard;
                    } else if (inBottomRight && clip.bottomRightRadius > 0.0) {
                        vec2 center = vec2(clip.right - clip.bottomRightRadius, clip.bottom - clip.bottomRightRadius);
                        vec2 diff = v_pos - center;
                        if (dot(diff, diff) > clip.bottomRightRadius * clip.bottomRightRadius) discard;
                    } else if (inBottomLeft && clip.bottomLeftRadius > 0.0) {
                        vec2 center = vec2(clip.left + clip.bottomLeftRadius, clip.bottom - clip.bottomLeftRadius);
                        vec2 diff = v_pos - center;
                        if (dot(diff, diff) > clip.bottomLeftRadius * clip.bottomLeftRadius) discard;
                    }
                }

                if (isFont == 1) {
                    vec4 msd = texture(fontAtlas, v_uv);
                    float sd = median(msd.r, msd.g, msd.b);
                    float screenPxDistance = screenPxRange() * (sd - 0.25);
                    float opacity = clamp(screenPxDistance + 0.5, 0.0, 1.0);
                    outColor = mix(vec4(0.0), v_color, opacity);
                } else {
                    outColor = v_color;
                }
            }
        `);
            if (!this.m_graphicsPipeline.init()) {
                this.shutdown();
                throw new Error('Failed to initialize graphics pipeline');
            }
            this.m_vboFactory = new Render.VertexBufferFactory(this.m_logicalDevice, 8096);
            this.m_uboFactory = new Render.UniformObjectFactory(this.m_logicalDevice, 1024);
            this.m_dsFactory = new Render.DescriptorFactory(this.m_logicalDevice, 256);
            this.m_defaultTexture = new Render.Texture(this.m_logicalDevice);
            const textureResult = this.m_defaultTexture.init(1, 1, vulkan_7.VkFormat.VK_FORMAT_R8G8B8A8_SRGB, vulkan_7.VkImageType.VK_IMAGE_TYPE_2D, 1, 1, 1, vulkan_7.VkImageUsageFlags.VK_IMAGE_USAGE_SAMPLED_BIT, vulkan_7.VkImageLayout.VK_IMAGE_LAYOUT_UNDEFINED);
            if (!textureResult) {
                this.shutdown();
                throw new Error('Failed to initialize default texture');
            }
            if (!this.m_defaultTexture.initStagingBuffer()) {
                this.shutdown();
                throw new Error('Failed to initialize default texture staging buffer');
            }
            if (!this.m_defaultTexture.initSampler(vulkan_7.VkFilter.VK_FILTER_LINEAR, vulkan_7.VkFilter.VK_FILTER_LINEAR)) {
                this.shutdown();
                throw new Error('Failed to initialize default texture sampler');
            }
            const cb = this.m_frameManager.getCommandPool().createBuffer(true);
            this.m_defaultTexture.setLayout(cb, vulkan_7.VkImageLayout.VK_IMAGE_LAYOUT_SHADER_READ_ONLY_OPTIMAL);
            if (!cb.begin(vulkan_7.VkCommandBufferUsageFlags.VK_COMMAND_BUFFER_USAGE_ONE_TIME_SUBMIT_BIT)) {
                this.shutdown();
                throw new Error('Failed to begin command buffer for updating default texture');
            }
            const data = new ArrayBuffer(4);
            const view = new Uint8Array(data);
            view[0] = 255;
            view[1] = 255;
            view[2] = 255;
            view[3] = 255;
            this.m_defaultTexture.getStagingBuffer().write(data, 0, 4);
            this.m_defaultTexture.setLayout(cb, vulkan_7.VkImageLayout.VK_IMAGE_LAYOUT_TRANSFER_DST_OPTIMAL);
            this.m_defaultTexture.flushPixels(cb);
            this.m_defaultTexture.setLayout(cb, vulkan_7.VkImageLayout.VK_IMAGE_LAYOUT_SHADER_READ_ONLY_OPTIMAL);
            cb.end();
            this.m_logicalDevice.getGraphicsQueue().submit(cb, null, [], [], vulkan_7.VkPipelineStageFlags.VK_PIPELINE_STAGE_NONE);
            this.m_logicalDevice.getGraphicsQueue().waitForIdle();
            this.m_defaultTexture.shutdownStagingBuffer();
        }
        shutdown() {
            if (this.m_resizeListener) {
                this.m_window.offResize(this.m_resizeListener);
                this.m_resizeListener = null;
            }
            if (this.m_logicalDevice) {
                this.m_logicalDevice.getGraphicsQueue().waitForIdle();
                this.m_logicalDevice.waitForIdle();
            }
            this.m_drawCalls.forEach(dc => {
                dc.vertices.free();
                dc.uniforms.uniformObject.free();
                dc.uniforms.descriptorSet.free();
            });
            if (this.m_currentClipRectBuffer) {
                this.m_currentClipRectBuffer.destroy();
            }
            if (this.m_defaultTexture)
                this.m_defaultTexture.destroy();
            if (this.m_dsFactory)
                this.m_dsFactory.destroy();
            if (this.m_uboFactory)
                this.m_uboFactory.destroy();
            if (this.m_vboFactory)
                this.m_vboFactory.destroy();
            if (this.m_graphicsPipeline) {
                this.m_instance.removeNestedLogger(this.m_graphicsPipeline);
                this.m_graphicsPipeline.destroy();
            }
            if (this.m_uniformFormat)
                this.m_uniformFormat.destroy();
            if (this.m_vertexFormat)
                this.m_vertexFormat.destroy();
            if (this.m_shaderCompiler) {
                this.m_instance.removeNestedLogger(this.m_shaderCompiler);
                this.m_shaderCompiler.destroy();
            }
            if (this.m_frameManager) {
                this.m_instance.removeNestedLogger(this.m_frameManager);
                this.m_frameManager.destroy();
            }
            if (this.m_renderPass)
                this.m_renderPass.destroy();
            if (this.m_swapChain)
                this.m_swapChain.destroy();
            if (this.m_swapChainSupport)
                this.m_swapChainSupport.destroy();
            if (this.m_logicalDevice)
                this.m_logicalDevice.destroy();
            if (this.m_physicalDevice)
                this.m_physicalDevice.destroy();
            if (this.m_surface)
                this.m_surface.destroy();
            if (this.m_instance) {
                this.m_window.removeNestedLogger(this.m_instance);
                this.m_instance.destroy();
            }
            this.m_instance = null;
            this.m_surface = null;
            this.m_physicalDevice = null;
            this.m_logicalDevice = null;
            this.m_shaderCompiler = null;
            this.m_swapChainSupport = null;
            this.m_swapChain = null;
            this.m_renderPass = null;
            this.m_frameManager = null;
            this.m_graphicsPipeline = null;
            this.m_vboFactory = null;
            this.m_uboFactory = null;
            this.m_dsFactory = null;
            this.m_vertexFormat = null;
            this.m_uniformFormat = null;
            this.m_defaultTexture = null;
            this.m_currentFrame = null;
            this.m_renderPassStarted = false;
            this.m_drawCalls = [];
            this.m_currentClipRectBuffer = null;
        }
        onResize(width, height) {
            this.m_windowSize = { width, height };
            if (!this.m_swapChain || !this.m_frameManager || !this.m_logicalDevice)
                return;
            this.m_logicalDevice.waitForIdle();
            if (!this.m_swapChain.recreate()) {
                this.shutdown();
                throw new Error('Failed to recreate swap chain after window resized');
            }
            this.m_frameManager.shutdown();
            if (!this.m_frameManager.init()) {
                this.shutdown();
                throw new Error('Failed to recreate frame manager after window resized');
            }
            this.m_clipRectManager.setRootSize({ width, height });
        }
        allocateDrawCall(vertexCount) {
            const { vboFactory, uboFactory, dsFactory, vertexFormat, uniformFormat, graphicsPipeline, defaultTexture } = this.renderContext;
            const vertices = vboFactory.allocate(vertexFormat, vertexCount);
            const uniforms = uboFactory.allocate(uniformFormat);
            const ds = dsFactory.allocate(graphicsPipeline);
            ds.addUniformObject(uniforms, 0);
            // ds.addStorageBuffer(clipRectBuffer, 1);
            ds.addTexture(defaultTexture, 2);
            // ds.update();
            const call = new draw_call_1.DrawCall(vertices, uniforms, ds, vertexCount, vertexFormat.getSize());
            this.m_drawCalls.push(call);
            return call;
        }
        allocateTextDraw(vertexCount, fontFamily) {
            if (!fontFamily.isLoaded)
                throw new Error('FontFamily.atlas is not loaded');
            const { vboFactory, uboFactory, dsFactory, vertexFormat, uniformFormat, graphicsPipeline } = this.renderContext;
            const vertices = vboFactory.allocate(vertexFormat, vertexCount);
            const uniforms = uboFactory.allocate(uniformFormat);
            const ds = dsFactory.allocate(graphicsPipeline);
            ds.addUniformObject(uniforms, 0);
            // ds.addStorageBuffer(clipRectBuffer, 1);
            ds.addTexture(fontFamily.atlas.texture, 2);
            // ds.update();
            const call = new draw_call_1.DrawCall(vertices, uniforms, ds, vertexCount, vertexFormat.getSize());
            this.m_drawCalls.push(call);
            return new text_draw_1.TextDraw(call, fontFamily.atlas, fontFamily.name);
        }
        freeDrawCall(drawCall) {
            drawCall.vertices.free();
            drawCall.uniforms.uniformObject.free();
            drawCall.uniforms.descriptorSet.free();
            this.m_drawCalls = this.m_drawCalls.filter(dc => dc !== drawCall);
        }
        begin() {
            const { frameManager } = this.renderContext;
            if (this.m_currentFrame)
                throw new Error('RenderContext.begin() called without RenderContext.end()');
            this.m_currentFrame = frameManager.getFrame();
            if (!this.m_currentFrame.begin()) {
                console.error('Failed to begin frame');
                frameManager.releaseFrame(this.m_currentFrame);
                this.m_currentFrame = null;
                return false;
            }
            return true;
        }
        end() {
            const { frameManager } = this.renderContext;
            if (!this.m_currentFrame)
                throw new Error('RenderContext.end() called without RenderContext.begin()');
            this.m_currentFrame.end();
            frameManager.releaseFrame(this.m_currentFrame);
            this.m_currentFrame = null;
        }
        beginRenderPass() {
            if (!this.m_currentFrame) {
                throw new Error('RenderContext.beginRenderPass() called without RenderContext.begin()');
            }
            if (this.m_renderPassStarted) {
                throw new Error('RenderContext.beginRenderPass() called without RenderContext.endRenderPass()');
            }
            const { logicalDevice, graphicsPipeline, windowSize } = this.renderContext;
            const cb = this.m_currentFrame.getCommandBuffer();
            if (this.m_currentClipRectBuffer) {
                this.m_logicalDevice.waitForIdle();
                this.m_currentClipRectBuffer.shutdown();
                this.m_currentClipRectBuffer.destroy();
                this.m_currentClipRectBuffer = null;
            }
            this.m_currentClipRectBuffer = this.m_clipRectManager.generateBuffer(logicalDevice);
            this.m_drawCalls.forEach(dc => {
                const descriptorSet = dc.descriptorSet;
                descriptorSet.addStorageBuffer(this.m_currentClipRectBuffer, 1);
                descriptorSet.update();
                dc.beforeRenderPass(cb);
            });
            cb.beginRenderPass(graphicsPipeline, this.m_currentFrame.getFramebuffer());
            cb.bindPipeline(graphicsPipeline, vulkan_7.VkPipelineBindPoint.VK_PIPELINE_BIND_POINT_GRAPHICS);
            this.m_currentFrame.setClearColorF(0, new math_1.vec4f(0.05, 0.05, 0.05, 1));
            this.m_currentFrame.setClearDepthStencil(1, 1.0, 0);
            cb.setViewport(0, windowSize.height, windowSize.width, -windowSize.height, 0, 1);
            cb.setScissor(0, 0, windowSize.width, windowSize.height);
            this.m_drawCalls.forEach(dc => dc.draw(cb));
            this.m_renderPassStarted = true;
        }
        endRenderPass() {
            if (!this.m_currentFrame) {
                throw new Error('RenderContext.endRenderPass() called without RenderContext.beginRenderPass()');
            }
            if (!this.m_renderPassStarted) {
                throw new Error('RenderContext.endRenderPass() called without RenderContext.beginRenderPass()');
            }
            this.m_currentFrame.getCommandBuffer().endRenderPass();
            this.m_renderPassStarted = false;
        }
    }
    exports.RenderContext = RenderContext;
});
define("modules/ui/utils/index", ["require", "exports", "modules/ui/utils/parser", "modules/ui/utils/render-context", "modules/ui/utils/draw-call", "modules/ui/utils/text-draw", "modules/ui/utils/font-mgr", "modules/ui/types/index", "modules/ui/utils/parser"], function (require, exports, parser_2, render_context_1, draw_call_2, text_draw_2, font_mgr_1, types_7, parser_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DEFAULT_FONT_SIZE = void 0;
    exports.defaultStyle = defaultStyle;
    exports.mergeStyle = mergeStyle;
    exports.getCompleteStyle = getCompleteStyle;
    exports.px = px;
    exports.percent = percent;
    exports.em = em;
    exports.rem = rem;
    exports.vw = vw;
    exports.vh = vh;
    exports.rgb = rgb;
    exports.rgba = rgba;
    exports.parseColor = parseColor;
    __exportStar(parser_2, exports);
    __exportStar(render_context_1, exports);
    __exportStar(draw_call_2, exports);
    __exportStar(text_draw_2, exports);
    __exportStar(font_mgr_1, exports);
    exports.DEFAULT_FONT_SIZE = 16;
    function defaultStyle() {
        return {
            minWidth: 'auto',
            minHeight: 'auto',
            maxWidth: 'auto',
            maxHeight: 'auto',
            width: 'auto',
            height: 'auto',
            position: 'static',
            top: 'auto',
            right: 'auto',
            bottom: 'auto',
            left: 'auto',
            zIndex: 'auto',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            flexWrap: 'nowrap',
            flexGrow: 0,
            flexShrink: 1,
            flexBasis: 'auto',
            gap: '0px',
            lineHeight: '1rem',
            letterSpacing: '0px',
            fontSize: `${exports.DEFAULT_FONT_SIZE}px`,
            fontWeight: 400,
            fontFamily: 'default',
            fontStyle: 'normal',
            textAlign: 'left',
            textDecoration: 'none',
            whiteSpace: 'normal',
            wordBreak: 'normal',
            wordWrap: 'normal',
            overflow: 'visible',
            textOverflow: 'clip',
            color: 'rgba(0, 0, 0, 1)',
            backgroundColor: 'rgba(0, 0, 0, 0)',
            borderWidth: '0px',
            borderColor: 'rgba(0, 0, 0, 1)',
            borderStyle: 'none',
            borderTopLeftRadius: '0px',
            borderTopRightRadius: '0px',
            borderBottomLeftRadius: '0px',
            borderBottomRightRadius: '0px',
            paddingLeft: '0px',
            paddingRight: '0px',
            paddingTop: '0px',
            paddingBottom: '0px',
            marginLeft: '0px',
            marginRight: '0px',
            marginTop: '0px',
            marginBottom: '0px'
        };
    }
    const immutableDefaultStyle = Object.freeze(defaultStyle());
    const parsedDefaultStyle = Object.freeze(parser_3.StyleParser.parseStyleProps(immutableDefaultStyle));
    const cascadingStyleProps = new Set([
        'lineHeight',
        'letterSpacing',
        'fontSize',
        'fontWeight',
        'fontFamily',
        'fontStyle',
        'textDecoration',
        'whiteSpace',
        'wordBreak',
        'wordWrap',
        'textOverflow',
        'color'
    ]);
    function mergeStyle(parent, child) {
        const result = {};
        for (const key in parent) {
            if (cascadingStyleProps.has(key)) {
                result[key] = parent[key];
            }
        }
        for (const key in child) {
            result[key] = child[key];
        }
        return result;
    }
    function getCompleteStyle(parentStyle, childStyle) {
        let result;
        if (childStyle) {
            if (parentStyle) {
                result = mergeStyle(parsedDefaultStyle, mergeStyle(parentStyle, childStyle));
            }
            else
                result = mergeStyle(parsedDefaultStyle, childStyle);
        }
        else if (parentStyle) {
            result = mergeStyle(parsedDefaultStyle, parentStyle);
        }
        else
            return parsedDefaultStyle;
        for (const key in parsedDefaultStyle) {
            if (!(key in result)) {
                result[key] = parsedDefaultStyle[key];
            }
        }
        return result;
    }
    function px(value) {
        return { unit: types_7.SizeUnit.px, value };
    }
    function percent(value) {
        return { unit: types_7.SizeUnit.percent, value };
    }
    function em(value) {
        return { unit: types_7.SizeUnit.em, value };
    }
    function rem(value) {
        return { unit: types_7.SizeUnit.rem, value };
    }
    function vw(value) {
        return { unit: types_7.SizeUnit.vw, value };
    }
    function vh(value) {
        return { unit: types_7.SizeUnit.vh, value };
    }
    function rgb(r, g, b) {
        return { r, g, b, a: 1 };
    }
    function rgba(r, g, b, a) {
        return { r, g, b, a };
    }
    function parseColor(value) {
        const parser = new parser_3.StyleParser(value);
        const color = parser.parseColor();
        if (!color)
            throw new Error(`Invalid color: ${value}`);
        return color;
    }
});
define("modules/ui/renderer/style", ["require", "exports", "yoga", "modules/is-changed", "modules/ui/types/style", "modules/ui/types/index", "modules/ui/utils/index"], function (require, exports, Yoga, is_changed_2, style_2, types_8, utils_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Style = void 0;
    class Style {
        constructor(yogaNode, styleData, parent, root, window) {
            this.m_yogaNode = yogaNode;
            this.m_styleData = styleData;
            this.m_parent = parent;
            this.m_root = root;
            this.m_window = window;
            this.m_clientRect = {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                top: 0,
                bottom: 0,
                right: 0,
                left: 0,
                topLeftRadius: 0,
                topRightRadius: 0,
                bottomLeftRadius: 0,
                bottomRightRadius: 0,
                paddingLeft: 0,
                paddingRight: 0,
                paddingTop: 0,
                paddingBottom: 0,
                marginLeft: 0,
                marginRight: 0,
                marginTop: 0,
                marginBottom: 0,
                depth: 0
            };
            this.configureYogaNode();
        }
        get clientRect() {
            return this.m_clientRect;
        }
        get parent() {
            return this.m_parent;
        }
        get root() {
            return this.m_root;
        }
        get window() {
            return this.m_window;
        }
        set minWidth(value) {
            if (!(0, is_changed_2.isChanged)(value, this.m_styleData.minWidth))
                return;
            this.m_styleData.minWidth = value;
            if (value) {
                if (value.unit === style_2.SizeUnit.percent) {
                    Yoga.YGNodeStyleSetMinWidthPercent(this.m_yogaNode, value.value);
                }
                else {
                    Yoga.YGNodeStyleSetMinWidth(this.m_yogaNode, this.resolveSize(value, types_8.Direction.Horizontal));
                }
            }
            else {
                Yoga.YGNodeStyleSetWidthAuto(this.m_yogaNode);
            }
        }
        get minWidth() {
            return this.m_styleData.minWidth;
        }
        set minHeight(value) {
            if (!(0, is_changed_2.isChanged)(value, this.m_styleData.minHeight))
                return;
            this.m_styleData.minHeight = value;
            if (value) {
                if (value.unit === style_2.SizeUnit.percent) {
                    Yoga.YGNodeStyleSetMinHeightPercent(this.m_yogaNode, value.value);
                }
                else {
                    Yoga.YGNodeStyleSetMinHeight(this.m_yogaNode, this.resolveSize(value, types_8.Direction.Vertical));
                }
            }
            else {
                Yoga.YGNodeStyleSetHeightAuto(this.m_yogaNode);
            }
        }
        get minHeight() {
            return this.m_styleData.minHeight;
        }
        set maxWidth(value) {
            if (!(0, is_changed_2.isChanged)(value, this.m_styleData.maxWidth))
                return;
            this.m_styleData.maxWidth = value;
            if (value) {
                if (value.unit === style_2.SizeUnit.percent) {
                    Yoga.YGNodeStyleSetMaxWidthPercent(this.m_yogaNode, value.value);
                }
                else {
                    Yoga.YGNodeStyleSetMaxWidth(this.m_yogaNode, this.resolveSize(value, types_8.Direction.Horizontal));
                }
            }
            else {
                Yoga.YGNodeStyleSetWidthAuto(this.m_yogaNode);
            }
        }
        get maxWidth() {
            return this.m_styleData.maxWidth;
        }
        set maxHeight(value) {
            if (!(0, is_changed_2.isChanged)(value, this.m_styleData.maxHeight))
                return;
            this.m_styleData.maxHeight = value;
            if (value) {
                if (value.unit === style_2.SizeUnit.percent) {
                    Yoga.YGNodeStyleSetMaxHeightPercent(this.m_yogaNode, value.value);
                }
                else {
                    Yoga.YGNodeStyleSetMaxHeight(this.m_yogaNode, this.resolveSize(value, types_8.Direction.Vertical));
                }
            }
            else {
                Yoga.YGNodeStyleSetHeightAuto(this.m_yogaNode);
            }
        }
        get maxHeight() {
            return this.m_styleData.maxHeight;
        }
        set width(value) {
            if (!(0, is_changed_2.isChanged)(value, this.m_styleData.width))
                return;
            this.m_styleData.width = value;
            if (value) {
                if (value.unit === style_2.SizeUnit.percent) {
                    Yoga.YGNodeStyleSetWidthPercent(this.m_yogaNode, value.value);
                }
                else {
                    Yoga.YGNodeStyleSetWidth(this.m_yogaNode, this.resolveSize(value, types_8.Direction.Horizontal));
                }
            }
            else {
                Yoga.YGNodeStyleSetWidthAuto(this.m_yogaNode);
            }
        }
        get width() {
            return this.m_styleData.width;
        }
        set height(value) {
            if (!(0, is_changed_2.isChanged)(value, this.m_styleData.height))
                return;
            this.m_styleData.height = value;
            if (value) {
                if (value.unit === style_2.SizeUnit.percent) {
                    Yoga.YGNodeStyleSetHeightPercent(this.m_yogaNode, value.value);
                }
                else {
                    Yoga.YGNodeStyleSetHeight(this.m_yogaNode, this.resolveSize(value, types_8.Direction.Vertical));
                }
            }
            else {
                Yoga.YGNodeStyleSetHeightAuto(this.m_yogaNode);
            }
        }
        get height() {
            return this.m_styleData.height;
        }
        set position(value) {
            if (value === this.m_styleData.position)
                return;
            this.m_styleData.position = value;
            switch (this.m_styleData.position) {
                case style_2.Position.Static:
                    Yoga.YGNodeStyleSetPositionType(this.m_yogaNode, Yoga.YGPositionType.YGPositionTypeStatic);
                    break;
                case style_2.Position.Relative:
                    Yoga.YGNodeStyleSetPositionType(this.m_yogaNode, Yoga.YGPositionType.YGPositionTypeRelative);
                    break;
                case style_2.Position.Absolute:
                    Yoga.YGNodeStyleSetPositionType(this.m_yogaNode, Yoga.YGPositionType.YGPositionTypeAbsolute);
                    break;
                case style_2.Position.Fixed:
                    // todo: What's different?
                    Yoga.YGNodeStyleSetPositionType(this.m_yogaNode, Yoga.YGPositionType.YGPositionTypeAbsolute);
                    break;
                case style_2.Position.Sticky:
                    // todo: What's different?
                    Yoga.YGNodeStyleSetPositionType(this.m_yogaNode, Yoga.YGPositionType.YGPositionTypeAbsolute);
                    break;
            }
        }
        get position() {
            return this.m_styleData.position;
        }
        set top(value) {
            if (!(0, is_changed_2.isChanged)(value, this.m_styleData.top))
                return;
            this.m_styleData.top = value;
            if (value) {
                if (value.unit === style_2.SizeUnit.percent) {
                    Yoga.YGNodeStyleSetPositionPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeTop, value.value);
                }
                else {
                    Yoga.YGNodeStyleSetPosition(this.m_yogaNode, Yoga.YGEdge.YGEdgeTop, this.resolveSize(value, types_8.Direction.Vertical));
                }
            }
            else {
                Yoga.YGNodeStyleSetPositionAuto(this.m_yogaNode, Yoga.YGEdge.YGEdgeTop);
            }
        }
        get top() {
            return this.m_styleData.top;
        }
        set right(value) {
            if (!(0, is_changed_2.isChanged)(value, this.m_styleData.right))
                return;
            this.m_styleData.right = value;
            if (value) {
                if (value.unit === style_2.SizeUnit.percent) {
                    Yoga.YGNodeStyleSetPositionPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeRight, value.value);
                }
                else {
                    Yoga.YGNodeStyleSetPosition(this.m_yogaNode, Yoga.YGEdge.YGEdgeRight, this.resolveSize(value, types_8.Direction.Horizontal));
                }
            }
            else {
                Yoga.YGNodeStyleSetPositionAuto(this.m_yogaNode, Yoga.YGEdge.YGEdgeRight);
            }
        }
        get right() {
            return this.m_styleData.right;
        }
        set bottom(value) {
            if (!(0, is_changed_2.isChanged)(value, this.m_styleData.bottom))
                return;
            this.m_styleData.bottom = value;
            if (value) {
                if (value.unit === style_2.SizeUnit.percent) {
                    Yoga.YGNodeStyleSetPositionPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeBottom, value.value);
                }
                else {
                    Yoga.YGNodeStyleSetPosition(this.m_yogaNode, Yoga.YGEdge.YGEdgeBottom, this.resolveSize(value, types_8.Direction.Vertical));
                }
            }
            else {
                Yoga.YGNodeStyleSetPositionAuto(this.m_yogaNode, Yoga.YGEdge.YGEdgeBottom);
            }
        }
        get bottom() {
            return this.m_styleData.bottom;
        }
        set left(value) {
            if (!(0, is_changed_2.isChanged)(value, this.m_styleData.left))
                return;
            this.m_styleData.left = value;
            if (value) {
                if (value.unit === style_2.SizeUnit.percent) {
                    Yoga.YGNodeStyleSetPositionPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeLeft, value.value);
                }
                else {
                    Yoga.YGNodeStyleSetPosition(this.m_yogaNode, Yoga.YGEdge.YGEdgeLeft, this.resolveSize(value, types_8.Direction.Horizontal));
                }
            }
            else {
                Yoga.YGNodeStyleSetPositionAuto(this.m_yogaNode, Yoga.YGEdge.YGEdgeLeft);
            }
        }
        get left() {
            return this.m_styleData.left;
        }
        set zIndex(value) {
            if (value === this.m_styleData.zIndex)
                return;
            this.m_styleData.zIndex = value;
        }
        get zIndex() {
            return this.m_styleData.zIndex;
        }
        set flexDirection(value) {
            if (value === this.m_styleData.flex.direction)
                return;
            this.m_styleData.flex.direction = value;
            switch (value) {
                case style_2.FlexDirection.Row:
                    Yoga.YGNodeStyleSetFlexDirection(this.m_yogaNode, Yoga.YGFlexDirection.YGFlexDirectionRow);
                    break;
                case style_2.FlexDirection.RowReverse:
                    Yoga.YGNodeStyleSetFlexDirection(this.m_yogaNode, Yoga.YGFlexDirection.YGFlexDirectionRowReverse);
                    break;
                case style_2.FlexDirection.Column:
                    Yoga.YGNodeStyleSetFlexDirection(this.m_yogaNode, Yoga.YGFlexDirection.YGFlexDirectionColumn);
                    break;
                case style_2.FlexDirection.ColumnReverse:
                    Yoga.YGNodeStyleSetFlexDirection(this.m_yogaNode, Yoga.YGFlexDirection.YGFlexDirectionColumnReverse);
                    break;
            }
        }
        get flexDirection() {
            return this.m_styleData.flex.direction;
        }
        set justifyContent(value) {
            if (value === this.m_styleData.flex.justifyContent)
                return;
            this.m_styleData.flex.justifyContent = value;
            switch (value) {
                case style_2.JustifyContent.FlexStart:
                    Yoga.YGNodeStyleSetJustifyContent(this.m_yogaNode, Yoga.YGJustify.YGJustifyFlexStart);
                    break;
                case style_2.JustifyContent.FlexEnd:
                    Yoga.YGNodeStyleSetJustifyContent(this.m_yogaNode, Yoga.YGJustify.YGJustifyFlexEnd);
                    break;
                case style_2.JustifyContent.Center:
                    Yoga.YGNodeStyleSetJustifyContent(this.m_yogaNode, Yoga.YGJustify.YGJustifyCenter);
                    break;
                case style_2.JustifyContent.SpaceBetween:
                    Yoga.YGNodeStyleSetJustifyContent(this.m_yogaNode, Yoga.YGJustify.YGJustifySpaceBetween);
                    break;
                case style_2.JustifyContent.SpaceAround:
                    Yoga.YGNodeStyleSetJustifyContent(this.m_yogaNode, Yoga.YGJustify.YGJustifySpaceAround);
                    break;
                case style_2.JustifyContent.SpaceEvenly:
                    Yoga.YGNodeStyleSetJustifyContent(this.m_yogaNode, Yoga.YGJustify.YGJustifySpaceEvenly);
                    break;
            }
        }
        get justifyContent() {
            return this.m_styleData.flex.justifyContent;
        }
        set alignItems(value) {
            if (value === this.m_styleData.flex.alignItems)
                return;
            this.m_styleData.flex.alignItems = value;
            switch (value) {
                case style_2.AlignItems.FlexStart:
                    Yoga.YGNodeStyleSetAlignItems(this.m_yogaNode, Yoga.YGAlign.YGAlignFlexStart);
                    break;
                case style_2.AlignItems.FlexEnd:
                    Yoga.YGNodeStyleSetAlignItems(this.m_yogaNode, Yoga.YGAlign.YGAlignFlexEnd);
                    break;
                case style_2.AlignItems.Center:
                    Yoga.YGNodeStyleSetAlignItems(this.m_yogaNode, Yoga.YGAlign.YGAlignCenter);
                    break;
                case style_2.AlignItems.Stretch:
                    Yoga.YGNodeStyleSetAlignItems(this.m_yogaNode, Yoga.YGAlign.YGAlignStretch);
                    break;
                case style_2.AlignItems.Baseline:
                    Yoga.YGNodeStyleSetAlignItems(this.m_yogaNode, Yoga.YGAlign.YGAlignBaseline);
                    break;
            }
        }
        get alignItems() {
            return this.m_styleData.flex.alignItems;
        }
        set flexWrap(value) {
            if (value === this.m_styleData.flex.wrap)
                return;
            this.m_styleData.flex.wrap = value;
            switch (value) {
                case style_2.FlexWrap.NoWrap:
                    Yoga.YGNodeStyleSetFlexWrap(this.m_yogaNode, Yoga.YGWrap.YGWrapNoWrap);
                    break;
                case style_2.FlexWrap.Wrap:
                    Yoga.YGNodeStyleSetFlexWrap(this.m_yogaNode, Yoga.YGWrap.YGWrapWrap);
                    break;
                case style_2.FlexWrap.WrapReverse:
                    Yoga.YGNodeStyleSetFlexWrap(this.m_yogaNode, Yoga.YGWrap.YGWrapWrapReverse);
                    break;
            }
        }
        get flexWrap() {
            return this.m_styleData.flex.wrap;
        }
        set flexGrow(value) {
            if (value === this.m_styleData.flex.grow)
                return;
            this.m_styleData.flex.grow = value;
            Yoga.YGNodeStyleSetFlexGrow(this.m_yogaNode, value);
        }
        get flexGrow() {
            return this.m_styleData.flex.grow;
        }
        set flexShrink(value) {
            if (value === this.m_styleData.flex.shrink)
                return;
            this.m_styleData.flex.shrink = value;
            Yoga.YGNodeStyleSetFlexShrink(this.m_yogaNode, value);
        }
        get flexShrink() {
            return this.m_styleData.flex.shrink;
        }
        set flexBasis(value) {
            if (!(0, is_changed_2.isChanged)(value, this.m_styleData.flex.basis))
                return;
            this.m_styleData.flex.basis = value;
            if (value) {
                if (value.unit === style_2.SizeUnit.percent) {
                    Yoga.YGNodeStyleSetFlexBasisPercent(this.m_yogaNode, value.value);
                }
                else {
                    Yoga.YGNodeStyleSetFlexBasis(this.m_yogaNode, this.resolveSize(value, types_8.Direction.Horizontal));
                }
            }
            else {
                Yoga.YGNodeStyleSetFlexBasisAuto(this.m_yogaNode);
            }
        }
        get flexBasis() {
            return this.m_styleData.flex.basis;
        }
        set flex(value) {
            this.flexGrow = value;
            this.flexShrink = value;
            this.flexBasis = null;
        }
        set gap(value) {
            if (!(0, is_changed_2.isChanged)(value, this.m_styleData.flex.gap))
                return;
            this.m_styleData.flex.gap = value;
            if (value.unit === style_2.SizeUnit.percent) {
                Yoga.YGNodeStyleSetGapPercent(this.m_yogaNode, Yoga.YGGutter.YGGutterColumn, value.value);
                Yoga.YGNodeStyleSetGapPercent(this.m_yogaNode, Yoga.YGGutter.YGGutterRow, value.value);
            }
            else {
                Yoga.YGNodeStyleSetGap(this.m_yogaNode, Yoga.YGGutter.YGGutterColumn, this.resolveSize(value, types_8.Direction.Vertical));
                Yoga.YGNodeStyleSetGap(this.m_yogaNode, Yoga.YGGutter.YGGutterRow, this.resolveSize(value, types_8.Direction.Horizontal));
            }
        }
        get gap() {
            return this.m_styleData.flex.gap;
        }
        set lineHeight(value) {
            if (!(0, is_changed_2.isChanged)(value, this.m_styleData.lineHeight))
                return;
            this.m_styleData.lineHeight = value;
        }
        get lineHeight() {
            return this.m_styleData.lineHeight;
        }
        set letterSpacing(value) {
            if (!(0, is_changed_2.isChanged)(value, this.m_styleData.letterSpacing))
                return;
            this.m_styleData.letterSpacing = value;
        }
        get letterSpacing() {
            return this.m_styleData.letterSpacing;
        }
        set fontSize(value) {
            if (!(0, is_changed_2.isChanged)(value, this.m_styleData.fontSize))
                return;
            this.m_styleData.fontSize = value;
        }
        get fontSize() {
            return this.m_styleData.fontSize;
        }
        set fontWeight(value) {
            if (value === this.m_styleData.fontWeight)
                return;
            this.m_styleData.fontWeight = value;
        }
        get fontWeight() {
            return this.m_styleData.fontWeight;
        }
        set fontFamily(value) {
            if (value === this.m_styleData.fontFamily)
                return;
            this.m_styleData.fontFamily = value;
        }
        get fontFamily() {
            return this.m_styleData.fontFamily;
        }
        set fontStyle(value) {
            if (value === this.m_styleData.fontStyle)
                return;
            this.m_styleData.fontStyle = value;
        }
        get fontStyle() {
            return this.m_styleData.fontStyle;
        }
        set textAlign(value) {
            if (value === this.m_styleData.textAlign)
                return;
            this.m_styleData.textAlign = value;
        }
        get textAlign() {
            return this.m_styleData.textAlign;
        }
        set textDecoration(value) {
            if (value === this.m_styleData.textDecoration)
                return;
            this.m_styleData.textDecoration = value;
        }
        get textDecoration() {
            return this.m_styleData.textDecoration;
        }
        set whiteSpace(value) {
            if (value === this.m_styleData.whiteSpace)
                return;
            this.m_styleData.whiteSpace = value;
        }
        get whiteSpace() {
            return this.m_styleData.whiteSpace;
        }
        set wordBreak(value) {
            if (value === this.m_styleData.wordBreak)
                return;
            this.m_styleData.wordBreak = value;
        }
        get wordBreak() {
            return this.m_styleData.wordBreak;
        }
        set wordWrap(value) {
            if (value === this.m_styleData.wordWrap)
                return;
            this.m_styleData.wordWrap = value;
        }
        get wordWrap() {
            return this.m_styleData.wordWrap;
        }
        set overflow(value) {
            if (value === this.m_styleData.overflow)
                return;
            this.m_styleData.overflow = value;
        }
        get overflow() {
            return this.m_styleData.overflow;
        }
        set textOverflow(value) {
            if (value === this.m_styleData.textOverflow)
                return;
            this.m_styleData.textOverflow = value;
        }
        get textOverflow() {
            return this.m_styleData.textOverflow;
        }
        set color(value) {
            if (!(0, is_changed_2.isChanged)(value, this.m_styleData.color))
                return;
            this.m_styleData.color = value;
        }
        get color() {
            return this.m_styleData.color;
        }
        set backgroundColor(value) {
            if (!(0, is_changed_2.isChanged)(value, this.m_styleData.backgroundColor))
                return;
            this.m_styleData.backgroundColor = value;
        }
        get backgroundColor() {
            return this.m_styleData.backgroundColor;
        }
        set borderWidth(value) {
            if (!(0, is_changed_2.isChanged)(value, this.m_styleData.border.width))
                return;
            this.m_styleData.border.width = value;
            Yoga.YGNodeStyleSetBorder(this.m_yogaNode, Yoga.YGEdge.YGEdgeLeft, this.resolveSize(value, types_8.Direction.Horizontal));
            Yoga.YGNodeStyleSetBorder(this.m_yogaNode, Yoga.YGEdge.YGEdgeRight, this.resolveSize(value, types_8.Direction.Horizontal));
            Yoga.YGNodeStyleSetBorder(this.m_yogaNode, Yoga.YGEdge.YGEdgeTop, this.resolveSize(value, types_8.Direction.Vertical));
            Yoga.YGNodeStyleSetBorder(this.m_yogaNode, Yoga.YGEdge.YGEdgeBottom, this.resolveSize(value, types_8.Direction.Vertical));
        }
        get borderWidth() {
            return this.m_styleData.border.width;
        }
        set borderColor(value) {
            if (!(0, is_changed_2.isChanged)(value, this.m_styleData.border.color))
                return;
            this.m_styleData.border.color = value;
        }
        get borderColor() {
            return this.m_styleData.border.color;
        }
        set borderStyle(value) {
            if (value === this.m_styleData.border.style)
                return;
            this.m_styleData.border.style = value;
        }
        get borderStyle() {
            return this.m_styleData.border.style;
        }
        set borderRadius(value) {
            if (!(0, is_changed_2.isChanged)(value, this.m_styleData.border.topLeftRadius))
                return;
            this.m_styleData.border.topLeftRadius = value;
            this.m_styleData.border.topRightRadius = value;
            this.m_styleData.border.bottomLeftRadius = value;
            this.m_styleData.border.bottomRightRadius = value;
        }
        get borderRadius() {
            return this.m_styleData.border.topLeftRadius;
        }
        set borderTopLeftRadius(value) {
            if (!(0, is_changed_2.isChanged)(value, this.m_styleData.border.topLeftRadius))
                return;
            this.m_styleData.border.topLeftRadius = value;
        }
        get borderTopLeftRadius() {
            return this.m_styleData.border.topLeftRadius;
        }
        set borderTopRightRadius(value) {
            if (!(0, is_changed_2.isChanged)(value, this.m_styleData.border.topRightRadius))
                return;
            this.m_styleData.border.topRightRadius = value;
        }
        get borderTopRightRadius() {
            return this.m_styleData.border.topRightRadius;
        }
        set borderBottomLeftRadius(value) {
            if (!(0, is_changed_2.isChanged)(value, this.m_styleData.border.bottomLeftRadius))
                return;
            this.m_styleData.border.bottomLeftRadius = value;
        }
        get borderBottomLeftRadius() {
            return this.m_styleData.border.bottomLeftRadius;
        }
        set borderBottomRightRadius(value) {
            if (!(0, is_changed_2.isChanged)(value, this.m_styleData.border.bottomRightRadius))
                return;
            this.m_styleData.border.bottomRightRadius = value;
        }
        get borderBottomRightRadius() {
            return this.m_styleData.border.bottomRightRadius;
        }
        set margin(value) {
            if ((0, is_changed_2.isChanged)(value, this.m_styleData.margin.left)) {
                this.m_styleData.margin.left = value;
                if (value.unit === style_2.SizeUnit.percent) {
                    Yoga.YGNodeStyleSetMarginPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeLeft, value.value);
                }
                else {
                    Yoga.YGNodeStyleSetMargin(this.m_yogaNode, Yoga.YGEdge.YGEdgeLeft, this.resolveSize(value, types_8.Direction.Horizontal));
                }
            }
            if ((0, is_changed_2.isChanged)(value, this.m_styleData.margin.right)) {
                this.m_styleData.margin.right = value;
                if (value.unit === style_2.SizeUnit.percent) {
                    Yoga.YGNodeStyleSetMarginPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeRight, value.value);
                }
                else {
                    Yoga.YGNodeStyleSetMargin(this.m_yogaNode, Yoga.YGEdge.YGEdgeRight, this.resolveSize(value, types_8.Direction.Horizontal));
                }
            }
            if ((0, is_changed_2.isChanged)(value, this.m_styleData.margin.top)) {
                this.m_styleData.margin.top = value;
                if (value.unit === style_2.SizeUnit.percent) {
                    Yoga.YGNodeStyleSetMarginPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeTop, value.value);
                }
                else {
                    Yoga.YGNodeStyleSetMargin(this.m_yogaNode, Yoga.YGEdge.YGEdgeTop, this.resolveSize(value, types_8.Direction.Vertical));
                }
            }
            if ((0, is_changed_2.isChanged)(value, this.m_styleData.margin.bottom)) {
                this.m_styleData.margin.bottom = value;
                if (value.unit === style_2.SizeUnit.percent) {
                    Yoga.YGNodeStyleSetMarginPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeBottom, value.value);
                }
                else {
                    Yoga.YGNodeStyleSetMargin(this.m_yogaNode, Yoga.YGEdge.YGEdgeBottom, this.resolveSize(value, types_8.Direction.Vertical));
                }
            }
        }
        get margin() {
            return this.m_styleData.margin;
        }
        set marginLeft(value) {
            if (!(0, is_changed_2.isChanged)(value, this.m_styleData.margin.left))
                return;
            this.m_styleData.margin.left = value;
            if (value.unit === style_2.SizeUnit.percent) {
                Yoga.YGNodeStyleSetMarginPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeLeft, value.value);
            }
            else {
                Yoga.YGNodeStyleSetMargin(this.m_yogaNode, Yoga.YGEdge.YGEdgeLeft, this.resolveSize(value, types_8.Direction.Horizontal));
            }
        }
        get marginLeft() {
            return this.m_styleData.margin.left;
        }
        set marginRight(value) {
            if (!(0, is_changed_2.isChanged)(value, this.m_styleData.margin.right))
                return;
            this.m_styleData.margin.right = value;
            if (value.unit === style_2.SizeUnit.percent) {
                Yoga.YGNodeStyleSetMarginPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeRight, value.value);
            }
            else {
                Yoga.YGNodeStyleSetMargin(this.m_yogaNode, Yoga.YGEdge.YGEdgeRight, this.resolveSize(value, types_8.Direction.Horizontal));
            }
        }
        get marginRight() {
            return this.m_styleData.margin.right;
        }
        set marginTop(value) {
            if (!(0, is_changed_2.isChanged)(value, this.m_styleData.margin.top))
                return;
            this.m_styleData.margin.top = value;
            if (value.unit === style_2.SizeUnit.percent) {
                Yoga.YGNodeStyleSetMarginPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeTop, value.value);
            }
            else {
                Yoga.YGNodeStyleSetMargin(this.m_yogaNode, Yoga.YGEdge.YGEdgeTop, this.resolveSize(value, types_8.Direction.Vertical));
            }
        }
        get marginTop() {
            return this.m_styleData.margin.top;
        }
        set marginBottom(value) {
            if (!(0, is_changed_2.isChanged)(value, this.m_styleData.margin.bottom))
                return;
            this.m_styleData.margin.bottom = value;
            if (value.unit === style_2.SizeUnit.percent) {
                Yoga.YGNodeStyleSetMarginPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeBottom, value.value);
            }
            else {
                Yoga.YGNodeStyleSetMargin(this.m_yogaNode, Yoga.YGEdge.YGEdgeBottom, this.resolveSize(value, types_8.Direction.Vertical));
            }
        }
        get marginBottom() {
            return this.m_styleData.margin.bottom;
        }
        set padding(value) {
            if ((0, is_changed_2.isChanged)(value, this.m_styleData.padding.left)) {
                this.m_styleData.padding.left = value;
                if (value.unit === style_2.SizeUnit.percent) {
                    Yoga.YGNodeStyleSetPaddingPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeLeft, value.value);
                }
                else {
                    Yoga.YGNodeStyleSetPadding(this.m_yogaNode, Yoga.YGEdge.YGEdgeLeft, this.resolveSize(value, types_8.Direction.Horizontal));
                }
            }
            if ((0, is_changed_2.isChanged)(value, this.m_styleData.padding.right)) {
                this.m_styleData.padding.right = value;
                if (value.unit === style_2.SizeUnit.percent) {
                    Yoga.YGNodeStyleSetPaddingPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeRight, value.value);
                }
                else {
                    Yoga.YGNodeStyleSetPadding(this.m_yogaNode, Yoga.YGEdge.YGEdgeRight, this.resolveSize(value, types_8.Direction.Horizontal));
                }
            }
            if ((0, is_changed_2.isChanged)(value, this.m_styleData.padding.top)) {
                this.m_styleData.padding.top = value;
                if (value.unit === style_2.SizeUnit.percent) {
                    Yoga.YGNodeStyleSetPaddingPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeTop, value.value);
                }
                else {
                    Yoga.YGNodeStyleSetPadding(this.m_yogaNode, Yoga.YGEdge.YGEdgeTop, this.resolveSize(value, types_8.Direction.Vertical));
                }
            }
            if ((0, is_changed_2.isChanged)(value, this.m_styleData.padding.bottom)) {
                this.m_styleData.padding.bottom = value;
                if (value.unit === style_2.SizeUnit.percent) {
                    Yoga.YGNodeStyleSetPaddingPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeBottom, value.value);
                }
                else {
                    Yoga.YGNodeStyleSetPadding(this.m_yogaNode, Yoga.YGEdge.YGEdgeBottom, this.resolveSize(value, types_8.Direction.Vertical));
                }
            }
        }
        get padding() {
            return this.m_styleData.padding;
        }
        set paddingLeft(value) {
            if (!(0, is_changed_2.isChanged)(value, this.m_styleData.padding.left))
                return;
            this.m_styleData.padding.left = value;
            if (value.unit === style_2.SizeUnit.percent) {
                Yoga.YGNodeStyleSetPaddingPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeLeft, value.value);
            }
            else {
                Yoga.YGNodeStyleSetPadding(this.m_yogaNode, Yoga.YGEdge.YGEdgeLeft, this.resolveSize(value, types_8.Direction.Horizontal));
            }
        }
        get paddingLeft() {
            return this.m_styleData.padding.left;
        }
        set paddingRight(value) {
            if (!(0, is_changed_2.isChanged)(value, this.m_styleData.padding.right))
                return;
            this.m_styleData.padding.right = value;
            if (value.unit === style_2.SizeUnit.percent) {
                Yoga.YGNodeStyleSetPaddingPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeRight, value.value);
            }
            else {
                Yoga.YGNodeStyleSetPadding(this.m_yogaNode, Yoga.YGEdge.YGEdgeRight, this.resolveSize(value, types_8.Direction.Horizontal));
            }
        }
        get paddingRight() {
            return this.m_styleData.padding.right;
        }
        set paddingTop(value) {
            if (!(0, is_changed_2.isChanged)(value, this.m_styleData.padding.top))
                return;
            this.m_styleData.padding.top = value;
            if (value.unit === style_2.SizeUnit.percent) {
                Yoga.YGNodeStyleSetPaddingPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeTop, value.value);
            }
            else {
                Yoga.YGNodeStyleSetPadding(this.m_yogaNode, Yoga.YGEdge.YGEdgeTop, this.resolveSize(value, types_8.Direction.Vertical));
            }
        }
        get paddingTop() {
            return this.m_styleData.padding.top;
        }
        set paddingBottom(value) {
            if (!(0, is_changed_2.isChanged)(value, this.m_styleData.padding.bottom))
                return;
            this.m_styleData.padding.bottom = value;
            if (value.unit === style_2.SizeUnit.percent) {
                Yoga.YGNodeStyleSetPaddingPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeBottom, value.value);
            }
            else {
                Yoga.YGNodeStyleSetPadding(this.m_yogaNode, Yoga.YGEdge.YGEdgeBottom, this.resolveSize(value, types_8.Direction.Vertical));
            }
        }
        get paddingBottom() {
            return this.m_styleData.padding.bottom;
        }
        get computedFontSize() {
            return this.resolveFontSize(this.m_styleData.fontSize);
        }
        /** @internal */
        resolveFontSize(size) {
            switch (size.unit) {
                case style_2.SizeUnit.px:
                    return size.value;
                case style_2.SizeUnit.percent:
                    if (!this.m_parent)
                        return size.value * 0.01 * utils_2.DEFAULT_FONT_SIZE;
                    return size.value * 0.01 * this.m_parent.resolveFontSize(this.m_parent.m_styleData.fontSize);
                case style_2.SizeUnit.em:
                    if (!this.m_parent)
                        return size.value * utils_2.DEFAULT_FONT_SIZE;
                    return size.value * this.m_parent.resolveFontSize(this.m_parent.m_styleData.fontSize);
                case style_2.SizeUnit.rem:
                    if (!this.m_root)
                        return size.value * utils_2.DEFAULT_FONT_SIZE;
                    return size.value * this.m_root.resolveFontSize(this.m_root.m_styleData.fontSize);
                case style_2.SizeUnit.vw:
                    return size.value * 0.01 * this.m_window.getSize().x;
                case style_2.SizeUnit.vh:
                    return size.value * 0.01 * this.m_window.getSize().y;
            }
        }
        /** @internal */
        resolveSize(size, axis) {
            switch (size.unit) {
                case style_2.SizeUnit.px:
                    return size.value;
                case style_2.SizeUnit.percent:
                    let percentOf;
                    if (!this.m_parent) {
                        if (axis === types_8.Direction.Horizontal)
                            percentOf = this.m_window.getSize().x;
                        else
                            percentOf = this.m_window.getSize().y;
                    }
                    else {
                        if (axis === types_8.Direction.Horizontal)
                            percentOf = this.m_parent.clientRect.width;
                        else
                            percentOf = this.m_parent.clientRect.height;
                    }
                    return size.value * 0.01 * percentOf;
                case style_2.SizeUnit.em:
                    return size.value * this.resolveFontSize(this.m_styleData.fontSize);
                case style_2.SizeUnit.rem:
                    if (!this.m_root)
                        return size.value * utils_2.DEFAULT_FONT_SIZE;
                    return size.value * this.m_root.resolveFontSize(this.m_root.m_styleData.fontSize);
                case style_2.SizeUnit.vw:
                    return size.value * 0.01 * this.m_window.getSize().x;
                case style_2.SizeUnit.vh:
                    return size.value * 0.01 * this.m_window.getSize().y;
            }
        }
        /** @internal */
        resolveBorderRadius(size, calculatedWidth, calculatedHeight, axis) {
            switch (size.unit) {
                case style_2.SizeUnit.px:
                    return size.value;
                case style_2.SizeUnit.percent:
                    let percentOf;
                    if (axis === types_8.Direction.Horizontal)
                        percentOf = calculatedWidth;
                    else
                        percentOf = calculatedHeight;
                    return size.value * 0.01 * percentOf;
                case style_2.SizeUnit.em:
                    return size.value * this.resolveFontSize(this.m_styleData.fontSize);
                case style_2.SizeUnit.rem:
                    if (!this.m_root)
                        return size.value * utils_2.DEFAULT_FONT_SIZE;
                    return size.value * this.m_root.resolveFontSize(this.m_root.m_styleData.fontSize);
                case style_2.SizeUnit.vw:
                    return size.value * 0.01 * this.m_window.getSize().x;
                case style_2.SizeUnit.vh:
                    return size.value * 0.01 * this.m_window.getSize().y;
            }
        }
        /** @internal */
        resolveBorderWidth(size) {
            switch (size.unit) {
                case style_2.SizeUnit.px:
                    return size.value;
                case style_2.SizeUnit.percent:
                    return 0;
                case style_2.SizeUnit.em:
                    return size.value * this.resolveFontSize(this.m_styleData.fontSize);
                case style_2.SizeUnit.rem:
                    if (!this.m_root)
                        return size.value * utils_2.DEFAULT_FONT_SIZE;
                    return size.value * this.m_root.resolveFontSize(this.m_root.m_styleData.fontSize);
                case style_2.SizeUnit.vw:
                    return size.value * 0.01 * this.m_window.getSize().x;
                case style_2.SizeUnit.vh:
                    return size.value * 0.01 * this.m_window.getSize().y;
            }
        }
        /** @internal */
        configureDimensions() {
            if (this.m_styleData.minWidth) {
                if (this.m_styleData.minWidth.unit === style_2.SizeUnit.percent) {
                    Yoga.YGNodeStyleSetMinWidthPercent(this.m_yogaNode, this.m_styleData.minWidth.value);
                }
                else {
                    Yoga.YGNodeStyleSetMinWidth(this.m_yogaNode, this.resolveSize(this.m_styleData.minWidth, types_8.Direction.Horizontal));
                }
            }
            if (this.m_styleData.minHeight) {
                if (this.m_styleData.minHeight.unit === style_2.SizeUnit.percent) {
                    Yoga.YGNodeStyleSetMinHeightPercent(this.m_yogaNode, this.m_styleData.minHeight.value);
                }
                else {
                    Yoga.YGNodeStyleSetMinHeight(this.m_yogaNode, this.resolveSize(this.m_styleData.minHeight, types_8.Direction.Vertical));
                }
            }
            if (this.m_styleData.maxWidth) {
                if (this.m_styleData.maxWidth.unit === style_2.SizeUnit.percent) {
                    Yoga.YGNodeStyleSetMaxWidthPercent(this.m_yogaNode, this.m_styleData.maxWidth.value);
                }
                else {
                    Yoga.YGNodeStyleSetMaxWidth(this.m_yogaNode, this.resolveSize(this.m_styleData.maxWidth, types_8.Direction.Horizontal));
                }
            }
            if (this.m_styleData.maxHeight) {
                if (this.m_styleData.maxHeight.unit === style_2.SizeUnit.percent) {
                    Yoga.YGNodeStyleSetMaxHeightPercent(this.m_yogaNode, this.m_styleData.maxHeight.value);
                }
                else {
                    Yoga.YGNodeStyleSetMaxHeight(this.m_yogaNode, this.resolveSize(this.m_styleData.maxHeight, types_8.Direction.Vertical));
                }
            }
            if (this.m_styleData.width) {
                if (this.m_styleData.width.unit === style_2.SizeUnit.percent) {
                    Yoga.YGNodeStyleSetWidthPercent(this.m_yogaNode, this.m_styleData.width.value);
                }
                else {
                    Yoga.YGNodeStyleSetWidth(this.m_yogaNode, this.resolveSize(this.m_styleData.width, types_8.Direction.Horizontal));
                }
            }
            else {
                Yoga.YGNodeStyleSetWidthAuto(this.m_yogaNode);
            }
            if (this.m_styleData.height) {
                if (this.m_styleData.height.unit === style_2.SizeUnit.percent) {
                    Yoga.YGNodeStyleSetHeightPercent(this.m_yogaNode, this.m_styleData.height.value);
                }
                else {
                    Yoga.YGNodeStyleSetHeight(this.m_yogaNode, this.resolveSize(this.m_styleData.height, types_8.Direction.Vertical));
                }
            }
            else {
                Yoga.YGNodeStyleSetHeightAuto(this.m_yogaNode);
            }
        }
        /** @internal */
        configurePositioning() {
            switch (this.m_styleData.position) {
                case style_2.Position.Static:
                    Yoga.YGNodeStyleSetPositionType(this.m_yogaNode, Yoga.YGPositionType.YGPositionTypeStatic);
                    break;
                case style_2.Position.Relative:
                    Yoga.YGNodeStyleSetPositionType(this.m_yogaNode, Yoga.YGPositionType.YGPositionTypeRelative);
                    break;
                case style_2.Position.Absolute:
                    Yoga.YGNodeStyleSetPositionType(this.m_yogaNode, Yoga.YGPositionType.YGPositionTypeAbsolute);
                    break;
                case style_2.Position.Fixed:
                    // todo: What's different?
                    Yoga.YGNodeStyleSetPositionType(this.m_yogaNode, Yoga.YGPositionType.YGPositionTypeAbsolute);
                    break;
                case style_2.Position.Sticky:
                    // todo: What's different?
                    Yoga.YGNodeStyleSetPositionType(this.m_yogaNode, Yoga.YGPositionType.YGPositionTypeAbsolute);
                    break;
            }
            if (this.m_styleData.top) {
                if (this.m_styleData.top.unit === style_2.SizeUnit.percent) {
                    Yoga.YGNodeStyleSetPositionPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeTop, this.m_styleData.top.value);
                }
                else {
                    Yoga.YGNodeStyleSetPosition(this.m_yogaNode, Yoga.YGEdge.YGEdgeTop, this.resolveSize(this.m_styleData.top, types_8.Direction.Vertical));
                }
            }
            else {
                Yoga.YGNodeStyleSetPositionAuto(this.m_yogaNode, Yoga.YGEdge.YGEdgeTop);
            }
            if (this.m_styleData.right) {
                if (this.m_styleData.right.unit === style_2.SizeUnit.percent) {
                    Yoga.YGNodeStyleSetPositionPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeRight, this.m_styleData.right.value);
                }
                else {
                    Yoga.YGNodeStyleSetPosition(this.m_yogaNode, Yoga.YGEdge.YGEdgeRight, this.resolveSize(this.m_styleData.right, types_8.Direction.Horizontal));
                }
            }
            else {
                Yoga.YGNodeStyleSetPositionAuto(this.m_yogaNode, Yoga.YGEdge.YGEdgeRight);
            }
            if (this.m_styleData.bottom) {
                if (this.m_styleData.bottom.unit === style_2.SizeUnit.percent) {
                    Yoga.YGNodeStyleSetPositionPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeBottom, this.m_styleData.bottom.value);
                }
                else {
                    Yoga.YGNodeStyleSetPosition(this.m_yogaNode, Yoga.YGEdge.YGEdgeBottom, this.resolveSize(this.m_styleData.bottom, types_8.Direction.Vertical));
                }
            }
            else {
                Yoga.YGNodeStyleSetPositionAuto(this.m_yogaNode, Yoga.YGEdge.YGEdgeBottom);
            }
            if (this.m_styleData.left) {
                if (this.m_styleData.left.unit === style_2.SizeUnit.percent) {
                    Yoga.YGNodeStyleSetPositionPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeLeft, this.m_styleData.left.value);
                }
                else {
                    Yoga.YGNodeStyleSetPosition(this.m_yogaNode, Yoga.YGEdge.YGEdgeLeft, this.resolveSize(this.m_styleData.left, types_8.Direction.Horizontal));
                }
            }
            else {
                Yoga.YGNodeStyleSetPositionAuto(this.m_yogaNode, Yoga.YGEdge.YGEdgeLeft);
            }
        }
        /** @internal */
        configureFlex() {
            switch (this.m_styleData.flex.direction) {
                case style_2.FlexDirection.Row:
                    Yoga.YGNodeStyleSetFlexDirection(this.m_yogaNode, Yoga.YGFlexDirection.YGFlexDirectionRow);
                    break;
                case style_2.FlexDirection.RowReverse:
                    Yoga.YGNodeStyleSetFlexDirection(this.m_yogaNode, Yoga.YGFlexDirection.YGFlexDirectionRowReverse);
                    break;
                case style_2.FlexDirection.Column:
                    Yoga.YGNodeStyleSetFlexDirection(this.m_yogaNode, Yoga.YGFlexDirection.YGFlexDirectionColumn);
                    break;
                case style_2.FlexDirection.ColumnReverse:
                    Yoga.YGNodeStyleSetFlexDirection(this.m_yogaNode, Yoga.YGFlexDirection.YGFlexDirectionColumnReverse);
                    break;
            }
            switch (this.m_styleData.flex.justifyContent) {
                case style_2.JustifyContent.FlexStart:
                    Yoga.YGNodeStyleSetJustifyContent(this.m_yogaNode, Yoga.YGJustify.YGJustifyFlexStart);
                    break;
                case style_2.JustifyContent.FlexEnd:
                    Yoga.YGNodeStyleSetJustifyContent(this.m_yogaNode, Yoga.YGJustify.YGJustifyFlexEnd);
                    break;
                case style_2.JustifyContent.Center:
                    Yoga.YGNodeStyleSetJustifyContent(this.m_yogaNode, Yoga.YGJustify.YGJustifyCenter);
                    break;
                case style_2.JustifyContent.SpaceBetween:
                    Yoga.YGNodeStyleSetJustifyContent(this.m_yogaNode, Yoga.YGJustify.YGJustifySpaceBetween);
                    break;
                case style_2.JustifyContent.SpaceAround:
                    Yoga.YGNodeStyleSetJustifyContent(this.m_yogaNode, Yoga.YGJustify.YGJustifySpaceAround);
                    break;
                case style_2.JustifyContent.SpaceEvenly:
                    Yoga.YGNodeStyleSetJustifyContent(this.m_yogaNode, Yoga.YGJustify.YGJustifySpaceEvenly);
                    break;
            }
            switch (this.m_styleData.flex.alignItems) {
                case style_2.AlignItems.FlexStart:
                    Yoga.YGNodeStyleSetAlignItems(this.m_yogaNode, Yoga.YGAlign.YGAlignFlexStart);
                    break;
                case style_2.AlignItems.FlexEnd:
                    Yoga.YGNodeStyleSetAlignItems(this.m_yogaNode, Yoga.YGAlign.YGAlignFlexEnd);
                    break;
                case style_2.AlignItems.Center:
                    Yoga.YGNodeStyleSetAlignItems(this.m_yogaNode, Yoga.YGAlign.YGAlignCenter);
                    break;
                case style_2.AlignItems.Stretch:
                    Yoga.YGNodeStyleSetAlignItems(this.m_yogaNode, Yoga.YGAlign.YGAlignStretch);
                    break;
                case style_2.AlignItems.Baseline:
                    Yoga.YGNodeStyleSetAlignItems(this.m_yogaNode, Yoga.YGAlign.YGAlignBaseline);
                    break;
            }
            switch (this.m_styleData.flex.wrap) {
                case style_2.FlexWrap.NoWrap:
                    Yoga.YGNodeStyleSetFlexWrap(this.m_yogaNode, Yoga.YGWrap.YGWrapNoWrap);
                    break;
                case style_2.FlexWrap.Wrap:
                    Yoga.YGNodeStyleSetFlexWrap(this.m_yogaNode, Yoga.YGWrap.YGWrapWrap);
                    break;
                case style_2.FlexWrap.WrapReverse:
                    Yoga.YGNodeStyleSetFlexWrap(this.m_yogaNode, Yoga.YGWrap.YGWrapWrapReverse);
                    break;
            }
            Yoga.YGNodeStyleSetFlexGrow(this.m_yogaNode, this.m_styleData.flex.grow);
            Yoga.YGNodeStyleSetFlexShrink(this.m_yogaNode, this.m_styleData.flex.shrink);
            if (this.m_styleData.flex.basis) {
                if (this.m_styleData.flex.basis.unit === style_2.SizeUnit.percent) {
                    Yoga.YGNodeStyleSetFlexBasisPercent(this.m_yogaNode, this.m_styleData.flex.basis.value);
                }
                else {
                    Yoga.YGNodeStyleSetFlexBasis(this.m_yogaNode, this.resolveSize(this.m_styleData.flex.basis, types_8.Direction.Horizontal));
                }
            }
            else {
                Yoga.YGNodeStyleSetFlexBasisAuto(this.m_yogaNode);
            }
            if (this.m_styleData.flex.gap.unit === style_2.SizeUnit.percent) {
                Yoga.YGNodeStyleSetGapPercent(this.m_yogaNode, Yoga.YGGutter.YGGutterColumn, this.m_styleData.flex.gap.value);
                Yoga.YGNodeStyleSetGapPercent(this.m_yogaNode, Yoga.YGGutter.YGGutterRow, this.m_styleData.flex.gap.value);
            }
            else {
                Yoga.YGNodeStyleSetGap(this.m_yogaNode, Yoga.YGGutter.YGGutterColumn, this.resolveSize(this.m_styleData.flex.gap, types_8.Direction.Vertical));
                Yoga.YGNodeStyleSetGap(this.m_yogaNode, Yoga.YGGutter.YGGutterRow, this.resolveSize(this.m_styleData.flex.gap, types_8.Direction.Horizontal));
            }
        }
        /** @internal */
        configureBorders() {
            Yoga.YGNodeStyleSetBorder(this.m_yogaNode, Yoga.YGEdge.YGEdgeTop, this.resolveSize(this.m_styleData.border.width, types_8.Direction.Vertical));
            Yoga.YGNodeStyleSetBorder(this.m_yogaNode, Yoga.YGEdge.YGEdgeRight, this.resolveSize(this.m_styleData.border.width, types_8.Direction.Horizontal));
            Yoga.YGNodeStyleSetBorder(this.m_yogaNode, Yoga.YGEdge.YGEdgeBottom, this.resolveSize(this.m_styleData.border.width, types_8.Direction.Vertical));
            Yoga.YGNodeStyleSetBorder(this.m_yogaNode, Yoga.YGEdge.YGEdgeLeft, this.resolveSize(this.m_styleData.border.width, types_8.Direction.Horizontal));
        }
        /** @internal */
        configurePadding() {
            if (this.m_styleData.padding.top.unit === style_2.SizeUnit.percent) {
                Yoga.YGNodeStyleSetPaddingPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeTop, this.m_styleData.padding.top.value);
            }
            else {
                Yoga.YGNodeStyleSetPadding(this.m_yogaNode, Yoga.YGEdge.YGEdgeTop, this.resolveSize(this.m_styleData.padding.top, types_8.Direction.Vertical));
            }
            if (this.m_styleData.padding.right.unit === style_2.SizeUnit.percent) {
                Yoga.YGNodeStyleSetPaddingPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeRight, this.m_styleData.padding.right.value);
            }
            else {
                Yoga.YGNodeStyleSetPadding(this.m_yogaNode, Yoga.YGEdge.YGEdgeRight, this.resolveSize(this.m_styleData.padding.right, types_8.Direction.Horizontal));
            }
            if (this.m_styleData.padding.bottom.unit === style_2.SizeUnit.percent) {
                Yoga.YGNodeStyleSetPaddingPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeBottom, this.m_styleData.padding.bottom.value);
            }
            else {
                Yoga.YGNodeStyleSetPadding(this.m_yogaNode, Yoga.YGEdge.YGEdgeBottom, this.resolveSize(this.m_styleData.padding.bottom, types_8.Direction.Vertical));
            }
            if (this.m_styleData.padding.left.unit === style_2.SizeUnit.percent) {
                Yoga.YGNodeStyleSetPaddingPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeLeft, this.m_styleData.padding.left.value);
            }
            else {
                Yoga.YGNodeStyleSetPadding(this.m_yogaNode, Yoga.YGEdge.YGEdgeLeft, this.resolveSize(this.m_styleData.padding.left, types_8.Direction.Horizontal));
            }
        }
        /** @internal */
        configureMargin() {
            if (this.m_styleData.margin.top.unit === style_2.SizeUnit.percent) {
                Yoga.YGNodeStyleSetMarginPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeTop, this.m_styleData.margin.top.value);
            }
            else {
                Yoga.YGNodeStyleSetMargin(this.m_yogaNode, Yoga.YGEdge.YGEdgeTop, this.resolveSize(this.m_styleData.margin.top, types_8.Direction.Vertical));
            }
            if (this.m_styleData.margin.right.unit === style_2.SizeUnit.percent) {
                Yoga.YGNodeStyleSetMarginPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeRight, this.m_styleData.margin.right.value);
            }
            else {
                Yoga.YGNodeStyleSetMargin(this.m_yogaNode, Yoga.YGEdge.YGEdgeRight, this.resolveSize(this.m_styleData.margin.right, types_8.Direction.Horizontal));
            }
            if (this.m_styleData.margin.bottom.unit === style_2.SizeUnit.percent) {
                Yoga.YGNodeStyleSetMarginPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeBottom, this.m_styleData.margin.bottom.value);
            }
            else {
                Yoga.YGNodeStyleSetMargin(this.m_yogaNode, Yoga.YGEdge.YGEdgeBottom, this.resolveSize(this.m_styleData.margin.bottom, types_8.Direction.Vertical));
            }
            if (this.m_styleData.margin.left.unit === style_2.SizeUnit.percent) {
                Yoga.YGNodeStyleSetMarginPercent(this.m_yogaNode, Yoga.YGEdge.YGEdgeLeft, this.m_styleData.margin.left.value);
            }
            else {
                Yoga.YGNodeStyleSetMargin(this.m_yogaNode, Yoga.YGEdge.YGEdgeLeft, this.resolveSize(this.m_styleData.margin.left, types_8.Direction.Horizontal));
            }
        }
        configureOverflow() {
            switch (this.m_styleData.overflow) {
                case style_2.Overflow.Visible:
                    Yoga.YGNodeStyleSetOverflow(this.m_yogaNode, Yoga.YGOverflow.YGOverflowVisible);
                    break;
                case style_2.Overflow.Hidden:
                    Yoga.YGNodeStyleSetOverflow(this.m_yogaNode, Yoga.YGOverflow.YGOverflowHidden);
                    break;
                case style_2.Overflow.Scroll:
                    Yoga.YGNodeStyleSetOverflow(this.m_yogaNode, Yoga.YGOverflow.YGOverflowScroll);
                    break;
            }
        }
        /** @internal */
        configureYogaNode() {
            Yoga.YGNodeStyleSetDisplay(this.m_yogaNode, Yoga.YGDisplay.YGDisplayFlex);
            this.configureDimensions();
            this.configurePositioning();
            this.configureFlex();
            this.configureBorders();
            this.configurePadding();
            this.configureMargin();
            this.configureOverflow();
        }
        /** @internal */
        readLayout() {
            const left = Yoga.YGNodeLayoutGetLeft(this.m_yogaNode);
            const top = Yoga.YGNodeLayoutGetTop(this.m_yogaNode);
            const width = Yoga.YGNodeLayoutGetWidth(this.m_yogaNode);
            const height = Yoga.YGNodeLayoutGetHeight(this.m_yogaNode);
            const topLeftRadius = this.resolveBorderRadius(this.m_styleData.border.topLeftRadius, width, height, types_8.Direction.Horizontal);
            const topRightRadius = this.resolveBorderRadius(this.m_styleData.border.topRightRadius, width, height, types_8.Direction.Horizontal);
            const bottomLeftRadius = this.resolveBorderRadius(this.m_styleData.border.bottomLeftRadius, width, height, types_8.Direction.Horizontal);
            const bottomRightRadius = this.resolveBorderRadius(this.m_styleData.border.bottomRightRadius, width, height, types_8.Direction.Horizontal);
            const paddingLeft = this.resolveSize(this.m_styleData.padding.left, types_8.Direction.Horizontal);
            const paddingRight = this.resolveSize(this.m_styleData.padding.right, types_8.Direction.Horizontal);
            const paddingTop = this.resolveSize(this.m_styleData.padding.top, types_8.Direction.Vertical);
            const paddingBottom = this.resolveSize(this.m_styleData.padding.bottom, types_8.Direction.Vertical);
            const marginLeft = this.resolveSize(this.m_styleData.margin.left, types_8.Direction.Horizontal);
            const marginRight = this.resolveSize(this.m_styleData.margin.right, types_8.Direction.Horizontal);
            const marginTop = this.resolveSize(this.m_styleData.margin.top, types_8.Direction.Vertical);
            const marginBottom = this.resolveSize(this.m_styleData.margin.bottom, types_8.Direction.Vertical);
            this.m_clientRect = {
                x: left,
                y: top,
                top,
                left,
                right: left + width,
                bottom: top + height,
                width,
                height,
                topLeftRadius,
                topRightRadius,
                bottomLeftRadius,
                bottomRightRadius,
                paddingLeft,
                paddingRight,
                paddingTop,
                paddingBottom,
                marginLeft,
                marginRight,
                marginTop,
                marginBottom,
                depth: 0
            };
            if (this.m_parent) {
                switch (this.m_parent.m_styleData.position) {
                    case style_2.Position.Static:
                    case style_2.Position.Relative:
                        const parentRect = this.m_parent.m_clientRect;
                        this.m_clientRect.x += parentRect.x;
                        this.m_clientRect.y += parentRect.y;
                        this.m_clientRect.left += parentRect.x;
                        this.m_clientRect.top += parentRect.y;
                        this.m_clientRect.right += parentRect.x;
                        this.m_clientRect.bottom += parentRect.y;
                        break;
                    default:
                        break;
                }
            }
        }
    }
    exports.Style = Style;
});
define("modules/ui/utils/box-geometry", ["require", "exports", "modules/math-ext/index", "modules/ui/types/index"], function (require, exports, math_ext_7, types_9) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildBoxGeometry = buildBoxGeometry;
    function buildSimpleBoxGeometry(rect, color, inoutGeometry) {
        const { x, y, width, height } = rect;
        const p0 = new math_ext_7.vec4(x, y, 0.1, 0.0);
        const p1 = new math_ext_7.vec4(x + width, y, 0.1, 0.0);
        const p2 = new math_ext_7.vec4(x + width, y + height, 0.1, 0.0);
        const p3 = new math_ext_7.vec4(x, y + height, 0.1, 0.0);
        inoutGeometry.vertices.push(new types_9.Vertex(p0, new math_ext_7.vec4(color.r, color.g, color.b, color.a)));
        inoutGeometry.vertices.push(new types_9.Vertex(p1, new math_ext_7.vec4(color.r, color.g, color.b, color.a)));
        inoutGeometry.vertices.push(new types_9.Vertex(p2, new math_ext_7.vec4(color.r, color.g, color.b, color.a)));
        inoutGeometry.vertices.push(new types_9.Vertex(p0, new math_ext_7.vec4(color.r, color.g, color.b, color.a)));
        inoutGeometry.vertices.push(new types_9.Vertex(p2, new math_ext_7.vec4(color.r, color.g, color.b, color.a)));
        inoutGeometry.vertices.push(new types_9.Vertex(p3, new math_ext_7.vec4(color.r, color.g, color.b, color.a)));
    }
    function buildBoxGeometry(properties) {
        const geometry = {
            type: types_9.GeometryType.Box,
            properties,
            offsetPosition: new math_ext_7.vec4(0, 0, 0, 0),
            vertices: []
        };
        const { rect, color } = properties;
        const tl = rect.topLeftRadius;
        const tr = rect.topRightRadius;
        const bl = rect.bottomLeftRadius;
        const br = rect.bottomRightRadius;
        if (tl === 0 && tr === 0 && bl === 0 && br === 0) {
            buildSimpleBoxGeometry(rect, color, geometry);
            return geometry;
        }
        // Clamp radii to prevent overlapping corners
        const maxRadiusX = rect.width * 0.5;
        const maxRadiusY = rect.height * 0.5;
        const clampedTL = Math.min(tl, maxRadiusX, maxRadiusY);
        const clampedTR = Math.min(tr, maxRadiusX, maxRadiusY);
        const clampedBL = Math.min(bl, maxRadiusX, maxRadiusY);
        const clampedBR = Math.min(br, maxRadiusX, maxRadiusY);
        // Calculate corner centers
        const corners = {
            tl: { x: rect.x + clampedTL, y: rect.y + clampedTL },
            tr: { x: rect.x + rect.width - clampedTR, y: rect.y + clampedTR },
            bl: { x: rect.x + clampedBL, y: rect.y + rect.height - clampedBL },
            br: { x: rect.x + rect.width - clampedBR, y: rect.y + rect.height - clampedBR }
        };
        // Optimized vertex generation - adaptive segments based on radius size
        const getOptimalSegments = (radius) => {
            const arcLength = Math.PI * radius * 0.5;
            return Math.max(Math.floor(arcLength * 0.25), 5);
        };
        // Helper function to generate arc vertices for a corner
        const generateCornerArc = (center, radius, startAngle, endAngle) => {
            const arcVertices = [];
            if (radius > 0) {
                const segments = getOptimalSegments(radius);
                // Always include the start and end points
                for (let i = 0; i <= segments; i++) {
                    const angle = startAngle + (endAngle - startAngle) * (i / segments);
                    arcVertices.push({
                        x: center.x + Math.cos(angle) * radius,
                        y: center.y + Math.sin(angle) * radius
                    });
                }
            }
            else {
                // For zero radius, just add the corner point
                arcVertices.push({ x: center.x, y: center.y });
            }
            return arcVertices;
        };
        // Generate vertices for each corner (clockwise from top-left)
        const tlArc = generateCornerArc(corners.tl, clampedTL, Math.PI, Math.PI * 1.5); // 180° to 270°
        const trArc = generateCornerArc(corners.tr, clampedTR, Math.PI * 1.5, Math.PI * 2); // 270° to 360°
        const brArc = generateCornerArc(corners.br, clampedBR, 0, Math.PI * 0.5); // 0° to 90°
        const blArc = generateCornerArc(corners.bl, clampedBL, Math.PI * 0.5, Math.PI); // 90° to 180°
        // Combine all vertices in order (clockwise)
        // Remove duplicates at corner connections to avoid degenerate triangles
        const allVertices = [];
        // Add top-left arc
        allVertices.push(...tlArc);
        // Add top-right arc (skip first point if it's the same as last TL point)
        const trStart = tlArc.length > 0 &&
            trArc.length > 0 &&
            Math.abs(tlArc[tlArc.length - 1].x - trArc[0].x) < 0.001 &&
            Math.abs(tlArc[tlArc.length - 1].y - trArc[0].y) < 0.001
            ? 1
            : 0;
        allVertices.push(...trArc.slice(trStart));
        // Add bottom-right arc
        const brStart = trArc.length > 0 &&
            brArc.length > 0 &&
            Math.abs(trArc[trArc.length - 1].x - brArc[0].x) < 0.001 &&
            Math.abs(trArc[trArc.length - 1].y - brArc[0].y) < 0.001
            ? 1
            : 0;
        allVertices.push(...brArc.slice(brStart));
        // Add bottom-left arc
        const blStart = brArc.length > 0 &&
            blArc.length > 0 &&
            Math.abs(brArc[brArc.length - 1].x - blArc[0].x) < 0.001 &&
            Math.abs(brArc[brArc.length - 1].y - blArc[0].y) < 0.001
            ? 1
            : 0;
        allVertices.push(...blArc.slice(blStart));
        // Skip duplicate points to prevent degenerate triangles
        if (allVertices.length < 3) {
            buildSimpleBoxGeometry(rect, color, geometry);
            return geometry;
        }
        // Generate triangles using center point (triangle fan approach converted to triangle list)
        const center = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
        const colorVec = new math_ext_7.vec4(color.r, color.g, color.b, color.a);
        // Convert to triangle list (each triangle uses 3 vertices)
        for (let i = 0; i < allVertices.length; i++) {
            const current = allVertices[i];
            const next = allVertices[(i + 1) % allVertices.length];
            // Skip degenerate triangles (points too close together)
            const dx1 = current.x - center.x;
            const dy1 = current.y - center.y;
            const dx2 = next.x - center.x;
            const dy2 = next.y - center.y;
            // Calculate cross product to check if triangle has area
            const crossProduct = dx1 * dy2 - dx2 * dy1;
            if (Math.abs(crossProduct) < 0.001)
                continue; // Skip degenerate triangle
            // Create triangle: center -> current -> next
            geometry.vertices.push(new types_9.Vertex(new math_ext_7.vec4(center.x, center.y, rect.depth, 0.0), colorVec));
            geometry.vertices.push(new types_9.Vertex(new math_ext_7.vec4(current.x, current.y, rect.depth, 0.0), colorVec));
            geometry.vertices.push(new types_9.Vertex(new math_ext_7.vec4(next.x, next.y, rect.depth, 0.0), colorVec));
        }
        return geometry;
    }
});
define("modules/ui/renderer/element", ["require", "exports", "yoga", "modules/event", "math", "modules/ui/types/events", "modules/ui/types/text-node", "modules/ui/types/box-node", "modules/ui/renderer/style", "modules/ui/utils/index", "modules/is-changed", "modules/ui/utils/box-geometry", "modules/math-ext/index"], function (require, exports, Yoga, event_3, math_2, events_1, text_node_1, box_node_1, style_3, utils_3, is_changed_3, box_geometry_1, math_ext_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Element = void 0;
    class Element extends event_3.EventProducer {
        /** @internal */
        constructor(window, source, root, parent, fontManager) {
            var _a;
            super();
            this.m_window = window;
            this.m_source = source;
            this.m_root = root;
            this.m_treeNode = source.node;
            this.m_parent = parent;
            this.m_children = [];
            this.m_yogaNode = Yoga.YGNodeNew();
            this.m_fontManager = fontManager;
            this.m_geometry = null;
            this.m_scrollOffset = new math_ext_8.vec2();
            this.m_contentSize = new math_ext_8.vec2();
            this.m_styleProps = source.style;
            this.m_style = new style_3.Style(this.m_yogaNode, (0, utils_3.getCompleteStyle)((_a = this.m_parent) === null || _a === void 0 ? void 0 : _a.m_styleProps, this.m_styleProps), this.m_parent ? this.m_parent.m_style : null, this.m_root ? this.m_root.m_style : null, this.m_window);
            this.m_rendererState = {
                isHovered: false
            };
            Yoga.YGConfigSetUseWebDefaults(Yoga.YGConfigGetDefault(), true);
            if (this.m_source instanceof text_node_1.TextNode) {
                Yoga.YGNodeSetNodeType(this.m_yogaNode, Yoga.YGNodeType.YGNodeTypeText);
                Yoga.YGNodeSetMeasureFunc(this.m_yogaNode, (width, widthMode, height, heightMode) => {
                    if (!(this.m_source instanceof text_node_1.TextNode))
                        return new math_2.vec2f(0.0, 0.0);
                    let maxWidth = 0.0;
                    let maxHeight = 0.0;
                    switch (widthMode) {
                        case Yoga.YGMeasureMode.YGMeasureModeUndefined:
                            maxWidth = Infinity;
                            break;
                        case Yoga.YGMeasureMode.YGMeasureModeExactly:
                            maxWidth = width;
                            break;
                        case Yoga.YGMeasureMode.YGMeasureModeAtMost:
                            maxWidth = width;
                            break;
                    }
                    switch (heightMode) {
                        case Yoga.YGMeasureMode.YGMeasureModeUndefined:
                            maxHeight = Infinity;
                            break;
                        case Yoga.YGMeasureMode.YGMeasureModeExactly:
                            maxHeight = height;
                            break;
                        case Yoga.YGMeasureMode.YGMeasureModeAtMost:
                            maxHeight = height;
                            break;
                    }
                    const textProperties = utils_3.FontManager.extractTextProperties(this.m_style, maxWidth, maxHeight);
                    const fontFamily = this.m_fontManager.findFontFamily(textProperties);
                    if (!fontFamily) {
                        return new math_2.vec2f(0, 0);
                    }
                    this.m_geometry = fontFamily.createTextGeometry(this.m_source.text, textProperties);
                    return new math_2.vec2f(Math.min(maxWidth, this.m_geometry.width), Math.min(maxHeight, this.m_geometry.height));
                });
            }
            this.bindListeners();
        }
        /** @internal */
        get yogaNode() {
            return this.m_yogaNode;
        }
        /** @internal */
        get treeNode() {
            return this.m_treeNode;
        }
        /** @internal */
        get source() {
            return this.m_source;
        }
        /** @internal */
        get rendererState() {
            return this.m_rendererState;
        }
        get window() {
            return this.m_window;
        }
        get root() {
            return this.m_root;
        }
        get parent() {
            return this.m_parent;
        }
        get children() {
            return Array.from(this.m_children);
        }
        get style() {
            return this.m_style;
        }
        get geometry() {
            return this.m_geometry;
        }
        get scrollOffset() {
            return this.m_scrollOffset;
        }
        set scrollOffset(offset) {
            if (this.m_scrollOffset.x === offset.x && this.m_scrollOffset.y === offset.y)
                return;
            const delta = new math_ext_8.vec2();
            math_ext_8.vec2.sub(delta, offset, this.m_scrollOffset);
            this.dispatch('scroll', new events_1.ScrollEvent(this, delta));
            this.m_scrollOffset = offset;
        }
        get scrollX() {
            return this.m_scrollOffset.x;
        }
        set scrollX(x) {
            if (this.m_scrollOffset.x === x)
                return;
            const delta = new math_ext_8.vec2(x - this.m_scrollOffset.x, 0);
            this.dispatch('scroll', new events_1.ScrollEvent(this, delta));
            this.m_scrollOffset.x = x;
        }
        get scrollY() {
            return this.m_scrollOffset.y;
        }
        set scrollY(y) {
            if (this.m_scrollOffset.y === y)
                return;
            const delta = new math_ext_8.vec2(0, y - this.m_scrollOffset.y);
            this.dispatch('scroll', new events_1.ScrollEvent(this, delta));
            this.m_scrollOffset.y = y;
        }
        get contentSize() {
            return this.m_contentSize;
        }
        /** @internal */
        bindListeners() {
            if (!(this.m_source instanceof box_node_1.BoxNode))
                return;
            this.addListener('click', e => {
                const props = this.m_source.node.props;
                if (props.onClick) {
                    props.onClick(e);
                }
            });
            this.addListener('mousedown', e => {
                const props = this.m_source.node.props;
                if (props.onMouseDown) {
                    props.onMouseDown(e);
                }
            });
            this.addListener('mouseup', e => {
                const props = this.m_source.node.props;
                if (props.onMouseUp) {
                    props.onMouseUp(e);
                }
            });
            this.addListener('mouseenter', e => {
                const props = this.m_source.node.props;
                if (props.onMouseEnter) {
                    props.onMouseEnter(e);
                }
            });
            this.addListener('mouseleave', e => {
                const props = this.m_source.node.props;
                if (props.onMouseLeave) {
                    props.onMouseLeave(e);
                }
            });
            this.addListener('mousemove', e => {
                const props = this.m_source.node.props;
                if (props.onMouseMove) {
                    props.onMouseMove(e);
                }
            });
            this.addListener('mouseout', e => {
                const props = this.m_source.node.props;
                if (props.onMouseOut) {
                    props.onMouseOut(e);
                }
            });
            this.addListener('mouseover', e => {
                const props = this.m_source.node.props;
                if (props.onMouseOver) {
                    props.onMouseOver(e);
                }
            });
            this.addListener('scroll', e => {
                const props = this.m_source.node.props;
                if (props.onScroll) {
                    props.onScroll(e);
                }
            });
            this.addListener('mousewheel', e => {
                const props = this.m_source.node.props;
                if (props.onMouseWheel) {
                    props.onMouseWheel(e);
                }
            });
            this.addListener('keydown', e => {
                const props = this.m_source.node.props;
                if (props.onKeyDown) {
                    props.onKeyDown(e);
                }
            });
            this.addListener('keyup', e => {
                const props = this.m_source.node.props;
                if (props.onKeyUp) {
                    props.onKeyUp(e);
                }
            });
            this.addListener('focus', e => {
                const props = this.m_source.node.props;
                if (props.onFocus) {
                    props.onFocus(e);
                }
            });
            this.addListener('blur', e => {
                const props = this.m_source.node.props;
                if (props.onBlur) {
                    props.onBlur(e);
                }
            });
            this.addListener('resize', e => {
                const props = this.m_source.node.props;
                if (props.onResize) {
                    props.onResize(e);
                }
            });
        }
        /** @internal */
        static __internal_setChildren(parent, children) {
            for (const child of parent.m_children) {
                if (children.findIndex(c => c === child) === -1) {
                    // node was removed
                    Yoga.YGNodeFreeRecursive(child.m_yogaNode);
                }
            }
            parent.m_children = children;
            Yoga.YGNodeSetChildren(parent.m_yogaNode, children.map(c => c.m_yogaNode));
        }
        /** @internal */
        static __internal_updateElement(element, newSource) {
            var _a;
            const prevSource = element.m_source;
            element.m_source = newSource;
            element.m_styleProps = newSource.style;
            const s = (0, utils_3.getCompleteStyle)((_a = element.m_parent) === null || _a === void 0 ? void 0 : _a.m_styleProps, element.m_source.style);
            element.m_style.minHeight = s.minHeight;
            element.m_style.minWidth = s.minWidth;
            element.m_style.maxHeight = s.maxHeight;
            element.m_style.maxWidth = s.maxWidth;
            element.m_style.width = s.width;
            element.m_style.height = s.height;
            element.m_style.position = s.position;
            element.m_style.top = s.top;
            element.m_style.right = s.right;
            element.m_style.bottom = s.bottom;
            element.m_style.left = s.left;
            element.m_style.zIndex = s.zIndex;
            element.m_style.flexDirection = s.flex.direction;
            element.m_style.justifyContent = s.flex.justifyContent;
            element.m_style.alignItems = s.flex.alignItems;
            element.m_style.flexWrap = s.flex.wrap;
            element.m_style.flexGrow = s.flex.grow;
            element.m_style.flexShrink = s.flex.shrink;
            element.m_style.flexBasis = s.flex.basis;
            element.m_style.gap = s.flex.gap;
            element.m_style.lineHeight = s.lineHeight;
            element.m_style.letterSpacing = s.letterSpacing;
            element.m_style.fontSize = s.fontSize;
            element.m_style.fontWeight = s.fontWeight;
            element.m_style.fontFamily = s.fontFamily;
            element.m_style.fontStyle = s.fontStyle;
            element.m_style.textAlign = s.textAlign;
            element.m_style.textDecoration = s.textDecoration;
            element.m_style.whiteSpace = s.whiteSpace;
            element.m_style.wordBreak = s.wordBreak;
            element.m_style.wordWrap = s.wordWrap;
            element.m_style.overflow = s.overflow;
            element.m_style.textOverflow = s.textOverflow;
            element.m_style.color = s.color;
            element.m_style.backgroundColor = s.backgroundColor;
            element.m_style.borderWidth = s.border.width;
            element.m_style.borderColor = s.border.color;
            element.m_style.borderStyle = s.border.style;
            element.m_style.borderRadius = s.border.topLeftRadius;
            element.m_style.borderTopLeftRadius = s.border.topLeftRadius;
            element.m_style.borderTopRightRadius = s.border.topRightRadius;
            element.m_style.borderBottomLeftRadius = s.border.bottomLeftRadius;
            element.m_style.borderBottomRightRadius = s.border.bottomRightRadius;
            element.m_style.marginLeft = s.margin.left;
            element.m_style.marginRight = s.margin.right;
            element.m_style.marginTop = s.margin.top;
            element.m_style.marginBottom = s.margin.bottom;
            element.m_style.paddingLeft = s.padding.left;
            element.m_style.paddingRight = s.padding.right;
            element.m_style.paddingTop = s.padding.top;
            element.m_style.paddingBottom = s.padding.bottom;
            if (newSource instanceof text_node_1.TextNode && prevSource instanceof text_node_1.TextNode) {
                const geometry = element.m_geometry;
                let maxWidth = element.m_style.clientRect.width;
                let maxHeight = element.m_style.clientRect.height;
                if (geometry) {
                    maxWidth = geometry.textProperties.maxWidth;
                    maxHeight = geometry.textProperties.maxHeight;
                }
                const textProperties = utils_3.FontManager.extractTextProperties(element.m_style, maxWidth, maxHeight);
                if (geometry && (0, is_changed_3.isChanged)(geometry.textProperties, textProperties)) {
                    Yoga.YGNodeMarkDirty(element.m_yogaNode);
                }
                else {
                    Yoga.YGNodeMarkDirty(element.m_yogaNode);
                }
            }
        }
        /** @internal */
        static __internal_afterLayout(element) {
            if (element.m_source instanceof box_node_1.BoxNode) {
                const boxProps = {
                    rect: element.m_style.clientRect,
                    borderWidth: element.m_style.resolveBorderWidth(element.m_style.borderWidth),
                    borderColor: element.m_style.borderColor,
                    style: element.m_style.borderStyle,
                    color: element.m_style.backgroundColor
                };
                const geometry = element.m_geometry;
                if (!geometry || (0, is_changed_3.isChanged)(boxProps, geometry.properties)) {
                    element.m_geometry = (0, box_geometry_1.buildBoxGeometry)(boxProps);
                }
            }
            let contentWidth = 0.0;
            let contentHeight = 0.0;
            for (const child of element.m_children) {
                Element.__internal_afterLayout(child);
                const { x, y, width, height } = child.m_style.clientRect;
                contentWidth = Math.max(contentWidth, x + width);
                contentHeight = Math.max(contentHeight, y + height);
            }
            const { paddingLeft, paddingRight, paddingTop, paddingBottom } = element.m_style.clientRect;
            element.m_contentSize.x = contentWidth + paddingLeft + paddingRight;
            element.m_contentSize.y = contentHeight + paddingTop + paddingBottom;
        }
    }
    exports.Element = Element;
});
define("modules/ui/types/events", ["require", "exports", "modules/math-ext/index"], function (require, exports, math_ext_9) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ResizeEvent = exports.KeyboardEvent = exports.ScrollEvent = exports.WheelEvent = exports.MouseEvent = exports.UIEvent = void 0;
    class UIEvent {
        constructor(target) {
            this.m_target = target;
            this.m_defaultPrevented = false;
            this.m_propagationStopped = false;
        }
        get target() {
            return this.m_target;
        }
        get defaultPrevented() {
            return this.m_defaultPrevented;
        }
        get propagationStopped() {
            return this.m_propagationStopped;
        }
        preventDefault() {
            this.m_defaultPrevented = true;
        }
        stopPropagation() {
            this.m_propagationStopped = true;
        }
        toString() {
            var _a;
            return `UIEvent { target: ${((_a = this.m_target) === null || _a === void 0 ? void 0 : _a.source.node) || 'null'} }`;
        }
    }
    exports.UIEvent = UIEvent;
    class MouseEvent extends UIEvent {
        constructor(target, relativePosition, absolutePosition, deltaPosition, shiftKey, ctrlKey, altKey, button) {
            super(target);
            this.m_relativePosition = relativePosition;
            this.m_absolutePosition = absolutePosition;
            this.m_deltaPosition = deltaPosition;
            this.m_shiftKey = shiftKey;
            this.m_ctrlKey = ctrlKey;
            this.m_altKey = altKey;
            this.m_button = button;
        }
        get relativePosition() {
            return this.m_relativePosition;
        }
        get absolutePosition() {
            return this.m_absolutePosition;
        }
        get deltaPosition() {
            return this.m_deltaPosition;
        }
        get shiftKey() {
            return this.m_shiftKey;
        }
        get ctrlKey() {
            return this.m_ctrlKey;
        }
        get altKey() {
            return this.m_altKey;
        }
        get button() {
            return this.m_button;
        }
        toString() {
            return `MouseEvent { relativePosition: ${this.m_relativePosition}, absolutePosition: ${this.m_absolutePosition}, deltaPosition: ${this.m_deltaPosition}, shiftKey: ${this.m_shiftKey ? 'true' : 'false'}, ctrlKey: ${this.m_ctrlKey ? 'true' : 'false'}, altKey: ${this.m_altKey ? 'true' : 'false'}, button: ${this.m_button} }`;
        }
    }
    exports.MouseEvent = MouseEvent;
    class WheelEvent extends UIEvent {
        constructor(target, delta, shiftKey, ctrlKey, altKey) {
            super(target);
            this.m_delta = delta;
            this.m_shiftKey = shiftKey;
            this.m_ctrlKey = ctrlKey;
            this.m_altKey = altKey;
        }
        get delta() {
            return this.m_delta;
        }
        get shiftKey() {
            return this.m_shiftKey;
        }
        get ctrlKey() {
            return this.m_ctrlKey;
        }
        get altKey() {
            return this.m_altKey;
        }
        toString() {
            return `WheelEvent { delta: ${this.m_delta}, shiftKey: ${this.m_shiftKey ? 'true' : 'false'}, ctrlKey: ${this.m_ctrlKey ? 'true' : 'false'}, altKey: ${this.m_altKey ? 'true' : 'false'} }`;
        }
    }
    exports.WheelEvent = WheelEvent;
    class ScrollEvent extends UIEvent {
        constructor(target, delta) {
            super(target);
            this.m_delta = delta;
        }
        get delta() {
            return this.m_delta;
        }
        toString() {
            return `ScrollEvent { delta: ${this.m_delta} }`;
        }
    }
    exports.ScrollEvent = ScrollEvent;
    class KeyboardEvent extends UIEvent {
        constructor(target, key, char, shiftKey, ctrlKey, altKey, repeat) {
            super(target);
            this.m_key = key;
            this.m_char = char;
            this.m_shiftKey = shiftKey;
            this.m_ctrlKey = ctrlKey;
            this.m_altKey = altKey;
            this.m_repeat = repeat;
        }
        get key() {
            return this.m_key;
        }
        get char() {
            return this.m_char;
        }
        get shiftKey() {
            return this.m_shiftKey;
        }
        get ctrlKey() {
            return this.m_ctrlKey;
        }
        get altKey() {
            return this.m_altKey;
        }
        get repeat() {
            return this.m_repeat;
        }
        toString() {
            return `KeyboardEvent { key: ${this.m_key}, char: '${this.m_char}', shiftKey: ${this.m_shiftKey ? 'true' : 'false'}, ctrlKey: ${this.m_ctrlKey ? 'true' : 'false'}, altKey: ${this.m_altKey ? 'true' : 'false'}, repeat: ${this.m_repeat ? 'true' : 'false'} }`;
        }
    }
    exports.KeyboardEvent = KeyboardEvent;
    class ResizeEvent extends UIEvent {
        constructor(target, width, height, prevWidth, prevHeight) {
            super(target);
            this.m_width = width;
            this.m_height = height;
            this.m_prevWidth = prevWidth;
            this.m_prevHeight = prevHeight;
        }
        get size() {
            return new math_ext_9.vec2(this.m_width, this.m_height);
        }
        get prevSize() {
            return new math_ext_9.vec2(this.m_prevWidth, this.m_prevHeight);
        }
        get deltaSize() {
            return new math_ext_9.vec2(this.m_width - this.m_prevWidth, this.m_height - this.m_prevHeight);
        }
        get width() {
            return this.m_width;
        }
        get height() {
            return this.m_height;
        }
        get prevWidth() {
            return this.m_prevWidth;
        }
        get prevHeight() {
            return this.m_prevHeight;
        }
        get deltaWidth() {
            return this.m_width - this.m_prevWidth;
        }
        get deltaHeight() {
            return this.m_height - this.m_prevHeight;
        }
        toString() {
            return `ResizeEvent { width: ${this.m_width}, height: ${this.m_height}, prevWidth: ${this.m_prevWidth}, prevHeight: ${this.m_prevHeight} }`;
        }
    }
    exports.ResizeEvent = ResizeEvent;
});
define("modules/ui/types/elements", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("modules/ui/types/root-node", ["require", "exports", "modules/ui/types/ui-node"], function (require, exports, ui_node_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RootNode = void 0;
    /** @internal */
    class RootNode extends ui_node_3.UINode {
        /** @internal */
        constructor(node) {
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
    exports.RootNode = RootNode;
});
define("modules/ui/types/index", ["require", "exports", "modules/ui/types/style", "modules/ui/types/elements", "modules/ui/types/events", "modules/ui/types/ui-node", "modules/ui/types/box-node", "modules/ui/types/text-node", "modules/ui/types/root-node", "modules/ui/types/vertex", "modules/ui/types/geometry"], function (require, exports, style_4, elements_1, events_2, ui_node_4, box_node_2, text_node_2, root_node_1, vertex_1, geometry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Direction = void 0;
    __exportStar(style_4, exports);
    __exportStar(elements_1, exports);
    __exportStar(events_2, exports);
    __exportStar(ui_node_4, exports);
    __exportStar(box_node_2, exports);
    __exportStar(text_node_2, exports);
    __exportStar(root_node_1, exports);
    __exportStar(vertex_1, exports);
    __exportStar(geometry_1, exports);
    var Direction;
    (function (Direction) {
        Direction[Direction["Horizontal"] = 0] = "Horizontal";
        Direction[Direction["Vertical"] = 1] = "Vertical";
    })(Direction || (exports.Direction = Direction = {}));
});
define("modules/ui/components/box", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Box = void 0;
    const Box = props => {
        return props.children;
    };
    exports.Box = Box;
});
define("modules/ui/components/index", ["require", "exports", "modules/ui/components/box"], function (require, exports, box_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(box_1, exports);
});
define("modules/ui/renderer/tree-recurse", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IElementRecursion = void 0;
    class IElementRecursion {
        constructor() {
            this.m_elementStack = [];
        }
        get currentElement() {
            if (this.m_elementStack.length === 0)
                return null;
            return this.m_elementStack[this.m_elementStack.length - 1];
        }
        begin(element) {
            this.m_elementStack.push(element);
        }
        end() {
            this.m_elementStack.pop();
        }
    }
    exports.IElementRecursion = IElementRecursion;
});
define("modules/ui/renderer/generator", ["require", "exports", "modules/ui/renderer/element", "modules/ui/renderer/tree-recurse"], function (require, exports, element_2, tree_recurse_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TreeGenerator = void 0;
    class TreeGenerator extends tree_recurse_1.IElementRecursion {
        constructor(window, fontManager) {
            super();
            this.m_window = window;
            this.m_root = null;
            this.m_createdElements = [];
            this.m_fontManager = fontManager;
        }
        getOrCreateElement(src) {
            const currentElement = this.currentElement;
            let selfElement = null;
            if (currentElement) {
                for (const child of currentElement.children) {
                    if (child.treeNode === src.node) {
                        selfElement = child;
                        break;
                    }
                }
            }
            else if (this.m_root) {
                if (this.m_root.treeNode === src.node) {
                    selfElement = this.m_root;
                }
                else {
                    this.m_root = null;
                }
            }
            if (!selfElement) {
                selfElement = new element_2.Element(this.m_window, src, this.m_root, currentElement, this.m_fontManager);
                this.m_createdElements.push(selfElement);
                if (!this.m_root) {
                    this.m_root = selfElement;
                }
            }
            else {
                element_2.Element.__internal_updateElement(selfElement, src);
            }
            return selfElement;
        }
        generateTree(src) {
            const node = this.getOrCreateElement(src);
            this.begin(node);
            const children = [];
            for (const child of src.children) {
                const childNode = this.generateTree(child);
                children.push(childNode);
            }
            element_2.Element.__internal_setChildren(node, children);
            this.end();
            return node;
        }
        handleCreatedElements() {
            for (const element of this.m_createdElements) {
                if (element.treeNode.props.ref) {
                    if (typeof element.treeNode.props.ref === 'function') {
                        try {
                            element.treeNode.props.ref(element);
                        }
                        catch (error) {
                            console.error('Failed to call ref function');
                            console.error(error);
                            element.treeNode.printNodeStack();
                        }
                    }
                    else {
                        element.treeNode.props.ref.current = element;
                    }
                }
            }
        }
        generate(srcRoot) {
            this.m_createdElements = [];
            const genRoot = this.generateTree(srcRoot);
            this.handleCreatedElements();
            return genRoot;
        }
    }
    exports.TreeGenerator = TreeGenerator;
});
define("modules/ui/renderer/layout", ["require", "exports", "yoga", "modules/ui/renderer/tree-recurse", "modules/ui/utils/index", "modules/ui/types/events"], function (require, exports, Yoga, tree_recurse_2, utils_4, events_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LayoutEngine = void 0;
    class LayoutEngine extends tree_recurse_2.IElementRecursion {
        constructor(window, root) {
            super();
            this.m_window = window;
            this.m_root = root;
        }
        updateProportionateSizes(node) {
            for (const child of node.children) {
                this.updateProportionateSizes(child);
            }
        }
        readLayout(node) {
            const prevWidth = node.style.clientRect.width;
            const prevHeight = node.style.clientRect.height;
            node.style.readLayout();
            for (const child of node.children) {
                this.readLayout(child);
            }
            const newWidth = node.style.clientRect.width;
            const newHeight = node.style.clientRect.height;
            if (newWidth !== prevWidth || newHeight !== prevHeight) {
                node.dispatch('resize', new events_3.ResizeEvent(node, newWidth, newHeight, prevWidth, prevHeight));
            }
        }
        printNode(node, indent) {
            const str = ' '.repeat(indent) + node.treeNode.displayName + ' ' + JSON.stringify(node.style.clientRect);
            console.log(str);
            for (const child of node.children) {
                this.printNode(child, indent + 2);
            }
        }
        execute() {
            if (!this.m_window.isOpen)
                return;
            const windowSize = this.m_window.getSize();
            this.m_root.style.width = (0, utils_4.px)(windowSize.x);
            this.m_root.style.minWidth = (0, utils_4.px)(windowSize.x);
            this.m_root.style.maxWidth = (0, utils_4.px)(windowSize.x);
            this.m_root.style.height = (0, utils_4.px)(windowSize.y);
            this.m_root.style.minHeight = (0, utils_4.px)(windowSize.y);
            this.m_root.style.maxHeight = (0, utils_4.px)(windowSize.y);
            this.updateProportionateSizes(this.m_root);
            Yoga.YGNodeCalculateLayout(this.m_root.yogaNode, windowSize.x, windowSize.y, Yoga.YGDirection.YGDirectionLTR);
            this.readLayout(this.m_root);
            // this.printNode(this.m_root, 0);
        }
    }
    exports.LayoutEngine = LayoutEngine;
});
define("modules/ui/utils/event-mgr", ["require", "exports", "modules/math-ext/index", "modules/ui/types/style", "modules/ui/types/events"], function (require, exports, math_ext_10, style_5, events_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UIEventManager = void 0;
    function pointInClipRect(pos, rect) {
        if (pos.x < rect.left || pos.x > rect.right)
            return false;
        if (pos.y < rect.top || pos.y > rect.bottom)
            return false;
        const inTopLeft = pos.x < rect.left + rect.topLeftRadius && pos.y < rect.top + rect.topLeftRadius;
        const inTopRight = pos.x > rect.right - rect.topRightRadius && pos.y < rect.top + rect.topRightRadius;
        const inBottomRight = pos.x > rect.right - rect.bottomRightRadius && pos.y > rect.bottom - rect.bottomRightRadius;
        const inBottomLeft = pos.x < rect.left + rect.bottomLeftRadius && pos.y > rect.bottom - rect.bottomLeftRadius;
        if (inTopLeft && rect.topLeftRadius > 0.0) {
            const center = new math_ext_10.vec2(rect.left + rect.topLeftRadius, rect.top + rect.topLeftRadius);
            const diff = new math_ext_10.vec2();
            math_ext_10.vec2.sub(diff, pos, center);
            if (diff.lengthSq > rect.topLeftRadius * rect.topLeftRadius)
                return false;
        }
        else if (inTopRight && rect.topRightRadius > 0.0) {
            const center = new math_ext_10.vec2(rect.right - rect.topRightRadius, rect.top + rect.topRightRadius);
            const diff = new math_ext_10.vec2();
            math_ext_10.vec2.sub(diff, pos, center);
            if (diff.lengthSq > rect.topRightRadius * rect.topRightRadius)
                return false;
        }
        else if (inBottomRight && rect.bottomRightRadius > 0.0) {
            const center = new math_ext_10.vec2(rect.right - rect.bottomRightRadius, rect.bottom - rect.bottomRightRadius);
            const diff = new math_ext_10.vec2();
            math_ext_10.vec2.sub(diff, pos, center);
            if (diff.lengthSq > rect.bottomRightRadius * rect.bottomRightRadius)
                return false;
        }
        else if (inBottomLeft && rect.bottomLeftRadius > 0.0) {
            const center = new math_ext_10.vec2(rect.left + rect.bottomLeftRadius, rect.bottom - rect.bottomLeftRadius);
            const diff = new math_ext_10.vec2();
            math_ext_10.vec2.sub(diff, pos, center);
            if (diff.lengthSq > rect.bottomLeftRadius * rect.bottomLeftRadius)
                return false;
        }
        return true;
    }
    const KeyMap = {
        [KeyboardKey.None]: '',
        [KeyboardKey._0]: '0',
        [KeyboardKey._1]: '1',
        [KeyboardKey._2]: '2',
        [KeyboardKey._3]: '3',
        [KeyboardKey._4]: '4',
        [KeyboardKey._5]: '5',
        [KeyboardKey._6]: '6',
        [KeyboardKey._7]: '7',
        [KeyboardKey._8]: '8',
        [KeyboardKey._9]: '9',
        [KeyboardKey.A]: 'a',
        [KeyboardKey.B]: 'b',
        [KeyboardKey.C]: 'c',
        [KeyboardKey.D]: 'd',
        [KeyboardKey.E]: 'e',
        [KeyboardKey.F]: 'f',
        [KeyboardKey.G]: 'g',
        [KeyboardKey.H]: 'h',
        [KeyboardKey.I]: 'i',
        [KeyboardKey.J]: 'j',
        [KeyboardKey.K]: 'k',
        [KeyboardKey.L]: 'l',
        [KeyboardKey.M]: 'm',
        [KeyboardKey.N]: 'n',
        [KeyboardKey.O]: 'o',
        [KeyboardKey.P]: 'p',
        [KeyboardKey.Q]: 'q',
        [KeyboardKey.R]: 'r',
        [KeyboardKey.S]: 's',
        [KeyboardKey.T]: 't',
        [KeyboardKey.U]: 'u',
        [KeyboardKey.V]: 'v',
        [KeyboardKey.W]: 'w',
        [KeyboardKey.X]: 'x',
        [KeyboardKey.Y]: 'y',
        [KeyboardKey.Z]: 'z',
        [KeyboardKey.SingleQuote]: "'",
        [KeyboardKey.Backslash]: '\\',
        [KeyboardKey.Comma]: ',',
        [KeyboardKey.Equal]: '=',
        [KeyboardKey.Backtick]: '`',
        [KeyboardKey.LeftBracket]: '[',
        [KeyboardKey.Minus]: '-',
        [KeyboardKey.Period]: '.',
        [KeyboardKey.RightBracket]: ']',
        [KeyboardKey.Semicolon]: ';',
        [KeyboardKey.Slash]: '/',
        [KeyboardKey.Backspace]: '',
        [KeyboardKey.Delete]: '',
        [KeyboardKey.End]: '',
        [KeyboardKey.Enter]: '\n',
        [KeyboardKey.Escape]: '',
        [KeyboardKey.GraveAccent]: '`',
        [KeyboardKey.Home]: '',
        [KeyboardKey.Insert]: '',
        [KeyboardKey.Menu]: '',
        [KeyboardKey.PageDown]: '',
        [KeyboardKey.PageUp]: '',
        [KeyboardKey.Pause]: '',
        [KeyboardKey.Space]: '',
        [KeyboardKey.Tab]: '\t',
        [KeyboardKey.CapLock]: '',
        [KeyboardKey.NumLock]: '',
        [KeyboardKey.ScrollLock]: '',
        [KeyboardKey.F1]: '',
        [KeyboardKey.F2]: '',
        [KeyboardKey.F3]: '',
        [KeyboardKey.F4]: '',
        [KeyboardKey.F5]: '',
        [KeyboardKey.F6]: '',
        [KeyboardKey.F7]: '',
        [KeyboardKey.F8]: '',
        [KeyboardKey.F9]: '',
        [KeyboardKey.F10]: '',
        [KeyboardKey.F11]: '',
        [KeyboardKey.F12]: '',
        [KeyboardKey.F13]: '',
        [KeyboardKey.F14]: '',
        [KeyboardKey.F15]: '',
        [KeyboardKey.F16]: '',
        [KeyboardKey.F17]: '',
        [KeyboardKey.F18]: '',
        [KeyboardKey.F19]: '',
        [KeyboardKey.F20]: '',
        [KeyboardKey.F21]: '',
        [KeyboardKey.F22]: '',
        [KeyboardKey.F23]: '',
        [KeyboardKey.F24]: '',
        [KeyboardKey.LeftAlt]: '',
        [KeyboardKey.LeftControl]: '',
        [KeyboardKey.LeftShift]: '',
        [KeyboardKey.LeftSuper]: '',
        [KeyboardKey.PrintScreen]: '',
        [KeyboardKey.RightAlt]: '',
        [KeyboardKey.RightControl]: '',
        [KeyboardKey.RightShift]: '',
        [KeyboardKey.RightSuper]: '',
        [KeyboardKey.Down]: '',
        [KeyboardKey.Left]: '',
        [KeyboardKey.Right]: '',
        [KeyboardKey.Up]: '',
        [KeyboardKey.Numpad0]: '0',
        [KeyboardKey.Numpad1]: '1',
        [KeyboardKey.Numpad2]: '2',
        [KeyboardKey.Numpad3]: '3',
        [KeyboardKey.Numpad4]: '4',
        [KeyboardKey.Numpad5]: '5',
        [KeyboardKey.Numpad6]: '6',
        [KeyboardKey.Numpad7]: '7',
        [KeyboardKey.Numpad8]: '8',
        [KeyboardKey.Numpad9]: '9',
        [KeyboardKey.NumpadAdd]: '+',
        [KeyboardKey.NumpadDecimal]: '.',
        [KeyboardKey.NumpadDivide]: '/',
        [KeyboardKey.NumpadEnter]: '\n',
        [KeyboardKey.NumpadEqual]: '=',
        [KeyboardKey.NumpadMultiply]: '*',
        [KeyboardKey.NumpadSubtract]: '-'
    };
    class UIEventManager {
        constructor(window) {
            this.m_window = window;
            this.m_tree = null;
            this.m_lastElementBelowCursor = null;
            this.m_focusedElement = null;
            this.m_keysDown = new Set();
            this.m_mouseButtonsDown = new Set();
            this.m_cursorPosition = new math_ext_10.vec2();
            this.m_mouseMoveListener = null;
            this.m_mouseDownListener = null;
            this.m_mouseUpListener = null;
            this.m_keyDownListener = null;
            this.m_keyUpListener = null;
            this.m_scrollListener = null;
        }
        init() {
            this.m_window.onMouseMove(this.onMouseMove.bind(this));
            this.m_window.onMouseDown(this.onMouseDown.bind(this));
            this.m_window.onMouseUp(this.onMouseUp.bind(this));
            this.m_window.onKeyDown(this.onKeyDown.bind(this));
            this.m_window.onKeyUp(this.onKeyUp.bind(this));
            this.m_window.onScroll(this.onScroll.bind(this));
        }
        shutdown() {
            if (this.m_mouseMoveListener) {
                this.m_window.offMouseMove(this.m_mouseMoveListener);
                this.m_mouseMoveListener = null;
            }
            if (this.m_mouseDownListener) {
                this.m_window.offMouseDown(this.m_mouseDownListener);
                this.m_mouseDownListener = null;
            }
            if (this.m_mouseUpListener) {
                this.m_window.offMouseUp(this.m_mouseUpListener);
                this.m_mouseUpListener = null;
            }
            if (this.m_keyDownListener) {
                this.m_window.offKeyDown(this.m_keyDownListener);
                this.m_keyDownListener = null;
            }
            if (this.m_keyUpListener) {
                this.m_window.offKeyUp(this.m_keyUpListener);
                this.m_keyUpListener = null;
            }
        }
        setTreeRoot(root) {
            if (root === this.m_tree)
                return;
            this.m_tree = root;
        }
        elementAt(pos, currentNode) {
            if (!currentNode)
                currentNode = this.m_tree;
            let isInSelf = false;
            if (pointInClipRect(pos, currentNode.style.clientRect)) {
                isInSelf = true;
            }
            else if (currentNode.style.overflow !== style_5.Overflow.Visible) {
                // None of element's children will be visible at this position,
                // we can skip them
                return null;
            }
            for (const child of currentNode.children) {
                const result = this.elementAt(pos, child);
                if (result)
                    return result;
            }
            return isInSelf ? currentNode : null;
        }
        getRelativePos(element, absPos) {
            const relPos = new math_ext_10.vec2();
            const elePos = new math_ext_10.vec2(element.style.clientRect.x, element.style.clientRect.y);
            math_ext_10.vec2.sub(relPos, absPos, elePos);
            return relPos;
        }
        getDeltaPos(absPos) {
            const deltaPos = new math_ext_10.vec2();
            math_ext_10.vec2.sub(deltaPos, absPos, this.m_cursorPosition);
            return deltaPos;
        }
        propagate(element, event, callback) {
            callback(element);
            if (event.propagationStopped || !element.parent)
                return;
            this.propagate(element.parent, event, callback);
        }
        blurElement() {
            if (!this.m_focusedElement)
                return;
            this.m_focusedElement.dispatch('blur', new events_4.UIEvent(this.m_focusedElement));
            this.m_focusedElement = null;
        }
        focusElement(element) {
            if (this.m_focusedElement === element)
                return;
            this.blurElement();
            this.m_focusedElement = element;
            element.dispatch('focus', new events_4.UIEvent(element));
        }
        onMouseMove(x, y) {
            const pos = new math_ext_10.vec2(x, y);
            const deltaPos = this.getDeltaPos(pos);
            this.m_cursorPosition.x = x;
            this.m_cursorPosition.y = y;
            if (!this.m_tree)
                return;
            const element = this.elementAt(pos) || this.m_tree;
            const relPos = this.getRelativePos(element, pos);
            const shiftKey = this.m_keysDown.has(KeyboardKey.LeftShift) || this.m_keysDown.has(KeyboardKey.RightShift);
            const ctrlKey = this.m_keysDown.has(KeyboardKey.LeftControl) || this.m_keysDown.has(KeyboardKey.RightControl);
            const altKey = this.m_keysDown.has(KeyboardKey.LeftAlt) || this.m_keysDown.has(KeyboardKey.RightAlt);
            if (this.m_lastElementBelowCursor && element !== this.m_lastElementBelowCursor) {
                this.m_lastElementBelowCursor.rendererState.isHovered = false;
                const relPos = this.getRelativePos(this.m_lastElementBelowCursor, pos);
                const mouseLeave = new events_4.MouseEvent(this.m_lastElementBelowCursor, relPos, pos, deltaPos, shiftKey, ctrlKey, altKey, null);
                this.m_lastElementBelowCursor.dispatch('mouseleave', mouseLeave);
                const mouseOut = new events_4.MouseEvent(this.m_lastElementBelowCursor, relPos, pos, deltaPos, shiftKey, ctrlKey, altKey, null);
                this.propagate(this.m_lastElementBelowCursor, mouseOut, e => e.dispatch('mouseout', mouseOut));
                this.m_lastElementBelowCursor = null;
            }
            if (element !== this.m_lastElementBelowCursor) {
                this.m_lastElementBelowCursor = element;
                element.rendererState.isHovered = true;
                const mouseEnter = new events_4.MouseEvent(element, relPos, pos, deltaPos, shiftKey, ctrlKey, altKey, null);
                element.dispatch('mouseenter', mouseEnter);
                const mouseOver = new events_4.MouseEvent(element, relPos, pos, deltaPos, shiftKey, ctrlKey, altKey, null);
                this.propagate(element, mouseOver, e => e.dispatch('mouseover', mouseOver));
            }
            const event = new events_4.MouseEvent(element, relPos, pos, deltaPos, shiftKey, ctrlKey, altKey, null);
            this.propagate(element, event, e => e.dispatch('mousemove', event));
        }
        onMouseDown(button) {
            this.m_mouseButtonsDown.add(button);
            if (!this.m_tree)
                return;
            const shiftKey = this.m_keysDown.has(KeyboardKey.LeftShift) || this.m_keysDown.has(KeyboardKey.RightShift);
            const ctrlKey = this.m_keysDown.has(KeyboardKey.LeftControl) || this.m_keysDown.has(KeyboardKey.RightControl);
            const altKey = this.m_keysDown.has(KeyboardKey.LeftAlt) || this.m_keysDown.has(KeyboardKey.RightAlt);
            const element = this.elementAt(this.m_cursorPosition) || this.m_tree;
            const relPos = this.getRelativePos(element, this.m_cursorPosition);
            const deltaPos = new math_ext_10.vec2();
            const event = new events_4.MouseEvent(element, relPos, this.m_cursorPosition, deltaPos, shiftKey, ctrlKey, altKey, button);
            this.propagate(element, event, e => e.dispatch('mousedown', event));
            if (!event.defaultPrevented)
                this.focusElement(element);
        }
        onMouseUp(button) {
            this.m_mouseButtonsDown.delete(button);
            if (!this.m_tree)
                return;
            const shiftKey = this.m_keysDown.has(KeyboardKey.LeftShift) || this.m_keysDown.has(KeyboardKey.RightShift);
            const ctrlKey = this.m_keysDown.has(KeyboardKey.LeftControl) || this.m_keysDown.has(KeyboardKey.RightControl);
            const altKey = this.m_keysDown.has(KeyboardKey.LeftAlt) || this.m_keysDown.has(KeyboardKey.RightAlt);
            const element = this.elementAt(this.m_cursorPosition) || this.m_tree;
            const relPos = this.getRelativePos(element, this.m_cursorPosition);
            const deltaPos = new math_ext_10.vec2();
            const event = new events_4.MouseEvent(element, relPos, this.m_cursorPosition, deltaPos, shiftKey, ctrlKey, altKey, button);
            this.propagate(element, event, e => e.dispatch('mouseup', event));
            if (event.defaultPrevented)
                return;
            if (button === MouseButton.Left) {
                const click = new events_4.MouseEvent(element, relPos, this.m_cursorPosition, deltaPos, shiftKey, ctrlKey, altKey, button);
                this.propagate(element, click, e => e.dispatch('click', click));
            }
        }
        onKeyDown(key) {
            this.m_keysDown.add(key);
            if (!this.m_tree)
                return;
            const shiftKey = this.m_keysDown.has(KeyboardKey.LeftShift) || this.m_keysDown.has(KeyboardKey.RightShift);
            const ctrlKey = this.m_keysDown.has(KeyboardKey.LeftControl) || this.m_keysDown.has(KeyboardKey.RightControl);
            const altKey = this.m_keysDown.has(KeyboardKey.LeftAlt) || this.m_keysDown.has(KeyboardKey.RightAlt);
            const element = this.m_focusedElement || this.m_tree;
            const event = new events_4.KeyboardEvent(element, key, KeyMap[key], shiftKey, ctrlKey, altKey, false);
            this.propagate(element, event, e => e.dispatch('keydown', event));
            if (event.defaultPrevented)
                return;
            if (key === KeyboardKey.Escape) {
                this.blurElement();
            }
        }
        onKeyUp(key) {
            this.m_keysDown.delete(key);
            if (!this.m_tree)
                return;
            const shiftKey = this.m_keysDown.has(KeyboardKey.LeftShift) || this.m_keysDown.has(KeyboardKey.RightShift);
            const ctrlKey = this.m_keysDown.has(KeyboardKey.LeftControl) || this.m_keysDown.has(KeyboardKey.RightControl);
            const altKey = this.m_keysDown.has(KeyboardKey.LeftAlt) || this.m_keysDown.has(KeyboardKey.RightAlt);
            const element = this.m_focusedElement || this.m_tree;
            const event = new events_4.KeyboardEvent(element, key, KeyMap[key], shiftKey, ctrlKey, altKey, false);
            this.propagate(element, event, e => e.dispatch('keyup', event));
        }
        onScroll(delta) {
            if (!this.m_tree)
                return;
            const shiftKey = this.m_keysDown.has(KeyboardKey.LeftShift) || this.m_keysDown.has(KeyboardKey.RightShift);
            const ctrlKey = this.m_keysDown.has(KeyboardKey.LeftControl) || this.m_keysDown.has(KeyboardKey.RightControl);
            const altKey = this.m_keysDown.has(KeyboardKey.LeftAlt) || this.m_keysDown.has(KeyboardKey.RightAlt);
            const element = this.m_focusedElement || this.m_tree;
            const event = new events_4.WheelEvent(element, new math_ext_10.vec2(0, delta), shiftKey, ctrlKey, altKey);
            this.propagate(element, event, e => e.dispatch('mousewheel', event));
        }
    }
    exports.UIEventManager = UIEventManager;
});
define("modules/ui/renderer/renderer", ["require", "exports", "modules/math-ext/index", "modules/ui/renderer/generator", "modules/ui/renderer/layout", "modules/ui/renderer/element", "modules/ui/utils/render-context", "modules/ui/types/index", "modules/ui/utils/event-mgr"], function (require, exports, math_ext_11, generator_1, layout_1, element_3, render_context_2, types_10, event_mgr_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UIRenderer = void 0;
    function clipRectsIntersect(a, b) {
        if (b.x + b.width <= a.x || b.x >= a.x + a.width)
            return false;
        if (b.y + b.height <= a.y || b.y >= a.y + a.height)
            return false;
        return true;
    }
    class UIRenderer {
        constructor(window, fontMgr) {
            this.m_window = window;
            this.m_fontMgr = fontMgr;
            this.m_eventMgr = new event_mgr_1.UIEventManager(window);
            this.m_treeGenerator = new generator_1.TreeGenerator(window, fontMgr);
            this.m_lastTree = null;
            this.m_renderContext = new render_context_2.RenderContext(window);
            this.m_resizeListener = null;
            this.m_boxDraw = null;
            this.m_textDraws = new Map();
            this.m_windowSize = { width: 0, height: 0 };
        }
        init() {
            this.m_renderContext.init();
            this.m_resizeListener = this.m_window.onResize(this.onResize.bind(this));
            this.m_eventMgr.init();
            this.m_boxDraw = this.m_renderContext.allocateDrawCall(8192);
            const { logicalDevice, frameManager } = this.m_renderContext.renderContext;
            this.m_fontMgr.init(logicalDevice, frameManager.getCommandPool());
        }
        shutdown() {
            if (this.m_resizeListener) {
                this.m_window.offResize(this.m_resizeListener);
                this.m_resizeListener = null;
            }
            this.m_eventMgr.shutdown();
            this.m_fontMgr.shutdown();
            this.m_renderContext.shutdown();
        }
        onResize(width, height) {
            this.m_windowSize = { width, height };
            if (this.m_boxDraw) {
                this.m_renderContext.freeDrawCall(this.m_boxDraw);
                this.m_boxDraw = this.m_renderContext.allocateDrawCall(8192);
                const proj = math_ext_11.mat4.identity();
                math_ext_11.Transform.ortho(proj, 0, this.m_windowSize.width, 0, this.m_windowSize.height, 0, 1);
                this.m_boxDraw.uniforms.projection = proj.transposed;
            }
            for (const [fontFamily, textDraw] of this.m_textDraws.entries()) {
                this.m_renderContext.freeDrawCall(textDraw.drawCall);
                const newTextDraw = this.m_renderContext.allocateTextDraw(8192, fontFamily);
                this.m_textDraws.set(fontFamily, newTextDraw);
                const proj = math_ext_11.mat4.identity();
                math_ext_11.Transform.ortho(proj, 0, this.m_windowSize.width, 0, this.m_windowSize.height, 0, 1);
                newTextDraw.drawCall.uniforms.projection = proj.transposed;
            }
            this.doLayout();
        }
        drawText(node, geometry, clipRectIndex) {
            const fontFamily = this.m_fontMgr.findFontFamily(geometry.textProperties);
            if (fontFamily) {
                let textDraw = this.m_textDraws.get(fontFamily);
                if (!textDraw) {
                    textDraw = this.m_renderContext.allocateTextDraw(8192, fontFamily);
                    this.m_textDraws.set(fontFamily, textDraw);
                }
                const { x, y } = node.style.clientRect;
                textDraw.drawText(x, y, geometry, clipRectIndex);
            }
        }
        drawBox(node, geometry, clipRectIndex) {
            const { vertices } = geometry;
            for (const vertex of vertices) {
                const pos = new math_ext_11.vec4();
                math_ext_11.vec4.add(pos, vertex.position, geometry.offsetPosition);
                const vtx = new types_10.Vertex(pos, vertex.color, undefined, clipRectIndex);
                this.m_boxDraw.addVertex(vtx);
            }
        }
        drawNode(node) {
            if (!this.m_boxDraw)
                return;
            const clipRects = this.m_renderContext.clipRects;
            const clip = clipRects.currentClip;
            if (clipRectsIntersect(clip.rect, node.style.clientRect)) {
                if (node.source instanceof types_10.BoxNode) {
                    const geometry = node.geometry;
                    if (geometry)
                        this.drawBox(node, geometry, clip.index);
                }
                else if (node.source instanceof types_10.TextNode) {
                    const geometry = node.geometry;
                    if (geometry)
                        this.drawText(node, geometry, clip.index);
                }
            }
            else if (node.style.overflow !== types_10.Overflow.Visible) {
                // Element and all children will be invisible. Even if a child is
                // positioned such that it would be within the current clip rect,
                // because this element is fully outside the clip rect and its
                // overflow is hidden
                return;
            }
            clipRects.beginElement(node);
            for (const child of node.children) {
                this.drawNode(child);
            }
            clipRects.endElement(node);
        }
        doLayout() {
            if (!this.m_lastTree)
                return;
            const layoutEngine = new layout_1.LayoutEngine(this.m_window, this.m_lastTree);
            layoutEngine.execute();
            if (!this.m_window.isOpen())
                return;
            if (!this.m_renderContext.isInitialized)
                this.init();
            if (!this.m_boxDraw)
                return;
            if (this.m_renderContext.begin()) {
                element_3.Element.__internal_afterLayout(this.m_lastTree);
                this.m_renderContext.clipRects.reset();
                this.m_boxDraw.resetUsedVertices();
                for (const textDraw of this.m_textDraws.values()) {
                    textDraw.resetUsedVertices();
                }
                this.drawNode(this.m_lastTree);
                this.m_renderContext.beginRenderPass();
                this.m_renderContext.endRenderPass();
                this.m_renderContext.end();
            }
        }
        render(root) {
            this.m_lastTree = this.m_treeGenerator.generate(root);
            this.m_eventMgr.setTreeRoot(this.m_lastTree);
            this.doLayout();
        }
    }
    exports.UIRenderer = UIRenderer;
});
define("modules/ui/root", ["require", "exports", "modules/mini-react/index", "modules/mini-react/vdom", "modules/ui/components/index", "modules/ui/renderer/renderer", "modules/ui/types/box-node", "modules/ui/types/text-node", "modules/ui/types/root-node", "modules/ui/utils/font-mgr", "modules/ui/components/index"], function (require, exports, React, vdom_7, components_1, renderer_1, box_node_3, text_node_3, root_node_2, font_mgr_2, components_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UIRoot = void 0;
    exports.createRoot = createRoot;
    __exportStar(components_2, exports);
    class UIRoot extends vdom_7.ReactRoot {
        /** @internal */
        constructor(window) {
            super();
            this.m_root = null;
            this.m_nodeStack = [];
            this.m_window = window;
            this.m_fontMgr = new font_mgr_2.FontManager();
            this.m_renderer = new renderer_1.UIRenderer(window, this.m_fontMgr);
        }
        /** @internal */
        get mostRecentNode() {
            if (this.m_nodeStack.length === 0)
                return null;
            return this.m_nodeStack[this.m_nodeStack.length - 1];
        }
        /** @internal */
        beginProcessingNode(node) {
            if (!this.m_root)
                this.m_root = node;
            this.m_nodeStack.push(node);
        }
        /** @internal */
        endProcessingNode(node) {
            this.m_nodeStack.pop();
        }
        /** @internal */
        parseNode(inputNode) {
            const props = inputNode.props;
            let node = null;
            if (React.isSpecificElement(inputNode.type, components_1.Box, props)) {
                node = new box_node_3.BoxNode(inputNode, this.mostRecentNode, props);
            }
            else if (React.isSpecificElement(inputNode.type, vdom_7.TextFragment, props)) {
                node = new text_node_3.TextNode(inputNode, this.mostRecentNode);
            }
            else if (!this.m_root) {
                node = new root_node_2.RootNode(inputNode);
            }
            if (node) {
                const parent = this.mostRecentNode;
                if (parent)
                    parent.addChild(node);
                this.beginProcessingNode(node);
            }
            for (const child of inputNode.children) {
                this.parseNode(child);
            }
            if (node)
                this.endProcessingNode(node);
        }
        /** @internal */
        debugPrint() {
            if (!this.m_root)
                return;
            this.m_root.debugPrint();
        }
        /** @internal */
        renderToWindow() {
            if (!this.m_root)
                return;
            this.m_renderer.render(this.m_root);
        }
        /** @internal */
        onAfterRender(rootNode) {
            this.m_root = null;
            this.parseNode(rootNode);
            this.renderToWindow();
        }
        addFontFamily(fontFamily, isDefault = false) {
            this.m_fontMgr.addFontFamily(fontFamily, isDefault);
        }
    }
    exports.UIRoot = UIRoot;
    function createRoot(window) {
        return new UIRoot(window);
    }
});
define("modules/ui/index", ["require", "exports", "modules/ui/root", "modules/ui/components/index"], function (require, exports, root_4, components_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createRoot = void 0;
    Object.defineProperty(exports, "createRoot", { enumerable: true, get: function () { return root_4.createRoot; } });
    __exportStar(components_3, exports);
});
define("modules/font-awesome-solid", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FaZ = exports.FaYinYang = exports.FaYenSign = exports.FaY = exports.FaXmarksLines = exports.FaXmark = exports.FaXRay = exports.FaX = exports.FaWrench = exports.FaWorm = exports.FaWonSign = exports.FaWineGlassEmpty = exports.FaWineGlass = exports.FaWineBottle = exports.FaWindowRestore = exports.FaWindowMinimize = exports.FaWindowMaximize = exports.FaWind = exports.FaWifi = exports.FaWhiskeyGlass = exports.FaWheelchairMove = exports.FaWheelchair = exports.FaWheatAwnCircleExclamation = exports.FaWheatAwn = exports.FaWeightScale = exports.FaWeightHanging = exports.FaWebAwesome = exports.FaWaveSquare = exports.FaWaterLadder = exports.FaWater = exports.FaWarehouse = exports.FaWandSparkles = exports.FaWandMagicSparkles = exports.FaWandMagic = exports.FaWallet = exports.FaWalkieTalkie = exports.FaW = exports.FaVrCardboard = exports.FaVolumeXmark = exports.FaVolumeOff = exports.FaVolumeLow = exports.FaVolumeHigh = exports.FaVolleyball = exports.FaVolcano = exports.FaVoicemail = exports.FaViruses = exports.FaVirusSlash = exports.FaVirusCovidSlash = exports.FaVirusCovid = exports.FaVirus = exports.FaVihara = exports.FaVideoSlash = exports.FaVideo = exports.FaVials = exports.FaVialVirus = exports.FaVialCircleCheck = exports.FaVial = exports.FaVestPatches = exports.FaVest = exports.FaVenusMars = exports.FaVenusDouble = exports.FaVenus = exports.FaVault = exports.FaVanShuttle = exports.FaV = exports.FaUtensils = exports.FaUsersViewfinder = exports.FaUsersSlash = exports.FaUsersRectangle = exports.FaUsersRays = exports.FaUsersLine = exports.FaUsersGear = exports.FaUsersBetweenLines = exports.FaUsers = exports.FaUserXmark = exports.FaUserTie = exports.FaUserTag = exports.FaUserSlash = exports.FaUserShield = exports.FaUserSecret = exports.FaUserPlus = exports.FaUserPen = exports.FaUserNurse = exports.FaUserNinja = exports.FaUserMinus = exports.FaUserLock = exports.FaUserInjured = exports.FaUserGroup = exports.FaUserGraduate = exports.FaUserGear = exports.FaUserDoctor = exports.FaUserClock = exports.FaUserCheck = exports.FaUserAstronaut = exports.FaUser = exports.FaUpload = exports.FaUpRightFromSquare = exports.FaUpRightAndDownLeftFromCenter = exports.FaUpLong = exports.FaUpDownLeftRight = exports.FaUpDown = exports.FaUnlockKeyhole = exports.FaUnlock = exports.FaUniversalAccess = exports.FaUnderline = exports.FaUmbrellaBeach = exports.FaUmbrella = exports.FaU = exports.FaTv = exports.FaTurnUp = exports.FaTurnDown = exports.FaTurkishLiraSign = exports.FaTty = exports.FaTruckRampBox = exports.FaTruckPlane = exports.FaTruckPickup = exports.FaTruckMoving = exports.FaTruckMonster = exports.FaTruckMedical = exports.FaTruckFront = exports.FaTruckFieldUn = exports.FaTruckField = exports.FaTruckFast = exports.FaTruckDroplet = exports.FaTruckArrowRight = exports.FaTruck = exports.FaTrowelBricks = exports.FaTrowel = exports.FaTrophy = exports.FaTriangleExclamation = exports.FaTreeCity = exports.FaTree = exports.FaTrashCanArrowUp = exports.FaTrashCan = exports.FaTrashArrowUp = exports.FaTrash = exports.FaTransgender = exports.FaTrainTram = exports.FaTrainSubway = exports.FaTrain = exports.FaTrailer = exports.FaTrafficLight = exports.FaTrademark = exports.FaTractor = exports.FaTowerObservation = exports.FaTowerCell = exports.FaTowerBroadcast = exports.FaTornado = exports.FaToriiGate = exports.FaTooth = exports.FaToolbox = exports.FaToiletsPortable = exports.FaToiletPortable = exports.FaToiletPaperSlash = exports.FaToiletPaper = exports.FaToilet = exports.FaToggleOn = exports.FaToggleOff = exports.FaTimeline = exports.FaTicketSimple = exports.FaTicket = exports.FaThumbtackSlash = exports.FaThumbtack = exports.FaThumbsUp = exports.FaThumbsDown = exports.FaThermometer = exports.FaTextWidth = exports.FaTextSlash = exports.FaTextHeight = exports.FaTerminal = exports.FaTents = exports.FaTentArrowsDown = exports.FaTentArrowTurnLeft = exports.FaTentArrowLeftRight = exports.FaTentArrowDownToLine = exports.FaTent = exports.FaTengeSign = exports.FaTemperatureThreeQuarters = exports.FaTemperatureQuarter = exports.FaTemperatureLow = exports.FaTemperatureHigh = exports.FaTemperatureHalf = exports.FaTemperatureFull = exports.FaTemperatureEmpty = exports.FaTemperatureArrowUp = exports.FaTemperatureArrowDown = exports.FaTeethOpen = exports.FaTeeth = exports.FaTaxi = exports.FaTarpDroplet = exports.FaTarp = exports.FaTape = exports.FaTags = exports.FaTag = exports.FaTachographDigital = exports.FaTablets = exports.FaTabletScreenButton = exports.FaTabletButton = exports.FaTablet = exports.FaTableTennisPaddleBall = exports.FaTableList = exports.FaTableColumns = exports.FaTableCellsRowUnlock = exports.FaTableCellsRowLock = exports.FaTableCellsLarge = exports.FaTableCellsColumnLock = exports.FaTableCells = exports.FaTable = exports.FaT = exports.FaSyringe = exports.FaSynagogue = exports.FaSwatchbook = exports.FaSuperscript = exports.FaSunPlantWilt = exports.FaSun = exports.FaSuitcaseRolling = exports.FaSuitcaseMedical = exports.FaSuitcase = exports.FaSubscript = exports.FaStroopwafel = exports.FaStrikethrough = exports.FaStreetView = exports.FaStoreSlash = exports.FaStore = exports.FaStopwatch20 = exports.FaStopwatch = exports.FaStop = exports.FaStethoscope = exports.FaSterlingSign = exports.FaStarOfLife = exports.FaStarOfDavid = exports.FaStarHalfStroke = exports.FaStarHalf = exports.FaStarAndCrescent = exports.FaStar = exports.FaStapler = exports.FaStamp = exports.FaStairs = exports.FaStaffSnake = exports.FaSquareXmark = exports.FaSquareVirus = exports.FaSquareUpRight = exports.FaSquareShareNodes = exports.FaSquareRss = exports.FaSquareRootVariable = exports.FaSquarePollVertical = exports.FaSquarePollHorizontal = exports.FaSquarePlus = exports.FaSquarePhoneFlip = exports.FaSquarePhone = exports.FaSquarePersonConfined = exports.FaSquarePen = exports.FaSquareParking = exports.FaSquareNfi = exports.FaSquareMinus = exports.FaSquareH = exports.FaSquareFull = exports.FaSquareEnvelope = exports.FaSquareCheck = exports.FaSquareCaretUp = exports.FaSquareCaretRight = exports.FaSquareCaretLeft = exports.FaSquareCaretDown = exports.FaSquareBinary = exports.FaSquareArrowUpRight = exports.FaSquare = exports.FaSprayCanSparkles = exports.FaSprayCan = exports.FaSpoon = exports.FaSplotch = exports.FaSpiral = exports.FaSpinner = exports.FaSpider = exports.FaSpellCheck = exports.FaSpaghettiMonsterFlying = exports.FaSpa = exports.FaSortUp = exports.FaSortDown = exports.FaSort = exports.FaSolarPanel = exports.FaSocks = exports.FaSoap = exports.FaSnowplow = exports.FaSnowman = exports.FaSnowflake = exports.FaSmoking = exports.FaSmog = exports.FaSliders = exports.FaSleigh = exports.FaSlash = exports.FaSkullCrossbones = exports.FaSkull = exports.FaSitemap = exports.FaSink = exports.FaSingleQuoteRight = exports.FaSingleQuoteLeft = exports.FaSimCard = exports.FaSignsPost = exports.FaSignature = exports.FaSignal = exports.FaSignHanging = exports.FaShuttleSpace = exports.FaShuffle = exports.FaShrimp = exports.FaShower = exports.FaShopSlash = exports.FaShopLock = exports.FaShop = exports.FaShoePrints = exports.FaShirt = exports.FaShip = exports.FaShieldVirus = exports.FaShieldHeart = exports.FaShieldHalved = exports.FaShieldDog = exports.FaShieldCat = exports.FaShield = exports.FaShekelSign = exports.FaSheetPlastic = exports.FaShareNodes = exports.FaShareFromSquare = exports.FaShare = exports.FaShapes = exports.FaServer = exports.FaSeptagon = exports.FaSeedling = exports.FaSection = exports.FaSdCard = exports.FaScrollTorah = exports.FaScroll = exports.FaScrewdriverWrench = exports.FaScrewdriver = exports.FaScissors = exports.FaSchoolLock = exports.FaSchoolFlag = exports.FaSchoolCircleXmark = exports.FaSchoolCircleExclamation = exports.FaSchoolCircleCheck = exports.FaSchool = exports.FaScaleUnbalancedFlip = exports.FaScaleUnbalanced = exports.FaScaleBalanced = exports.FaSatelliteDish = exports.FaSatellite = exports.FaSailboat = exports.FaSackXmark = exports.FaSackDollar = exports.FaS = exports.FaRupiahSign = exports.FaRupeeSign = exports.FaRulerVertical = exports.FaRulerHorizontal = exports.FaRulerCombined = exports.FaRuler = exports.FaRug = exports.FaRubleSign = exports.FaRss = exports.FaRoute = exports.FaRotateRight = exports.FaRotateLeft = exports.FaRotate = exports.FaRocket = exports.FaRobot = exports.FaRoadSpikes = exports.FaRoadLock = exports.FaRoadCircleXmark = exports.FaRoadCircleExclamation = exports.FaRoadCircleCheck = exports.FaRoadBridge = exports.FaRoadBarrier = exports.FaRoad = exports.FaRing = exports.FaRightToBracket = exports.FaRightLong = exports.FaRightLeft = exports.FaRightFromBracket = exports.FaRibbon = exports.FaRetweet = exports.FaRestroom = exports.FaRepublican = exports.FaReplyAll = exports.FaReply = exports.FaRepeat = exports.FaRegistered = exports.FaRecycle = exports.FaRectangleXmark = exports.FaRectangleList = exports.FaRectangleAd = exports.FaRecordVinyl = exports.FaReceipt = exports.FaRankingStar = exports.FaRainbow = exports.FaRadio = exports.FaRadiation = exports.FaR = exports.FaQuoteRight = exports.FaQuoteLeft = exports.FaQuestion = exports.FaQrcode = exports.FaQ = exports.FaPuzzlePiece = exports.FaPumpSoap = exports.FaPumpMedical = exports.FaPrint = exports.FaPrescriptionBottleMedical = exports.FaPrescriptionBottle = exports.FaPrescription = exports.FaPowerOff = exports.FaPoop = exports.FaPooStorm = exports.FaPoo = exports.FaPodcast = exports.FaPlusMinus = exports.FaPlus = exports.FaPlugCircleXmark = exports.FaPlugCirclePlus = exports.FaPlugCircleMinus = exports.FaPlugCircleExclamation = exports.FaPlugCircleCheck = exports.FaPlugCircleBolt = exports.FaPlug = exports.FaPlay = exports.FaPlateWheat = exports.FaPlantWilt = exports.FaPlaneUp = exports.FaPlaneSlash = exports.FaPlaneLock = exports.FaPlaneDeparture = exports.FaPlaneCircleXmark = exports.FaPlaneCircleExclamation = exports.FaPlaneCircleCheck = exports.FaPlaneArrival = exports.FaPlane = exports.FaPlaceOfWorship = exports.FaPizzaSlice = exports.FaPills = exports.FaPiggyBank = exports.FaPhotoFilm = exports.FaPhoneVolume = exports.FaPhoneSlash = exports.FaPhoneFlip = exports.FaPhone = exports.FaPesoSign = exports.FaPesetaSign = exports.FaPersonWalkingWithCane = exports.FaPersonWalkingLuggage = exports.FaPersonWalkingDashedLineArrowRight = exports.FaPersonWalkingArrowRight = exports.FaPersonWalkingArrowLoopLeft = exports.FaPersonWalking = exports.FaPersonThroughWindow = exports.FaPersonSwimming = exports.FaPersonSnowboarding = exports.FaPersonSkiingNordic = exports.FaPersonSkiing = exports.FaPersonSkating = exports.FaPersonShelter = exports.FaPersonRunning = exports.FaPersonRifle = exports.FaPersonRays = exports.FaPersonPregnant = exports.FaPersonPraying = exports.FaPersonMilitaryToPerson = exports.FaPersonMilitaryRifle = exports.FaPersonMilitaryPointing = exports.FaPersonHiking = exports.FaPersonHarassing = exports.FaPersonHalfDress = exports.FaPersonFallingBurst = exports.FaPersonFalling = exports.FaPersonDrowning = exports.FaPersonDressBurst = exports.FaPersonDress = exports.FaPersonDotsFromLine = exports.FaPersonDigging = exports.FaPersonCircleXmark = exports.FaPersonCircleQuestion = exports.FaPersonCirclePlus = exports.FaPersonCircleMinus = exports.FaPersonCircleExclamation = exports.FaPersonCircleCheck = exports.FaPersonChalkboard = exports.FaPersonCane = exports.FaPersonBurst = exports.FaPersonBreastfeeding = exports.FaPersonBooth = exports.FaPersonBiking = exports.FaPersonArrowUpFromLine = exports.FaPersonArrowDownToLine = exports.FaPerson = exports.FaPercent = exports.FaPepperHot = exports.FaPeopleRoof = exports.FaPeopleRobbery = exports.FaPeoplePulling = exports.FaPeopleLine = exports.FaPeopleGroup = exports.FaPeopleCarryBox = exports.FaPeopleArrows = exports.FaPentagon = exports.FaPencil = exports.FaPenToSquare = exports.FaPenRuler = exports.FaPenNib = exports.FaPenFancy = exports.FaPenClip = exports.FaPen = exports.FaPeace = exports.FaPaw = exports.FaPause = exports.FaPaste = exports.FaPassport = exports.FaParagraph = exports.FaParachuteBox = exports.FaPaperclip = exports.FaPaperPlane = exports.FaPanorama = exports.FaPallet = exports.FaPalette = exports.FaPaintbrush = exports.FaPaintRoller = exports.FaPager = exports.FaP = exports.FaOutdent = exports.FaOtter = exports.FaOm = exports.FaOilWell = exports.FaOilCan = exports.FaOctagon = exports.FaObjectUngroup = exports.FaObjectGroup = exports.FaO = exports.FaNotesMedical = exports.FaNoteSticky = exports.FaNotdef = exports.FaNotEqual = exports.FaNonBinary = exports.FaNewspaper = exports.FaNeuter = exports.FaNetworkWired = exports.FaNairaSign = exports.FaN = exports.FaMusic = exports.FaMugSaucer = exports.FaMugHot = exports.FaMountainSun = exports.FaMountainCity = exports.FaMountain = exports.FaMound = exports.FaMotorcycle = exports.FaMosquitoNet = exports.FaMosquito = exports.FaMosque = exports.FaMortarPestle = exports.FaMoon = exports.FaMonument = exports.FaMoneyCheckDollar = exports.FaMoneyCheck = exports.FaMoneyBills = exports.FaMoneyBillWheat = exports.FaMoneyBillWave = exports.FaMoneyBillTrendUp = exports.FaMoneyBillTransfer = exports.FaMoneyBill1Wave = exports.FaMoneyBill1 = exports.FaMoneyBill = exports.FaMobileVibrate = exports.FaMobileScreenButton = exports.FaMobileScreen = exports.FaMobileRetro = exports.FaMobileButton = exports.FaMobile = exports.FaMitten = exports.FaMinus = exports.FaMinimize = exports.FaMillSign = exports.FaMicroscope = exports.FaMicrophoneSlash = exports.FaMicrophoneLinesSlash = exports.FaMicrophoneLines = exports.FaMicrophone = exports.FaMicrochip = exports.FaMeteor = exports.FaMessage = exports.FaMercury = exports.FaMenorah = exports.FaMemory = exports.FaMedal = exports.FaMaximize = exports.FaMattressPillow = exports.FaMasksTheater = exports.FaMaskVentilator = exports.FaMaskFace = exports.FaMask = exports.FaMartiniGlassEmpty = exports.FaMartiniGlassCitrus = exports.FaMartiniGlass = exports.FaMarsStrokeUp = exports.FaMarsStrokeRight = exports.FaMarsStroke = exports.FaMarsDouble = exports.FaMarsAndVenusBurst = exports.FaMarsAndVenus = exports.FaMars = exports.FaMarker = exports.FaMapPin = exports.FaMapLocationDot = exports.FaMapLocation = exports.FaMap = exports.FaManatSign = exports.FaMagnifyingGlassPlus = exports.FaMagnifyingGlassMinus = exports.FaMagnifyingGlassLocation = exports.FaMagnifyingGlassDollar = exports.FaMagnifyingGlassChart = exports.FaMagnifyingGlassArrowRight = exports.FaMagnifyingGlass = exports.FaMagnet = exports.FaM = exports.FaLungsVirus = exports.FaLungs = exports.FaLocust = exports.FaLockOpen = exports.FaLock = exports.FaLocationPinLock = exports.FaLocationPin = exports.FaLocationDot = exports.FaLocationCrosshairs = exports.FaLocationArrow = exports.FaLitecoinSign = exports.FaListUl = exports.FaListOl = exports.FaListCheck = exports.FaList = exports.FaLiraSign = exports.FaLinkSlash = exports.FaLink = exports.FaLinesLeaning = exports.FaLightbulb = exports.FaLifeRing = exports.FaLessThanEqual = exports.FaLessThan = exports.FaLemon = exports.FaLeftRight = exports.FaLeftLong = exports.FaLeaf = exports.FaLayerGroup = exports.FaLariSign = exports.FaLaptopMedical = exports.FaLaptopFile = exports.FaLaptopCode = exports.FaLaptop = exports.FaLanguage = exports.FaLandmarkFlag = exports.FaLandmarkDome = exports.FaLandmark = exports.FaLandMineOn = exports.FaL = exports.FaKiwiBird = exports.FaKitchenSet = exports.FaKitMedical = exports.FaKipSign = exports.FaKhanda = exports.FaKeyboard = exports.FaKey = exports.FaKaaba = exports.FaK = exports.FaJugDetergent = exports.FaJoint = exports.FaJetFighterUp = exports.FaJetFighter = exports.FaJedi = exports.FaJarWheat = exports.FaJar = exports.FaJ = exports.FaItalic = exports.FaInfo = exports.FaInfinity = exports.FaIndustry = exports.FaIndianRupeeSign = exports.FaIndent = exports.FaInbox = exports.FaImages = exports.FaImagePortrait = exports.FaImage = exports.FaIgloo = exports.FaIdCardClip = exports.FaIdCard = exports.FaIdBadge = exports.FaIcons = exports.FaIcicles = exports.FaIceCream = exports.FaICursor = exports.FaI = exports.FaHurricane = exports.FaHryvniaSign = exports.FaHouseUser = exports.FaHouseTsunami = exports.FaHouseSignal = exports.FaHouseMedicalFlag = exports.FaHouseMedicalCircleXmark = exports.FaHouseMedicalCircleExclamation = exports.FaHouseMedicalCircleCheck = exports.FaHouseMedical = exports.FaHouseLock = exports.FaHouseLaptop = exports.FaHouseFloodWaterCircleArrowRight = exports.FaHouseFloodWater = exports.FaHouseFlag = exports.FaHouseFire = exports.FaHouseCrack = exports.FaHouseCircleXmark = exports.FaHouseCircleExclamation = exports.FaHouseCircleCheck = exports.FaHouseChimneyWindow = exports.FaHouseChimneyUser = exports.FaHouseChimneyMedical = exports.FaHouseChimneyCrack = exports.FaHouseChimney = exports.FaHouse = exports.FaHourglassStart = exports.FaHourglassHalf = exports.FaHourglassEnd = exports.FaHourglass = exports.FaHotel = exports.FaHotdog = exports.FaHotTubPerson = exports.FaHospitalUser = exports.FaHospital = exports.FaHorseHead = exports.FaHorse = exports.FaHollyBerry = exports.FaHockeyPuck = exports.FaHippo = exports.FaHillRockslide = exports.FaHillAvalanche = exports.FaHighlighter = exports.FaHexagonNodesBolt = exports.FaHexagonNodes = exports.FaHexagon = exports.FaHelmetUn = exports.FaHelmetSafety = exports.FaHelicopterSymbol = exports.FaHelicopter = exports.FaHeartPulse = exports.FaHeartCrack = exports.FaHeartCircleXmark = exports.FaHeartCirclePlus = exports.FaHeartCircleMinus = exports.FaHeartCircleExclamation = exports.FaHeartCircleCheck = exports.FaHeartCircleBolt = exports.FaHeart = exports.FaHeadset = exports.FaHeadphones = exports.FaHeading = exports.FaHeadSideVirus = exports.FaHeadSideMask = exports.FaHeadSideCoughSlash = exports.FaHeadSideCough = exports.FaHatWizard = exports.FaHatCowboySide = exports.FaHatCowboy = exports.FaHashtag = exports.FaHardDrive = exports.FaHanukiah = exports.FaHandshakeSlash = exports.FaHandshakeAngle = exports.FaHandshake = exports.FaHandsPraying = exports.FaHandsHoldingCircle = exports.FaHandsHoldingChild = exports.FaHandsHolding = exports.FaHandsClapping = exports.FaHandsBubbles = exports.FaHandsBound = exports.FaHandsAslInterpreting = exports.FaHands = exports.FaHandcuffs = exports.FaHandSpock = exports.FaHandSparkles = exports.FaHandScissors = exports.FaHandPointer = exports.FaHandPointUp = exports.FaHandPointRight = exports.FaHandPointLeft = exports.FaHandPointDown = exports.FaHandPeace = exports.FaHandMiddleFinger = exports.FaHandLizard = exports.FaHandHoldingMedical = exports.FaHandHoldingHeart = exports.FaHandHoldingHand = exports.FaHandHoldingDroplet = exports.FaHandHoldingDollar = exports.FaHandHolding = exports.FaHandFist = exports.FaHandDots = exports.FaHandBackFist = exports.FaHand = exports.FaHamsa = exports.FaHammer = exports.FaH = exports.FaGun = exports.FaGuitar = exports.FaGuaraniSign = exports.FaGroupArrowsRotate = exports.FaGripVertical = exports.FaGripLinesVertical = exports.FaGripLines = exports.FaGrip = exports.FaGreaterThanEqual = exports.FaGreaterThan = exports.FaGraduationCap = exports.FaGopuram = exports.FaGolfBallTee = exports.FaGlobe = exports.FaGlasses = exports.FaGlassWaterDroplet = exports.FaGlassWater = exports.FaGifts = exports.FaGift = exports.FaGhost = exports.FaGenderless = exports.FaGem = exports.FaGears = exports.FaGear = exports.FaGavel = exports.FaGaugeSimpleHigh = exports.FaGaugeSimple = exports.FaGaugeHigh = exports.FaGauge = exports.FaGasPump = exports.FaGamepad = exports.FaG = exports.FaFutbol = exports.FaFrog = exports.FaFrancSign = exports.FaForwardStep = exports.FaForwardFast = exports.FaForward = exports.FaFootball = exports.FaFontAwesome = exports.FaFont = exports.FaFolderTree = exports.FaFolderPlus = exports.FaFolderOpen = exports.FaFolderMinus = exports.FaFolderClosed = exports.FaFolder = exports.FaFlorinSign = exports.FaFloppyDisk = exports.FaFlaskVial = exports.FaFlask = exports.FaFlagUsa = exports.FaFlagCheckered = exports.FaFlag = exports.FaFishFins = exports.FaFish = exports.FaFireFlameSimple = exports.FaFireFlameCurved = exports.FaFireExtinguisher = exports.FaFireBurner = exports.FaFire = exports.FaFingerprint = exports.FaFilterCircleXmark = exports.FaFilterCircleDollar = exports.FaFilter = exports.FaFilm = exports.FaFillDrip = exports.FaFill = exports.FaFileZipper = exports.FaFileWord = exports.FaFileWaveform = exports.FaFileVideo = exports.FaFileSignature = exports.FaFileShield = exports.FaFilePrescription = exports.FaFilePowerpoint = exports.FaFilePen = exports.FaFilePdf = exports.FaFileMedical = exports.FaFileLines = exports.FaFileInvoiceDollar = exports.FaFileInvoice = exports.FaFileImport = exports.FaFileImage = exports.FaFileHalfDashed = exports.FaFileFragment = exports.FaFileExport = exports.FaFileExcel = exports.FaFileCsv = exports.FaFileContract = exports.FaFileCode = exports.FaFileCircleXmark = exports.FaFileCircleQuestion = exports.FaFileCirclePlus = exports.FaFileCircleMinus = exports.FaFileCircleExclamation = exports.FaFileCircleCheck = exports.FaFileAudio = exports.FaFileArrowUp = exports.FaFileArrowDown = exports.FaFile = exports.FaFerry = exports.FaFeatherPointed = exports.FaFeather = exports.FaFax = exports.FaFaucetDrip = exports.FaFaucet = exports.FaFan = exports.FaFaceTired = exports.FaFaceSurprise = exports.FaFaceSmileWink = exports.FaFaceSmileBeam = exports.FaFaceSmile = exports.FaFaceSadTear = exports.FaFaceSadCry = exports.FaFaceRollingEyes = exports.FaFaceMehBlank = exports.FaFaceMeh = exports.FaFaceLaughWink = exports.FaFaceLaughSquint = exports.FaFaceLaughBeam = exports.FaFaceLaugh = exports.FaFaceKissWinkHeart = exports.FaFaceKissBeam = exports.FaFaceKiss = exports.FaFaceGrinWink = exports.FaFaceGrinWide = exports.FaFaceGrinTongueWink = exports.FaFaceGrinTongueSquint = exports.FaFaceGrinTongue = exports.FaFaceGrinTears = exports.FaFaceGrinStars = exports.FaFaceGrinSquintTears = exports.FaFaceGrinSquint = exports.FaFaceGrinHearts = exports.FaFaceGrinBeamSweat = exports.FaFaceGrinBeam = exports.FaFaceGrin = exports.FaFaceGrimace = exports.FaFaceFrownOpen = exports.FaFaceFrown = exports.FaFaceFlushed = exports.FaFaceDizzy = exports.FaFaceAngry = exports.FaF = exports.FaEyeSlash = exports.FaEyeLowVision = exports.FaEyeDropper = exports.FaEye = exports.FaExplosion = exports.FaExpand = exports.FaExclamation = exports.FaEuroSign = exports.FaEthernet = exports.FaEraser = exports.FaEquals = exports.FaEnvelopesBulk = exports.FaEnvelopeOpenText = exports.FaEnvelopeOpen = exports.FaEnvelopeCircleCheck = exports.FaEnvelope = exports.FaEllipsisVertical = exports.FaEllipsis = exports.FaElevator = exports.FaEject = exports.FaEgg = exports.FaEarthOceania = exports.FaEarthEurope = exports.FaEarthAsia = exports.FaEarthAmericas = exports.FaEarthAfrica = exports.FaEarListen = exports.FaEarDeaf = exports.FaE = exports.FaDungeon = exports.FaDumpsterFire = exports.FaDumpster = exports.FaDumbbell = exports.FaDrumstickBite = exports.FaDrumSteelpan = exports.FaDrum = exports.FaDropletSlash = exports.FaDroplet = exports.FaDrawPolygon = exports.FaDragon = exports.FaDownload = exports.FaDownLong = exports.FaDownLeftAndUpRightToCenter = exports.FaDove = exports.FaDoorOpen = exports.FaDoorClosed = exports.FaDongSign = exports.FaDolly = exports.FaDollarSign = exports.FaDog = exports.FaDna = exports.FaDivide = exports.FaDisplay = exports.FaDisease = exports.FaDiceTwo = exports.FaDiceThree = exports.FaDiceSix = exports.FaDiceOne = exports.FaDiceFour = exports.FaDiceFive = exports.FaDiceD6 = exports.FaDiceD20 = exports.FaDice = exports.FaDiamondTurnRight = exports.FaDiamond = exports.FaDiagramSuccessor = exports.FaDiagramProject = exports.FaDiagramPredecessor = exports.FaDiagramNext = exports.FaDharmachakra = exports.FaDesktop = exports.FaDemocrat = exports.FaDeleteLeft = exports.FaDatabase = exports.FaD = exports.FaCubesStacked = exports.FaCubes = exports.FaCube = exports.FaCruzeiroSign = exports.FaCrutch = exports.FaCrown = exports.FaCrow = exports.FaCrosshairs = exports.FaCross = exports.FaCropSimple = exports.FaCrop = exports.FaCreditCard = exports.FaCow = exports.FaCouch = exports.FaCopyright = exports.FaCopy = exports.FaCookieBite = exports.FaCookie = exports.FaComputerMouse = exports.FaComputer = exports.FaCompress = exports.FaCompassDrafting = exports.FaCompass = exports.FaCompactDisc = exports.FaCommentsDollar = exports.FaComments = exports.FaCommentSms = exports.FaCommentSlash = exports.FaCommentNodes = exports.FaCommentMedical = exports.FaCommentDots = exports.FaCommentDollar = exports.FaComment = exports.FaColonSign = exports.FaCoins = exports.FaCodePullRequest = exports.FaCodeMerge = exports.FaCodeFork = exports.FaCodeCompare = exports.FaCodeCommit = exports.FaCodeBranch = exports.FaCode = exports.FaClover = exports.FaCloudSunRain = exports.FaCloudSun = exports.FaCloudShowersWater = exports.FaCloudShowersHeavy = exports.FaCloudRain = exports.FaCloudMoonRain = exports.FaCloudMoon = exports.FaCloudMeatball = exports.FaCloudBolt = exports.FaCloudArrowUp = exports.FaCloudArrowDown = exports.FaCloud = exports.FaClosedCaptioning = exports.FaClone = exports.FaClockRotateLeft = exports.FaClock = exports.FaClipboardUser = exports.FaClipboardQuestion = exports.FaClipboardList = exports.FaClipboardCheck = exports.FaClipboard = exports.FaClapperboard = exports.FaCity = exports.FaCircleXmark = exports.FaCircleUser = exports.FaCircleUp = exports.FaCircleStop = exports.FaCircleRight = exports.FaCircleRadiation = exports.FaCircleQuestion = exports.FaCirclePlus = exports.FaCirclePlay = exports.FaCirclePause = exports.FaCircleNotch = exports.FaCircleNodes = exports.FaCircleMinus = exports.FaCircleLeft = exports.FaCircleInfo = exports.FaCircleHalfStroke = exports.FaCircleH = exports.FaCircleExclamation = exports.FaCircleDown = exports.FaCircleDot = exports.FaCircleDollarToSlot = exports.FaCircleChevronUp = exports.FaCircleChevronRight = exports.FaCircleChevronLeft = exports.FaCircleChevronDown = exports.FaCircleCheck = exports.FaCircleArrowUp = exports.FaCircleArrowRight = exports.FaCircleArrowLeft = exports.FaCircleArrowDown = exports.FaCircle = exports.FaChurch = exports.FaChildren = exports.FaChildReaching = exports.FaChildDress = exports.FaChildCombatant = exports.FaChild = exports.FaChevronUp = exports.FaChevronRight = exports.FaChevronLeft = exports.FaChevronDown = exports.FaChessRook = exports.FaChessQueen = exports.FaChessPawn = exports.FaChessKnight = exports.FaChessKing = exports.FaChessBoard = exports.FaChessBishop = exports.FaChess = exports.FaCheese = exports.FaCheckToSlot = exports.FaCheckDouble = exports.FaCheck = exports.FaChartSimple = exports.FaChartPie = exports.FaChartLine = exports.FaChartGantt = exports.FaChartDiagram = exports.FaChartColumn = exports.FaChartBar = exports.FaChartArea = exports.FaChargingStation = exports.FaChampagneGlasses = exports.FaChalkboardUser = exports.FaChalkboard = exports.FaChair = exports.FaCertificate = exports.FaCentSign = exports.FaCediSign = exports.FaCat = exports.FaCashRegister = exports.FaCartShopping = exports.FaCartPlus = exports.FaCartFlatbedSuitcase = exports.FaCartFlatbed = exports.FaCartArrowDown = exports.FaCarrot = exports.FaCaretUp = exports.FaCaretRight = exports.FaCaretLeft = exports.FaCaretDown = exports.FaCaravan = exports.FaCarTunnel = exports.FaCarSide = exports.FaCarRear = exports.FaCarOn = exports.FaCarBurst = exports.FaCarBattery = exports.FaCar = exports.FaCapsules = exports.FaCannabis = exports.FaCandyCane = exports.FaCampground = exports.FaCameraRotate = exports.FaCameraRetro = exports.FaCamera = exports.FaCalendarXmark = exports.FaCalendarWeek = exports.FaCalendarPlus = exports.FaCalendarMinus = exports.FaCalendarDays = exports.FaCalendarDay = exports.FaCalendarCheck = exports.FaCalendar = exports.FaCalculator = exports.FaCakeCandles = exports.FaCableCar = exports.FaC = exports.FaBusinessTime = exports.FaBusSimple = exports.FaBusSide = exports.FaBus = exports.FaBurst = exports.FaBurger = exports.FaBullseye = exports.FaBullhorn = exports.FaBuildingWheat = exports.FaBuildingUser = exports.FaBuildingUn = exports.FaBuildingShield = exports.FaBuildingNgo = exports.FaBuildingLock = exports.FaBuildingFlag = exports.FaBuildingColumns = exports.FaBuildingCircleXmark = exports.FaBuildingCircleExclamation = exports.FaBuildingCircleCheck = exports.FaBuildingCircleArrowRight = exports.FaBuilding = exports.FaBugs = exports.FaBugSlash = exports.FaBug = exports.FaBucket = exports.FaBrush = exports.FaBroomBall = exports.FaBroom = exports.FaBriefcaseMedical = exports.FaBriefcase = exports.FaBridgeWater = exports.FaBridgeLock = exports.FaBridgeCircleXmark = exports.FaBridgeCircleExclamation = exports.FaBridgeCircleCheck = exports.FaBridge = exports.FaBreadSlice = exports.FaBrazilianRealSign = exports.FaBrain = exports.FaBraille = exports.FaBoxesStacked = exports.FaBoxesPacking = exports.FaBoxTissue = exports.FaBoxOpen = exports.FaBoxArchive = exports.FaBox = exports.FaBowlingBall = exports.FaBowlRice = exports.FaBowlFood = exports.FaBottleWater = exports.FaBottleDroplet = exports.FaBoreHole = exports.FaBorderTopLeft = exports.FaBorderNone = exports.FaBorderAll = exports.FaBookmark = exports.FaBookTanakh = exports.FaBookSkull = exports.FaBookQuran = exports.FaBookOpenReader = exports.FaBookOpen = exports.FaBookMedical = exports.FaBookJournalWhills = exports.FaBookBookmark = exports.FaBookBible = exports.FaBookAtlas = exports.FaBook = exports.FaBong = exports.FaBone = exports.FaBomb = exports.FaBoltLightning = exports.FaBolt = exports.FaBold = exports.FaBlog = exports.FaBlenderPhone = exports.FaBlender = exports.FaBitcoinSign = exports.FaBiohazard = exports.FaBinoculars = exports.FaBicycle = exports.FaBezierCurve = exports.FaBellSlash = exports.FaBellConcierge = exports.FaBell = exports.FaBeerMugEmpty = exports.FaBedPulse = exports.FaBed = exports.FaBatteryThreeQuarters = exports.FaBatteryQuarter = exports.FaBatteryHalf = exports.FaBatteryFull = exports.FaBatteryEmpty = exports.FaBath = exports.FaBasketball = exports.FaBasketShopping = exports.FaBaseballBatBall = exports.FaBaseball = exports.FaBarsStaggered = exports.FaBarsProgress = exports.FaBars = exports.FaBarcode = exports.FaBangladeshiTakaSign = exports.FaBandage = exports.FaBanSmoking = exports.FaBan = exports.FaBahtSign = exports.FaBahai = exports.FaBagShopping = exports.FaBacterium = exports.FaBacteria = exports.FaBacon = exports.FaBackwardStep = exports.FaBackwardFast = exports.FaBackward = exports.FaBabyCarriage = exports.FaBaby = exports.FaB = exports.FaAward = exports.FaAustralSign = exports.FaAudioDescription = exports.FaAtom = exports.FaAt = exports.FaAsterisk = exports.FaArrowsUpToLine = exports.FaArrowsUpDownLeftRight = exports.FaArrowsUpDown = exports.FaArrowsTurnToDots = exports.FaArrowsTurnRight = exports.FaArrowsToEye = exports.FaArrowsToDot = exports.FaArrowsToCircle = exports.FaArrowsSplitUpAndLeft = exports.FaArrowsSpin = exports.FaArrowsRotate = exports.FaArrowsLeftRightToLine = exports.FaArrowsLeftRight = exports.FaArrowsDownToPeople = exports.FaArrowsDownToLine = exports.FaArrowUpZA = exports.FaArrowUpWideShort = exports.FaArrowUpShortWide = exports.FaArrowUpRightFromSquare = exports.FaArrowUpRightDots = exports.FaArrowUpLong = exports.FaArrowUpFromWaterPump = exports.FaArrowUpFromGroundWater = exports.FaArrowUpFromBracket = exports.FaArrowUpAZ = exports.FaArrowUp91 = exports.FaArrowUp19 = exports.FaArrowUp = exports.FaArrowTurnUp = exports.FaArrowTurnDown = exports.FaArrowTrendUp = exports.FaArrowTrendDown = exports.FaArrowRotateRight = exports.FaArrowRotateLeft = exports.FaArrowRightToCity = exports.FaArrowRightToBracket = exports.FaArrowRightLong = exports.FaArrowRightFromBracket = exports.FaArrowRightArrowLeft = exports.FaArrowRight = exports.FaArrowPointer = exports.FaArrowLeftLong = exports.FaArrowLeft = exports.FaArrowDownZA = exports.FaArrowDownWideShort = exports.FaArrowDownUpLock = exports.FaArrowDownUpAcrossLine = exports.FaArrowDownShortWide = exports.FaArrowDownLong = exports.FaArrowDownAZ = exports.FaArrowDown91 = exports.FaArrowDown19 = exports.FaArrowDown = exports.FaArchway = exports.FaAppleWhole = exports.FaAnkh = exports.FaAnglesUp = exports.FaAnglesRight = exports.FaAnglesLeft = exports.FaAnglesDown = exports.FaAngleUp = exports.FaAngleRight = exports.FaAngleLeft = exports.FaAngleDown = exports.FaAnchorLock = exports.FaAnchorCircleXmark = exports.FaAnchorCircleExclamation = exports.FaAnchorCircleCheck = exports.FaAnchor = exports.FaAlignRight = exports.FaAlignLeft = exports.FaAlignJustify = exports.FaAlignCenter = exports.FaAlarmClock = exports.FaAddressCard = exports.FaAddressBook = exports.FaA = exports.Fa9 = exports.Fa8 = exports.Fa7 = exports.Fa6 = exports.Fa5 = exports.Fa4 = exports.Fa3 = exports.Fa2 = exports.Fa1 = exports.Fa0 = void 0;
    /** char code: 0x30 */ exports.Fa0 = '0';
    /** char code: 0x31 */ exports.Fa1 = '1';
    /** char code: 0x32 */ exports.Fa2 = '2';
    /** char code: 0x33 */ exports.Fa3 = '3';
    /** char code: 0x34 */ exports.Fa4 = '4';
    /** char code: 0x35 */ exports.Fa5 = '5';
    /** char code: 0x36 */ exports.Fa6 = '6';
    /** char code: 0x37 */ exports.Fa7 = '7';
    /** char code: 0x38 */ exports.Fa8 = '8';
    /** char code: 0x39 */ exports.Fa9 = '9';
    /** char code: 0x41 */ exports.FaA = 'A';
    /** char code: 0xf2b9 */ exports.FaAddressBook = '';
    /** char code: 0xf2bb */ exports.FaAddressCard = '';
    /** char code: 0xf34e */ exports.FaAlarmClock = '';
    /** char code: 0xf037 */ exports.FaAlignCenter = '';
    /** char code: 0xf039 */ exports.FaAlignJustify = '';
    /** char code: 0xf036 */ exports.FaAlignLeft = '';
    /** char code: 0xf038 */ exports.FaAlignRight = '';
    /** char code: 0xf13d */ exports.FaAnchor = '';
    /** char code: 0xe4aa */ exports.FaAnchorCircleCheck = '';
    /** char code: 0xe4ab */ exports.FaAnchorCircleExclamation = '';
    /** char code: 0xe4ac */ exports.FaAnchorCircleXmark = '';
    /** char code: 0xe4ad */ exports.FaAnchorLock = '';
    /** char code: 0xf107 */ exports.FaAngleDown = '';
    /** char code: 0xf104 */ exports.FaAngleLeft = '';
    /** char code: 0xf105 */ exports.FaAngleRight = '';
    /** char code: 0xf106 */ exports.FaAngleUp = '';
    /** char code: 0xf103 */ exports.FaAnglesDown = '';
    /** char code: 0xf100 */ exports.FaAnglesLeft = '';
    /** char code: 0xf101 */ exports.FaAnglesRight = '';
    /** char code: 0xf102 */ exports.FaAnglesUp = '';
    /** char code: 0xf644 */ exports.FaAnkh = '';
    /** char code: 0xf5d1 */ exports.FaAppleWhole = '';
    /** char code: 0xf557 */ exports.FaArchway = '';
    /** char code: 0xf063 */ exports.FaArrowDown = '';
    /** char code: 0xf162 */ exports.FaArrowDown19 = '';
    /** char code: 0xf886 */ exports.FaArrowDown91 = '';
    /** char code: 0xf15d */ exports.FaArrowDownAZ = '';
    /** char code: 0xf175 */ exports.FaArrowDownLong = '';
    /** char code: 0xf884 */ exports.FaArrowDownShortWide = '';
    /** char code: 0xe4af */ exports.FaArrowDownUpAcrossLine = '';
    /** char code: 0xe4b0 */ exports.FaArrowDownUpLock = '';
    /** char code: 0xf160 */ exports.FaArrowDownWideShort = '';
    /** char code: 0xf881 */ exports.FaArrowDownZA = '';
    /** char code: 0xf060 */ exports.FaArrowLeft = '';
    /** char code: 0xf177 */ exports.FaArrowLeftLong = '';
    /** char code: 0xf245 */ exports.FaArrowPointer = '';
    /** char code: 0xf061 */ exports.FaArrowRight = '';
    /** char code: 0xf0ec */ exports.FaArrowRightArrowLeft = '';
    /** char code: 0xf08b */ exports.FaArrowRightFromBracket = '';
    /** char code: 0xf178 */ exports.FaArrowRightLong = '';
    /** char code: 0xf090 */ exports.FaArrowRightToBracket = '';
    /** char code: 0xe4b3 */ exports.FaArrowRightToCity = '';
    /** char code: 0xf0e2 */ exports.FaArrowRotateLeft = '';
    /** char code: 0xf01e */ exports.FaArrowRotateRight = '';
    /** char code: 0xe097 */ exports.FaArrowTrendDown = '';
    /** char code: 0xe098 */ exports.FaArrowTrendUp = '';
    /** char code: 0xf149 */ exports.FaArrowTurnDown = '';
    /** char code: 0xf148 */ exports.FaArrowTurnUp = '';
    /** char code: 0xf062 */ exports.FaArrowUp = '';
    /** char code: 0xf163 */ exports.FaArrowUp19 = '';
    /** char code: 0xf887 */ exports.FaArrowUp91 = '';
    /** char code: 0xf15e */ exports.FaArrowUpAZ = '';
    /** char code: 0xe09a */ exports.FaArrowUpFromBracket = '';
    /** char code: 0xe4b5 */ exports.FaArrowUpFromGroundWater = '';
    /** char code: 0xe4b6 */ exports.FaArrowUpFromWaterPump = '';
    /** char code: 0xf176 */ exports.FaArrowUpLong = '';
    /** char code: 0xe4b7 */ exports.FaArrowUpRightDots = '';
    /** char code: 0xf08e */ exports.FaArrowUpRightFromSquare = '';
    /** char code: 0xf885 */ exports.FaArrowUpShortWide = '';
    /** char code: 0xf161 */ exports.FaArrowUpWideShort = '';
    /** char code: 0xf882 */ exports.FaArrowUpZA = '';
    /** char code: 0xe4b8 */ exports.FaArrowsDownToLine = '';
    /** char code: 0xe4b9 */ exports.FaArrowsDownToPeople = '';
    /** char code: 0xf07e */ exports.FaArrowsLeftRight = '';
    /** char code: 0xe4ba */ exports.FaArrowsLeftRightToLine = '';
    /** char code: 0xf021 */ exports.FaArrowsRotate = '';
    /** char code: 0xe4bb */ exports.FaArrowsSpin = '';
    /** char code: 0xe4bc */ exports.FaArrowsSplitUpAndLeft = '';
    /** char code: 0xe4bd */ exports.FaArrowsToCircle = '';
    /** char code: 0xe4be */ exports.FaArrowsToDot = '';
    /** char code: 0xe4bf */ exports.FaArrowsToEye = '';
    /** char code: 0xe4c0 */ exports.FaArrowsTurnRight = '';
    /** char code: 0xe4c1 */ exports.FaArrowsTurnToDots = '';
    /** char code: 0xf07d */ exports.FaArrowsUpDown = '';
    /** char code: 0xf047 */ exports.FaArrowsUpDownLeftRight = '';
    /** char code: 0xe4c2 */ exports.FaArrowsUpToLine = '';
    /** char code: 0x2a */ exports.FaAsterisk = '*';
    /** char code: 0x40 */ exports.FaAt = '@';
    /** char code: 0xf5d2 */ exports.FaAtom = '';
    /** char code: 0xf29e */ exports.FaAudioDescription = '';
    /** char code: 0xe0a9 */ exports.FaAustralSign = '';
    /** char code: 0xf559 */ exports.FaAward = '';
    /** char code: 0x42 */ exports.FaB = 'B';
    /** char code: 0xf77c */ exports.FaBaby = '';
    /** char code: 0xf77d */ exports.FaBabyCarriage = '';
    /** char code: 0xf04a */ exports.FaBackward = '';
    /** char code: 0xf049 */ exports.FaBackwardFast = '';
    /** char code: 0xf048 */ exports.FaBackwardStep = '';
    /** char code: 0xf7e5 */ exports.FaBacon = '';
    /** char code: 0xe059 */ exports.FaBacteria = '';
    /** char code: 0xe05a */ exports.FaBacterium = '';
    /** char code: 0xf290 */ exports.FaBagShopping = '';
    /** char code: 0xf666 */ exports.FaBahai = '';
    /** char code: 0xe0ac */ exports.FaBahtSign = '';
    /** char code: 0xf05e */ exports.FaBan = '';
    /** char code: 0xf54d */ exports.FaBanSmoking = '';
    /** char code: 0xf462 */ exports.FaBandage = '';
    /** char code: 0xe2e6 */ exports.FaBangladeshiTakaSign = '';
    /** char code: 0xf02a */ exports.FaBarcode = '';
    /** char code: 0xf0c9 */ exports.FaBars = '';
    /** char code: 0xf828 */ exports.FaBarsProgress = '';
    /** char code: 0xf550 */ exports.FaBarsStaggered = '';
    /** char code: 0xf433 */ exports.FaBaseball = '';
    /** char code: 0xf432 */ exports.FaBaseballBatBall = '';
    /** char code: 0xf291 */ exports.FaBasketShopping = '';
    /** char code: 0xf434 */ exports.FaBasketball = '';
    /** char code: 0xf2cd */ exports.FaBath = '';
    /** char code: 0xf244 */ exports.FaBatteryEmpty = '';
    /** char code: 0xf240 */ exports.FaBatteryFull = '';
    /** char code: 0xf242 */ exports.FaBatteryHalf = '';
    /** char code: 0xf243 */ exports.FaBatteryQuarter = '';
    /** char code: 0xf241 */ exports.FaBatteryThreeQuarters = '';
    /** char code: 0xf236 */ exports.FaBed = '';
    /** char code: 0xf487 */ exports.FaBedPulse = '';
    /** char code: 0xf0fc */ exports.FaBeerMugEmpty = '';
    /** char code: 0xf0f3 */ exports.FaBell = '';
    /** char code: 0xf562 */ exports.FaBellConcierge = '';
    /** char code: 0xf1f6 */ exports.FaBellSlash = '';
    /** char code: 0xf55b */ exports.FaBezierCurve = '';
    /** char code: 0xf206 */ exports.FaBicycle = '';
    /** char code: 0xf1e5 */ exports.FaBinoculars = '';
    /** char code: 0xf780 */ exports.FaBiohazard = '';
    /** char code: 0xe0b4 */ exports.FaBitcoinSign = '';
    /** char code: 0xf517 */ exports.FaBlender = '';
    /** char code: 0xf6b6 */ exports.FaBlenderPhone = '';
    /** char code: 0xf781 */ exports.FaBlog = '';
    /** char code: 0xf032 */ exports.FaBold = '';
    /** char code: 0xf0e7 */ exports.FaBolt = '';
    /** char code: 0xe0b7 */ exports.FaBoltLightning = '';
    /** char code: 0xf1e2 */ exports.FaBomb = '';
    /** char code: 0xf5d7 */ exports.FaBone = '';
    /** char code: 0xf55c */ exports.FaBong = '';
    /** char code: 0xf02d */ exports.FaBook = '';
    /** char code: 0xf558 */ exports.FaBookAtlas = '';
    /** char code: 0xf647 */ exports.FaBookBible = '';
    /** char code: 0xe0bb */ exports.FaBookBookmark = '';
    /** char code: 0xf66a */ exports.FaBookJournalWhills = '';
    /** char code: 0xf7e6 */ exports.FaBookMedical = '';
    /** char code: 0xf518 */ exports.FaBookOpen = '';
    /** char code: 0xf5da */ exports.FaBookOpenReader = '';
    /** char code: 0xf687 */ exports.FaBookQuran = '';
    /** char code: 0xf6b7 */ exports.FaBookSkull = '';
    /** char code: 0xf827 */ exports.FaBookTanakh = '';
    /** char code: 0xf02e */ exports.FaBookmark = '';
    /** char code: 0xf84c */ exports.FaBorderAll = '';
    /** char code: 0xf850 */ exports.FaBorderNone = '';
    /** char code: 0xf853 */ exports.FaBorderTopLeft = '';
    /** char code: 0xe4c3 */ exports.FaBoreHole = '';
    /** char code: 0xe4c4 */ exports.FaBottleDroplet = '';
    /** char code: 0xe4c5 */ exports.FaBottleWater = '';
    /** char code: 0xe4c6 */ exports.FaBowlFood = '';
    /** char code: 0xe2eb */ exports.FaBowlRice = '';
    /** char code: 0xf436 */ exports.FaBowlingBall = '';
    /** char code: 0xf466 */ exports.FaBox = '';
    /** char code: 0xf187 */ exports.FaBoxArchive = '';
    /** char code: 0xf49e */ exports.FaBoxOpen = '';
    /** char code: 0xe05b */ exports.FaBoxTissue = '';
    /** char code: 0xe4c7 */ exports.FaBoxesPacking = '';
    /** char code: 0xf468 */ exports.FaBoxesStacked = '';
    /** char code: 0xf2a1 */ exports.FaBraille = '';
    /** char code: 0xf5dc */ exports.FaBrain = '';
    /** char code: 0xe46c */ exports.FaBrazilianRealSign = '';
    /** char code: 0xf7ec */ exports.FaBreadSlice = '';
    /** char code: 0xe4c8 */ exports.FaBridge = '';
    /** char code: 0xe4c9 */ exports.FaBridgeCircleCheck = '';
    /** char code: 0xe4ca */ exports.FaBridgeCircleExclamation = '';
    /** char code: 0xe4cb */ exports.FaBridgeCircleXmark = '';
    /** char code: 0xe4cc */ exports.FaBridgeLock = '';
    /** char code: 0xe4ce */ exports.FaBridgeWater = '';
    /** char code: 0xf0b1 */ exports.FaBriefcase = '';
    /** char code: 0xf469 */ exports.FaBriefcaseMedical = '';
    /** char code: 0xf51a */ exports.FaBroom = '';
    /** char code: 0xf458 */ exports.FaBroomBall = '';
    /** char code: 0xf55d */ exports.FaBrush = '';
    /** char code: 0xe4cf */ exports.FaBucket = '';
    /** char code: 0xf188 */ exports.FaBug = '';
    /** char code: 0xe490 */ exports.FaBugSlash = '';
    /** char code: 0xe4d0 */ exports.FaBugs = '';
    /** char code: 0xf1ad */ exports.FaBuilding = '';
    /** char code: 0xe4d1 */ exports.FaBuildingCircleArrowRight = '';
    /** char code: 0xe4d2 */ exports.FaBuildingCircleCheck = '';
    /** char code: 0xe4d3 */ exports.FaBuildingCircleExclamation = '';
    /** char code: 0xe4d4 */ exports.FaBuildingCircleXmark = '';
    /** char code: 0xf19c */ exports.FaBuildingColumns = '';
    /** char code: 0xe4d5 */ exports.FaBuildingFlag = '';
    /** char code: 0xe4d6 */ exports.FaBuildingLock = '';
    /** char code: 0xe4d7 */ exports.FaBuildingNgo = '';
    /** char code: 0xe4d8 */ exports.FaBuildingShield = '';
    /** char code: 0xe4d9 */ exports.FaBuildingUn = '';
    /** char code: 0xe4da */ exports.FaBuildingUser = '';
    /** char code: 0xe4db */ exports.FaBuildingWheat = '';
    /** char code: 0xf0a1 */ exports.FaBullhorn = '';
    /** char code: 0xf140 */ exports.FaBullseye = '';
    /** char code: 0xf805 */ exports.FaBurger = '';
    /** char code: 0xe4dc */ exports.FaBurst = '';
    /** char code: 0xf207 */ exports.FaBus = '';
    /** char code: 0xe81d */ exports.FaBusSide = '';
    /** char code: 0xf55e */ exports.FaBusSimple = '';
    /** char code: 0xf64a */ exports.FaBusinessTime = '';
    /** char code: 0x43 */ exports.FaC = 'C';
    /** char code: 0xf7da */ exports.FaCableCar = '';
    /** char code: 0xf1fd */ exports.FaCakeCandles = '';
    /** char code: 0xf1ec */ exports.FaCalculator = '';
    /** char code: 0xf133 */ exports.FaCalendar = '';
    /** char code: 0xf274 */ exports.FaCalendarCheck = '';
    /** char code: 0xf783 */ exports.FaCalendarDay = '';
    /** char code: 0xf073 */ exports.FaCalendarDays = '';
    /** char code: 0xf272 */ exports.FaCalendarMinus = '';
    /** char code: 0xf271 */ exports.FaCalendarPlus = '';
    /** char code: 0xf784 */ exports.FaCalendarWeek = '';
    /** char code: 0xf273 */ exports.FaCalendarXmark = '';
    /** char code: 0xf030 */ exports.FaCamera = '';
    /** char code: 0xf083 */ exports.FaCameraRetro = '';
    /** char code: 0xe0d8 */ exports.FaCameraRotate = '';
    /** char code: 0xf6bb */ exports.FaCampground = '';
    /** char code: 0xf786 */ exports.FaCandyCane = '';
    /** char code: 0xf55f */ exports.FaCannabis = '';
    /** char code: 0xf46b */ exports.FaCapsules = '';
    /** char code: 0xf1b9 */ exports.FaCar = '';
    /** char code: 0xf5df */ exports.FaCarBattery = '';
    /** char code: 0xf5e1 */ exports.FaCarBurst = '';
    /** char code: 0xe4dd */ exports.FaCarOn = '';
    /** char code: 0xf5de */ exports.FaCarRear = '';
    /** char code: 0xf5e4 */ exports.FaCarSide = '';
    /** char code: 0xe4de */ exports.FaCarTunnel = '';
    /** char code: 0xf8ff */ exports.FaCaravan = '';
    /** char code: 0xf0d7 */ exports.FaCaretDown = '';
    /** char code: 0xf0d9 */ exports.FaCaretLeft = '';
    /** char code: 0xf0da */ exports.FaCaretRight = '';
    /** char code: 0xf0d8 */ exports.FaCaretUp = '';
    /** char code: 0xf787 */ exports.FaCarrot = '';
    /** char code: 0xf218 */ exports.FaCartArrowDown = '';
    /** char code: 0xf474 */ exports.FaCartFlatbed = '';
    /** char code: 0xf59d */ exports.FaCartFlatbedSuitcase = '';
    /** char code: 0xf217 */ exports.FaCartPlus = '';
    /** char code: 0xf07a */ exports.FaCartShopping = '';
    /** char code: 0xf788 */ exports.FaCashRegister = '';
    /** char code: 0xf6be */ exports.FaCat = '';
    /** char code: 0xe0df */ exports.FaCediSign = '';
    /** char code: 0xe3f5 */ exports.FaCentSign = '';
    /** char code: 0xf0a3 */ exports.FaCertificate = '';
    /** char code: 0xf6c0 */ exports.FaChair = '';
    /** char code: 0xf51b */ exports.FaChalkboard = '';
    /** char code: 0xf51c */ exports.FaChalkboardUser = '';
    /** char code: 0xf79f */ exports.FaChampagneGlasses = '';
    /** char code: 0xf5e7 */ exports.FaChargingStation = '';
    /** char code: 0xf1fe */ exports.FaChartArea = '';
    /** char code: 0xf080 */ exports.FaChartBar = '';
    /** char code: 0xe0e3 */ exports.FaChartColumn = '';
    /** char code: 0xe695 */ exports.FaChartDiagram = '';
    /** char code: 0xe0e4 */ exports.FaChartGantt = '';
    /** char code: 0xf201 */ exports.FaChartLine = '';
    /** char code: 0xf200 */ exports.FaChartPie = '';
    /** char code: 0xe473 */ exports.FaChartSimple = '';
    /** char code: 0xf00c */ exports.FaCheck = '';
    /** char code: 0xf560 */ exports.FaCheckDouble = '';
    /** char code: 0xf772 */ exports.FaCheckToSlot = '';
    /** char code: 0xf7ef */ exports.FaCheese = '';
    /** char code: 0xf439 */ exports.FaChess = '';
    /** char code: 0xf43a */ exports.FaChessBishop = '';
    /** char code: 0xf43c */ exports.FaChessBoard = '';
    /** char code: 0xf43f */ exports.FaChessKing = '';
    /** char code: 0xf441 */ exports.FaChessKnight = '';
    /** char code: 0xf443 */ exports.FaChessPawn = '';
    /** char code: 0xf445 */ exports.FaChessQueen = '';
    /** char code: 0xf447 */ exports.FaChessRook = '';
    /** char code: 0xf078 */ exports.FaChevronDown = '';
    /** char code: 0xf053 */ exports.FaChevronLeft = '';
    /** char code: 0xf054 */ exports.FaChevronRight = '';
    /** char code: 0xf077 */ exports.FaChevronUp = '';
    /** char code: 0xf1ae */ exports.FaChild = '';
    /** char code: 0xe4e0 */ exports.FaChildCombatant = '';
    /** char code: 0xe59c */ exports.FaChildDress = '';
    /** char code: 0xe59d */ exports.FaChildReaching = '';
    /** char code: 0xe4e1 */ exports.FaChildren = '';
    /** char code: 0xf51d */ exports.FaChurch = '';
    /** char code: 0xf111 */ exports.FaCircle = '';
    /** char code: 0xf0ab */ exports.FaCircleArrowDown = '';
    /** char code: 0xf0a8 */ exports.FaCircleArrowLeft = '';
    /** char code: 0xf0a9 */ exports.FaCircleArrowRight = '';
    /** char code: 0xf0aa */ exports.FaCircleArrowUp = '';
    /** char code: 0xf058 */ exports.FaCircleCheck = '';
    /** char code: 0xf13a */ exports.FaCircleChevronDown = '';
    /** char code: 0xf137 */ exports.FaCircleChevronLeft = '';
    /** char code: 0xf138 */ exports.FaCircleChevronRight = '';
    /** char code: 0xf139 */ exports.FaCircleChevronUp = '';
    /** char code: 0xf4b9 */ exports.FaCircleDollarToSlot = '';
    /** char code: 0xf192 */ exports.FaCircleDot = '';
    /** char code: 0xf358 */ exports.FaCircleDown = '';
    /** char code: 0xf06a */ exports.FaCircleExclamation = '';
    /** char code: 0xf47e */ exports.FaCircleH = '';
    /** char code: 0xf042 */ exports.FaCircleHalfStroke = '';
    /** char code: 0xf05a */ exports.FaCircleInfo = '';
    /** char code: 0xf359 */ exports.FaCircleLeft = '';
    /** char code: 0xf056 */ exports.FaCircleMinus = '';
    /** char code: 0xe4e2 */ exports.FaCircleNodes = '';
    /** char code: 0xf1ce */ exports.FaCircleNotch = '';
    /** char code: 0xf28b */ exports.FaCirclePause = '';
    /** char code: 0xf144 */ exports.FaCirclePlay = '';
    /** char code: 0xf055 */ exports.FaCirclePlus = '';
    /** char code: 0xf059 */ exports.FaCircleQuestion = '';
    /** char code: 0xf7ba */ exports.FaCircleRadiation = '';
    /** char code: 0xf35a */ exports.FaCircleRight = '';
    /** char code: 0xf28d */ exports.FaCircleStop = '';
    /** char code: 0xf35b */ exports.FaCircleUp = '';
    /** char code: 0xf2bd */ exports.FaCircleUser = '';
    /** char code: 0xf057 */ exports.FaCircleXmark = '';
    /** char code: 0xf64f */ exports.FaCity = '';
    /** char code: 0xe131 */ exports.FaClapperboard = '';
    /** char code: 0xf328 */ exports.FaClipboard = '';
    /** char code: 0xf46c */ exports.FaClipboardCheck = '';
    /** char code: 0xf46d */ exports.FaClipboardList = '';
    /** char code: 0xe4e3 */ exports.FaClipboardQuestion = '';
    /** char code: 0xf7f3 */ exports.FaClipboardUser = '';
    /** char code: 0xf017 */ exports.FaClock = '';
    /** char code: 0xf1da */ exports.FaClockRotateLeft = '';
    /** char code: 0xf24d */ exports.FaClone = '';
    /** char code: 0xf20a */ exports.FaClosedCaptioning = '';
    /** char code: 0xf0c2 */ exports.FaCloud = '';
    /** char code: 0xf0ed */ exports.FaCloudArrowDown = '';
    /** char code: 0xf0ee */ exports.FaCloudArrowUp = '';
    /** char code: 0xf76c */ exports.FaCloudBolt = '';
    /** char code: 0xf73b */ exports.FaCloudMeatball = '';
    /** char code: 0xf6c3 */ exports.FaCloudMoon = '';
    /** char code: 0xf73c */ exports.FaCloudMoonRain = '';
    /** char code: 0xf73d */ exports.FaCloudRain = '';
    /** char code: 0xf740 */ exports.FaCloudShowersHeavy = '';
    /** char code: 0xe4e4 */ exports.FaCloudShowersWater = '';
    /** char code: 0xf6c4 */ exports.FaCloudSun = '';
    /** char code: 0xf743 */ exports.FaCloudSunRain = '';
    /** char code: 0xe139 */ exports.FaClover = '';
    /** char code: 0xf121 */ exports.FaCode = '';
    /** char code: 0xf126 */ exports.FaCodeBranch = '';
    /** char code: 0xf386 */ exports.FaCodeCommit = '';
    /** char code: 0xe13a */ exports.FaCodeCompare = '';
    /** char code: 0xe13b */ exports.FaCodeFork = '';
    /** char code: 0xf387 */ exports.FaCodeMerge = '';
    /** char code: 0xe13c */ exports.FaCodePullRequest = '';
    /** char code: 0xf51e */ exports.FaCoins = '';
    /** char code: 0xe140 */ exports.FaColonSign = '';
    /** char code: 0xf075 */ exports.FaComment = '';
    /** char code: 0xf651 */ exports.FaCommentDollar = '';
    /** char code: 0xf4ad */ exports.FaCommentDots = '';
    /** char code: 0xf7f5 */ exports.FaCommentMedical = '';
    /** char code: 0xe696 */ exports.FaCommentNodes = '';
    /** char code: 0xf4b3 */ exports.FaCommentSlash = '';
    /** char code: 0xf7cd */ exports.FaCommentSms = '';
    /** char code: 0xf086 */ exports.FaComments = '';
    /** char code: 0xf653 */ exports.FaCommentsDollar = '';
    /** char code: 0xf51f */ exports.FaCompactDisc = '';
    /** char code: 0xf14e */ exports.FaCompass = '';
    /** char code: 0xf568 */ exports.FaCompassDrafting = '';
    /** char code: 0xf066 */ exports.FaCompress = '';
    /** char code: 0xe4e5 */ exports.FaComputer = '';
    /** char code: 0xf8cc */ exports.FaComputerMouse = '';
    /** char code: 0xf563 */ exports.FaCookie = '';
    /** char code: 0xf564 */ exports.FaCookieBite = '';
    /** char code: 0xf0c5 */ exports.FaCopy = '';
    /** char code: 0xf1f9 */ exports.FaCopyright = '';
    /** char code: 0xf4b8 */ exports.FaCouch = '';
    /** char code: 0xf6c8 */ exports.FaCow = '';
    /** char code: 0xf09d */ exports.FaCreditCard = '';
    /** char code: 0xf125 */ exports.FaCrop = '';
    /** char code: 0xf565 */ exports.FaCropSimple = '';
    /** char code: 0xf654 */ exports.FaCross = '';
    /** char code: 0xf05b */ exports.FaCrosshairs = '';
    /** char code: 0xf520 */ exports.FaCrow = '';
    /** char code: 0xf521 */ exports.FaCrown = '';
    /** char code: 0xf7f7 */ exports.FaCrutch = '';
    /** char code: 0xe152 */ exports.FaCruzeiroSign = '';
    /** char code: 0xf1b2 */ exports.FaCube = '';
    /** char code: 0xf1b3 */ exports.FaCubes = '';
    /** char code: 0xe4e6 */ exports.FaCubesStacked = '';
    /** char code: 0x44 */ exports.FaD = 'D';
    /** char code: 0xf1c0 */ exports.FaDatabase = '';
    /** char code: 0xf55a */ exports.FaDeleteLeft = '';
    /** char code: 0xf747 */ exports.FaDemocrat = '';
    /** char code: 0xf390 */ exports.FaDesktop = '';
    /** char code: 0xf655 */ exports.FaDharmachakra = '';
    /** char code: 0xe476 */ exports.FaDiagramNext = '';
    /** char code: 0xe477 */ exports.FaDiagramPredecessor = '';
    /** char code: 0xf542 */ exports.FaDiagramProject = '';
    /** char code: 0xe47a */ exports.FaDiagramSuccessor = '';
    /** char code: 0xf219 */ exports.FaDiamond = '';
    /** char code: 0xf5eb */ exports.FaDiamondTurnRight = '';
    /** char code: 0xf522 */ exports.FaDice = '';
    /** char code: 0xf6cf */ exports.FaDiceD20 = '';
    /** char code: 0xf6d1 */ exports.FaDiceD6 = '';
    /** char code: 0xf523 */ exports.FaDiceFive = '';
    /** char code: 0xf524 */ exports.FaDiceFour = '';
    /** char code: 0xf525 */ exports.FaDiceOne = '';
    /** char code: 0xf526 */ exports.FaDiceSix = '';
    /** char code: 0xf527 */ exports.FaDiceThree = '';
    /** char code: 0xf528 */ exports.FaDiceTwo = '';
    /** char code: 0xf7fa */ exports.FaDisease = '';
    /** char code: 0xe163 */ exports.FaDisplay = '';
    /** char code: 0xf529 */ exports.FaDivide = '';
    /** char code: 0xf471 */ exports.FaDna = '';
    /** char code: 0xf6d3 */ exports.FaDog = '';
    /** char code: 0x24 */ exports.FaDollarSign = '$';
    /** char code: 0xf472 */ exports.FaDolly = '';
    /** char code: 0xe169 */ exports.FaDongSign = '';
    /** char code: 0xf52a */ exports.FaDoorClosed = '';
    /** char code: 0xf52b */ exports.FaDoorOpen = '';
    /** char code: 0xf4ba */ exports.FaDove = '';
    /** char code: 0xf422 */ exports.FaDownLeftAndUpRightToCenter = '';
    /** char code: 0xf309 */ exports.FaDownLong = '';
    /** char code: 0xf019 */ exports.FaDownload = '';
    /** char code: 0xf6d5 */ exports.FaDragon = '';
    /** char code: 0xf5ee */ exports.FaDrawPolygon = '';
    /** char code: 0xf043 */ exports.FaDroplet = '';
    /** char code: 0xf5c7 */ exports.FaDropletSlash = '';
    /** char code: 0xf569 */ exports.FaDrum = '';
    /** char code: 0xf56a */ exports.FaDrumSteelpan = '';
    /** char code: 0xf6d7 */ exports.FaDrumstickBite = '';
    /** char code: 0xf44b */ exports.FaDumbbell = '';
    /** char code: 0xf793 */ exports.FaDumpster = '';
    /** char code: 0xf794 */ exports.FaDumpsterFire = '';
    /** char code: 0xf6d9 */ exports.FaDungeon = '';
    /** char code: 0x45 */ exports.FaE = 'E';
    /** char code: 0xf2a4 */ exports.FaEarDeaf = '';
    /** char code: 0xf2a2 */ exports.FaEarListen = '';
    /** char code: 0xf57c */ exports.FaEarthAfrica = '';
    /** char code: 0xf57d */ exports.FaEarthAmericas = '';
    /** char code: 0xf57e */ exports.FaEarthAsia = '';
    /** char code: 0xf7a2 */ exports.FaEarthEurope = '';
    /** char code: 0xe47b */ exports.FaEarthOceania = '';
    /** char code: 0xf7fb */ exports.FaEgg = '';
    /** char code: 0xf052 */ exports.FaEject = '';
    /** char code: 0xe16d */ exports.FaElevator = '';
    /** char code: 0xf141 */ exports.FaEllipsis = '';
    /** char code: 0xf142 */ exports.FaEllipsisVertical = '';
    /** char code: 0xf0e0 */ exports.FaEnvelope = '';
    /** char code: 0xe4e8 */ exports.FaEnvelopeCircleCheck = '';
    /** char code: 0xf2b6 */ exports.FaEnvelopeOpen = '';
    /** char code: 0xf658 */ exports.FaEnvelopeOpenText = '';
    /** char code: 0xf674 */ exports.FaEnvelopesBulk = '';
    /** char code: 0x3d */ exports.FaEquals = '=';
    /** char code: 0xf12d */ exports.FaEraser = '';
    /** char code: 0xf796 */ exports.FaEthernet = '';
    /** char code: 0xf153 */ exports.FaEuroSign = '';
    /** char code: 0x21 */ exports.FaExclamation = '!';
    /** char code: 0xf065 */ exports.FaExpand = '';
    /** char code: 0xe4e9 */ exports.FaExplosion = '';
    /** char code: 0xf06e */ exports.FaEye = '';
    /** char code: 0xf1fb */ exports.FaEyeDropper = '';
    /** char code: 0xf2a8 */ exports.FaEyeLowVision = '';
    /** char code: 0xf070 */ exports.FaEyeSlash = '';
    /** char code: 0x46 */ exports.FaF = 'F';
    /** char code: 0xf556 */ exports.FaFaceAngry = '';
    /** char code: 0xf567 */ exports.FaFaceDizzy = '';
    /** char code: 0xf579 */ exports.FaFaceFlushed = '';
    /** char code: 0xf119 */ exports.FaFaceFrown = '';
    /** char code: 0xf57a */ exports.FaFaceFrownOpen = '';
    /** char code: 0xf57f */ exports.FaFaceGrimace = '';
    /** char code: 0xf580 */ exports.FaFaceGrin = '';
    /** char code: 0xf582 */ exports.FaFaceGrinBeam = '';
    /** char code: 0xf583 */ exports.FaFaceGrinBeamSweat = '';
    /** char code: 0xf584 */ exports.FaFaceGrinHearts = '';
    /** char code: 0xf585 */ exports.FaFaceGrinSquint = '';
    /** char code: 0xf586 */ exports.FaFaceGrinSquintTears = '';
    /** char code: 0xf587 */ exports.FaFaceGrinStars = '';
    /** char code: 0xf588 */ exports.FaFaceGrinTears = '';
    /** char code: 0xf589 */ exports.FaFaceGrinTongue = '';
    /** char code: 0xf58a */ exports.FaFaceGrinTongueSquint = '';
    /** char code: 0xf58b */ exports.FaFaceGrinTongueWink = '';
    /** char code: 0xf581 */ exports.FaFaceGrinWide = '';
    /** char code: 0xf58c */ exports.FaFaceGrinWink = '';
    /** char code: 0xf596 */ exports.FaFaceKiss = '';
    /** char code: 0xf597 */ exports.FaFaceKissBeam = '';
    /** char code: 0xf598 */ exports.FaFaceKissWinkHeart = '';
    /** char code: 0xf599 */ exports.FaFaceLaugh = '';
    /** char code: 0xf59a */ exports.FaFaceLaughBeam = '';
    /** char code: 0xf59b */ exports.FaFaceLaughSquint = '';
    /** char code: 0xf59c */ exports.FaFaceLaughWink = '';
    /** char code: 0xf11a */ exports.FaFaceMeh = '';
    /** char code: 0xf5a4 */ exports.FaFaceMehBlank = '';
    /** char code: 0xf5a5 */ exports.FaFaceRollingEyes = '';
    /** char code: 0xf5b3 */ exports.FaFaceSadCry = '';
    /** char code: 0xf5b4 */ exports.FaFaceSadTear = '';
    /** char code: 0xf118 */ exports.FaFaceSmile = '';
    /** char code: 0xf5b8 */ exports.FaFaceSmileBeam = '';
    /** char code: 0xf4da */ exports.FaFaceSmileWink = '';
    /** char code: 0xf5c2 */ exports.FaFaceSurprise = '';
    /** char code: 0xf5c8 */ exports.FaFaceTired = '';
    /** char code: 0xf863 */ exports.FaFan = '';
    /** char code: 0xe005 */ exports.FaFaucet = '';
    /** char code: 0xe006 */ exports.FaFaucetDrip = '';
    /** char code: 0xf1ac */ exports.FaFax = '';
    /** char code: 0xf52d */ exports.FaFeather = '';
    /** char code: 0xf56b */ exports.FaFeatherPointed = '';
    /** char code: 0xe4ea */ exports.FaFerry = '';
    /** char code: 0xf15b */ exports.FaFile = '';
    /** char code: 0xf56d */ exports.FaFileArrowDown = '';
    /** char code: 0xf574 */ exports.FaFileArrowUp = '';
    /** char code: 0xf1c7 */ exports.FaFileAudio = '';
    /** char code: 0xe5a0 */ exports.FaFileCircleCheck = '';
    /** char code: 0xe4eb */ exports.FaFileCircleExclamation = '';
    /** char code: 0xe4ed */ exports.FaFileCircleMinus = '';
    /** char code: 0xe494 */ exports.FaFileCirclePlus = '';
    /** char code: 0xe4ef */ exports.FaFileCircleQuestion = '';
    /** char code: 0xe5a1 */ exports.FaFileCircleXmark = '';
    /** char code: 0xf1c9 */ exports.FaFileCode = '';
    /** char code: 0xf56c */ exports.FaFileContract = '';
    /** char code: 0xf6dd */ exports.FaFileCsv = '';
    /** char code: 0xf1c3 */ exports.FaFileExcel = '';
    /** char code: 0xf56e */ exports.FaFileExport = '';
    /** char code: 0xe697 */ exports.FaFileFragment = '';
    /** char code: 0xe698 */ exports.FaFileHalfDashed = '';
    /** char code: 0xf1c5 */ exports.FaFileImage = '';
    /** char code: 0xf56f */ exports.FaFileImport = '';
    /** char code: 0xf570 */ exports.FaFileInvoice = '';
    /** char code: 0xf571 */ exports.FaFileInvoiceDollar = '';
    /** char code: 0xf15c */ exports.FaFileLines = '';
    /** char code: 0xf477 */ exports.FaFileMedical = '';
    /** char code: 0xf1c1 */ exports.FaFilePdf = '';
    /** char code: 0xf31c */ exports.FaFilePen = '';
    /** char code: 0xf1c4 */ exports.FaFilePowerpoint = '';
    /** char code: 0xf572 */ exports.FaFilePrescription = '';
    /** char code: 0xe4f0 */ exports.FaFileShield = '';
    /** char code: 0xf573 */ exports.FaFileSignature = '';
    /** char code: 0xf1c8 */ exports.FaFileVideo = '';
    /** char code: 0xf478 */ exports.FaFileWaveform = '';
    /** char code: 0xf1c2 */ exports.FaFileWord = '';
    /** char code: 0xf1c6 */ exports.FaFileZipper = '';
    /** char code: 0xf575 */ exports.FaFill = '';
    /** char code: 0xf576 */ exports.FaFillDrip = '';
    /** char code: 0xf008 */ exports.FaFilm = '';
    /** char code: 0xf0b0 */ exports.FaFilter = '';
    /** char code: 0xf662 */ exports.FaFilterCircleDollar = '';
    /** char code: 0xe17b */ exports.FaFilterCircleXmark = '';
    /** char code: 0xf577 */ exports.FaFingerprint = '';
    /** char code: 0xf06d */ exports.FaFire = '';
    /** char code: 0xe4f1 */ exports.FaFireBurner = '';
    /** char code: 0xf134 */ exports.FaFireExtinguisher = '';
    /** char code: 0xf7e4 */ exports.FaFireFlameCurved = '';
    /** char code: 0xf46a */ exports.FaFireFlameSimple = '';
    /** char code: 0xf578 */ exports.FaFish = '';
    /** char code: 0xe4f2 */ exports.FaFishFins = '';
    /** char code: 0xf024 */ exports.FaFlag = '';
    /** char code: 0xf11e */ exports.FaFlagCheckered = '';
    /** char code: 0xf74d */ exports.FaFlagUsa = '';
    /** char code: 0xf0c3 */ exports.FaFlask = '';
    /** char code: 0xe4f3 */ exports.FaFlaskVial = '';
    /** char code: 0xf0c7 */ exports.FaFloppyDisk = '';
    /** char code: 0xe184 */ exports.FaFlorinSign = '';
    /** char code: 0xf07b */ exports.FaFolder = '';
    /** char code: 0xe185 */ exports.FaFolderClosed = '';
    /** char code: 0xf65d */ exports.FaFolderMinus = '';
    /** char code: 0xf07c */ exports.FaFolderOpen = '';
    /** char code: 0xf65e */ exports.FaFolderPlus = '';
    /** char code: 0xf802 */ exports.FaFolderTree = '';
    /** char code: 0xf031 */ exports.FaFont = '';
    /** char code: 0xf2b4 */ exports.FaFontAwesome = '';
    /** char code: 0xf44e */ exports.FaFootball = '';
    /** char code: 0xf04e */ exports.FaForward = '';
    /** char code: 0xf050 */ exports.FaForwardFast = '';
    /** char code: 0xf051 */ exports.FaForwardStep = '';
    /** char code: 0xe18f */ exports.FaFrancSign = '';
    /** char code: 0xf52e */ exports.FaFrog = '';
    /** char code: 0xf1e3 */ exports.FaFutbol = '';
    /** char code: 0x47 */ exports.FaG = 'G';
    /** char code: 0xf11b */ exports.FaGamepad = '';
    /** char code: 0xf52f */ exports.FaGasPump = '';
    /** char code: 0xf624 */ exports.FaGauge = '';
    /** char code: 0xf625 */ exports.FaGaugeHigh = '';
    /** char code: 0xf629 */ exports.FaGaugeSimple = '';
    /** char code: 0xf62a */ exports.FaGaugeSimpleHigh = '';
    /** char code: 0xf0e3 */ exports.FaGavel = '';
    /** char code: 0xf013 */ exports.FaGear = '';
    /** char code: 0xf085 */ exports.FaGears = '';
    /** char code: 0xf3a5 */ exports.FaGem = '';
    /** char code: 0xf22d */ exports.FaGenderless = '';
    /** char code: 0xf6e2 */ exports.FaGhost = '';
    /** char code: 0xf06b */ exports.FaGift = '';
    /** char code: 0xf79c */ exports.FaGifts = '';
    /** char code: 0xe4f4 */ exports.FaGlassWater = '';
    /** char code: 0xe4f5 */ exports.FaGlassWaterDroplet = '';
    /** char code: 0xf530 */ exports.FaGlasses = '';
    /** char code: 0xf0ac */ exports.FaGlobe = '';
    /** char code: 0xf450 */ exports.FaGolfBallTee = '';
    /** char code: 0xf664 */ exports.FaGopuram = '';
    /** char code: 0xf19d */ exports.FaGraduationCap = '';
    /** char code: 0x3e */ exports.FaGreaterThan = '>';
    /** char code: 0xf532 */ exports.FaGreaterThanEqual = '';
    /** char code: 0xf58d */ exports.FaGrip = '';
    /** char code: 0xf7a4 */ exports.FaGripLines = '';
    /** char code: 0xf7a5 */ exports.FaGripLinesVertical = '';
    /** char code: 0xf58e */ exports.FaGripVertical = '';
    /** char code: 0xe4f6 */ exports.FaGroupArrowsRotate = '';
    /** char code: 0xe19a */ exports.FaGuaraniSign = '';
    /** char code: 0xf7a6 */ exports.FaGuitar = '';
    /** char code: 0xe19b */ exports.FaGun = '';
    /** char code: 0x48 */ exports.FaH = 'H';
    /** char code: 0xf6e3 */ exports.FaHammer = '';
    /** char code: 0xf665 */ exports.FaHamsa = '';
    /** char code: 0xf256 */ exports.FaHand = '';
    /** char code: 0xf255 */ exports.FaHandBackFist = '';
    /** char code: 0xf461 */ exports.FaHandDots = '';
    /** char code: 0xf6de */ exports.FaHandFist = '';
    /** char code: 0xf4bd */ exports.FaHandHolding = '';
    /** char code: 0xf4c0 */ exports.FaHandHoldingDollar = '';
    /** char code: 0xf4c1 */ exports.FaHandHoldingDroplet = '';
    /** char code: 0xe4f7 */ exports.FaHandHoldingHand = '';
    /** char code: 0xf4be */ exports.FaHandHoldingHeart = '';
    /** char code: 0xe05c */ exports.FaHandHoldingMedical = '';
    /** char code: 0xf258 */ exports.FaHandLizard = '';
    /** char code: 0xf806 */ exports.FaHandMiddleFinger = '';
    /** char code: 0xf25b */ exports.FaHandPeace = '';
    /** char code: 0xf0a7 */ exports.FaHandPointDown = '';
    /** char code: 0xf0a5 */ exports.FaHandPointLeft = '';
    /** char code: 0xf0a4 */ exports.FaHandPointRight = '';
    /** char code: 0xf0a6 */ exports.FaHandPointUp = '';
    /** char code: 0xf25a */ exports.FaHandPointer = '';
    /** char code: 0xf257 */ exports.FaHandScissors = '';
    /** char code: 0xe05d */ exports.FaHandSparkles = '';
    /** char code: 0xf259 */ exports.FaHandSpock = '';
    /** char code: 0xe4f8 */ exports.FaHandcuffs = '';
    /** char code: 0xf2a7 */ exports.FaHands = '';
    /** char code: 0xf2a3 */ exports.FaHandsAslInterpreting = '';
    /** char code: 0xe4f9 */ exports.FaHandsBound = '';
    /** char code: 0xe05e */ exports.FaHandsBubbles = '';
    /** char code: 0xe1a8 */ exports.FaHandsClapping = '';
    /** char code: 0xf4c2 */ exports.FaHandsHolding = '';
    /** char code: 0xe4fa */ exports.FaHandsHoldingChild = '';
    /** char code: 0xe4fb */ exports.FaHandsHoldingCircle = '';
    /** char code: 0xf684 */ exports.FaHandsPraying = '';
    /** char code: 0xf2b5 */ exports.FaHandshake = '';
    /** char code: 0xf4c4 */ exports.FaHandshakeAngle = '';
    /** char code: 0xe060 */ exports.FaHandshakeSlash = '';
    /** char code: 0xf6e6 */ exports.FaHanukiah = '';
    /** char code: 0xf0a0 */ exports.FaHardDrive = '';
    /** char code: 0x23 */ exports.FaHashtag = '#';
    /** char code: 0xf8c0 */ exports.FaHatCowboy = '';
    /** char code: 0xf8c1 */ exports.FaHatCowboySide = '';
    /** char code: 0xf6e8 */ exports.FaHatWizard = '';
    /** char code: 0xe061 */ exports.FaHeadSideCough = '';
    /** char code: 0xe062 */ exports.FaHeadSideCoughSlash = '';
    /** char code: 0xe063 */ exports.FaHeadSideMask = '';
    /** char code: 0xe064 */ exports.FaHeadSideVirus = '';
    /** char code: 0xf1dc */ exports.FaHeading = '';
    /** char code: 0xf025 */ exports.FaHeadphones = '';
    /** char code: 0xf590 */ exports.FaHeadset = '';
    /** char code: 0xf004 */ exports.FaHeart = '';
    /** char code: 0xe4fc */ exports.FaHeartCircleBolt = '';
    /** char code: 0xe4fd */ exports.FaHeartCircleCheck = '';
    /** char code: 0xe4fe */ exports.FaHeartCircleExclamation = '';
    /** char code: 0xe4ff */ exports.FaHeartCircleMinus = '';
    /** char code: 0xe500 */ exports.FaHeartCirclePlus = '';
    /** char code: 0xe501 */ exports.FaHeartCircleXmark = '';
    /** char code: 0xf7a9 */ exports.FaHeartCrack = '';
    /** char code: 0xf21e */ exports.FaHeartPulse = '';
    /** char code: 0xf533 */ exports.FaHelicopter = '';
    /** char code: 0xe502 */ exports.FaHelicopterSymbol = '';
    /** char code: 0xf807 */ exports.FaHelmetSafety = '';
    /** char code: 0xe503 */ exports.FaHelmetUn = '';
    /** char code: 0xf312 */ exports.FaHexagon = '';
    /** char code: 0xe699 */ exports.FaHexagonNodes = '';
    /** char code: 0xe69a */ exports.FaHexagonNodesBolt = '';
    /** char code: 0xf591 */ exports.FaHighlighter = '';
    /** char code: 0xe507 */ exports.FaHillAvalanche = '';
    /** char code: 0xe508 */ exports.FaHillRockslide = '';
    /** char code: 0xf6ed */ exports.FaHippo = '';
    /** char code: 0xf453 */ exports.FaHockeyPuck = '';
    /** char code: 0xf7aa */ exports.FaHollyBerry = '';
    /** char code: 0xf6f0 */ exports.FaHorse = '';
    /** char code: 0xf7ab */ exports.FaHorseHead = '';
    /** char code: 0xf0f8 */ exports.FaHospital = '';
    /** char code: 0xf80d */ exports.FaHospitalUser = '';
    /** char code: 0xf593 */ exports.FaHotTubPerson = '';
    /** char code: 0xf80f */ exports.FaHotdog = '';
    /** char code: 0xf594 */ exports.FaHotel = '';
    /** char code: 0xf254 */ exports.FaHourglass = '';
    /** char code: 0xf253 */ exports.FaHourglassEnd = '';
    /** char code: 0xf252 */ exports.FaHourglassHalf = '';
    /** char code: 0xf251 */ exports.FaHourglassStart = '';
    /** char code: 0xf015 */ exports.FaHouse = '';
    /** char code: 0xe3af */ exports.FaHouseChimney = '';
    /** char code: 0xf6f1 */ exports.FaHouseChimneyCrack = '';
    /** char code: 0xf7f2 */ exports.FaHouseChimneyMedical = '';
    /** char code: 0xe065 */ exports.FaHouseChimneyUser = '';
    /** char code: 0xe00d */ exports.FaHouseChimneyWindow = '';
    /** char code: 0xe509 */ exports.FaHouseCircleCheck = '';
    /** char code: 0xe50a */ exports.FaHouseCircleExclamation = '';
    /** char code: 0xe50b */ exports.FaHouseCircleXmark = '';
    /** char code: 0xe3b1 */ exports.FaHouseCrack = '';
    /** char code: 0xe50c */ exports.FaHouseFire = '';
    /** char code: 0xe50d */ exports.FaHouseFlag = '';
    /** char code: 0xe50e */ exports.FaHouseFloodWater = '';
    /** char code: 0xe50f */ exports.FaHouseFloodWaterCircleArrowRight = '';
    /** char code: 0xe066 */ exports.FaHouseLaptop = '';
    /** char code: 0xe510 */ exports.FaHouseLock = '';
    /** char code: 0xe3b2 */ exports.FaHouseMedical = '';
    /** char code: 0xe511 */ exports.FaHouseMedicalCircleCheck = '';
    /** char code: 0xe512 */ exports.FaHouseMedicalCircleExclamation = '';
    /** char code: 0xe513 */ exports.FaHouseMedicalCircleXmark = '';
    /** char code: 0xe514 */ exports.FaHouseMedicalFlag = '';
    /** char code: 0xe012 */ exports.FaHouseSignal = '';
    /** char code: 0xe515 */ exports.FaHouseTsunami = '';
    /** char code: 0xe1b0 */ exports.FaHouseUser = '';
    /** char code: 0xf6f2 */ exports.FaHryvniaSign = '';
    /** char code: 0xf751 */ exports.FaHurricane = '';
    /** char code: 0x49 */ exports.FaI = 'I';
    /** char code: 0xf246 */ exports.FaICursor = '';
    /** char code: 0xf810 */ exports.FaIceCream = '';
    /** char code: 0xf7ad */ exports.FaIcicles = '';
    /** char code: 0xf86d */ exports.FaIcons = '';
    /** char code: 0xf2c1 */ exports.FaIdBadge = '';
    /** char code: 0xf2c2 */ exports.FaIdCard = '';
    /** char code: 0xf47f */ exports.FaIdCardClip = '';
    /** char code: 0xf7ae */ exports.FaIgloo = '';
    /** char code: 0xf03e */ exports.FaImage = '';
    /** char code: 0xf3e0 */ exports.FaImagePortrait = '';
    /** char code: 0xf302 */ exports.FaImages = '';
    /** char code: 0xf01c */ exports.FaInbox = '';
    /** char code: 0xf03c */ exports.FaIndent = '';
    /** char code: 0xe1bc */ exports.FaIndianRupeeSign = '';
    /** char code: 0xf275 */ exports.FaIndustry = '';
    /** char code: 0xf534 */ exports.FaInfinity = '';
    /** char code: 0xf129 */ exports.FaInfo = '';
    /** char code: 0xf033 */ exports.FaItalic = '';
    /** char code: 0x4a */ exports.FaJ = 'J';
    /** char code: 0xe516 */ exports.FaJar = '';
    /** char code: 0xe517 */ exports.FaJarWheat = '';
    /** char code: 0xf669 */ exports.FaJedi = '';
    /** char code: 0xf0fb */ exports.FaJetFighter = '';
    /** char code: 0xe518 */ exports.FaJetFighterUp = '';
    /** char code: 0xf595 */ exports.FaJoint = '';
    /** char code: 0xe519 */ exports.FaJugDetergent = '';
    /** char code: 0x4b */ exports.FaK = 'K';
    /** char code: 0xf66b */ exports.FaKaaba = '';
    /** char code: 0xf084 */ exports.FaKey = '';
    /** char code: 0xf11c */ exports.FaKeyboard = '';
    /** char code: 0xf66d */ exports.FaKhanda = '';
    /** char code: 0xe1c4 */ exports.FaKipSign = '';
    /** char code: 0xf479 */ exports.FaKitMedical = '';
    /** char code: 0xe51a */ exports.FaKitchenSet = '';
    /** char code: 0xf535 */ exports.FaKiwiBird = '';
    /** char code: 0x4c */ exports.FaL = 'L';
    /** char code: 0xe51b */ exports.FaLandMineOn = '';
    /** char code: 0xf66f */ exports.FaLandmark = '';
    /** char code: 0xf752 */ exports.FaLandmarkDome = '';
    /** char code: 0xe51c */ exports.FaLandmarkFlag = '';
    /** char code: 0xf1ab */ exports.FaLanguage = '';
    /** char code: 0xf109 */ exports.FaLaptop = '';
    /** char code: 0xf5fc */ exports.FaLaptopCode = '';
    /** char code: 0xe51d */ exports.FaLaptopFile = '';
    /** char code: 0xf812 */ exports.FaLaptopMedical = '';
    /** char code: 0xe1c8 */ exports.FaLariSign = '';
    /** char code: 0xf5fd */ exports.FaLayerGroup = '';
    /** char code: 0xf06c */ exports.FaLeaf = '';
    /** char code: 0xf30a */ exports.FaLeftLong = '';
    /** char code: 0xf337 */ exports.FaLeftRight = '';
    /** char code: 0xf094 */ exports.FaLemon = '';
    /** char code: 0x3c */ exports.FaLessThan = '<';
    /** char code: 0xf537 */ exports.FaLessThanEqual = '';
    /** char code: 0xf1cd */ exports.FaLifeRing = '';
    /** char code: 0xf0eb */ exports.FaLightbulb = '';
    /** char code: 0xe51e */ exports.FaLinesLeaning = '';
    /** char code: 0xf0c1 */ exports.FaLink = '';
    /** char code: 0xf127 */ exports.FaLinkSlash = '';
    /** char code: 0xf195 */ exports.FaLiraSign = '';
    /** char code: 0xf03a */ exports.FaList = '';
    /** char code: 0xf0ae */ exports.FaListCheck = '';
    /** char code: 0xf0cb */ exports.FaListOl = '';
    /** char code: 0xf0ca */ exports.FaListUl = '';
    /** char code: 0xe1d3 */ exports.FaLitecoinSign = '';
    /** char code: 0xf124 */ exports.FaLocationArrow = '';
    /** char code: 0xf601 */ exports.FaLocationCrosshairs = '';
    /** char code: 0xf3c5 */ exports.FaLocationDot = '';
    /** char code: 0xf041 */ exports.FaLocationPin = '';
    /** char code: 0xe51f */ exports.FaLocationPinLock = '';
    /** char code: 0xf023 */ exports.FaLock = '';
    /** char code: 0xf3c1 */ exports.FaLockOpen = '';
    /** char code: 0xe520 */ exports.FaLocust = '';
    /** char code: 0xf604 */ exports.FaLungs = '';
    /** char code: 0xe067 */ exports.FaLungsVirus = '';
    /** char code: 0x4d */ exports.FaM = 'M';
    /** char code: 0xf076 */ exports.FaMagnet = '';
    /** char code: 0xf002 */ exports.FaMagnifyingGlass = '';
    /** char code: 0xe521 */ exports.FaMagnifyingGlassArrowRight = '';
    /** char code: 0xe522 */ exports.FaMagnifyingGlassChart = '';
    /** char code: 0xf688 */ exports.FaMagnifyingGlassDollar = '';
    /** char code: 0xf689 */ exports.FaMagnifyingGlassLocation = '';
    /** char code: 0xf010 */ exports.FaMagnifyingGlassMinus = '';
    /** char code: 0xf00e */ exports.FaMagnifyingGlassPlus = '';
    /** char code: 0xe1d5 */ exports.FaManatSign = '';
    /** char code: 0xf279 */ exports.FaMap = '';
    /** char code: 0xf59f */ exports.FaMapLocation = '';
    /** char code: 0xf5a0 */ exports.FaMapLocationDot = '';
    /** char code: 0xf276 */ exports.FaMapPin = '';
    /** char code: 0xf5a1 */ exports.FaMarker = '';
    /** char code: 0xf222 */ exports.FaMars = '';
    /** char code: 0xf224 */ exports.FaMarsAndVenus = '';
    /** char code: 0xe523 */ exports.FaMarsAndVenusBurst = '';
    /** char code: 0xf227 */ exports.FaMarsDouble = '';
    /** char code: 0xf229 */ exports.FaMarsStroke = '';
    /** char code: 0xf22b */ exports.FaMarsStrokeRight = '';
    /** char code: 0xf22a */ exports.FaMarsStrokeUp = '';
    /** char code: 0xf57b */ exports.FaMartiniGlass = '';
    /** char code: 0xf561 */ exports.FaMartiniGlassCitrus = '';
    /** char code: 0xf000 */ exports.FaMartiniGlassEmpty = '';
    /** char code: 0xf6fa */ exports.FaMask = '';
    /** char code: 0xe1d7 */ exports.FaMaskFace = '';
    /** char code: 0xe524 */ exports.FaMaskVentilator = '';
    /** char code: 0xf630 */ exports.FaMasksTheater = '';
    /** char code: 0xe525 */ exports.FaMattressPillow = '';
    /** char code: 0xf31e */ exports.FaMaximize = '';
    /** char code: 0xf5a2 */ exports.FaMedal = '';
    /** char code: 0xf538 */ exports.FaMemory = '';
    /** char code: 0xf676 */ exports.FaMenorah = '';
    /** char code: 0xf223 */ exports.FaMercury = '';
    /** char code: 0xf27a */ exports.FaMessage = '';
    /** char code: 0xf753 */ exports.FaMeteor = '';
    /** char code: 0xf2db */ exports.FaMicrochip = '';
    /** char code: 0xf130 */ exports.FaMicrophone = '';
    /** char code: 0xf3c9 */ exports.FaMicrophoneLines = '';
    /** char code: 0xf539 */ exports.FaMicrophoneLinesSlash = '';
    /** char code: 0xf131 */ exports.FaMicrophoneSlash = '';
    /** char code: 0xf610 */ exports.FaMicroscope = '';
    /** char code: 0xe1ed */ exports.FaMillSign = '';
    /** char code: 0xf78c */ exports.FaMinimize = '';
    /** char code: 0xf068 */ exports.FaMinus = '';
    /** char code: 0xf7b5 */ exports.FaMitten = '';
    /** char code: 0xf3ce */ exports.FaMobile = '';
    /** char code: 0xf10b */ exports.FaMobileButton = '';
    /** char code: 0xe527 */ exports.FaMobileRetro = '';
    /** char code: 0xf3cf */ exports.FaMobileScreen = '';
    /** char code: 0xf3cd */ exports.FaMobileScreenButton = '';
    /** char code: 0xe816 */ exports.FaMobileVibrate = '';
    /** char code: 0xf0d6 */ exports.FaMoneyBill = '';
    /** char code: 0xf3d1 */ exports.FaMoneyBill1 = '';
    /** char code: 0xf53b */ exports.FaMoneyBill1Wave = '';
    /** char code: 0xe528 */ exports.FaMoneyBillTransfer = '';
    /** char code: 0xe529 */ exports.FaMoneyBillTrendUp = '';
    /** char code: 0xf53a */ exports.FaMoneyBillWave = '';
    /** char code: 0xe52a */ exports.FaMoneyBillWheat = '';
    /** char code: 0xe1f3 */ exports.FaMoneyBills = '';
    /** char code: 0xf53c */ exports.FaMoneyCheck = '';
    /** char code: 0xf53d */ exports.FaMoneyCheckDollar = '';
    /** char code: 0xf5a6 */ exports.FaMonument = '';
    /** char code: 0xf186 */ exports.FaMoon = '';
    /** char code: 0xf5a7 */ exports.FaMortarPestle = '';
    /** char code: 0xf678 */ exports.FaMosque = '';
    /** char code: 0xe52b */ exports.FaMosquito = '';
    /** char code: 0xe52c */ exports.FaMosquitoNet = '';
    /** char code: 0xf21c */ exports.FaMotorcycle = '';
    /** char code: 0xe52d */ exports.FaMound = '';
    /** char code: 0xf6fc */ exports.FaMountain = '';
    /** char code: 0xe52e */ exports.FaMountainCity = '';
    /** char code: 0xe52f */ exports.FaMountainSun = '';
    /** char code: 0xf7b6 */ exports.FaMugHot = '';
    /** char code: 0xf0f4 */ exports.FaMugSaucer = '';
    /** char code: 0xf001 */ exports.FaMusic = '';
    /** char code: 0x4e */ exports.FaN = 'N';
    /** char code: 0xe1f6 */ exports.FaNairaSign = '';
    /** char code: 0xf6ff */ exports.FaNetworkWired = '';
    /** char code: 0xf22c */ exports.FaNeuter = '';
    /** char code: 0xf1ea */ exports.FaNewspaper = '';
    /** char code: 0xe807 */ exports.FaNonBinary = '';
    /** char code: 0xf53e */ exports.FaNotEqual = '';
    /** char code: 0xe1fe */ exports.FaNotdef = '';
    /** char code: 0xf249 */ exports.FaNoteSticky = '';
    /** char code: 0xf481 */ exports.FaNotesMedical = '';
    /** char code: 0x4f */ exports.FaO = 'O';
    /** char code: 0xf247 */ exports.FaObjectGroup = '';
    /** char code: 0xf248 */ exports.FaObjectUngroup = '';
    /** char code: 0xf306 */ exports.FaOctagon = '';
    /** char code: 0xf613 */ exports.FaOilCan = '';
    /** char code: 0xe532 */ exports.FaOilWell = '';
    /** char code: 0xf679 */ exports.FaOm = '';
    /** char code: 0xf700 */ exports.FaOtter = '';
    /** char code: 0xf03b */ exports.FaOutdent = '';
    /** char code: 0x50 */ exports.FaP = 'P';
    /** char code: 0xf815 */ exports.FaPager = '';
    /** char code: 0xf5aa */ exports.FaPaintRoller = '';
    /** char code: 0xf1fc */ exports.FaPaintbrush = '';
    /** char code: 0xf53f */ exports.FaPalette = '';
    /** char code: 0xf482 */ exports.FaPallet = '';
    /** char code: 0xe209 */ exports.FaPanorama = '';
    /** char code: 0xf1d8 */ exports.FaPaperPlane = '';
    /** char code: 0xf0c6 */ exports.FaPaperclip = '';
    /** char code: 0xf4cd */ exports.FaParachuteBox = '';
    /** char code: 0xf1dd */ exports.FaParagraph = '';
    /** char code: 0xf5ab */ exports.FaPassport = '';
    /** char code: 0xf0ea */ exports.FaPaste = '';
    /** char code: 0xf04c */ exports.FaPause = '';
    /** char code: 0xf1b0 */ exports.FaPaw = '';
    /** char code: 0xf67c */ exports.FaPeace = '';
    /** char code: 0xf304 */ exports.FaPen = '';
    /** char code: 0xf305 */ exports.FaPenClip = '';
    /** char code: 0xf5ac */ exports.FaPenFancy = '';
    /** char code: 0xf5ad */ exports.FaPenNib = '';
    /** char code: 0xf5ae */ exports.FaPenRuler = '';
    /** char code: 0xf044 */ exports.FaPenToSquare = '';
    /** char code: 0xf303 */ exports.FaPencil = '';
    /** char code: 0xe790 */ exports.FaPentagon = '';
    /** char code: 0xe068 */ exports.FaPeopleArrows = '';
    /** char code: 0xf4ce */ exports.FaPeopleCarryBox = '';
    /** char code: 0xe533 */ exports.FaPeopleGroup = '';
    /** char code: 0xe534 */ exports.FaPeopleLine = '';
    /** char code: 0xe535 */ exports.FaPeoplePulling = '';
    /** char code: 0xe536 */ exports.FaPeopleRobbery = '';
    /** char code: 0xe537 */ exports.FaPeopleRoof = '';
    /** char code: 0xf816 */ exports.FaPepperHot = '';
    /** char code: 0x25 */ exports.FaPercent = '%';
    /** char code: 0xf183 */ exports.FaPerson = '';
    /** char code: 0xe538 */ exports.FaPersonArrowDownToLine = '';
    /** char code: 0xe539 */ exports.FaPersonArrowUpFromLine = '';
    /** char code: 0xf84a */ exports.FaPersonBiking = '';
    /** char code: 0xf756 */ exports.FaPersonBooth = '';
    /** char code: 0xe53a */ exports.FaPersonBreastfeeding = '';
    /** char code: 0xe53b */ exports.FaPersonBurst = '';
    /** char code: 0xe53c */ exports.FaPersonCane = '';
    /** char code: 0xe53d */ exports.FaPersonChalkboard = '';
    /** char code: 0xe53e */ exports.FaPersonCircleCheck = '';
    /** char code: 0xe53f */ exports.FaPersonCircleExclamation = '';
    /** char code: 0xe540 */ exports.FaPersonCircleMinus = '';
    /** char code: 0xe541 */ exports.FaPersonCirclePlus = '';
    /** char code: 0xe542 */ exports.FaPersonCircleQuestion = '';
    /** char code: 0xe543 */ exports.FaPersonCircleXmark = '';
    /** char code: 0xf85e */ exports.FaPersonDigging = '';
    /** char code: 0xf470 */ exports.FaPersonDotsFromLine = '';
    /** char code: 0xf182 */ exports.FaPersonDress = '';
    /** char code: 0xe544 */ exports.FaPersonDressBurst = '';
    /** char code: 0xe545 */ exports.FaPersonDrowning = '';
    /** char code: 0xe546 */ exports.FaPersonFalling = '';
    /** char code: 0xe547 */ exports.FaPersonFallingBurst = '';
    /** char code: 0xe548 */ exports.FaPersonHalfDress = '';
    /** char code: 0xe549 */ exports.FaPersonHarassing = '';
    /** char code: 0xf6ec */ exports.FaPersonHiking = '';
    /** char code: 0xe54a */ exports.FaPersonMilitaryPointing = '';
    /** char code: 0xe54b */ exports.FaPersonMilitaryRifle = '';
    /** char code: 0xe54c */ exports.FaPersonMilitaryToPerson = '';
    /** char code: 0xf683 */ exports.FaPersonPraying = '';
    /** char code: 0xe31e */ exports.FaPersonPregnant = '';
    /** char code: 0xe54d */ exports.FaPersonRays = '';
    /** char code: 0xe54e */ exports.FaPersonRifle = '';
    /** char code: 0xf70c */ exports.FaPersonRunning = '';
    /** char code: 0xe54f */ exports.FaPersonShelter = '';
    /** char code: 0xf7c5 */ exports.FaPersonSkating = '';
    /** char code: 0xf7c9 */ exports.FaPersonSkiing = '';
    /** char code: 0xf7ca */ exports.FaPersonSkiingNordic = '';
    /** char code: 0xf7ce */ exports.FaPersonSnowboarding = '';
    /** char code: 0xf5c4 */ exports.FaPersonSwimming = '';
    /** char code: 0xe5a9 */ exports.FaPersonThroughWindow = '';
    /** char code: 0xf554 */ exports.FaPersonWalking = '';
    /** char code: 0xe551 */ exports.FaPersonWalkingArrowLoopLeft = '';
    /** char code: 0xe552 */ exports.FaPersonWalkingArrowRight = '';
    /** char code: 0xe553 */ exports.FaPersonWalkingDashedLineArrowRight = '';
    /** char code: 0xe554 */ exports.FaPersonWalkingLuggage = '';
    /** char code: 0xf29d */ exports.FaPersonWalkingWithCane = '';
    /** char code: 0xe221 */ exports.FaPesetaSign = '';
    /** char code: 0xe222 */ exports.FaPesoSign = '';
    /** char code: 0xf095 */ exports.FaPhone = '';
    /** char code: 0xf879 */ exports.FaPhoneFlip = '';
    /** char code: 0xf3dd */ exports.FaPhoneSlash = '';
    /** char code: 0xf2a0 */ exports.FaPhoneVolume = '';
    /** char code: 0xf87c */ exports.FaPhotoFilm = '';
    /** char code: 0xf4d3 */ exports.FaPiggyBank = '';
    /** char code: 0xf484 */ exports.FaPills = '';
    /** char code: 0xf818 */ exports.FaPizzaSlice = '';
    /** char code: 0xf67f */ exports.FaPlaceOfWorship = '';
    /** char code: 0xf072 */ exports.FaPlane = '';
    /** char code: 0xf5af */ exports.FaPlaneArrival = '';
    /** char code: 0xe555 */ exports.FaPlaneCircleCheck = '';
    /** char code: 0xe556 */ exports.FaPlaneCircleExclamation = '';
    /** char code: 0xe557 */ exports.FaPlaneCircleXmark = '';
    /** char code: 0xf5b0 */ exports.FaPlaneDeparture = '';
    /** char code: 0xe558 */ exports.FaPlaneLock = '';
    /** char code: 0xe069 */ exports.FaPlaneSlash = '';
    /** char code: 0xe22d */ exports.FaPlaneUp = '';
    /** char code: 0xe5aa */ exports.FaPlantWilt = '';
    /** char code: 0xe55a */ exports.FaPlateWheat = '';
    /** char code: 0xf04b */ exports.FaPlay = '';
    /** char code: 0xf1e6 */ exports.FaPlug = '';
    /** char code: 0xe55b */ exports.FaPlugCircleBolt = '';
    /** char code: 0xe55c */ exports.FaPlugCircleCheck = '';
    /** char code: 0xe55d */ exports.FaPlugCircleExclamation = '';
    /** char code: 0xe55e */ exports.FaPlugCircleMinus = '';
    /** char code: 0xe55f */ exports.FaPlugCirclePlus = '';
    /** char code: 0xe560 */ exports.FaPlugCircleXmark = '';
    /** char code: 0x2b */ exports.FaPlus = '+';
    /** char code: 0xe43c */ exports.FaPlusMinus = '';
    /** char code: 0xf2ce */ exports.FaPodcast = '';
    /** char code: 0xf2fe */ exports.FaPoo = '';
    /** char code: 0xf75a */ exports.FaPooStorm = '';
    /** char code: 0xf619 */ exports.FaPoop = '';
    /** char code: 0xf011 */ exports.FaPowerOff = '';
    /** char code: 0xf5b1 */ exports.FaPrescription = '';
    /** char code: 0xf485 */ exports.FaPrescriptionBottle = '';
    /** char code: 0xf486 */ exports.FaPrescriptionBottleMedical = '';
    /** char code: 0xf02f */ exports.FaPrint = '';
    /** char code: 0xe06a */ exports.FaPumpMedical = '';
    /** char code: 0xe06b */ exports.FaPumpSoap = '';
    /** char code: 0xf12e */ exports.FaPuzzlePiece = '';
    /** char code: 0x51 */ exports.FaQ = 'Q';
    /** char code: 0xf029 */ exports.FaQrcode = '';
    /** char code: 0x3f */ exports.FaQuestion = '?';
    /** char code: 0xf10d */ exports.FaQuoteLeft = '';
    /** char code: 0xf10e */ exports.FaQuoteRight = '';
    /** char code: 0x52 */ exports.FaR = 'R';
    /** char code: 0xf7b9 */ exports.FaRadiation = '';
    /** char code: 0xf8d7 */ exports.FaRadio = '';
    /** char code: 0xf75b */ exports.FaRainbow = '';
    /** char code: 0xe561 */ exports.FaRankingStar = '';
    /** char code: 0xf543 */ exports.FaReceipt = '';
    /** char code: 0xf8d9 */ exports.FaRecordVinyl = '';
    /** char code: 0xf641 */ exports.FaRectangleAd = '';
    /** char code: 0xf022 */ exports.FaRectangleList = '';
    /** char code: 0xf410 */ exports.FaRectangleXmark = '';
    /** char code: 0xf1b8 */ exports.FaRecycle = '';
    /** char code: 0xf25d */ exports.FaRegistered = '';
    /** char code: 0xf363 */ exports.FaRepeat = '';
    /** char code: 0xf3e5 */ exports.FaReply = '';
    /** char code: 0xf122 */ exports.FaReplyAll = '';
    /** char code: 0xf75e */ exports.FaRepublican = '';
    /** char code: 0xf7bd */ exports.FaRestroom = '';
    /** char code: 0xf079 */ exports.FaRetweet = '';
    /** char code: 0xf4d6 */ exports.FaRibbon = '';
    /** char code: 0xf2f5 */ exports.FaRightFromBracket = '';
    /** char code: 0xf362 */ exports.FaRightLeft = '';
    /** char code: 0xf30b */ exports.FaRightLong = '';
    /** char code: 0xf2f6 */ exports.FaRightToBracket = '';
    /** char code: 0xf70b */ exports.FaRing = '';
    /** char code: 0xf018 */ exports.FaRoad = '';
    /** char code: 0xe562 */ exports.FaRoadBarrier = '';
    /** char code: 0xe563 */ exports.FaRoadBridge = '';
    /** char code: 0xe564 */ exports.FaRoadCircleCheck = '';
    /** char code: 0xe565 */ exports.FaRoadCircleExclamation = '';
    /** char code: 0xe566 */ exports.FaRoadCircleXmark = '';
    /** char code: 0xe567 */ exports.FaRoadLock = '';
    /** char code: 0xe568 */ exports.FaRoadSpikes = '';
    /** char code: 0xf544 */ exports.FaRobot = '';
    /** char code: 0xf135 */ exports.FaRocket = '';
    /** char code: 0xf2f1 */ exports.FaRotate = '';
    /** char code: 0xf2ea */ exports.FaRotateLeft = '';
    /** char code: 0xf2f9 */ exports.FaRotateRight = '';
    /** char code: 0xf4d7 */ exports.FaRoute = '';
    /** char code: 0xf09e */ exports.FaRss = '';
    /** char code: 0xf158 */ exports.FaRubleSign = '';
    /** char code: 0xe569 */ exports.FaRug = '';
    /** char code: 0xf545 */ exports.FaRuler = '';
    /** char code: 0xf546 */ exports.FaRulerCombined = '';
    /** char code: 0xf547 */ exports.FaRulerHorizontal = '';
    /** char code: 0xf548 */ exports.FaRulerVertical = '';
    /** char code: 0xf156 */ exports.FaRupeeSign = '';
    /** char code: 0xe23d */ exports.FaRupiahSign = '';
    /** char code: 0x53 */ exports.FaS = 'S';
    /** char code: 0xf81d */ exports.FaSackDollar = '';
    /** char code: 0xe56a */ exports.FaSackXmark = '';
    /** char code: 0xe445 */ exports.FaSailboat = '';
    /** char code: 0xf7bf */ exports.FaSatellite = '';
    /** char code: 0xf7c0 */ exports.FaSatelliteDish = '';
    /** char code: 0xf24e */ exports.FaScaleBalanced = '';
    /** char code: 0xf515 */ exports.FaScaleUnbalanced = '';
    /** char code: 0xf516 */ exports.FaScaleUnbalancedFlip = '';
    /** char code: 0xf549 */ exports.FaSchool = '';
    /** char code: 0xe56b */ exports.FaSchoolCircleCheck = '';
    /** char code: 0xe56c */ exports.FaSchoolCircleExclamation = '';
    /** char code: 0xe56d */ exports.FaSchoolCircleXmark = '';
    /** char code: 0xe56e */ exports.FaSchoolFlag = '';
    /** char code: 0xe56f */ exports.FaSchoolLock = '';
    /** char code: 0xf0c4 */ exports.FaScissors = '';
    /** char code: 0xf54a */ exports.FaScrewdriver = '';
    /** char code: 0xf7d9 */ exports.FaScrewdriverWrench = '';
    /** char code: 0xf70e */ exports.FaScroll = '';
    /** char code: 0xf6a0 */ exports.FaScrollTorah = '';
    /** char code: 0xf7c2 */ exports.FaSdCard = '';
    /** char code: 0xe447 */ exports.FaSection = '';
    /** char code: 0xf4d8 */ exports.FaSeedling = '';
    /** char code: 0xe820 */ exports.FaSeptagon = '';
    /** char code: 0xf233 */ exports.FaServer = '';
    /** char code: 0xf61f */ exports.FaShapes = '';
    /** char code: 0xf064 */ exports.FaShare = '';
    /** char code: 0xf14d */ exports.FaShareFromSquare = '';
    /** char code: 0xf1e0 */ exports.FaShareNodes = '';
    /** char code: 0xe571 */ exports.FaSheetPlastic = '';
    /** char code: 0xf20b */ exports.FaShekelSign = '';
    /** char code: 0xf132 */ exports.FaShield = '';
    /** char code: 0xe572 */ exports.FaShieldCat = '';
    /** char code: 0xe573 */ exports.FaShieldDog = '';
    /** char code: 0xf3ed */ exports.FaShieldHalved = '';
    /** char code: 0xe574 */ exports.FaShieldHeart = '';
    /** char code: 0xe06c */ exports.FaShieldVirus = '';
    /** char code: 0xf21a */ exports.FaShip = '';
    /** char code: 0xf553 */ exports.FaShirt = '';
    /** char code: 0xf54b */ exports.FaShoePrints = '';
    /** char code: 0xf54f */ exports.FaShop = '';
    /** char code: 0xe4a5 */ exports.FaShopLock = '';
    /** char code: 0xe070 */ exports.FaShopSlash = '';
    /** char code: 0xf2cc */ exports.FaShower = '';
    /** char code: 0xe448 */ exports.FaShrimp = '';
    /** char code: 0xf074 */ exports.FaShuffle = '';
    /** char code: 0xf197 */ exports.FaShuttleSpace = '';
    /** char code: 0xf4d9 */ exports.FaSignHanging = '';
    /** char code: 0xf012 */ exports.FaSignal = '';
    /** char code: 0xf5b7 */ exports.FaSignature = '';
    /** char code: 0xf277 */ exports.FaSignsPost = '';
    /** char code: 0xf7c4 */ exports.FaSimCard = '';
    /** char code: 0xe81b */ exports.FaSingleQuoteLeft = '';
    /** char code: 0xe81c */ exports.FaSingleQuoteRight = '';
    /** char code: 0xe06d */ exports.FaSink = '';
    /** char code: 0xf0e8 */ exports.FaSitemap = '';
    /** char code: 0xf54c */ exports.FaSkull = '';
    /** char code: 0xf714 */ exports.FaSkullCrossbones = '';
    /** char code: 0xf715 */ exports.FaSlash = '';
    /** char code: 0xf7cc */ exports.FaSleigh = '';
    /** char code: 0xf1de */ exports.FaSliders = '';
    /** char code: 0xf75f */ exports.FaSmog = '';
    /** char code: 0xf48d */ exports.FaSmoking = '';
    /** char code: 0xf2dc */ exports.FaSnowflake = '';
    /** char code: 0xf7d0 */ exports.FaSnowman = '';
    /** char code: 0xf7d2 */ exports.FaSnowplow = '';
    /** char code: 0xe06e */ exports.FaSoap = '';
    /** char code: 0xf696 */ exports.FaSocks = '';
    /** char code: 0xf5ba */ exports.FaSolarPanel = '';
    /** char code: 0xf0dc */ exports.FaSort = '';
    /** char code: 0xf0dd */ exports.FaSortDown = '';
    /** char code: 0xf0de */ exports.FaSortUp = '';
    /** char code: 0xf5bb */ exports.FaSpa = '';
    /** char code: 0xf67b */ exports.FaSpaghettiMonsterFlying = '';
    /** char code: 0xf891 */ exports.FaSpellCheck = '';
    /** char code: 0xf717 */ exports.FaSpider = '';
    /** char code: 0xf110 */ exports.FaSpinner = '';
    /** char code: 0xe80a */ exports.FaSpiral = '';
    /** char code: 0xf5bc */ exports.FaSplotch = '';
    /** char code: 0xf2e5 */ exports.FaSpoon = '';
    /** char code: 0xf5bd */ exports.FaSprayCan = '';
    /** char code: 0xf5d0 */ exports.FaSprayCanSparkles = '';
    /** char code: 0xf0c8 */ exports.FaSquare = '';
    /** char code: 0xf14c */ exports.FaSquareArrowUpRight = '';
    /** char code: 0xe69b */ exports.FaSquareBinary = '';
    /** char code: 0xf150 */ exports.FaSquareCaretDown = '';
    /** char code: 0xf191 */ exports.FaSquareCaretLeft = '';
    /** char code: 0xf152 */ exports.FaSquareCaretRight = '';
    /** char code: 0xf151 */ exports.FaSquareCaretUp = '';
    /** char code: 0xf14a */ exports.FaSquareCheck = '';
    /** char code: 0xf199 */ exports.FaSquareEnvelope = '';
    /** char code: 0xf45c */ exports.FaSquareFull = '';
    /** char code: 0xf0fd */ exports.FaSquareH = '';
    /** char code: 0xf146 */ exports.FaSquareMinus = '';
    /** char code: 0xe576 */ exports.FaSquareNfi = '';
    /** char code: 0xf540 */ exports.FaSquareParking = '';
    /** char code: 0xf14b */ exports.FaSquarePen = '';
    /** char code: 0xe577 */ exports.FaSquarePersonConfined = '';
    /** char code: 0xf098 */ exports.FaSquarePhone = '';
    /** char code: 0xf87b */ exports.FaSquarePhoneFlip = '';
    /** char code: 0xf0fe */ exports.FaSquarePlus = '';
    /** char code: 0xf682 */ exports.FaSquarePollHorizontal = '';
    /** char code: 0xf681 */ exports.FaSquarePollVertical = '';
    /** char code: 0xf698 */ exports.FaSquareRootVariable = '';
    /** char code: 0xf143 */ exports.FaSquareRss = '';
    /** char code: 0xf1e1 */ exports.FaSquareShareNodes = '';
    /** char code: 0xf360 */ exports.FaSquareUpRight = '';
    /** char code: 0xe578 */ exports.FaSquareVirus = '';
    /** char code: 0xf2d3 */ exports.FaSquareXmark = '';
    /** char code: 0xe579 */ exports.FaStaffSnake = '';
    /** char code: 0xe289 */ exports.FaStairs = '';
    /** char code: 0xf5bf */ exports.FaStamp = '';
    /** char code: 0xe5af */ exports.FaStapler = '';
    /** char code: 0xf005 */ exports.FaStar = '';
    /** char code: 0xf699 */ exports.FaStarAndCrescent = '';
    /** char code: 0xf089 */ exports.FaStarHalf = '';
    /** char code: 0xf5c0 */ exports.FaStarHalfStroke = '';
    /** char code: 0xf69a */ exports.FaStarOfDavid = '';
    /** char code: 0xf621 */ exports.FaStarOfLife = '';
    /** char code: 0xf154 */ exports.FaSterlingSign = '';
    /** char code: 0xf0f1 */ exports.FaStethoscope = '';
    /** char code: 0xf04d */ exports.FaStop = '';
    /** char code: 0xf2f2 */ exports.FaStopwatch = '';
    /** char code: 0xe06f */ exports.FaStopwatch20 = '';
    /** char code: 0xf54e */ exports.FaStore = '';
    /** char code: 0xe071 */ exports.FaStoreSlash = '';
    /** char code: 0xf21d */ exports.FaStreetView = '';
    /** char code: 0xf0cc */ exports.FaStrikethrough = '';
    /** char code: 0xf551 */ exports.FaStroopwafel = '';
    /** char code: 0xf12c */ exports.FaSubscript = '';
    /** char code: 0xf0f2 */ exports.FaSuitcase = '';
    /** char code: 0xf0fa */ exports.FaSuitcaseMedical = '';
    /** char code: 0xf5c1 */ exports.FaSuitcaseRolling = '';
    /** char code: 0xf185 */ exports.FaSun = '';
    /** char code: 0xe57a */ exports.FaSunPlantWilt = '';
    /** char code: 0xf12b */ exports.FaSuperscript = '';
    /** char code: 0xf5c3 */ exports.FaSwatchbook = '';
    /** char code: 0xf69b */ exports.FaSynagogue = '';
    /** char code: 0xf48e */ exports.FaSyringe = '';
    /** char code: 0x54 */ exports.FaT = 'T';
    /** char code: 0xf0ce */ exports.FaTable = '';
    /** char code: 0xf00a */ exports.FaTableCells = '';
    /** char code: 0xe678 */ exports.FaTableCellsColumnLock = '';
    /** char code: 0xf009 */ exports.FaTableCellsLarge = '';
    /** char code: 0xe67a */ exports.FaTableCellsRowLock = '';
    /** char code: 0xe691 */ exports.FaTableCellsRowUnlock = '';
    /** char code: 0xf0db */ exports.FaTableColumns = '';
    /** char code: 0xf00b */ exports.FaTableList = '';
    /** char code: 0xf45d */ exports.FaTableTennisPaddleBall = '';
    /** char code: 0xf3fb */ exports.FaTablet = '';
    /** char code: 0xf10a */ exports.FaTabletButton = '';
    /** char code: 0xf3fa */ exports.FaTabletScreenButton = '';
    /** char code: 0xf490 */ exports.FaTablets = '';
    /** char code: 0xf566 */ exports.FaTachographDigital = '';
    /** char code: 0xf02b */ exports.FaTag = '';
    /** char code: 0xf02c */ exports.FaTags = '';
    /** char code: 0xf4db */ exports.FaTape = '';
    /** char code: 0xe57b */ exports.FaTarp = '';
    /** char code: 0xe57c */ exports.FaTarpDroplet = '';
    /** char code: 0xf1ba */ exports.FaTaxi = '';
    /** char code: 0xf62e */ exports.FaTeeth = '';
    /** char code: 0xf62f */ exports.FaTeethOpen = '';
    /** char code: 0xe03f */ exports.FaTemperatureArrowDown = '';
    /** char code: 0xe040 */ exports.FaTemperatureArrowUp = '';
    /** char code: 0xf2cb */ exports.FaTemperatureEmpty = '';
    /** char code: 0xf2c7 */ exports.FaTemperatureFull = '';
    /** char code: 0xf2c9 */ exports.FaTemperatureHalf = '';
    /** char code: 0xf769 */ exports.FaTemperatureHigh = '';
    /** char code: 0xf76b */ exports.FaTemperatureLow = '';
    /** char code: 0xf2ca */ exports.FaTemperatureQuarter = '';
    /** char code: 0xf2c8 */ exports.FaTemperatureThreeQuarters = '';
    /** char code: 0xf7d7 */ exports.FaTengeSign = '';
    /** char code: 0xe57d */ exports.FaTent = '';
    /** char code: 0xe57e */ exports.FaTentArrowDownToLine = '';
    /** char code: 0xe57f */ exports.FaTentArrowLeftRight = '';
    /** char code: 0xe580 */ exports.FaTentArrowTurnLeft = '';
    /** char code: 0xe581 */ exports.FaTentArrowsDown = '';
    /** char code: 0xe582 */ exports.FaTents = '';
    /** char code: 0xf120 */ exports.FaTerminal = '';
    /** char code: 0xf034 */ exports.FaTextHeight = '';
    /** char code: 0xf87d */ exports.FaTextSlash = '';
    /** char code: 0xf035 */ exports.FaTextWidth = '';
    /** char code: 0xf491 */ exports.FaThermometer = '';
    /** char code: 0xf165 */ exports.FaThumbsDown = '';
    /** char code: 0xf164 */ exports.FaThumbsUp = '';
    /** char code: 0xf08d */ exports.FaThumbtack = '';
    /** char code: 0xe68f */ exports.FaThumbtackSlash = '';
    /** char code: 0xf145 */ exports.FaTicket = '';
    /** char code: 0xf3ff */ exports.FaTicketSimple = '';
    /** char code: 0xe29c */ exports.FaTimeline = '';
    /** char code: 0xf204 */ exports.FaToggleOff = '';
    /** char code: 0xf205 */ exports.FaToggleOn = '';
    /** char code: 0xf7d8 */ exports.FaToilet = '';
    /** char code: 0xf71e */ exports.FaToiletPaper = '';
    /** char code: 0xe072 */ exports.FaToiletPaperSlash = '';
    /** char code: 0xe583 */ exports.FaToiletPortable = '';
    /** char code: 0xe584 */ exports.FaToiletsPortable = '';
    /** char code: 0xf552 */ exports.FaToolbox = '';
    /** char code: 0xf5c9 */ exports.FaTooth = '';
    /** char code: 0xf6a1 */ exports.FaToriiGate = '';
    /** char code: 0xf76f */ exports.FaTornado = '';
    /** char code: 0xf519 */ exports.FaTowerBroadcast = '';
    /** char code: 0xe585 */ exports.FaTowerCell = '';
    /** char code: 0xe586 */ exports.FaTowerObservation = '';
    /** char code: 0xf722 */ exports.FaTractor = '';
    /** char code: 0xf25c */ exports.FaTrademark = '';
    /** char code: 0xf637 */ exports.FaTrafficLight = '';
    /** char code: 0xe041 */ exports.FaTrailer = '';
    /** char code: 0xf238 */ exports.FaTrain = '';
    /** char code: 0xf239 */ exports.FaTrainSubway = '';
    /** char code: 0xe5b4 */ exports.FaTrainTram = '';
    /** char code: 0xf225 */ exports.FaTransgender = '';
    /** char code: 0xf1f8 */ exports.FaTrash = '';
    /** char code: 0xf829 */ exports.FaTrashArrowUp = '';
    /** char code: 0xf2ed */ exports.FaTrashCan = '';
    /** char code: 0xf82a */ exports.FaTrashCanArrowUp = '';
    /** char code: 0xf1bb */ exports.FaTree = '';
    /** char code: 0xe587 */ exports.FaTreeCity = '';
    /** char code: 0xf071 */ exports.FaTriangleExclamation = '';
    /** char code: 0xf091 */ exports.FaTrophy = '';
    /** char code: 0xe589 */ exports.FaTrowel = '';
    /** char code: 0xe58a */ exports.FaTrowelBricks = '';
    /** char code: 0xf0d1 */ exports.FaTruck = '';
    /** char code: 0xe58b */ exports.FaTruckArrowRight = '';
    /** char code: 0xe58c */ exports.FaTruckDroplet = '';
    /** char code: 0xf48b */ exports.FaTruckFast = '';
    /** char code: 0xe58d */ exports.FaTruckField = '';
    /** char code: 0xe58e */ exports.FaTruckFieldUn = '';
    /** char code: 0xe2b7 */ exports.FaTruckFront = '';
    /** char code: 0xf0f9 */ exports.FaTruckMedical = '';
    /** char code: 0xf63b */ exports.FaTruckMonster = '';
    /** char code: 0xf4df */ exports.FaTruckMoving = '';
    /** char code: 0xf63c */ exports.FaTruckPickup = '';
    /** char code: 0xe58f */ exports.FaTruckPlane = '';
    /** char code: 0xf4de */ exports.FaTruckRampBox = '';
    /** char code: 0xf1e4 */ exports.FaTty = '';
    /** char code: 0xe2bb */ exports.FaTurkishLiraSign = '';
    /** char code: 0xf3be */ exports.FaTurnDown = '';
    /** char code: 0xf3bf */ exports.FaTurnUp = '';
    /** char code: 0xf26c */ exports.FaTv = '';
    /** char code: 0x55 */ exports.FaU = 'U';
    /** char code: 0xf0e9 */ exports.FaUmbrella = '';
    /** char code: 0xf5ca */ exports.FaUmbrellaBeach = '';
    /** char code: 0xf0cd */ exports.FaUnderline = '';
    /** char code: 0xf29a */ exports.FaUniversalAccess = '';
    /** char code: 0xf09c */ exports.FaUnlock = '';
    /** char code: 0xf13e */ exports.FaUnlockKeyhole = '';
    /** char code: 0xf338 */ exports.FaUpDown = '';
    /** char code: 0xf0b2 */ exports.FaUpDownLeftRight = '';
    /** char code: 0xf30c */ exports.FaUpLong = '';
    /** char code: 0xf424 */ exports.FaUpRightAndDownLeftFromCenter = '';
    /** char code: 0xf35d */ exports.FaUpRightFromSquare = '';
    /** char code: 0xf093 */ exports.FaUpload = '';
    /** char code: 0xf007 */ exports.FaUser = '';
    /** char code: 0xf4fb */ exports.FaUserAstronaut = '';
    /** char code: 0xf4fc */ exports.FaUserCheck = '';
    /** char code: 0xf4fd */ exports.FaUserClock = '';
    /** char code: 0xf0f0 */ exports.FaUserDoctor = '';
    /** char code: 0xf4fe */ exports.FaUserGear = '';
    /** char code: 0xf501 */ exports.FaUserGraduate = '';
    /** char code: 0xf500 */ exports.FaUserGroup = '';
    /** char code: 0xf728 */ exports.FaUserInjured = '';
    /** char code: 0xf502 */ exports.FaUserLock = '';
    /** char code: 0xf503 */ exports.FaUserMinus = '';
    /** char code: 0xf504 */ exports.FaUserNinja = '';
    /** char code: 0xf82f */ exports.FaUserNurse = '';
    /** char code: 0xf4ff */ exports.FaUserPen = '';
    /** char code: 0xf234 */ exports.FaUserPlus = '';
    /** char code: 0xf21b */ exports.FaUserSecret = '';
    /** char code: 0xf505 */ exports.FaUserShield = '';
    /** char code: 0xf506 */ exports.FaUserSlash = '';
    /** char code: 0xf507 */ exports.FaUserTag = '';
    /** char code: 0xf508 */ exports.FaUserTie = '';
    /** char code: 0xf235 */ exports.FaUserXmark = '';
    /** char code: 0xf0c0 */ exports.FaUsers = '';
    /** char code: 0xe591 */ exports.FaUsersBetweenLines = '';
    /** char code: 0xf509 */ exports.FaUsersGear = '';
    /** char code: 0xe592 */ exports.FaUsersLine = '';
    /** char code: 0xe593 */ exports.FaUsersRays = '';
    /** char code: 0xe594 */ exports.FaUsersRectangle = '';
    /** char code: 0xe073 */ exports.FaUsersSlash = '';
    /** char code: 0xe595 */ exports.FaUsersViewfinder = '';
    /** char code: 0xf2e7 */ exports.FaUtensils = '';
    /** char code: 0x56 */ exports.FaV = 'V';
    /** char code: 0xf5b6 */ exports.FaVanShuttle = '';
    /** char code: 0xe2c5 */ exports.FaVault = '';
    /** char code: 0xf221 */ exports.FaVenus = '';
    /** char code: 0xf226 */ exports.FaVenusDouble = '';
    /** char code: 0xf228 */ exports.FaVenusMars = '';
    /** char code: 0xe085 */ exports.FaVest = '';
    /** char code: 0xe086 */ exports.FaVestPatches = '';
    /** char code: 0xf492 */ exports.FaVial = '';
    /** char code: 0xe596 */ exports.FaVialCircleCheck = '';
    /** char code: 0xe597 */ exports.FaVialVirus = '';
    /** char code: 0xf493 */ exports.FaVials = '';
    /** char code: 0xf03d */ exports.FaVideo = '';
    /** char code: 0xf4e2 */ exports.FaVideoSlash = '';
    /** char code: 0xf6a7 */ exports.FaVihara = '';
    /** char code: 0xe074 */ exports.FaVirus = '';
    /** char code: 0xe4a8 */ exports.FaVirusCovid = '';
    /** char code: 0xe4a9 */ exports.FaVirusCovidSlash = '';
    /** char code: 0xe075 */ exports.FaVirusSlash = '';
    /** char code: 0xe076 */ exports.FaViruses = '';
    /** char code: 0xf897 */ exports.FaVoicemail = '';
    /** char code: 0xf770 */ exports.FaVolcano = '';
    /** char code: 0xf45f */ exports.FaVolleyball = '';
    /** char code: 0xf028 */ exports.FaVolumeHigh = '';
    /** char code: 0xf027 */ exports.FaVolumeLow = '';
    /** char code: 0xf026 */ exports.FaVolumeOff = '';
    /** char code: 0xf6a9 */ exports.FaVolumeXmark = '';
    /** char code: 0xf729 */ exports.FaVrCardboard = '';
    /** char code: 0x57 */ exports.FaW = 'W';
    /** char code: 0xf8ef */ exports.FaWalkieTalkie = '';
    /** char code: 0xf555 */ exports.FaWallet = '';
    /** char code: 0xf0d0 */ exports.FaWandMagic = '';
    /** char code: 0xe2ca */ exports.FaWandMagicSparkles = '';
    /** char code: 0xf72b */ exports.FaWandSparkles = '';
    /** char code: 0xf494 */ exports.FaWarehouse = '';
    /** char code: 0xf773 */ exports.FaWater = '';
    /** char code: 0xf5c5 */ exports.FaWaterLadder = '';
    /** char code: 0xf83e */ exports.FaWaveSquare = '';
    /** char code: 0xe682 */ exports.FaWebAwesome = '';
    /** char code: 0xf5cd */ exports.FaWeightHanging = '';
    /** char code: 0xf496 */ exports.FaWeightScale = '';
    /** char code: 0xe2cd */ exports.FaWheatAwn = '';
    /** char code: 0xe598 */ exports.FaWheatAwnCircleExclamation = '';
    /** char code: 0xf193 */ exports.FaWheelchair = '';
    /** char code: 0xe2ce */ exports.FaWheelchairMove = '';
    /** char code: 0xf7a0 */ exports.FaWhiskeyGlass = '';
    /** char code: 0xf1eb */ exports.FaWifi = '';
    /** char code: 0xf72e */ exports.FaWind = '';
    /** char code: 0xf2d0 */ exports.FaWindowMaximize = '';
    /** char code: 0xf2d1 */ exports.FaWindowMinimize = '';
    /** char code: 0xf2d2 */ exports.FaWindowRestore = '';
    /** char code: 0xf72f */ exports.FaWineBottle = '';
    /** char code: 0xf4e3 */ exports.FaWineGlass = '';
    /** char code: 0xf5ce */ exports.FaWineGlassEmpty = '';
    /** char code: 0xf159 */ exports.FaWonSign = '';
    /** char code: 0xe599 */ exports.FaWorm = '';
    /** char code: 0xf0ad */ exports.FaWrench = '';
    /** char code: 0x58 */ exports.FaX = 'X';
    /** char code: 0xf497 */ exports.FaXRay = '';
    /** char code: 0xf00d */ exports.FaXmark = '';
    /** char code: 0xe59a */ exports.FaXmarksLines = '';
    /** char code: 0x59 */ exports.FaY = 'Y';
    /** char code: 0xf157 */ exports.FaYenSign = '';
    /** char code: 0xf6ad */ exports.FaYinYang = '';
    /** char code: 0x5a */ exports.FaZ = 'Z';
});
define("plugins/new_test", ["require", "exports", "modules/mini-react/index", "decompiler", "window", "modules/components/index", "modules/plugin-manager", "modules/plugin", "modules/ui/index", "modules/font-awesome-solid"], function (require, exports, React, decompiler_2, window_5, components_4, plugin_manager_1, plugin_1, ui_1, font_awesome_solid_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const HoverBox = props => {
        const [isHovered, setIsHovered] = React.useState(false);
        const { style, children } = props, rest = __rest(props, ["style", "children"]);
        const boxStyle = Object.assign(Object.assign({}, style), { backgroundColor: isHovered ? 'rgb(51, 51, 51)' : 'rgb(27, 27, 27)' });
        return (React.createElement(ui_1.Box, Object.assign({}, rest, { style: boxStyle, onMouseEnter: e => setIsHovered(true), onMouseLeave: e => setIsHovered(false) }), children));
    };
    const Test = () => {
        const [fontSize, setFontSize] = React.useState(10);
        const t = React.useRef(0);
        React.useEffect(() => {
            const listener = decompiler_2.decompiler.onService(() => {
                t.current += 0.01;
                setFontSize(Math.sin(t.current) * 10 + 16);
            });
            return () => {
                decompiler_2.decompiler.offService(listener);
            };
        }, []);
        return (React.createElement(HoverBox, { style: {
                flex: 1,
                color: 'rgb(255, 255, 255)',
                borderRadius: '10vw',
                fontSize: `${fontSize}px`,
                overflow: 'hidden'
            }, onClick: e => console.log(`onClick: ${e}`), onMouseDown: e => console.log(`onMouseDown: ${e}`), onMouseUp: e => console.log(`onMouseUp: ${e}`), onMouseEnter: e => console.log(`onMouseEnter: ${e}`), onMouseLeave: e => console.log(`onMouseLeave: ${e}`), onMouseMove: e => console.log(`onMouseMove: ${e}`), onMouseOut: e => console.log(`onMouseOut: ${e}`), onMouseOver: e => console.log(`onMouseOver: ${e}`), onMouseWheel: e => console.log(`onMouseWheel: ${e}`), onScroll: e => console.log(`onScroll: ${e}`), onKeyDown: e => console.log(`onKeyDown: ${e}`), onKeyUp: e => console.log(`onKeyUp: ${e}`), onFocus: e => console.log(`onFocus: ${e}`), onBlur: e => console.log(`onBlur: ${e}`), onResize: e => console.log(`onResize: ${e}`) },
            "Test ",
            fontSize));
    };
    class NewTestPlugin extends plugin_1.IPlugin {
        constructor() {
            super('NewTestPlugin');
        }
        onInitialize() {
            const window = new window_5.Window();
            decompiler_2.decompiler.addWindow(window);
            const root = (0, ui_1.createRoot)(window);
            root.addFontFamily({
                name: 'arial',
                filePath: 'font/ARIAL.TTF',
                sdfFactorMax: 1,
                sdfFactorMin: 0
            }, true);
            root.addFontFamily({
                name: 'FontAwesome',
                filePath: 'font/fa7-solid-900.otf',
                sdfFactorMax: 1,
                sdfFactorMin: 0,
                codepoints: [font_awesome_solid_1.FaFaceSmile, font_awesome_solid_1.FaTruck, font_awesome_solid_1.FaChevronDown, font_awesome_solid_1.FaChevronUp]
            });
            root.render(React.createElement(components_4.WindowProvider, { window: window, open: true },
                React.createElement(ui_1.Box, { style: {
                        width: '100%',
                        height: '100%',
                        paddingTop: '10px',
                        paddingRight: '10px',
                        paddingBottom: '10px',
                        paddingLeft: '10px',
                        alignItems: 'stretch',
                        gap: '10px',
                        backgroundColor: 'rgb(0, 0, 0)'
                    } },
                    React.createElement(ui_1.Box, { style: {
                            flex: 1,
                            gap: '10px',
                            alignItems: 'stretch',
                            flexDirection: 'column'
                        } },
                        React.createElement(HoverBox, { style: {
                                flex: 1,
                                borderRadius: '5px',
                                borderTopLeftRadius: '30px',
                                fontFamily: 'FontAwesome',
                                color: '#ffffff',
                                fontSize: '24px',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '0.1rem'
                            } },
                            font_awesome_solid_1.FaChevronDown,
                            font_awesome_solid_1.FaFaceSmile,
                            font_awesome_solid_1.FaTruck,
                            font_awesome_solid_1.FaChevronUp),
                        React.createElement(HoverBox, { style: { flex: 1, borderRadius: '5px' } }),
                        React.createElement(HoverBox, { style: {
                                flex: 1,
                                borderRadius: '5px',
                                borderBottomLeftRadius: '30px'
                            } })),
                    React.createElement(ui_1.Box, { style: {
                            flex: 1,
                            gap: '10px',
                            alignItems: 'stretch',
                            flexDirection: 'column'
                        } },
                        React.createElement(HoverBox, { style: { flex: 1, borderRadius: '5px' } }),
                        React.createElement(Test, null),
                        React.createElement(HoverBox, { style: { flex: 1, borderRadius: '5px' } })),
                    React.createElement(ui_1.Box, { style: {
                            flex: 1,
                            gap: '10px',
                            alignItems: 'stretch',
                            flexDirection: 'column'
                        } },
                        React.createElement(HoverBox, { style: {
                                flex: 1,
                                borderRadius: '5px',
                                borderTopRightRadius: '30px'
                            } }),
                        React.createElement(HoverBox, { style: { flex: 1, borderRadius: '5px' } }),
                        React.createElement(HoverBox, { style: {
                                flex: 1,
                                borderRadius: '5px',
                                borderBottomRightRadius: '30px'
                            } })))));
        }
    }
    plugin_manager_1.default.addPlugin(new NewTestPlugin());
});
define("plugins/index", ["require", "exports", "plugins/new_test"], function (require, exports, new_test_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // export * from './test_plugin';
    __exportStar(new_test_1, exports);
});
define("main", ["require", "exports", "modules/plugin-manager", "plugins/index"], function (require, exports, plugin_manager_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.main = main;
    function main() {
        plugin_manager_2.default.initialize();
    }
});
define("modules/font-awesome-brands", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FaZhihu = exports.FaYoutube = exports.FaYoast = exports.FaYelp = exports.FaYarn = exports.FaYandexInternational = exports.FaYandex = exports.FaYammer = exports.FaYahoo = exports.FaYCombinator = exports.FaXing = exports.FaXbox = exports.FaXTwitter = exports.FaWpressr = exports.FaWpforms = exports.FaWpexplorer = exports.FaWpbeginner = exports.FaWordpressSimple = exports.FaWordpress = exports.FaWolfPackBattalion = exports.FaWodu = exports.FaWizardsOfTheCoast = exports.FaWix = exports.FaWirsindhandwerk = exports.FaWindows = exports.FaWikipediaW = exports.FaWhmcs = exports.FaWhatsapp = exports.FaWeixin = exports.FaWeibo = exports.FaWeebly = exports.FaWebflow = exports.FaWebAwesome = exports.FaWaze = exports.FaWatchmanMonitoring = exports.FaW3c = exports.FaVuejs = exports.FaVsco = exports.FaVnv = exports.FaVk = exports.FaVine = exports.FaVimeoV = exports.FaVimeo = exports.FaViber = exports.FaViadeo = exports.FaViacoin = exports.FaVaadin = exports.FaUssunnah = exports.FaUsps = exports.FaUsb = exports.FaUpwork = exports.FaUps = exports.FaUntappd = exports.FaUnsplash = exports.FaUnity = exports.FaUniregistry = exports.FaUncharted = exports.FaUmbraco = exports.FaUikit = exports.FaUbuntu = exports.FaUber = exports.FaTypo3 = exports.FaTwitter = exports.FaTwitch = exports.FaTumblr = exports.FaTrello = exports.FaTradeFederation = exports.FaTiktok = exports.FaTidal = exports.FaThreads = exports.FaThinkPeaks = exports.FaThemeisle = exports.FaThemeco = exports.FaTheRedYeti = exports.FaTex = exports.FaTencentWeibo = exports.FaTelegram = exports.FaTeamspeak = exports.FaSymfony = exports.FaSwift = exports.FaSuse = exports.FaSupple = exports.FaSuperpowers = exports.FaStumbleuponCircle = exports.FaStumbleupon = exports.FaStudiovinari = exports.FaStubber = exports.FaStripeS = exports.FaStripe = exports.FaStrava = exports.FaStickerMule = exports.FaSteamSymbol = exports.FaSteam = exports.FaStaylinked = exports.FaStackpath = exports.FaStackOverflow = exports.FaStackExchange = exports.FaSquarespace = exports.FaSquareYoutube = exports.FaSquareXing = exports.FaSquareXTwitter = exports.FaSquareWhatsapp = exports.FaSquareWebAwesomeStroke = exports.FaSquareWebAwesome = exports.FaSquareVimeo = exports.FaSquareViadeo = exports.FaSquareUpwork = exports.FaSquareTwitter = exports.FaSquareTumblr = exports.FaSquareThreads = exports.FaSquareSteam = exports.FaSquareSnapchat = exports.FaSquareReddit = exports.FaSquarePinterest = exports.FaSquarePiedPiper = exports.FaSquareOdnoklassniki = exports.FaSquareLinkedin = exports.FaSquareLetterboxd = exports.FaSquareLastfm = exports.FaSquareJs = exports.FaSquareInstagram = exports.FaSquareHackerNews = exports.FaSquareGooglePlus = exports.FaSquareGitlab = exports.FaSquareGithub = exports.FaSquareGit = exports.FaSquareFontAwesomeStroke = exports.FaSquareFontAwesome = exports.FaSquareFigma = exports.FaSquareFacebook = exports.FaSquareDribbble = exports.FaSquareBluesky = exports.FaSquareBehance = exports.FaSpotify = exports.FaSpeakerDeck = exports.FaSpeakap = exports.FaSpaceAwesome = exports.FaSourcetree = exports.FaSoundcloud = exports.FaSnapchat = exports.FaSlideshare = exports.FaSlack = exports.FaSkype = exports.FaSkyatlas = exports.FaSketch = exports.FaSitrox = exports.FaSith = exports.FaSistrix = exports.FaSimplybuilt = exports.FaSignalMessenger = exports.FaShopware = exports.FaShopify = exports.FaShoelace = exports.FaShirtsinbulk = exports.FaServicestack = exports.FaSellsy = exports.FaSellcast = exports.FaSearchengin = exports.FaScribd = exports.FaScreenpal = exports.FaSchlix = exports.FaSass = exports.FaSalesforce = exports.FaSafari = exports.FaRust = exports.FaRockrms = exports.FaRocketchat = exports.FaRev = exports.FaResolving = exports.FaResearchgate = exports.FaReplyd = exports.FaRenren = exports.FaRedhat = exports.FaRedditAlien = exports.FaReddit = exports.FaRedRiver = exports.FaRebel = exports.FaReadme = exports.FaReacteurope = exports.FaReact = exports.FaRavelry = exports.FaRaspberryPi = exports.FaRProject = exports.FaQuora = exports.FaQuinscape = exports.FaQq = exports.FaPython = exports.FaPushed = exports.FaProductHunt = exports.FaPlaystation = exports.FaPixiv = exports.FaPixelfed = exports.FaPix = exports.FaPinterestP = exports.FaPinterest = exports.FaPiedPiperPp = exports.FaPiedPiperHat = exports.FaPiedPiperAlt = exports.FaPiedPiper = exports.FaPhp = exports.FaPhoenixSquadron = exports.FaPhoenixFramework = exports.FaPhabricator = exports.FaPeriscope = exports.FaPerbyte = exports.FaPaypal = exports.FaPatreon = exports.FaPandora = exports.FaPalfed = exports.FaPagelines = exports.FaPage4 = exports.FaPadlet = exports.FaOsi = exports.FaOrcid = exports.FaOptinMonster = exports.FaOpera = exports.FaOpensuse = exports.FaOpenid = exports.FaOpencart = exports.FaOpenai = exports.FaOldRepublic = exports.FaOdysee = exports.FaOdnoklassniki = exports.FaOctopusDeploy = exports.FaNutritionix = exports.FaNs8 = exports.FaNpm = exports.FaNotion = exports.FaNodeJs = exports.FaNode = exports.FaNimblr = exports.FaNfcSymbol = exports.FaNfcDirectional = exports.FaNeos = exports.FaNapster = exports.FaMonero = exports.FaModx = exports.FaMizuni = exports.FaMixer = exports.FaMixcloud = exports.FaMix = exports.FaMintbit = exports.FaMicrosoft = exports.FaMicroblog = exports.FaMeta = exports.FaMendeley = exports.FaMegaport = exports.FaMeetup = exports.FaMedrt = exports.FaMedium = exports.FaMedapps = exports.FaMdb = exports.FaMaxcdn = exports.FaMastodon = exports.FaMarkdown = exports.FaMandalorian = exports.FaMailchimp = exports.FaMagento = exports.FaLyft = exports.FaLumonDrop = exports.FaLumon = exports.FaLinux = exports.FaLinode = exports.FaLinktree = exports.FaLinkedinIn = exports.FaLinkedin = exports.FaLine = exports.FaLetterboxd = exports.FaLess = exports.FaLeanpub = exports.FaLastfm = exports.FaLaravel = exports.FaKorvue = exports.FaKickstarterK = exports.FaKickstarter = exports.FaKeycdn = exports.FaKeybase = exports.FaKakaoTalk = exports.FaKaggle = exports.FaJxl = exports.FaJsfiddle = exports.FaJs = exports.FaJoomla = exports.FaJoget = exports.FaJira = exports.FaJenkins = exports.FaJediOrder = exports.FaJava = exports.FaItunesNote = exports.FaItunes = exports.FaItchIo = exports.FaIoxhost = exports.FaInvision = exports.FaInternetExplorer = exports.FaIntercom = exports.FaInstalod = exports.FaInstagram = exports.FaImdb = exports.FaIdeal = exports.FaHubspot = exports.FaHtml5 = exports.FaHouzz = exports.FaHotjar = exports.FaHornbill = exports.FaHooli = exports.FaHive = exports.FaHireAHelper = exports.FaHips = exports.FaHashnode = exports.FaHackerrank = exports.FaHackerNews = exports.FaGulp = exports.FaGuilded = exports.FaGrunt = exports.FaGripfire = exports.FaGrav = exports.FaGratipay = exports.FaGoogleWallet = exports.FaGoogleScholar = exports.FaGooglePlusG = exports.FaGooglePlus = exports.FaGooglePlay = exports.FaGooglePay = exports.FaGoogleDrive = exports.FaGoogle = exports.FaGoodreadsG = exports.FaGoodreads = exports.FaGolang = exports.FaGofore = exports.FaGlideG = exports.FaGlide = exports.FaGitter = exports.FaGitlab = exports.FaGitkraken = exports.FaGithubAlt = exports.FaGithub = exports.FaGitAlt = exports.FaGit = exports.FaGgCircle = exports.FaGg = exports.FaGetPocket = exports.FaGalacticSenate = exports.FaGalacticRepublic = exports.FaFulcrum = exports.FaFreebsd = exports.FaFreeCodeCamp = exports.FaFoursquare = exports.FaForumbee = exports.FaFortAwesomeAlt = exports.FaFortAwesome = exports.FaFonticonsFi = exports.FaFonticons = exports.FaFontAwesome = exports.FaFly = exports.FaFlutter = exports.FaFlipboard = exports.FaFlickr = exports.FaFirstdraft = exports.FaFirstOrderAlt = exports.FaFirstOrder = exports.FaFirefoxBrowser = exports.FaFirefox = exports.FaFilesPinwheel = exports.FaFigma = exports.FaFedora = exports.FaFedex = exports.FaFantasyFlightGames = exports.FaFacebookMessenger = exports.FaFacebookF = exports.FaFacebook = exports.FaExpeditedssl = exports.FaEvernote = exports.FaEtsy = exports.FaEthereum = exports.FaErlang = exports.FaEnvira = exports.FaEmpire = exports.FaEmber = exports.FaEllo = exports.FaEleventy = exports.FaElementor = exports.FaEdgeLegacy = exports.FaEdge = exports.FaEbay = exports.FaEarlybirds = exports.FaDyalog = exports.FaDuolingo = exports.FaDrupal = exports.FaDropbox = exports.FaDribbble = exports.FaDraft2digital = exports.FaDocker = exports.FaDochub = exports.FaDisqus = exports.FaDiscourse = exports.FaDiscord = exports.FaDigitalOcean = exports.FaDigg = exports.FaDiaspora = exports.FaDhl = exports.FaDeviantart = exports.FaDev = exports.FaDeskpro = exports.FaDeploydog = exports.FaDelicious = exports.FaDeezer = exports.FaDebian = exports.FaDashcube = exports.FaDartLang = exports.FaDailymotion = exports.FaDAndDBeyond = exports.FaDAndD = exports.FaCuttlefish = exports.FaCss3Alt = exports.FaCss3 = exports.FaCss = exports.FaCriticalRole = exports.FaCreativeCommonsZero = exports.FaCreativeCommonsShare = exports.FaCreativeCommonsSamplingPlus = exports.FaCreativeCommonsSampling = exports.FaCreativeCommonsSa = exports.FaCreativeCommonsRemix = exports.FaCreativeCommonsPdAlt = exports.FaCreativeCommonsPd = exports.FaCreativeCommonsNd = exports.FaCreativeCommonsNcJp = exports.FaCreativeCommonsNcEu = exports.FaCreativeCommonsNc = exports.FaCreativeCommonsBy = exports.FaCreativeCommons = exports.FaCpanel = exports.FaCottonBureau = exports.FaContao = exports.FaConnectdevelop = exports.FaConfluence = exports.FaCodiepie = exports.FaCodepen = exports.FaCmplid = exports.FaCloudversify = exports.FaCloudsmith = exports.FaCloudscale = exports.FaCloudflare = exports.FaChromecast = exports.FaChrome = exports.FaCentos = exports.FaCentercode = exports.FaCcVisa = exports.FaCcStripe = exports.FaCcPaypal = exports.FaCcMastercard = exports.FaCcJcb = exports.FaCcDiscover = exports.FaCcDinersClub = exports.FaCcApplePay = exports.FaCcAmex = exports.FaCcAmazonPay = exports.FaCashApp = exports.FaCanadianMapleLeaf = exports.FaBuysellads = exports.FaBuyNLarge = exports.FaBuromobelexperte = exports.FaBuffer = exports.FaBtc = exports.FaBraveReverse = exports.FaBrave = exports.FaBots = exports.FaBootstrap = exports.FaBluetoothB = exports.FaBluetooth = exports.FaBluesky = exports.FaBloggerB = exports.FaBlogger = exports.FaBlackberry = exports.FaBlackTie = exports.FaBity = exports.FaBitcoin = exports.FaBitbucket = exports.FaBimobject = exports.FaBilibili = exports.FaBehance = exports.FaBattleNet = exports.FaBandcamp = exports.FaAws = exports.FaAviato = exports.FaAvianex = exports.FaAutoprefixer = exports.FaAudible = exports.FaAtlassian = exports.FaAsymmetrik = exports.FaArtstation = exports.FaApplePay = exports.FaApple = exports.FaApper = exports.FaAppStoreIos = exports.FaAppStore = exports.FaAngular = exports.FaAngrycreative = exports.FaAngellist = exports.FaAndroid = exports.FaAmilia = exports.FaAmazonPay = exports.FaAmazon = exports.FaAlipay = exports.FaAlgolia = exports.FaAirbnb = exports.FaAffiliatetheme = exports.FaAdversal = exports.FaAdn = exports.FaAccusoft = exports.FaAccessibleIcon = exports.Fa500px = exports.Fa42Group = void 0;
    /** char code: 0xe080 */ exports.Fa42Group = '';
    /** char code: 0xf26e */ exports.Fa500px = '';
    /** char code: 0xf368 */ exports.FaAccessibleIcon = '';
    /** char code: 0xf369 */ exports.FaAccusoft = '';
    /** char code: 0xf170 */ exports.FaAdn = '';
    /** char code: 0xf36a */ exports.FaAdversal = '';
    /** char code: 0xf36b */ exports.FaAffiliatetheme = '';
    /** char code: 0xf834 */ exports.FaAirbnb = '';
    /** char code: 0xf36c */ exports.FaAlgolia = '';
    /** char code: 0xf642 */ exports.FaAlipay = '';
    /** char code: 0xf270 */ exports.FaAmazon = '';
    /** char code: 0xf42c */ exports.FaAmazonPay = '';
    /** char code: 0xf36d */ exports.FaAmilia = '';
    /** char code: 0xf17b */ exports.FaAndroid = '';
    /** char code: 0xf209 */ exports.FaAngellist = '';
    /** char code: 0xf36e */ exports.FaAngrycreative = '';
    /** char code: 0xf420 */ exports.FaAngular = '';
    /** char code: 0xf36f */ exports.FaAppStore = '';
    /** char code: 0xf370 */ exports.FaAppStoreIos = '';
    /** char code: 0xf371 */ exports.FaApper = '';
    /** char code: 0xf179 */ exports.FaApple = '';
    /** char code: 0xf415 */ exports.FaApplePay = '';
    /** char code: 0xf77a */ exports.FaArtstation = '';
    /** char code: 0xf372 */ exports.FaAsymmetrik = '';
    /** char code: 0xf77b */ exports.FaAtlassian = '';
    /** char code: 0xf373 */ exports.FaAudible = '';
    /** char code: 0xf41c */ exports.FaAutoprefixer = '';
    /** char code: 0xf374 */ exports.FaAvianex = '';
    /** char code: 0xf421 */ exports.FaAviato = '';
    /** char code: 0xf375 */ exports.FaAws = '';
    /** char code: 0xf2d5 */ exports.FaBandcamp = '';
    /** char code: 0xf835 */ exports.FaBattleNet = '';
    /** char code: 0xf1b4 */ exports.FaBehance = '';
    /** char code: 0xe3d9 */ exports.FaBilibili = '';
    /** char code: 0xf378 */ exports.FaBimobject = '';
    /** char code: 0xf171 */ exports.FaBitbucket = '';
    /** char code: 0xf379 */ exports.FaBitcoin = '';
    /** char code: 0xf37a */ exports.FaBity = '';
    /** char code: 0xf27e */ exports.FaBlackTie = '';
    /** char code: 0xf37b */ exports.FaBlackberry = '';
    /** char code: 0xf37c */ exports.FaBlogger = '';
    /** char code: 0xf37d */ exports.FaBloggerB = '';
    /** char code: 0xe671 */ exports.FaBluesky = '';
    /** char code: 0xf293 */ exports.FaBluetooth = '';
    /** char code: 0xf294 */ exports.FaBluetoothB = '';
    /** char code: 0xf836 */ exports.FaBootstrap = '';
    /** char code: 0xe340 */ exports.FaBots = '';
    /** char code: 0xe63c */ exports.FaBrave = '';
    /** char code: 0xe63d */ exports.FaBraveReverse = '';
    /** char code: 0xf15a */ exports.FaBtc = '';
    /** char code: 0xf837 */ exports.FaBuffer = '';
    /** char code: 0xf37f */ exports.FaBuromobelexperte = '';
    /** char code: 0xf8a6 */ exports.FaBuyNLarge = '';
    /** char code: 0xf20d */ exports.FaBuysellads = '';
    /** char code: 0xf785 */ exports.FaCanadianMapleLeaf = '';
    /** char code: 0xe7d4 */ exports.FaCashApp = '';
    /** char code: 0xf42d */ exports.FaCcAmazonPay = '';
    /** char code: 0xf1f3 */ exports.FaCcAmex = '';
    /** char code: 0xf416 */ exports.FaCcApplePay = '';
    /** char code: 0xf24c */ exports.FaCcDinersClub = '';
    /** char code: 0xf1f2 */ exports.FaCcDiscover = '';
    /** char code: 0xf24b */ exports.FaCcJcb = '';
    /** char code: 0xf1f1 */ exports.FaCcMastercard = '';
    /** char code: 0xf1f4 */ exports.FaCcPaypal = '';
    /** char code: 0xf1f5 */ exports.FaCcStripe = '';
    /** char code: 0xf1f0 */ exports.FaCcVisa = '';
    /** char code: 0xf380 */ exports.FaCentercode = '';
    /** char code: 0xf789 */ exports.FaCentos = '';
    /** char code: 0xf268 */ exports.FaChrome = '';
    /** char code: 0xf838 */ exports.FaChromecast = '';
    /** char code: 0xe07d */ exports.FaCloudflare = '';
    /** char code: 0xf383 */ exports.FaCloudscale = '';
    /** char code: 0xf384 */ exports.FaCloudsmith = '';
    /** char code: 0xf385 */ exports.FaCloudversify = '';
    /** char code: 0xe360 */ exports.FaCmplid = '';
    /** char code: 0xf1cb */ exports.FaCodepen = '';
    /** char code: 0xf284 */ exports.FaCodiepie = '';
    /** char code: 0xf78d */ exports.FaConfluence = '';
    /** char code: 0xf20e */ exports.FaConnectdevelop = '';
    /** char code: 0xf26d */ exports.FaContao = '';
    /** char code: 0xf89e */ exports.FaCottonBureau = '';
    /** char code: 0xf388 */ exports.FaCpanel = '';
    /** char code: 0xf25e */ exports.FaCreativeCommons = '';
    /** char code: 0xf4e7 */ exports.FaCreativeCommonsBy = '';
    /** char code: 0xf4e8 */ exports.FaCreativeCommonsNc = '';
    /** char code: 0xf4e9 */ exports.FaCreativeCommonsNcEu = '';
    /** char code: 0xf4ea */ exports.FaCreativeCommonsNcJp = '';
    /** char code: 0xf4eb */ exports.FaCreativeCommonsNd = '';
    /** char code: 0xf4ec */ exports.FaCreativeCommonsPd = '';
    /** char code: 0xf4ed */ exports.FaCreativeCommonsPdAlt = '';
    /** char code: 0xf4ee */ exports.FaCreativeCommonsRemix = '';
    /** char code: 0xf4ef */ exports.FaCreativeCommonsSa = '';
    /** char code: 0xf4f0 */ exports.FaCreativeCommonsSampling = '';
    /** char code: 0xf4f1 */ exports.FaCreativeCommonsSamplingPlus = '';
    /** char code: 0xf4f2 */ exports.FaCreativeCommonsShare = '';
    /** char code: 0xf4f3 */ exports.FaCreativeCommonsZero = '';
    /** char code: 0xf6c9 */ exports.FaCriticalRole = '';
    /** char code: 0xe6a2 */ exports.FaCss = '';
    /** char code: 0xf13c */ exports.FaCss3 = '';
    /** char code: 0xf38b */ exports.FaCss3Alt = '';
    /** char code: 0xf38c */ exports.FaCuttlefish = '';
    /** char code: 0xf38d */ exports.FaDAndD = '';
    /** char code: 0xf6ca */ exports.FaDAndDBeyond = '';
    /** char code: 0xe052 */ exports.FaDailymotion = '';
    /** char code: 0xe693 */ exports.FaDartLang = '';
    /** char code: 0xf210 */ exports.FaDashcube = '';
    /** char code: 0xe60b */ exports.FaDebian = '';
    /** char code: 0xe077 */ exports.FaDeezer = '';
    /** char code: 0xf1a5 */ exports.FaDelicious = '';
    /** char code: 0xf38e */ exports.FaDeploydog = '';
    /** char code: 0xf38f */ exports.FaDeskpro = '';
    /** char code: 0xf6cc */ exports.FaDev = '';
    /** char code: 0xf1bd */ exports.FaDeviantart = '';
    /** char code: 0xf790 */ exports.FaDhl = '';
    /** char code: 0xf791 */ exports.FaDiaspora = '';
    /** char code: 0xf1a6 */ exports.FaDigg = '';
    /** char code: 0xf391 */ exports.FaDigitalOcean = '';
    /** char code: 0xf392 */ exports.FaDiscord = '';
    /** char code: 0xf393 */ exports.FaDiscourse = '';
    /** char code: 0xe7d5 */ exports.FaDisqus = '';
    /** char code: 0xf394 */ exports.FaDochub = '';
    /** char code: 0xf395 */ exports.FaDocker = '';
    /** char code: 0xf396 */ exports.FaDraft2digital = '';
    /** char code: 0xf17d */ exports.FaDribbble = '';
    /** char code: 0xf16b */ exports.FaDropbox = '';
    /** char code: 0xf1a9 */ exports.FaDrupal = '';
    /** char code: 0xe812 */ exports.FaDuolingo = '';
    /** char code: 0xf399 */ exports.FaDyalog = '';
    /** char code: 0xf39a */ exports.FaEarlybirds = '';
    /** char code: 0xf4f4 */ exports.FaEbay = '';
    /** char code: 0xf282 */ exports.FaEdge = '';
    /** char code: 0xe078 */ exports.FaEdgeLegacy = '';
    /** char code: 0xf430 */ exports.FaElementor = '';
    /** char code: 0xe7d6 */ exports.FaEleventy = '';
    /** char code: 0xf5f1 */ exports.FaEllo = '';
    /** char code: 0xf423 */ exports.FaEmber = '';
    /** char code: 0xf1d1 */ exports.FaEmpire = '';
    /** char code: 0xf299 */ exports.FaEnvira = '';
    /** char code: 0xf39d */ exports.FaErlang = '';
    /** char code: 0xf42e */ exports.FaEthereum = '';
    /** char code: 0xf2d7 */ exports.FaEtsy = '';
    /** char code: 0xf839 */ exports.FaEvernote = '';
    /** char code: 0xf23e */ exports.FaExpeditedssl = '';
    /** char code: 0xf09a */ exports.FaFacebook = '';
    /** char code: 0xf39e */ exports.FaFacebookF = '';
    /** char code: 0xf39f */ exports.FaFacebookMessenger = '';
    /** char code: 0xf6dc */ exports.FaFantasyFlightGames = '';
    /** char code: 0xf797 */ exports.FaFedex = '';
    /** char code: 0xf798 */ exports.FaFedora = '';
    /** char code: 0xf799 */ exports.FaFigma = '';
    /** char code: 0xe69f */ exports.FaFilesPinwheel = '';
    /** char code: 0xf269 */ exports.FaFirefox = '';
    /** char code: 0xe007 */ exports.FaFirefoxBrowser = '';
    /** char code: 0xf2b0 */ exports.FaFirstOrder = '';
    /** char code: 0xf50a */ exports.FaFirstOrderAlt = '';
    /** char code: 0xf3a1 */ exports.FaFirstdraft = '';
    /** char code: 0xf16e */ exports.FaFlickr = '';
    /** char code: 0xf44d */ exports.FaFlipboard = '';
    /** char code: 0xe694 */ exports.FaFlutter = '';
    /** char code: 0xf417 */ exports.FaFly = '';
    /** char code: 0xf2b4 */ exports.FaFontAwesome = '';
    /** char code: 0xf280 */ exports.FaFonticons = '';
    /** char code: 0xf3a2 */ exports.FaFonticonsFi = '';
    /** char code: 0xf286 */ exports.FaFortAwesome = '';
    /** char code: 0xf3a3 */ exports.FaFortAwesomeAlt = '';
    /** char code: 0xf211 */ exports.FaForumbee = '';
    /** char code: 0xf180 */ exports.FaFoursquare = '';
    /** char code: 0xf2c5 */ exports.FaFreeCodeCamp = '';
    /** char code: 0xf3a4 */ exports.FaFreebsd = '';
    /** char code: 0xf50b */ exports.FaFulcrum = '';
    /** char code: 0xf50c */ exports.FaGalacticRepublic = '';
    /** char code: 0xf50d */ exports.FaGalacticSenate = '';
    /** char code: 0xf265 */ exports.FaGetPocket = '';
    /** char code: 0xf260 */ exports.FaGg = '';
    /** char code: 0xf261 */ exports.FaGgCircle = '';
    /** char code: 0xf1d3 */ exports.FaGit = '';
    /** char code: 0xf841 */ exports.FaGitAlt = '';
    /** char code: 0xf09b */ exports.FaGithub = '';
    /** char code: 0xf113 */ exports.FaGithubAlt = '';
    /** char code: 0xf3a6 */ exports.FaGitkraken = '';
    /** char code: 0xf296 */ exports.FaGitlab = '';
    /** char code: 0xf426 */ exports.FaGitter = '';
    /** char code: 0xf2a5 */ exports.FaGlide = '';
    /** char code: 0xf2a6 */ exports.FaGlideG = '';
    /** char code: 0xf3a7 */ exports.FaGofore = '';
    /** char code: 0xe40f */ exports.FaGolang = '';
    /** char code: 0xf3a8 */ exports.FaGoodreads = '';
    /** char code: 0xf3a9 */ exports.FaGoodreadsG = '';
    /** char code: 0xf1a0 */ exports.FaGoogle = '';
    /** char code: 0xf3aa */ exports.FaGoogleDrive = '';
    /** char code: 0xe079 */ exports.FaGooglePay = '';
    /** char code: 0xf3ab */ exports.FaGooglePlay = '';
    /** char code: 0xf2b3 */ exports.FaGooglePlus = '';
    /** char code: 0xf0d5 */ exports.FaGooglePlusG = '';
    /** char code: 0xe63b */ exports.FaGoogleScholar = '';
    /** char code: 0xf1ee */ exports.FaGoogleWallet = '';
    /** char code: 0xf184 */ exports.FaGratipay = '';
    /** char code: 0xf2d6 */ exports.FaGrav = '';
    /** char code: 0xf3ac */ exports.FaGripfire = '';
    /** char code: 0xf3ad */ exports.FaGrunt = '';
    /** char code: 0xe07e */ exports.FaGuilded = '';
    /** char code: 0xf3ae */ exports.FaGulp = '';
    /** char code: 0xf1d4 */ exports.FaHackerNews = '';
    /** char code: 0xf5f7 */ exports.FaHackerrank = '';
    /** char code: 0xe499 */ exports.FaHashnode = '';
    /** char code: 0xf452 */ exports.FaHips = '';
    /** char code: 0xf3b0 */ exports.FaHireAHelper = '';
    /** char code: 0xe07f */ exports.FaHive = '';
    /** char code: 0xf427 */ exports.FaHooli = '';
    /** char code: 0xf592 */ exports.FaHornbill = '';
    /** char code: 0xf3b1 */ exports.FaHotjar = '';
    /** char code: 0xf27c */ exports.FaHouzz = '';
    /** char code: 0xf13b */ exports.FaHtml5 = '';
    /** char code: 0xf3b2 */ exports.FaHubspot = '';
    /** char code: 0xe013 */ exports.FaIdeal = '';
    /** char code: 0xf2d8 */ exports.FaImdb = '';
    /** char code: 0xf16d */ exports.FaInstagram = '';
    /** char code: 0xe081 */ exports.FaInstalod = '';
    /** char code: 0xf7af */ exports.FaIntercom = '';
    /** char code: 0xf26b */ exports.FaInternetExplorer = '';
    /** char code: 0xf7b0 */ exports.FaInvision = '';
    /** char code: 0xf208 */ exports.FaIoxhost = '';
    /** char code: 0xf83a */ exports.FaItchIo = '';
    /** char code: 0xf3b4 */ exports.FaItunes = '';
    /** char code: 0xf3b5 */ exports.FaItunesNote = '';
    /** char code: 0xf4e4 */ exports.FaJava = '';
    /** char code: 0xf50e */ exports.FaJediOrder = '';
    /** char code: 0xf3b6 */ exports.FaJenkins = '';
    /** char code: 0xf7b1 */ exports.FaJira = '';
    /** char code: 0xf3b7 */ exports.FaJoget = '';
    /** char code: 0xf1aa */ exports.FaJoomla = '';
    /** char code: 0xf3b8 */ exports.FaJs = '';
    /** char code: 0xf1cc */ exports.FaJsfiddle = '';
    /** char code: 0xe67b */ exports.FaJxl = '';
    /** char code: 0xf5fa */ exports.FaKaggle = '';
    /** char code: 0xe7d7 */ exports.FaKakaoTalk = '';
    /** char code: 0xf4f5 */ exports.FaKeybase = '';
    /** char code: 0xf3ba */ exports.FaKeycdn = '';
    /** char code: 0xf3bb */ exports.FaKickstarter = '';
    /** char code: 0xf3bc */ exports.FaKickstarterK = '';
    /** char code: 0xf42f */ exports.FaKorvue = '';
    /** char code: 0xf3bd */ exports.FaLaravel = '';
    /** char code: 0xf202 */ exports.FaLastfm = '';
    /** char code: 0xf212 */ exports.FaLeanpub = '';
    /** char code: 0xf41d */ exports.FaLess = '';
    /** char code: 0xe62d */ exports.FaLetterboxd = '';
    /** char code: 0xf3c0 */ exports.FaLine = '';
    /** char code: 0xf08c */ exports.FaLinkedin = '';
    /** char code: 0xf0e1 */ exports.FaLinkedinIn = '';
    /** char code: 0xe7d8 */ exports.FaLinktree = '';
    /** char code: 0xf2b8 */ exports.FaLinode = '';
    /** char code: 0xf17c */ exports.FaLinux = '';
    /** char code: 0xe7e2 */ exports.FaLumon = '';
    /** char code: 0xe7e3 */ exports.FaLumonDrop = '';
    /** char code: 0xf3c3 */ exports.FaLyft = '';
    /** char code: 0xf3c4 */ exports.FaMagento = '';
    /** char code: 0xf59e */ exports.FaMailchimp = '';
    /** char code: 0xf50f */ exports.FaMandalorian = '';
    /** char code: 0xf60f */ exports.FaMarkdown = '';
    /** char code: 0xf4f6 */ exports.FaMastodon = '';
    /** char code: 0xf136 */ exports.FaMaxcdn = '';
    /** char code: 0xf8ca */ exports.FaMdb = '';
    /** char code: 0xf3c6 */ exports.FaMedapps = '';
    /** char code: 0xf23a */ exports.FaMedium = '';
    /** char code: 0xf3c8 */ exports.FaMedrt = '';
    /** char code: 0xf2e0 */ exports.FaMeetup = '';
    /** char code: 0xf5a3 */ exports.FaMegaport = '';
    /** char code: 0xf7b3 */ exports.FaMendeley = '';
    /** char code: 0xe49b */ exports.FaMeta = '';
    /** char code: 0xe01a */ exports.FaMicroblog = '';
    /** char code: 0xf3ca */ exports.FaMicrosoft = '';
    /** char code: 0xe62f */ exports.FaMintbit = '';
    /** char code: 0xf3cb */ exports.FaMix = '';
    /** char code: 0xf289 */ exports.FaMixcloud = '';
    /** char code: 0xe056 */ exports.FaMixer = '';
    /** char code: 0xf3cc */ exports.FaMizuni = '';
    /** char code: 0xf285 */ exports.FaModx = '';
    /** char code: 0xf3d0 */ exports.FaMonero = '';
    /** char code: 0xf3d2 */ exports.FaNapster = '';
    /** char code: 0xf612 */ exports.FaNeos = '';
    /** char code: 0xe530 */ exports.FaNfcDirectional = '';
    /** char code: 0xe531 */ exports.FaNfcSymbol = '';
    /** char code: 0xf5a8 */ exports.FaNimblr = '';
    /** char code: 0xf419 */ exports.FaNode = '';
    /** char code: 0xf3d3 */ exports.FaNodeJs = '';
    /** char code: 0xe7d9 */ exports.FaNotion = '';
    /** char code: 0xf3d4 */ exports.FaNpm = '';
    /** char code: 0xf3d5 */ exports.FaNs8 = '';
    /** char code: 0xf3d6 */ exports.FaNutritionix = '';
    /** char code: 0xe082 */ exports.FaOctopusDeploy = '';
    /** char code: 0xf263 */ exports.FaOdnoklassniki = '';
    /** char code: 0xe5c6 */ exports.FaOdysee = '';
    /** char code: 0xf510 */ exports.FaOldRepublic = '';
    /** char code: 0xe7cf */ exports.FaOpenai = '';
    /** char code: 0xf23d */ exports.FaOpencart = '';
    /** char code: 0xf19b */ exports.FaOpenid = '';
    /** char code: 0xe62b */ exports.FaOpensuse = '';
    /** char code: 0xf26a */ exports.FaOpera = '';
    /** char code: 0xf23c */ exports.FaOptinMonster = '';
    /** char code: 0xf8d2 */ exports.FaOrcid = '';
    /** char code: 0xf41a */ exports.FaOsi = '';
    /** char code: 0xe4a0 */ exports.FaPadlet = '';
    /** char code: 0xf3d7 */ exports.FaPage4 = '';
    /** char code: 0xf18c */ exports.FaPagelines = '';
    /** char code: 0xf3d8 */ exports.FaPalfed = '';
    /** char code: 0xe7da */ exports.FaPandora = '';
    /** char code: 0xf3d9 */ exports.FaPatreon = '';
    /** char code: 0xf1ed */ exports.FaPaypal = '';
    /** char code: 0xe083 */ exports.FaPerbyte = '';
    /** char code: 0xf3da */ exports.FaPeriscope = '';
    /** char code: 0xf3db */ exports.FaPhabricator = '';
    /** char code: 0xf3dc */ exports.FaPhoenixFramework = '';
    /** char code: 0xf511 */ exports.FaPhoenixSquadron = '';
    /** char code: 0xf457 */ exports.FaPhp = '';
    /** char code: 0xf2ae */ exports.FaPiedPiper = '';
    /** char code: 0xf1a8 */ exports.FaPiedPiperAlt = '';
    /** char code: 0xf4e5 */ exports.FaPiedPiperHat = '';
    /** char code: 0xf1a7 */ exports.FaPiedPiperPp = '';
    /** char code: 0xf0d2 */ exports.FaPinterest = '';
    /** char code: 0xf231 */ exports.FaPinterestP = '';
    /** char code: 0xe43a */ exports.FaPix = '';
    /** char code: 0xe7db */ exports.FaPixelfed = '';
    /** char code: 0xe640 */ exports.FaPixiv = '';
    /** char code: 0xf3df */ exports.FaPlaystation = '';
    /** char code: 0xf288 */ exports.FaProductHunt = '';
    /** char code: 0xf3e1 */ exports.FaPushed = '';
    /** char code: 0xf3e2 */ exports.FaPython = '';
    /** char code: 0xf1d6 */ exports.FaQq = '';
    /** char code: 0xf459 */ exports.FaQuinscape = '';
    /** char code: 0xf2c4 */ exports.FaQuora = '';
    /** char code: 0xf4f7 */ exports.FaRProject = '';
    /** char code: 0xf7bb */ exports.FaRaspberryPi = '';
    /** char code: 0xf2d9 */ exports.FaRavelry = '';
    /** char code: 0xf41b */ exports.FaReact = '';
    /** char code: 0xf75d */ exports.FaReacteurope = '';
    /** char code: 0xf4d5 */ exports.FaReadme = '';
    /** char code: 0xf1d0 */ exports.FaRebel = '';
    /** char code: 0xf3e3 */ exports.FaRedRiver = '';
    /** char code: 0xf1a1 */ exports.FaReddit = '';
    /** char code: 0xf281 */ exports.FaRedditAlien = '';
    /** char code: 0xf7bc */ exports.FaRedhat = '';
    /** char code: 0xf18b */ exports.FaRenren = '';
    /** char code: 0xf3e6 */ exports.FaReplyd = '';
    /** char code: 0xf4f8 */ exports.FaResearchgate = '';
    /** char code: 0xf3e7 */ exports.FaResolving = '';
    /** char code: 0xf5b2 */ exports.FaRev = '';
    /** char code: 0xf3e8 */ exports.FaRocketchat = '';
    /** char code: 0xf3e9 */ exports.FaRockrms = '';
    /** char code: 0xe07a */ exports.FaRust = '';
    /** char code: 0xf267 */ exports.FaSafari = '';
    /** char code: 0xf83b */ exports.FaSalesforce = '';
    /** char code: 0xf41e */ exports.FaSass = '';
    /** char code: 0xf3ea */ exports.FaSchlix = '';
    /** char code: 0xe570 */ exports.FaScreenpal = '';
    /** char code: 0xf28a */ exports.FaScribd = '';
    /** char code: 0xf3eb */ exports.FaSearchengin = '';
    /** char code: 0xf2da */ exports.FaSellcast = '';
    /** char code: 0xf213 */ exports.FaSellsy = '';
    /** char code: 0xf3ec */ exports.FaServicestack = '';
    /** char code: 0xf214 */ exports.FaShirtsinbulk = '';
    /** char code: 0xe60c */ exports.FaShoelace = '';
    /** char code: 0xe057 */ exports.FaShopify = '';
    /** char code: 0xf5b5 */ exports.FaShopware = '';
    /** char code: 0xe663 */ exports.FaSignalMessenger = '';
    /** char code: 0xf215 */ exports.FaSimplybuilt = '';
    /** char code: 0xf3ee */ exports.FaSistrix = '';
    /** char code: 0xf512 */ exports.FaSith = '';
    /** char code: 0xe44a */ exports.FaSitrox = '';
    /** char code: 0xf7c6 */ exports.FaSketch = '';
    /** char code: 0xf216 */ exports.FaSkyatlas = '';
    /** char code: 0xf17e */ exports.FaSkype = '';
    /** char code: 0xf198 */ exports.FaSlack = '';
    /** char code: 0xf1e7 */ exports.FaSlideshare = '';
    /** char code: 0xf2ab */ exports.FaSnapchat = '';
    /** char code: 0xf1be */ exports.FaSoundcloud = '';
    /** char code: 0xf7d3 */ exports.FaSourcetree = '';
    /** char code: 0xe5ac */ exports.FaSpaceAwesome = '';
    /** char code: 0xf3f3 */ exports.FaSpeakap = '';
    /** char code: 0xf83c */ exports.FaSpeakerDeck = '';
    /** char code: 0xf1bc */ exports.FaSpotify = '';
    /** char code: 0xf1b5 */ exports.FaSquareBehance = '';
    /** char code: 0xe6a3 */ exports.FaSquareBluesky = '';
    /** char code: 0xf397 */ exports.FaSquareDribbble = '';
    /** char code: 0xf082 */ exports.FaSquareFacebook = '';
    /** char code: 0xe7e4 */ exports.FaSquareFigma = '';
    /** char code: 0xe5ad */ exports.FaSquareFontAwesome = '';
    /** char code: 0xf35c */ exports.FaSquareFontAwesomeStroke = '';
    /** char code: 0xf1d2 */ exports.FaSquareGit = '';
    /** char code: 0xf092 */ exports.FaSquareGithub = '';
    /** char code: 0xe5ae */ exports.FaSquareGitlab = '';
    /** char code: 0xf0d4 */ exports.FaSquareGooglePlus = '';
    /** char code: 0xf3af */ exports.FaSquareHackerNews = '';
    /** char code: 0xe055 */ exports.FaSquareInstagram = '';
    /** char code: 0xf3b9 */ exports.FaSquareJs = '';
    /** char code: 0xf203 */ exports.FaSquareLastfm = '';
    /** char code: 0xe62e */ exports.FaSquareLetterboxd = '';
    /** char code: 0xe7d0 */ exports.FaSquareLinkedin = '';
    /** char code: 0xf264 */ exports.FaSquareOdnoklassniki = '';
    /** char code: 0xe01e */ exports.FaSquarePiedPiper = '';
    /** char code: 0xf0d3 */ exports.FaSquarePinterest = '';
    /** char code: 0xf1a2 */ exports.FaSquareReddit = '';
    /** char code: 0xf2ad */ exports.FaSquareSnapchat = '';
    /** char code: 0xf1b7 */ exports.FaSquareSteam = '';
    /** char code: 0xe619 */ exports.FaSquareThreads = '';
    /** char code: 0xf174 */ exports.FaSquareTumblr = '';
    /** char code: 0xf081 */ exports.FaSquareTwitter = '';
    /** char code: 0xe67c */ exports.FaSquareUpwork = '';
    /** char code: 0xf2aa */ exports.FaSquareViadeo = '';
    /** char code: 0xf194 */ exports.FaSquareVimeo = '';
    /** char code: 0xe683 */ exports.FaSquareWebAwesome = '';
    /** char code: 0xe684 */ exports.FaSquareWebAwesomeStroke = '';
    /** char code: 0xf40c */ exports.FaSquareWhatsapp = '';
    /** char code: 0xe61a */ exports.FaSquareXTwitter = '';
    /** char code: 0xf169 */ exports.FaSquareXing = '';
    /** char code: 0xf431 */ exports.FaSquareYoutube = '';
    /** char code: 0xf5be */ exports.FaSquarespace = '';
    /** char code: 0xf18d */ exports.FaStackExchange = '';
    /** char code: 0xf16c */ exports.FaStackOverflow = '';
    /** char code: 0xf842 */ exports.FaStackpath = '';
    /** char code: 0xf3f5 */ exports.FaStaylinked = '';
    /** char code: 0xf1b6 */ exports.FaSteam = '';
    /** char code: 0xf3f6 */ exports.FaSteamSymbol = '';
    /** char code: 0xf3f7 */ exports.FaStickerMule = '';
    /** char code: 0xf428 */ exports.FaStrava = '';
    /** char code: 0xf429 */ exports.FaStripe = '';
    /** char code: 0xf42a */ exports.FaStripeS = '';
    /** char code: 0xe5c7 */ exports.FaStubber = '';
    /** char code: 0xf3f8 */ exports.FaStudiovinari = '';
    /** char code: 0xf1a4 */ exports.FaStumbleupon = '';
    /** char code: 0xf1a3 */ exports.FaStumbleuponCircle = '';
    /** char code: 0xf2dd */ exports.FaSuperpowers = '';
    /** char code: 0xf3f9 */ exports.FaSupple = '';
    /** char code: 0xf7d6 */ exports.FaSuse = '';
    /** char code: 0xf8e1 */ exports.FaSwift = '';
    /** char code: 0xf83d */ exports.FaSymfony = '';
    /** char code: 0xf4f9 */ exports.FaTeamspeak = '';
    /** char code: 0xf2c6 */ exports.FaTelegram = '';
    /** char code: 0xf1d5 */ exports.FaTencentWeibo = '';
    /** char code: 0xe7ff */ exports.FaTex = '';
    /** char code: 0xf69d */ exports.FaTheRedYeti = '';
    /** char code: 0xf5c6 */ exports.FaThemeco = '';
    /** char code: 0xf2b2 */ exports.FaThemeisle = '';
    /** char code: 0xf731 */ exports.FaThinkPeaks = '';
    /** char code: 0xe618 */ exports.FaThreads = '';
    /** char code: 0xe7dc */ exports.FaTidal = '';
    /** char code: 0xe07b */ exports.FaTiktok = '';
    /** char code: 0xf513 */ exports.FaTradeFederation = '';
    /** char code: 0xf181 */ exports.FaTrello = '';
    /** char code: 0xf173 */ exports.FaTumblr = '';
    /** char code: 0xf1e8 */ exports.FaTwitch = '';
    /** char code: 0xf099 */ exports.FaTwitter = '';
    /** char code: 0xf42b */ exports.FaTypo3 = '';
    /** char code: 0xf402 */ exports.FaUber = '';
    /** char code: 0xf7df */ exports.FaUbuntu = '';
    /** char code: 0xf403 */ exports.FaUikit = '';
    /** char code: 0xf8e8 */ exports.FaUmbraco = '';
    /** char code: 0xe084 */ exports.FaUncharted = '';
    /** char code: 0xf404 */ exports.FaUniregistry = '';
    /** char code: 0xe049 */ exports.FaUnity = '';
    /** char code: 0xe07c */ exports.FaUnsplash = '';
    /** char code: 0xf405 */ exports.FaUntappd = '';
    /** char code: 0xf7e0 */ exports.FaUps = '';
    /** char code: 0xe641 */ exports.FaUpwork = '';
    /** char code: 0xf287 */ exports.FaUsb = '';
    /** char code: 0xf7e1 */ exports.FaUsps = '';
    /** char code: 0xf407 */ exports.FaUssunnah = '';
    /** char code: 0xf408 */ exports.FaVaadin = '';
    /** char code: 0xf237 */ exports.FaViacoin = '';
    /** char code: 0xf2a9 */ exports.FaViadeo = '';
    /** char code: 0xf409 */ exports.FaViber = '';
    /** char code: 0xf40a */ exports.FaVimeo = '';
    /** char code: 0xf27d */ exports.FaVimeoV = '';
    /** char code: 0xf1ca */ exports.FaVine = '';
    /** char code: 0xf189 */ exports.FaVk = '';
    /** char code: 0xf40b */ exports.FaVnv = '';
    /** char code: 0xe7dd */ exports.FaVsco = '';
    /** char code: 0xf41f */ exports.FaVuejs = '';
    /** char code: 0xe7de */ exports.FaW3c = '';
    /** char code: 0xe087 */ exports.FaWatchmanMonitoring = '';
    /** char code: 0xf83f */ exports.FaWaze = '';
    /** char code: 0xe682 */ exports.FaWebAwesome = '';
    /** char code: 0xe65c */ exports.FaWebflow = '';
    /** char code: 0xf5cc */ exports.FaWeebly = '';
    /** char code: 0xf18a */ exports.FaWeibo = '';
    /** char code: 0xf1d7 */ exports.FaWeixin = '';
    /** char code: 0xf232 */ exports.FaWhatsapp = '';
    /** char code: 0xf40d */ exports.FaWhmcs = '';
    /** char code: 0xf266 */ exports.FaWikipediaW = '';
    /** char code: 0xf17a */ exports.FaWindows = '';
    /** char code: 0xe2d0 */ exports.FaWirsindhandwerk = '';
    /** char code: 0xf5cf */ exports.FaWix = '';
    /** char code: 0xf730 */ exports.FaWizardsOfTheCoast = '';
    /** char code: 0xe088 */ exports.FaWodu = '';
    /** char code: 0xf514 */ exports.FaWolfPackBattalion = '';
    /** char code: 0xf19a */ exports.FaWordpress = '';
    /** char code: 0xf411 */ exports.FaWordpressSimple = '';
    /** char code: 0xf297 */ exports.FaWpbeginner = '';
    /** char code: 0xf2de */ exports.FaWpexplorer = '';
    /** char code: 0xf298 */ exports.FaWpforms = '';
    /** char code: 0xf3e4 */ exports.FaWpressr = '';
    /** char code: 0xe61b */ exports.FaXTwitter = '';
    /** char code: 0xf412 */ exports.FaXbox = '';
    /** char code: 0xf168 */ exports.FaXing = '';
    /** char code: 0xf23b */ exports.FaYCombinator = '';
    /** char code: 0xf19e */ exports.FaYahoo = '';
    /** char code: 0xf840 */ exports.FaYammer = '';
    /** char code: 0xf413 */ exports.FaYandex = '';
    /** char code: 0xf414 */ exports.FaYandexInternational = '';
    /** char code: 0xf7e3 */ exports.FaYarn = '';
    /** char code: 0xf1e9 */ exports.FaYelp = '';
    /** char code: 0xf2b1 */ exports.FaYoast = '';
    /** char code: 0xf167 */ exports.FaYoutube = '';
    /** char code: 0xf63f */ exports.FaZhihu = '';
});
define("modules/font-awesome-regular", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FaWindowRestore = exports.FaWindowMinimize = exports.FaWindowMaximize = exports.FaUser = exports.FaTruck = exports.FaTrashCan = exports.FaThumbsUp = exports.FaThumbsDown = exports.FaSun = exports.FaStarHalfStroke = exports.FaStarHalf = exports.FaStar = exports.FaSquarePlus = exports.FaSquareMinus = exports.FaSquareFull = exports.FaSquareCheck = exports.FaSquareCaretUp = exports.FaSquareCaretRight = exports.FaSquareCaretLeft = exports.FaSquareCaretDown = exports.FaSquare = exports.FaSnowflake = exports.FaShareFromSquare = exports.FaRegistered = exports.FaRectangleXmark = exports.FaRectangleList = exports.FaPenToSquare = exports.FaPaste = exports.FaPaperPlane = exports.FaObjectUngroup = exports.FaObjectGroup = exports.FaNoteSticky = exports.FaNewspaper = exports.FaMoon = exports.FaMoneyBill1 = exports.FaMessage = exports.FaMap = exports.FaLightbulb = exports.FaLifeRing = exports.FaLemon = exports.FaKeyboard = exports.FaImages = exports.FaImage = exports.FaIdCard = exports.FaIdBadge = exports.FaHouse = exports.FaHourglassHalf = exports.FaHourglass = exports.FaHospital = exports.FaHeart = exports.FaHeadphones = exports.FaHardDrive = exports.FaHandshake = exports.FaHandSpock = exports.FaHandScissors = exports.FaHandPointer = exports.FaHandPointUp = exports.FaHandPointRight = exports.FaHandPointLeft = exports.FaHandPointDown = exports.FaHandPeace = exports.FaHandLizard = exports.FaHandBackFist = exports.FaHand = exports.FaGem = exports.FaFutbol = exports.FaFontAwesome = exports.FaFolderOpen = exports.FaFolderClosed = exports.FaFolder = exports.FaFloppyDisk = exports.FaFlag = exports.FaFileZipper = exports.FaFileWord = exports.FaFileVideo = exports.FaFilePowerpoint = exports.FaFilePdf = exports.FaFileLines = exports.FaFileImage = exports.FaFileExcel = exports.FaFileCode = exports.FaFileAudio = exports.FaFile = exports.FaFaceTired = exports.FaFaceSurprise = exports.FaFaceSmileWink = exports.FaFaceSmileBeam = exports.FaFaceSmile = exports.FaFaceSadTear = exports.FaFaceSadCry = exports.FaFaceRollingEyes = exports.FaFaceMehBlank = exports.FaFaceMeh = exports.FaFaceLaughWink = exports.FaFaceLaughSquint = exports.FaFaceLaughBeam = exports.FaFaceLaugh = exports.FaFaceKissWinkHeart = exports.FaFaceKissBeam = exports.FaFaceKiss = exports.FaFaceGrinWink = exports.FaFaceGrinWide = exports.FaFaceGrinTongueWink = exports.FaFaceGrinTongueSquint = exports.FaFaceGrinTongue = exports.FaFaceGrinTears = exports.FaFaceGrinStars = exports.FaFaceGrinSquintTears = exports.FaFaceGrinSquint = exports.FaFaceGrinHearts = exports.FaFaceGrinBeamSweat = exports.FaFaceGrinBeam = exports.FaFaceGrin = exports.FaFaceGrimace = exports.FaFaceFrownOpen = exports.FaFaceFrown = exports.FaFaceFlushed = exports.FaFaceDizzy = exports.FaFaceAngry = exports.FaEyeSlash = exports.FaEye = exports.FaEnvelopeOpen = exports.FaEnvelope = exports.FaCreditCard = exports.FaCopyright = exports.FaCopy = exports.FaCompass = exports.FaComments = exports.FaCommentDots = exports.FaComment = exports.FaCloud = exports.FaClosedCaptioning = exports.FaClone = exports.FaClock = exports.FaClipboard = exports.FaCircleXmark = exports.FaCircleUser = exports.FaCircleUp = exports.FaCircleStop = exports.FaCircleRight = exports.FaCircleQuestion = exports.FaCirclePlay = exports.FaCirclePause = exports.FaCircleLeft = exports.FaCircleDown = exports.FaCircleDot = exports.FaCircleCheck = exports.FaCircle = exports.FaChessRook = exports.FaChessQueen = exports.FaChessPawn = exports.FaChessKnight = exports.FaChessKing = exports.FaChessBishop = exports.FaChartBar = exports.FaCamera = exports.FaCalendarXmark = exports.FaCalendarPlus = exports.FaCalendarMinus = exports.FaCalendarDays = exports.FaCalendarCheck = exports.FaCalendar = exports.FaBuilding = exports.FaBookmark = exports.FaBellSlash = exports.FaBell = exports.FaAlarmClock = exports.FaAddressCard = exports.FaAddressBook = void 0;
    /** char code: 0xf2b9 */ exports.FaAddressBook = '';
    /** char code: 0xf2bb */ exports.FaAddressCard = '';
    /** char code: 0xf34e */ exports.FaAlarmClock = '';
    /** char code: 0xf0f3 */ exports.FaBell = '';
    /** char code: 0xf1f6 */ exports.FaBellSlash = '';
    /** char code: 0xf02e */ exports.FaBookmark = '';
    /** char code: 0xf1ad */ exports.FaBuilding = '';
    /** char code: 0xf133 */ exports.FaCalendar = '';
    /** char code: 0xf274 */ exports.FaCalendarCheck = '';
    /** char code: 0xf073 */ exports.FaCalendarDays = '';
    /** char code: 0xf272 */ exports.FaCalendarMinus = '';
    /** char code: 0xf271 */ exports.FaCalendarPlus = '';
    /** char code: 0xf273 */ exports.FaCalendarXmark = '';
    /** char code: 0xf030 */ exports.FaCamera = '';
    /** char code: 0xf080 */ exports.FaChartBar = '';
    /** char code: 0xf43a */ exports.FaChessBishop = '';
    /** char code: 0xf43f */ exports.FaChessKing = '';
    /** char code: 0xf441 */ exports.FaChessKnight = '';
    /** char code: 0xf443 */ exports.FaChessPawn = '';
    /** char code: 0xf445 */ exports.FaChessQueen = '';
    /** char code: 0xf447 */ exports.FaChessRook = '';
    /** char code: 0xf111 */ exports.FaCircle = '';
    /** char code: 0xf058 */ exports.FaCircleCheck = '';
    /** char code: 0xf192 */ exports.FaCircleDot = '';
    /** char code: 0xf358 */ exports.FaCircleDown = '';
    /** char code: 0xf359 */ exports.FaCircleLeft = '';
    /** char code: 0xf28b */ exports.FaCirclePause = '';
    /** char code: 0xf144 */ exports.FaCirclePlay = '';
    /** char code: 0xf059 */ exports.FaCircleQuestion = '';
    /** char code: 0xf35a */ exports.FaCircleRight = '';
    /** char code: 0xf28d */ exports.FaCircleStop = '';
    /** char code: 0xf35b */ exports.FaCircleUp = '';
    /** char code: 0xf2bd */ exports.FaCircleUser = '';
    /** char code: 0xf057 */ exports.FaCircleXmark = '';
    /** char code: 0xf328 */ exports.FaClipboard = '';
    /** char code: 0xf017 */ exports.FaClock = '';
    /** char code: 0xf24d */ exports.FaClone = '';
    /** char code: 0xf20a */ exports.FaClosedCaptioning = '';
    /** char code: 0xf0c2 */ exports.FaCloud = '';
    /** char code: 0xf075 */ exports.FaComment = '';
    /** char code: 0xf4ad */ exports.FaCommentDots = '';
    /** char code: 0xf086 */ exports.FaComments = '';
    /** char code: 0xf14e */ exports.FaCompass = '';
    /** char code: 0xf0c5 */ exports.FaCopy = '';
    /** char code: 0xf1f9 */ exports.FaCopyright = '';
    /** char code: 0xf09d */ exports.FaCreditCard = '';
    /** char code: 0xf0e0 */ exports.FaEnvelope = '';
    /** char code: 0xf2b6 */ exports.FaEnvelopeOpen = '';
    /** char code: 0xf06e */ exports.FaEye = '';
    /** char code: 0xf070 */ exports.FaEyeSlash = '';
    /** char code: 0xf556 */ exports.FaFaceAngry = '';
    /** char code: 0xf567 */ exports.FaFaceDizzy = '';
    /** char code: 0xf579 */ exports.FaFaceFlushed = '';
    /** char code: 0xf119 */ exports.FaFaceFrown = '';
    /** char code: 0xf57a */ exports.FaFaceFrownOpen = '';
    /** char code: 0xf57f */ exports.FaFaceGrimace = '';
    /** char code: 0xf580 */ exports.FaFaceGrin = '';
    /** char code: 0xf582 */ exports.FaFaceGrinBeam = '';
    /** char code: 0xf583 */ exports.FaFaceGrinBeamSweat = '';
    /** char code: 0xf584 */ exports.FaFaceGrinHearts = '';
    /** char code: 0xf585 */ exports.FaFaceGrinSquint = '';
    /** char code: 0xf586 */ exports.FaFaceGrinSquintTears = '';
    /** char code: 0xf587 */ exports.FaFaceGrinStars = '';
    /** char code: 0xf588 */ exports.FaFaceGrinTears = '';
    /** char code: 0xf589 */ exports.FaFaceGrinTongue = '';
    /** char code: 0xf58a */ exports.FaFaceGrinTongueSquint = '';
    /** char code: 0xf58b */ exports.FaFaceGrinTongueWink = '';
    /** char code: 0xf581 */ exports.FaFaceGrinWide = '';
    /** char code: 0xf58c */ exports.FaFaceGrinWink = '';
    /** char code: 0xf596 */ exports.FaFaceKiss = '';
    /** char code: 0xf597 */ exports.FaFaceKissBeam = '';
    /** char code: 0xf598 */ exports.FaFaceKissWinkHeart = '';
    /** char code: 0xf599 */ exports.FaFaceLaugh = '';
    /** char code: 0xf59a */ exports.FaFaceLaughBeam = '';
    /** char code: 0xf59b */ exports.FaFaceLaughSquint = '';
    /** char code: 0xf59c */ exports.FaFaceLaughWink = '';
    /** char code: 0xf11a */ exports.FaFaceMeh = '';
    /** char code: 0xf5a4 */ exports.FaFaceMehBlank = '';
    /** char code: 0xf5a5 */ exports.FaFaceRollingEyes = '';
    /** char code: 0xf5b3 */ exports.FaFaceSadCry = '';
    /** char code: 0xf5b4 */ exports.FaFaceSadTear = '';
    /** char code: 0xf118 */ exports.FaFaceSmile = '';
    /** char code: 0xf5b8 */ exports.FaFaceSmileBeam = '';
    /** char code: 0xf4da */ exports.FaFaceSmileWink = '';
    /** char code: 0xf5c2 */ exports.FaFaceSurprise = '';
    /** char code: 0xf5c8 */ exports.FaFaceTired = '';
    /** char code: 0xf15b */ exports.FaFile = '';
    /** char code: 0xf1c7 */ exports.FaFileAudio = '';
    /** char code: 0xf1c9 */ exports.FaFileCode = '';
    /** char code: 0xf1c3 */ exports.FaFileExcel = '';
    /** char code: 0xf1c5 */ exports.FaFileImage = '';
    /** char code: 0xf15c */ exports.FaFileLines = '';
    /** char code: 0xf1c1 */ exports.FaFilePdf = '';
    /** char code: 0xf1c4 */ exports.FaFilePowerpoint = '';
    /** char code: 0xf1c8 */ exports.FaFileVideo = '';
    /** char code: 0xf1c2 */ exports.FaFileWord = '';
    /** char code: 0xf1c6 */ exports.FaFileZipper = '';
    /** char code: 0xf024 */ exports.FaFlag = '';
    /** char code: 0xf0c7 */ exports.FaFloppyDisk = '';
    /** char code: 0xf07b */ exports.FaFolder = '';
    /** char code: 0xe185 */ exports.FaFolderClosed = '';
    /** char code: 0xf07c */ exports.FaFolderOpen = '';
    /** char code: 0xf2b4 */ exports.FaFontAwesome = '';
    /** char code: 0xf1e3 */ exports.FaFutbol = '';
    /** char code: 0xf3a5 */ exports.FaGem = '';
    /** char code: 0xf256 */ exports.FaHand = '';
    /** char code: 0xf255 */ exports.FaHandBackFist = '';
    /** char code: 0xf258 */ exports.FaHandLizard = '';
    /** char code: 0xf25b */ exports.FaHandPeace = '';
    /** char code: 0xf0a7 */ exports.FaHandPointDown = '';
    /** char code: 0xf0a5 */ exports.FaHandPointLeft = '';
    /** char code: 0xf0a4 */ exports.FaHandPointRight = '';
    /** char code: 0xf0a6 */ exports.FaHandPointUp = '';
    /** char code: 0xf25a */ exports.FaHandPointer = '';
    /** char code: 0xf257 */ exports.FaHandScissors = '';
    /** char code: 0xf259 */ exports.FaHandSpock = '';
    /** char code: 0xf2b5 */ exports.FaHandshake = '';
    /** char code: 0xf0a0 */ exports.FaHardDrive = '';
    /** char code: 0xf025 */ exports.FaHeadphones = '';
    /** char code: 0xf004 */ exports.FaHeart = '';
    /** char code: 0xf0f8 */ exports.FaHospital = '';
    /** char code: 0xf254 */ exports.FaHourglass = '';
    /** char code: 0xf252 */ exports.FaHourglassHalf = '';
    /** char code: 0xf015 */ exports.FaHouse = '';
    /** char code: 0xf2c1 */ exports.FaIdBadge = '';
    /** char code: 0xf2c2 */ exports.FaIdCard = '';
    /** char code: 0xf03e */ exports.FaImage = '';
    /** char code: 0xf302 */ exports.FaImages = '';
    /** char code: 0xf11c */ exports.FaKeyboard = '';
    /** char code: 0xf094 */ exports.FaLemon = '';
    /** char code: 0xf1cd */ exports.FaLifeRing = '';
    /** char code: 0xf0eb */ exports.FaLightbulb = '';
    /** char code: 0xf279 */ exports.FaMap = '';
    /** char code: 0xf27a */ exports.FaMessage = '';
    /** char code: 0xf3d1 */ exports.FaMoneyBill1 = '';
    /** char code: 0xf186 */ exports.FaMoon = '';
    /** char code: 0xf1ea */ exports.FaNewspaper = '';
    /** char code: 0xf249 */ exports.FaNoteSticky = '';
    /** char code: 0xf247 */ exports.FaObjectGroup = '';
    /** char code: 0xf248 */ exports.FaObjectUngroup = '';
    /** char code: 0xf1d8 */ exports.FaPaperPlane = '';
    /** char code: 0xf0ea */ exports.FaPaste = '';
    /** char code: 0xf044 */ exports.FaPenToSquare = '';
    /** char code: 0xf022 */ exports.FaRectangleList = '';
    /** char code: 0xf410 */ exports.FaRectangleXmark = '';
    /** char code: 0xf25d */ exports.FaRegistered = '';
    /** char code: 0xf14d */ exports.FaShareFromSquare = '';
    /** char code: 0xf2dc */ exports.FaSnowflake = '';
    /** char code: 0xf0c8 */ exports.FaSquare = '';
    /** char code: 0xf150 */ exports.FaSquareCaretDown = '';
    /** char code: 0xf191 */ exports.FaSquareCaretLeft = '';
    /** char code: 0xf152 */ exports.FaSquareCaretRight = '';
    /** char code: 0xf151 */ exports.FaSquareCaretUp = '';
    /** char code: 0xf14a */ exports.FaSquareCheck = '';
    /** char code: 0xf45c */ exports.FaSquareFull = '';
    /** char code: 0xf146 */ exports.FaSquareMinus = '';
    /** char code: 0xf0fe */ exports.FaSquarePlus = '';
    /** char code: 0xf005 */ exports.FaStar = '';
    /** char code: 0xf089 */ exports.FaStarHalf = '';
    /** char code: 0xf5c0 */ exports.FaStarHalfStroke = '';
    /** char code: 0xf185 */ exports.FaSun = '';
    /** char code: 0xf165 */ exports.FaThumbsDown = '';
    /** char code: 0xf164 */ exports.FaThumbsUp = '';
    /** char code: 0xf2ed */ exports.FaTrashCan = '';
    /** char code: 0xf0d1 */ exports.FaTruck = '';
    /** char code: 0xf007 */ exports.FaUser = '';
    /** char code: 0xf2d0 */ exports.FaWindowMaximize = '';
    /** char code: 0xf2d1 */ exports.FaWindowMinimize = '';
    /** char code: 0xf2d2 */ exports.FaWindowRestore = '';
});
define("modules/base-ui/root", ["require", "exports", "modules/mini-react/index", "render", "modules/components/vulkan/index", "vulkan", "modules/math-ext/index", "modules/components/index", "math"], function (require, exports, React, Render, Vulkan, vulkan_8, math_ext_12, components_5, math_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Root = void 0;
    exports.useBaseUI = useBaseUI;
    const Root = props => {
        const { size } = (0, components_5.useCurrentWindow)();
        const vertexFormat = React.useMemo(() => {
            const fmt = new Render.DataFormat();
            fmt.addAttr(Render.DataType.Vec2f, 0, 1);
            return fmt;
        });
        const uniformFormat = React.useMemo(() => {
            const fmt = new Render.DataFormat();
            fmt.addAttr(Render.DataType.Mat4f, 0, 1);
            return fmt;
        });
        React.useEffect(() => {
            return () => {
                vertexFormat.destroy();
                uniformFormat.destroy();
            };
        }, []);
        return (React.createElement(Vulkan.GraphicsPipeline, { vertexFormat: vertexFormat, dynamicStateFields: [vulkan_8.VkDynamicState.VK_DYNAMIC_STATE_VIEWPORT, vulkan_8.VkDynamicState.VK_DYNAMIC_STATE_SCISSOR], uniformBlocks: [
                {
                    bindIndex: 0,
                    format: uniformFormat,
                    stages: vulkan_8.VkShaderStageFlags.VK_SHADER_STAGE_VERTEX_BIT
                }
            ], vertexShaderSource: '\n                #version 450\n\n                layout(std140, binding = 0) uniform Data {\n                    mat4 mvp;\n                };\n\n                layout(location = 0) in vec2 position;\n\n                void main() {\n                    gl_Position = mvp * vec4(position * 0.5, 0.0, 1.0);\n                }\n            ', fragmentShaderSource: '\n                #version 450\n\n                layout(location = 0) out vec4 outColor;\n\n                void main() {\n                    outColor = vec4(1.0, 0.0, 0.0, 1.0);\n                }\n            ' },
            React.createElement(Vulkan.RenderNode, { beforeRender: frame => {
                    const cb = frame.getCommandBuffer();
                    frame.setClearColorF(0, new math_3.vec4f(0.05, 0.05, 0.05, 1));
                    frame.setClearDepthStencil(1, 1.0, 0);
                    cb.setViewport(0, size.height, size.width, -size.height, 0, 1);
                } }, props.children)));
    };
    exports.Root = Root;
    function useBaseUI() {
        const { logicalDevice } = Vulkan.useVulkan();
        const { pipeline, allocateUniformObject, allocateDescriptorSet } = Vulkan.useGraphicsPipeline();
        const { size } = (0, components_5.useCurrentWindow)();
        const ctx = React.useMemo(() => {
            const mvpMatrix = math_ext_12.mat4.identity();
            const uniforms = allocateUniformObject(0);
            const uniformData = new ArrayBuffer(
            // 16 floats for the MVP matrix
            16 * 4);
            const uniformDataView = new DataView(uniformData);
            const descriptorSet = allocateDescriptorSet();
            descriptorSet.addUniformObject(uniforms, 0);
            descriptorSet.update();
            mvpMatrix.serialize(uniformDataView, 0);
            return {
                mvpMatrix,
                uniforms,
                uniformData,
                uniformDataView,
                descriptorSet,
                scissorRegion: {
                    x: 0,
                    y: 0,
                    width: size.width,
                    height: size.height
                }
            };
        });
        React.useEffect(() => {
            return () => {
                logicalDevice.getGraphicsQueue().waitForIdle();
                ctx.descriptorSet.free();
                ctx.uniforms.free();
            };
        }, []);
        const updateMVP = (mvp) => {
            ctx.mvpMatrix = mvp;
            mvp.serialize(ctx.uniformDataView, 0);
        };
        const updateUniforms = (cb) => {
            ctx.uniforms.write(ctx.uniformData);
            ctx.uniforms.getBuffer().submitUpdates(cb);
        };
        const beforeRender = (frame) => {
            const cb = frame.getCommandBuffer();
            updateUniforms(cb);
        };
        const initDraw = (cb) => {
            cb.bindPipeline(pipeline, vulkan_8.VkPipelineBindPoint.VK_PIPELINE_BIND_POINT_GRAPHICS);
            cb.setScissor(ctx.scissorRegion.x, ctx.scissorRegion.y, ctx.scissorRegion.width, ctx.scissorRegion.height);
            cb.bindDescriptorSet(ctx.descriptorSet, vulkan_8.VkPipelineBindPoint.VK_PIPELINE_BIND_POINT_GRAPHICS);
        };
        return {
            updateMVP,
            updateUniforms,
            initDraw,
            beforeRender
        };
    }
});
define("modules/base-ui/index", ["require", "exports", "modules/base-ui/root"], function (require, exports, root_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(root_5, exports);
});
define("modules/base-ui/types", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("modules/hooks/use-deep-effect", ["require", "exports", "modules/mini-react/index", "modules/is-changed"], function (require, exports, React, is_changed_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useDeepEffect = useDeepEffect;
    /**
     * A hook that runs an effect when the dependencies change, checking recursively for
     * differences. Objects/arrays are not compared by reference, but recursively by their
     * contents.
     *
     * @param effect - The effect to run.
     * @param deps - The dependencies to watch.
     */
    function useDeepEffect(effect, deps) {
        var _a;
        const isMounted = React.useRef(false);
        const prevDeps = React.useRef(deps);
        const cleanup = React.useRef(undefined);
        if ((0, is_changed_4.isChanged)(prevDeps.current, deps) || !isMounted.current) {
            isMounted.current = true;
            if (cleanup.current) {
                try {
                    cleanup.current();
                }
                catch (error) {
                    console.error('Error in useDeepEffect cleanup function:', error);
                }
            }
            try {
                cleanup.current = (_a = effect()) !== null && _a !== void 0 ? _a : undefined;
            }
            catch (error) {
                console.error('Error in useDeepEffect effect function:', error);
            }
        }
        prevDeps.current = deps;
    }
});
define("modules/hooks/use-deep-memo", ["require", "exports", "modules/mini-react/index", "modules/is-changed"], function (require, exports, React, is_changed_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useDeepMemo = useDeepMemo;
    /**
     * A hook that memoizes a value based on the dependencies, checking recursively for
     * differences. Objects/arrays are not compared by reference, but recursively by their
     * contents.
     *
     * @param callback - The callback to memoize the return value of.
     * @param deps - The dependencies to watch.
     */
    function useDeepMemo(callback, deps) {
        const isMounted = React.useRef(false);
        const prevDeps = React.useRef(deps);
        const value = React.useRef(null);
        if ((0, is_changed_5.isChanged)(prevDeps.current, deps) || !isMounted.current) {
            isMounted.current = true;
            try {
                value.current = {
                    value: callback(value.current)
                };
            }
            catch (error) {
                console.error('Error in useDeepMemo callback:', error);
            }
        }
        prevDeps.current = deps;
        return value.current.value;
    }
});
define("modules/hooks/index", ["require", "exports", "modules/hooks/use-deep-effect", "modules/hooks/use-deep-memo"], function (require, exports, use_deep_effect_1, use_deep_memo_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(use_deep_effect_1, exports);
    __exportStar(use_deep_memo_1, exports);
});
/*
import * as React from 'mini-react';
import { useDeepMemo } from 'hooks';
import { TreeNode } from 'mini-react/vdom';
import { AnyElementProps, ElementProps, ParsedStyleProps, StyleProps, UIElementType } from '../types';
import { defaultStyle, elementTypeToName, mergeStyleProps } from '../utils';
import { StyleParser } from '../utils/parser';

type ElementContext = {
    props: AnyElementProps;
    style: StyleProps;
    hoverStyle: StyleProps;
    focusStyle: StyleProps;
    parsedStyle: ParsedStyleProps;
    parsedHoverStyle: ParsedStyleProps;
    parsedFocusStyle: ParsedStyleProps;
};

const ElementContext = React.createContext<ElementContext>();
ElementContext.Provider.displayName = 'ElementProvider';

export function useParentElement() {
    return React.useContext(ElementContext);
}

export function useElement<Type extends UIElementType>(props: ElementProps<Type>) {
    const parent = useParentElement();

    const parentStyle = React.useMemo(() => (parent ? parent.style : defaultStyle()), [parent]);
    const parentHoverStyle = React.useMemo(() => (parent ? parent.hoverStyle : defaultStyle()), [parent]);
    const parentFocusStyle = React.useMemo(() => (parent ? parent.focusStyle : defaultStyle()), [parent]);

    const style = props.style ? mergeStyleProps(parentStyle, props.style) : parentStyle;
    const hoverStyle = props.hoverStyle ? mergeStyleProps(parentHoverStyle, props.hoverStyle) : parentHoverStyle;
    const focusStyle = props.focusStyle ? mergeStyleProps(parentFocusStyle, props.focusStyle) : parentFocusStyle;

    const parsedStyle = useDeepMemo(() => StyleParser.parseStyleProps(style), [style]);
    const parsedHoverStyle = useDeepMemo(() => StyleParser.parseStyleProps(hoverStyle), [hoverStyle]);
    const parsedFocusStyle = useDeepMemo(() => StyleParser.parseStyleProps(focusStyle), [focusStyle]);

    const self: ElementContext = {
        props,
        style,
        hoverStyle,
        focusStyle,
        parsedStyle,
        parsedHoverStyle,
        parsedFocusStyle
    };

    return self;
}

export function createElementComponent<Type extends UIElementType>(type: Type) {
    const Component: React.FC<Omit<ElementProps<Type>, 'type'>> = props => {
        const ctx = useElement({ type, ...props });

        const currentNode = TreeNode.current;
        currentNode!.provideContext(ElementContext.id, ctx);

        React.useEffect(() => {
            for (const node of ElementContext.listeningNodes) {
                node.root.enqueueForRender(node);
            }
        }, [ctx]);

        return props.children;
    };

    Component.displayName = elementTypeToName(type);

    return Component;
}
*/
// export * from './element';
/*
import { useCurrentWindow, Window, Vulkan } from 'components';
import PluginManager from 'plugin-manager';
import { vec3f, vec4f } from 'math';
import * as React from 'mini-react';
import * as Render from 'render';
import * as BaseUI from 'base-ui';
import { IPlugin } from 'plugin';
import {
    VkColorSpaceKHR,
    VkCompositeAlphaFlagsKHR,
    VkFormat,
    VkImageUsageFlags,
    VkPipelineBindPoint,
    VkPresentModeKHR
} from 'vulkan';
import { useGraphicsPipeline, useRender } from 'components/vulkan';

type GridProps = {
    width: number;
    length: number;
};

const Grid: React.FC<GridProps> = props => {
    const draw = Vulkan.useDebugDraw();
    const { window } = useCurrentWindow();
    const [widthAdd, setWidthAdd] = React.useState(0);
    const [lengthAdd, setLengthAdd] = React.useState(0);

    React.useEffect(() => {
        if (!window) return;

        const l = window.onKeyDown(key => {
            switch (key) {
                case KeyboardKey.Up: {
                    setLengthAdd(lengthAdd + 1);
                    break;
                }
                case KeyboardKey.Down: {
                    setLengthAdd(lengthAdd - 1);
                    break;
                }
                case KeyboardKey.Left: {
                    setWidthAdd(widthAdd - 1);
                    break;
                }
                case KeyboardKey.Right: {
                    setWidthAdd(widthAdd + 1);
                }
            }
        });

        return () => {
            window.offKeyDown(l);
        };
    }, [window, widthAdd, lengthAdd]);

    if (!draw) return null;

    const { width, length } = props;

    return (
        <Vulkan.RenderNode
            execute={() => {
                const w = width + widthAdd;
                const l = length + lengthAdd;
                draw.originGrid(w, l);
                draw.box(new vec3f(-w / 2, -0.5, -l / 2), new vec3f(w / 2, 0.5, l / 2), new vec4f(1, 1, 0, 1));
            }}
        />
    );
};

const Triangle: React.FC<{ t: number }> = props => {
    const { initDraw, beforeRender } = BaseUI.useBaseUI();
    const { size } = useCurrentWindow();
    const { requestAdditionalFrame } = useRender();
    const { pipeline, allocateVertices } = useGraphicsPipeline();
    const vertices = React.useMemo<Render.Vertices>(
        prev => {
            if (prev && prev.value) {
                console.log('freeing vertices');
                prev.value.free();
            }

            console.log('allocating vertices');
            return allocateVertices(3);
        },
        [pipeline]
    );

    const t = React.useRef(props.t);

    if (!vertices || size.width === 0 || size.height === 0) return null;

    return (
        <Vulkan.RenderNode
            beforeRender={frame => {
                beforeRender(frame);

                t.current += 0.01;
                if (vertices.beginUpdate()) {
                    const xoff = Math.sin(t.current);
                    const yoff = Math.cos(t.current);
                    const data = new Float32Array([
                        // vertex 0
                        0.0 + xoff,
                        -0.5 + yoff,

                        // vertex 1
                        -0.5 + xoff,
                        0.5 + yoff,

                        // vertex 2
                        0.5 + xoff,
                        0.5 + yoff
                    ]);
                    vertices.write(data.buffer, 0, 3);
                    vertices.endUpdate();
                } else {
                    console.error('Failed to update vertices');
                }
            }}
            execute={frame => {
                const cb = frame.getCommandBuffer();
                initDraw(cb);
                cb.bindVertexBuffer(vertices.getBuffer(), vertices.getByteOffset());
                cb.drawAll(vertices);
                requestAdditionalFrame();
            }}
        />
    );
};

class TestPlugin extends IPlugin {
    constructor() {
        super('TestPlugin');
    }

    onInitialize() {
        const root = React.createRoot();
        root.render(
            <Window open={true} title='Test Window'>
                <Vulkan.Root enableValidation needsGraphics extensions={['VK_KHR_swapchain']}>
                    <Vulkan.RenderPass
                        imageFormat={VkFormat.VK_FORMAT_B8G8R8A8_SRGB}
                        imageColorSpace={VkColorSpaceKHR.VK_COLOR_SPACE_SRGB_NONLINEAR_KHR}
                        presentMode={VkPresentModeKHR.VK_PRESENT_MODE_FIFO_KHR}
                        imageCount={3}
                        usage={VkImageUsageFlags.VK_IMAGE_USAGE_COLOR_ATTACHMENT_BIT}
                        compositeAlpha={VkCompositeAlphaFlagsKHR.VK_COMPOSITE_ALPHA_OPAQUE_BIT_KHR}
                    >
                        <Vulkan.RenderGraph>
                            <BaseUI.Root>
                                {Array.from({ length: 10 }).map((_, i) => (
                                    <Triangle t={i} key={i} />
                                ))}
                            </BaseUI.Root>
                        </Vulkan.RenderGraph>
                    </Vulkan.RenderPass>
                </Vulkan.Root>
            </Window>
        );
    }
}

PluginManager.addPlugin(new TestPlugin());
*/
//# sourceMappingURL=build.js.map