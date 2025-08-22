#include <decomp/comm/packets/cmd_response.h>

namespace decomp {
    namespace packet {
        CommandResponse::CommandResponse(u32 commandId, tspp::WebSocketConnection* connection)
            : OutboundPacket(connection, Type::CommandResponse) {
            m_commandId = commandId;

            write(commandId);
        }

        u32 CommandResponse::getCommandId() const {
            return m_commandId;
        }
    }
}