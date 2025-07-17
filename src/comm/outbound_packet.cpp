#include <decomp/comm/outbound_packet.h>

#include <decomp/comm/socket.h>
#include <decomp/utils/buffer.h>
#include <decomp/utils/exceptions.h>

namespace decomp {
    OutboundPacket::OutboundPacket(Socket* socket, Type type) {
        m_socket = socket;
        m_isSent = false;
        m_type   = type;

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
        m_socket->send(this);
        m_isSent = true;
    }
}