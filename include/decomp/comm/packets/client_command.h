#pragma once
#include <decomp/comm/outbound_packet.h>
#include <decomp/types.h>

namespace tspp {
    class WebSocketServer;
}

namespace decomp {
    namespace cmd {
        class ICommand;
    }

    namespace packet {
        class ClientCommand : public OutboundPacket {
            public:
                ClientCommand(cmd::ICommand* command, tspp::WebSocketServer* socket);
        };
    }
}