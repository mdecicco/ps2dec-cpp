#pragma once
#include <decomp/utils/buffer.h>

namespace decomp {
    template <typename T>
    void Buffer::write(const T& val) {
        write(&val, sizeof(T));
    }

    template <typename T>
    void Buffer::read(T& val) {
        read(&val, sizeof(T));
    }
};