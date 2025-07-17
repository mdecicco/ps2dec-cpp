#include <decomp/cmd/cmd_log.h>
#include <decomp/utils/buffer.h>

namespace decomp {
    namespace cmd {
        CmdLog::CmdLog(LogLevel level, const String& scope, const String& message) : ICommand(CmdLog::name) {
            m_level   = level;
            m_scope   = scope;
            m_message = message;
        }

        ICommand* CmdLog::deserialize(Buffer& buffer) {
            LogLevel level;
            buffer.read(level);

            String scope   = buffer.readStr();
            String message = buffer.readStr();

            return new CmdLog(level, scope, message);
        }

        CmdLog* CmdLog::create(LogLevel level, const String& scope, const String& message) {
            return new CmdLog(level, scope, message);
        }

        void CmdLog::doSerialize(Buffer& buffer) const {
            buffer.write(m_level);
            buffer.write(m_scope);
            buffer.write(m_message);
        }

        void CmdLog::dispatchCommit(ICommandListener* listener) {}
        void CmdLog::dispatchCommitFailed(ICommandListener* listener) {}
        void CmdLog::dispatchRollback(ICommandListener* listener) {}
        void CmdLog::dispatchRollbackFailed(ICommandListener* listener) {}
    }
}