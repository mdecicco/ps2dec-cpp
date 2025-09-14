#include <decomp/app/application.h>
#include <decomp/app/window.h>
#include <utils/Exception.h>

#include <bind/Namespace.hpp>
#include <bind/Registry.hpp>

#include <tspp/builtin/databuffer.h>
#include <tspp/utils/Callback.h>
#include <tspp/utils/Docs.h>

#include <render/vulkan/Buffer.h>
#include <render/vulkan/CommandBuffer.h>
#include <render/vulkan/CommandPool.h>
#include <render/vulkan/ComputePipeline.h>
#include <render/vulkan/DescriptorSet.h>
#include <render/vulkan/Framebuffer.h>
#include <render/vulkan/GraphicsPipeline.h>
#include <render/vulkan/Instance.h>
#include <render/vulkan/LogicalDevice.h>
#include <render/vulkan/PhysicalDevice.h>
#include <render/vulkan/Pipeline.h>
#include <render/vulkan/Queue.h>
#include <render/vulkan/QueueFamily.h>
#include <render/vulkan/RenderPass.h>
#include <render/vulkan/ShaderCompiler.h>
#include <render/vulkan/Surface.h>
#include <render/vulkan/SwapChain.h>
#include <render/vulkan/SwapChainSupport.h>
#include <render/vulkan/Texture.h>
#include <render/vulkan/UniformBuffer.h>
#include <render/vulkan/VertexBuffer.h>

#include <render/core/DataFormat.h>
#include <render/core/FrameContext.h>
#include <render/core/FrameManager.h>

#include <render/utils/SimpleDebugDraw.h>

#include <utils/Array.hpp>

using namespace render;
using namespace vulkan;
using namespace core;
using namespace render::utils;
using namespace tspp::builtin::databuffer;

namespace decomp {
    void bindEnumTypes(bind::Namespace* ns) {
        {
            bind::EnumTypeBuilder<Axis> b = ns->type<Axis>("Axis");
            b.addEnumValue("X", Axis::X_AXIS);
            b.addEnumValue("Y", Axis::Y_AXIS);
            b.addEnumValue("Z", Axis::Z_AXIS);
        }

        {
            bind::EnumTypeBuilder<EShLanguage> b = ns->type<EShLanguage>("EShLanguage");
            b.addEnumValue("Vertex", EShLanguage::EShLangVertex);
            b.addEnumValue("TessControl", EShLanguage::EShLangTessControl);
            b.addEnumValue("TessEvaluation", EShLanguage::EShLangTessEvaluation);
            b.addEnumValue("Geometry", EShLanguage::EShLangGeometry);
            b.addEnumValue("Fragment", EShLanguage::EShLangFragment);
            b.addEnumValue("Compute", EShLanguage::EShLangCompute);
            b.addEnumValue("RayGen", EShLanguage::EShLangRayGen);
            b.addEnumValue("RayGenNV", EShLanguage::EShLangRayGenNV);
            b.addEnumValue("Intersect", EShLanguage::EShLangIntersect);
            b.addEnumValue("IntersectNV", EShLanguage::EShLangIntersectNV);
            b.addEnumValue("AnyHit", EShLanguage::EShLangAnyHit);
            b.addEnumValue("AnyHitNV", EShLanguage::EShLangAnyHitNV);
            b.addEnumValue("ClosestHit", EShLanguage::EShLangClosestHit);
            b.addEnumValue("ClosestHitNV", EShLanguage::EShLangClosestHitNV);
            b.addEnumValue("Miss", EShLanguage::EShLangMiss);
            b.addEnumValue("MissNV", EShLanguage::EShLangMissNV);
            b.addEnumValue("Callable", EShLanguage::EShLangCallable);
            b.addEnumValue("CallableNV", EShLanguage::EShLangCallableNV);
            b.addEnumValue("Task", EShLanguage::EShLangTask);
            b.addEnumValue("TaskNV", EShLanguage::EShLangTaskNV);
            b.addEnumValue("Mesh", EShLanguage::EShLangMesh);
            b.addEnumValue("MeshNV", EShLanguage::EShLangMeshNV);
        }

        {
            bind::EnumTypeBuilder<DATA_TYPE> b = ns->type<DATA_TYPE>("DataType");
            b.addEnumValue("Int", DATA_TYPE::dt_int);
            b.addEnumValue("Float", DATA_TYPE::dt_float);
            b.addEnumValue("Uint", DATA_TYPE::dt_uint);
            b.addEnumValue("Vec2i", DATA_TYPE::dt_vec2i);
            b.addEnumValue("Vec2f", DATA_TYPE::dt_vec2f);
            b.addEnumValue("Vec2ui", DATA_TYPE::dt_vec2ui);
            b.addEnumValue("Vec3i", DATA_TYPE::dt_vec3i);
            b.addEnumValue("Vec3f", DATA_TYPE::dt_vec3f);
            b.addEnumValue("Vec3ui", DATA_TYPE::dt_vec3ui);
            b.addEnumValue("Vec4i", DATA_TYPE::dt_vec4i);
            b.addEnumValue("Vec4f", DATA_TYPE::dt_vec4f);
            b.addEnumValue("Vec4ui", DATA_TYPE::dt_vec4ui);
            b.addEnumValue("Mat2i", DATA_TYPE::dt_mat2i);
            b.addEnumValue("Mat2f", DATA_TYPE::dt_mat2f);
            b.addEnumValue("Mat2ui", DATA_TYPE::dt_mat2ui);
            b.addEnumValue("Mat3i", DATA_TYPE::dt_mat3i);
            b.addEnumValue("Mat3f", DATA_TYPE::dt_mat3f);
            b.addEnumValue("Mat3ui", DATA_TYPE::dt_mat3ui);
            b.addEnumValue("Mat4i", DATA_TYPE::dt_mat4i);
            b.addEnumValue("Mat4f", DATA_TYPE::dt_mat4f);
            b.addEnumValue("Mat4ui", DATA_TYPE::dt_mat4ui);
            b.addEnumValue("Struct", DATA_TYPE::dt_struct);
        }

        {
            bind::EnumTypeBuilder<PRIMITIVE_TYPE> b = ns->type<PRIMITIVE_TYPE>("PrimitiveType");
            b.addEnumValue("Points", PRIMITIVE_TYPE::PT_POINTS);
            b.addEnumValue("Lines", PRIMITIVE_TYPE::PT_LINES);
            b.addEnumValue("LineStrip", PRIMITIVE_TYPE::PT_LINE_STRIP);
            b.addEnumValue("Triangles", PRIMITIVE_TYPE::PT_TRIANGLES);
            b.addEnumValue("TriangleStrip", PRIMITIVE_TYPE::PT_TRIANGLE_STRIP);
            b.addEnumValue("TriangleFan", PRIMITIVE_TYPE::PT_TRIANGLE_FAN);
        }

        {
            bind::EnumTypeBuilder<POLYGON_MODE> b = ns->type<POLYGON_MODE>("PolygonMode");
            b.addEnumValue("Filled", POLYGON_MODE::PM_FILLED);
            b.addEnumValue("Wireframe", POLYGON_MODE::PM_WIREFRAME);
            b.addEnumValue("Points", POLYGON_MODE::PM_POINTS);
        }

        {
            bind::EnumTypeBuilder<CULL_MODE> b = ns->type<CULL_MODE>("CullMode");
            b.addEnumValue("FrontFace", CULL_MODE::CM_FRONT_FACE);
            b.addEnumValue("BackFace", CULL_MODE::CM_BACK_FACE);
            b.addEnumValue("BothFaces", CULL_MODE::CM_BOTH_FACES);
        }

        {
            bind::EnumTypeBuilder<FRONT_FACE_MODE> b = ns->type<FRONT_FACE_MODE>("FrontFaceMode");
            b.addEnumValue("Clockwise", FRONT_FACE_MODE::FFM_CLOCKWISE);
            b.addEnumValue("CounterClockwise", FRONT_FACE_MODE::FFM_COUNTER_CLOCKWISE);
        }

        {
            bind::EnumTypeBuilder<COMPARE_OP> b = ns->type<COMPARE_OP>("CompareOp");
            b.addEnumValue("Never", COMPARE_OP::CO_NEVER);
            b.addEnumValue("Always", COMPARE_OP::CO_ALWAYS);
            b.addEnumValue("Less", COMPARE_OP::CO_LESS);
            b.addEnumValue("LessOrEqual", COMPARE_OP::CO_LESS_OR_EQUAL);
            b.addEnumValue("Greater", COMPARE_OP::CO_GREATER);
            b.addEnumValue("GreaterOrEqual", COMPARE_OP::CO_GREATER_OR_EQUAL);
            b.addEnumValue("Equal", COMPARE_OP::CO_EQUAL);
            b.addEnumValue("NotEqual", COMPARE_OP::CO_NOT_EQUAL);
        }

        {
            bind::EnumTypeBuilder<BLEND_FACTOR> b = ns->type<BLEND_FACTOR>("BlendFactor");
            b.addEnumValue("Zero", BLEND_FACTOR::BF_ZERO);
            b.addEnumValue("One", BLEND_FACTOR::BF_ONE);
            b.addEnumValue("SrcColor", BLEND_FACTOR::BF_SRC_COLOR);
            b.addEnumValue("OneMinusSrcColor", BLEND_FACTOR::BF_ONE_MINUS_SRC_COLOR);
            b.addEnumValue("DstColor", BLEND_FACTOR::BF_DST_COLOR);
            b.addEnumValue("OneMinusDstColor", BLEND_FACTOR::BF_ONE_MINUS_DST_COLOR);
            b.addEnumValue("SrcAlpha", BLEND_FACTOR::BF_SRC_ALPHA);
            b.addEnumValue("OneMinusSrcAlpha", BLEND_FACTOR::BF_ONE_MINUS_SRC_ALPHA);
            b.addEnumValue("DstAlpha", BLEND_FACTOR::BF_DST_ALPHA);
            b.addEnumValue("OneMinusDstAlpha", BLEND_FACTOR::BF_ONE_MINUS_DST_ALPHA);
            b.addEnumValue("ConstantColor", BLEND_FACTOR::BF_CONSTANT_COLOR);
            b.addEnumValue("OneMinusConstantColor", BLEND_FACTOR::BF_ONE_MINUS_CONSTANT_COLOR);
            b.addEnumValue("ConstantAlpha", BLEND_FACTOR::BF_CONSTANT_ALPHA);
            b.addEnumValue("OneMinusConstantAlpha", BLEND_FACTOR::BF_ONE_MINUS_CONSTANT_ALPHA);
            b.addEnumValue("SrcAlphaSaturate", BLEND_FACTOR::BF_SRC_ALPHA_SATURATE);
            b.addEnumValue("Src1Color", BLEND_FACTOR::BF_SRC1_COLOR);
            b.addEnumValue("OneMinusSrc1Color", BLEND_FACTOR::BF_ONE_MINUS_SRC1_COLOR);
            b.addEnumValue("Src1Alpha", BLEND_FACTOR::BF_SRC1_ALPHA);
            b.addEnumValue("OneMinusSrc1Alpha", BLEND_FACTOR::BF_ONE_MINUS_SRC1_ALPHA);
        }

        {
            bind::EnumTypeBuilder<BLEND_OP> b = ns->type<BLEND_OP>("BlendOp");
            b.addEnumValue("Add", BLEND_OP::BO_ADD);
            b.addEnumValue("Subtract", BLEND_OP::BO_SUBTRACT);
            b.addEnumValue("ReverseSubtract", BLEND_OP::BO_REVERSE_SUBTRACT);
            b.addEnumValue("Min", BLEND_OP::BO_MIN);
            b.addEnumValue("Max", BLEND_OP::BO_MAX);
        }
    }

