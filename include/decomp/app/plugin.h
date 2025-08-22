#pragma once
#include <decomp/types.h>

#include <utils/String.h>
#include <utils/interfaces/IWithLogging.h>

namespace decomp {
    class IPlugin : public IWithLogging {
        public:
            IPlugin(const String& name);
            virtual ~IPlugin() = default;

            const String& getName() const;
            bool isInitialized() const;

        protected:
            friend class PluginMgr;

            virtual void initPlugin();
            virtual void shutdownPlugin();
            virtual void service();

            bool m_isInitialized;
    };
}