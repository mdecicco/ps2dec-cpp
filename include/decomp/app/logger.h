#pragma once
#include <decomp/types.h>

#include <utils/interfaces/IWithLogging.h>

namespace decomp {
    class Application;

    class AppLogger : public ILogListener {
        public:
            AppLogger(Application* app);

        private:
            u32 getMaxScopeLength() const;
            void onDebug(const char* scope, const char* msg);
            void onInfo(const char* scope, const char* msg);
            void onWarn(const char* scope, const char* msg);
            void onError(const char* scope, const char* msg);
            void onLogMessage(LogLevel level, const String& scope, const String& message) override;

            Application* m_app;
    };
}