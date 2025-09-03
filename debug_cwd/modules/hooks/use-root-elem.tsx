import * as React from 'mini-react';
import { Element } from 'ui';
import { UIRoot } from 'ui/root';

const Context = React.createContext<Element | null>();
Context.Provider.displayName = 'RootElementContext';

type RootElementProviderProps = {
    root: UIRoot;
};

export const RootElementProvider: React.FC<RootElementProviderProps> = props => {
    const { root } = props;
    return <Context.Provider value={root.rootElement}>{props.children}</Context.Provider>;
};

export function useRootElement() {
    return React.useContext(Context);
}
