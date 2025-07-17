#pragma once
#include <decomp/types.h>

#include <decomp/comm/outbound_packet.h>

namespace decomp {
    class Socket;

    namespace packet {
        class CommandResponse : public OutboundPacket {
            public:
                CommandResponse(u32 commandId, Socket* socket);

                u32 getCommandId() const;

            protected:
                u32 m_commandId;
        };
    }
}