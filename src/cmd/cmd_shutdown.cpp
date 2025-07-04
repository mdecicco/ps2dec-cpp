#include <decomp/cmd/cmd_shutdown.h>

#include <decomp/app/application.h>

namespace decomp {
    namespace cmd {
        CmdShutdown::CmdShutdown(Application* app) : IServerCommand(CommandType::Shutdown, CommandFlags::None, app) {}

        void CmdShutdown::doCommit() {
            m_app->shutdown();
        }

        const char* CmdShutdown::getTypeName() const {
            return "cmdShutdown";
        }

        CmdShutdown* CmdShutdown::fromBuffer(Buffer& buffer, CommandState state, CommandFlags flags, Application* app) {
            return new CmdShutdown(app);
        }
    }
}