#define ASIO_STANDALONE

#include <decomp/utils/buffer.h>
#include <decomp/utils/exceptions.h>
#include <decomp/utils/socket.h>
#include <decomp/utils/socket_listener.h>

#include <websocketpp/config/asio_no_tls.hpp>
#include <websocketpp/server.hpp>

namespace decomp {
    typedef websocketpp::server<websocketpp::config::asio> Server;

    //////////////////////////////////////////////////////////////////////////
    // Socket_Impl
    //////////////////////////////////////////////////////////////////////////

    class Socket_Impl {
        public:
            Socket_Impl() {
                socket        = nullptr;
                hasConnection = false;
            }

            void onMessage(websocketpp::connection_hdl hdl, Server::message_ptr msg) {
                const std::string& payload = msg->get_payload();
                Buffer buf(payload.size());
                buf.write(payload.data(), payload.size());
                buf.position(0);
                socket->onMessage(buf);
            }

            void onOpen(websocketpp::connection_hdl hdl) {
                if (hasConnection) {
                    server.close(
                        connection,
                        websocketpp::close::status::normal,
                        "Previous connection closed since new connection opened"
                    );
                }

                connection    = hdl;
                hasConnection = true;
                socket->onConnectionEstablished();
            }

            void onClose(websocketpp::connection_hdl hdl) {
                hasConnection = false;
                socket->onConnectionClosed();
            }

            Socket* socket;
            Server server;
            websocketpp::connection_hdl connection;
            bool hasConnection;
    };

    //////////////////////////////////////////////////////////////////////////
    // Socket
    //////////////////////////////////////////////////////////////////////////

    Socket::Socket(const ApplicationOptions& options) {
        m_options            = &options;
        m_impl               = nullptr;
        m_shouldStop         = false;
        m_isProcessingEvents = false;
        m_listener           = nullptr;
    }

    Socket::~Socket() {
        if (m_impl) {
            close();
        }
    }

    void Socket::open() {
        if (isOpen()) {
            throw GenericException("Socket::open() - Socket is already open");
        }

        if (!m_impl) {
            m_impl         = new Socket_Impl();
            m_impl->socket = this;
        }

        m_impl->server.set_access_channels(websocketpp::log::alevel::none);

        m_impl->server.set_message_handler(
            websocketpp::lib::bind(
                &Socket_Impl::onMessage, m_impl, websocketpp::lib::placeholders::_1, websocketpp::lib::placeholders::_2
            )
        );
        m_impl->server.set_open_handler(
            websocketpp::lib::bind(&Socket_Impl::onOpen, m_impl, websocketpp::lib::placeholders::_1)
        );
        m_impl->server.set_close_handler(
            websocketpp::lib::bind(&Socket_Impl::onClose, m_impl, websocketpp::lib::placeholders::_1)
        );

        m_impl->server.init_asio();
        m_impl->server.listen(m_options->websocketPort);
        m_impl->server.start_accept();
        m_startedByThread = std::this_thread::get_id();

        std::cout << "WebSocket server initialized on port " << m_options->websocketPort << std::endl;
    }

    void Socket::close() {
        if (!m_impl) {
            throw GenericException("Socket::close() - Socket is not open");
        }

        // if this is not the main thread, just raise the shouldStop flag
        if (m_isProcessingEvents || std::this_thread::get_id() != m_startedByThread) {
            m_shouldStop = true;
            return;
        }

        if (isOpen()) {
            if (m_impl->hasConnection) {
                std::cout << "Closing connection" << std::endl;
                m_impl->server.close(m_impl->connection, websocketpp::close::status::normal, "Socket closed");
            }

            m_impl->server.stop();
        }

        delete m_impl;
        m_impl = nullptr;
    }

    bool Socket::isOpen() const {
        return m_impl != nullptr && m_impl->server.is_listening();
    }

    void Socket::send(const Buffer& buffer) {
        if (!isOpen()) {
            throw GenericException("Socket::send() - Socket is not open");
        }

        if (!m_impl->hasConnection) {
            throw GenericException("Socket::send() - No active WebSocket connection to send to");
        }

        try {
            m_impl->server.send(m_impl->connection, buffer.data(), buffer.size(), websocketpp::frame::opcode::binary);
        } catch (const websocketpp::exception& e) {
            throw GenericException("Socket::send() - Failed to send message: %s", e.what());
        }
    }

    void Socket::send(const Buffer* buffer) {
        send(*buffer);
    }

    void Socket::processEvents() {
        if (!m_impl) {
            throw GenericException("Socket::processEvents() - Socket is not open");
        }

        if (m_shouldStop) {
            close();
            return;
        }

        m_isProcessingEvents = true;
        m_impl->server.run_one();
        m_isProcessingEvents = false;
    }

    void Socket::setListener(ISocketListener* listener) {
        m_listener = listener;
    }

    void Socket::onMessage(Buffer& buffer) {
        if (!m_listener) {
            return;
        }

        m_listener->onMessage(buffer);
    }

    void Socket::onConnectionEstablished() {
        if (!m_listener) {
            return;
        }

        m_listener->onConnectionEstablished();
    }

    void Socket::onConnectionClosed() {
        if (!m_listener) {
            return;
        }

        m_listener->onConnectionClosed();
    }
}
