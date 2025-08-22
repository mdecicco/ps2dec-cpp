export type Key = string | number | bigint | null | undefined;

export interface IntrinsicComponentProps {
    key?: Key;
    children?: ReactNode[];
}

export type ComponentProps<P = {}> = P & IntrinsicComponentProps;

export interface ReactElement<P = {}> {
    type: ComponentType<P>;
    props: P;
    key: Key;
}

export type ReactNode = ReactElement<any> | string | number | bigint | Iterable<ReactNode> | boolean | null | undefined;
export interface FunctionComponent<P = {}> {
    (props: P & IntrinsicComponentProps): ReactNode;
    displayName?: string;
}
export type FC<P = {}> = FunctionComponent<P>;
export type ComponentType<P = {}> = FunctionComponent<P>;

export function isReactElement(element: ReactNode): element is ReactElement {
    if (!element) return false;
    return typeof element === 'object' && 'type' in element && 'props' in element;
}

export function isNodeIterable(node: ReactNode): node is Iterable<ReactNode> {
    if (node === null || node === undefined) return false;
    if (typeof node !== 'object') return false;
    if ('type' in node) return false;
    if (typeof node[Symbol.iterator] !== 'function') return false;

    return true;
}

export function isSpecificElement<PropsType>(
    type: ComponentType,
    compareTo: ComponentType<PropsType>,
    props: any
): props is PropsType {
    return type === compareTo;
}

export type Ref<T> = {
    current: T;
};
