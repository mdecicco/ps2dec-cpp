#pragma once
#include <decomp/types.h>
#include <decomp/utils/string.h>

namespace decomp {
    class IStream {
        public:
            virtual void seek(u64 offsetInBytes)                  = 0;
            virtual u64 position() const                          = 0;
            virtual u64 size() const                              = 0;
            virtual void readBytes(void* buffer, u64 size)        = 0;
            virtual void writeBytes(const void* buffer, u64 size) = 0;

            void read(void* buffer, u64 size);
            void read(IStream& stream, u64 size = UINT64_MAX);
            void read(IStream* stream, u64 size = UINT64_MAX);
            void write(const void* buffer, u64 size);
            void write(IStream& stream, u64 size = UINT64_MAX);
            void write(IStream* stream, u64 size = UINT64_MAX);
            void write(const String& str);
            String readStr();
            String readStr(u64 length);
            bool at_end() const;

            template <typename T>
            std::enable_if_t<!std::is_pointer_v<T>, void> write(const T& val);

            template <typename T>
            std::enable_if_t<!std::is_pointer_v<T>, void> read(T& val);
    };
}