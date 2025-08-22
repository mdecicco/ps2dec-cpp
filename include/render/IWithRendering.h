#pragma once
#include <decomp/app/input.h>
#include <render/types.h>
#include <utils/interfaces/IWithLogging.h>

#include <utils/Array.h>

namespace decomp {
    class Window;
};

namespace render {
    namespace vulkan {
        class Instance;
        class PhysicalDevice;
        class Surface;
        class SwapChain;
        class SwapChainSupport;
        class ShaderCompiler;
        class LogicalDevice;
        class CommandBuffer;
        class Pipeline;
        class RenderPass;
        class VertexBufferFactory;
        class Vertices;
        class UniformObjectFactory;
        class UniformObject;
        class DescriptorFactory;
        class DescriptorSet;
        class Texture;
    };

    namespace core {
        class DataFormat;
        class FrameManager;
        class FrameContext;
    };

    namespace utils {
        class SimpleDebugDraw;
    }

    class IWithRendering : public decomp::IWithLogging, public decomp::IInputHandler {
        public:
            IWithRendering();
            virtual ~IWithRendering();

            bool initRendering(decomp::Window* win, u32 sampleCount = 1);
            bool initDebugDrawing(u32 maxLines = 4096);
            void shutdownRendering();

            virtual const vulkan::PhysicalDevice* choosePhysicalDevice(const Array<vulkan::PhysicalDevice>& devices);
            virtual bool setupInstance(vulkan::Instance* instance);
            virtual bool setupDevice(vulkan::LogicalDevice* device);
            virtual bool setupSwapchain(
                vulkan::SwapChain* swapChain, const vulkan::SwapChainSupport& support, u32 sampleCount = 1
            );
            virtual bool setupShaderCompiler(vulkan::ShaderCompiler* shaderCompiler);
            virtual void onWindowResize(decomp::Window* win, u32 width, u32 height);

            decomp::Window* getWindow() const;
            vulkan::Instance* getInstance() const;
            vulkan::PhysicalDevice* getPhysicalDevice() const;
            vulkan::LogicalDevice* getLogicalDevice() const;
            vulkan::Surface* getSurface() const;
            vulkan::SwapChain* getSwapChain() const;
            vulkan::RenderPass* getRenderPass() const;
            vulkan::ShaderCompiler* getShaderCompiler() const;
            utils::SimpleDebugDraw* getDebugDraw() const;
            core::FrameManager* getFrameManager() const;

            vulkan::Vertices* allocateVertices(core::DataFormat* format, u32 count);
            vulkan::UniformObject* allocateUniformObject(core::DataFormat* format);
            vulkan::DescriptorSet* allocateDescriptor(vulkan::Pipeline* pipeline);
            core::FrameContext* getFrame();
            void releaseFrame(core::FrameContext* frame);

        private:
            decomp::Window* m_window;
            vulkan::Instance* m_instance;
            vulkan::PhysicalDevice* m_physicalDevice;
            vulkan::LogicalDevice* m_logicalDevice;
            vulkan::Surface* m_surface;
            vulkan::SwapChain* m_swapChain;
            vulkan::RenderPass* m_renderPass;
            vulkan::ShaderCompiler* m_shaderCompiler;
            vulkan::VertexBufferFactory* m_vboFactory;
            vulkan::UniformObjectFactory* m_uboFactory;
            vulkan::DescriptorFactory* m_descriptorFactory;
            utils::SimpleDebugDraw* m_debugDraw;
            core::FrameManager* m_frames;

            bool m_initialized;
    };
};