    void bindBufferInterface() {
        bind::ObjectTypeBuilder<render::vulkan::Buffer> b = bind::extend<render::vulkan::Buffer>();

        auto write = +[](render::vulkan::Buffer* self, DataBuffer* src, u64 offset, u64 size) {
            if (src->size() < size) {
                throw RangeException("Buffer only has %d bytes, but %d bytes were requested", src->size(), size);
            }

            return self->write(src->data(), offset, size);
        };

        auto read = +[](render::vulkan::Buffer* self, u64 offset, u64 size, bool fetchFromDevice) {
            DataBuffer dst(size);
            if (!self->read(offset, size, dst.data(), fetchFromDevice)) {
                throw GenericException("Failed to read %d bytes from buffer at offset %d", size, offset);
            }

            return dst;
        };

        b.ctor<LogicalDevice*>();
        b.dtor();

        tspp::describe(b.method("getDevice", &render::vulkan::Buffer::getDevice))
            .desc("Get the logical device associated with the buffer");
        tspp::describe(b.method("getHandle", &render::vulkan::Buffer::get)).desc("Get internal handle to the buffer");
        tspp::describe(b.method("getMemory", &render::vulkan::Buffer::getMemory))
            .desc("Get internal handle to the memory of the buffer");
        tspp::describe(b.method("getUsage", &render::vulkan::Buffer::getUsage))
            .desc("Get the usage flags of the buffer");
        tspp::describe(b.method("getSharingMode", &render::vulkan::Buffer::getSharingMode))
            .desc("Get the sharing mode of the buffer");
        tspp::describe(b.method("getMemoryFlags", &render::vulkan::Buffer::getMemoryFlags))
            .desc("Get the memory flags of the buffer");
        tspp::describe(b.method("setupMemoryRange", &render::vulkan::Buffer::getRange))
            .desc("Set up a memory range object given an offset and size")
            .param(0, "offset", "The offset of the memory range")
            .param(1, "size", "The size of the memory range")
            .param(2, "range", "The memory range object to set up");
        tspp::describe(b.method("getSize", &render::vulkan::Buffer::getSize)).desc("Get the size of the buffer");
        tspp::describe(b.method("isValid", &render::vulkan::Buffer::isValid)).desc("Check if the buffer is valid");
        tspp::describe(b.method("map", &render::vulkan::Buffer::map))
            .desc("Map the buffer, making it available for reading.");
        tspp::describe(b.method("flush", &render::vulkan::Buffer::flush))
            .desc("Flush the buffer")
            .param(0, "offset", "The offset of the buffer to start flushing from")
            .param(1, "size", "The number of bytes to flush");
        tspp::describe(b.pseudoMethod("write", write))
            .desc("Write to the buffer")
            .param(0, "src", "The source data to write")
            .param(1, "offset", "The offset of the buffer to write from")
            .param(2, "size", "The number of bytes to write from the source data");
        tspp::describe(b.pseudoMethod("read", read))
            .desc("Read from the buffer")
            .param(0, "offset", "The offset in the buffer to read from")
            .param(1, "size", "The number of bytes to read")
            .param(2, "fetchFromDevice", "Whether to fetch the data from the device")
            .returns("An ArrayBuffer containing the data read from the buffer");
        tspp::describe(b.method("fetch", &render::vulkan::Buffer::fetch))
            .desc("Fetch the buffer from the device, making it available for reading.")
            .param(0, "offset", "The offset in the buffer to fetch from")
            .param(1, "size", "The number of bytes to fetch");
        tspp::describe(b.method("unmap", &render::vulkan::Buffer::unmap))
            .desc("Unmap the buffer, making it unavailable for reading.");
        tspp::describe(b.method("init", &render::vulkan::Buffer::init))
            .desc("Initialize the buffer")
            .param(0, "size", "The size of the buffer")
            .param(1, "usageFlags", "The usage flags of the buffer")
            .param(2, "sharingMode", "The sharing mode of the buffer")
            .param(3, "memoryFlags", "The memory flags of the buffer");
        tspp::describe(b.method("shutdown", &render::vulkan::Buffer::shutdown)).desc("Shut down the buffer");
    }

    void bindCommandBufferInterface() {
        bind::ObjectTypeBuilder<CommandBuffer> b = bind::extend<CommandBuffer>();

        auto updatePushConstants = +[](CommandBuffer* self, u32 offset, DataBuffer* data, VkShaderStageFlags stages) {
            self->updatePushConstants(offset, data->size(), data->data(), stages);
        };

        tspp::describe(b.method("getHandle", &CommandBuffer::get))
            .desc("Get the handle associated with the command buffer.");
        tspp::describe(b.method("getPool", &CommandBuffer::getPool))
            .desc("Get the command pool associated with the command buffer.");
        tspp::describe(b.method("begin", &CommandBuffer::begin))
            .desc("Begin the command buffer.")
            .param(0, "flags", "The flags to use when beginning the command buffer.");
        tspp::describe(b.method("end", &CommandBuffer::end)).desc("End the command buffer.");
        tspp::describe(b.method("reset", &CommandBuffer::reset)).desc("Reset the command buffer.");
        tspp::describe(b.method("beginRenderPass", &CommandBuffer::beginRenderPass))
            .desc("Begin a render pass.")
            .param(0, "pipeline", "The graphics pipeline to use for the render pass.")
            .param(1, "target", "The framebuffer to render to.");
        tspp::describe(b.method("endRenderPass", &CommandBuffer::endRenderPass)).desc("End the render pass.");
        tspp::describe(b.method("bindPipeline", &CommandBuffer::bindPipeline))
            .desc("Bind a pipeline to the command buffer.")
            .param(0, "pipeline", "The pipeline to bind.")
            .param(1, "bindPoint", "The bind point to use for the pipeline.");
        tspp::describe(b.method("bindDescriptorSet", &CommandBuffer::bindDescriptorSet))
            .desc("Bind a descriptor set to the command buffer.")
            .param(0, "set", "The descriptor set to bind.")
            .param(1, "bindPoint", "The bind point to use for the descriptor set.");
        tspp::describe(b.method<void, VertexBuffer*>("bindVertexBuffer", &CommandBuffer::bindVertexBuffer))
            .desc("Bind a vertex buffer to the command buffer.")
            .param(0, "vbo", "The vertex buffer to bind.")
            .param(1, "offset", "The byte offset of the vertex buffer to start reading from.");
        tspp::describe(
            b.method<void, render::vulkan::Buffer*>("bindVertexStorageBuffer", &CommandBuffer::bindVertexBuffer)
        )
            .desc("Bind a vertex storage buffer to the command buffer.")
            .param(0, "vbo", "The vertex storage buffer to bind.")
            .param(1, "offset", "The byte offset of the vertex storage buffer to start reading from.");
        tspp::describe(b.method("setViewport", &CommandBuffer::setViewport))
            .desc("Set the viewport of the command buffer.")
            .param(0, "x", "The x-coordinate of the viewport.")
            .param(1, "y", "The y-coordinate of the viewport.")
            .param(2, "w", "The width of the viewport.")
            .param(3, "h", "The height of the viewport.")
            .param(4, "minZ", "The minimum depth of the viewport.")
            .param(5, "maxZ", "The maximum depth of the viewport.");
        tspp::describe(b.method("setScissor", &CommandBuffer::setScissor))
            .desc("Set the scissor of the command buffer.")
            .param(0, "x", "The x-coordinate of the scissor.")
            .param(1, "y", "The y-coordinate of the scissor.")
            .param(2, "w", "The width of the scissor.")
            .param(3, "h", "The height of the scissor.");
        tspp::describe(b.pseudoMethod("updatePushConstants", updatePushConstants))
            .desc("Update the push constants for the next draw call.")
            .param(0, "offset", "The offset into the push constants to write to.")
            .param(1, "data", "The data to write to the push constants.")
            .param(2, "stages", "The shader stages that will use the updated push constants.");
        tspp::describe(b.method<void, Vertices*>("drawAll", &CommandBuffer::draw))
            .desc("Draw a set of vertices.")
            .param(0, "vertices", "The vertices to draw.");
        tspp::describe(b.method<void, u32, u32, u32, u32>("drawSubset", &CommandBuffer::draw))
            .desc("Draw a subset of the bound vertices.")
            .param(0, "vertexCount", "The number of vertices to draw.")
            .param(1, "firstVertex", "The first vertex to draw.")
            .param(2, "instanceCount", "The number of instances to draw.")
            .param(3, "firstInstance", "The first instance to draw.");
    }

    void bindCommandPoolInterface() {
        bind::ObjectTypeBuilder<CommandPool> b = bind::extend<CommandPool>();

        b.ctor<LogicalDevice*, const QueueFamily*>();
        b.dtor();

        tspp::describe(b.method("init", &CommandPool::init))
            .desc("Initialize the command pool.")
            .param(0, "flags", "The flags to use when initializing the command pool.");
        tspp::describe(b.method("shutdown", &CommandPool::shutdown)).desc("Shut down the command pool.");
        tspp::describe(b.method("getHandle", &CommandPool::get))
            .desc("Get the handle associated with the command pool.");
        tspp::describe(b.method("getFamily", &CommandPool::getFamily))
            .desc("Get the queue family associated with the command pool.");
        tspp::describe(b.method("getFlags", &CommandPool::getFlags))
            .desc("Get the flags used when initializing the command pool.");
        tspp::describe(b.method("createBuffer", &CommandPool::createBuffer))
            .desc("Create a command buffer.")
            .param(0, "primary", "Whether the command buffer is primary.");
        tspp::describe(b.method("freeBuffer", &CommandPool::freeBuffer))
            .desc("Free a command buffer.")
            .param(0, "buffer", "The command buffer to free.");
    }

