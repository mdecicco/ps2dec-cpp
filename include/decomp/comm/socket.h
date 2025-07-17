#pragma once
#include <decomp/app/options.h>
#include <decomp/types.h>
#include <decomp/utils/logging.h>

#include <thread>

namespace decomp {
    class Buffer;
    class Socket_Impl;
    class ISocketListener;
    class SocketErrorHandler;

    class Socket : public IWithLogging {
        public:
            Socket(const ApplicationOptions& options);
            ~Socket();

            void open();
            void close();
            bool isOpen() const;
            bool hasConnection() const;
            void send(const Buffer& buffer);
            void send(const Buffer* buffer);
            void processEvents();

            void setListener(ISocketListener* listener);

        protected:
            friend class Socket_Impl;
            void onMessage(Buffer& buffer);
            void onConnectionEstablished();
            void onConnectionClosed();

            const ApplicationOptions* m_options;
            Socket_Impl* m_impl;
            std::thread::id m_startedByThread;
            bool m_shouldStop;
            bool m_isProcessingEvents;
            ISocketListener* m_listener;
            SocketErrorHandler* m_errorHandler;
    };
}