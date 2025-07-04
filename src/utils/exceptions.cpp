#include <decomp/utils/exceptions.h>

namespace decomp {
    GenericException::GenericException() {}
    GenericException::GenericException(const char* message, ...) {
        va_list args;
        va_start(args, message);
        char buffer[1024];
        vsnprintf(buffer, sizeof(buffer), message, args);
        m_message = buffer;
        va_end(args);
    }

    GenericException::~GenericException() {}

    const char* GenericException::what() const noexcept {
        return m_message.c_str();
    }

    InputException::InputException() {}
    InputException::InputException(const char* message, ...) {
        va_list args;
        va_start(args, message);
        char buffer[1024];
        vsnprintf(buffer, sizeof(buffer), message, args);
        m_message = buffer;
        va_end(args);
    }

    InvalidArgumentException::InvalidArgumentException() {}
    InvalidArgumentException::InvalidArgumentException(const char* message, ...) {
        va_list args;
        va_start(args, message);
        char buffer[1024];
        vsnprintf(buffer, sizeof(buffer), message, args);
        m_message = buffer;
        va_end(args);
    }

    InvalidActionException::InvalidActionException() {}
    InvalidActionException::InvalidActionException(const char* message, ...) {
        va_list args;
        va_start(args, message);
        char buffer[1024];
        vsnprintf(buffer, sizeof(buffer), message, args);
        m_message = buffer;
        va_end(args);
    }

    RangeException::RangeException() {}
    RangeException::RangeException(const char* message, ...) {
        va_list args;
        va_start(args, message);
        char buffer[1024];
        vsnprintf(buffer, sizeof(buffer), message, args);
        m_message = buffer;
        va_end(args);
    }

    FileException::FileException() {}
    FileException::FileException(const char* message, ...) {
        va_list args;
        va_start(args, message);
        char buffer[1024];
        vsnprintf(buffer, sizeof(buffer), message, args);
        m_message = buffer;
        va_end(args);
    }
}