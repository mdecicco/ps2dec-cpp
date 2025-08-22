#pragma once
#include <decomp/types.h>

#include <decomp/app/options.h>
#include <decomp/cmd/command_listener.h>
#include <decomp/utils/event.h>

#include <utils/Array.h>
#include <utils/interfaces/IWithLogging.h>

#include <tspp/builtin/socket_server.h>

#include <chrono>

namespace decomp {
    class Socket;
    class AppLogger;
    class PluginMgr;
    class Window;

    namespace cmd {
        class CommandMgr;
        class CmdShutdown;
    }

    class Application : private tspp::IWebSocketServerListener, public IWithLogging, public cmd::ICommandListener {
        public:
            Application(const ApplicationOptions& options);
            ~Application() override;

            void addWindow(Window* window);
            void removeWindow(Window* window);

            const ApplicationOptions& getOptions() const;
            tspp::WebSocketServer* getSocket() const;
            PluginMgr* getPluginMgr() const;
            cmd::CommandMgr* getCommandMgr() const;

            Event<void> onInitialized;
            Event<void> onShutdownRequested;
            Event<void> onService;

            i32 run();

        protected:
            using Clock    = std::chrono::steady_clock;
            using Duration = std::chrono::duration<f32, std::milli>;

            ApplicationOptions m_options;
            bool m_isRunning;
            bool m_shutdownRequested;
            Clock::time_point m_shutdownRequestedAt;

            AppLogger* m_logger;
            tspp::WebSocketServer* m_socket;
            PluginMgr* m_pluginMgr;
            cmd::CommandMgr* m_commandMgr;
            Array<Window*> m_windows;

            EventDispatcher<void> m_onInitializedDispatcher;
            EventDispatcher<void> m_onShutdownRequestedDispatcher;
            EventDispatcher<void> m_onServiceDispatcher;

            void onCommandCommit(cmd::CmdShutdown* command) override;
            void onMessage(tspp::WebSocketConnection* connection, const void* data, u64 size) override;
            void onConnect(tspp::WebSocketConnection* connection) override;
            void onDisconnect(tspp::WebSocketConnection* connection) override;
            void registerValidCommands();
    };
}