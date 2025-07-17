#pragma once
#include <decomp/types.h>

#include <decomp/app/options.h>
#include <decomp/cmd/command_listener.h>
#include <decomp/comm/socket_listener.h>
#include <decomp/utils/logging.h>

#include <chrono>

namespace decomp {
    class Socket;
    class AppLogger;
    class PluginMgr;

    namespace cmd {
        class CommandMgr;
        class CmdShutdown;
    }

    class Application : private ISocketListener, public IWithLogging, public cmd::ICommandListener {
        public:
            Application(const ApplicationOptions& options);
            ~Application() override;

            const ApplicationOptions& getOptions() const;
            Socket* getSocket() const;
            PluginMgr* getPluginMgr() const;
            cmd::CommandMgr* getCommandMgr() const;

            i32 run();

        protected:
            using Clock    = std::chrono::steady_clock;
            using Duration = std::chrono::duration<f32, std::milli>;

            ApplicationOptions m_options;
            bool m_isRunning;
            bool m_shutdownRequested;
            Clock::time_point m_shutdownRequestedAt;

            AppLogger* m_logger;
            Socket* m_socket;
            PluginMgr* m_pluginMgr;
            cmd::CommandMgr* m_commandMgr;

            void onCommandCommit(cmd::CmdShutdown* command) override;
            void onMessage(Buffer& buffer) override;
            void onConnectionEstablished() override;
            void onConnectionClosed() override;
            void registerValidCommands();
    };
}