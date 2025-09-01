import PluginManager from 'plugin-manager';
import { IPlugin } from 'plugin';

import { ThemeManager, WindowManager } from '@app/managers';

class WindowManagerPlugin extends IPlugin {
    constructor() {
        super('WindowManagerPlugin');
    }

    onInitialize() {
        WindowManager.initialize();
        ThemeManager.initialize();
    }

    onShutdown() {
        WindowManager.shutdown();
        ThemeManager.shutdown();
    }
}

PluginManager.addPlugin(new WindowManagerPlugin());
