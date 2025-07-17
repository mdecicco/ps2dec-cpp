#pragma once
#include <decomp/comm/outbound_packet.h>
#include <decomp/types.h>

namespace decomp {
    class Socket;

    namespace cmd {
        class ICommand;
    }

    namespace packet {
        class ClientCommand : public OutboundPacket {
            public:
                ClientCommand(cmd::ICommand* command, Socket* socket);
        };
    }
}