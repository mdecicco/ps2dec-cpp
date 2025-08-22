#include <decomp/app/application.h>
#include <decomp/app/logger.h>
#include <decomp/cmd/cmd_log.h>
#include <decomp/cmd/command_mgr.h>
#include <utils/Array.hpp>
#include <utils/Exception.h>

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

        // u32 maxScopeLength = getMaxScopeLength();

        if (strlen(scope) > 0) {
            printf("\x1b[38;5;240m");
            printf("%s ", scope);
            printf("\033[32m");
            puts(msg);
            printf("\x1b[0m");
            return;
        }

        printf("\033[32m%s\033[0m\n", msg);
    }

    void AppLogger::onInfo(const char* scope, const char* msg) {
        if (!msg) {
            return;
        }

        // u32 maxScopeLength = getMaxScopeLength();

        if (strlen(scope) > 0) {
            printf("\x1b[38;5;240m");
            printf("%s ", scope);
            printf("\033[37m");
            puts(msg);
            printf("\x1b[0m");
            return;
        }

        printf("\033[37m%s\033[0m\n", msg);
    }

    void AppLogger::onWarn(const char* scope, const char* msg) {
        if (!msg) {
            return;
        }

        // u32 maxScopeLength = getMaxScopeLength();

        if (strlen(scope) > 0) {
            printf("\x1b[38;5;240m");
            printf("%s ", scope);
            printf("\033[33m");
            puts(msg);
            printf("\x1b[0m");
            return;
        }

        printf("\033[33m%s\033[0m\n", msg);
    }

    void AppLogger::onError(const char* scope, const char* msg) {
        if (!msg) {
            return;
        }

        // u32 maxScopeLength = getMaxScopeLength();

        if (strlen(scope) > 0) {
            printf("\x1b[38;5;240m");
            printf("%s ", scope);
            printf("\033[31m");
            puts(msg);
            printf("\x1b[0m");
            return;
        }

        printf("\033[31m%s\033[0m\n", msg);
    }

    void AppLogger::onLogMessage(LogLevel level, const String& scope, const String& message) {
        try {
            if (m_app->getSocket()->getConnections().size() > 0) {
                m_app->getCommandMgr()->submit(cmd::CmdLog::create(level, scope, message));
            }
        } catch (const GenericException& e) {
            printf("Failed to send log message: %s\n", e.what());
        } catch (const std::exception& e) {
            printf("Failed to send log message: %s\n", e.what());
        }

        switch (level) {
            case LogLevel::Debug: {
                onDebug(scope.c_str(), message.c_str());
                break;
            }
            case LogLevel::Info: {
                onInfo(scope.c_str(), message.c_str());
                break;
            }
            case LogLevel::Warn: {
                onWarn(scope.c_str(), message.c_str());
                break;
            }
            case LogLevel::Error:
            case LogLevel::Fatal: {
                onError(scope.c_str(), message.c_str());
                break;
            }
            default: break;
        }

        fflush(stdout);
    }
}