#include <decomp/app/plugin.h>

namespace decomp {
    IPlugin::IPlugin(const String& name) : IWithLogging(name) {
        m_isInitialized = false;
    }

    const String& IPlugin::getName() const {
        return m_scope;
    }

    bool IPlugin::isInitialized() const {
        return m_isInitialized;
    }

    void IPlugin::initPlugin() {}

    void IPlugin::shutdownPlugin() {}
}