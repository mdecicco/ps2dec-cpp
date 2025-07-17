#include <decomp/cmd/cmd_shutdown.h>
#include <decomp/comm/packets/cmd_response.h>

#include <decomp/app/application.h>

namespace decomp {
    namespace cmd {
        CmdShutdown::CmdShutdown() : ICommand(CmdShutdown::name) {}

        ICommand* CmdShutdown::deserialize(Buffer& buffer) {
            return new CmdShutdown();
        }

        CmdShutdown* CmdShutdown::create() {
            return new CmdShutdown();
        }

        void CmdShutdown::generateResponse() {
            getResponse()->write(u8(1));
        }

        void CmdShutdown::dispatchCommit(ICommandListener* listener) {
            listener->onCommandCommit(this);
        }

        void CmdShutdown::dispatchCommitFailed(ICommandListener* listener) {
            listener->onCommandCommitFailed(this);
        }

        void CmdShutdown::dispatchRollback(ICommandListener* listener) {
            listener->onCommandRollback(this);
        }

        void CmdShutdown::dispatchRollbackFailed(ICommandListener* listener) {
            listener->onCommandRollbackFailed(this);
        }
    }
}