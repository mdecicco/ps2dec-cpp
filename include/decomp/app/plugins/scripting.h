#pragma once
#include <decomp/app/plugin.h>

namespace tspp {
    class Runtime;
}

namespace decomp {
    class Application;

    class ScriptingPlugin : public IPlugin {
        public:
            ScriptingPlugin(Application* application);
            ~ScriptingPlugin() override;

        protected:
            void initPlugin() override;
            void shutdownPlugin() override;
            void service() override;

            void initializeScriptedPlugins();
            void bindInterface();

            tspp::Runtime* m_runtime;

        private:
            Application* m_application;
    };
}