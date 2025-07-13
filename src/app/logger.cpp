#include <decomp/app/application.h>
#include <decomp/app/logger.h>

#include <decomp/utils/array.hpp>

namespace decomp {
    AppLogger::AppLogger(Application* app) {
        m_app = app;
    }

    u32 AppLogger::getMaxScopeLength() const {
        Array<String> scopes;
        m_app->getScopes(scopes);

        u32 maxScopeLength = 0;
        scopes.each([&maxScopeLength](const String& scope) {
            if (scope.size() > maxScopeLength) {
                maxScopeLength = scope.size();
            }
        });

        return maxScopeLength;
    }

    void AppLogger::onDebug(const char* scope, const char* msg) {
        if (!msg) {
            return;
        }

        u32 maxScopeLength = getMaxScopeLength();

        if (strlen(scope) > 0) {
            printf("\x1b[38;5;240m");
            printf("%-*s ", maxScopeLength, scope);
            printf("\033[32m");
            puts(msg);
            printf("\x1b[0m");
            return;
        }

        printf("\033[32m%*s\033[0m\n", maxScopeLength, msg);
    }

    void AppLogger::onInfo(const char* scope, const char* msg) {
        if (!msg) {
            return;
        }

        u32 maxScopeLength = getMaxScopeLength();

        if (strlen(scope) > 0) {
            printf("\x1b[38;5;240m");
            printf("%-*s ", maxScopeLength, scope);
            printf("\033[37m");
            puts(msg);
            printf("\x1b[0m");
            return;
        }

        printf("\033[37m%*s\033[0m\n", maxScopeLength, msg);
    }

    void AppLogger::onWarn(const char* scope, const char* msg) {
        if (!msg) {
            return;
        }

        u32 maxScopeLength = getMaxScopeLength();

        if (strlen(scope) > 0) {
            printf("\x1b[38;5;240m");
            printf("%-*s ", maxScopeLength, scope);
            printf("\033[33m");
            puts(msg);
            printf("\x1b[0m");
            return;
        }

        printf("\033[33m%*s\033[0m\n", maxScopeLength, msg);
    }

    void AppLogger::onError(const char* scope, const char* msg) {
        if (!msg) {
            return;
        }

        u32 maxScopeLength = getMaxScopeLength();

        if (strlen(scope) > 0) {
            printf("\x1b[38;5;240m");
            printf("%-*s ", maxScopeLength, scope);
            printf("\033[31m");
            puts(msg);
            printf("\x1b[0m");
            return;
        }

        printf("\033[31m%*s\033[0m\n", maxScopeLength, msg);
    }

    void AppLogger::onLogMessage(LOG_LEVEL level, const String& scope, const String& message) {
        switch (level) {
            case LOG_LEVEL::LOG_DEBUG: {
                onDebug(scope.c_str(), message.c_str());
                break;
            }
            case LOG_LEVEL::LOG_INFO: {
                onInfo(scope.c_str(), message.c_str());
                break;
            }
            case LOG_LEVEL::LOG_WARNING: {
                onWarn(scope.c_str(), message.c_str());
                break;
            }
            case LOG_LEVEL::LOG_ERROR:
            case LOG_LEVEL::LOG_FATAL: {
                onError(scope.c_str(), message.c_str());
                break;
            }
            default: break;
        }

        fflush(stdout);
    }
}