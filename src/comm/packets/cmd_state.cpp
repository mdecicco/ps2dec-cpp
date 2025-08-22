#include <decomp/comm/packets/cmd_state.h>

namespace decomp {
    namespace packet {
        CommandStateChanged::CommandStateChanged(u32 commandId, cmd::CommandState state, tspp::WebSocketServer* socket)
            : OutboundPacket(socket, Type::CommandStateChanged) {
            write(commandId);
            write(state);
        }
    }
}