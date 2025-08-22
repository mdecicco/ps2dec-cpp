#pragma once
#include <decomp/types.h>
#include <decomp/utils/buffer.h>

namespace tspp {
    class WebSocketServer;
    class WebSocketConnection;
}

namespace decomp {
    class OutboundPacket : public Buffer {
        public:
            enum class Type : u8 {
                ClientCommand       = 0,
                CommandStateChanged = 1,
                CommandResponse     = 2
            };

            OutboundPacket(tspp::WebSocketConnection* connection, Type type);
            OutboundPacket(tspp::WebSocketServer* socket, Type type);
            virtual ~OutboundPacket();

            Type getPacketType() const;
            bool isSent() const;

            void send();

        private:
            tspp::WebSocketConnection* m_connection;
            tspp::WebSocketServer* m_socket;
            bool m_isSent;
            Type m_type;
    };
}