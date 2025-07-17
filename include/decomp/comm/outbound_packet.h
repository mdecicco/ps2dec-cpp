#pragma once
#include <decomp/types.h>
#include <decomp/utils/buffer.h>

namespace decomp {
    class Socket;

    class OutboundPacket : public Buffer {
        public:
            enum class Type : u8 {
                ClientCommand       = 0,
                CommandStateChanged = 1,
                CommandResponse     = 2
            };

            OutboundPacket(Socket* socket, Type type);
            virtual ~OutboundPacket();

            Type getPacketType() const;
            bool isSent() const;

            void send();

        private:
            Socket* m_socket;
            bool m_isSent;
            Type m_type;
    };
}