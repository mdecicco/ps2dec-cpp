#pragma once
#include <decomp/cmd/command.h>
#include <utils/interfaces/IWithLogging.h>

namespace decomp {
    namespace cmd {
        class CmdLog : public ICommand {
            public:
                static constexpr const char* name   = "log";
                static constexpr CommandFlags flags = CommandFlags::None;
                static ICommand* deserialize(Buffer& buffer);

                static CmdLog* create(LogLevel level, const String& scope, const String& message);

            protected:
                CmdLog(LogLevel level, const String& scope, const String& message);
                virtual ~CmdLog() = default;

                void doSerialize(Buffer& buffer) const override;
                void dispatchCommit(ICommandListener* listener) override;
                void dispatchCommitFailed(ICommandListener* listener) override;
                void dispatchRollback(ICommandListener* listener) override;
                void dispatchRollbackFailed(ICommandListener* listener) override;

                LogLevel m_level;
                String m_scope;
                String m_message;
        };
    }
}