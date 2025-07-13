#pragma once
#include <decomp/cmd/command.h>

namespace decomp {
    namespace cmd {
        class CmdShutdown : public ICommand {
            public:
                static constexpr const char* name   = "shutdown";
                static constexpr CommandFlags flags = CommandFlags::ForServer;
                static ICommand* deserialize(Buffer& buffer);

                static CmdShutdown* create();

            protected:
                CmdShutdown();

                void generateResponse() override;
                void dispatchCommit(ICommandListener* listener) override;
                void dispatchCommitFailed(ICommandListener* listener) override;
                void dispatchRollback(ICommandListener* listener) override;
                void dispatchRollbackFailed(ICommandListener* listener) override;
        };
    }
}