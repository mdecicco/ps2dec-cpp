import * as React from 'mini-react';

type DropdownMenuContext = {
    closeMenu: () => void;
};

const Context = React.createContext<DropdownMenuContext>();
Context.Provider.displayName = 'DropdownMenuProvider';

type DropdownMenuProviderProps = {
    closeMenu: () => void;
};

export const DropdownMenuProvider: React.FC<DropdownMenuProviderProps> = props => {
    const { closeMenu, children } = props;
    const parentContext = React.useContext(Context);

    const ctx = React.useMemo(() => {
        const value = {
            closeMenu
        };

        if (parentContext) {
            value.closeMenu = () => {
                closeMenu();
                parentContext.closeMenu();
            };
        }

        return value;
    }, [closeMenu, parentContext]);

    return <Context.Provider value={ctx}>{children}</Context.Provider>;
};

export const useDropdownMenuContext = () => {
    const context = React.useContext(Context);
    if (!context) {
        throw new Error('useDropdownMenuContext must be used within a DropdownMenuProvider');
    }

    return context;
};
