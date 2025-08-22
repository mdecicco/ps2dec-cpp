export abstract class IPlugin {
    private m_name: string;
    constructor(name: string) {
        this.m_name = name;
    }

    get name() {
        return this.m_name;
    }

    onInitialize() {}
    onShutdown() {}
    onService() {}
}
