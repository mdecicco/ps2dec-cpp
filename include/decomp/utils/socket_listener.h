#pragma once
#include <decomp/types.h>

namespace decomp {
    class Buffer;
    class ISocketListener {
        public:
            virtual ~ISocketListener() = default;

            virtual void onConnectionEstablished();
            virtual void onConnectionClosed();
            virtual void onMessage(Buffer& buffer);
    };
}