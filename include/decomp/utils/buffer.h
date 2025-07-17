#pragma once
#include <decomp/types.h>
#include <decomp/utils/stream.hpp>

namespace decomp {
    class Buffer : public IStream {
        public:
            Buffer();
            Buffer(u64 capacity, bool canResize = false);
            virtual ~Buffer();

            void seek(u64 offsetInBytes) override;
            u64 position() const override;
            u64 size() const override;
            void readBytes(void* buffer, u64 size) override;
            void writeBytes(const void* buffer, u64 size) override;

            bool canResize() const;
            u64 remaining() const;
            u64 capacity() const;

            void* data();
            const void* data() const;
            void* data(u64 offset);
            const void* data(u64 offset) const;
            void save(const String& path) const;

            static Buffer* FromFile(const String& path, bool isTextFile = false);

        protected:
            u8* m_data;
            u64 m_capacity;
            u64 m_pos;
            u64 m_used;
            bool m_canResize;
    };
};