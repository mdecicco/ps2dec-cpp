#include <decomp/io/file.h>
#include <decomp/utils/buffer.h>
#include <decomp/utils/exceptions.h>

namespace decomp {
    namespace io {
        File::File(const String& path, FILE* fp, struct stat& stat) {
            m_fp       = fp;
            m_stat     = stat;
            m_path     = path;
            m_position = 0;
        }

        File* File::open(const String& path, const char* mode) {
            struct stat fstat;
            if (stat(path.c_str(), &fstat) != 0) {
                return nullptr;
            }

            FILE* fp = fopen(path.c_str(), mode);
            if (!fp) {
                return nullptr;
            }

            return new File(path, fp, fstat);
        }

        void File::close(File* file) {
            fclose(file->m_fp);
            delete file;
        }

        void File::seek(u64 offsetInBytes) {
            if (offsetInBytes > size()) {
                throw RangeException(
                    "Offset is greater than file size (size: %d, specified offset: %d)", size(), offsetInBytes
                );
            }

            if (fseek(m_fp, offsetInBytes, SEEK_SET) != 0) {
                throw FileException(
                    "File::position() - Failed to seek to offset %d in file %s", offsetInBytes, m_path.c_str()
                );
            }

            m_position = offsetInBytes;
        }

        u64 File::position() const {
            return m_position;
        }

        u64 File::size() const {
            return m_stat.st_size;
        }

        void File::readBytes(void* buffer, u64 sz) {
            if (m_position + sz > size()) {
                throw RangeException(
                    "File::read() - Attempted to read past end of file (position: %d, size: %d, remaining size: %d)",
                    m_position,
                    sz,
                    size() - m_position
                );
            }

            if (fread(buffer, 1, sz, m_fp) != sz) {
                throw FileException("File::read() - Failed to read %d bytes from file %s", sz, m_path.c_str());
            }

            m_position += sz;
        }

        void File::writeBytes(const void* buffer, u64 sz) {
            if (fwrite(buffer, 1, sz, m_fp) != sz) {
                throw FileException("File::write() - Failed to write %d bytes to file %s", sz, m_path.c_str());
            }

            m_position += sz;
            if (m_position > size()) {
                m_stat.st_size = m_position;
            }
        }
    }
}
