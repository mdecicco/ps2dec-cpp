#pragma once
#include <decomp/types.h>

#include <unordered_set>

namespace decomp {
    namespace cmd {
        class CmdShutdown;

        class ICommandListener {
            public:
                ICommandListener();
                virtual ~ICommandListener();

                virtual void onCommandCommit(CmdShutdown* command);
                virtual void onCommandCommitFailed(CmdShutdown* command);
                virtual void onCommandRollback(CmdShutdown* command);
                virtual void onCommandRollbackFailed(CmdShutdown* command);

            protected:
                friend class CommandMgr;

                CommandMgr* m_mgr;
                std::unordered_set<const char*> m_listeningTo;
        };
    }
}