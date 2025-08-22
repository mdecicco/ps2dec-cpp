/**
 * Recursively determines if two values of the same type are different in any way
 *
 * @template T Type of value to check
 * @param a First value
 * @param b Second value
 * @returns `true` if `a` and `b` are different in any way, otherwise `false`
 */
export function isChanged<T>(a: T, b: T): boolean {
    if (a === undefined && b === undefined) return false;
    if (a === null && b === null) return false;
    if ((a === undefined) !== (b === undefined)) return true;
    if ((a === null) !== (b === null)) return true;
    if (a === null || b === null) return false;

    if (Array.isArray(a)) {
        if (!Array.isArray(b) || b.length !== a.length) return true;
        return a.some((ele, idx) => isChanged(ele, b[idx]));
    }

    if (typeof a === 'object') {
        if (typeof b !== 'object') return true;
        if (Object.keys(a).some(k => isChanged(a[k as keyof T], b[k as keyof T]))) return true;
        if (Object.keys(b).some(k => isChanged(a[k as keyof T], b[k as keyof T]))) return true;
        return false;
    }

    return a !== b;
}
