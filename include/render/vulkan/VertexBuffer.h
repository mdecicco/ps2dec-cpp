#pragma once
#include <render/types.h>
#include <render/utils/AlignedAllocator.h>
#include <render/vulkan/Buffer.h>

#include <unordered_set>
#include <utils/Array.h>
#include <vulkan/vulkan.h>

namespace render {
    namespace core {
        class DataFormat;
    };

    namespace vulkan {
        class LogicalDevice;
        class Vertices;

        class VertexBuffer {
            public:
                VertexBuffer(LogicalDevice* device, core::DataFormat* fmt, u32 vertexCapacity);
                ~VertexBuffer();

                bool init();
                void shutdown();

                LogicalDevice* getDevice() const;
                core::DataFormat* getFormat() const;
                VkBuffer getBuffer() const;
                VkDeviceMemory getMemory() const;
                u32 getCapacity() const;
                u32 getCurrentMaximumBlockSize() const;

                Vertices* allocate(u32 count);
                void free(Vertices* verts);

            private:
                friend class Vertices;

                LogicalDevice* m_device;
                utils::AlignedAllocator m_allocator;
                std::unordered_set<Vertices*> m_allocations;
                Buffer m_buffer;
                core::DataFormat* m_fmt;
                u32 m_capacity;
                u32 m_currentMaximumBlockSize;
                u32 m_nodeCount;
                u32 m_memoryMapRefCount;
        };

        class Vertices {
            public:
                u32 getOffset() const;
                u32 getByteOffset() const;
                u32 getSize() const;
                u32 getCount() const;
                VertexBuffer* getBuffer() const;
                void free();

                bool beginUpdate();
                bool write(void* data, u32 offset, u32 count);

                // will dereference null pointer if beginUpdate is not called or
                // if a beginUpdate failure is ignored
                template <typename VertexTp>
                VertexTp& at(u32 idx) {
                    return ((VertexTp*)m_buffer->m_buffer.getPointer())[idx];
                }

                bool commitUpdate();

            private:
                friend class VertexBuffer;

                Vertices(VertexBuffer* buf, core::DataFormat* fmt, utils::AlignedAllocator::Node* n);
                ~Vertices();

                VertexBuffer* m_buffer;
                core::DataFormat* m_fmt;
                utils::AlignedAllocator::Node* m_node;
        };

        class VertexBufferFactory {
            public:
                VertexBufferFactory(LogicalDevice* device, u32 minBufferCapacity);
                ~VertexBufferFactory();

                void freeAll();

                Vertices* allocate(core::DataFormat* fmt, u32 count);

            private:
                LogicalDevice* m_device;
                u32 m_minBufferCapacity;

                Array<core::DataFormat*> m_formats;
                Array<Array<VertexBuffer*>> m_buffers;
        };
    };
};