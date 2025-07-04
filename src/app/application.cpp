#include <decomp/app/application.h>

#include <decomp/cmd/command.h>
#include <decomp/cmd/command_mgr.h>

#include <decomp/utils/buffer.h>
#include <decomp/utils/exceptions.h>
#include <decomp/utils/socket.h>
#include <decomp/utils/socket_listener.h>

#include <chrono>
#include <iostream>
#include <thread>

namespace decomp {
    Application::Application(const ApplicationOptions& options) {
        m_options   = options;
        m_isRunning = false;
        m_socket    = new Socket(m_options);
        m_socket->setListener(this);
        m_commandMgr = new cmd::CommandMgr(this);
    }

    Application::~Application() {
        delete m_socket;
        delete m_commandMgr;
    }

    const ApplicationOptions& Application::getOptions() const {
        return m_options;
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

    void Application::shutdown() {
        m_socket->close();
    }

    void Application::onMessage(Buffer& buffer) {
        try {
            cmd::ICommand* command = cmd::ICommand::deserialize(buffer, this);
            m_commandMgr->submit(command);
        } catch (const std::exception& e) {
            std::cout << "Error: " << e.what() << std::endl;
        }
    }

    void Application::onConnectionEstablished() {
        std::cout << "Connection established" << std::endl;
    }

    void Application::onConnectionClosed() {
        std::cout << "Connection closed" << std::endl;
    }
}