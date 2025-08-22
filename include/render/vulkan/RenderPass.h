#pragma once
#include <render/types.h>

#include <vulkan/vulkan.h>

namespace render {
    namespace vulkan {
        class LogicalDevice;
        class PhysicalDevice;
        class SwapChain;

        class RenderPass {
            public:
                struct attachment {
                        VkAttachmentDescription desc;
                        VkAttachmentReference ref;
                };

                // Helper functions for sample count conversion and validation
                static VkSampleCountFlagBits sampleCountToVkFlags(u32 sampleCount);
                static bool isSampleCountSupported(u32 sampleCount, const PhysicalDevice* device);
                static u32 getMaxSupportedSampleCount(const PhysicalDevice* device);

                // Sets up the render pass for the swap chain with optional MSAA
                RenderPass(SwapChain* swapChain);
                ~RenderPass();

                LogicalDevice* getDevice() const;
                const Array<attachment>& getAttachments() const;
                VkRenderPass get() const;
                u32 getSampleCount() const;
                bool isMultisampled() const;

                bool init();
                bool recreate();
                void shutdown();

            protected:
                LogicalDevice* m_device;
                u32 m_sampleCount;
                VkSampleCountFlagBits m_vkSampleCount;

                VkRenderPass m_renderPass;
                Array<attachment> m_attachments;
                Array<VkAttachmentDescription> m_attachmentDescs;
                Array<VkAttachmentReference> m_attachmentRefs;
                Array<VkSubpassDescription> m_subpasses;
                Array<VkSubpassDependency> m_subpassDeps;
        };
    };
};