#pragma once
#include <decomp/types.h>
#include <decomp/utils/string.h>

#include <cstdarg>
#include <exception>

namespace decomp {
    class GenericException : public std::exception {
        public:
            GenericException();
            GenericException(const char* message, ...);
            virtual ~GenericException();

            const char* what() const noexcept override;

        protected:
            String m_message;
    };

    class InputException : public GenericException {
        public:
            InputException();
            InputException(const char* message, ...);
    };

    class InvalidArgumentException : public InputException {
        public:
            InvalidArgumentException();
            InvalidArgumentException(const char* message, ...);
    };

    class InvalidActionException : public GenericException {
        public:
            InvalidActionException();
            InvalidActionException(const char* message, ...);
    };

    class RangeException : public GenericException {
        public:
            RangeException();
            RangeException(const char* message, ...);
    };

    class FileException : public GenericException {
        public:
            FileException();
            FileException(const char* message, ...);
    };
}