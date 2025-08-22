

export type Key = string | number | bigint | null | undefined;
export interface IntrinsicComponentProps {
	key?: Key;
}
export type ComponentProps<P = {}> = P & IntrinsicComponentProps;
export interface ReactElement<P = {}> {
	type: ComponentType<P>;
	props: P;
	key: Key;
}
export type ReactNode = ReactElement | string | number | bigint | Iterable<ReactNode> | boolean | null | undefined;
export interface FunctionComponent<P = {}> {
	(props: P & IntrinsicComponentProps): ReactNode;
	displayName?: string;
}
export type FC<P = {}> = FunctionComponent<P>;
export type ComponentType<P = {}> = FunctionComponent<P>;
export declare function isReactElement(element: ReactNode): element is ReactElement;
export declare function createRoot(): {
	render: (element: ReactNode) => void;
};
export declare function createElement<P extends {}>(type: ComponentType<P>, props?: (IntrinsicComponentProps & P) | null, ...children: "children" extends keyof P ? P["children"][] : ReactNode[]): ReactNode;
export declare function useState<T>(initialValue: T): [
	T,
	(value: T) => void
];
export declare function useEffect(callback: () => void | (() => void), dependencies: any[]): void;
export declare const Fragment: FunctionComponent<{
	children?: ReactNode;
}>;

export {};
