import * as React from 'mini-react';

import { ThemeManager } from '@app/managers/theme-mgr';
import { Theme } from '@app/types';

const ThemeContext = React.createContext<Theme>();
ThemeContext.Provider.displayName = 'ThemeContext';

export const ThemeProvider: React.FC = props => {
    const tm = ThemeManager.get();
    const [theme, setTheme] = React.useState<Theme>(tm.getTheme());

    React.useEffect(() => {
        const l = tm.addListener('themeChanged', setTheme);
        return () => l.remove();
    }, []);

    return <ThemeContext.Provider value={theme}>{props.children}</ThemeContext.Provider>;
};

export function useTheme() {
    const theme = React.useContext(ThemeContext);
    if (!theme) throw new Error('useTheme must be used within a ThemeProvider');

    return theme;
}
