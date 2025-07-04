#pragma once
#include <decomp/cmd/command.h>

namespace decomp {
    namespace cmd {
        class CmdShutdown : public IServerCommand {
            public:
                CmdShutdown(Application* app);

                static CmdShutdown* fromBuffer(
                    Buffer& buffer, CommandState state, CommandFlags flags, Application* app
                );

            protected:
                void doCommit() override;
                const char* getTypeName() const override;
        };
    }
}