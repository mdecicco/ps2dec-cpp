#pragma once
#include <decomp/types.h>

#include <decomp/utils/logging.h>
#include <decomp/utils/string.h>

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

            bool m_isInitialized;
    };
}