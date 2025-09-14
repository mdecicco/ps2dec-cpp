import { EventProducer } from 'event';

import { Theme } from '@app/types';
import { defaultTheme, availableThemes } from '@app/themes/default-themes';

type ThemeEvents = {
    themeChanged: (newTheme: Theme) => void;
};

export class ThemeManager extends EventProducer<ThemeEvents> {
    private static m_instance: ThemeManager | null = null;
    private m_theme: Theme;

    private constructor() {
        super();
        this.m_theme = defaultTheme;
    }

    setTheme(theme: Theme) {
        this.m_theme = theme;
        this.dispatch('themeChanged', theme);
    }

    getTheme(): Theme {
        return this.m_theme;
    }

    getAvailableThemes(): Theme[] {
        return [...availableThemes];
    }

    findThemeByName(name: string): Theme | undefined {
        return availableThemes.find(theme => theme.name === name);
    }

    static initialize() {
        if (this.m_instance) throw new Error('ThemeManager is already initialized');
        this.m_instance = new ThemeManager();
    }

    static shutdown() {
        if (!this.m_instance) throw new Error('ThemeManager is not initialized');
        this.m_instance = null;
    }

    static get() {
        if (!this.m_instance) throw new Error('ThemeManager is not initialized');
        return this.m_instance;
    }
}
