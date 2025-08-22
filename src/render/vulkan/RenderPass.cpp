#include <render/vulkan/Instance.h>
#include <render/vulkan/LogicalDevice.h>
#include <render/vulkan/PhysicalDevice.h>
#include <render/vulkan/RenderPass.h>
#include <render/vulkan/SwapChain.h>

#include <utils/Array.hpp>

namespace render {
    namespace vulkan {
        VkSampleCountFlagBits RenderPass::sampleCountToVkFlags(u32 sampleCount) {
            switch (sampleCount) {
                case 1: return VK_SAMPLE_COUNT_1_BIT;
                case 2: return VK_SAMPLE_COUNT_2_BIT;
                case 4: return VK_SAMPLE_COUNT_4_BIT;
                case 8: return VK_SAMPLE_COUNT_8_BIT;
                case 16: return VK_SAMPLE_COUNT_16_BIT;
                case 32: return VK_SAMPLE_COUNT_32_BIT;
                case 64: return VK_SAMPLE_COUNT_64_BIT;
                default: return VK_SAMPLE_COUNT_1_BIT; // fallback to no MSAA
            }
        }

        bool RenderPass::isSampleCountSupported(u32 sampleCount, const PhysicalDevice* device) {
            VkSampleCountFlagBits flags          = sampleCountToVkFlags(sampleCount);
            const VkPhysicalDeviceLimits& limits = device->getProperties().limits;
            return (limits.framebufferColorSampleCounts & flags) && (limits.framebufferDepthSampleCounts & flags);
        }

        u32 RenderPass::getMaxSupportedSampleCount(const PhysicalDevice* device) {
            const VkPhysicalDeviceLimits& limits = device->getProperties().limits;
            VkSampleCountFlags counts = limits.framebufferColorSampleCounts & limits.framebufferDepthSampleCounts;

            if (counts & VK_SAMPLE_COUNT_64_BIT) {
                return 64;
            }
            if (counts & VK_SAMPLE_COUNT_32_BIT) {
                return 32;
            }
            if (counts & VK_SAMPLE_COUNT_16_BIT) {
                return 16;
            }
            if (counts & VK_SAMPLE_COUNT_8_BIT) {
                return 8;
            }
            if (counts & VK_SAMPLE_COUNT_4_BIT) {
                return 4;
            }
            if (counts & VK_SAMPLE_COUNT_2_BIT) {
                return 2;
            }
            return 1;
        }

