#include <render/core/DataFormat.h>
#include <render/vulkan/Instance.h>
#include <render/vulkan/LogicalDevice.h>
#include <render/vulkan/PhysicalDevice.h>
#include <render/vulkan/VertexBuffer.h>

#include <utils/Array.hpp>

#define MAX_NODE_COUNT 1024
#define MIN_NODE_SIZE 3

namespace render {
    namespace vulkan {
        //
        // VertexBuffer
        //

        VertexBuffer::VertexBuffer(LogicalDevice* device, core::DataFormat* fmt, u32 vertexCapacity)
            : m_buffer(device) {
            m_device                  = device;
            m_fmt                     = fmt;
            m_capacity                = vertexCapacity;
            m_currentMaximumBlockSize = vertexCapacity;
            m_memoryMapRefCount       = 0;
            m_nodeCount               = MAX_NODE_COUNT;
        }

        VertexBuffer::~VertexBuffer() {
            shutdown();
        }

        bool VertexBuffer::init() {
            if (m_buffer.isValid()) {
                return false;
            }

            u32 alignment = m_device->getPhysicalDevice()->getProperties().limits.nonCoherentAtomSize;
            u32 capacity  = utils::AlignedAllocator::align(m_capacity * m_fmt->getSize(), alignment);

            m_allocator.init(alignment, capacity, MAX_NODE_COUNT, m_fmt->getSize() * 2);

            return m_buffer.init(
                capacity,
                VK_BUFFER_USAGE_VERTEX_BUFFER_BIT,
                VK_SHARING_MODE_EXCLUSIVE,
                VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT
            );
        }

        void VertexBuffer::shutdown() {
            for (Vertices* verts : m_allocations) {
                delete verts;
            }
            m_allocations.clear();
            m_buffer.shutdown();
            m_allocator.shutdown();
        }

        LogicalDevice* VertexBuffer::getDevice() const {
            return m_device;
        }

        core::DataFormat* VertexBuffer::getFormat() const {
            return m_fmt;
        }

        VkBuffer VertexBuffer::getBuffer() const {
            return m_buffer.get();
        }

        VkDeviceMemory VertexBuffer::getMemory() const {
            return m_buffer.getMemory();
        }

        u32 VertexBuffer::getCapacity() const {
            if (!m_buffer.isValid()) {
                return 0;
            }

            return m_capacity;
        }

        u32 VertexBuffer::getCurrentMaximumBlockSize() const {
            if (!m_buffer.isValid()) {
                return 0;
            }

            return m_allocator.getCurrentMaximumBlockSize();
        }

        Vertices* VertexBuffer::allocate(u32 count) {
            if (!m_buffer.isValid()) {
                return nullptr;
            }

            utils::AlignedAllocator::Node* n = m_allocator.allocate(count * m_fmt->getSize());
            if (!n) {
                return nullptr;
            }

            Vertices* verts = new Vertices(this, m_fmt, n);
            m_allocations.insert(verts);
            return verts;
        }

        void VertexBuffer::free(Vertices* verts) {
            if (!m_buffer.isValid() || !verts || verts->m_buffer != this) {
                return;
            }

            m_allocations.erase(verts);
            m_allocator.free(verts->m_node);
            delete verts;
        }

        //
        // Vertices
        //

        Vertices::Vertices(VertexBuffer* buf, core::DataFormat* fmt, utils::AlignedAllocator::Node* n) {
            m_buffer = buf;
            m_fmt    = fmt;
            m_node   = n;
        }

        Vertices::~Vertices() {}

        u32 Vertices::getOffset() const {
            return m_node->getOffset() / m_fmt->getSize();
        }

        u32 Vertices::getByteOffset() const {
            return m_node->getOffset();
        }

        u32 Vertices::getSize() const {
            return m_node->getRequestedSize();
        }

        u32 Vertices::getCount() const {
            return m_node->getRequestedSize() / m_fmt->getSize();
        }

        VertexBuffer* Vertices::getBuffer() const {
            return m_buffer;
        }

        void Vertices::free() {
            m_buffer->free(this);
        }

        bool Vertices::beginUpdate() {
            if (m_buffer->m_memoryMapRefCount == 0) {
                if (!m_buffer->m_buffer.map()) {
                    return false;
                }
            }

            m_buffer->m_memoryMapRefCount++;
            return true;
        }

        bool Vertices::write(void* data, u32 offset, u32 count) {
            u32 fmtSize    = m_fmt->getSize();
            u32 baseOffset = m_node->getOffset();
            u32 byteOffset = baseOffset + (offset * fmtSize);
            u32 byteSize   = count * fmtSize;

            if (byteSize > m_node->getRequestedSize()) {
                m_buffer->m_device->getInstance()->warn(
                    "Vertices::write: out of bounds write (offset: %d, count: %d, byteOffset: %d, byteSize: %d, "
                    "available range: %d-%d)",
                    offset,
                    count,
                    byteOffset,
                    byteSize,
                    baseOffset,
                    baseOffset + m_node->getRequestedSize()
                );
                return false;
            }

            return m_buffer->m_buffer.write(data, byteOffset, byteSize);
        }

        bool Vertices::commitUpdate() {
            if (m_buffer->m_memoryMapRefCount == 0) {
                m_buffer->m_device->getInstance()->warn(
                    "Vertices::commitUpdate called more times than Vertices::beginUpdate"
                );
                return false;
            }

            bool r = m_buffer->m_buffer.flush(m_node->getOffset(), m_node->getActualSize());

            m_buffer->m_memoryMapRefCount--;
            if (m_buffer->m_memoryMapRefCount == 0) {
                m_buffer->m_buffer.unmap();
            }

            return r;
        }

        //
        // VertexBufferFactory
        //

        VertexBufferFactory::VertexBufferFactory(LogicalDevice* device, u32 minBufferCapacity) {
            m_device            = device;
            m_minBufferCapacity = minBufferCapacity;
        }

        VertexBufferFactory::~VertexBufferFactory() {
            freeAll();
        }

        void VertexBufferFactory::freeAll() {
            m_formats.clear();
            m_buffers.each([](Array<VertexBuffer*>& arr) {
                arr.each([](VertexBuffer* buf) {
                    delete buf;
                });
            });
            m_buffers.clear();
        }

        Vertices* VertexBufferFactory::allocate(core::DataFormat* fmt, u32 count) {
            i32 idx = m_formats.findIndex([fmt](core::DataFormat* f) {
                return f->isEqualTo(fmt);
            });

            if (idx == -1) {
                VertexBuffer* buf = new VertexBuffer(m_device, fmt, ::decomp::max(m_minBufferCapacity, count));
                if (!buf->init()) {
                    delete buf;
                    return nullptr;
                }

                m_formats.push(fmt);
                m_buffers.push({buf});

                return buf->allocate(count);
            }

            Array<VertexBuffer*>& arr = m_buffers[u32(idx)];
            VertexBuffer* buf         = arr.find([count](VertexBuffer* b) {
                return b->getCurrentMaximumBlockSize() >= count;
            });

            if (buf) {
                return buf->allocate(count);
            }

            buf = new VertexBuffer(m_device, fmt, ::decomp::max(m_minBufferCapacity, count));
            if (!buf->init()) {
                delete buf;
                return nullptr;
            }

            arr.push(buf);
            return buf->allocate(count);
        }
    };
};