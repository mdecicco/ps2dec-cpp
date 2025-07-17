#include <decomp/io/tagged_stream.h>
#include <decomp/utils/buffer.h>

namespace decomp {
    namespace io {
        TaggedStream::Block::Block(TaggedStream::Tag tag, u64 offset, u64 size, u32 index, IStream* stream) {
            m_tag          = tag;
            m_index        = index;
            m_offset       = offset;
            m_size         = size;
            m_position     = 0;
            m_stream       = stream;
            m_updateBuffer = nullptr;
        }

        TaggedStream::Block::Block(TaggedStream::Tag tag, u32 index) {
            m_tag          = tag;
            m_index        = index;
            m_offset       = 0;
            m_size         = 0;
            m_position     = 0;
            m_stream       = nullptr;
            m_updateBuffer = new Buffer();
        }

        TaggedStream::Block::~Block() {
            if (m_updateBuffer) {
                delete m_updateBuffer;
                m_updateBuffer = nullptr;
            }
        }

        TaggedStream::Tag TaggedStream::Block::getTag() const {
            return m_tag;
        }

        u32 TaggedStream::Block::getIndex() const {
            return m_index;
        }

        u64 TaggedStream::Block::getOffset() const {
            return m_offset;
        }

        bool TaggedStream::Block::hasChanges() const {
            return m_updateBuffer != nullptr;
        }

        void TaggedStream::Block::seek(u64 offsetInBytes) {
            if (m_updateBuffer) {
                m_updateBuffer->seek(offsetInBytes);
            } else {
                m_position = offsetInBytes;
            }
        }

        u64 TaggedStream::Block::position() const {
            if (m_updateBuffer) {
                return m_updateBuffer->position();
            } else {
                return m_position;
            }
        }

        u64 TaggedStream::Block::size() const {
            if (m_updateBuffer) {
                return m_updateBuffer->size();
            } else {
                return m_size;
            }
        }

        void TaggedStream::Block::readBytes(void* buffer, u64 size) {
            if (m_updateBuffer) {
                m_updateBuffer->readBytes(buffer, size);
            } else {
                m_stream->seek(m_offset + m_position);
                m_stream->readBytes(buffer, size);
                m_position += size;
            }
        }

        void TaggedStream::Block::writeBytes(const void* buffer, u64 size) {
            if (!m_updateBuffer) {
                m_updateBuffer = new Buffer(m_size, true);

                if (m_stream && m_size > 0) {
                    m_stream->seek(m_offset);
                    m_stream->readBytes(m_updateBuffer->data(), m_size);
                    m_updateBuffer->seek(m_position);
                }
            }

            m_updateBuffer->writeBytes(buffer, size);
        }
    }
}