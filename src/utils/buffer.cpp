#include <decomp/utils/buffer.h>
#include <utils/Exception.h>
#include <utils/String.h>

namespace decomp {
    Buffer::Buffer() {
        m_canResize = true;
        m_capacity  = 4096;
        m_pos       = 0;
        m_used      = 0;
        m_data      = new u8[m_capacity];
    }

    Buffer::Buffer(u64 capacity, bool canResize) {
        m_canResize = capacity == 0 || canResize;
        m_capacity  = capacity > 0 ? capacity : 4096;
        m_pos       = 0;
        m_used      = 0;
        m_data      = new u8[m_capacity];
    }

    Buffer::~Buffer() {
        if (m_data) {
            delete[] m_data;
        }

        m_data     = nullptr;
        m_capacity = 0;
        m_pos      = 0;
        m_used     = 0;
    }

    void Buffer::seek(u64 pos) {
        if (pos > m_capacity) {
            throw RangeException("Buffer::position() - Position %d would exceed buffer capacity", pos);
        }

        m_pos = pos;
    }

    u64 Buffer::position() const {
        return m_pos;
    }

    u64 Buffer::size() const {
        return m_used;
    }

    void Buffer::readBytes(void* dst, u64 sz) {
        if ((m_pos + sz) > m_capacity) {
            throw RangeException("Buffer::read() - Read of %d bytes would exceed buffer capacity", sz);
        }

        memcpy(dst, m_data + m_pos, sz);
        m_pos += sz;
        if (m_pos > m_used) {
            m_used = m_pos;
        }
    }

    void Buffer::writeBytes(const void* src, u64 sz) {
        if ((m_pos + sz) > m_capacity) {
            if (!m_canResize) {
                throw RangeException(
                    "Buffer::write() - Write of %d bytes would exceed buffer capacity and buffer cannot resize", sz
                );
            }

            m_capacity *= 2;
            u8* data = new u8[m_capacity];
            memcpy(data, m_data, m_used);
            delete[] m_data;
            m_data = data;
        }

        memcpy(m_data + m_pos, src, sz);
        m_pos += sz;
        if (m_pos > m_used) {
            m_used = m_pos;
        }
    }

    bool Buffer::canResize() const {
        return m_canResize;
    }

    u64 Buffer::remaining() const {
        return m_used - m_pos;
    }

    u64 Buffer::capacity() const {
        return m_capacity;
    }

    void* Buffer::data() {
        return m_data + m_pos;
    }

    const void* Buffer::data() const {
        return m_data + m_pos;
    }

    void* Buffer::data(u64 offset) {
        if (offset >= m_capacity) {
            throw RangeException("Buffer::data() - Offset %d would exceed buffer capacity", offset);
        }
        return m_data + offset;
    }

    const void* Buffer::data(u64 offset) const {
        if (offset >= m_capacity) {
            throw RangeException("Buffer::data() - Offset %d would exceed buffer capacity", offset);
        }
        return m_data + offset;
    }

    void Buffer::save(const String& path) const {
        if (m_used == 0 || !m_data) {
            throw InvalidActionException("Buffer::save() - Buffer is empty");
        }

        FILE* fp = nullptr;
#ifdef _MSC_VER
        fopen_s(&fp, path.c_str(), "wb");
#else
        fp = fopen(path.c_str(), "wb");
#endif
        if (!fp) {
            throw FileException("Buffer::save() - Failed to open file '%s' for writing", path.c_str());
        }

        if (fwrite(m_data, m_used, 1, fp) != 1) {
            fclose(fp);
            throw FileException("Buffer::save() - Failed to write to file '%s'", path.c_str());
        }

        fclose(fp);
    }

    Buffer* Buffer::FromFile(const String& path, bool isTextFile) {
        FILE* fp = nullptr;
#ifdef _MSC_VER
        fopen_s(&fp, path.c_str(), "rb");
#else
        fp = fopen(path.c_str(), "rb");
#endif
        if (!fp) {
            throw FileException("Buffer::FromFile() - Failed to open file '%s' for reading", path.c_str());
        }

        fseek(fp, 0, SEEK_END);
        size_t sz = ftell(fp);
        fseek(fp, 0, SEEK_SET);

        if (sz == 0) {
            fclose(fp);
            throw FileException("Buffer::FromFile() - File '%s' is empty", path.c_str());
        }

        Buffer* buf = new Buffer(sz + (isTextFile ? 1 : 0));
        if (fread(buf->data(), sz, 1, fp) != 1) {
            fclose(fp);
            delete buf;
            throw FileException("Buffer::FromFile() - Failed to read from file '%s'", path.c_str());
        }

        buf->m_used = buf->m_capacity;

        if (isTextFile) {
            buf->m_data[sz] = 0;
        }

        fclose(fp);
        return buf;
    }
};