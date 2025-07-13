#include <decomp/cmd/response.h>

#include <decomp/utils/exceptions.h>
#include <decomp/utils/socket.h>

namespace decomp {
    namespace cmd {
        Response::Response(u32 commandId, Socket* socket) {
            m_commandId = commandId;
            m_socket    = socket;
            m_isSent    = false;

            write(commandId);
        }

        u32 Response::getCommandId() const {
            return m_commandId;
        }

        void Response::send() {
            if (m_isSent) {
                throw InvalidActionException("Response::send() - Response has already been sent");
            }

            position(0);
            m_socket->send(this);
            m_isSent = true;
        }
    }
}