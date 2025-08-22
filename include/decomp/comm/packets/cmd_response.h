#pragma once
#include <decomp/types.h>

#include <decomp/comm/outbound_packet.h>

namespace decomp {
    namespace packet {
        class CommandResponse : public OutboundPacket {
            public:
                CommandResponse(u32 commandId, tspp::WebSocketConnection* connection);

                u32 getCommandId() const;

            protected:
                u32 m_commandId;
        };
    }
}