        RenderPass::RenderPass(SwapChain* swapChain) {
            m_device     = swapChain->getDevice();
            m_renderPass = VK_NULL_HANDLE;

            m_sampleCount       = swapChain->getSampleCount();
            m_vkSampleCount     = sampleCountToVkFlags(m_sampleCount);
            bool isMultisampled = m_sampleCount > 1;

            if (isMultisampled) {
                // MSAA setup: color attachment (MSAA) -> resolve attachment (swapchain)

                // MSAA color attachment
                m_attachmentDescs.push({});
                auto& msaaColor          = m_attachmentDescs.last();
                msaaColor.format         = swapChain->getFormat();
                msaaColor.samples        = m_vkSampleCount;
                msaaColor.loadOp         = VK_ATTACHMENT_LOAD_OP_CLEAR;
                msaaColor.storeOp        = VK_ATTACHMENT_STORE_OP_DONT_CARE; // Not needed after resolve
                msaaColor.stencilLoadOp  = VK_ATTACHMENT_LOAD_OP_DONT_CARE;
                msaaColor.stencilStoreOp = VK_ATTACHMENT_STORE_OP_DONT_CARE;
                msaaColor.initialLayout  = VK_IMAGE_LAYOUT_UNDEFINED;
                msaaColor.finalLayout    = VK_IMAGE_LAYOUT_COLOR_ATTACHMENT_OPTIMAL;

                m_attachmentRefs.push({});
                auto& msaaColorRef      = m_attachmentRefs.last();
                msaaColorRef.attachment = 0;
                msaaColorRef.layout     = VK_IMAGE_LAYOUT_COLOR_ATTACHMENT_OPTIMAL;

                // MSAA depth attachment
                m_attachmentDescs.push({});
                auto& msaaDepth          = m_attachmentDescs.last();
                msaaDepth.format         = VK_FORMAT_D32_SFLOAT;
                msaaDepth.samples        = m_vkSampleCount;
                msaaDepth.loadOp         = VK_ATTACHMENT_LOAD_OP_CLEAR;
                msaaDepth.storeOp        = VK_ATTACHMENT_STORE_OP_DONT_CARE;
                msaaDepth.stencilLoadOp  = VK_ATTACHMENT_LOAD_OP_DONT_CARE;
                msaaDepth.stencilStoreOp = VK_ATTACHMENT_STORE_OP_DONT_CARE;
                msaaDepth.initialLayout  = VK_IMAGE_LAYOUT_UNDEFINED;
                msaaDepth.finalLayout    = VK_IMAGE_LAYOUT_DEPTH_STENCIL_ATTACHMENT_OPTIMAL;

                m_attachmentRefs.push({});
                auto& msaaDepthRef      = m_attachmentRefs.last();
                msaaDepthRef.attachment = 1;
                msaaDepthRef.layout     = VK_IMAGE_LAYOUT_DEPTH_STENCIL_ATTACHMENT_OPTIMAL;

                // Resolve attachment (swapchain image)
                m_attachmentDescs.push({});
                auto& resolveColor          = m_attachmentDescs.last();
                resolveColor.format         = swapChain->getFormat();
                resolveColor.samples        = VK_SAMPLE_COUNT_1_BIT;
                resolveColor.loadOp         = VK_ATTACHMENT_LOAD_OP_DONT_CARE;
                resolveColor.storeOp        = VK_ATTACHMENT_STORE_OP_STORE;
                resolveColor.stencilLoadOp  = VK_ATTACHMENT_LOAD_OP_DONT_CARE;
                resolveColor.stencilStoreOp = VK_ATTACHMENT_STORE_OP_DONT_CARE;
                resolveColor.initialLayout  = VK_IMAGE_LAYOUT_UNDEFINED;
                resolveColor.finalLayout    = VK_IMAGE_LAYOUT_PRESENT_SRC_KHR;

                m_attachmentRefs.push({});
                auto& resolveColorRef      = m_attachmentRefs.last();
                resolveColorRef.attachment = 2;
                resolveColorRef.layout     = VK_IMAGE_LAYOUT_COLOR_ATTACHMENT_OPTIMAL;

                // Subpass with resolve
                m_subpasses.push({});
                auto& subpass                   = m_subpasses.last();
                subpass.pipelineBindPoint       = VK_PIPELINE_BIND_POINT_GRAPHICS;
                subpass.colorAttachmentCount    = 1;
                subpass.pColorAttachments       = &m_attachmentRefs[0]; // MSAA color
                subpass.pResolveAttachments     = &m_attachmentRefs[2]; // Resolve target
                subpass.pDepthStencilAttachment = &m_attachmentRefs[1]; // MSAA depth
            } else {
                // Traditional single-sample setup

                // color attachment
                m_attachmentDescs.push({});
                auto& ca          = m_attachmentDescs.last();
                ca.format         = swapChain->getFormat();
                ca.samples        = VK_SAMPLE_COUNT_1_BIT;
                ca.loadOp         = VK_ATTACHMENT_LOAD_OP_CLEAR;
                ca.storeOp        = VK_ATTACHMENT_STORE_OP_STORE;
                ca.stencilLoadOp  = VK_ATTACHMENT_LOAD_OP_DONT_CARE;
                ca.stencilStoreOp = VK_ATTACHMENT_STORE_OP_DONT_CARE;
                ca.initialLayout  = VK_IMAGE_LAYOUT_UNDEFINED;
                ca.finalLayout    = VK_IMAGE_LAYOUT_PRESENT_SRC_KHR;

                m_attachmentRefs.push({});
                auto& car      = m_attachmentRefs.last();
                car.attachment = 0;
                car.layout     = VK_IMAGE_LAYOUT_COLOR_ATTACHMENT_OPTIMAL;

                // depth attachment
                m_attachmentDescs.push({});
                auto& da          = m_attachmentDescs.last();
                da.format         = VK_FORMAT_D32_SFLOAT;
                da.samples        = VK_SAMPLE_COUNT_1_BIT;
                da.loadOp         = VK_ATTACHMENT_LOAD_OP_CLEAR;
                da.storeOp        = VK_ATTACHMENT_STORE_OP_DONT_CARE;
                da.stencilLoadOp  = VK_ATTACHMENT_LOAD_OP_DONT_CARE;
                da.stencilStoreOp = VK_ATTACHMENT_STORE_OP_DONT_CARE;
                da.initialLayout  = VK_IMAGE_LAYOUT_UNDEFINED;
                da.finalLayout    = VK_IMAGE_LAYOUT_DEPTH_STENCIL_ATTACHMENT_OPTIMAL;

                m_attachmentRefs.push({});
                auto& dar      = m_attachmentRefs.last();
                dar.attachment = 1;
                dar.layout     = VK_IMAGE_LAYOUT_DEPTH_STENCIL_ATTACHMENT_OPTIMAL;

                // Subpass
                m_subpasses.push({});
                auto& subpass                   = m_subpasses.last();
                subpass.pipelineBindPoint       = VK_PIPELINE_BIND_POINT_GRAPHICS;
                subpass.colorAttachmentCount    = 1;
                subpass.pColorAttachments       = &m_attachmentRefs[0];
                subpass.pDepthStencilAttachment = &m_attachmentRefs[1];
            }

            // Subpass dependency
            m_subpassDeps.push({});
            auto& dep      = m_subpassDeps.last();
            dep.srcSubpass = VK_SUBPASS_EXTERNAL;
            dep.dstSubpass = 0;
            dep.srcStageMask =
                VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT | VK_PIPELINE_STAGE_EARLY_FRAGMENT_TESTS_BIT;
            dep.srcAccessMask = 0;
            dep.dstStageMask =
                VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT | VK_PIPELINE_STAGE_EARLY_FRAGMENT_TESTS_BIT;
            dep.dstAccessMask = VK_ACCESS_COLOR_ATTACHMENT_WRITE_BIT | VK_ACCESS_DEPTH_STENCIL_ATTACHMENT_WRITE_BIT;
        }

