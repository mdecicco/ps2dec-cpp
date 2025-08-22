import { FunctionComponent, ReactNode } from './types';

export const Fragment: FunctionComponent<{ children?: ReactNode }> = props => {
    return props.children;
};
