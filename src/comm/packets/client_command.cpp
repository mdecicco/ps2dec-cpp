#include <decomp/comm/packets/client_command.h>

#include <decomp/cmd/command.h>

namespace decomp {
    namespace packet {
        ClientCommand::ClientCommand(cmd::ICommand* command, Socket* socket)
            : OutboundPacket(socket, Type::ClientCommand) {
            command->serialize(*this);
        }
    }
}