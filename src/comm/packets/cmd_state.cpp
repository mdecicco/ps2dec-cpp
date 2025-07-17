#include <decomp/comm/packets/cmd_state.h>

#include <decomp/comm/socket.h>

namespace decomp {
    namespace packet {
        CommandStateChanged::CommandStateChanged(u32 commandId, cmd::CommandState state, Socket* socket)
            : OutboundPacket(socket, Type::CommandStateChanged) {
            write(commandId);
            write(state);
        }
    }
}