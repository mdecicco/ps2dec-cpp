#include <decomp/app/application.h>
#include <decomp/app/logger.h>
#include <decomp/app/plugin_mgr.hpp>
#include <decomp/app/plugins/scripting.h>
#include <decomp/app/window.h>
#include <decomp/cmd/cmd_shutdown.h>
#include <decomp/cmd/command.h>
#include <decomp/cmd/command_mgr.hpp>
#include <decomp/utils/buffer.h>
#include <decomp/utils/event.hpp>

#include <utils/Array.hpp>
#include <utils/Exception.h>

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

        m_socket = new tspp::WebSocketServer(m_options.websocketPort);
        m_socket->addListener(this);
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

    void Application::addWindow(Window* window) {
        m_windows.push(window);
        addNestedLogger(window);
    }

    void Application::removeWindow(Window* window) {
        i64 index = m_windows.findIndex([window](Window* w) {
            return w == window;
        });

        if (index != -1) {
            m_windows.remove(index);
            removeNestedLogger(window);
        }
    }

    const ApplicationOptions& Application::getOptions() const {
        return m_options;
    }

    tspp::WebSocketServer* Application::getSocket() const {
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
            m_pluginMgr->addPlugin<ScriptingPlugin>(this);

            m_commandMgr->subscribeCommandListener<cmd::CmdShutdown>(this);
            m_pluginMgr->init();
            m_socket->open();

            m_onInitializedDispatcher.dispatch(onInitialized);

            while (m_socket->isOpen()) {
                m_pluginMgr->service();

                for (Window* window : m_windows) {
                    window->pollEvents();
                }

                std::this_thread::sleep_for(std::chrono::milliseconds(10));
                m_socket->processEvents();

                m_onServiceDispatcher.dispatch(onService);

                if (m_shutdownRequested) {
                    Duration msSinceShutdownRequested = Clock::now() - m_shutdownRequestedAt;

                    if (msSinceShutdownRequested.count() > 1000.0f) {
                        log("Shutting down");
                        m_socket->close();
                    }
                }
            }

            bool stillProcessing = true;
            while (stillProcessing) {
                stillProcessing = false;
                for (Window* window : m_windows) {
                    stillProcessing |= window->pollEvents();
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
        m_onShutdownRequestedDispatcher.dispatch(onShutdownRequested);
    }

    void Application::onMessage(tspp::WebSocketConnection* connection, const void* data, u64 size) {
        try {
            Buffer buf;
            buf.write(data, size);

            cmd::ICommand* command = cmd::ICommand::deserialize(buf, false, this);
            command->initializeResponse(connection);
            m_commandMgr->submit(command);
        } catch (const std::exception& e) {
            error("Caught exception while deserializing command: %s", e.what());
        }
    }

    void Application::onConnect(tspp::WebSocketConnection* connection) {
        log("Connection established");
    }

    void Application::onDisconnect(tspp::WebSocketConnection* connection) {
        log("Connection closed");
    }
}