    void bindComputePipelineInterface() {
        bind::ObjectTypeBuilder<ComputePipeline> b = bind::extend<ComputePipeline>();
        b.baseType<IWithLogging>();

        b.ctor<ShaderCompiler*, LogicalDevice*>();
        b.dtor();

        tspp::describe(b.method("setComputeShader", &ComputePipeline::setComputeShader))
            .desc("Set the compute shader of the compute pipeline.")
            .param(0, "source", "The source code of the compute shader.");
        tspp::describe(b.method("addUniformBlock", &ComputePipeline::addUniformBlock))
            .desc("Add a uniform block to the compute pipeline.")
            .param(0, "bindIndex", "The bind index of the uniform block.");
        tspp::describe(b.method("addStorageBuffer", &ComputePipeline::addStorageBuffer))
            .desc("Add a storage buffer to the compute pipeline.")
            .param(0, "bindIndex", "The bind index of the storage buffer.");
        tspp::describe(b.method("init", &ComputePipeline::init)).desc("Initialize the compute pipeline.");
        tspp::describe(b.method("shutdown", &ComputePipeline::shutdown)).desc("Shut down the compute pipeline.");
        tspp::describe(b.method("recreate", &ComputePipeline::recreate)).desc("Recreate the compute pipeline.");
        tspp::describe(b.method("getLayout", &ComputePipeline::getLayout))
            .desc("Get the layout of the compute pipeline.");
        tspp::describe(b.method("getDescriptorSetLayout", &ComputePipeline::getDescriptorSetLayout))
            .desc("Get the descriptor set layout of the compute pipeline.");
    }

    void bindDescriptorPoolInterface() {
        bind::ObjectTypeBuilder<DescriptorPool> b = bind::extend<DescriptorPool>();

        tspp::describe(b.ctor<LogicalDevice*, u32>())
            .desc("Create a descriptor pool.")
            .param(0, "device", "The logical device to create the descriptor pool on.")
            .param(1, "maxSets", "The maximum number of descriptor sets that can be allocated from the pool.");
        b.dtor();

        tspp::describe(b.method("getDevice", &DescriptorPool::getDevice))
            .desc("Get the logical device associated with the descriptor pool.");
        tspp::describe(b.method("getCapacity", &DescriptorPool::getCapacity))
            .desc("Get the capacity of the descriptor pool.");
        tspp::describe(b.method("getRemaining", &DescriptorPool::getRemaining))
            .desc("Get the remaining number of descriptor sets in the pool.");
        tspp::describe(b.method("init", &DescriptorPool::init)).desc("Initialize the descriptor pool.");
        tspp::describe(b.method("shutdown", &DescriptorPool::shutdown)).desc("Shut down the descriptor pool.");
        tspp::describe(b.method("allocate", &DescriptorPool::allocate))
            .desc("Allocate a descriptor set from the pool.")
            .param(0, "pipeline", "The pipeline to allocate the descriptor set for.");
        tspp::describe(b.method("free", &DescriptorPool::free))
            .desc("Free a descriptor set from the pool.")
            .param(0, "descriptorSet", "The descriptor set to free.");
    }

    void bindDescriptorSetInterface() {
        bind::ObjectTypeBuilder<DescriptorSet> b = bind::extend<DescriptorSet>();

        tspp::describe(b.method("getPool", &DescriptorSet::getPool))
            .desc("Get the descriptor pool associated with the descriptor set.");
        tspp::describe(b.method("getHandle", &DescriptorSet::get))
            .desc("Get the internal handle to the VkDescriptorSet");
        tspp::describe(b.method<void, Texture*, u32>("addTexture", &DescriptorSet::add))
            .desc("Add a texture to the descriptor set.")
            .param(0, "texture", "The texture to add.")
            .param(1, "bindIndex", "The bind index of the texture.");
        tspp::describe(b.method<void, UniformObject*, u32>("addUniformObject", &DescriptorSet::add))
            .desc("Add a uniform object to the descriptor set.")
            .param(0, "uniformObject", "The uniform object to add.")
            .param(1, "bindIndex", "The bind index of the uniform buffer object.");
        tspp::describe(b.method<void, render::vulkan::Buffer*, u32>("addStorageBuffer", &DescriptorSet::add))
            .desc("Add a storage buffer to the descriptor set.")
            .param(0, "storageBuffer", "The storage buffer to add.")
            .param(1, "bindIndex", "The bind index of the storage buffer.");
        tspp::describe(b.method("update", &DescriptorSet::update)).desc("Update the descriptor set.");
        tspp::describe(b.method("free", &DescriptorSet::free)).desc("Free the descriptor set.");
    }

    void bindDescriptorFactoryInterface() {
        bind::ObjectTypeBuilder<DescriptorFactory> b = bind::extend<DescriptorFactory>();

        tspp::describe(b.ctor<LogicalDevice*, u32>())
            .desc("Creates a descriptor factory")
            .param(0, "device", "The logical device to create the descriptor factory for.")
            .param(1, "maxSetsPerPool", "The maximum number of descriptor sets that can be allocated from each pool.");
        b.dtor();

        tspp::describe(b.method("allocate", &DescriptorFactory::allocate))
            .desc("Allocate a descriptor set from the factory.")
            .param(0, "pipeline", "The pipeline to allocate the descriptor set for.");
    }

    void bindFramebufferInterface() {
        bind::ObjectTypeBuilder<Framebuffer::attachment> fba = bind::extend<Framebuffer::attachment>();
        fba.prop("view", &Framebuffer::attachment::view);
        fba.prop("format", &Framebuffer::attachment::format);
        // todo: union types
        // fba.prop("clearValue", &Framebuffer::attachment::clearValue);

        bind::ObjectTypeBuilder<Framebuffer> b = bind::extend<Framebuffer>();

        b.ctor<RenderPass*>();
        b.dtor();

        tspp::describe(b.method("getHandle", &Framebuffer::get)).desc("Get the internal handle to the VkFramebuffer");
        tspp::describe(b.method("getAttachments", &Framebuffer::getAttachments))
            .desc("Get the framebuffer attachments.");
        tspp::describe(b.method<void, u32, const vec4f&>("setClearColorF", &Framebuffer::setClearColor))
            .desc("Set the clear color of the framebuffer.")
            .param(0, "attachmentIdx", "The index of the attachment to clear.")
            .param(1, "clearColor", "The clear color to use.");
        tspp::describe(b.method<void, u32, const vec4ui&>("setClearColorU", &Framebuffer::setClearColor))
            .desc("Set the clear color of the framebuffer.")
            .param(0, "attachmentIdx", "The index of the attachment to clear.")
            .param(1, "clearColor", "The clear color to use.");
        tspp::describe(b.method<void, u32, const vec4i&>("setClearColorI", &Framebuffer::setClearColor))
            .desc("Set the clear color of the framebuffer.")
            .param(0, "attachmentIdx", "The index of the attachment to clear.")
            .param(1, "clearColor", "The clear color to use.");
        tspp::describe(b.method("setClearDepthStencil", &Framebuffer::setClearDepthStencil))
            .desc("Set the clear depth and stencil values of the framebuffer.")
            .param(0, "attachmentIdx", "The index of the attachment to clear.")
            .param(1, "clearDepth", "The clear depth value to use.")
            .param(2, "clearStencil", "The clear stencil value to use.");
        tspp::describe(
            b.method<Framebuffer::attachment&, VkImageView, VkFormat>("attachImageView", &Framebuffer::attach)
        )
            .desc("Attach an image view to the framebuffer.")
            .param(0, "view", "The image view to attach.")
            .param(1, "format", "The format of the image view.");
        tspp::describe(b.method<Framebuffer::attachment&, Texture*>("attachTexture", &Framebuffer::attach))
            .desc("Attach a texture to the framebuffer.")
            .param(0, "texture", "The texture to attach.");
        tspp::describe(b.method("init", &Framebuffer::init))
            .desc("Initialize the framebuffer.")
            .param(0, "dimensions", "The dimensions of the framebuffer.");
        tspp::describe(b.method("shutdown", &Framebuffer::shutdown)).desc("Shut down the framebuffer.");
    }

    void bindPipelineInterface() {
        bind::ObjectTypeBuilder<Pipeline> b = bind::extend<Pipeline>();

        b.ctor<LogicalDevice*>();
        b.dtor();

        tspp::describe(b.method("getHandle", &Pipeline::get)).desc("Get the internal handle to the VkPipeline");
        tspp::describe(b.method("getLayout", &Pipeline::getLayout)).desc("Get the handle to the VkPipelineLayout.");
        tspp::describe(b.method("getDescriptorSetLayout", &Pipeline::getDescriptorSetLayout))
            .desc("Get the handle to the VkDescriptorSetLayout.");
    }

