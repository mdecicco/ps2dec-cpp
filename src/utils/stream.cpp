#include <decomp/utils/stream.h>

#include <decomp/utils/buffer.h>
#include <utils/Exception.h>

namespace decomp {
    void IStream::read(void* buffer, u64 size) {
        readBytes(buffer, size);
    }

    void IStream::read(IStream& stream, u64 size) {
        if (size == 0 || stream.size() == 0) {
            return;
        }

        u8* buf = new u8[size];

        try {
            readBytes(buf, size);
            stream.writeBytes(buf, size);
        } catch (const GenericException& e) {
            delete[] buf;
            throw e;
        } catch (const std::exception& e) {
            delete[] buf;
            throw e;
        }

        delete[] buf;
    }

    void IStream::read(IStream* stream, u64 sz) {
        if (sz == 0 || stream->size() == 0) {
            return;
        }

        read(*stream, sz);
    }

    void IStream::write(const void* buffer, u64 size) {
        writeBytes(buffer, size);
    }

    void IStream::write(IStream& stream, u64 sz) {
        if (sz == UINT64_MAX) {
            sz = stream.size() - stream.position();
        }

        if (sz == 0 || stream.size() == 0) {
            return;
        }

        u8* buf = new u8[sz];

        try {
            stream.readBytes(buf, sz);
            writeBytes(buf, sz);
        } catch (const GenericException& e) {
            delete[] buf;
            throw e;
        } catch (const std::exception& e) {
            delete[] buf;
            throw e;
        }

        delete[] buf;
    }

    void IStream::write(IStream* stream, u64 sz) {
        if (sz == 0 || stream->size() == 0) {
            return;
        }

        write(*stream, sz);
    }

    void IStream::write(const String& str) {
        if (str.size() > 0) {
            writeBytes(str.c_str(), str.size());
        }

        writeBytes("\0", 1);
    }

    String IStream::readStr() {
        String str;

        while (!at_end()) {
            char ch;
            readBytes(&ch, 1);

            if (ch == '\0') {
                break;
            }
        }

        return str;
    }

    String IStream::readStr(u64 length) {
        char* buf = new char[length + 1];
        readBytes(buf, length);
        buf[length] = '\0';

        String str(buf);
        delete[] buf;
        return str;
    }

    bool IStream::at_end() const {
        return position() >= size();
    }
}
