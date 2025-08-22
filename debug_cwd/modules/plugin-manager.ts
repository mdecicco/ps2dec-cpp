import { IPlugin } from './plugin';

class PluginManager {
    private m_plugins: IPlugin[];
    private m_initialized: boolean;

    constructor() {
        this.m_plugins = [];
        this.m_initialized = false;
    }

    addPlugin(plugin: IPlugin) {
        if (this.m_initialized) {
            throw new Error(`Plugin ${plugin.name} cannot be added after initialization`);
        }

        console.log(`Adding plugin ${plugin.name}`);
        this.m_plugins.push(plugin);
    }

    initialize() {
        if (this.m_initialized) {
            throw new Error(`PluginManager already initialized`);
        }

        this.m_initialized = true;

        for (const plugin of this.m_plugins) {
            console.log(`Initializing plugin ${plugin.name}`);
            plugin.onInitialize();
        }
    }

    shutdown() {
        if (!this.m_initialized) {
            throw new Error(`PluginManager not initialized`);
        }

        this.m_initialized = false;

        for (const plugin of this.m_plugins) {
            console.log(`Shutting down plugin ${plugin.name}`);
            plugin.onShutdown();
        }
    }
}

const Manager = new PluginManager();
export default Manager;
