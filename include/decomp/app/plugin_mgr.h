#pragma once
#include <decomp/types.h>
#include <utils/interfaces/IWithLogging.h>

namespace decomp {
    class IPlugin;
    class Application;

    class PluginMgr : public IWithLogging {
        public:
            PluginMgr(Application* app);
            ~PluginMgr();

            void init();
            void shutdown();
            void service();

            template <typename T, typename... Args>
            void addPlugin(Args&&... args);

        private:
            bool m_isInitialized;
            Application* m_app;
            Array<IPlugin*> m_plugins;
    };
}