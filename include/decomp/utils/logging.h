#pragma once
#include <decomp/types.h>

#include <decomp/utils/array.h>
#include <decomp/utils/string.h>

namespace decomp {
    enum class LogLevel : u8 {
        Debug = 0,
        Info  = 1,
        Warn  = 2,
        Error = 3,
        Fatal = 4
    };

    class ILogListener {
        public:
            virtual void onLogMessage(LogLevel level, const String& scope, const String& message) = 0;
    };

    class IWithLogging : public ILogListener {
        public:
            IWithLogging(const String& scope);
            virtual ~IWithLogging();

            void propagateLog(LogLevel level, const String& scope, const String& message);
            void log(LogLevel level, const String& message);
            void log(const char* messageFmt, ...);
            void log(const String& msg);
            void debug(const char* messageFmt, ...);
            void debug(const String& msg);
            void warn(const char* messageFmt, ...);
            void warn(const String& msg);
            void error(const char* messageFmt, ...);
            void error(const String& msg);
            void fatal(const char* messageFmt, ...);
            void fatal(const String& msg);

            void subscribeLogListener(ILogListener* listener);
            void unsubscribeLogListener(ILogListener* listener);
            void addNestedLogger(IWithLogging* logger);
            void getScopes(Array<String>& scopes) const;

            virtual void onLogMessage(LogLevel level, const String& scope, const String& message);

        protected:
            String m_scope;
            Array<ILogListener*> m_listeners;
            Array<IWithLogging*> m_nestedLoggers;
    };
};