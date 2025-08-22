import { TreeNode } from './vdom';
import { HookType } from './hook';

type EffectHookData = {
    cleanupCallback: (() => void) | null;
    dependencies: any[];
    justMounted: boolean;
};

function createEffectHookData(dependencies: any[]): EffectHookData {
    return {
        cleanupCallback: null,
        dependencies,
        justMounted: true
    };
}

function checkEffectDependency(prev: any[], current: any[]) {
    if (prev.length !== current.length) return true;

    for (let i = 0; i < prev.length; i++) {
        if (prev[i] !== current[i]) return true;
    }

    return false;
}

export function useEffect(callback: () => void | (() => void), dependencies: any[]) {
    const currentNode = TreeNode.current;
    if (!currentNode) throw new Error('useEffect can only be called inside a component');

    const hookState = currentNode.executeHook(HookType.Effect, createEffectHookData, dependencies);
    if (hookState.value.dependencies.length !== dependencies.length) {
        throw new Error('Number of useEffect dependencies must not change between renders');
    }

    if (hookState.value.justMounted || checkEffectDependency(hookState.value.dependencies, dependencies)) {
        hookState.value.justMounted = false;
        hookState.value.dependencies = dependencies;

        if (hookState.value.cleanupCallback) {
            try {
                hookState.value.cleanupCallback();
            } catch (error) {
                console.error('Error in useEffect cleanup callback');
                console.error(error);
            }
        }

        try {
            const cleanup = callback();
            if (cleanup) hookState.value.cleanupCallback = cleanup;
            else hookState.value.cleanupCallback = null;
            hookState.onUnmount = () => {
                if (hookState.value.cleanupCallback) {
                    try {
                        hookState.value.cleanupCallback();
                    } catch (error) {
                        console.error('Error in useEffect cleanup callback');
                        console.error(error);
                    }
                }
            };
        } catch (error) {
            console.error('Error in useEffect callback');
            console.error(error);
        }
    }
}
