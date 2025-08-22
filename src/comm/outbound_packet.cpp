#include <decomp/comm/outbound_packet.h>

#include <decomp/utils/buffer.h>
#include <utils/Exception.h>

#include <tspp/builtin/socket_server.h>

namespace decomp {
    OutboundPacket::OutboundPacket(tspp::WebSocketConnection* connection, Type type) {
        m_connection = connection;
        m_socket     = nullptr;
        m_isSent     = false;
        m_type       = type;

        write(type);
    }

    OutboundPacket::OutboundPacket(tspp::WebSocketServer* socket, Type type) {
        m_connection = nullptr;
        m_socket     = socket;
        m_isSent     = false;
        m_type       = type;

        write(type);
    }

    OutboundPacket::~OutboundPacket() {}

    OutboundPacket::Type OutboundPacket::getPacketType() const {
        return m_type;
    }

    bool OutboundPacket::isSent() const {
        return m_isSent;
    }

    void OutboundPacket::send() {
        if (m_isSent) {
            throw InvalidActionException("OutboundPacket::send() - Packet has already been sent");
        }

        seek(0);

        if (m_connection) {
            m_connection->send(data(), size());
        } else if (m_socket) {
            m_socket->broadcast(data(), size());
        }

        m_isSent = true;
    }
}