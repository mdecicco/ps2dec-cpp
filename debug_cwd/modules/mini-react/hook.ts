export enum HookType {
    State = 0,
    Effect = 1,
    Ref = 2,
    Memo = 3
}

export type HookState<T> = {
    type: HookType;
    value: T;
    onUnmount?: () => void;
    onPostRender?: () => void;
};

export function createHookState<T>(type: HookType, value: T, onUnmount?: () => void): HookState<T> {
    return {
        type,
        value,
        onUnmount
    };
}
