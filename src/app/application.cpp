#include <decomp/app/application.h>
#include <decomp/app/logger.h>
#include <decomp/app/plugin_mgr.hpp>

#include <decomp/cmd/cmd_shutdown.h>
#include <decomp/cmd/command.h>
#include <decomp/cmd/command_mgr.hpp>

#include <decomp/comm/socket.h>
#include <decomp/comm/socket_listener.h>
#include <decomp/utils/buffer.h>
#include <decomp/utils/exceptions.h>

#include <chrono>
#include <iostream>
#include <thread>

namespace decomp {
    Application::Application(const ApplicationOptions& options) : IWithLogging("Application") {
        m_options           = options;
        m_isRunning         = false;
        m_shutdownRequested = false;

        m_logger = new AppLogger(this);
        subscribeLogListener(m_logger);

        m_socket = new Socket(m_options);
        m_socket->setListener(this);
        addNestedLogger(m_socket);

        m_pluginMgr = new PluginMgr(this);
        addNestedLogger(m_pluginMgr);

        m_commandMgr = new cmd::CommandMgr(this);
        addNestedLogger(m_commandMgr);

        registerValidCommands();
    }

    Application::~Application() {
        delete m_commandMgr;
        delete m_pluginMgr;
        delete m_socket;
        delete m_logger;
    }

    const ApplicationOptions& Application::getOptions() const {
        return m_options;
    }

    Socket* Application::getSocket() const {
        return m_socket;
    }

    PluginMgr* Application::getPluginMgr() const {
        return m_pluginMgr;
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
            m_commandMgr->subscribeCommandListener<cmd::CmdShutdown>(this);
            m_pluginMgr->init();
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
            m_commandMgr->unsubscribeFromAll(this);
            m_commandMgr->shutdown();
            m_pluginMgr->shutdown();
            m_isRunning = false;
            throw e;
        } catch (const std::exception& e) {
            m_commandMgr->unsubscribeFromAll(this);
            m_commandMgr->shutdown();
            m_pluginMgr->shutdown();
            m_isRunning = false;
            throw e;
        }

        m_commandMgr->unsubscribeFromAll(this);
        m_commandMgr->shutdown();
        m_pluginMgr->shutdown();
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
            cmd::ICommand* command = cmd::ICommand::deserialize(buffer, false, this);
            command->initializeResponse(m_socket);
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