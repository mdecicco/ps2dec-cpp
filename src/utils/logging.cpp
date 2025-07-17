#include <decomp/utils/array.hpp>
#include <decomp/utils/logging.h>

#include <stdarg.h>

namespace decomp {
    IWithLogging::IWithLogging(const String& scope) : m_scope(scope) {}

    IWithLogging::~IWithLogging() {}

    void IWithLogging::propagateLog(LogLevel level, const String& scope, const String& message) {
        m_listeners.each([level, &scope, &message](ILogListener* logger) {
            logger->onLogMessage(level, scope, message);
        });
    }

    void IWithLogging::log(LogLevel level, const String& message) {
        onLogMessage(level, m_scope, message);
    }

    void IWithLogging::log(const char* messageFmt, ...) {
        char out[2048] = {0};
        va_list l;
        va_start(l, messageFmt);
        i32 len = vsnprintf(out, 2048, messageFmt, l);
        va_end(l);

        onLogMessage(LogLevel::Info, m_scope, String(out, len));
    }

    void IWithLogging::log(const String& msg) {
        onLogMessage(LogLevel::Info, m_scope, msg);
    }

    void IWithLogging::debug(const char* messageFmt, ...) {
        char out[2048] = {0};
        va_list l;
        va_start(l, messageFmt);
        i32 len = vsnprintf(out, 2048, messageFmt, l);
        va_end(l);

        onLogMessage(LogLevel::Debug, m_scope, String(out, len));
    }

    void IWithLogging::debug(const String& msg) {
        onLogMessage(LogLevel::Debug, m_scope, msg);
    }

    void IWithLogging::warn(const char* messageFmt, ...) {
        char out[2048] = {0};
        va_list l;
        va_start(l, messageFmt);
        i32 len = vsnprintf(out, 2048, messageFmt, l);
        va_end(l);

        onLogMessage(LogLevel::Warn, m_scope, String(out, len));
    }

    void IWithLogging::warn(const String& msg) {
        onLogMessage(LogLevel::Warn, m_scope, msg);
    }

    void IWithLogging::error(const char* messageFmt, ...) {
        char out[2048] = {0};
        va_list l;
        va_start(l, messageFmt);
        i32 len = vsnprintf(out, 2048, messageFmt, l);
        va_end(l);

        onLogMessage(LogLevel::Error, m_scope, String(out, len));
    }

    void IWithLogging::error(const String& msg) {
        onLogMessage(LogLevel::Error, m_scope, msg);
    }

    void IWithLogging::fatal(const char* messageFmt, ...) {
        char out[2048] = {0};
        va_list l;
        va_start(l, messageFmt);
        i32 len = vsnprintf(out, 2048, messageFmt, l);
        va_end(l);

        onLogMessage(LogLevel::Fatal, m_scope, String(out, len));
    }

    void IWithLogging::fatal(const String& msg) {
        onLogMessage(LogLevel::Fatal, m_scope, msg);
    }

    void IWithLogging::subscribeLogListener(ILogListener* listener) {
        if (listener == this) {
            return;
        }

        bool exists = m_listeners.some([listener](ILogListener* l) { return l == listener; });
        if (exists) {
            return;
        }

        m_listeners.push(listener);
    }

    void IWithLogging::unsubscribeLogListener(ILogListener* listener) {
        if (listener == this) {
            return;
        }

        i64 idx = m_listeners.findIndex([listener](ILogListener* l) { return l == listener; });
        if (idx == -1) {
            return;
        }

        m_listeners.remove(u32(idx));
    }

    void IWithLogging::addNestedLogger(IWithLogging* logger) {
        if (logger == this) {
            return;
        }

        bool exists = m_nestedLoggers.some([logger](ILogListener* l) { return l == logger; });
        if (exists) {
            return;
        }

        m_nestedLoggers.push(logger);
        logger->subscribeLogListener(this);
    }

    void IWithLogging::getScopes(Array<String>& scopes) const {
        if (!scopes.some([this](const String& scope) { return scope == m_scope; })) {
            scopes.push(m_scope);
        }

        m_nestedLoggers.each([&scopes](IWithLogging* logger) { logger->getScopes(scopes); });
    }

    void IWithLogging::onLogMessage(LogLevel level, const String& scope, const String& message) {
        propagateLog(level, scope, message);
    }
};