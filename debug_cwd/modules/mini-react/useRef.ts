import { TreeNode } from './vdom';
import { HookType } from './hook';
import { RefObject } from './types';

function makeRefData<T>(value: T): RefObject<T> {
    return {
        current: value
    };
}

export function useRef<T>(initialValue: T): RefObject<T> {
    const currentNode = TreeNode.current;
    if (!currentNode) throw new Error('useState can only be called inside a component');

    const hookState = currentNode.executeHook(HookType.Ref, makeRefData, initialValue);

    return hookState.value;
}