    void bindGraphicsPipelineInterface() {
        bind::ObjectTypeBuilder<GraphicsPipeline> b = bind::extend<GraphicsPipeline>();
        b.baseType<Pipeline>();
        b.baseType<IWithLogging>();

        b.ctor<ShaderCompiler*, LogicalDevice*, SwapChain*, RenderPass*>();
        b.dtor();

        tspp::describe(b.method("reset", &GraphicsPipeline::reset)).desc("Reset the graphics pipeline.");
        tspp::describe(b.method("addSampler", &GraphicsPipeline::addSampler))
            .desc("Add a sampler to the graphics pipeline.")
            .param(0, "bindIndex", "The bind index of the sampler.")
            .param(1, "stages", "The shader stages to add the sampler to.");
        tspp::describe(b.method("addUniformBlock", &GraphicsPipeline::addUniformBlock))
            .desc("Add a uniform block to the graphics pipeline.")
            .param(0, "bindIndex", "The bind index of the uniform block.")
            .param(1, "fmt", "The format of the uniform block.")
            .param(2, "stages", "The shader stages to add the uniform block to.");
        tspp::describe(b.method("addStorageBuffer", &GraphicsPipeline::addStorageBuffer))
            .desc("Add a storage buffer to the graphics pipeline.")
            .param(0, "bindIndex", "The bind index of the storage buffer.")
            .param(1, "stages", "The shader stages to add the storage buffer to.");
        tspp::describe(b.method("setPushConstantFormat", &GraphicsPipeline::setPushConstantFormat))
            .desc("Set the push constant format of the graphics pipeline.")
            .param(0, "fmt", "The format of the push constant.");
        tspp::describe(b.method("setVertexFormat", &GraphicsPipeline::setVertexFormat))
            .desc("Set the vertex format of the graphics pipeline.")
            .param(0, "fmt", "The format of the vertices supported by the pipeline.");
        tspp::describe(b.method("setVertexShader", &GraphicsPipeline::setVertexShader))
            .desc("Set the vertex shader of the graphics pipeline.")
            .param(0, "source", "The source code of the vertex shader.");
        tspp::describe(b.method("setFragmentShader", &GraphicsPipeline::setFragmentShader))
            .desc("Set the fragment shader of the graphics pipeline.")
            .param(0, "source", "The source code of the fragment shader.");
        tspp::describe(b.method("setGeometryShader", &GraphicsPipeline::setGeometryShader))
            .desc("Set the geometry shader of the graphics pipeline.")
            .param(0, "source", "The source code of the geometry shader.");
        tspp::describe(b.method("addDynamicState", &GraphicsPipeline::addDynamicState))
            .desc("Add a dynamic state to the graphics pipeline.")
            .param(0, "state", "The dynamic state to add.");
        tspp::describe(b.method("setViewport", &GraphicsPipeline::setViewport))
            .desc("Set the viewport of the graphics pipeline.")
            .param(0, "x", "The x-coordinate of the viewport.")
            .param(1, "y", "The y-coordinate of the viewport.")
            .param(2, "w", "The width of the viewport.")
            .param(3, "h", "The height of the viewport.")
            .param(4, "minZ", "The minimum depth of the viewport.")
            .param(5, "maxZ", "The maximum depth of the viewport.");
        tspp::describe(b.method("setScissor", &GraphicsPipeline::setScissor))
            .desc("Set the scissor of the graphics pipeline.")
            .param(0, "x", "The x-coordinate of the scissor.")
            .param(1, "y", "The y-coordinate of the scissor.")
            .param(2, "w", "The width of the scissor.")
            .param(3, "h", "The height of the scissor.");
        tspp::describe(b.method("setPrimitiveType", &GraphicsPipeline::setPrimitiveType))
            .desc("Set the primitive type of the graphics pipeline.")
            .param(0, "ptype", "The primitive type to set.");
        tspp::describe(b.method("setPrimitiveRestart", &GraphicsPipeline::setPrimitiveRestart))
            .desc("Set the primitive restart of the graphics pipeline.")
            .param(0, "enabled", "Whether to enable primitive restart.");
        tspp::describe(b.method("setPolygonMode", &GraphicsPipeline::setPolygonMode))
            .desc("Set the polygon mode of the graphics pipeline.")
            .param(0, "pmode", "The polygon mode to set.");
        tspp::describe(b.method("setDepthClamp", &GraphicsPipeline::setDepthClamp))
            .desc("Set the depth clamp of the graphics pipeline.")
            .param(0, "enabled", "Whether to enable depth clamp.");
        tspp::describe(b.method("setLineWidth", &GraphicsPipeline::setLineWidth))
            .desc("Set the line width of the graphics pipeline.")
            .param(0, "width", "The width of the line.");
        tspp::describe(b.method("setCullMode", &GraphicsPipeline::setCullMode))
            .desc("Set the cull mode of the graphics pipeline.")
            .param(0, "cmode", "The cull mode to set.");
        tspp::describe(b.method("setFrontFaceMode", &GraphicsPipeline::setFrontFaceMode))
            .desc("Set the front face mode of the graphics pipeline.")
            .param(0, "ffmode", "The front face mode to set.");
        tspp::describe(b.method("setDepthCompareOp", &GraphicsPipeline::setDepthCompareOp))
            .desc("Set the depth compare op of the graphics pipeline.")
            .param(0, "op", "The depth compare op to set.");
        tspp::describe(b.method("setDepthBounds", &GraphicsPipeline::setDepthBounds))
            .desc("Set the depth bounds of the graphics pipeline.")
            .param(0, "min", "The minimum depth bound.")
            .param(1, "max", "The maximum depth bound.");
        tspp::describe(b.method("setDepthTestEnabled", &GraphicsPipeline::setDepthTestEnabled))
            .desc("Set the depth test enabled of the graphics pipeline.")
            .param(0, "enabled", "Whether to enable depth test.");
        tspp::describe(b.method("setDepthBoundsTestEnabled", &GraphicsPipeline::setDepthBoundsTestEnabled))
            .desc("Set the depth bounds test enabled of the graphics pipeline.")
            .param(0, "enabled", "Whether to enable depth bounds test.");
        tspp::describe(b.method("setDepthWriteEnabled", &GraphicsPipeline::setDepthWriteEnabled))
            .desc("Set the depth write enabled of the graphics pipeline.")
            .param(0, "enabled", "Whether to enable depth write.");
        tspp::describe(b.method("setSrcColorBlendFactor", &GraphicsPipeline::setSrcColorBlendFactor))
            .desc("Set the src color blend factor of the graphics pipeline.")
            .param(0, "factor", "The src color blend factor to set.");
        tspp::describe(b.method("setDstColorBlendFactor", &GraphicsPipeline::setDstColorBlendFactor))
            .desc("Set the dst color blend factor of the graphics pipeline.")
            .param(0, "factor", "The dst color blend factor to set.");
        tspp::describe(b.method("setColorBlendOp", &GraphicsPipeline::setColorBlendOp))
            .desc("Set the color blend op of the graphics pipeline.")
            .param(0, "op", "The color blend op to set.");
        tspp::describe(b.method("setSrcAlphaBlendFactor", &GraphicsPipeline::setSrcAlphaBlendFactor))
            .desc("Set the src alpha blend factor of the graphics pipeline.")
            .param(0, "factor", "The src alpha blend factor to set.");
        tspp::describe(b.method("setDstAlphaBlendFactor", &GraphicsPipeline::setDstAlphaBlendFactor))
            .desc("Set the dst alpha blend factor of the graphics pipeline.")
            .param(0, "factor", "The dst alpha blend factor to set.");
        tspp::describe(b.method("setAlphaBlendOp", &GraphicsPipeline::setAlphaBlendOp))
            .desc("Set the alpha blend op of the graphics pipeline.")
            .param(0, "op", "The alpha blend op to set.");
        tspp::describe(b.method("setColorBlendEnabled", &GraphicsPipeline::setColorBlendEnabled))
            .desc("Set the color blend enabled of the graphics pipeline.")
            .param(0, "enabled", "Whether to enable color blend.");
        tspp::describe(b.method("setSampleCount", &GraphicsPipeline::setSampleCount))
            .desc("Set the sample count of the graphics pipeline.")
            .param(0, "sampleCount", "The sample count to set.");
        tspp::describe(b.method("init", &GraphicsPipeline::init)).desc("Initialize the graphics pipeline.");
        tspp::describe(b.method("shutdown", &GraphicsPipeline::shutdown)).desc("Shut down the graphics pipeline");
        tspp::describe(b.method("recreate", &GraphicsPipeline::recreate)).desc("Recreate the graphics pipeline");
        tspp::describe(b.method("getRenderPass", &GraphicsPipeline::getRenderPass))
            .desc("Gets the render pass associated with the graphics pipeline");
        tspp::describe(b.method("getSwapChain", &GraphicsPipeline::getSwapChain))
            .desc("Gets the swap chain associated with the graphics pipeline");
    }

    void bindInstanceInterface() {
        bind::ObjectTypeBuilder<Instance> b = bind::extend<Instance>();
        b.baseType<IWithLogging>();

        b.ctor();
        b.dtor();

        tspp::describe(b.method("enableValidation", &Instance::enableValidation))
            .desc("Enable validation layers for the instance.");
        tspp::describe(b.method("setApplicationName", &Instance::setApplicationName))
            .desc("Set the application name for the instance.");
        tspp::describe(b.method("setApplicationVersion", &Instance::setApplicationVersion))
            .desc("Set the application version for the instance.")
            .param(0, "major", "The major version of the application.")
            .param(1, "minor", "The minor version of the application.")
            .param(2, "patch", "The patch version of the application.");
        tspp::describe(b.method("setEngineName", &Instance::setEngineName))
            .desc("Set the engine name for the instance.")
            .param(0, "name", "The name of the engine.");
        tspp::describe(b.method("setEngineVersion", &Instance::setEngineVersion))
            .desc("Set the engine version for the instance.")
            .param(0, "major", "The major version of the engine.")
            .param(1, "minor", "The minor version of the engine.")
            .param(2, "patch", "The patch version of the engine.");
        tspp::describe(b.method("enableExtension", &Instance::enableExtension))
            .desc("Enable an extension for the instance.")
            .param(0, "name", "The name of the extension to enable.");
        tspp::describe(b.method("enableLayer", &Instance::enableLayer))
            .desc("Enable a layer for the instance.")
            .param(0, "name", "The name of the layer to enable.");
        tspp::describe(b.method("isExtensionAvailable", &Instance::isExtensionAvailable))
            .desc("Check if an extension is available for the instance.")
            .param(0, "name", "The name of the extension to check.");
        tspp::describe(b.method("isLayerAvailable", &Instance::isLayerAvailable))
            .desc("Check if a layer is available for the instance.")
            .param(0, "name", "The name of the layer to check.");
        tspp::describe(b.method("isExtensionEnabled", &Instance::isExtensionEnabled))
            .desc("Check if an extension is enabled for the instance.")
            .param(0, "name", "The name of the extension to check.");
        tspp::describe(b.method("isLayerEnabled", &Instance::isLayerEnabled))
            .desc("Check if a layer is enabled for the instance.")
            .param(0, "name", "The name of the layer to check.");
        tspp::describe(b.method("isValidationEnabled", &Instance::isValidationEnabled))
            .desc("Check if validation is enabled for the instance.");
        tspp::describe(b.method("isInitialized", &Instance::isInitialized))
            .desc("Check if the instance is initialized.");
        tspp::describe(b.method("initialize", &Instance::initialize)).desc("Initialize the instance.");
        tspp::describe(b.method("shutdown", &Instance::shutdown))
            .desc("Shut down the instance.")
            .param(0, "doResetConfiguration", "Whether to reset the configuration.");
        tspp::describe(b.method("getHandle", &Instance::get)).desc("Get the internal handle to the VkInstance");
        tspp::describe(b.method("getAllocator", &Instance::getAllocator))
            .desc("Get the allocator associated with the instance.");
    }

    void bindLogicalDeviceInterface() {
        bind::ObjectTypeBuilder<LogicalDevice> b = bind::extend<LogicalDevice>();

        b.ctor<PhysicalDevice*>();
        b.dtor();

        tspp::describe(b.method("isInitialized", &LogicalDevice::isInitialized))
            .desc("Check if the logical device is initialized");
        tspp::describe(b.method("enableExtension", &LogicalDevice::enableExtension))
            .desc("Enable an extension for the logical device.")
            .param(0, "name", "The name of the extension to enable.");
        tspp::describe(b.method("isExtensionEnabled", &LogicalDevice::isExtensionEnabled))
            .desc("Check if an extension is enabled for the logical device.")
            .param(0, "name", "The name of the extension to check.");
        tspp::describe(b.method("enableLayer", &LogicalDevice::enableLayer))
            .desc("Enable a layer for the logical device.")
            .param(0, "name", "The name of the layer to enable.");
        tspp::describe(b.method("isLayerEnabled", &LogicalDevice::isLayerEnabled))
            .desc("Check if a layer is enabled for the logical device.")
            .param(0, "name", "The name of the layer to check.");
        tspp::describe(b.method("waitForIdle", &LogicalDevice::waitForIdle))
            .desc("Wait for the logical device to idle");
        tspp::describe(b.method("init", &LogicalDevice::init))
            .desc("Initialize the logical device.")
            .param(0, "needsGraphics", "Whether the logical device needs graphics support.")
            .param(1, "needsCompute", "Whether the logical device needs compute support.")
            .param(2, "needsTransfer", "Whether the logical device needs transfer support.")
            .param(3, "surface", "The surface to present to.");
        tspp::describe(b.method("shutdown", &LogicalDevice::shutdown)).desc("Shut down the logical device.");
        tspp::describe(b.method("getHandle", &LogicalDevice::get)).desc("Get the internal handle to the VkDevice");
        tspp::describe(b.method("getPhysicalDevice", &LogicalDevice::getPhysicalDevice))
            .desc("Get the physical device associated with this logical device");
        tspp::describe(b.method("getInstance", &LogicalDevice::getInstance))
            .desc("Get the instance associated with this logical device");
        tspp::describe(b.method("getQueues", &LogicalDevice::getQueues))
            .desc("Get the queues supported by this logical device");
        tspp::describe(b.method("getPresentationQueue", &LogicalDevice::getPresentationQueue))
            .desc("Get the presentation queue of the logical device, if one exists");
        tspp::describe(b.method("getComputeQueue", &LogicalDevice::getComputeQueue))
            .desc("Get the compute queue of the logical device, if one exists");
        tspp::describe(b.method("getGraphicsQueue", &LogicalDevice::getGraphicsQueue))
            .desc("Get the graphics queue of the logical device, if one exists");
    }

