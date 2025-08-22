#include <render/core/FrameManager.h>
#include <render/vulkan/GraphicsPipeline.h>
#include <render/vulkan/Instance.h>
#include <render/vulkan/LogicalDevice.h>
#include <render/vulkan/PhysicalDevice.h>
#include <render/vulkan/Queue.h>
#include <render/vulkan/QueueFamily.h>
#include <render/vulkan/RenderPass.h>
#include <render/vulkan/Surface.h>
#include <render/vulkan/SwapChain.h>
#include <render/vulkan/SwapChainSupport.h>
#include <render/vulkan/Texture.h>

#include <decomp/app/window.h>
#include <utils/Array.hpp>

namespace render {
    namespace vulkan {
        SwapChain::SwapChain() {
            m_surface     = nullptr;
            m_device      = nullptr;
            m_swapChain   = VK_NULL_HANDLE;
            m_format      = VK_FORMAT_UNDEFINED;
            m_sampleCount = 1;
        }

        SwapChain::~SwapChain() {
            shutdown();
        }

        VkSwapchainKHR SwapChain::get() const {
            return m_swapChain;
        }

        LogicalDevice* SwapChain::getDevice() const {
            return m_device;
        }

        bool SwapChain::isValid() const {
            return m_swapChain != nullptr;
        }

        u32 SwapChain::getImageCount() const {
            return m_images.size();
        }

        const Array<VkImage>& SwapChain::getImages() const {
            return m_images;
        }

        const Array<VkImageView>& SwapChain::getImageViews() const {
            return m_imageViews;
        }

        const Array<Texture*>& SwapChain::getDepthBuffers() const {
            return m_depthBuffers;
        }

        const Array<Texture*>& SwapChain::getColorBuffers() const {
            return m_colorBuffers;
        }

        const Array<Texture*>& SwapChain::getResolveBuffers() const {
            return m_resolveBuffers;
        }

        const VkExtent2D& SwapChain::getExtent() const {
            return m_extent;
        }

        VkFormat SwapChain::getFormat() const {
            return m_format;
        }

        u32 SwapChain::getSampleCount() const {
            return m_sampleCount;
        }

        bool SwapChain::isMultisampled() const {
            return m_sampleCount > 1;
        }

