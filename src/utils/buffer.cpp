#include <decomp/utils/buffer.hpp>
#include <decomp/utils/exceptions.h>
#include <decomp/utils/string.h>

namespace decomp {
    Buffer::Buffer() {
        m_canResize = true;
        m_capacity  = 4096;
        m_pos       = 0;
        m_used      = 0;
        m_data      = new u8[m_capacity];
    }

    Buffer::Buffer(u64 capacity) {
        m_canResize = capacity == 0;
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

    void Buffer::write(const void* src, u64 sz) {
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

    void Buffer::read(void* dst, u64 sz) {
        if ((m_pos + sz) > m_capacity) {
            throw RangeException("Buffer::read() - Read of %d bytes would exceed buffer capacity", sz);
        }

        memcpy(dst, m_data + m_pos, sz);
        m_pos += sz;
        if (m_pos > m_used) {
            m_used = m_pos;
        }
    }

    void Buffer::write(const Buffer* src, u64 sz) {
        if (!src) {
            throw InvalidArgumentException("Buffer::write() - Source buffer is null");
        }

        if (sz == UINT64_MAX) {
            sz = src->remaining();
        }

        if (sz == 0) {
            throw InvalidArgumentException("Buffer::write() - Source buffer has no remaining data to write");
        }

        if ((src->m_pos + sz) > src->m_capacity) {
            throw RangeException("Buffer::write() - Write of %d bytes would exceed buffer capacity", sz);
        }

        write(src->data(), sz);
    }

    void Buffer::read(Buffer* dst, u64 sz) {
        dst->write(this, sz);
    }

    void Buffer::write(const String& str) {
        static u8 n = 0;
        if (str.size() == 0) {
            write(&n, 1);
            return;
        }

        write((void*)str.c_str(), str.size());
        write(&n, 1);
    }

    String Buffer::readStr() {
        if (at_end()) {
            throw RangeException("Buffer::readStr() - No more data to read");
        }

        String str;
        char ch    = 0;
        i32 readSz = 0;
        do {
            read(&ch, 1);

            if (!ch) {
                break;
            }

            str += ch;
            readSz++;
        } while (!at_end());

        return str;
    }

    String Buffer::readStr(u32 len) {
        if ((m_pos + len) > m_capacity) {
            throw RangeException("Buffer::readStr() - Read of %d bytes would exceed buffer capacity", len);
        }

        String str;
        for (u32 i = 0; i < len; i++) {
            char ch = 0;
            read(&ch, 1);
            str += ch;
        }

        return str;
    }

    u64 Buffer::position(u64 pos) {
        if (pos >= m_capacity) {
            throw RangeException("Buffer::position() - Position %d would exceed buffer capacity", pos);
        }
        return m_pos = pos;
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

    bool Buffer::canResize() const {
        return m_canResize;
    }

    u64 Buffer::size() const {
        return m_used;
    }

    u64 Buffer::remaining() const {
        return m_used - m_pos;
    }

    u64 Buffer::capacity() const {
        return m_capacity;
    }

    u64 Buffer::position() const {
        return m_pos;
    }

    void* Buffer::data() {
        return m_data + m_pos;
    }

    const void* Buffer::data() const {
        return m_data + m_pos;
    }

    bool Buffer::at_end() const {
        return m_pos == m_used;
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