    void bindPhysicalDeviceInterface() {
        bind::ObjectTypeBuilder<PhysicalDevice> b = bind::extend<PhysicalDevice>();

        b.ctor<const PhysicalDevice&>();
        b.dtor();

        tspp::describe(b.staticMethod("list", &PhysicalDevice::list))
            .desc("List the available physical devices.")
            .param(0, "instance", "The instance to list the physical devices for.");
        tspp::describe(b.method("getName", &PhysicalDevice::getName)).desc("Get the name of the physical device.");
        tspp::describe(b.method("isDiscrete", &PhysicalDevice::isDiscrete))
            .desc("Check if the physical device is discrete.");
        tspp::describe(b.method("isVirtual", &PhysicalDevice::isVirtual))
            .desc("Check if the physical device is virtual.");
        tspp::describe(b.method("isIntegrated", &PhysicalDevice::isIntegrated))
            .desc("Check if the physical device is integrated.");
        tspp::describe(b.method("isCPU", &PhysicalDevice::isCPU)).desc("Check if the physical device is a CPU.");
        tspp::describe(b.method("isExtensionAvailable", &PhysicalDevice::isExtensionAvailable))
            .desc("Check if an extension is available for the physical device.");
        tspp::describe(b.method("isLayerAvailable", &PhysicalDevice::isLayerAvailable))
            .desc("Check if a layer is available for the physical device.");
        tspp::describe(b.method("canPresentToSurface", &PhysicalDevice::canPresentToSurface))
            .desc("Check if the physical device can present to a surface.")
            .param(0, "surface", "The surface to check.")
            .param(1, "queueFamily", "The queue family to check.");
        tspp::describe(b.method("getSurfaceSwapChainSupport", &PhysicalDevice::getSurfaceSwapChainSupport))
            .desc("Get the swap chain support for the physical device.")
            .param(0, "surface", "The surface to get the swap chain support for.")
            .param(1, "outSwapChainSupport", "This will be populated with the swap chain support info.");
        // todo
        // tspp::describe(b.method("getMemoryTypeIndex", &PhysicalDevice::getMemoryTypeIndex))
        //     .desc("Get the memory type index for the physical device.")
        //     .param(0, "reqs", "The memory requirements to get the memory type index for.")
        //     .param(1, "flags", "The flags to get the memory type index for.")
        //     .param(2, "out", "The memory type index to get.");
        tspp::describe(b.method("getHandle", &PhysicalDevice::get))
            .desc("Get the internal handle to the VkPhysicalDevice");
        // todo
        // tspp::describe(b.method("getProperties", &PhysicalDevice::getProperties))
        //     .desc("Get the properties of the physical device.");
        // todo
        // tspp::describe(b.method("getMemoryProperties", &PhysicalDevice::getMemoryProperties))
        //     .desc("Get the memory properties of the physical device.");
        // todo
        // tspp::describe(b.method("getFeatures", &PhysicalDevice::getFeatures))
        //     .desc("Get the features of the physical device.");
        tspp::describe(b.method("getInstance", &PhysicalDevice::getInstance))
            .desc("Get the instance associated with the physical device.");
    }

    void bindQueueInterface() {
        bind::ObjectTypeBuilder<Queue> b = bind::extend<Queue>();

        auto submit = +[](Queue* self,
                          CommandBuffer* buffer,
                          VkFence fence,
                          ::utils::Array<VkSemaphore>& waitFor,
                          ::utils::Array<VkSemaphore>& signal,
                          VkPipelineStageFlagBits waitStageMask) {
            return self->submit(
                buffer, fence, waitFor.size(), waitFor.data(), signal.size(), signal.data(), waitStageMask
            );
        };

        tspp::describe(b.method("getHandle", &Queue::get)).desc("Get the internal handle to the VkQueue");
        tspp::describe(b.method("getDevice", &Queue::getDevice)).desc("Get the device associated with the queue.");
        tspp::describe(b.method("getFamily", &Queue::getFamily)).desc("Get the family associated with the queue.");
        tspp::describe(b.method("getIndex", &Queue::getIndex)).desc("Get the index of the queue.");
        tspp::describe(b.method("supportsGraphics", &Queue::supportsGraphics))
            .desc("Check if the queue supports graphics operations.");
        tspp::describe(b.method("supportsCompute", &Queue::supportsCompute))
            .desc("Check if the queue supports compute operations.");
        tspp::describe(b.method("supportsTransfer", &Queue::supportsTransfer))
            .desc("Check if the queue supports transfer operations.");
        tspp::describe(b.pseudoMethod("submit", submit))
            .desc("Submit a command buffer to the queue.")
            .param(0, "commandBuffer", "The command buffer to submit.")
            .param(1, "fence", "The fence to wait for.", true)
            .param(2, "waitFor", "The semaphores to wait for.")
            .param(3, "signal", "The semaphores to signal.")
            .param(4, "waitStageMask", "The stage mask to wait for.");
        tspp::describe(b.method("waitForIdle", &Queue::waitForIdle)).desc("Wait for the queue to idle.");
    }

    void bindQueueFamilyInterface() {
        bind::ObjectTypeBuilder<QueueFamily> b = bind::extend<QueueFamily>();

        b.ctor<const QueueFamily&>();
        b.dtor();

        tspp::describe(b.method("supportsGraphics", &QueueFamily::supportsGraphics))
            .desc("Check if the queue family supports graphics operations.");
        tspp::describe(b.method("supportsCompute", &QueueFamily::supportsCompute))
            .desc("Check if the queue family supports compute operations.");
        tspp::describe(b.method("supportsTransfer", &QueueFamily::supportsTransfer))
            .desc("Check if the queue family supports transfer operations.");
        tspp::describe(b.method("getDevice", &QueueFamily::getDevice))
            .desc("Get the device associated with the queue family.");
        tspp::describe(b.method("getInstance", &QueueFamily::getInstance))
            .desc("Get the instance associated with the queue family.");
        tspp::describe(b.method("getIndex", &QueueFamily::getIndex)).desc("Get the index of the queue family.");
        tspp::describe(b.staticMethod("list", &QueueFamily::list))
            .desc("List the queue families for a physical device.")
            .param(0, "device", "The physical device to list the queue families for.");
    }

    void bindRenderPassInterface() {
        bind::ObjectTypeBuilder<RenderPass::attachment> rpa = bind::extend<RenderPass::attachment>();
        rpa.prop("desc", &RenderPass::attachment::desc);
        rpa.prop("ref", &RenderPass::attachment::ref);

        bind::ObjectTypeBuilder<RenderPass> b = bind::extend<RenderPass>();

        b.ctor<SwapChain*>();
        b.dtor();

        tspp::describe(b.method("getDevice", &RenderPass::getDevice))
            .desc("Get the logical device associated with the render pass");
        tspp::describe(b.method("getAttachments", &RenderPass::getAttachments))
            .desc("Get the attachments of the render pass");
        tspp::describe(b.method("getHandle", &RenderPass::get)).desc("Get the internal handle to the render pass");
        tspp::describe(b.method("init", &RenderPass::init)).desc("Initialize the render pass");
        tspp::describe(b.method("recreate", &RenderPass::recreate)).desc("Recreate the render pass");
        tspp::describe(b.method("shutdown", &RenderPass::shutdown)).desc("Shut down the render pass");
        tspp::describe(b.method("getSampleCount", &RenderPass::getSampleCount))
            .desc("Get the sample count of the render pass");
        tspp::describe(b.method("isMultisampled", &RenderPass::isMultisampled))
            .desc("Check if the render pass is multisampled");
        tspp::describe(b.staticMethod("isSampleCountSupported", &RenderPass::isSampleCountSupported))
            .desc("Check if a sample count is supported")
            .param(0, "sampleCount", "The sample count to check.")
            .param(1, "device", "The device to check the sample count for.");
        tspp::describe(b.staticMethod("getMaxSupportedSampleCount", &RenderPass::getMaxSupportedSampleCount))
            .desc("Get the maximum supported sample count")
            .param(0, "device", "The device to get the maximum supported sample count for.");
    }

    void bindShaderCompilerInterface() {
        bind::ObjectTypeBuilder<ShaderCompiler> b = bind::extend<ShaderCompiler>();
        b.baseType<IWithLogging>();

        b.ctor<LogicalDevice*>();
        b.dtor();

        tspp::describe(b.method("init", &ShaderCompiler::init)).desc("Initialize the shader compiler");
        tspp::describe(b.method("shutdown", &ShaderCompiler::shutdown)).desc("Shut down the shader compiler");
        tspp::describe(b.method("compileShader", &ShaderCompiler::compileShader))
            .desc("Compile a shader")
            .param(0, "source", "The source code of the shader")
            .param(1, "type", "The type of the shader")
            .returns("A TShader object");
    }

    void bindSurfaceInterface() {
        bind::ObjectTypeBuilder<Surface> b = bind::extend<Surface>();

        b.ctor<Instance*, ::decomp::Window*>();
        b.dtor();

        tspp::describe(b.method("getHandle", &Surface::get)).desc("Get the internal handle to the VkSurfaceKHR");
        tspp::describe(b.method("getWindow", &Surface::getWindow)).desc("Get the window associated with the surface.");
        tspp::describe(b.method("isInitialized", &Surface::isInitialized)).desc("Check if the surface is initialized.");
        tspp::describe(b.method("init", &Surface::init)).desc("Initialize the surface.");
        tspp::describe(b.method("shutdown", &Surface::shutdown)).desc("Shut down the surface.");
    }

