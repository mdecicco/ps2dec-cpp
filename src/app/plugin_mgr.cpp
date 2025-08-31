#include <decomp/app/plugin_mgr.h>

#include <decomp/app/plugin.h>
#include <utils/Array.hpp>
#include <utils/Exception.h>

namespace decomp {
    PluginMgr::PluginMgr(Application* app) : IWithLogging("PluginMgr") {
        m_app           = app;
        m_isInitialized = false;
    }

    PluginMgr::~PluginMgr() {
        if (m_isInitialized) {
            shutdown();
        }

        for (IPlugin* plugin : m_plugins) {
            delete plugin;
        }
    }

    void PluginMgr::init() {
        if (m_isInitialized) {
            error("init() - Already initialized");
            return;
        }

        IPlugin* failedPlugin = nullptr;

        for (IPlugin* plugin : m_plugins) {
            try {
                plugin->initPlugin();
                plugin->m_isInitialized = true;
            } catch (GenericException& e) {
                error("Caught exception while initializing plugin '%s'", plugin->getName().c_str());
                error("Exception: %s", e.what());
                failedPlugin = plugin;
                break;
            } catch (const std::exception& e) {
                error("Caught exception while initializing plugin '%s'", plugin->getName().c_str());
                error("Exception: %s", e.what());
                failedPlugin = plugin;
                break;
            }
        }

        if (failedPlugin) {
            for (IPlugin* p : m_plugins) {
                if (p->isInitialized()) {
                    continue;
                }

                try {
                    p->shutdownPlugin();
                    p->m_isInitialized = false;
                } catch (GenericException& e) {
                    error(
                        "Caught exception while shutting down plugin '%s' in response to exception while "
                        "initializing plugin '%s'",
                        p->getName().c_str(),
                        failedPlugin->getName().c_str()
                    );
                    error("Exception: %s", e.what());
                } catch (const std::exception& e) {
                    error(
                        "Caught exception while shutting down plugin '%s' in response to exception while "
                        "initializing plugin '%s'",
                        p->getName().c_str(),
                        failedPlugin->getName().c_str()
                    );
                    error("Exception: %s", e.what());
                }
            }

            return;
        }

        m_isInitialized = true;
    }

    void PluginMgr::shutdown() {
        if (!m_isInitialized) {
            error("shutdown() - Not initialized");
            return;
        }

        u32 failed = 0;

        for (IPlugin* plugin : m_plugins) {
            try {
                plugin->shutdownPlugin();
                plugin->m_isInitialized = false;
            } catch (GenericException& e) {
                error("Caught exception while shutting down plugin '%s'", plugin->getName().c_str());
                error("Exception: %s", e.what());
                failed++;
            }
        }

        if (failed > 0) {
            error("shutdown() - %d plugins failed to shutdown", failed);
            return;
        }

        m_isInitialized = false;
    }

    void PluginMgr::service() {
        for (IPlugin* plugin : m_plugins) {
            plugin->service();
        }
    }
}