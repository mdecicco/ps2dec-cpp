#include <decomp/app/application.h>

#include <decomp/cmd/cmd_shutdown.h>
#include <decomp/cmd/command_mgr.hpp>

namespace decomp {
    void Application::registerValidCommands() {
        m_commandMgr->registerCommand<cmd::CmdShutdown>();
    }
}