        bool SwapChain::init(
            Surface* surface,
            LogicalDevice* device,
            const SwapChainSupport& support,
            VkFormat format,
            VkColorSpaceKHR colorSpace,
            VkPresentModeKHR presentMode,
            u32 imageCount,
            u32 sampleCount,
            VkImageUsageFlags usage,
            VkCompositeAlphaFlagBitsKHR compositeAlpha,
            SwapChain* previous
        ) {
            if (m_swapChain) {
                return false;
            }

            m_surface = surface;
            m_device  = device;

            // Validate and set sample count
            if (!RenderPass::isSampleCountSupported(sampleCount, m_device->getPhysicalDevice())) {
                // Fallback to maximum supported sample count
                sampleCount = RenderPass::getMaxSupportedSampleCount(m_device->getPhysicalDevice());
            }
            m_sampleCount = sampleCount;

            auto capabilities = support.getCapabilities();

            if (capabilities.currentExtent.width != UINT32_MAX) {
                m_extent = capabilities.currentExtent;
            } else {
                vec2ui size     = surface->getWindow()->getSize();
                m_extent.width  = size.x;
                m_extent.height = size.y;
            }

            m_createInfo                  = {};
            m_createInfo.sType            = VK_STRUCTURE_TYPE_SWAPCHAIN_CREATE_INFO_KHR;
            m_createInfo.surface          = m_surface->get();
            m_createInfo.imageFormat      = format;
            m_createInfo.imageColorSpace  = colorSpace;
            m_createInfo.presentMode      = presentMode;
            m_createInfo.minImageCount    = imageCount;
            m_createInfo.imageUsage       = usage;
            m_createInfo.compositeAlpha   = compositeAlpha;
            m_createInfo.imageArrayLayers = 1;
            m_createInfo.clipped          = VK_TRUE;
            m_createInfo.oldSwapchain     = previous ? previous->get() : VK_NULL_HANDLE;
            m_createInfo.imageExtent      = m_extent;
            m_createInfo.preTransform     = VK_SURFACE_TRANSFORM_IDENTITY_BIT_KHR;

            auto presentQueue = device->getPresentationQueue();
            auto gfxQueue     = device->getGraphicsQueue();

            if (!presentQueue || !gfxQueue) {
                return false;
            }
            u32 queueFamilyIndices[] = {
                u32(gfxQueue->getFamily().getIndex()), u32(presentQueue->getFamily().getIndex())
            };

            if (queueFamilyIndices[0] != queueFamilyIndices[1]) {
                m_createInfo.imageSharingMode      = VK_SHARING_MODE_CONCURRENT;
                m_createInfo.queueFamilyIndexCount = 2;
                m_createInfo.pQueueFamilyIndices   = queueFamilyIndices;
            } else {
                m_createInfo.imageSharingMode      = VK_SHARING_MODE_EXCLUSIVE;
                m_createInfo.queueFamilyIndexCount = 0;
                m_createInfo.pQueueFamilyIndices   = nullptr;
            }

            if (vkCreateSwapchainKHR(
                    device->get(), &m_createInfo, device->getInstance()->getAllocator(), &m_swapChain
                ) != VK_SUCCESS) {
                return false;
            }

            u32 count = 0;
            if (vkGetSwapchainImagesKHR(device->get(), m_swapChain, &count, nullptr) != VK_SUCCESS) {
                shutdown();
                return false;
            }

            m_images.reserve(count, true);
            if (vkGetSwapchainImagesKHR(device->get(), m_swapChain, &count, m_images.data()) != VK_SUCCESS) {
                m_images.clear();
                shutdown();
                return false;
            }

            m_imageViews.reserve(count);
            m_depthBuffers.reserve(count);
            m_colorBuffers.reserve(count);
            m_resolveBuffers.reserve(count);

            for (u32 i = 0; i < count; i++) {
                // Create image view for swapchain image (always needed for resolve/presentation)
                VkImageViewCreateInfo iv           = {};
                iv.sType                           = VK_STRUCTURE_TYPE_IMAGE_VIEW_CREATE_INFO;
                iv.image                           = m_images[i];
                iv.viewType                        = VK_IMAGE_VIEW_TYPE_2D;
                iv.format                          = format;
                iv.components.r                    = VK_COMPONENT_SWIZZLE_IDENTITY;
                iv.components.g                    = VK_COMPONENT_SWIZZLE_IDENTITY;
                iv.components.b                    = VK_COMPONENT_SWIZZLE_IDENTITY;
                iv.components.a                    = VK_COMPONENT_SWIZZLE_IDENTITY;
                iv.subresourceRange.layerCount     = 1;
                iv.subresourceRange.levelCount     = 1;
                iv.subresourceRange.baseMipLevel   = 0;
                iv.subresourceRange.baseArrayLayer = 0;
                iv.subresourceRange.aspectMask     = VK_IMAGE_ASPECT_COLOR_BIT;

                VkImageView view = VK_NULL_HANDLE;
                if (vkCreateImageView(device->get(), &iv, device->getInstance()->getAllocator(), &view) != VK_SUCCESS) {
                    shutdown();
                    return false;
                }
                m_imageViews.push(view);

                if (isMultisampled()) {
                    // MSAA setup: create MSAA color buffer, MSAA depth buffer, and resolve target

                    // MSAA color buffer
                    Texture* msaaColor = new Texture(m_device);
                    bool colorResult   = msaaColor->init(
                        m_extent.width,
                        m_extent.height,
                        format,
                        VK_IMAGE_TYPE_2D,
                        1,
                        1,
                        1,
                        VK_IMAGE_USAGE_COLOR_ATTACHMENT_BIT,
                        VK_IMAGE_LAYOUT_UNDEFINED,
                        m_sampleCount
                    );

                    if (!colorResult) {
                        delete msaaColor;
                        shutdown();
                        return false;
                    }
                    m_colorBuffers.push(msaaColor);

                    // MSAA depth buffer
                    Texture* msaaDepth = new Texture(m_device);
                    bool depthResult   = msaaDepth->init(
                        m_extent.width,
                        m_extent.height,
                        VK_FORMAT_D32_SFLOAT,
                        VK_IMAGE_TYPE_2D,
                        1,
                        1,
                        1,
                        VK_IMAGE_USAGE_DEPTH_STENCIL_ATTACHMENT_BIT,
                        VK_IMAGE_LAYOUT_UNDEFINED,
                        m_sampleCount
                    );

                    if (!depthResult) {
                        delete msaaDepth;
                        shutdown();
                        return false;
                    }
                    m_depthBuffers.push(msaaDepth);

                    // Resolve buffer - create texture wrapper for swapchain image
                    Texture* resolveTarget = new Texture(m_device);
                    bool resolveResult     = resolveTarget->initFromExistingImage(
                        m_images[i],
                        m_extent.width,
                        m_extent.height,
                        format,
                        VK_IMAGE_TYPE_2D,
                        1,
                        1,
                        1,
                        VK_IMAGE_USAGE_COLOR_ATTACHMENT_BIT,
                        VK_IMAGE_LAYOUT_UNDEFINED
                    );

                    if (!resolveResult) {
                        delete resolveTarget;
                        shutdown();
                        return false;
                    }
                    m_resolveBuffers.push(resolveTarget);

                } else {
                    // Non-MSAA setup: traditional single-sample textures

                    // Color buffer is the swapchain image - create texture wrapper
                    Texture* colorTarget = new Texture(m_device);
                    bool colorResult     = colorTarget->initFromExistingImage(
                        m_images[i],
                        m_extent.width,
                        m_extent.height,
                        format,
                        VK_IMAGE_TYPE_2D,
                        1,
                        1,
                        1,
                        VK_IMAGE_USAGE_COLOR_ATTACHMENT_BIT,
                        VK_IMAGE_LAYOUT_UNDEFINED
                    );

                    if (!colorResult) {
                        delete colorTarget;
                        shutdown();
                        return false;
                    }
                    m_colorBuffers.push(colorTarget);

                    // Single-sample depth buffer
                    Texture* depth   = new Texture(m_device);
                    bool depthResult = depth->init(
                        m_extent.width,
                        m_extent.height,
                        VK_FORMAT_D32_SFLOAT,
                        VK_IMAGE_TYPE_2D,
                        1,
                        1,
                        1,
                        VK_IMAGE_USAGE_DEPTH_STENCIL_ATTACHMENT_BIT,
                        VK_IMAGE_LAYOUT_UNDEFINED,
                        1
                    );

                    if (!depthResult) {
                        delete depth;
                        shutdown();
                        return false;
                    }
                    m_depthBuffers.push(depth);

                    // Resolve buffer is the same as color buffer for non-MSAA
                    Texture* resolveTarget = new Texture(m_device);
                    bool resolveResult     = resolveTarget->initFromExistingImage(
                        m_images[i],
                        m_extent.width,
                        m_extent.height,
                        format,
                        VK_IMAGE_TYPE_2D,
                        1,
                        1,
                        1,
                        VK_IMAGE_USAGE_COLOR_ATTACHMENT_BIT,
                        VK_IMAGE_LAYOUT_UNDEFINED
                    );

                    if (!resolveResult) {
                        delete resolveTarget;
                        shutdown();
                        return false;
                    }
                    m_resolveBuffers.push(resolveTarget);
                }
            }

            m_format = format;

            return true;
        }

