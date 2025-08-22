import * as React from 'mini-react';
import { isChanged } from 'is-changed';

type MemoCallbackParameter<T> = {
    value: T;
};

/**
 * A hook that memoizes a value based on the dependencies, checking recursively for
 * differences. Objects/arrays are not compared by reference, but recursively by their
 * contents.
 *
 * @param callback - The callback to memoize the return value of.
 * @param deps - The dependencies to watch.
 */
export function useDeepMemo<T>(callback: (param: MemoCallbackParameter<T> | null) => T, deps: any[]): T {
    const isMounted = React.useRef(false);
    const prevDeps = React.useRef<any[]>(deps);
    const value = React.useRef<MemoCallbackParameter<T> | null>(null);

    if (isChanged(prevDeps.current, deps) || !isMounted.current) {
        isMounted.current = true;

        try {
            value.current = {
                value: callback(value.current)
            };
        } catch (error) {
            console.error('Error in useDeepMemo callback:', error);
        }
    }

    prevDeps.current = deps;
    return value.current!.value;
}
