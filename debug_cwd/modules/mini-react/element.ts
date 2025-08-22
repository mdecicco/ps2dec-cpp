import { flattenChildren } from './logic';
import { ComponentType, IntrinsicComponentProps, Key, ReactElement, ReactNode } from './types';

export function createElement<P extends {}>(
    type: ComponentType<P>,
    componentProps?: (IntrinsicComponentProps & P) | null,
    ...children: ReactNode[]
): ReactElement<any> {
    const props = componentProps ?? ({} as IntrinsicComponentProps & P);

    if ('children' in props) {
        throw new Error('children should not be provided as a prop');
    }

    return {
        type,
        props: {
            ...props,
            children: flattenChildren(children)
        },
        key: props.key
    };
}
