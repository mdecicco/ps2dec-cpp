import { ComponentProps, isNodeIterable, ReactNode } from './types';
import { isChanged } from 'is-changed';

/**
 * Compares two props objects for equality.
 *
 * @param a - The first props object
 * @param b - The second props object
 *
 * @returns True if the props objects are equal, false otherwise.
 */
export function compareProps(a: ComponentProps<any>, b: ComponentProps<any>): boolean {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);

    if (aKeys.length !== bKeys.length) return false;

    for (const key of aKeys) {
        if (key === 'children') continue;
        if (!(key in b)) return false;
        if (a[key] !== b[key]) return false;
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
export function comparePropsDeep(a: ComponentProps<any>, b: ComponentProps<any>): boolean {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);

    if (aKeys.length !== bKeys.length) return false;

    for (const key of aKeys) {
        if (key === 'children') continue;
        if (isChanged(a[key], b[key])) return false;
    }

    return true;
}

export function flattenChildren(children: ReactNode): Exclude<ReactNode, null | undefined | Iterable<ReactNode>>[] {
    if (children === null || children === undefined) return [];

    if (isNodeIterable(children)) {
        const result: Exclude<ReactNode, null | undefined | Iterable<ReactNode>>[] = [];

        for (const child of children) {
            result.push(...flattenChildren(child));
        }

        return result;
    }

    return [children];
}
