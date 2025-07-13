#pragma once
#include <decomp/types.h>

#include <decomp/utils/buffer.hpp>

namespace decomp {
    class Socket;

    namespace cmd {
        class Response : public Buffer {
            public:
                Response(u32 commandId, Socket* socket);

                u32 getCommandId() const;

                void send();

            protected:
                u32 m_commandId;
                bool m_isSent;
                Socket* m_socket;
        };
    }
}