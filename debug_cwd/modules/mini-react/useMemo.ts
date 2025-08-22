import { TreeNode } from './vdom';
import { HookType } from './hook';

type MemoHookData<T> = {
    value: T;
    dependencies: any[];
};

type MemoCallbackParameter<T> = {
    value: T;
};

function createMemoHookData<T>(
    callback: (param: MemoCallbackParameter<T> | null) => T,
    dependencies: any[]
): MemoHookData<T> {
    try {
        return {
            value: callback(null),
            dependencies
        };
    } catch (error) {
        console.error('Error in useMemo callback', String(error));
        throw error;
    }
}

function checkMemoDependency(prev: any[], current: any[]) {
    if (prev.length !== current.length) return true;

    for (let i = 0; i < prev.length; i++) {
        if (prev[i] !== current[i]) return true;
    }

    return false;
}

export function useMemo<T>(callback: (prev: MemoCallbackParameter<T> | null) => T, dependencies: any[] = []): T {
    const currentNode = TreeNode.current;
    if (!currentNode) throw new Error('useMemo can only be called inside a component');

    const hookState = currentNode.executeHook(HookType.Memo, createMemoHookData, callback, dependencies);
    if (hookState.value.dependencies.length !== dependencies.length) {
        throw new Error('Number of useEffect dependencies must not change between renders');
    }

    if (checkMemoDependency(hookState.value.dependencies, dependencies)) {
        hookState.value.dependencies = dependencies;

        try {
            hookState.value.value = callback({ value: hookState.value.value });
        } catch (error) {
            console.error('Error in useMemo callback');
            console.error(error);
        }
    }

    return hookState.value.value;
}
