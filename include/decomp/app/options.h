#pragma once
#include <decomp/types.h>
#include <decomp/utils/string.h>

namespace decomp {
    struct ApplicationOptions {
        public:
            bool printHelp = false;
            bool printVersion = false;
            i32 websocketPort = 6169;
    };
}