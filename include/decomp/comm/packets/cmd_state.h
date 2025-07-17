#pragma once
#include <decomp/types.h>

#include <decomp/comm/outbound_packet.h>

namespace decomp {
    class Socket;

    namespace cmd {
        enum class CommandState : u8;
    }

    namespace packet {
        class CommandStateChanged : public OutboundPacket {
            public:
                CommandStateChanged(u32 commandId, cmd::CommandState state, Socket* socket);
        };
    }
}