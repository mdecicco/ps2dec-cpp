#pragma once
#include <decomp/types.h>
#include <decomp/utils/stream.hpp>

#include <stdio.h>

namespace decomp {
    class Buffer;

    namespace io {
        class File : public IStream {
            public:
                static File* open(const String& path, const char* mode);
                static void close(File* file);

                void seek(u64 offsetInBytes) override;
                u64 position() const override;
                u64 size() const override;
                void readBytes(void* buffer, u64 size) override;
                void writeBytes(const void* buffer, u64 size) override;

            private:
                File(const String& path, FILE* fp, struct stat& stat);
                ~File() = default;

                FILE* m_fp;
                struct stat m_stat;
                String m_path;
                u64 m_position;
        };
    }
}