        bool SwapChain::recreate() {
            if (!m_swapChain) {
                return false;
            }

            auto prevViews = m_imageViews;
            m_imageViews.clear();
            m_images.clear();

            // Create new swapchain
            SwapChainSupport support;
            m_device->getPhysicalDevice()->getSurfaceSwapChainSupport(m_surface, &support);

            auto capabilities = support.getCapabilities();
            if (capabilities.currentExtent.width != UINT32_MAX) {
                m_extent = capabilities.currentExtent;
            } else {
                vec2ui size     = m_surface->getWindow()->getSize();
                m_extent.width  = size.x;
                m_extent.height = size.y;
            }

            m_createInfo.oldSwapchain = m_swapChain;
            m_createInfo.imageExtent  = m_extent;

            auto presentQueue = m_device->getPresentationQueue();
            auto gfxQueue     = m_device->getGraphicsQueue();

            if (!presentQueue || !gfxQueue) {
                return false;
            }
            u32 queueFamilyIndices[] = {
                u32(gfxQueue->getFamily().getIndex()), u32(presentQueue->getFamily().getIndex())
            };

            if (queueFamilyIndices[0] != queueFamilyIndices[1]) {
                m_createInfo.imageSharingMode      = VK_SHARING_MODE_CONCURRENT;
                m_createInfo.queueFamilyIndexCount = 2;
                m_createInfo.pQueueFamilyIndices   = queueFamilyIndices;
            } else {
                m_createInfo.imageSharingMode      = VK_SHARING_MODE_EXCLUSIVE;
                m_createInfo.queueFamilyIndexCount = 0;
                m_createInfo.pQueueFamilyIndices   = nullptr;
            }

            VkSwapchainKHR newSwapChain = VK_NULL_HANDLE;
            if (vkCreateSwapchainKHR(
                    m_device->get(), &m_createInfo, m_device->getInstance()->getAllocator(), &newSwapChain
                ) != VK_SUCCESS) {
                return false;
            }

            u32 count = 0;
            if (vkGetSwapchainImagesKHR(m_device->get(), newSwapChain, &count, nullptr) != VK_SUCCESS) {
                shutdown();
                return false;
            }

            m_images.reserve(count, true);
            if (vkGetSwapchainImagesKHR(m_device->get(), newSwapChain, &count, m_images.data()) != VK_SUCCESS) {
                m_images.clear();
                shutdown();
                return false;
            }

            m_imageViews.reserve(count);
            for (u32 i = 0; i < count; i++) {
                // Create image view for swapchain image (always needed for resolve/presentation)
                VkImageViewCreateInfo iv           = {};
                iv.sType                           = VK_STRUCTURE_TYPE_IMAGE_VIEW_CREATE_INFO;
                iv.image                           = m_images[i];
                iv.viewType                        = VK_IMAGE_VIEW_TYPE_2D;
                iv.format                          = m_createInfo.imageFormat;
                iv.components.r                    = VK_COMPONENT_SWIZZLE_IDENTITY;
                iv.components.g                    = VK_COMPONENT_SWIZZLE_IDENTITY;
                iv.components.b                    = VK_COMPONENT_SWIZZLE_IDENTITY;
                iv.components.a                    = VK_COMPONENT_SWIZZLE_IDENTITY;
                iv.subresourceRange.layerCount     = 1;
                iv.subresourceRange.levelCount     = 1;
                iv.subresourceRange.baseMipLevel   = 0;
                iv.subresourceRange.baseArrayLayer = 0;
                iv.subresourceRange.aspectMask     = VK_IMAGE_ASPECT_COLOR_BIT;

                VkImageView view = VK_NULL_HANDLE;
                if (vkCreateImageView(m_device->get(), &iv, m_device->getInstance()->getAllocator(), &view) !=
                    VK_SUCCESS) {
                    shutdown();
                    return false;
                }
                m_imageViews.push(view);

                if (isMultisampled()) {
                    // MSAA setup: recreate MSAA color and depth buffers

                    // Recreate MSAA color buffer
                    if (m_colorBuffers[i]) {
                        m_colorBuffers[i]->shutdown();
                        bool colorResult = m_colorBuffers[i]->init(
                            m_extent.width,
                            m_extent.height,
                            m_createInfo.imageFormat,
                            VK_IMAGE_TYPE_2D,
                            1,
                            1,
                            1,
                            VK_IMAGE_USAGE_COLOR_ATTACHMENT_BIT,
                            VK_IMAGE_LAYOUT_UNDEFINED,
                            m_sampleCount
                        );

                        if (!colorResult) {
                            shutdown();
                            return false;
                        }
                    }

                    // Recreate MSAA depth buffer
                    if (m_depthBuffers[i]) {
                        m_depthBuffers[i]->shutdown();
                        bool depthResult = m_depthBuffers[i]->init(
                            m_extent.width,
                            m_extent.height,
                            VK_FORMAT_D32_SFLOAT,
                            VK_IMAGE_TYPE_2D,
                            1,
                            1,
                            1,
                            VK_IMAGE_USAGE_DEPTH_STENCIL_ATTACHMENT_BIT,
                            VK_IMAGE_LAYOUT_UNDEFINED,
                            m_sampleCount
                        );

                        if (!depthResult) {
                            shutdown();
                            return false;
                        }
                    }

                    // Recreate resolve buffers with new swapchain images
                    if (m_resolveBuffers[i]) {
                        m_resolveBuffers[i]->shutdown();
                        bool resolveResult = m_resolveBuffers[i]->initFromExistingImage(
                            m_images[i],
                            m_extent.width,
                            m_extent.height,
                            m_createInfo.imageFormat,
                            VK_IMAGE_TYPE_2D,
                            1,
                            1,
                            1,
                            VK_IMAGE_USAGE_COLOR_ATTACHMENT_BIT,
                            VK_IMAGE_LAYOUT_UNDEFINED
                        );

                        if (!resolveResult) {
                            shutdown();
                            return false;
                        }
                    }

                } else {
                    // Non-MSAA setup: recreate single-sample depth buffer

                    // Recreate color buffer wrapper with new swapchain image
                    if (m_colorBuffers[i]) {
                        m_colorBuffers[i]->shutdown();
                        bool colorResult = m_colorBuffers[i]->initFromExistingImage(
                            m_images[i],
                            m_extent.width,
                            m_extent.height,
                            m_createInfo.imageFormat,
                            VK_IMAGE_TYPE_2D,
                            1,
                            1,
                            1,
                            VK_IMAGE_USAGE_COLOR_ATTACHMENT_BIT,
                            VK_IMAGE_LAYOUT_UNDEFINED
                        );

                        if (!colorResult) {
                            shutdown();
                            return false;
                        }
                    }

                    if (m_depthBuffers[i]) {
                        m_depthBuffers[i]->shutdown();
                        bool depthResult = m_depthBuffers[i]->init(
                            m_extent.width,
                            m_extent.height,
                            VK_FORMAT_D32_SFLOAT,
                            VK_IMAGE_TYPE_2D,
                            1,
                            1,
                            1,
                            VK_IMAGE_USAGE_DEPTH_STENCIL_ATTACHMENT_BIT,
                            VK_IMAGE_LAYOUT_UNDEFINED,
                            1
                        );

                        if (!depthResult) {
                            shutdown();
                            return false;
                        }
                    }

                    // Recreate resolve buffer wrapper with new swapchain image
                    if (m_resolveBuffers[i]) {
                        m_resolveBuffers[i]->shutdown();
                        bool resolveResult = m_resolveBuffers[i]->initFromExistingImage(
                            m_images[i],
                            m_extent.width,
                            m_extent.height,
                            m_createInfo.imageFormat,
                            VK_IMAGE_TYPE_2D,
                            1,
                            1,
                            1,
                            VK_IMAGE_USAGE_COLOR_ATTACHMENT_BIT,
                            VK_IMAGE_LAYOUT_UNDEFINED
                        );

                        if (!resolveResult) {
                            shutdown();
                            return false;
                        }
                    }
                }
            }

            // Destroy old image views
            for (u32 i = 0; i < prevViews.size(); i++) {
                vkDestroyImageView(m_device->get(), prevViews[i], m_device->getInstance()->getAllocator());
            }

            // Destroy old swapchain
            vkDestroySwapchainKHR(m_device->get(), m_swapChain, m_device->getInstance()->getAllocator());

            m_swapChain = newSwapChain;

            // Update pipelines
            for (u32 i = 0; i < m_pipelines.size(); i++) {
                if (!m_pipelines[i]->recreate()) {
                    shutdown();
                    return false;
                }
            }

            return true;
        }

