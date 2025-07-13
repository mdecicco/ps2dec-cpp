#include <decomp/app/application.h>
#include <decomp/app/logger.h>

#include <decomp/cmd/cmd_shutdown.h>
#include <decomp/cmd/command.h>
#include <decomp/cmd/command_mgr.hpp>

#include <decomp/utils/buffer.h>
#include <decomp/utils/exceptions.h>
#include <decomp/utils/socket.h>
#include <decomp/utils/socket_listener.h>

#include <chrono>
#include <iostream>
#include <thread>

namespace decomp {
    Application::Application(const ApplicationOptions& options) : IWithLogging("Application") {
        m_options           = options;
        m_isRunning         = false;
        m_shutdownRequested = false;
        m_socket            = new Socket(m_options);
        m_commandMgr        = new cmd::CommandMgr(this);
        m_logger            = new AppLogger(this);

        m_socket->setListener(this);
        addNestedLogger(m_socket);
        addNestedLogger(m_commandMgr);
        subscribeLogListener(m_logger);
        registerValidCommands();

        m_commandMgr->subscribeCommandListener<cmd::CmdShutdown>(this);
    }

    Application::~Application() {
        m_commandMgr->unsubscribeFromAll(this);
        m_commandMgr->shutdown();

        delete m_socket;
        delete m_commandMgr;
        delete m_logger;
    }

    const ApplicationOptions& Application::getOptions() const {
        return m_options;
    }

    Socket* Application::getSocket() const {
        return m_socket;
    }

    cmd::CommandMgr* Application::getCommandMgr() const {
        return m_commandMgr;
    }

    i32 Application::run() {
        if (m_isRunning) {
            throw GenericException("decomp::Application is already running");
        }

        m_isRunning = true;

        try {
            m_socket->open();

            while (m_socket->isOpen()) {
                std::this_thread::sleep_for(std::chrono::milliseconds(250));
                m_socket->processEvents();

                if (m_shutdownRequested) {
                    Duration msSinceShutdownRequested = Clock::now() - m_shutdownRequestedAt;

                    if (msSinceShutdownRequested.count() > 1000.0f) {
                        log("Shutting down");
                        m_socket->close();
                    }
                }
            }
        } catch (const GenericException& e) {
            m_isRunning = false;
            throw e;
        } catch (const std::exception& e) {
            m_isRunning = false;
            throw e;
        }

        m_isRunning = false;
        return 0;
    }

    void Application::onCommandCommit(cmd::CmdShutdown* command) {
        m_shutdownRequested   = true;
        m_shutdownRequestedAt = std::chrono::steady_clock::now();
        log("Shutdown requested");

        command->resolveCommit(this);
    }

    void Application::onMessage(Buffer& buffer) {
        try {
            u32 commandId;
            buffer.read(commandId);

            cmd::ICommand* command = cmd::ICommand::deserialize(buffer, false, this);
            command->initializeResponse(commandId, m_socket);
            m_commandMgr->submit(command);
        } catch (const std::exception& e) {
            error("Caught exception while deserializing command: %s", e.what());
        }
    }

    void Application::onConnectionEstablished() {
        log("Connection established");
    }

    void Application::onConnectionClosed() {
        log("Connection closed");
    }
}