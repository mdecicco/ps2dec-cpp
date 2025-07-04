#pragma once
#include <decomp/types.h>

#include <decomp/app/options.h>

#include <decomp/utils/socket_listener.h>

namespace decomp {
    class Socket;

    namespace cmd {
        class CommandMgr;
    }

    class Application : private ISocketListener {
        public:
            Application(const ApplicationOptions& options);
            ~Application() override;

            const ApplicationOptions& getOptions() const;
            Socket* getSocket() const;
            cmd::CommandMgr* getCommandMgr() const;

            i32 run();
            void shutdown();

        protected:
            ApplicationOptions m_options;
            bool m_isRunning;
            Socket* m_socket;
            cmd::CommandMgr* m_commandMgr;

            void onMessage(Buffer& buffer) override;
            void onConnectionEstablished() override;
            void onConnectionClosed() override;
    };
}