    void bindSwapChainInterface() {
        bind::ObjectTypeBuilder<SwapChain> b = bind::extend<SwapChain>();

        auto getExtent = +[](SwapChain* self) {
            VkExtent2D extent = self->getExtent();
            return vec2ui(extent.width, extent.height);
        };

        b.ctor();
        b.dtor();

        tspp::describe(b.method("getHandle", &SwapChain::get)).desc("Get the internal handle to the VkSwapchainKHR");
        tspp::describe(b.method("getDevice", &SwapChain::getDevice))
            .desc("Get the device associated with the swap chain.");
        tspp::describe(b.method("isValid", &SwapChain::isValid)).desc("Check if the swap chain is valid.");
        tspp::describe(b.method("getImageCount", &SwapChain::getImageCount))
            .desc("Get the number of images in the swap chain.");
        tspp::describe(b.method("getImages", &SwapChain::getImages)).desc("Get the images in the swap chain.");
        tspp::describe(b.method("getImageViews", &SwapChain::getImageViews))
            .desc("Get the image views in the swap chain.");
        tspp::describe(b.method("getDepthBuffers", &SwapChain::getDepthBuffers))
            .desc("Get the depth buffers in the swap chain.");
        tspp::describe(b.method("getColorBuffers", &SwapChain::getColorBuffers))
            .desc("Get the color buffers in the swap chain.");
        tspp::describe(b.method("getResolveBuffers", &SwapChain::getResolveBuffers))
            .desc("Get the resolve buffers in the swap chain.");
        tspp::describe(b.pseudoMethod("getExtent", getExtent)).desc("Get the extent of the swap chain.");
        tspp::describe(b.method("getFormat", &SwapChain::getFormat)).desc("Get the format of the swap chain.");
        tspp::describe(b.method("getSampleCount", &SwapChain::getSampleCount))
            .desc("Get the sample count of the swap chain.");
        tspp::describe(b.method("isMultisampled", &SwapChain::isMultisampled))
            .desc("Check if the swap chain is multisampled");
        tspp::describe(b.method("init", &SwapChain::init))
            .desc("Initialize the swap chain.")
            .param(0, "surface", "The surface to initialize the swap chain for.")
            .param(1, "device", "The device to initialize the swap chain for.")
            .param(2, "support", "The swap chain support to initialize the swap chain for.")
            .param(3, "format", "The format of the swap chain.")
            .param(4, "colorSpace", "The color space of the swap chain.")
            .param(5, "presentMode", "The present mode of the swap chain.")
            .param(6, "imageCount", "The number of images in the swap chain.")
            .param(7, "sampleCount", "The sample count of the swap chain.")
            .param(8, "usage", "The usage flags for the swap chain.")
            .param(9, "compositeAlpha", "The composite alpha flag for the swap chain.")
            .param(10, "previous", "The previous swap chain to initialize the swap chain for.", true);
        tspp::describe(b.method("recreate", &SwapChain::recreate)).desc("Recreate the swap chain.");
        tspp::describe(b.method("shutdown", &SwapChain::shutdown)).desc("Shut down the swap chain.");
    }

    void bindSwapChainSupportInterface() {
        bind::ObjectTypeBuilder<SwapChainSupport> b = bind::extend<SwapChainSupport>();

        b.ctor();
        b.dtor();

        tspp::describe(b.method("isValid", &SwapChainSupport::isValid))
            .desc("Check if the swap chain support is valid.");
        tspp::describe(b.method("hasFormat", &SwapChainSupport::hasFormat))
            .desc("Check if the swap chain support has a format.")
            .param(0, "format", "The format to check.")
            .param(1, "colorSpace", "The color space to check.");
        tspp::describe(b.method("hasPresentMode", &SwapChainSupport::hasPresentMode))
            .desc("Check if the swap chain support has a present mode.")
            .param(0, "mode", "The present mode to check.");
        tspp::describe(b.method("getCapabilities", &SwapChainSupport::getCapabilities))
            .desc("Get the capabilities of the swap chain support.");
    }

    void bindTextureInterface() {
        bind::ObjectTypeBuilder<Texture> b = bind::extend<Texture>();

        auto getStagingBuffer = +[](Texture* self) {
            return self->getStagingBuffer();
        };

        b.ctor<LogicalDevice*>();
        b.dtor();

        tspp::describe(b.method("getDevice", &Texture::getDevice))
            .desc("Get the logical device associated with the texture");
        tspp::describe(b.pseudoMethod("getStagingBuffer", getStagingBuffer)).desc("Get the texture's staging buffer");
        tspp::describe(b.method("getType", &Texture::getType)).desc("Get the type of the texture");
        tspp::describe(b.method("getFormat", &Texture::getFormat)).desc("Get the format of the texture");
        tspp::describe(b.method("getBytesPerPixel", &Texture::getBytesPerPixel))
            .desc("Get the bytes per pixel of the texture");
        tspp::describe(b.method("getChannelCount", &Texture::getChannelCount))
            .desc("Get the channel count of the texture");
        tspp::describe(b.method("getMipLevelCount", &Texture::getMipLevelCount))
            .desc("Get the mip level count of the texture");
        tspp::describe(b.method("getDepth", &Texture::getDepth)).desc("Get the depth of the texture");
        tspp::describe(b.method("getArrayLayerCount", &Texture::getArrayLayerCount))
            .desc("Get the array layer count of the texture");
        tspp::describe(b.method("getDimensions", &Texture::getDimensions)).desc("Get the dimensions of the texture");
        tspp::describe(b.method("getImage", &Texture::get)).desc("Get the VkImage handle of the texture");
        tspp::describe(b.method("getView", &Texture::getView)).desc("Get the VkImageView handle of the texture");
        tspp::describe(b.method("getSampler", &Texture::getSampler)).desc("Get the VkSampler handle of the texture");
        tspp::describe(b.method("init", &Texture::init))
            .desc("Initialize the texture")
            .param(0, "width", "The width of the texture.")
            .param(1, "height", "The height of the texture.")
            .param(2, "format", "The format of the texture.")
            .param(3, "type", "The type of the texture.")
            .param(4, "mipLevels", "The number of mip levels in the texture.")
            .param(5, "depth", "The depth of the texture.")
            .param(6, "arrayLayers", "The number of array layers in the texture.")
            .param(7, "usage", "The usage flags for the texture.")
            .param(8, "layout", "The layout of the texture.")
            .param(9, "sampleCount", "The sample count of the texture.");
        tspp::describe(b.method("initSampler", &Texture::initSampler)).desc("Initialize the texture's sampler");
        tspp::describe(b.method("initStagingBuffer", &Texture::initStagingBuffer))
            .desc("Initialize the texture's staging buffer");
        tspp::describe(b.method("shutdown", &Texture::shutdown)).desc("Shut down the texture");
        tspp::describe(b.method("shutdownStagingBuffer", &Texture::shutdownStagingBuffer))
            .desc("Shut down the texture's staging buffer");
        tspp::describe(b.method("setLayout", &Texture::setLayout))
            .desc("Set the layout of the texture")
            .param(0, "commandBuffer", "The command buffer to use")
            .param(1, "layout", "The layout to set");
        tspp::describe(b.method("flushPixels", &Texture::flushPixels))
            .desc("Flush the pixels of the texture")
            .param(0, "commandBuffer", "The command buffer to use");
    }

    void bindUniformBufferInterface() {
        bind::ObjectTypeBuilder<UniformBuffer> b = bind::extend<UniformBuffer>();

        tspp::describe(b.ctor<LogicalDevice*, core::DataFormat*, u32>())
            .desc("Creates a uniform buffer")
            .param(0, "device", "The logical device to create the uniform buffer for.")
            .param(1, "format", "The format of the uniform buffer.")
            .param(2, "objectCapacity", "The capacity of the uniform buffer.");
        b.dtor();

        tspp::describe(b.method("getDevice", &UniformBuffer::getDevice))
            .desc("Get the logical device associated with the uniform buffer");
        tspp::describe(b.method("getFormat", &UniformBuffer::getFormat)).desc("Get the format of the uniform buffer");
        tspp::describe(b.method("getBuffer", &UniformBuffer::getBuffer))
            .desc("Get the handle to the VkBuffer of the uniform buffer");
        tspp::describe(b.method("getMemory", &UniformBuffer::getMemory))
            .desc("Get the handle to the VkDeviceMemory of the uniform buffer");
        tspp::describe(b.method("getCapacity", &UniformBuffer::getCapacity))
            .desc("Get the capacity of the uniform buffer");
        tspp::describe(b.method("getRemaining", &UniformBuffer::getRemaining))
            .desc("Get the remaining capacity of the uniform buffer");
        tspp::describe(b.method("allocate", &UniformBuffer::allocate))
            .desc("Allocate an object from the uniform buffer");
        tspp::describe(b.method("free", &UniformBuffer::free))
            .desc("Free an object from the uniform buffer")
            .param(0, "object", "The uniform buffer object to free.");
        tspp::describe(b.method("submitUpdates", &UniformBuffer::submitUpdates))
            .desc("Submit the updates to the uniform buffer")
            .param(0, "commandBuffer", "The command buffer to use");
    }

    void bindUniformObjectInterface() {
        bind::ObjectTypeBuilder<UniformObject> b = bind::extend<UniformObject>();

        auto write = +[](UniformObject* self, DataBuffer* data) {
            self->write(data->data());
        };

        tspp::describe(b.method("getBuffer", &UniformObject::getBuffer))
            .desc("Get the uniform buffer associated with the uniform object");
        tspp::describe(b.method("getRange", &UniformObject::getRange))
            .desc("Get the range of the uniform object")
            .param(0, "offset", "The offset of the uniform object")
            .param(1, "size", "The size of the uniform object");
        tspp::describe(b.method("free", &UniformObject::free)).desc("Free the uniform object");
        tspp::describe(b.pseudoMethod("write", write))
            .desc(
                "Write data to the uniform object. The data must be in the same format as the uniform object and must "
                "have the same size. The data will be copied to the uniform object."
            )
            .param(0, "data", "The data to write to the uniform object.");
    }

    void bindUniformObjectFactoryInterface() {
        bind::ObjectTypeBuilder<UniformObjectFactory> b = bind::extend<UniformObjectFactory>();

        tspp::describe(b.ctor<LogicalDevice*, u32>())
            .desc("Creates a uniform buffer factory")
            .param(0, "device", "The logical device to create the uniform buffer factory for.")
            .param(1, "maxObjectsPerBuffer", "The maximum number of objects per buffer.");
        b.dtor();

        tspp::describe(b.method("freeAll", &UniformObjectFactory::freeAll)).desc("Free all uniform buffers");
        tspp::describe(b.method("allocate", &UniformObjectFactory::allocate))
            .desc("Allocate a uniform object from the factory")
            .param(0, "format", "The format of the uniform object to allocate.");
    }