        void SwapChain::shutdown() {
            if (!m_swapChain) {
                return;
            }

            for (u32 i = 0; i < m_imageViews.size(); i++) {
                vkDestroyImageView(m_device->get(), m_imageViews[i], m_device->getInstance()->getAllocator());
            }

            for (u32 i = 0; i < m_depthBuffers.size(); i++) {
                delete m_depthBuffers[i];
            }

            for (u32 i = 0; i < m_colorBuffers.size(); i++) {
                delete m_colorBuffers[i];
            }

            for (u32 i = 0; i < m_resolveBuffers.size(); i++) {
                delete m_resolveBuffers[i];
            }

            vkDestroySwapchainKHR(m_device->get(), m_swapChain, m_device->getInstance()->getAllocator());
            m_swapChain = VK_NULL_HANDLE;
            m_device    = nullptr;
            m_surface   = nullptr;
            m_imageViews.clear();
            m_images.clear();
            m_depthBuffers.clear();
            m_colorBuffers.clear();
            m_resolveBuffers.clear();
            m_format      = VK_FORMAT_UNDEFINED;
            m_createInfo  = {};
            m_sampleCount = 1;
        }

        void SwapChain::onPipelineCreated(GraphicsPipeline* pipeline) {
            m_pipelines.push(pipeline);
        }

        void SwapChain::onPipelineDestroyed(GraphicsPipeline* pipeline) {
            i64 idx = m_pipelines.findIndex([pipeline](GraphicsPipeline* p) {
                return p == pipeline;
            });
            if (idx == -1) {
                return;
            }
            m_pipelines.remove(u32(idx));
        }
    };
};