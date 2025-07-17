#pragma once
#include <decomp/utils/stream.h>

namespace decomp {
    template <typename T>
    std::enable_if_t<!std::is_pointer_v<T>, void> IStream::write(const T& val) {
        writeBytes(&val, sizeof(T));
    }

    template <typename T>
    std::enable_if_t<!std::is_pointer_v<T>, void> IStream::read(T& val) {
        readBytes(&val, sizeof(T));
    }
}