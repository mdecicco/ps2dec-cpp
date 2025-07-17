#pragma once
#include <decomp/app/plugin_mgr.h>

namespace decomp {
    template <typename T, typename... Args>
    void PluginMgr::addPlugin(Args&&... args) {
        static_assert(std::is_base_of<IPlugin, T>::value, "T must derive from IPlugin");
        T* plugin = new T(std::forward<Args>(args)...);
        addNestedLogger(plugin);
        m_plugins.push(plugin);
    }
}