    void bindVertexBufferInterface() {
        bind::ObjectTypeBuilder<VertexBuffer> b = bind::extend<VertexBuffer>();

        tspp::describe(b.ctor<LogicalDevice*, core::DataFormat*, u32>())
            .desc("Creates a vertex buffer")
            .param(0, "device", "The logical device to create the vertex buffer for.")
            .param(1, "format", "The format of the vertex buffer.")
            .param(2, "vertexCapacity", "The capacity of the vertex buffer.");
        b.dtor();

        tspp::describe(b.method("init", &VertexBuffer::init)).desc("Initialize the vertex buffer");
        tspp::describe(b.method("shutdown", &VertexBuffer::shutdown)).desc("Shut down the vertex buffer");

        tspp::describe(b.method("getDevice", &VertexBuffer::getDevice))
            .desc("Get the logical device associated with the vertex buffer");
        tspp::describe(b.method("getFormat", &VertexBuffer::getFormat)).desc("Get the format of the vertex buffer");
        tspp::describe(b.method("getBuffer", &VertexBuffer::getBuffer))
            .desc("Get the handle to the VkBuffer of the vertex buffer");
        tspp::describe(b.method("getMemory", &VertexBuffer::getMemory))
            .desc("Get the handle to the VkDeviceMemory of the vertex buffer");
        tspp::describe(b.method("getCapacity", &VertexBuffer::getCapacity))
            .desc("Get the capacity of the vertex buffer");
        tspp::describe(b.method("getCurrentMaximumBlockSize", &VertexBuffer::getCurrentMaximumBlockSize))
            .desc("Get the current maximum block size of the vertex buffer");
        tspp::describe(b.method("allocate", &VertexBuffer::allocate))
            .desc("Allocate a block of vertices from the vertex buffer")
            .param(0, "count", "The number of vertices to allocate.");
        tspp::describe(b.method("free", &VertexBuffer::free))
            .desc("Free a block of vertices from the vertex buffer")
            .param(0, "vertices", "The vertices to free.");
    }

    void bindVerticesInterface() {
        bind::ObjectTypeBuilder<Vertices> b = bind::extend<Vertices>();

        auto write = +[](Vertices* self, DataBuffer* src, u64 offset, u64 count) {
            return self->write(src->data(), offset, count);
        };

        tspp::describe(b.method("getOffset", &Vertices::getOffset))
            .desc("Get the offset of the vertices within the containing vertex buffer");
        tspp::describe(b.method("getByteOffset", &Vertices::getByteOffset))
            .desc("Get the byte offset of the vertices within the containing vertex buffer");
        tspp::describe(b.method("getSize", &Vertices::getSize)).desc("Get the total size of the vertex data in bytes");
        tspp::describe(b.method("getCount", &Vertices::getCount)).desc("Get the number of vertices");
        tspp::describe(b.method("getBuffer", &Vertices::getBuffer))
            .desc("Get the vertex buffer that contains the vertices");
        tspp::describe(b.method("free", &Vertices::free)).desc("Free the block of vertices");
        tspp::describe(b.method("beginUpdate", &Vertices::beginUpdate)).desc("Begin updating the vertices");
        tspp::describe(b.pseudoMethod("write", write))
            .desc("Write vertex data to the block of vertices")
            .param(0, "data", "The vertex data to write.")
            .param(1, "offset", "The offset (in vertices) in the block of vertices to write the data to.")
            .param(2, "count", "The number of vertices to write.");
        tspp::describe(b.method("endUpdate", &Vertices::commitUpdate)).desc("End the updates to the block of vertices");
    }

    void bindVertexBufferFactoryInterface() {
        bind::ObjectTypeBuilder<VertexBufferFactory> b = bind::extend<VertexBufferFactory>();

        tspp::describe(b.ctor<LogicalDevice*, u32>())
            .param(0, "device", "The logical device to create the vertex buffer factory for.")
            .param(1, "minBufferCapacity", "The minimum capacity of the vertex buffer.");
        b.dtor();

        tspp::describe(b.method("freeAll", &VertexBufferFactory::freeAll))
            .desc("Free all vertex buffers allocated by the factory");
        tspp::describe(b.method("allocate", &VertexBufferFactory::allocate))
            .desc("Allocate a block of vertices from the factory")
            .param(0, "format", "The format of the vertices to allocate.")
            .param(1, "count", "The number of vertices to allocate.");
    }

    void bindDataFormatInterface() {
        bind::ObjectTypeBuilder<DataFormat::Attribute> dfa = bind::extend<DataFormat::Attribute>();
        dfa.prop("type", &DataFormat::Attribute::type);
        dfa.prop("elementCount", &DataFormat::Attribute::elementCount);
        dfa.prop("offset", &DataFormat::Attribute::offset);
        dfa.prop("size", &DataFormat::Attribute::size);
        dfa.prop("uniformAlignedSize", &DataFormat::Attribute::uniformAlignedSize);

        bind::ObjectTypeBuilder<DataFormat> b = bind::extend<DataFormat>();

        b.ctor();
        b.ctor<const DataFormat&>();
        b.dtor();

        tspp::describe(b.method<void, DATA_TYPE, u32, u32>("addAttr", &DataFormat::addAttr))
            .desc("Add an attribute to the format")
            .param(0, "type", "The type of the attribute.")
            .param(1, "offset", "The offset of the attribute.")
            .param(2, "elementCount", "The number of elements in the attribute.");
        tspp::describe(b.method<void, const DataFormat*, u32, u32>("addFormat", &DataFormat::addAttr))
            .desc("Add a structure to the format")
            .param(0, "format", "The format of the structure to add.")
            .param(1, "offset", "The offset of the structure.")
            .param(2, "elementCount", "The number of elements of the structure, if it's an array.");

        tspp::describe(b.method("getAttributes", &DataFormat::getAttributes)).desc("Get the attributes of the format");
        tspp::describe(b.method("setSize", &DataFormat::setSize))
            .desc("Set the size of the structure that the format describes")
            .param(0, "size", "The size of the structure.");
        tspp::describe(b.method("getSize", &DataFormat::getSize))
            .desc("Get the size of the structure that the format describes");
        tspp::describe(b.method("getUniformBlockSize", &DataFormat::getUniformBlockSize))
            .desc("Get the size of a uniform block that would be used to store objects with this format");
        tspp::describe(b.method("isValid", &DataFormat::isValid)).desc("Check if the format is valid");
        tspp::describe(b.method("isEqualTo", &DataFormat::isEqualTo))
            .desc("Check if the format is equal to another format")
            .param(0, "format", "The format to compare to.");
        tspp::describe(b.staticMethod("AttributeSize", &DataFormat::AttributeSize))
            .desc("Get the size of an attribute type in bytes")
            .param(0, "type", "The type of attribute to get the size of.")
            .param(
                1, "uniformAligned", "Whether the attribute should be aligned to adhere to uniform block layout rules."
            );
    }

    void bindFrameContextInterface() {
        bind::ObjectTypeBuilder<FrameContext> b = bind::extend<FrameContext>();
        b.baseType<IWithLogging>();

        tspp::describe(b.method("getCommandBuffer", &FrameContext::getCommandBuffer))
            .desc("Get the command buffer associated with the frame context");
        tspp::describe(b.method("getSwapChain", &FrameContext::getSwapChain))
            .desc("Get the swap chain associated with the frame context");
        tspp::describe(b.method("getFramebuffer", &FrameContext::getFramebuffer))
            .desc("Get the framebuffer associated with the frame context");
        tspp::describe(b.method("getSwapChainImageIndex", &FrameContext::getSwapChainImageIndex))
            .desc("Get the index of the swap chain image associated with the frame context");
        tspp::describe(b.method<void, u32, const vec4f&>("setClearColorF", &FrameContext::setClearColor))
            .desc("Set the clear color for an attachment")
            .param(0, "attachmentIdx", "The index of the attachment to set the clear color for.")
            .param(1, "clearColor", "The clear color to set.");
        tspp::describe(b.method<void, u32, const vec4ui&>("setClearColorU", &FrameContext::setClearColor))
            .desc("Set the clear color for an attachment")
            .param(0, "attachmentIdx", "The index of the attachment to set the clear color for.")
            .param(1, "clearColor", "The clear color to set.");
        tspp::describe(b.method<void, u32, const vec4i&>("setClearColorI", &FrameContext::setClearColor))
            .desc("Set the clear color for an attachment")
            .param(0, "attachmentIdx", "The index of the attachment to set the clear color for.")
            .param(1, "clearColor", "The clear color to set.");
        tspp::describe(b.method<void, u32, f32, u32>("setClearDepthStencil", &FrameContext::setClearDepthStencil))
            .desc("Set the clear depth and stencil for an attachment")
            .param(0, "attachmentIdx", "The index of the attachment to set the clear depth and stencil for.")
            .param(1, "clearDepth", "The clear depth value to set.")
            .param(2, "clearStencil", "The clear stencil value to set.");
        tspp::describe(b.method("begin", &FrameContext::begin)).desc("Begin the frame");
        tspp::describe(b.method("end", &FrameContext::end)).desc("End the frame");
    }

    void bindFrameManagerInterface() {
        bind::ObjectTypeBuilder<FrameManager> b = bind::extend<FrameManager>();
        b.baseType<IWithLogging>();

        tspp::describe(b.ctor<SwapChain*, RenderPass*>())
            .param(0, "swapChain", "The swap chain to create the frame manager for.")
            .param(1, "renderPass", "The render pass to create the frame manager for.");
        b.dtor();

        tspp::describe(b.method("getCommandPool", &FrameManager::getCommandPool))
            .desc("Get the command pool of the frame manager");
        tspp::describe(b.method("getFrameCount", &FrameManager::getFrameCount))
            .desc(
                "Get the number of frames available to the frame manager. This is the number of images in the related "
                "swap chain."
            );
        tspp::describe(b.method("init", &FrameManager::init)).desc("Initialize the frame manager");
        tspp::describe(b.method("shutdown", &FrameManager::shutdown)).desc("Shut down the frame manager");
        tspp::describe(b.method("getFrame", &FrameManager::getFrame)).desc("Get a frame to use for rendering");
        tspp::describe(b.method("releaseFrame", &FrameManager::releaseFrame))
            .desc("Release a frame that is no longer needed")
            .param(0, "frame", "The frame to release.");
    }

