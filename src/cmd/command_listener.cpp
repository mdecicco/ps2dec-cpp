#include <decomp/cmd/command_listener.h>

#include <decomp/cmd/command_mgr.h>

namespace decomp {
    namespace cmd {
        ICommandListener::ICommandListener() {
            m_mgr = nullptr;
        }

        ICommandListener::~ICommandListener() {
            if (!m_mgr || m_listeningTo.empty()) {
                return;
            }

            m_mgr->warn(
                "Listener 0x%X destroyed before unsubscribing from one or more commands, unsubscribing now",
                (intptr_t)this
            );

            String commandNames;
            for (const char* commandName : m_listeningTo) {
                commandNames += commandName;
                commandNames += ", ";
            }
            m_mgr->debug(" ^ %s", commandNames.c_str());

            m_mgr->unsubscribeFromAll(this);
        }

        void ICommandListener::onCommandCommit(CmdShutdown* command) {}
        void ICommandListener::onCommandCommitFailed(CmdShutdown* command) {}
        void ICommandListener::onCommandRollback(CmdShutdown* command) {}
        void ICommandListener::onCommandRollbackFailed(CmdShutdown* command) {}
    }
}