        RenderPass::~RenderPass() {
            shutdown();
        }

        LogicalDevice* RenderPass::getDevice() const {
            return m_device;
        }

        const Array<RenderPass::attachment>& RenderPass::getAttachments() const {
            return m_attachments;
        }

        VkRenderPass RenderPass::get() const {
            return m_renderPass;
        }

        u32 RenderPass::getSampleCount() const {
            return m_sampleCount;
        }

        bool RenderPass::isMultisampled() const {
            return m_sampleCount > 1;
        }

        bool RenderPass::init() {
            VkRenderPassCreateInfo rpi = {};
            rpi.sType                  = VK_STRUCTURE_TYPE_RENDER_PASS_CREATE_INFO;
            rpi.attachmentCount        = m_attachmentDescs.size();
            rpi.pAttachments           = m_attachmentDescs.data();
            rpi.subpassCount           = m_subpasses.size();
            rpi.pSubpasses             = m_subpasses.data();
            rpi.dependencyCount        = m_subpassDeps.size();
            rpi.pDependencies          = m_subpassDeps.data();

            if (vkCreateRenderPass(m_device->get(), &rpi, m_device->getInstance()->getAllocator(), &m_renderPass) !=
                VK_SUCCESS) {
                shutdown();
                return false;
            }

            return true;
        }

        void RenderPass::shutdown() {
            if (m_renderPass) {
                vkDestroyRenderPass(m_device->get(), m_renderPass, m_device->getInstance()->getAllocator());
                m_renderPass = VK_NULL_HANDLE;
            }
        }

        bool RenderPass::recreate() {
            shutdown();
            return init();
        }
    };
};