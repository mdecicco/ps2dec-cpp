#include <decomp/comm/packets/cmd_response.h>

#include <decomp/comm/socket.h>
#include <decomp/utils/exceptions.h>

namespace decomp {
    namespace packet {
        CommandResponse::CommandResponse(u32 commandId, Socket* socket)
            : OutboundPacket(socket, Type::CommandResponse) {
            m_commandId = commandId;

            write(commandId);
        }

        u32 CommandResponse::getCommandId() const {
            return m_commandId;
        }
    }
}