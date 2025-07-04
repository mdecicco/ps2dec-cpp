#include <decomp/utils/socket_listener.h>

namespace decomp {
    void ISocketListener::onConnectionEstablished() {}

    void ISocketListener::onConnectionClosed() {}

    void ISocketListener::onMessage(Buffer& buffer) {}
}