    void bindDebugDrawInterface() {
        using SphereTF = void (SimpleDebugDraw::*)(f32, const mat4f&, const vec4f&);
        using SphereCF = void (SimpleDebugDraw::*)(f32, const vec3f&, const vec4f&);
        using BoxTF    = void (SimpleDebugDraw::*)(const vec3f&, const vec3f&, const mat4f&, const vec4f&);
        using BoxCF    = void (SimpleDebugDraw::*)(const vec3f&, const vec3f&, const vec4f&);

        bind::ObjectTypeBuilder<SimpleDebugDraw> b = bind::extend<SimpleDebugDraw>();

        b.ctor();
        b.dtor();

        tspp::describe(b.method("init", &SimpleDebugDraw::init))
            .desc("Initialize the debug draw")
            .param(0, "compiler", "The shader compiler to use.")
            .param(1, "swapChain", "The swap chain to use.")
            .param(2, "renderPass", "The render pass to use.")
            .param(3, "vboFactory", "The vertex buffer factory to use.")
            .param(4, "uboFactory", "The uniform buffer factory to use.")
            .param(5, "descriptorFactory", "The descriptor set factory to use.")
            .param(6, "maxLines", "The maximum number of lines that can be drawn.");
        tspp::describe(b.method("shutdown", &SimpleDebugDraw::shutdown)).desc("Shut down the debug draw interface");
        tspp::describe(b.method("setProjection", &SimpleDebugDraw::setProjection))
            .desc("Set the projection matrix")
            .param(0, "proj", "The projection matrix to set.");
        tspp::describe(b.method("setView", &SimpleDebugDraw::setView))
            .desc("Set the view matrix")
            .param(0, "view", "The view matrix to set.");
        tspp::describe(b.method("getPipeline", &SimpleDebugDraw::getPipeline))
            .desc("Get the pipeline associated with the debug draw");
        tspp::describe(b.method("getProjection", &SimpleDebugDraw::getProjection)).desc("Get the projection matrix");
        tspp::describe(b.method("getView", &SimpleDebugDraw::getView)).desc("Get the view matrix");

        tspp::describe(b.method("line", &SimpleDebugDraw::line))
            .desc("Draw a line")
            .param(0, "a", "The start point of the line.")
            .param(1, "b", "The end point of the line.")
            .param(2, "color", "The color of the line.");
        tspp::describe(b.method("sphereTransform", static_cast<SphereTF>(&SimpleDebugDraw::sphere)))
            .desc("Draw a sphere")
            .param(0, "radius", "The radius of the sphere.")
            .param(1, "transform", "The transform of the sphere.")
            .param(2, "color", "The color of the sphere.");
        tspp::describe(b.method("sphereCenter", static_cast<SphereCF>(&SimpleDebugDraw::sphere)))
            .desc("Draw a sphere")
            .param(0, "radius", "The radius of the sphere.")
            .param(1, "center", "The center of the sphere.")
            .param(2, "color", "The color of the sphere.");
        tspp::describe(b.method("triangle", &SimpleDebugDraw::triangle))
            .desc("Draw a triangle")
            .param(0, "a", "The first vertex of the triangle.")
            .param(1, "b", "The second vertex of the triangle.")
            .param(2, "c", "The third vertex of the triangle.")
            .param(3, "color", "The color of the triangle.");
        tspp::describe(b.method("aabb", &SimpleDebugDraw::aabb))
            .desc("Draw an axis-aligned bounding box")
            .param(0, "upper", "The upper corner of the bounding box.")
            .param(1, "lower", "The lower corner of the bounding box.")
            .param(2, "color", "The color of the bounding box.");
        tspp::describe(b.method("transform", &SimpleDebugDraw::transform))
            .desc("Draw a transform")
            .param(0, "transform", "The transform to draw.")
            .param(1, "orthoLen", "The length of the ortho lines.");
        tspp::describe(b.method("arc", &SimpleDebugDraw::arc))
            .desc("Draw an arc")
            .param(0, "center", "The center of the arc.")
            .param(1, "normal", "The normal of the arc.")
            .param(2, "axis", "The axis of the arc.")
            .param(3, "radiusA", "The radius of the arc at the start.")
            .param(4, "radiusB", "The radius of the arc at the end.")
            .param(5, "minAngle", "The minimum angle of the arc.")
            .param(6, "maxAngle", "The maximum angle of the arc.")
            .param(7, "color", "The color of the arc.")
            .param(8, "drawSect", "")
            .param(9, "stepDegrees", "The step size in degrees for the arc.");
        tspp::describe(b.method("spherePatch", &SimpleDebugDraw::spherePatch))
            .desc("Draw a sphere patch")
            .param(0, "center", "The center of the sphere patch.")
            .param(1, "up", "The up vector of the sphere patch.")
            .param(2, "axis", "The axis of the sphere patch.")
            .param(3, "radius", "The radius of the sphere patch.")
            .param(4, "minTh", "The minimum theta angle of the sphere patch.")
            .param(5, "maxTh", "The maximum theta angle of the sphere patch.")
            .param(6, "minPs", "The minimum polar angle of the sphere patch.")
            .param(7, "maxPs", "The maximum polar angle of the sphere patch.")
            .param(8, "color", "The color of the sphere patch.")
            .param(9, "stepDegrees", "The step size in degrees for the sphere patch.")
            .param(10, "drawCenter", "Whether to draw the center of the sphere patch.");
        tspp::describe(b.method("box", static_cast<BoxCF>(&SimpleDebugDraw::box)))
            .desc("Draw a box")
            .param(0, "min", "The minimum corner of the box.")
            .param(1, "max", "The maximum corner of the box.")
            .param(2, "color", "The color of the box.");
        tspp::describe(b.method("boxTransform", static_cast<BoxTF>(&SimpleDebugDraw::box)))
            .desc("Draw a box")
            .param(0, "min", "The minimum corner of the box.")
            .param(1, "max", "The maximum corner of the box.")
            .param(2, "transform", "The transform of the box.")
            .param(3, "color", "The color of the box.");
        tspp::describe(b.method("capsule", &SimpleDebugDraw::capsule))
            .desc("Draw a capsule")
            .param(0, "radius", "The radius of the capsule.")
            .param(1, "halfHeight", "The half height of the capsule.")
            .param(2, "upAxis", "The axis that the capsule is aligned with.")
            .param(3, "transform", "The transform of the capsule.")
            .param(4, "color", "The color of the capsule.");
        tspp::describe(b.method("cylinder", &SimpleDebugDraw::cylinder))
            .desc("Draw a cylinder")
            .param(0, "radius", "The radius of the cylinder.")
            .param(1, "halfHeight", "The half height of the cylinder.")
            .param(2, "upAxis", "The axis that the cylinder is aligned with.")
            .param(3, "transform", "The transform of the cylinder.")
            .param(4, "color", "The color of the cylinder.");
        tspp::describe(b.method("cone", &SimpleDebugDraw::cone))
            .desc("Draw a cone")
            .param(0, "radius", "The radius of the cone.")
            .param(1, "height", "The height of the cone.")
            .param(2, "upAxis", "The axis that the cone is aligned with.")
            .param(3, "transform", "The transform of the cone.")
            .param(4, "color", "The color of the cone.");
        tspp::describe(b.method("plane", &SimpleDebugDraw::plane))
            .desc("Draw a plane")
            .param(0, "normal", "The normal of the plane.")
            .param(1, "planeConst", "The constant of the plane.")
            .param(2, "transform", "The transform of the plane.")
            .param(3, "color", "The color of the plane.");
        tspp::describe(b.method("originGrid", &SimpleDebugDraw::originGrid))
            .desc("Draw an origin grid")
            .param(0, "width", "The width of the grid.")
            .param(1, "length", "The length of the grid.");
        tspp::describe(b.method("begin", &SimpleDebugDraw::begin))
            .desc("Begin the debug draw. This should be called before any other method that draws content.")
            .param(0, "currentSwapChainImageIndex", "The index of the current swap chain image.");
        tspp::describe(b.method("end", &SimpleDebugDraw::end))
            .desc("End the debug draw. This should be called after all content has been rendered.")
            .param(0, "commandBuffer", "The command buffer to use.");
        tspp::describe(b.method("draw", &SimpleDebugDraw::draw))
            .desc("Draw the content rendered between the last calls to begin and end.")
            .param(0, "commandBuffer", "The command buffer to use.");
    }

    void bindVulkanInterface();

    void bindRenderInterface() {
        bind::Namespace* ns = new bind::Namespace("render");
        bind::Registry::Add(ns);

        ns->type<render::vulkan::Buffer>("Buffer");
        ns->type<CommandBuffer>("CommandBuffer");
        ns->type<CommandPool>("CommandPool");
        ns->type<ComputePipeline>("ComputePipeline");
        ns->type<DescriptorPool>("DescriptorPool");
        ns->type<DescriptorSet>("DescriptorSet");
        ns->type<DescriptorFactory>("DescriptorFactory");
        ns->type<Framebuffer>("Framebuffer");
        ns->type<Framebuffer::attachment>("FramebufferAttachment");
        ns->type<GraphicsPipeline>("GraphicsPipeline");
        ns->type<Instance>("Instance");
        ns->type<LogicalDevice>("LogicalDevice");
        ns->type<PhysicalDevice>("PhysicalDevice");
        ns->type<Pipeline>("Pipeline");
        ns->type<Queue>("Queue");
        ns->type<QueueFamily>("QueueFamily");
        ns->type<RenderPass>("RenderPass");
        ns->type<RenderPass::attachment>("RenderPassAttachment");
        ns->type<ShaderCompiler>("ShaderCompiler");
        ns->type<glslang::TShader>("TShader");
        ns->type<Surface>("Surface");
        ns->type<SwapChain>("SwapChain");
        ns->type<SwapChainSupport>("SwapChainSupport");
        ns->type<Texture>("Texture");
        ns->type<UniformBuffer>("UniformBuffer");
        ns->type<UniformObject>("UniformObject");
        ns->type<UniformObjectFactory>("UniformObjectFactory");
        ns->type<VertexBuffer>("VertexBuffer");
        ns->type<Vertices>("Vertices");
        ns->type<VertexBufferFactory>("VertexBufferFactory");

        ns->type<DataFormat>("DataFormat");
        ns->type<DataFormat::Attribute>("DataFormatAttribute");
        ns->type<FrameContext>("FrameContext");
        ns->type<FrameManager>("FrameManager");

        ns->type<SimpleDebugDraw>("SimpleDebugDraw");

        bindEnumTypes(ns);
        bindVulkanInterface();

        bindBufferInterface();
        bindCommandBufferInterface();
        bindCommandPoolInterface();
        bindComputePipelineInterface();
        bindDescriptorPoolInterface();
        bindDescriptorSetInterface();
        bindDescriptorFactoryInterface();
        bindFramebufferInterface();
        bindPipelineInterface();
        bindGraphicsPipelineInterface();
        bindInstanceInterface();
        bindLogicalDeviceInterface();
        bindPhysicalDeviceInterface();
        bindQueueInterface();
        bindQueueFamilyInterface();
        bindRenderPassInterface();
        bindShaderCompilerInterface();
        bindSurfaceInterface();
        bindSwapChainInterface();
        bindSwapChainSupportInterface();
        bindTextureInterface();
        bindUniformBufferInterface();
        bindUniformObjectInterface();
        bindUniformObjectFactoryInterface();
        bindVertexBufferInterface();
        bindVerticesInterface();
        bindVertexBufferFactoryInterface();

        bindDataFormatInterface();
        bindFrameContextInterface();
        bindFrameManagerInterface();

        bindDebugDrawInterface();
    }
}