import { TreeNode } from './vdom';
import { HookType } from './hook';

type StateData<T> = {
    current: T;
    next: {
        value: T;
    } | null;
};

function makeStateData<T>(value: T): StateData<T> {
    return {
        current: value,
        next: null
    };
}

export function useState<T>(initialValue: T): [T, (value: T) => void] {
    const currentNode = TreeNode.current;
    if (!currentNode) throw new Error('useState can only be called inside a component');

    const hookState = currentNode.executeHook(HookType.State, makeStateData, initialValue);

    if (hookState.value.next) {
        hookState.value.current = hookState.value.next.value;
        hookState.value.next = null;
    }

    const setter = (value: T) => {
        if (hookState.value.current === value) return;

        hookState.value.next = {
            value
        };

        currentNode.root.enqueueForRender(currentNode);
    };

    return [hookState.value.current, setter];
}
