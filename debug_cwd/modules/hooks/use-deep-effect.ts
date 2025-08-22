import * as React from 'mini-react';
import { isChanged } from 'is-changed';

/**
 * A hook that runs an effect when the dependencies change, checking recursively for
 * differences. Objects/arrays are not compared by reference, but recursively by their
 * contents.
 *
 * @param effect - The effect to run.
 * @param deps - The dependencies to watch.
 */
export function useDeepEffect(effect: () => (() => void) | void, deps: any[]) {
    const isMounted = React.useRef(false);
    const prevDeps = React.useRef<any[]>(deps);
    const cleanup = React.useRef<(() => void) | undefined>(undefined);

    if (isChanged(prevDeps.current, deps) || !isMounted.current) {
        isMounted.current = true;

        if (cleanup.current) {
            try {
                cleanup.current();
            } catch (error) {
                console.error('Error in useDeepEffect cleanup function:', error);
            }
        }

        try {
            cleanup.current = effect() ?? undefined;
        } catch (error) {
            console.error('Error in useDeepEffect effect function:', error);
        }
    }

    prevDeps.current = deps;
}
