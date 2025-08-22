#include <bind/Namespace.hpp>
#include <bind/Registry.hpp>

#include <tspp/utils/Docs.h>

#include <render/vulkan/Format.h>
#include <vulkan/vulkan.h>

namespace decomp {
    void bindVulkanInterface() {
        bind::Namespace* ns = new bind::Namespace("vulkan");
        bind::Registry::Add(ns);

        //
        // Opaque Types
        //
        ns->opaqueType<VkBuffer>("VkBuffer");
        ns->opaqueType<VkCommandBuffer>("VkCommandBuffer");
        ns->opaqueType<VkCommandPool>("VkCommandPool");
        ns->opaqueType<VkDescriptorSet>("VkDescriptorSet");
        ns->opaqueType<VkDescriptorSetLayout>("VkDescriptorSetLayout");
        ns->opaqueType<VkDevice>("VkDevice");
        ns->opaqueType<VkDeviceMemory>("VkDeviceMemory");
        ns->opaqueType<VkFence>("VkFence");
        ns->opaqueType<VkFramebuffer>("VkFramebuffer");
        ns->opaqueType<VkImage>("VkImage");
        ns->opaqueType<VkImageView>("VkImageView");
        ns->opaqueType<VkInstance>("VkInstance");
        ns->opaqueType<VkPhysicalDevice>("VkPhysicalDevice");
        ns->opaqueType<VkPipeline>("VkPipeline");
        ns->opaqueType<VkPipelineLayout>("VkPipelineLayout");
        ns->opaqueType<VkQueue>("VkQueue");
        ns->opaqueType<VkRenderPass>("VkRenderPass");
        ns->opaqueType<VkSampler>("VkSampler");
        ns->opaqueType<VkSemaphore>("VkSemaphore");
        ns->opaqueType<VkSurfaceKHR>("VkSurfaceKHR");
        ns->opaqueType<VkSwapchainKHR>("VkSwapchainKHR");

        //
        // Enums
        //

        /* clang-format off */

        {
            bind::EnumTypeBuilder<VkFilter> b = ns->type<VkFilter>("VkFilter");
            b.addEnumValue("VK_FILTER_NEAREST", VkFilter::VK_FILTER_NEAREST);
            b.addEnumValue("VK_FILTER_LINEAR", VkFilter::VK_FILTER_LINEAR);
            b.addEnumValue("VK_FILTER_CUBIC_EXT", VkFilter::VK_FILTER_CUBIC_EXT);
            b.addEnumValue("VK_FILTER_CUBIC_IMG", VkFilter::VK_FILTER_CUBIC_IMG);
        }

        {
            bind::EnumTypeBuilder<VkPhysicalDeviceType> b = ns->type<VkPhysicalDeviceType>("VkPhysicalDeviceType");
            b.addEnumValue("VK_PHYSICAL_DEVICE_TYPE_OTHER", VkPhysicalDeviceType::VK_PHYSICAL_DEVICE_TYPE_OTHER);
            b.addEnumValue("VK_PHYSICAL_DEVICE_TYPE_INTEGRATED_GPU", VkPhysicalDeviceType::VK_PHYSICAL_DEVICE_TYPE_INTEGRATED_GPU);
            b.addEnumValue("VK_PHYSICAL_DEVICE_TYPE_DISCRETE_GPU", VkPhysicalDeviceType::VK_PHYSICAL_DEVICE_TYPE_DISCRETE_GPU);
            b.addEnumValue("VK_PHYSICAL_DEVICE_TYPE_VIRTUAL_GPU", VkPhysicalDeviceType::VK_PHYSICAL_DEVICE_TYPE_VIRTUAL_GPU);
            b.addEnumValue("VK_PHYSICAL_DEVICE_TYPE_CPU", VkPhysicalDeviceType::VK_PHYSICAL_DEVICE_TYPE_CPU);
        }

        {
            bind::EnumTypeBuilder<VkCommandPoolCreateFlagBits> b = ns->type<VkCommandPoolCreateFlagBits>("VkCommandPoolCreateFlags");
            b.addEnumValue("VK_COMMAND_POOL_CREATE_RESET_COMMAND_BUFFER_BIT", VkCommandPoolCreateFlagBits::VK_COMMAND_POOL_CREATE_RESET_COMMAND_BUFFER_BIT);
            b.addEnumValue("VK_COMMAND_POOL_CREATE_TRANSIENT_BIT", VkCommandPoolCreateFlagBits::VK_COMMAND_POOL_CREATE_TRANSIENT_BIT);
            b.addEnumValue("VK_COMMAND_POOL_CREATE_PROTECTED_BIT", VkCommandPoolCreateFlagBits::VK_COMMAND_POOL_CREATE_PROTECTED_BIT);
        }

        {
            bind::EnumTypeBuilder<VkPipelineBindPoint> b = ns->type<VkPipelineBindPoint>("VkPipelineBindPoint");
            b.addEnumValue("VK_PIPELINE_BIND_POINT_GRAPHICS", VkPipelineBindPoint::VK_PIPELINE_BIND_POINT_GRAPHICS);
            b.addEnumValue("VK_PIPELINE_BIND_POINT_COMPUTE", VkPipelineBindPoint::VK_PIPELINE_BIND_POINT_COMPUTE);
            #ifdef VK_ENABLE_BETA_EXTENSIONS
            b.addEnumValue("VK_PIPELINE_BIND_POINT_EXECUTION_GRAPH_AMDX", VkPipelineBindPoint::VK_PIPELINE_BIND_POINT_EXECUTION_GRAPH_AMDX);
            #endif
            b.addEnumValue("VK_PIPELINE_BIND_POINT_RAY_TRACING_KHR", VkPipelineBindPoint::VK_PIPELINE_BIND_POINT_RAY_TRACING_KHR);
            b.addEnumValue("VK_PIPELINE_BIND_POINT_SUBPASS_SHADING_HUAWEI", VkPipelineBindPoint::VK_PIPELINE_BIND_POINT_SUBPASS_SHADING_HUAWEI);
            b.addEnumValue("VK_PIPELINE_BIND_POINT_RAY_TRACING_NV", VkPipelineBindPoint::VK_PIPELINE_BIND_POINT_RAY_TRACING_KHR);
        }

        {
            bind::EnumTypeBuilder<VkCommandBufferUsageFlagBits> b = ns->type<VkCommandBufferUsageFlagBits>("VkCommandBufferUsageFlags");
            b.addEnumValue("VK_COMMAND_BUFFER_USAGE_ONE_TIME_SUBMIT_BIT", VkCommandBufferUsageFlagBits::VK_COMMAND_BUFFER_USAGE_ONE_TIME_SUBMIT_BIT);
            b.addEnumValue("VK_COMMAND_BUFFER_USAGE_RENDER_PASS_CONTINUE_BIT", VkCommandBufferUsageFlagBits::VK_COMMAND_BUFFER_USAGE_RENDER_PASS_CONTINUE_BIT);
            b.addEnumValue("VK_COMMAND_BUFFER_USAGE_SIMULTANEOUS_USE_BIT", VkCommandBufferUsageFlagBits::VK_COMMAND_BUFFER_USAGE_SIMULTANEOUS_USE_BIT);
        }

        {
            bind::EnumTypeBuilder<VkImageLayout> b = ns->type<VkImageLayout>("VkImageLayout");
            b.addEnumValue("VK_IMAGE_LAYOUT_UNDEFINED", VkImageLayout::VK_IMAGE_LAYOUT_UNDEFINED);
            b.addEnumValue("VK_IMAGE_LAYOUT_GENERAL", VkImageLayout::VK_IMAGE_LAYOUT_GENERAL);
            b.addEnumValue("VK_IMAGE_LAYOUT_COLOR_ATTACHMENT_OPTIMAL", VkImageLayout::VK_IMAGE_LAYOUT_COLOR_ATTACHMENT_OPTIMAL);
            b.addEnumValue("VK_IMAGE_LAYOUT_DEPTH_STENCIL_ATTACHMENT_OPTIMAL", VkImageLayout::VK_IMAGE_LAYOUT_DEPTH_STENCIL_ATTACHMENT_OPTIMAL);
            b.addEnumValue("VK_IMAGE_LAYOUT_DEPTH_STENCIL_READ_ONLY_OPTIMAL", VkImageLayout::VK_IMAGE_LAYOUT_DEPTH_STENCIL_READ_ONLY_OPTIMAL);
            b.addEnumValue("VK_IMAGE_LAYOUT_SHADER_READ_ONLY_OPTIMAL", VkImageLayout::VK_IMAGE_LAYOUT_SHADER_READ_ONLY_OPTIMAL);
            b.addEnumValue("VK_IMAGE_LAYOUT_TRANSFER_SRC_OPTIMAL", VkImageLayout::VK_IMAGE_LAYOUT_TRANSFER_SRC_OPTIMAL);
            b.addEnumValue("VK_IMAGE_LAYOUT_TRANSFER_DST_OPTIMAL", VkImageLayout::VK_IMAGE_LAYOUT_TRANSFER_DST_OPTIMAL);
            b.addEnumValue("VK_IMAGE_LAYOUT_PREINITIALIZED", VkImageLayout::VK_IMAGE_LAYOUT_PREINITIALIZED);
            b.addEnumValue("VK_IMAGE_LAYOUT_DEPTH_READ_ONLY_STENCIL_ATTACHMENT_OPTIMAL", VkImageLayout::VK_IMAGE_LAYOUT_DEPTH_READ_ONLY_STENCIL_ATTACHMENT_OPTIMAL);
            b.addEnumValue("VK_IMAGE_LAYOUT_DEPTH_ATTACHMENT_STENCIL_READ_ONLY_OPTIMAL", VkImageLayout::VK_IMAGE_LAYOUT_DEPTH_ATTACHMENT_STENCIL_READ_ONLY_OPTIMAL);
            b.addEnumValue("VK_IMAGE_LAYOUT_DEPTH_ATTACHMENT_OPTIMAL", VkImageLayout::VK_IMAGE_LAYOUT_DEPTH_ATTACHMENT_OPTIMAL);
            b.addEnumValue("VK_IMAGE_LAYOUT_DEPTH_READ_ONLY_OPTIMAL", VkImageLayout::VK_IMAGE_LAYOUT_DEPTH_READ_ONLY_OPTIMAL);
            b.addEnumValue("VK_IMAGE_LAYOUT_STENCIL_ATTACHMENT_OPTIMAL", VkImageLayout::VK_IMAGE_LAYOUT_STENCIL_ATTACHMENT_OPTIMAL);
            b.addEnumValue("VK_IMAGE_LAYOUT_STENCIL_READ_ONLY_OPTIMAL", VkImageLayout::VK_IMAGE_LAYOUT_STENCIL_READ_ONLY_OPTIMAL);
            b.addEnumValue("VK_IMAGE_LAYOUT_READ_ONLY_OPTIMAL", VkImageLayout::VK_IMAGE_LAYOUT_READ_ONLY_OPTIMAL);
            b.addEnumValue("VK_IMAGE_LAYOUT_ATTACHMENT_OPTIMAL", VkImageLayout::VK_IMAGE_LAYOUT_ATTACHMENT_OPTIMAL);
            b.addEnumValue("VK_IMAGE_LAYOUT_PRESENT_SRC_KHR", VkImageLayout::VK_IMAGE_LAYOUT_PRESENT_SRC_KHR);
            b.addEnumValue("VK_IMAGE_LAYOUT_VIDEO_DECODE_DST_KHR", VkImageLayout::VK_IMAGE_LAYOUT_VIDEO_DECODE_DST_KHR);
            b.addEnumValue("VK_IMAGE_LAYOUT_VIDEO_DECODE_SRC_KHR", VkImageLayout::VK_IMAGE_LAYOUT_VIDEO_DECODE_SRC_KHR);
            b.addEnumValue("VK_IMAGE_LAYOUT_VIDEO_DECODE_DPB_KHR", VkImageLayout::VK_IMAGE_LAYOUT_VIDEO_DECODE_DPB_KHR);
            b.addEnumValue("VK_IMAGE_LAYOUT_SHARED_PRESENT_KHR", VkImageLayout::VK_IMAGE_LAYOUT_SHARED_PRESENT_KHR);
            b.addEnumValue("VK_IMAGE_LAYOUT_FRAGMENT_DENSITY_MAP_OPTIMAL_EXT", VkImageLayout::VK_IMAGE_LAYOUT_FRAGMENT_DENSITY_MAP_OPTIMAL_EXT);
            b.addEnumValue("VK_IMAGE_LAYOUT_FRAGMENT_SHADING_RATE_ATTACHMENT_OPTIMAL_KHR", VkImageLayout::VK_IMAGE_LAYOUT_FRAGMENT_SHADING_RATE_ATTACHMENT_OPTIMAL_KHR);
            #ifdef VK_ENABLE_BETA_EXTENSIONS
            b.addEnumValue("VK_IMAGE_LAYOUT_VIDEO_ENCODE_DST_KHR", VkImageLayout::VK_IMAGE_LAYOUT_VIDEO_ENCODE_DST_KHR);
            #endif
            #ifdef VK_ENABLE_BETA_EXTENSIONS
            b.addEnumValue("VK_IMAGE_LAYOUT_VIDEO_ENCODE_SRC_KHR", VkImageLayout::VK_IMAGE_LAYOUT_VIDEO_ENCODE_SRC_KHR);
            #endif
            #ifdef VK_ENABLE_BETA_EXTENSIONS
            b.addEnumValue("VK_IMAGE_LAYOUT_VIDEO_ENCODE_DPB_KHR", VkImageLayout::VK_IMAGE_LAYOUT_VIDEO_ENCODE_DPB_KHR);
            #endif
            b.addEnumValue("VK_IMAGE_LAYOUT_ATTACHMENT_FEEDBACK_LOOP_OPTIMAL_EXT", VkImageLayout::VK_IMAGE_LAYOUT_ATTACHMENT_FEEDBACK_LOOP_OPTIMAL_EXT);
            b.addEnumValue("VK_IMAGE_LAYOUT_DEPTH_READ_ONLY_STENCIL_ATTACHMENT_OPTIMAL_KHR", VkImageLayout::VK_IMAGE_LAYOUT_DEPTH_READ_ONLY_STENCIL_ATTACHMENT_OPTIMAL_KHR);
            b.addEnumValue("VK_IMAGE_LAYOUT_DEPTH_ATTACHMENT_STENCIL_READ_ONLY_OPTIMAL_KHR", VkImageLayout::VK_IMAGE_LAYOUT_DEPTH_ATTACHMENT_STENCIL_READ_ONLY_OPTIMAL_KHR);
            b.addEnumValue("VK_IMAGE_LAYOUT_SHADING_RATE_OPTIMAL_NV", VkImageLayout::VK_IMAGE_LAYOUT_SHADING_RATE_OPTIMAL_NV);
            b.addEnumValue("VK_IMAGE_LAYOUT_DEPTH_ATTACHMENT_OPTIMAL_KHR", VkImageLayout::VK_IMAGE_LAYOUT_DEPTH_ATTACHMENT_OPTIMAL_KHR);
            b.addEnumValue("VK_IMAGE_LAYOUT_DEPTH_READ_ONLY_OPTIMAL_KHR", VkImageLayout::VK_IMAGE_LAYOUT_DEPTH_READ_ONLY_OPTIMAL_KHR);
            b.addEnumValue("VK_IMAGE_LAYOUT_STENCIL_ATTACHMENT_OPTIMAL_KHR", VkImageLayout::VK_IMAGE_LAYOUT_STENCIL_ATTACHMENT_OPTIMAL_KHR);
            b.addEnumValue("VK_IMAGE_LAYOUT_STENCIL_READ_ONLY_OPTIMAL_KHR", VkImageLayout::VK_IMAGE_LAYOUT_STENCIL_READ_ONLY_OPTIMAL_KHR);
            b.addEnumValue("VK_IMAGE_LAYOUT_READ_ONLY_OPTIMAL_KHR", VkImageLayout::VK_IMAGE_LAYOUT_READ_ONLY_OPTIMAL_KHR);
            b.addEnumValue("VK_IMAGE_LAYOUT_ATTACHMENT_OPTIMAL_KHR", VkImageLayout::VK_IMAGE_LAYOUT_ATTACHMENT_OPTIMAL_KHR);
        }

        {
            bind::EnumTypeBuilder<VkImageUsageFlagBits> b = ns->type<VkImageUsageFlagBits>("VkImageUsageFlags");
            
            b.addEnumValue("VK_IMAGE_USAGE_TRANSFER_SRC_BIT", VkImageUsageFlagBits::VK_IMAGE_USAGE_TRANSFER_SRC_BIT);
            b.addEnumValue("VK_IMAGE_USAGE_TRANSFER_DST_BIT", VkImageUsageFlagBits::VK_IMAGE_USAGE_TRANSFER_DST_BIT);
            b.addEnumValue("VK_IMAGE_USAGE_SAMPLED_BIT", VkImageUsageFlagBits::VK_IMAGE_USAGE_SAMPLED_BIT);
            b.addEnumValue("VK_IMAGE_USAGE_STORAGE_BIT", VkImageUsageFlagBits::VK_IMAGE_USAGE_STORAGE_BIT);
            b.addEnumValue("VK_IMAGE_USAGE_COLOR_ATTACHMENT_BIT", VkImageUsageFlagBits::VK_IMAGE_USAGE_COLOR_ATTACHMENT_BIT);
            b.addEnumValue("VK_IMAGE_USAGE_DEPTH_STENCIL_ATTACHMENT_BIT", VkImageUsageFlagBits::VK_IMAGE_USAGE_DEPTH_STENCIL_ATTACHMENT_BIT);
            b.addEnumValue("VK_IMAGE_USAGE_TRANSIENT_ATTACHMENT_BIT", VkImageUsageFlagBits::VK_IMAGE_USAGE_TRANSIENT_ATTACHMENT_BIT);
            b.addEnumValue("VK_IMAGE_USAGE_INPUT_ATTACHMENT_BIT", VkImageUsageFlagBits::VK_IMAGE_USAGE_INPUT_ATTACHMENT_BIT);
            b.addEnumValue("VK_IMAGE_USAGE_VIDEO_DECODE_DST_BIT_KHR", VkImageUsageFlagBits::VK_IMAGE_USAGE_VIDEO_DECODE_DST_BIT_KHR);
            b.addEnumValue("VK_IMAGE_USAGE_VIDEO_DECODE_SRC_BIT_KHR", VkImageUsageFlagBits::VK_IMAGE_USAGE_VIDEO_DECODE_SRC_BIT_KHR);
            b.addEnumValue("VK_IMAGE_USAGE_VIDEO_DECODE_DPB_BIT_KHR", VkImageUsageFlagBits::VK_IMAGE_USAGE_VIDEO_DECODE_DPB_BIT_KHR);
            b.addEnumValue("VK_IMAGE_USAGE_FRAGMENT_DENSITY_MAP_BIT_EXT", VkImageUsageFlagBits::VK_IMAGE_USAGE_FRAGMENT_DENSITY_MAP_BIT_EXT);
            b.addEnumValue("VK_IMAGE_USAGE_FRAGMENT_SHADING_RATE_ATTACHMENT_BIT_KHR", VkImageUsageFlagBits::VK_IMAGE_USAGE_FRAGMENT_SHADING_RATE_ATTACHMENT_BIT_KHR);
            b.addEnumValue("VK_IMAGE_USAGE_HOST_TRANSFER_BIT_EXT", VkImageUsageFlagBits::VK_IMAGE_USAGE_HOST_TRANSFER_BIT_EXT);
            #ifdef VK_ENABLE_BETA_EXTENSIONS
            b.addEnumValue("VK_IMAGE_USAGE_VIDEO_ENCODE_DST_BIT_KHR", VkImageUsageFlagBits::VK_IMAGE_USAGE_VIDEO_ENCODE_DST_BIT_KHR);
            #endif
            #ifdef VK_ENABLE_BETA_EXTENSIONS
            b.addEnumValue("VK_IMAGE_USAGE_VIDEO_ENCODE_SRC_BIT_KHR", VkImageUsageFlagBits::VK_IMAGE_USAGE_VIDEO_ENCODE_SRC_BIT_KHR);
            #endif
            #ifdef VK_ENABLE_BETA_EXTENSIONS
            b.addEnumValue("VK_IMAGE_USAGE_VIDEO_ENCODE_DPB_BIT_KHR", VkImageUsageFlagBits::VK_IMAGE_USAGE_VIDEO_ENCODE_DPB_BIT_KHR);
            #endif
            b.addEnumValue("VK_IMAGE_USAGE_ATTACHMENT_FEEDBACK_LOOP_BIT_EXT", VkImageUsageFlagBits::VK_IMAGE_USAGE_ATTACHMENT_FEEDBACK_LOOP_BIT_EXT);
            b.addEnumValue("VK_IMAGE_USAGE_INVOCATION_MASK_BIT_HUAWEI", VkImageUsageFlagBits::VK_IMAGE_USAGE_INVOCATION_MASK_BIT_HUAWEI);
            b.addEnumValue("VK_IMAGE_USAGE_SAMPLE_WEIGHT_BIT_QCOM", VkImageUsageFlagBits::VK_IMAGE_USAGE_SAMPLE_WEIGHT_BIT_QCOM);
            b.addEnumValue("VK_IMAGE_USAGE_SAMPLE_BLOCK_MATCH_BIT_QCOM", VkImageUsageFlagBits::VK_IMAGE_USAGE_SAMPLE_BLOCK_MATCH_BIT_QCOM);
            b.addEnumValue("VK_IMAGE_USAGE_SHADING_RATE_IMAGE_BIT_NV", VkImageUsageFlagBits::VK_IMAGE_USAGE_SHADING_RATE_IMAGE_BIT_NV);
        }

        {
            bind::EnumTypeBuilder<VkImageType> b = ns->type<VkImageType>("VkImageType");
            b.addEnumValue("VK_IMAGE_TYPE_1D", VkImageType::VK_IMAGE_TYPE_1D);
            b.addEnumValue("VK_IMAGE_TYPE_2D", VkImageType::VK_IMAGE_TYPE_2D);
            b.addEnumValue("VK_IMAGE_TYPE_3D", VkImageType::VK_IMAGE_TYPE_3D);
        }

        {
            bind::EnumTypeBuilder<VkMemoryPropertyFlagBits> b = ns->type<VkMemoryPropertyFlagBits>("VkMemoryPropertyFlags");
            b.addEnumValue("VK_MEMORY_PROPERTY_DEVICE_LOCAL_BIT", VkMemoryPropertyFlagBits::VK_MEMORY_PROPERTY_DEVICE_LOCAL_BIT);
            b.addEnumValue("VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT", VkMemoryPropertyFlagBits::VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT);
            b.addEnumValue("VK_MEMORY_PROPERTY_HOST_COHERENT_BIT", VkMemoryPropertyFlagBits::VK_MEMORY_PROPERTY_HOST_COHERENT_BIT);
            b.addEnumValue("VK_MEMORY_PROPERTY_HOST_CACHED_BIT", VkMemoryPropertyFlagBits::VK_MEMORY_PROPERTY_HOST_CACHED_BIT);
            b.addEnumValue("VK_MEMORY_PROPERTY_LAZILY_ALLOCATED_BIT", VkMemoryPropertyFlagBits::VK_MEMORY_PROPERTY_LAZILY_ALLOCATED_BIT);
            b.addEnumValue("VK_MEMORY_PROPERTY_PROTECTED_BIT", VkMemoryPropertyFlagBits::VK_MEMORY_PROPERTY_PROTECTED_BIT);
            b.addEnumValue("VK_MEMORY_PROPERTY_DEVICE_COHERENT_BIT_AMD", VkMemoryPropertyFlagBits::VK_MEMORY_PROPERTY_DEVICE_COHERENT_BIT_AMD);
            b.addEnumValue("VK_MEMORY_PROPERTY_DEVICE_UNCACHED_BIT_AMD", VkMemoryPropertyFlagBits::VK_MEMORY_PROPERTY_DEVICE_UNCACHED_BIT_AMD);
            b.addEnumValue("VK_MEMORY_PROPERTY_RDMA_CAPABLE_BIT_NV", VkMemoryPropertyFlagBits::VK_MEMORY_PROPERTY_RDMA_CAPABLE_BIT_NV);
        }

        {
            bind::EnumTypeBuilder<VkSharingMode> b = ns->type<VkSharingMode>("VkSharingMode");
            b.addEnumValue("VK_SHARING_MODE_EXCLUSIVE", VkSharingMode::VK_SHARING_MODE_EXCLUSIVE);
            b.addEnumValue("VK_SHARING_MODE_CONCURRENT", VkSharingMode::VK_SHARING_MODE_CONCURRENT);
        }

        {
            bind::EnumTypeBuilder<VkBufferUsageFlagBits> b = ns->type<VkBufferUsageFlagBits>("VkBufferUsageFlags");
            b.addEnumValue("VK_BUFFER_USAGE_TRANSFER_SRC_BIT", VkBufferUsageFlagBits::VK_BUFFER_USAGE_TRANSFER_SRC_BIT);
            b.addEnumValue("VK_BUFFER_USAGE_TRANSFER_DST_BIT", VkBufferUsageFlagBits::VK_BUFFER_USAGE_TRANSFER_DST_BIT);
            b.addEnumValue("VK_BUFFER_USAGE_UNIFORM_TEXEL_BUFFER_BIT", VkBufferUsageFlagBits::VK_BUFFER_USAGE_UNIFORM_TEXEL_BUFFER_BIT);
            b.addEnumValue("VK_BUFFER_USAGE_STORAGE_TEXEL_BUFFER_BIT", VkBufferUsageFlagBits::VK_BUFFER_USAGE_STORAGE_TEXEL_BUFFER_BIT);
            b.addEnumValue("VK_BUFFER_USAGE_UNIFORM_BUFFER_BIT", VkBufferUsageFlagBits::VK_BUFFER_USAGE_UNIFORM_BUFFER_BIT);
            b.addEnumValue("VK_BUFFER_USAGE_STORAGE_BUFFER_BIT", VkBufferUsageFlagBits::VK_BUFFER_USAGE_STORAGE_BUFFER_BIT);
            b.addEnumValue("VK_BUFFER_USAGE_INDEX_BUFFER_BIT", VkBufferUsageFlagBits::VK_BUFFER_USAGE_INDEX_BUFFER_BIT);
            b.addEnumValue("VK_BUFFER_USAGE_VERTEX_BUFFER_BIT", VkBufferUsageFlagBits::VK_BUFFER_USAGE_VERTEX_BUFFER_BIT);
            b.addEnumValue("VK_BUFFER_USAGE_INDIRECT_BUFFER_BIT", VkBufferUsageFlagBits::VK_BUFFER_USAGE_INDIRECT_BUFFER_BIT);
            b.addEnumValue("VK_BUFFER_USAGE_SHADER_DEVICE_ADDRESS_BIT", VkBufferUsageFlagBits::VK_BUFFER_USAGE_SHADER_DEVICE_ADDRESS_BIT);
            b.addEnumValue("VK_BUFFER_USAGE_VIDEO_DECODE_SRC_BIT_KHR", VkBufferUsageFlagBits::VK_BUFFER_USAGE_VIDEO_DECODE_SRC_BIT_KHR);
            b.addEnumValue("VK_BUFFER_USAGE_VIDEO_DECODE_DST_BIT_KHR", VkBufferUsageFlagBits::VK_BUFFER_USAGE_VIDEO_DECODE_DST_BIT_KHR);
            b.addEnumValue("VK_BUFFER_USAGE_TRANSFORM_FEEDBACK_BUFFER_BIT_EXT", VkBufferUsageFlagBits::VK_BUFFER_USAGE_TRANSFORM_FEEDBACK_BUFFER_BIT_EXT);
            b.addEnumValue("VK_BUFFER_USAGE_TRANSFORM_FEEDBACK_COUNTER_BUFFER_BIT_EXT", VkBufferUsageFlagBits::VK_BUFFER_USAGE_TRANSFORM_FEEDBACK_COUNTER_BUFFER_BIT_EXT);
            b.addEnumValue("VK_BUFFER_USAGE_CONDITIONAL_RENDERING_BIT_EXT", VkBufferUsageFlagBits::VK_BUFFER_USAGE_CONDITIONAL_RENDERING_BIT_EXT);
            #ifdef VK_ENABLE_BETA_EXTENSIONS
            b.addEnumValue("VK_BUFFER_USAGE_EXECUTION_GRAPH_SCRATCH_BIT_AMDX", VkBufferUsageFlagBits::VK_BUFFER_USAGE_EXECUTION_GRAPH_SCRATCH_BIT_AMDX);
            #endif
            b.addEnumValue("VK_BUFFER_USAGE_ACCELERATION_STRUCTURE_BUILD_INPUT_READ_ONLY_BIT_KHR", VkBufferUsageFlagBits::VK_BUFFER_USAGE_ACCELERATION_STRUCTURE_BUILD_INPUT_READ_ONLY_BIT_KHR);
            b.addEnumValue("VK_BUFFER_USAGE_ACCELERATION_STRUCTURE_STORAGE_BIT_KHR", VkBufferUsageFlagBits::VK_BUFFER_USAGE_ACCELERATION_STRUCTURE_STORAGE_BIT_KHR);
            b.addEnumValue("VK_BUFFER_USAGE_SHADER_BINDING_TABLE_BIT_KHR", VkBufferUsageFlagBits::VK_BUFFER_USAGE_SHADER_BINDING_TABLE_BIT_KHR);
            #ifdef VK_ENABLE_BETA_EXTENSIONS
            b.addEnumValue("VK_BUFFER_USAGE_VIDEO_ENCODE_DST_BIT_KHR", VkBufferUsageFlagBits::VK_BUFFER_USAGE_VIDEO_ENCODE_DST_BIT_KHR);
            #endif
            #ifdef VK_ENABLE_BETA_EXTENSIONS
            b.addEnumValue("VK_BUFFER_USAGE_VIDEO_ENCODE_SRC_BIT_KHR", VkBufferUsageFlagBits::VK_BUFFER_USAGE_VIDEO_ENCODE_SRC_BIT_KHR);
            #endif
            b.addEnumValue("VK_BUFFER_USAGE_SAMPLER_DESCRIPTOR_BUFFER_BIT_EXT", VkBufferUsageFlagBits::VK_BUFFER_USAGE_SAMPLER_DESCRIPTOR_BUFFER_BIT_EXT);
            b.addEnumValue("VK_BUFFER_USAGE_RESOURCE_DESCRIPTOR_BUFFER_BIT_EXT", VkBufferUsageFlagBits::VK_BUFFER_USAGE_RESOURCE_DESCRIPTOR_BUFFER_BIT_EXT);
            b.addEnumValue("VK_BUFFER_USAGE_PUSH_DESCRIPTORS_DESCRIPTOR_BUFFER_BIT_EXT", VkBufferUsageFlagBits::VK_BUFFER_USAGE_PUSH_DESCRIPTORS_DESCRIPTOR_BUFFER_BIT_EXT);
            b.addEnumValue("VK_BUFFER_USAGE_MICROMAP_BUILD_INPUT_READ_ONLY_BIT_EXT", VkBufferUsageFlagBits::VK_BUFFER_USAGE_MICROMAP_BUILD_INPUT_READ_ONLY_BIT_EXT);
            b.addEnumValue("VK_BUFFER_USAGE_MICROMAP_STORAGE_BIT_EXT", VkBufferUsageFlagBits::VK_BUFFER_USAGE_MICROMAP_STORAGE_BIT_EXT);
            b.addEnumValue("VK_BUFFER_USAGE_RAY_TRACING_BIT_NV", VkBufferUsageFlagBits::VK_BUFFER_USAGE_RAY_TRACING_BIT_NV);
            b.addEnumValue("VK_BUFFER_USAGE_SHADER_DEVICE_ADDRESS_BIT_EXT", VkBufferUsageFlagBits::VK_BUFFER_USAGE_SHADER_DEVICE_ADDRESS_BIT_EXT);
            b.addEnumValue("VK_BUFFER_USAGE_SHADER_DEVICE_ADDRESS_BIT_KHR", VkBufferUsageFlagBits::VK_BUFFER_USAGE_SHADER_DEVICE_ADDRESS_BIT_KHR);
        }

        {
            bind::EnumTypeBuilder<VkFormat> b = ns->type<VkFormat>("VkFormat");
            b.addEnumValue("VK_FORMAT_UNDEFINED", VkFormat::VK_FORMAT_UNDEFINED);
            b.addEnumValue("VK_FORMAT_R4G4_UNORM_PACK8", VkFormat::VK_FORMAT_R4G4_UNORM_PACK8);
            b.addEnumValue("VK_FORMAT_R4G4B4A4_UNORM_PACK16", VkFormat::VK_FORMAT_R4G4B4A4_UNORM_PACK16);
            b.addEnumValue("VK_FORMAT_B4G4R4A4_UNORM_PACK16", VkFormat::VK_FORMAT_B4G4R4A4_UNORM_PACK16);
            b.addEnumValue("VK_FORMAT_R5G6B5_UNORM_PACK16", VkFormat::VK_FORMAT_R5G6B5_UNORM_PACK16);
            b.addEnumValue("VK_FORMAT_B5G6R5_UNORM_PACK16", VkFormat::VK_FORMAT_B5G6R5_UNORM_PACK16);
            b.addEnumValue("VK_FORMAT_R5G5B5A1_UNORM_PACK16", VkFormat::VK_FORMAT_R5G5B5A1_UNORM_PACK16);
            b.addEnumValue("VK_FORMAT_B5G5R5A1_UNORM_PACK16", VkFormat::VK_FORMAT_B5G5R5A1_UNORM_PACK16);
            b.addEnumValue("VK_FORMAT_A1R5G5B5_UNORM_PACK16", VkFormat::VK_FORMAT_A1R5G5B5_UNORM_PACK16);
            b.addEnumValue("VK_FORMAT_R8_UNORM", VkFormat::VK_FORMAT_R8_UNORM);
            b.addEnumValue("VK_FORMAT_R8_SNORM", VkFormat::VK_FORMAT_R8_SNORM);
            b.addEnumValue("VK_FORMAT_R8_USCALED", VkFormat::VK_FORMAT_R8_USCALED);
            b.addEnumValue("VK_FORMAT_R8_SSCALED", VkFormat::VK_FORMAT_R8_SSCALED);
            b.addEnumValue("VK_FORMAT_R8_UINT", VkFormat::VK_FORMAT_R8_UINT);
            b.addEnumValue("VK_FORMAT_R8_SINT", VkFormat::VK_FORMAT_R8_SINT);
            b.addEnumValue("VK_FORMAT_R8_SRGB", VkFormat::VK_FORMAT_R8_SRGB);
            b.addEnumValue("VK_FORMAT_R8G8_UNORM", VkFormat::VK_FORMAT_R8G8_UNORM);
            b.addEnumValue("VK_FORMAT_R8G8_SNORM", VkFormat::VK_FORMAT_R8G8_SNORM);
            b.addEnumValue("VK_FORMAT_R8G8_USCALED", VkFormat::VK_FORMAT_R8G8_USCALED);
            b.addEnumValue("VK_FORMAT_R8G8_SSCALED", VkFormat::VK_FORMAT_R8G8_SSCALED);
            b.addEnumValue("VK_FORMAT_R8G8_UINT", VkFormat::VK_FORMAT_R8G8_UINT);
            b.addEnumValue("VK_FORMAT_R8G8_SINT", VkFormat::VK_FORMAT_R8G8_SINT);
            b.addEnumValue("VK_FORMAT_R8G8_SRGB", VkFormat::VK_FORMAT_R8G8_SRGB);
            b.addEnumValue("VK_FORMAT_R8G8B8_UNORM", VkFormat::VK_FORMAT_R8G8B8_UNORM);
            b.addEnumValue("VK_FORMAT_R8G8B8_SNORM", VkFormat::VK_FORMAT_R8G8B8_SNORM);
            b.addEnumValue("VK_FORMAT_R8G8B8_USCALED", VkFormat::VK_FORMAT_R8G8B8_USCALED);
            b.addEnumValue("VK_FORMAT_R8G8B8_SSCALED", VkFormat::VK_FORMAT_R8G8B8_SSCALED);
            b.addEnumValue("VK_FORMAT_R8G8B8_UINT", VkFormat::VK_FORMAT_R8G8B8_UINT);
            b.addEnumValue("VK_FORMAT_R8G8B8_SINT", VkFormat::VK_FORMAT_R8G8B8_SINT);
            b.addEnumValue("VK_FORMAT_R8G8B8_SRGB", VkFormat::VK_FORMAT_R8G8B8_SRGB);
            b.addEnumValue("VK_FORMAT_B8G8R8_UNORM", VkFormat::VK_FORMAT_B8G8R8_UNORM);
            b.addEnumValue("VK_FORMAT_B8G8R8_SNORM", VkFormat::VK_FORMAT_B8G8R8_SNORM);
            b.addEnumValue("VK_FORMAT_B8G8R8_USCALED", VkFormat::VK_FORMAT_B8G8R8_USCALED);
            b.addEnumValue("VK_FORMAT_B8G8R8_SSCALED", VkFormat::VK_FORMAT_B8G8R8_SSCALED);
            b.addEnumValue("VK_FORMAT_B8G8R8_UINT", VkFormat::VK_FORMAT_B8G8R8_UINT);
            b.addEnumValue("VK_FORMAT_B8G8R8_SINT", VkFormat::VK_FORMAT_B8G8R8_SINT);
            b.addEnumValue("VK_FORMAT_B8G8R8_SRGB", VkFormat::VK_FORMAT_B8G8R8_SRGB);
            b.addEnumValue("VK_FORMAT_R8G8B8A8_UNORM", VkFormat::VK_FORMAT_R8G8B8A8_UNORM);
            b.addEnumValue("VK_FORMAT_R8G8B8A8_SNORM", VkFormat::VK_FORMAT_R8G8B8A8_SNORM);
            b.addEnumValue("VK_FORMAT_R8G8B8A8_USCALED", VkFormat::VK_FORMAT_R8G8B8A8_USCALED);
            b.addEnumValue("VK_FORMAT_R8G8B8A8_SSCALED", VkFormat::VK_FORMAT_R8G8B8A8_SSCALED);
            b.addEnumValue("VK_FORMAT_R8G8B8A8_UINT", VkFormat::VK_FORMAT_R8G8B8A8_UINT);
            b.addEnumValue("VK_FORMAT_R8G8B8A8_SINT", VkFormat::VK_FORMAT_R8G8B8A8_SINT);
            b.addEnumValue("VK_FORMAT_R8G8B8A8_SRGB", VkFormat::VK_FORMAT_R8G8B8A8_SRGB);
            b.addEnumValue("VK_FORMAT_B8G8R8A8_UNORM", VkFormat::VK_FORMAT_B8G8R8A8_UNORM);
            b.addEnumValue("VK_FORMAT_B8G8R8A8_SNORM", VkFormat::VK_FORMAT_B8G8R8A8_SNORM);
            b.addEnumValue("VK_FORMAT_B8G8R8A8_USCALED", VkFormat::VK_FORMAT_B8G8R8A8_USCALED);
            b.addEnumValue("VK_FORMAT_B8G8R8A8_SSCALED", VkFormat::VK_FORMAT_B8G8R8A8_SSCALED);
            b.addEnumValue("VK_FORMAT_B8G8R8A8_UINT", VkFormat::VK_FORMAT_B8G8R8A8_UINT);
            b.addEnumValue("VK_FORMAT_B8G8R8A8_SINT", VkFormat::VK_FORMAT_B8G8R8A8_SINT);
            b.addEnumValue("VK_FORMAT_B8G8R8A8_SRGB", VkFormat::VK_FORMAT_B8G8R8A8_SRGB);
            b.addEnumValue("VK_FORMAT_A8B8G8R8_UNORM_PACK32", VkFormat::VK_FORMAT_A8B8G8R8_UNORM_PACK32);
            b.addEnumValue("VK_FORMAT_A8B8G8R8_SNORM_PACK32", VkFormat::VK_FORMAT_A8B8G8R8_SNORM_PACK32);
            b.addEnumValue("VK_FORMAT_A8B8G8R8_USCALED_PACK32", VkFormat::VK_FORMAT_A8B8G8R8_USCALED_PACK32);
            b.addEnumValue("VK_FORMAT_A8B8G8R8_SSCALED_PACK32", VkFormat::VK_FORMAT_A8B8G8R8_SSCALED_PACK32);
            b.addEnumValue("VK_FORMAT_A8B8G8R8_UINT_PACK32", VkFormat::VK_FORMAT_A8B8G8R8_UINT_PACK32);
            b.addEnumValue("VK_FORMAT_A8B8G8R8_SINT_PACK32", VkFormat::VK_FORMAT_A8B8G8R8_SINT_PACK32);
            b.addEnumValue("VK_FORMAT_A8B8G8R8_SRGB_PACK32", VkFormat::VK_FORMAT_A8B8G8R8_SRGB_PACK32);
            b.addEnumValue("VK_FORMAT_A2R10G10B10_UNORM_PACK32", VkFormat::VK_FORMAT_A2R10G10B10_UNORM_PACK32);
            b.addEnumValue("VK_FORMAT_A2R10G10B10_SNORM_PACK32", VkFormat::VK_FORMAT_A2R10G10B10_SNORM_PACK32);
            b.addEnumValue("VK_FORMAT_A2R10G10B10_USCALED_PACK32", VkFormat::VK_FORMAT_A2R10G10B10_USCALED_PACK32);
            b.addEnumValue("VK_FORMAT_A2R10G10B10_SSCALED_PACK32", VkFormat::VK_FORMAT_A2R10G10B10_SSCALED_PACK32);
            b.addEnumValue("VK_FORMAT_A2R10G10B10_UINT_PACK32", VkFormat::VK_FORMAT_A2R10G10B10_UINT_PACK32);
            b.addEnumValue("VK_FORMAT_A2R10G10B10_SINT_PACK32", VkFormat::VK_FORMAT_A2R10G10B10_SINT_PACK32);
            b.addEnumValue("VK_FORMAT_A2B10G10R10_UNORM_PACK32", VkFormat::VK_FORMAT_A2B10G10R10_UNORM_PACK32);
            b.addEnumValue("VK_FORMAT_A2B10G10R10_SNORM_PACK32", VkFormat::VK_FORMAT_A2B10G10R10_SNORM_PACK32);
            b.addEnumValue("VK_FORMAT_A2B10G10R10_USCALED_PACK32", VkFormat::VK_FORMAT_A2B10G10R10_USCALED_PACK32);
            b.addEnumValue("VK_FORMAT_A2B10G10R10_SSCALED_PACK32", VkFormat::VK_FORMAT_A2B10G10R10_SSCALED_PACK32);
            b.addEnumValue("VK_FORMAT_A2B10G10R10_UINT_PACK32", VkFormat::VK_FORMAT_A2B10G10R10_UINT_PACK32);
            b.addEnumValue("VK_FORMAT_A2B10G10R10_SINT_PACK32", VkFormat::VK_FORMAT_A2B10G10R10_SINT_PACK32);
            b.addEnumValue("VK_FORMAT_R16_UNORM", VkFormat::VK_FORMAT_R16_UNORM);
            b.addEnumValue("VK_FORMAT_R16_SNORM", VkFormat::VK_FORMAT_R16_SNORM);
            b.addEnumValue("VK_FORMAT_R16_USCALED", VkFormat::VK_FORMAT_R16_USCALED);
            b.addEnumValue("VK_FORMAT_R16_SSCALED", VkFormat::VK_FORMAT_R16_SSCALED);
            b.addEnumValue("VK_FORMAT_R16_UINT", VkFormat::VK_FORMAT_R16_UINT);
            b.addEnumValue("VK_FORMAT_R16_SINT", VkFormat::VK_FORMAT_R16_SINT);
            b.addEnumValue("VK_FORMAT_R16_SFLOAT", VkFormat::VK_FORMAT_R16_SFLOAT);
            b.addEnumValue("VK_FORMAT_R16G16_UNORM", VkFormat::VK_FORMAT_R16G16_UNORM);
            b.addEnumValue("VK_FORMAT_R16G16_SNORM", VkFormat::VK_FORMAT_R16G16_SNORM);
            b.addEnumValue("VK_FORMAT_R16G16_USCALED", VkFormat::VK_FORMAT_R16G16_USCALED);
            b.addEnumValue("VK_FORMAT_R16G16_SSCALED", VkFormat::VK_FORMAT_R16G16_SSCALED);
            b.addEnumValue("VK_FORMAT_R16G16_UINT", VkFormat::VK_FORMAT_R16G16_UINT);
            b.addEnumValue("VK_FORMAT_R16G16_SINT", VkFormat::VK_FORMAT_R16G16_SINT);
            b.addEnumValue("VK_FORMAT_R16G16_SFLOAT", VkFormat::VK_FORMAT_R16G16_SFLOAT);
            b.addEnumValue("VK_FORMAT_R16G16B16_UNORM", VkFormat::VK_FORMAT_R16G16B16_UNORM);
            b.addEnumValue("VK_FORMAT_R16G16B16_SNORM", VkFormat::VK_FORMAT_R16G16B16_SNORM);
            b.addEnumValue("VK_FORMAT_R16G16B16_USCALED", VkFormat::VK_FORMAT_R16G16B16_USCALED);
            b.addEnumValue("VK_FORMAT_R16G16B16_SSCALED", VkFormat::VK_FORMAT_R16G16B16_SSCALED);
            b.addEnumValue("VK_FORMAT_R16G16B16_UINT", VkFormat::VK_FORMAT_R16G16B16_UINT);
            b.addEnumValue("VK_FORMAT_R16G16B16_SINT", VkFormat::VK_FORMAT_R16G16B16_SINT);
            b.addEnumValue("VK_FORMAT_R16G16B16_SFLOAT", VkFormat::VK_FORMAT_R16G16B16_SFLOAT);
            b.addEnumValue("VK_FORMAT_R16G16B16A16_UNORM", VkFormat::VK_FORMAT_R16G16B16A16_UNORM);
            b.addEnumValue("VK_FORMAT_R16G16B16A16_SNORM", VkFormat::VK_FORMAT_R16G16B16A16_SNORM);
            b.addEnumValue("VK_FORMAT_R16G16B16A16_USCALED", VkFormat::VK_FORMAT_R16G16B16A16_USCALED);
            b.addEnumValue("VK_FORMAT_R16G16B16A16_SSCALED", VkFormat::VK_FORMAT_R16G16B16A16_SSCALED);
            b.addEnumValue("VK_FORMAT_R16G16B16A16_UINT", VkFormat::VK_FORMAT_R16G16B16A16_UINT);
            b.addEnumValue("VK_FORMAT_R16G16B16A16_SINT", VkFormat::VK_FORMAT_R16G16B16A16_SINT);
            b.addEnumValue("VK_FORMAT_R16G16B16A16_SFLOAT", VkFormat::VK_FORMAT_R16G16B16A16_SFLOAT);
            b.addEnumValue("VK_FORMAT_R32_UINT", VkFormat::VK_FORMAT_R32_UINT);
            b.addEnumValue("VK_FORMAT_R32_SINT", VkFormat::VK_FORMAT_R32_SINT);
            b.addEnumValue("VK_FORMAT_R32_SFLOAT", VkFormat::VK_FORMAT_R32_SFLOAT);
            b.addEnumValue("VK_FORMAT_R32G32_UINT", VkFormat::VK_FORMAT_R32G32_UINT);
            b.addEnumValue("VK_FORMAT_R32G32_SINT", VkFormat::VK_FORMAT_R32G32_SINT);
            b.addEnumValue("VK_FORMAT_R32G32_SFLOAT", VkFormat::VK_FORMAT_R32G32_SFLOAT);
            b.addEnumValue("VK_FORMAT_R32G32B32_UINT", VkFormat::VK_FORMAT_R32G32B32_UINT);
            b.addEnumValue("VK_FORMAT_R32G32B32_SINT", VkFormat::VK_FORMAT_R32G32B32_SINT);
            b.addEnumValue("VK_FORMAT_R32G32B32_SFLOAT", VkFormat::VK_FORMAT_R32G32B32_SFLOAT);
            b.addEnumValue("VK_FORMAT_R32G32B32A32_UINT", VkFormat::VK_FORMAT_R32G32B32A32_UINT);
            b.addEnumValue("VK_FORMAT_R32G32B32A32_SINT", VkFormat::VK_FORMAT_R32G32B32A32_SINT);
            b.addEnumValue("VK_FORMAT_R32G32B32A32_SFLOAT", VkFormat::VK_FORMAT_R32G32B32A32_SFLOAT);
            b.addEnumValue("VK_FORMAT_R64_UINT", VkFormat::VK_FORMAT_R64_UINT);
            b.addEnumValue("VK_FORMAT_R64_SINT", VkFormat::VK_FORMAT_R64_SINT);
            b.addEnumValue("VK_FORMAT_R64_SFLOAT", VkFormat::VK_FORMAT_R64_SFLOAT);
            b.addEnumValue("VK_FORMAT_R64G64_UINT", VkFormat::VK_FORMAT_R64G64_UINT);
            b.addEnumValue("VK_FORMAT_R64G64_SINT", VkFormat::VK_FORMAT_R64G64_SINT);
            b.addEnumValue("VK_FORMAT_R64G64_SFLOAT", VkFormat::VK_FORMAT_R64G64_SFLOAT);
            b.addEnumValue("VK_FORMAT_R64G64B64_UINT", VkFormat::VK_FORMAT_R64G64B64_UINT);
            b.addEnumValue("VK_FORMAT_R64G64B64_SINT", VkFormat::VK_FORMAT_R64G64B64_SINT);
            b.addEnumValue("VK_FORMAT_R64G64B64_SFLOAT", VkFormat::VK_FORMAT_R64G64B64_SFLOAT);
            b.addEnumValue("VK_FORMAT_R64G64B64A64_UINT", VkFormat::VK_FORMAT_R64G64B64A64_UINT);
            b.addEnumValue("VK_FORMAT_R64G64B64A64_SINT", VkFormat::VK_FORMAT_R64G64B64A64_SINT);
            b.addEnumValue("VK_FORMAT_R64G64B64A64_SFLOAT", VkFormat::VK_FORMAT_R64G64B64A64_SFLOAT);
            b.addEnumValue("VK_FORMAT_B10G11R11_UFLOAT_PACK32", VkFormat::VK_FORMAT_B10G11R11_UFLOAT_PACK32);
            b.addEnumValue("VK_FORMAT_E5B9G9R9_UFLOAT_PACK32", VkFormat::VK_FORMAT_E5B9G9R9_UFLOAT_PACK32);
            b.addEnumValue("VK_FORMAT_D16_UNORM", VkFormat::VK_FORMAT_D16_UNORM);
            b.addEnumValue("VK_FORMAT_X8_D24_UNORM_PACK32", VkFormat::VK_FORMAT_X8_D24_UNORM_PACK32);
            b.addEnumValue("VK_FORMAT_D32_SFLOAT", VkFormat::VK_FORMAT_D32_SFLOAT);
            b.addEnumValue("VK_FORMAT_S8_UINT", VkFormat::VK_FORMAT_S8_UINT);
            b.addEnumValue("VK_FORMAT_D16_UNORM_S8_UINT", VkFormat::VK_FORMAT_D16_UNORM_S8_UINT);
            b.addEnumValue("VK_FORMAT_D24_UNORM_S8_UINT", VkFormat::VK_FORMAT_D24_UNORM_S8_UINT);
            b.addEnumValue("VK_FORMAT_D32_SFLOAT_S8_UINT", VkFormat::VK_FORMAT_D32_SFLOAT_S8_UINT);
            b.addEnumValue("VK_FORMAT_BC1_RGB_UNORM_BLOCK", VkFormat::VK_FORMAT_BC1_RGB_UNORM_BLOCK);
            b.addEnumValue("VK_FORMAT_BC1_RGB_SRGB_BLOCK", VkFormat::VK_FORMAT_BC1_RGB_SRGB_BLOCK);
            b.addEnumValue("VK_FORMAT_BC1_RGBA_UNORM_BLOCK", VkFormat::VK_FORMAT_BC1_RGBA_UNORM_BLOCK);
            b.addEnumValue("VK_FORMAT_BC1_RGBA_SRGB_BLOCK", VkFormat::VK_FORMAT_BC1_RGBA_SRGB_BLOCK);
            b.addEnumValue("VK_FORMAT_BC2_UNORM_BLOCK", VkFormat::VK_FORMAT_BC2_UNORM_BLOCK);
            b.addEnumValue("VK_FORMAT_BC2_SRGB_BLOCK", VkFormat::VK_FORMAT_BC2_SRGB_BLOCK);
            b.addEnumValue("VK_FORMAT_BC3_UNORM_BLOCK", VkFormat::VK_FORMAT_BC3_UNORM_BLOCK);
            b.addEnumValue("VK_FORMAT_BC3_SRGB_BLOCK", VkFormat::VK_FORMAT_BC3_SRGB_BLOCK);
            b.addEnumValue("VK_FORMAT_BC4_UNORM_BLOCK", VkFormat::VK_FORMAT_BC4_UNORM_BLOCK);
            b.addEnumValue("VK_FORMAT_BC4_SNORM_BLOCK", VkFormat::VK_FORMAT_BC4_SNORM_BLOCK);
            b.addEnumValue("VK_FORMAT_BC5_UNORM_BLOCK", VkFormat::VK_FORMAT_BC5_UNORM_BLOCK);
            b.addEnumValue("VK_FORMAT_BC5_SNORM_BLOCK", VkFormat::VK_FORMAT_BC5_SNORM_BLOCK);
            b.addEnumValue("VK_FORMAT_BC6H_UFLOAT_BLOCK", VkFormat::VK_FORMAT_BC6H_UFLOAT_BLOCK);
            b.addEnumValue("VK_FORMAT_BC6H_SFLOAT_BLOCK", VkFormat::VK_FORMAT_BC6H_SFLOAT_BLOCK);
            b.addEnumValue("VK_FORMAT_BC7_UNORM_BLOCK", VkFormat::VK_FORMAT_BC7_UNORM_BLOCK);
            b.addEnumValue("VK_FORMAT_BC7_SRGB_BLOCK", VkFormat::VK_FORMAT_BC7_SRGB_BLOCK);
            b.addEnumValue("VK_FORMAT_ETC2_R8G8B8_UNORM_BLOCK", VkFormat::VK_FORMAT_ETC2_R8G8B8_UNORM_BLOCK);
            b.addEnumValue("VK_FORMAT_ETC2_R8G8B8_SRGB_BLOCK", VkFormat::VK_FORMAT_ETC2_R8G8B8_SRGB_BLOCK);
            b.addEnumValue("VK_FORMAT_ETC2_R8G8B8A1_UNORM_BLOCK", VkFormat::VK_FORMAT_ETC2_R8G8B8A1_UNORM_BLOCK);
            b.addEnumValue("VK_FORMAT_ETC2_R8G8B8A1_SRGB_BLOCK", VkFormat::VK_FORMAT_ETC2_R8G8B8A1_SRGB_BLOCK);
            b.addEnumValue("VK_FORMAT_ETC2_R8G8B8A8_UNORM_BLOCK", VkFormat::VK_FORMAT_ETC2_R8G8B8A8_UNORM_BLOCK);
            b.addEnumValue("VK_FORMAT_ETC2_R8G8B8A8_SRGB_BLOCK", VkFormat::VK_FORMAT_ETC2_R8G8B8A8_SRGB_BLOCK);
            b.addEnumValue("VK_FORMAT_EAC_R11_UNORM_BLOCK", VkFormat::VK_FORMAT_EAC_R11_UNORM_BLOCK);
            b.addEnumValue("VK_FORMAT_EAC_R11_SNORM_BLOCK", VkFormat::VK_FORMAT_EAC_R11_SNORM_BLOCK);
            b.addEnumValue("VK_FORMAT_EAC_R11G11_UNORM_BLOCK", VkFormat::VK_FORMAT_EAC_R11G11_UNORM_BLOCK);
            b.addEnumValue("VK_FORMAT_EAC_R11G11_SNORM_BLOCK", VkFormat::VK_FORMAT_EAC_R11G11_SNORM_BLOCK);
            b.addEnumValue("VK_FORMAT_ASTC_4x4_UNORM_BLOCK", VkFormat::VK_FORMAT_ASTC_4x4_UNORM_BLOCK);
            b.addEnumValue("VK_FORMAT_ASTC_4x4_SRGB_BLOCK", VkFormat::VK_FORMAT_ASTC_4x4_SRGB_BLOCK);
            b.addEnumValue("VK_FORMAT_ASTC_5x4_UNORM_BLOCK", VkFormat::VK_FORMAT_ASTC_5x4_UNORM_BLOCK);
            b.addEnumValue("VK_FORMAT_ASTC_5x4_SRGB_BLOCK", VkFormat::VK_FORMAT_ASTC_5x4_SRGB_BLOCK);
            b.addEnumValue("VK_FORMAT_ASTC_5x5_UNORM_BLOCK", VkFormat::VK_FORMAT_ASTC_5x5_UNORM_BLOCK);
            b.addEnumValue("VK_FORMAT_ASTC_5x5_SRGB_BLOCK", VkFormat::VK_FORMAT_ASTC_5x5_SRGB_BLOCK);
            b.addEnumValue("VK_FORMAT_ASTC_6x5_UNORM_BLOCK", VkFormat::VK_FORMAT_ASTC_6x5_UNORM_BLOCK);
            b.addEnumValue("VK_FORMAT_ASTC_6x5_SRGB_BLOCK", VkFormat::VK_FORMAT_ASTC_6x5_SRGB_BLOCK);
            b.addEnumValue("VK_FORMAT_ASTC_6x6_UNORM_BLOCK", VkFormat::VK_FORMAT_ASTC_6x6_UNORM_BLOCK);
            b.addEnumValue("VK_FORMAT_ASTC_6x6_SRGB_BLOCK", VkFormat::VK_FORMAT_ASTC_6x6_SRGB_BLOCK);
            b.addEnumValue("VK_FORMAT_ASTC_8x5_UNORM_BLOCK", VkFormat::VK_FORMAT_ASTC_8x5_UNORM_BLOCK);
            b.addEnumValue("VK_FORMAT_ASTC_8x5_SRGB_BLOCK", VkFormat::VK_FORMAT_ASTC_8x5_SRGB_BLOCK);
            b.addEnumValue("VK_FORMAT_ASTC_8x6_UNORM_BLOCK", VkFormat::VK_FORMAT_ASTC_8x6_UNORM_BLOCK);
            b.addEnumValue("VK_FORMAT_ASTC_8x6_SRGB_BLOCK", VkFormat::VK_FORMAT_ASTC_8x6_SRGB_BLOCK);
            b.addEnumValue("VK_FORMAT_ASTC_8x8_UNORM_BLOCK", VkFormat::VK_FORMAT_ASTC_8x8_UNORM_BLOCK);
            b.addEnumValue("VK_FORMAT_ASTC_8x8_SRGB_BLOCK", VkFormat::VK_FORMAT_ASTC_8x8_SRGB_BLOCK);
            b.addEnumValue("VK_FORMAT_ASTC_10x5_UNORM_BLOCK", VkFormat::VK_FORMAT_ASTC_10x5_UNORM_BLOCK);
            b.addEnumValue("VK_FORMAT_ASTC_10x5_SRGB_BLOCK", VkFormat::VK_FORMAT_ASTC_10x5_SRGB_BLOCK);
            b.addEnumValue("VK_FORMAT_ASTC_10x6_UNORM_BLOCK", VkFormat::VK_FORMAT_ASTC_10x6_UNORM_BLOCK);
            b.addEnumValue("VK_FORMAT_ASTC_10x6_SRGB_BLOCK", VkFormat::VK_FORMAT_ASTC_10x6_SRGB_BLOCK);
            b.addEnumValue("VK_FORMAT_ASTC_10x8_UNORM_BLOCK", VkFormat::VK_FORMAT_ASTC_10x8_UNORM_BLOCK);
            b.addEnumValue("VK_FORMAT_ASTC_10x8_SRGB_BLOCK", VkFormat::VK_FORMAT_ASTC_10x8_SRGB_BLOCK);
            b.addEnumValue("VK_FORMAT_ASTC_10x10_UNORM_BLOCK", VkFormat::VK_FORMAT_ASTC_10x10_UNORM_BLOCK);
            b.addEnumValue("VK_FORMAT_ASTC_10x10_SRGB_BLOCK", VkFormat::VK_FORMAT_ASTC_10x10_SRGB_BLOCK);
            b.addEnumValue("VK_FORMAT_ASTC_12x10_UNORM_BLOCK", VkFormat::VK_FORMAT_ASTC_12x10_UNORM_BLOCK);
            b.addEnumValue("VK_FORMAT_ASTC_12x10_SRGB_BLOCK", VkFormat::VK_FORMAT_ASTC_12x10_SRGB_BLOCK);
            b.addEnumValue("VK_FORMAT_ASTC_12x12_UNORM_BLOCK", VkFormat::VK_FORMAT_ASTC_12x12_UNORM_BLOCK);
            b.addEnumValue("VK_FORMAT_ASTC_12x12_SRGB_BLOCK", VkFormat::VK_FORMAT_ASTC_12x12_SRGB_BLOCK);
            b.addEnumValue("VK_FORMAT_G8B8G8R8_422_UNORM", VkFormat::VK_FORMAT_G8B8G8R8_422_UNORM);
            b.addEnumValue("VK_FORMAT_B8G8R8G8_422_UNORM", VkFormat::VK_FORMAT_B8G8R8G8_422_UNORM);
            b.addEnumValue("VK_FORMAT_G8_B8_R8_3PLANE_420_UNORM", VkFormat::VK_FORMAT_G8_B8_R8_3PLANE_420_UNORM);
            b.addEnumValue("VK_FORMAT_G8_B8R8_2PLANE_420_UNORM", VkFormat::VK_FORMAT_G8_B8R8_2PLANE_420_UNORM);
            b.addEnumValue("VK_FORMAT_G8_B8_R8_3PLANE_422_UNORM", VkFormat::VK_FORMAT_G8_B8_R8_3PLANE_422_UNORM);
            b.addEnumValue("VK_FORMAT_G8_B8R8_2PLANE_422_UNORM", VkFormat::VK_FORMAT_G8_B8R8_2PLANE_422_UNORM);
            b.addEnumValue("VK_FORMAT_G8_B8_R8_3PLANE_444_UNORM", VkFormat::VK_FORMAT_G8_B8_R8_3PLANE_444_UNORM);
            b.addEnumValue("VK_FORMAT_R10X6_UNORM_PACK16", VkFormat::VK_FORMAT_R10X6_UNORM_PACK16);
            b.addEnumValue("VK_FORMAT_R10X6G10X6_UNORM_2PACK16", VkFormat::VK_FORMAT_R10X6G10X6_UNORM_2PACK16);
            b.addEnumValue("VK_FORMAT_R10X6G10X6B10X6A10X6_UNORM_4PACK16", VkFormat::VK_FORMAT_R10X6G10X6B10X6A10X6_UNORM_4PACK16);
            b.addEnumValue("VK_FORMAT_G10X6B10X6G10X6R10X6_422_UNORM_4PACK16", VkFormat::VK_FORMAT_G10X6B10X6G10X6R10X6_422_UNORM_4PACK16);
            b.addEnumValue("VK_FORMAT_B10X6G10X6R10X6G10X6_422_UNORM_4PACK16", VkFormat::VK_FORMAT_B10X6G10X6R10X6G10X6_422_UNORM_4PACK16);
            b.addEnumValue("VK_FORMAT_G10X6_B10X6_R10X6_3PLANE_420_UNORM_3PACK16", VkFormat::VK_FORMAT_G10X6_B10X6_R10X6_3PLANE_420_UNORM_3PACK16);
            b.addEnumValue("VK_FORMAT_G10X6_B10X6R10X6_2PLANE_420_UNORM_3PACK16", VkFormat::VK_FORMAT_G10X6_B10X6R10X6_2PLANE_420_UNORM_3PACK16);
            b.addEnumValue("VK_FORMAT_G10X6_B10X6_R10X6_3PLANE_422_UNORM_3PACK16", VkFormat::VK_FORMAT_G10X6_B10X6_R10X6_3PLANE_422_UNORM_3PACK16);
            b.addEnumValue("VK_FORMAT_G10X6_B10X6R10X6_2PLANE_422_UNORM_3PACK16", VkFormat::VK_FORMAT_G10X6_B10X6R10X6_2PLANE_422_UNORM_3PACK16);
            b.addEnumValue("VK_FORMAT_G10X6_B10X6_R10X6_3PLANE_444_UNORM_3PACK16", VkFormat::VK_FORMAT_G10X6_B10X6_R10X6_3PLANE_444_UNORM_3PACK16);
            b.addEnumValue("VK_FORMAT_R12X4_UNORM_PACK16", VkFormat::VK_FORMAT_R12X4_UNORM_PACK16);
            b.addEnumValue("VK_FORMAT_R12X4G12X4_UNORM_2PACK16", VkFormat::VK_FORMAT_R12X4G12X4_UNORM_2PACK16);
            b.addEnumValue("VK_FORMAT_R12X4G12X4B12X4A12X4_UNORM_4PACK16", VkFormat::VK_FORMAT_R12X4G12X4B12X4A12X4_UNORM_4PACK16);
            b.addEnumValue("VK_FORMAT_G12X4B12X4G12X4R12X4_422_UNORM_4PACK16", VkFormat::VK_FORMAT_G12X4B12X4G12X4R12X4_422_UNORM_4PACK16);
            b.addEnumValue("VK_FORMAT_B12X4G12X4R12X4G12X4_422_UNORM_4PACK16", VkFormat::VK_FORMAT_B12X4G12X4R12X4G12X4_422_UNORM_4PACK16);
            b.addEnumValue("VK_FORMAT_G12X4_B12X4_R12X4_3PLANE_420_UNORM_3PACK16", VkFormat::VK_FORMAT_G12X4_B12X4_R12X4_3PLANE_420_UNORM_3PACK16);
            b.addEnumValue("VK_FORMAT_G12X4_B12X4R12X4_2PLANE_420_UNORM_3PACK16", VkFormat::VK_FORMAT_G12X4_B12X4R12X4_2PLANE_420_UNORM_3PACK16);
            b.addEnumValue("VK_FORMAT_G12X4_B12X4_R12X4_3PLANE_422_UNORM_3PACK16", VkFormat::VK_FORMAT_G12X4_B12X4_R12X4_3PLANE_422_UNORM_3PACK16);
            b.addEnumValue("VK_FORMAT_G12X4_B12X4R12X4_2PLANE_422_UNORM_3PACK16", VkFormat::VK_FORMAT_G12X4_B12X4R12X4_2PLANE_422_UNORM_3PACK16);
            b.addEnumValue("VK_FORMAT_G12X4_B12X4_R12X4_3PLANE_444_UNORM_3PACK16", VkFormat::VK_FORMAT_G12X4_B12X4_R12X4_3PLANE_444_UNORM_3PACK16);
            b.addEnumValue("VK_FORMAT_G16B16G16R16_422_UNORM", VkFormat::VK_FORMAT_G16B16G16R16_422_UNORM);
            b.addEnumValue("VK_FORMAT_B16G16R16G16_422_UNORM", VkFormat::VK_FORMAT_B16G16R16G16_422_UNORM);
            b.addEnumValue("VK_FORMAT_G16_B16_R16_3PLANE_420_UNORM", VkFormat::VK_FORMAT_G16_B16_R16_3PLANE_420_UNORM);
            b.addEnumValue("VK_FORMAT_G16_B16R16_2PLANE_420_UNORM", VkFormat::VK_FORMAT_G16_B16R16_2PLANE_420_UNORM);
            b.addEnumValue("VK_FORMAT_G16_B16_R16_3PLANE_422_UNORM", VkFormat::VK_FORMAT_G16_B16_R16_3PLANE_422_UNORM);
            b.addEnumValue("VK_FORMAT_G16_B16R16_2PLANE_422_UNORM", VkFormat::VK_FORMAT_G16_B16R16_2PLANE_422_UNORM);
            b.addEnumValue("VK_FORMAT_G16_B16_R16_3PLANE_444_UNORM", VkFormat::VK_FORMAT_G16_B16_R16_3PLANE_444_UNORM);
            b.addEnumValue("VK_FORMAT_G8_B8R8_2PLANE_444_UNORM", VkFormat::VK_FORMAT_G8_B8R8_2PLANE_444_UNORM);
            b.addEnumValue("VK_FORMAT_G10X6_B10X6R10X6_2PLANE_444_UNORM_3PACK16", VkFormat::VK_FORMAT_G10X6_B10X6R10X6_2PLANE_444_UNORM_3PACK16);
            b.addEnumValue("VK_FORMAT_G12X4_B12X4R12X4_2PLANE_444_UNORM_3PACK16", VkFormat::VK_FORMAT_G12X4_B12X4R12X4_2PLANE_444_UNORM_3PACK16);
            b.addEnumValue("VK_FORMAT_G16_B16R16_2PLANE_444_UNORM", VkFormat::VK_FORMAT_G16_B16R16_2PLANE_444_UNORM);
            b.addEnumValue("VK_FORMAT_A4R4G4B4_UNORM_PACK16", VkFormat::VK_FORMAT_A4R4G4B4_UNORM_PACK16);
            b.addEnumValue("VK_FORMAT_A4B4G4R4_UNORM_PACK16", VkFormat::VK_FORMAT_A4B4G4R4_UNORM_PACK16);
            b.addEnumValue("VK_FORMAT_ASTC_4x4_SFLOAT_BLOCK", VkFormat::VK_FORMAT_ASTC_4x4_SFLOAT_BLOCK);
            b.addEnumValue("VK_FORMAT_ASTC_5x4_SFLOAT_BLOCK", VkFormat::VK_FORMAT_ASTC_5x4_SFLOAT_BLOCK);
            b.addEnumValue("VK_FORMAT_ASTC_5x5_SFLOAT_BLOCK", VkFormat::VK_FORMAT_ASTC_5x5_SFLOAT_BLOCK);
            b.addEnumValue("VK_FORMAT_ASTC_6x5_SFLOAT_BLOCK", VkFormat::VK_FORMAT_ASTC_6x5_SFLOAT_BLOCK);
            b.addEnumValue("VK_FORMAT_ASTC_6x6_SFLOAT_BLOCK", VkFormat::VK_FORMAT_ASTC_6x6_SFLOAT_BLOCK);
            b.addEnumValue("VK_FORMAT_ASTC_8x5_SFLOAT_BLOCK", VkFormat::VK_FORMAT_ASTC_8x5_SFLOAT_BLOCK);
            b.addEnumValue("VK_FORMAT_ASTC_8x6_SFLOAT_BLOCK", VkFormat::VK_FORMAT_ASTC_8x6_SFLOAT_BLOCK);
            b.addEnumValue("VK_FORMAT_ASTC_8x8_SFLOAT_BLOCK", VkFormat::VK_FORMAT_ASTC_8x8_SFLOAT_BLOCK);
            b.addEnumValue("VK_FORMAT_ASTC_10x5_SFLOAT_BLOCK", VkFormat::VK_FORMAT_ASTC_10x5_SFLOAT_BLOCK);
            b.addEnumValue("VK_FORMAT_ASTC_10x6_SFLOAT_BLOCK", VkFormat::VK_FORMAT_ASTC_10x6_SFLOAT_BLOCK);
            b.addEnumValue("VK_FORMAT_ASTC_10x8_SFLOAT_BLOCK", VkFormat::VK_FORMAT_ASTC_10x8_SFLOAT_BLOCK);
            b.addEnumValue("VK_FORMAT_ASTC_10x10_SFLOAT_BLOCK", VkFormat::VK_FORMAT_ASTC_10x10_SFLOAT_BLOCK);
            b.addEnumValue("VK_FORMAT_ASTC_12x10_SFLOAT_BLOCK", VkFormat::VK_FORMAT_ASTC_12x10_SFLOAT_BLOCK);
            b.addEnumValue("VK_FORMAT_ASTC_12x12_SFLOAT_BLOCK", VkFormat::VK_FORMAT_ASTC_12x12_SFLOAT_BLOCK);
            b.addEnumValue("VK_FORMAT_PVRTC1_2BPP_UNORM_BLOCK_IMG", VkFormat::VK_FORMAT_PVRTC1_2BPP_UNORM_BLOCK_IMG);
            b.addEnumValue("VK_FORMAT_PVRTC1_4BPP_UNORM_BLOCK_IMG", VkFormat::VK_FORMAT_PVRTC1_4BPP_UNORM_BLOCK_IMG);
            b.addEnumValue("VK_FORMAT_PVRTC2_2BPP_UNORM_BLOCK_IMG", VkFormat::VK_FORMAT_PVRTC2_2BPP_UNORM_BLOCK_IMG);
            b.addEnumValue("VK_FORMAT_PVRTC2_4BPP_UNORM_BLOCK_IMG", VkFormat::VK_FORMAT_PVRTC2_4BPP_UNORM_BLOCK_IMG);
            b.addEnumValue("VK_FORMAT_PVRTC1_2BPP_SRGB_BLOCK_IMG", VkFormat::VK_FORMAT_PVRTC1_2BPP_SRGB_BLOCK_IMG);
            b.addEnumValue("VK_FORMAT_PVRTC1_4BPP_SRGB_BLOCK_IMG", VkFormat::VK_FORMAT_PVRTC1_4BPP_SRGB_BLOCK_IMG);
            b.addEnumValue("VK_FORMAT_PVRTC2_2BPP_SRGB_BLOCK_IMG", VkFormat::VK_FORMAT_PVRTC2_2BPP_SRGB_BLOCK_IMG);
            b.addEnumValue("VK_FORMAT_PVRTC2_4BPP_SRGB_BLOCK_IMG", VkFormat::VK_FORMAT_PVRTC2_4BPP_SRGB_BLOCK_IMG);
            b.addEnumValue("VK_FORMAT_R16G16_S10_5_NV", VkFormat::VK_FORMAT_R16G16_S10_5_NV);
            b.addEnumValue("VK_FORMAT_A1B5G5R5_UNORM_PACK16_KHR", VkFormat::VK_FORMAT_A1B5G5R5_UNORM_PACK16_KHR);
            b.addEnumValue("VK_FORMAT_A8_UNORM_KHR", VkFormat::VK_FORMAT_A8_UNORM_KHR);
            b.addEnumValue("VK_FORMAT_ASTC_4x4_SFLOAT_BLOCK_EXT", VkFormat::VK_FORMAT_ASTC_4x4_SFLOAT_BLOCK_EXT);
            b.addEnumValue("VK_FORMAT_ASTC_5x4_SFLOAT_BLOCK_EXT", VkFormat::VK_FORMAT_ASTC_5x4_SFLOAT_BLOCK_EXT);
            b.addEnumValue("VK_FORMAT_ASTC_5x5_SFLOAT_BLOCK_EXT", VkFormat::VK_FORMAT_ASTC_5x5_SFLOAT_BLOCK_EXT);
            b.addEnumValue("VK_FORMAT_ASTC_6x5_SFLOAT_BLOCK_EXT", VkFormat::VK_FORMAT_ASTC_6x5_SFLOAT_BLOCK_EXT);
            b.addEnumValue("VK_FORMAT_ASTC_6x6_SFLOAT_BLOCK_EXT", VkFormat::VK_FORMAT_ASTC_6x6_SFLOAT_BLOCK_EXT);
            b.addEnumValue("VK_FORMAT_ASTC_8x5_SFLOAT_BLOCK_EXT", VkFormat::VK_FORMAT_ASTC_8x5_SFLOAT_BLOCK_EXT);
            b.addEnumValue("VK_FORMAT_ASTC_8x6_SFLOAT_BLOCK_EXT", VkFormat::VK_FORMAT_ASTC_8x6_SFLOAT_BLOCK_EXT);
            b.addEnumValue("VK_FORMAT_ASTC_8x8_SFLOAT_BLOCK_EXT", VkFormat::VK_FORMAT_ASTC_8x8_SFLOAT_BLOCK_EXT);
            b.addEnumValue("VK_FORMAT_ASTC_10x5_SFLOAT_BLOCK_EXT", VkFormat::VK_FORMAT_ASTC_10x5_SFLOAT_BLOCK_EXT);
            b.addEnumValue("VK_FORMAT_ASTC_10x6_SFLOAT_BLOCK_EXT", VkFormat::VK_FORMAT_ASTC_10x6_SFLOAT_BLOCK_EXT);
            b.addEnumValue("VK_FORMAT_ASTC_10x8_SFLOAT_BLOCK_EXT", VkFormat::VK_FORMAT_ASTC_10x8_SFLOAT_BLOCK_EXT);
            b.addEnumValue("VK_FORMAT_ASTC_10x10_SFLOAT_BLOCK_EXT", VkFormat::VK_FORMAT_ASTC_10x10_SFLOAT_BLOCK_EXT);
            b.addEnumValue("VK_FORMAT_ASTC_12x10_SFLOAT_BLOCK_EXT", VkFormat::VK_FORMAT_ASTC_12x10_SFLOAT_BLOCK_EXT);
            b.addEnumValue("VK_FORMAT_ASTC_12x12_SFLOAT_BLOCK_EXT", VkFormat::VK_FORMAT_ASTC_12x12_SFLOAT_BLOCK_EXT);
            b.addEnumValue("VK_FORMAT_G8B8G8R8_422_UNORM_KHR", VkFormat::VK_FORMAT_G8B8G8R8_422_UNORM_KHR);
            b.addEnumValue("VK_FORMAT_B8G8R8G8_422_UNORM_KHR", VkFormat::VK_FORMAT_B8G8R8G8_422_UNORM_KHR);
            b.addEnumValue("VK_FORMAT_G8_B8_R8_3PLANE_420_UNORM_KHR", VkFormat::VK_FORMAT_G8_B8_R8_3PLANE_420_UNORM_KHR);
            b.addEnumValue("VK_FORMAT_G8_B8R8_2PLANE_420_UNORM_KHR", VkFormat::VK_FORMAT_G8_B8R8_2PLANE_420_UNORM_KHR);
            b.addEnumValue("VK_FORMAT_G8_B8_R8_3PLANE_422_UNORM_KHR", VkFormat::VK_FORMAT_G8_B8_R8_3PLANE_422_UNORM_KHR);
            b.addEnumValue("VK_FORMAT_G8_B8R8_2PLANE_422_UNORM_KHR", VkFormat::VK_FORMAT_G8_B8R8_2PLANE_422_UNORM_KHR);
            b.addEnumValue("VK_FORMAT_G8_B8_R8_3PLANE_444_UNORM_KHR", VkFormat::VK_FORMAT_G8_B8_R8_3PLANE_444_UNORM_KHR);
            b.addEnumValue("VK_FORMAT_R10X6_UNORM_PACK16_KHR", VkFormat::VK_FORMAT_R10X6_UNORM_PACK16_KHR);
            b.addEnumValue("VK_FORMAT_R10X6G10X6_UNORM_2PACK16_KHR", VkFormat::VK_FORMAT_R10X6G10X6_UNORM_2PACK16_KHR);
            b.addEnumValue("VK_FORMAT_R10X6G10X6B10X6A10X6_UNORM_4PACK16_KHR", VkFormat::VK_FORMAT_R10X6G10X6B10X6A10X6_UNORM_4PACK16_KHR);
            b.addEnumValue("VK_FORMAT_G10X6B10X6G10X6R10X6_422_UNORM_4PACK16_KHR", VkFormat::VK_FORMAT_G10X6B10X6G10X6R10X6_422_UNORM_4PACK16_KHR);
            b.addEnumValue("VK_FORMAT_B10X6G10X6R10X6G10X6_422_UNORM_4PACK16_KHR", VkFormat::VK_FORMAT_B10X6G10X6R10X6G10X6_422_UNORM_4PACK16_KHR);
            b.addEnumValue("VK_FORMAT_G10X6_B10X6_R10X6_3PLANE_420_UNORM_3PACK16_KHR", VkFormat::VK_FORMAT_G10X6_B10X6_R10X6_3PLANE_420_UNORM_3PACK16_KHR);
            b.addEnumValue("VK_FORMAT_G10X6_B10X6R10X6_2PLANE_420_UNORM_3PACK16_KHR", VkFormat::VK_FORMAT_G10X6_B10X6R10X6_2PLANE_420_UNORM_3PACK16_KHR);
            b.addEnumValue("VK_FORMAT_G10X6_B10X6_R10X6_3PLANE_422_UNORM_3PACK16_KHR", VkFormat::VK_FORMAT_G10X6_B10X6_R10X6_3PLANE_422_UNORM_3PACK16_KHR);
            b.addEnumValue("VK_FORMAT_G10X6_B10X6R10X6_2PLANE_422_UNORM_3PACK16_KHR", VkFormat::VK_FORMAT_G10X6_B10X6R10X6_2PLANE_422_UNORM_3PACK16_KHR);
            b.addEnumValue("VK_FORMAT_G10X6_B10X6_R10X6_3PLANE_444_UNORM_3PACK16_KHR", VkFormat::VK_FORMAT_G10X6_B10X6_R10X6_3PLANE_444_UNORM_3PACK16_KHR);
            b.addEnumValue("VK_FORMAT_R12X4_UNORM_PACK16_KHR", VkFormat::VK_FORMAT_R12X4_UNORM_PACK16_KHR);
            b.addEnumValue("VK_FORMAT_R12X4G12X4_UNORM_2PACK16_KHR", VkFormat::VK_FORMAT_R12X4G12X4_UNORM_2PACK16_KHR);
            b.addEnumValue("VK_FORMAT_R12X4G12X4B12X4A12X4_UNORM_4PACK16_KHR", VkFormat::VK_FORMAT_R12X4G12X4B12X4A12X4_UNORM_4PACK16_KHR);
            b.addEnumValue("VK_FORMAT_G12X4B12X4G12X4R12X4_422_UNORM_4PACK16_KHR", VkFormat::VK_FORMAT_G12X4B12X4G12X4R12X4_422_UNORM_4PACK16_KHR);
            b.addEnumValue("VK_FORMAT_B12X4G12X4R12X4G12X4_422_UNORM_4PACK16_KHR", VkFormat::VK_FORMAT_B12X4G12X4R12X4G12X4_422_UNORM_4PACK16_KHR);
            b.addEnumValue("VK_FORMAT_G12X4_B12X4_R12X4_3PLANE_420_UNORM_3PACK16_KHR", VkFormat::VK_FORMAT_G12X4_B12X4_R12X4_3PLANE_420_UNORM_3PACK16_KHR);
            b.addEnumValue("VK_FORMAT_G12X4_B12X4R12X4_2PLANE_420_UNORM_3PACK16_KHR", VkFormat::VK_FORMAT_G12X4_B12X4R12X4_2PLANE_420_UNORM_3PACK16_KHR);
            b.addEnumValue("VK_FORMAT_G12X4_B12X4_R12X4_3PLANE_422_UNORM_3PACK16_KHR", VkFormat::VK_FORMAT_G12X4_B12X4_R12X4_3PLANE_422_UNORM_3PACK16_KHR);
            b.addEnumValue("VK_FORMAT_G12X4_B12X4R12X4_2PLANE_422_UNORM_3PACK16_KHR", VkFormat::VK_FORMAT_G12X4_B12X4R12X4_2PLANE_422_UNORM_3PACK16_KHR);
            b.addEnumValue("VK_FORMAT_G12X4_B12X4_R12X4_3PLANE_444_UNORM_3PACK16_KHR", VkFormat::VK_FORMAT_G12X4_B12X4_R12X4_3PLANE_444_UNORM_3PACK16_KHR);
            b.addEnumValue("VK_FORMAT_G16B16G16R16_422_UNORM_KHR", VkFormat::VK_FORMAT_G16B16G16R16_422_UNORM_KHR);
            b.addEnumValue("VK_FORMAT_B16G16R16G16_422_UNORM_KHR", VkFormat::VK_FORMAT_B16G16R16G16_422_UNORM_KHR);
            b.addEnumValue("VK_FORMAT_G16_B16_R16_3PLANE_420_UNORM_KHR", VkFormat::VK_FORMAT_G16_B16_R16_3PLANE_420_UNORM_KHR);
            b.addEnumValue("VK_FORMAT_G16_B16R16_2PLANE_420_UNORM_KHR", VkFormat::VK_FORMAT_G16_B16R16_2PLANE_420_UNORM_KHR);
            b.addEnumValue("VK_FORMAT_G16_B16_R16_3PLANE_422_UNORM_KHR", VkFormat::VK_FORMAT_G16_B16_R16_3PLANE_422_UNORM_KHR);
            b.addEnumValue("VK_FORMAT_G16_B16R16_2PLANE_422_UNORM_KHR", VkFormat::VK_FORMAT_G16_B16R16_2PLANE_422_UNORM_KHR);
            b.addEnumValue("VK_FORMAT_G16_B16_R16_3PLANE_444_UNORM_KHR", VkFormat::VK_FORMAT_G16_B16_R16_3PLANE_444_UNORM_KHR);
            b.addEnumValue("VK_FORMAT_G8_B8R8_2PLANE_444_UNORM_EXT", VkFormat::VK_FORMAT_G8_B8R8_2PLANE_444_UNORM_EXT);
            b.addEnumValue("VK_FORMAT_G10X6_B10X6R10X6_2PLANE_444_UNORM_3PACK16_EXT", VkFormat::VK_FORMAT_G10X6_B10X6R10X6_2PLANE_444_UNORM_3PACK16_EXT);
            b.addEnumValue("VK_FORMAT_G12X4_B12X4R12X4_2PLANE_444_UNORM_3PACK16_EXT", VkFormat::VK_FORMAT_G12X4_B12X4R12X4_2PLANE_444_UNORM_3PACK16_EXT);
            b.addEnumValue("VK_FORMAT_G16_B16R16_2PLANE_444_UNORM_EXT", VkFormat::VK_FORMAT_G16_B16R16_2PLANE_444_UNORM_EXT);
            b.addEnumValue("VK_FORMAT_A4R4G4B4_UNORM_PACK16_EXT", VkFormat::VK_FORMAT_A4R4G4B4_UNORM_PACK16_EXT);
            b.addEnumValue("VK_FORMAT_A4B4G4R4_UNORM_PACK16_EXT", VkFormat::VK_FORMAT_A4B4G4R4_UNORM_PACK16_EXT);
        }

        {
            bind::EnumTypeBuilder<VkPipelineStageFlagBits> b = ns->type<VkPipelineStageFlagBits>("VkPipelineStageFlags");
            b.addEnumValue("VK_PIPELINE_STAGE_TOP_OF_PIPE_BIT", VkPipelineStageFlagBits::VK_PIPELINE_STAGE_TOP_OF_PIPE_BIT);
            b.addEnumValue("VK_PIPELINE_STAGE_DRAW_INDIRECT_BIT", VkPipelineStageFlagBits::VK_PIPELINE_STAGE_DRAW_INDIRECT_BIT);
            b.addEnumValue("VK_PIPELINE_STAGE_VERTEX_INPUT_BIT", VkPipelineStageFlagBits::VK_PIPELINE_STAGE_VERTEX_INPUT_BIT);
            b.addEnumValue("VK_PIPELINE_STAGE_VERTEX_SHADER_BIT", VkPipelineStageFlagBits::VK_PIPELINE_STAGE_VERTEX_SHADER_BIT);
            b.addEnumValue("VK_PIPELINE_STAGE_TESSELLATION_CONTROL_SHADER_BIT", VkPipelineStageFlagBits::VK_PIPELINE_STAGE_TESSELLATION_CONTROL_SHADER_BIT);
            b.addEnumValue("VK_PIPELINE_STAGE_TESSELLATION_EVALUATION_SHADER_BIT", VkPipelineStageFlagBits::VK_PIPELINE_STAGE_TESSELLATION_EVALUATION_SHADER_BIT);
            b.addEnumValue("VK_PIPELINE_STAGE_GEOMETRY_SHADER_BIT", VkPipelineStageFlagBits::VK_PIPELINE_STAGE_GEOMETRY_SHADER_BIT);
            b.addEnumValue("VK_PIPELINE_STAGE_FRAGMENT_SHADER_BIT", VkPipelineStageFlagBits::VK_PIPELINE_STAGE_FRAGMENT_SHADER_BIT);
            b.addEnumValue("VK_PIPELINE_STAGE_EARLY_FRAGMENT_TESTS_BIT", VkPipelineStageFlagBits::VK_PIPELINE_STAGE_EARLY_FRAGMENT_TESTS_BIT);
            b.addEnumValue("VK_PIPELINE_STAGE_LATE_FRAGMENT_TESTS_BIT", VkPipelineStageFlagBits::VK_PIPELINE_STAGE_LATE_FRAGMENT_TESTS_BIT);
            b.addEnumValue("VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT", VkPipelineStageFlagBits::VK_PIPELINE_STAGE_COLOR_ATTACHMENT_OUTPUT_BIT);
            b.addEnumValue("VK_PIPELINE_STAGE_COMPUTE_SHADER_BIT", VkPipelineStageFlagBits::VK_PIPELINE_STAGE_COMPUTE_SHADER_BIT);
            b.addEnumValue("VK_PIPELINE_STAGE_TRANSFER_BIT", VkPipelineStageFlagBits::VK_PIPELINE_STAGE_TRANSFER_BIT);
            b.addEnumValue("VK_PIPELINE_STAGE_BOTTOM_OF_PIPE_BIT", VkPipelineStageFlagBits::VK_PIPELINE_STAGE_BOTTOM_OF_PIPE_BIT);
            b.addEnumValue("VK_PIPELINE_STAGE_HOST_BIT", VkPipelineStageFlagBits::VK_PIPELINE_STAGE_HOST_BIT);
            b.addEnumValue("VK_PIPELINE_STAGE_ALL_GRAPHICS_BIT", VkPipelineStageFlagBits::VK_PIPELINE_STAGE_ALL_GRAPHICS_BIT);
            b.addEnumValue("VK_PIPELINE_STAGE_ALL_COMMANDS_BIT", VkPipelineStageFlagBits::VK_PIPELINE_STAGE_ALL_COMMANDS_BIT);
            b.addEnumValue("VK_PIPELINE_STAGE_NONE", VkPipelineStageFlagBits::VK_PIPELINE_STAGE_NONE);
            b.addEnumValue("VK_PIPELINE_STAGE_TRANSFORM_FEEDBACK_BIT_EXT", VkPipelineStageFlagBits::VK_PIPELINE_STAGE_TRANSFORM_FEEDBACK_BIT_EXT);
            b.addEnumValue("VK_PIPELINE_STAGE_CONDITIONAL_RENDERING_BIT_EXT", VkPipelineStageFlagBits::VK_PIPELINE_STAGE_CONDITIONAL_RENDERING_BIT_EXT);
            b.addEnumValue("VK_PIPELINE_STAGE_ACCELERATION_STRUCTURE_BUILD_BIT_KHR", VkPipelineStageFlagBits::VK_PIPELINE_STAGE_ACCELERATION_STRUCTURE_BUILD_BIT_KHR);
            b.addEnumValue("VK_PIPELINE_STAGE_RAY_TRACING_SHADER_BIT_KHR", VkPipelineStageFlagBits::VK_PIPELINE_STAGE_RAY_TRACING_SHADER_BIT_KHR);
            b.addEnumValue("VK_PIPELINE_STAGE_FRAGMENT_DENSITY_PROCESS_BIT_EXT", VkPipelineStageFlagBits::VK_PIPELINE_STAGE_FRAGMENT_DENSITY_PROCESS_BIT_EXT);
            b.addEnumValue("VK_PIPELINE_STAGE_FRAGMENT_SHADING_RATE_ATTACHMENT_BIT_KHR", VkPipelineStageFlagBits::VK_PIPELINE_STAGE_FRAGMENT_SHADING_RATE_ATTACHMENT_BIT_KHR);
            b.addEnumValue("VK_PIPELINE_STAGE_COMMAND_PREPROCESS_BIT_NV", VkPipelineStageFlagBits::VK_PIPELINE_STAGE_COMMAND_PREPROCESS_BIT_NV);
            b.addEnumValue("VK_PIPELINE_STAGE_TASK_SHADER_BIT_EXT", VkPipelineStageFlagBits::VK_PIPELINE_STAGE_TASK_SHADER_BIT_EXT);
            b.addEnumValue("VK_PIPELINE_STAGE_MESH_SHADER_BIT_EXT", VkPipelineStageFlagBits::VK_PIPELINE_STAGE_MESH_SHADER_BIT_EXT);
            b.addEnumValue("VK_PIPELINE_STAGE_SHADING_RATE_IMAGE_BIT_NV", VkPipelineStageFlagBits::VK_PIPELINE_STAGE_SHADING_RATE_IMAGE_BIT_NV);
            b.addEnumValue("VK_PIPELINE_STAGE_RAY_TRACING_SHADER_BIT_NV", VkPipelineStageFlagBits::VK_PIPELINE_STAGE_RAY_TRACING_SHADER_BIT_NV);
            b.addEnumValue("VK_PIPELINE_STAGE_ACCELERATION_STRUCTURE_BUILD_BIT_NV", VkPipelineStageFlagBits::VK_PIPELINE_STAGE_ACCELERATION_STRUCTURE_BUILD_BIT_NV);
            b.addEnumValue("VK_PIPELINE_STAGE_TASK_SHADER_BIT_NV", VkPipelineStageFlagBits::VK_PIPELINE_STAGE_TASK_SHADER_BIT_NV);
            b.addEnumValue("VK_PIPELINE_STAGE_MESH_SHADER_BIT_NV", VkPipelineStageFlagBits::VK_PIPELINE_STAGE_MESH_SHADER_BIT_NV);
            b.addEnumValue("VK_PIPELINE_STAGE_NONE_KHR", VkPipelineStageFlagBits::VK_PIPELINE_STAGE_NONE_KHR);
        }

        {
            bind::EnumTypeBuilder<VkColorSpaceKHR> b = ns->type<VkColorSpaceKHR>("VkColorSpaceKHR");
            b.addEnumValue("VK_COLOR_SPACE_SRGB_NONLINEAR_KHR", VkColorSpaceKHR::VK_COLOR_SPACE_SRGB_NONLINEAR_KHR);
            b.addEnumValue("VK_COLOR_SPACE_DISPLAY_P3_NONLINEAR_EXT", VkColorSpaceKHR::VK_COLOR_SPACE_DISPLAY_P3_NONLINEAR_EXT);
            b.addEnumValue("VK_COLOR_SPACE_EXTENDED_SRGB_LINEAR_EXT", VkColorSpaceKHR::VK_COLOR_SPACE_EXTENDED_SRGB_LINEAR_EXT);
            b.addEnumValue("VK_COLOR_SPACE_DISPLAY_P3_LINEAR_EXT", VkColorSpaceKHR::VK_COLOR_SPACE_DISPLAY_P3_LINEAR_EXT);
            b.addEnumValue("VK_COLOR_SPACE_DCI_P3_NONLINEAR_EXT", VkColorSpaceKHR::VK_COLOR_SPACE_DCI_P3_NONLINEAR_EXT);
            b.addEnumValue("VK_COLOR_SPACE_BT709_LINEAR_EXT", VkColorSpaceKHR::VK_COLOR_SPACE_BT709_LINEAR_EXT);
            b.addEnumValue("VK_COLOR_SPACE_BT709_NONLINEAR_EXT", VkColorSpaceKHR::VK_COLOR_SPACE_BT709_NONLINEAR_EXT);
            b.addEnumValue("VK_COLOR_SPACE_BT2020_LINEAR_EXT", VkColorSpaceKHR::VK_COLOR_SPACE_BT2020_LINEAR_EXT);
            b.addEnumValue("VK_COLOR_SPACE_HDR10_ST2084_EXT", VkColorSpaceKHR::VK_COLOR_SPACE_HDR10_ST2084_EXT);
            b.addEnumValue("VK_COLOR_SPACE_DOLBYVISION_EXT", VkColorSpaceKHR::VK_COLOR_SPACE_DOLBYVISION_EXT);
            b.addEnumValue("VK_COLOR_SPACE_HDR10_HLG_EXT", VkColorSpaceKHR::VK_COLOR_SPACE_HDR10_HLG_EXT);
            b.addEnumValue("VK_COLOR_SPACE_ADOBERGB_LINEAR_EXT", VkColorSpaceKHR::VK_COLOR_SPACE_ADOBERGB_LINEAR_EXT);
            b.addEnumValue("VK_COLOR_SPACE_ADOBERGB_NONLINEAR_EXT", VkColorSpaceKHR::VK_COLOR_SPACE_ADOBERGB_NONLINEAR_EXT);
            b.addEnumValue("VK_COLOR_SPACE_PASS_THROUGH_EXT", VkColorSpaceKHR::VK_COLOR_SPACE_PASS_THROUGH_EXT);
            b.addEnumValue("VK_COLOR_SPACE_EXTENDED_SRGB_NONLINEAR_EXT", VkColorSpaceKHR::VK_COLOR_SPACE_EXTENDED_SRGB_NONLINEAR_EXT);
            b.addEnumValue("VK_COLOR_SPACE_DISPLAY_NATIVE_AMD", VkColorSpaceKHR::VK_COLOR_SPACE_DISPLAY_NATIVE_AMD);
            b.addEnumValue("VK_COLORSPACE_SRGB_NONLINEAR_KHR", VkColorSpaceKHR::VK_COLORSPACE_SRGB_NONLINEAR_KHR);
            b.addEnumValue("VK_COLOR_SPACE_DCI_P3_LINEAR_EXT", VkColorSpaceKHR::VK_COLOR_SPACE_DCI_P3_LINEAR_EXT);
        }

        {
            bind::EnumTypeBuilder<VkPresentModeKHR> b = ns->type<VkPresentModeKHR>("VkPresentModeKHR");
            b.addEnumValue("VK_PRESENT_MODE_IMMEDIATE_KHR", VkPresentModeKHR::VK_PRESENT_MODE_IMMEDIATE_KHR);
            b.addEnumValue("VK_PRESENT_MODE_MAILBOX_KHR", VkPresentModeKHR::VK_PRESENT_MODE_MAILBOX_KHR);
            b.addEnumValue("VK_PRESENT_MODE_FIFO_KHR", VkPresentModeKHR::VK_PRESENT_MODE_FIFO_KHR);
            b.addEnumValue("VK_PRESENT_MODE_FIFO_RELAXED_KHR", VkPresentModeKHR::VK_PRESENT_MODE_FIFO_RELAXED_KHR);
            b.addEnumValue("VK_PRESENT_MODE_SHARED_DEMAND_REFRESH_KHR", VkPresentModeKHR::VK_PRESENT_MODE_SHARED_DEMAND_REFRESH_KHR);
            b.addEnumValue("VK_PRESENT_MODE_SHARED_CONTINUOUS_REFRESH_KHR", VkPresentModeKHR::VK_PRESENT_MODE_SHARED_CONTINUOUS_REFRESH_KHR);
        }

        {
            bind::EnumTypeBuilder<VkSurfaceTransformFlagBitsKHR> b = ns->type<VkSurfaceTransformFlagBitsKHR>("VkSurfaceTransformFlagsKHR");
            b.addEnumValue("VK_SURFACE_TRANSFORM_IDENTITY_BIT_KHR", VkSurfaceTransformFlagBitsKHR::VK_SURFACE_TRANSFORM_IDENTITY_BIT_KHR);
            b.addEnumValue("VK_SURFACE_TRANSFORM_ROTATE_90_BIT_KHR", VkSurfaceTransformFlagBitsKHR::VK_SURFACE_TRANSFORM_ROTATE_90_BIT_KHR);
            b.addEnumValue("VK_SURFACE_TRANSFORM_ROTATE_180_BIT_KHR", VkSurfaceTransformFlagBitsKHR::VK_SURFACE_TRANSFORM_ROTATE_180_BIT_KHR);
            b.addEnumValue("VK_SURFACE_TRANSFORM_ROTATE_270_BIT_KHR", VkSurfaceTransformFlagBitsKHR::VK_SURFACE_TRANSFORM_ROTATE_270_BIT_KHR);
            b.addEnumValue("VK_SURFACE_TRANSFORM_HORIZONTAL_MIRROR_BIT_KHR", VkSurfaceTransformFlagBitsKHR::VK_SURFACE_TRANSFORM_HORIZONTAL_MIRROR_BIT_KHR);
            b.addEnumValue("VK_SURFACE_TRANSFORM_HORIZONTAL_MIRROR_ROTATE_90_BIT_KHR", VkSurfaceTransformFlagBitsKHR::VK_SURFACE_TRANSFORM_HORIZONTAL_MIRROR_ROTATE_90_BIT_KHR);
            b.addEnumValue("VK_SURFACE_TRANSFORM_HORIZONTAL_MIRROR_ROTATE_180_BIT_KHR", VkSurfaceTransformFlagBitsKHR::VK_SURFACE_TRANSFORM_HORIZONTAL_MIRROR_ROTATE_180_BIT_KHR);
            b.addEnumValue("VK_SURFACE_TRANSFORM_HORIZONTAL_MIRROR_ROTATE_270_BIT_KHR", VkSurfaceTransformFlagBitsKHR::VK_SURFACE_TRANSFORM_HORIZONTAL_MIRROR_ROTATE_270_BIT_KHR);
            b.addEnumValue("VK_SURFACE_TRANSFORM_INHERIT_BIT_KHR", VkSurfaceTransformFlagBitsKHR::VK_SURFACE_TRANSFORM_INHERIT_BIT_KHR);
        }

        {
            bind::EnumTypeBuilder<VkCompositeAlphaFlagBitsKHR> b = ns->type<VkCompositeAlphaFlagBitsKHR>("VkCompositeAlphaFlagsKHR");
            b.addEnumValue("VK_COMPOSITE_ALPHA_OPAQUE_BIT_KHR", VkCompositeAlphaFlagBitsKHR::VK_COMPOSITE_ALPHA_OPAQUE_BIT_KHR);
            b.addEnumValue("VK_COMPOSITE_ALPHA_PRE_MULTIPLIED_BIT_KHR", VkCompositeAlphaFlagBitsKHR::VK_COMPOSITE_ALPHA_PRE_MULTIPLIED_BIT_KHR);
            b.addEnumValue("VK_COMPOSITE_ALPHA_POST_MULTIPLIED_BIT_KHR", VkCompositeAlphaFlagBitsKHR::VK_COMPOSITE_ALPHA_POST_MULTIPLIED_BIT_KHR);
            b.addEnumValue("VK_COMPOSITE_ALPHA_INHERIT_BIT_KHR", VkCompositeAlphaFlagBitsKHR::VK_COMPOSITE_ALPHA_INHERIT_BIT_KHR);
        }

        {
            bind::EnumTypeBuilder<VkShaderStageFlagBits> b = ns->type<VkShaderStageFlagBits>("VkShaderStageFlags");
            b.addEnumValue("VK_SHADER_STAGE_VERTEX_BIT", VkShaderStageFlagBits::VK_SHADER_STAGE_VERTEX_BIT);
            b.addEnumValue("VK_SHADER_STAGE_TESSELLATION_CONTROL_BIT", VkShaderStageFlagBits::VK_SHADER_STAGE_TESSELLATION_CONTROL_BIT);
            b.addEnumValue("VK_SHADER_STAGE_TESSELLATION_EVALUATION_BIT", VkShaderStageFlagBits::VK_SHADER_STAGE_TESSELLATION_EVALUATION_BIT);
            b.addEnumValue("VK_SHADER_STAGE_GEOMETRY_BIT", VkShaderStageFlagBits::VK_SHADER_STAGE_GEOMETRY_BIT);
            b.addEnumValue("VK_SHADER_STAGE_FRAGMENT_BIT", VkShaderStageFlagBits::VK_SHADER_STAGE_FRAGMENT_BIT);
            b.addEnumValue("VK_SHADER_STAGE_COMPUTE_BIT", VkShaderStageFlagBits::VK_SHADER_STAGE_COMPUTE_BIT);
            b.addEnumValue("VK_SHADER_STAGE_ALL_GRAPHICS", VkShaderStageFlagBits::VK_SHADER_STAGE_ALL_GRAPHICS);
            b.addEnumValue("VK_SHADER_STAGE_ALL", VkShaderStageFlagBits::VK_SHADER_STAGE_ALL);
            b.addEnumValue("VK_SHADER_STAGE_RAYGEN_BIT_KHR", VkShaderStageFlagBits::VK_SHADER_STAGE_RAYGEN_BIT_KHR);
            b.addEnumValue("VK_SHADER_STAGE_ANY_HIT_BIT_KHR", VkShaderStageFlagBits::VK_SHADER_STAGE_ANY_HIT_BIT_KHR);
            b.addEnumValue("VK_SHADER_STAGE_CLOSEST_HIT_BIT_KHR", VkShaderStageFlagBits::VK_SHADER_STAGE_CLOSEST_HIT_BIT_KHR);
            b.addEnumValue("VK_SHADER_STAGE_MISS_BIT_KHR", VkShaderStageFlagBits::VK_SHADER_STAGE_MISS_BIT_KHR);
            b.addEnumValue("VK_SHADER_STAGE_INTERSECTION_BIT_KHR", VkShaderStageFlagBits::VK_SHADER_STAGE_INTERSECTION_BIT_KHR);
            b.addEnumValue("VK_SHADER_STAGE_CALLABLE_BIT_KHR", VkShaderStageFlagBits::VK_SHADER_STAGE_CALLABLE_BIT_KHR);
            b.addEnumValue("VK_SHADER_STAGE_TASK_BIT_EXT", VkShaderStageFlagBits::VK_SHADER_STAGE_TASK_BIT_EXT);
            b.addEnumValue("VK_SHADER_STAGE_MESH_BIT_EXT", VkShaderStageFlagBits::VK_SHADER_STAGE_MESH_BIT_EXT);
            b.addEnumValue("VK_SHADER_STAGE_SUBPASS_SHADING_BIT_HUAWEI", VkShaderStageFlagBits::VK_SHADER_STAGE_SUBPASS_SHADING_BIT_HUAWEI);
            b.addEnumValue("VK_SHADER_STAGE_CLUSTER_CULLING_BIT_HUAWEI", VkShaderStageFlagBits::VK_SHADER_STAGE_CLUSTER_CULLING_BIT_HUAWEI);
            b.addEnumValue("VK_SHADER_STAGE_RAYGEN_BIT_NV", VkShaderStageFlagBits::VK_SHADER_STAGE_RAYGEN_BIT_NV);
            b.addEnumValue("VK_SHADER_STAGE_ANY_HIT_BIT_NV", VkShaderStageFlagBits::VK_SHADER_STAGE_ANY_HIT_BIT_NV);
            b.addEnumValue("VK_SHADER_STAGE_CLOSEST_HIT_BIT_NV", VkShaderStageFlagBits::VK_SHADER_STAGE_CLOSEST_HIT_BIT_NV);
            b.addEnumValue("VK_SHADER_STAGE_MISS_BIT_NV", VkShaderStageFlagBits::VK_SHADER_STAGE_MISS_BIT_NV);
            b.addEnumValue("VK_SHADER_STAGE_INTERSECTION_BIT_NV", VkShaderStageFlagBits::VK_SHADER_STAGE_INTERSECTION_BIT_NV);
            b.addEnumValue("VK_SHADER_STAGE_CALLABLE_BIT_NV", VkShaderStageFlagBits::VK_SHADER_STAGE_CALLABLE_BIT_NV);
            b.addEnumValue("VK_SHADER_STAGE_TASK_BIT_NV", VkShaderStageFlagBits::VK_SHADER_STAGE_TASK_BIT_NV);
            b.addEnumValue("VK_SHADER_STAGE_MESH_BIT_NV", VkShaderStageFlagBits::VK_SHADER_STAGE_MESH_BIT_NV);
        }

        {
            bind::EnumTypeBuilder<VkDynamicState> b = ns->type<VkDynamicState>("VkDynamicState");
            b.addEnumValue("VK_DYNAMIC_STATE_VIEWPORT", VkDynamicState::VK_DYNAMIC_STATE_VIEWPORT);
            b.addEnumValue("VK_DYNAMIC_STATE_SCISSOR", VkDynamicState::VK_DYNAMIC_STATE_SCISSOR);
            b.addEnumValue("VK_DYNAMIC_STATE_LINE_WIDTH", VkDynamicState::VK_DYNAMIC_STATE_LINE_WIDTH);
            b.addEnumValue("VK_DYNAMIC_STATE_DEPTH_BIAS", VkDynamicState::VK_DYNAMIC_STATE_DEPTH_BIAS);
            b.addEnumValue("VK_DYNAMIC_STATE_BLEND_CONSTANTS", VkDynamicState::VK_DYNAMIC_STATE_BLEND_CONSTANTS);
            b.addEnumValue("VK_DYNAMIC_STATE_DEPTH_BOUNDS", VkDynamicState::VK_DYNAMIC_STATE_DEPTH_BOUNDS);
            b.addEnumValue("VK_DYNAMIC_STATE_STENCIL_COMPARE_MASK", VkDynamicState::VK_DYNAMIC_STATE_STENCIL_COMPARE_MASK);
            b.addEnumValue("VK_DYNAMIC_STATE_STENCIL_WRITE_MASK", VkDynamicState::VK_DYNAMIC_STATE_STENCIL_WRITE_MASK);
            b.addEnumValue("VK_DYNAMIC_STATE_STENCIL_REFERENCE", VkDynamicState::VK_DYNAMIC_STATE_STENCIL_REFERENCE);
            b.addEnumValue("VK_DYNAMIC_STATE_CULL_MODE", VkDynamicState::VK_DYNAMIC_STATE_CULL_MODE);
            b.addEnumValue("VK_DYNAMIC_STATE_FRONT_FACE", VkDynamicState::VK_DYNAMIC_STATE_FRONT_FACE);
            b.addEnumValue("VK_DYNAMIC_STATE_PRIMITIVE_TOPOLOGY", VkDynamicState::VK_DYNAMIC_STATE_PRIMITIVE_TOPOLOGY);
            b.addEnumValue("VK_DYNAMIC_STATE_VIEWPORT_WITH_COUNT", VkDynamicState::VK_DYNAMIC_STATE_VIEWPORT_WITH_COUNT);
            b.addEnumValue("VK_DYNAMIC_STATE_SCISSOR_WITH_COUNT", VkDynamicState::VK_DYNAMIC_STATE_SCISSOR_WITH_COUNT);
            b.addEnumValue("VK_DYNAMIC_STATE_VERTEX_INPUT_BINDING_STRIDE", VkDynamicState::VK_DYNAMIC_STATE_VERTEX_INPUT_BINDING_STRIDE);
            b.addEnumValue("VK_DYNAMIC_STATE_DEPTH_TEST_ENABLE", VkDynamicState::VK_DYNAMIC_STATE_DEPTH_TEST_ENABLE);
            b.addEnumValue("VK_DYNAMIC_STATE_DEPTH_WRITE_ENABLE", VkDynamicState::VK_DYNAMIC_STATE_DEPTH_WRITE_ENABLE);
            b.addEnumValue("VK_DYNAMIC_STATE_DEPTH_COMPARE_OP", VkDynamicState::VK_DYNAMIC_STATE_DEPTH_COMPARE_OP);
            b.addEnumValue("VK_DYNAMIC_STATE_DEPTH_BOUNDS_TEST_ENABLE", VkDynamicState::VK_DYNAMIC_STATE_DEPTH_BOUNDS_TEST_ENABLE);
            b.addEnumValue("VK_DYNAMIC_STATE_STENCIL_TEST_ENABLE", VkDynamicState::VK_DYNAMIC_STATE_STENCIL_TEST_ENABLE);
            b.addEnumValue("VK_DYNAMIC_STATE_STENCIL_OP", VkDynamicState::VK_DYNAMIC_STATE_STENCIL_OP);
            b.addEnumValue("VK_DYNAMIC_STATE_RASTERIZER_DISCARD_ENABLE", VkDynamicState::VK_DYNAMIC_STATE_RASTERIZER_DISCARD_ENABLE);
            b.addEnumValue("VK_DYNAMIC_STATE_DEPTH_BIAS_ENABLE", VkDynamicState::VK_DYNAMIC_STATE_DEPTH_BIAS_ENABLE);
            b.addEnumValue("VK_DYNAMIC_STATE_PRIMITIVE_RESTART_ENABLE", VkDynamicState::VK_DYNAMIC_STATE_PRIMITIVE_RESTART_ENABLE);
            b.addEnumValue("VK_DYNAMIC_STATE_VIEWPORT_W_SCALING_NV", VkDynamicState::VK_DYNAMIC_STATE_VIEWPORT_W_SCALING_NV);
            b.addEnumValue("VK_DYNAMIC_STATE_DISCARD_RECTANGLE_EXT", VkDynamicState::VK_DYNAMIC_STATE_DISCARD_RECTANGLE_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_DISCARD_RECTANGLE_ENABLE_EXT", VkDynamicState::VK_DYNAMIC_STATE_DISCARD_RECTANGLE_ENABLE_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_DISCARD_RECTANGLE_MODE_EXT", VkDynamicState::VK_DYNAMIC_STATE_DISCARD_RECTANGLE_MODE_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_SAMPLE_LOCATIONS_EXT", VkDynamicState::VK_DYNAMIC_STATE_SAMPLE_LOCATIONS_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_RAY_TRACING_PIPELINE_STACK_SIZE_KHR", VkDynamicState::VK_DYNAMIC_STATE_RAY_TRACING_PIPELINE_STACK_SIZE_KHR);
            b.addEnumValue("VK_DYNAMIC_STATE_VIEWPORT_SHADING_RATE_PALETTE_NV", VkDynamicState::VK_DYNAMIC_STATE_VIEWPORT_SHADING_RATE_PALETTE_NV);
            b.addEnumValue("VK_DYNAMIC_STATE_VIEWPORT_COARSE_SAMPLE_ORDER_NV", VkDynamicState::VK_DYNAMIC_STATE_VIEWPORT_COARSE_SAMPLE_ORDER_NV);
            b.addEnumValue("VK_DYNAMIC_STATE_EXCLUSIVE_SCISSOR_ENABLE_NV", VkDynamicState::VK_DYNAMIC_STATE_EXCLUSIVE_SCISSOR_ENABLE_NV);
            b.addEnumValue("VK_DYNAMIC_STATE_EXCLUSIVE_SCISSOR_NV", VkDynamicState::VK_DYNAMIC_STATE_EXCLUSIVE_SCISSOR_NV);
            b.addEnumValue("VK_DYNAMIC_STATE_FRAGMENT_SHADING_RATE_KHR", VkDynamicState::VK_DYNAMIC_STATE_FRAGMENT_SHADING_RATE_KHR);
            b.addEnumValue("VK_DYNAMIC_STATE_LINE_STIPPLE_EXT", VkDynamicState::VK_DYNAMIC_STATE_LINE_STIPPLE_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_VERTEX_INPUT_EXT", VkDynamicState::VK_DYNAMIC_STATE_VERTEX_INPUT_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_PATCH_CONTROL_POINTS_EXT", VkDynamicState::VK_DYNAMIC_STATE_PATCH_CONTROL_POINTS_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_LOGIC_OP_EXT", VkDynamicState::VK_DYNAMIC_STATE_LOGIC_OP_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_COLOR_WRITE_ENABLE_EXT", VkDynamicState::VK_DYNAMIC_STATE_COLOR_WRITE_ENABLE_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_TESSELLATION_DOMAIN_ORIGIN_EXT", VkDynamicState::VK_DYNAMIC_STATE_TESSELLATION_DOMAIN_ORIGIN_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_DEPTH_CLAMP_ENABLE_EXT", VkDynamicState::VK_DYNAMIC_STATE_DEPTH_CLAMP_ENABLE_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_POLYGON_MODE_EXT", VkDynamicState::VK_DYNAMIC_STATE_POLYGON_MODE_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_RASTERIZATION_SAMPLES_EXT", VkDynamicState::VK_DYNAMIC_STATE_RASTERIZATION_SAMPLES_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_SAMPLE_MASK_EXT", VkDynamicState::VK_DYNAMIC_STATE_SAMPLE_MASK_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_ALPHA_TO_COVERAGE_ENABLE_EXT", VkDynamicState::VK_DYNAMIC_STATE_ALPHA_TO_COVERAGE_ENABLE_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_ALPHA_TO_ONE_ENABLE_EXT", VkDynamicState::VK_DYNAMIC_STATE_ALPHA_TO_ONE_ENABLE_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_LOGIC_OP_ENABLE_EXT", VkDynamicState::VK_DYNAMIC_STATE_LOGIC_OP_ENABLE_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_COLOR_BLEND_ENABLE_EXT", VkDynamicState::VK_DYNAMIC_STATE_COLOR_BLEND_ENABLE_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_COLOR_BLEND_EQUATION_EXT", VkDynamicState::VK_DYNAMIC_STATE_COLOR_BLEND_EQUATION_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_COLOR_WRITE_MASK_EXT", VkDynamicState::VK_DYNAMIC_STATE_COLOR_WRITE_MASK_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_RASTERIZATION_STREAM_EXT", VkDynamicState::VK_DYNAMIC_STATE_RASTERIZATION_STREAM_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_CONSERVATIVE_RASTERIZATION_MODE_EXT", VkDynamicState::VK_DYNAMIC_STATE_CONSERVATIVE_RASTERIZATION_MODE_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_EXTRA_PRIMITIVE_OVERESTIMATION_SIZE_EXT", VkDynamicState::VK_DYNAMIC_STATE_EXTRA_PRIMITIVE_OVERESTIMATION_SIZE_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_DEPTH_CLIP_ENABLE_EXT", VkDynamicState::VK_DYNAMIC_STATE_DEPTH_CLIP_ENABLE_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_SAMPLE_LOCATIONS_ENABLE_EXT", VkDynamicState::VK_DYNAMIC_STATE_SAMPLE_LOCATIONS_ENABLE_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_COLOR_BLEND_ADVANCED_EXT", VkDynamicState::VK_DYNAMIC_STATE_COLOR_BLEND_ADVANCED_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_PROVOKING_VERTEX_MODE_EXT", VkDynamicState::VK_DYNAMIC_STATE_PROVOKING_VERTEX_MODE_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_LINE_RASTERIZATION_MODE_EXT", VkDynamicState::VK_DYNAMIC_STATE_LINE_RASTERIZATION_MODE_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_LINE_STIPPLE_ENABLE_EXT", VkDynamicState::VK_DYNAMIC_STATE_LINE_STIPPLE_ENABLE_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_DEPTH_CLIP_NEGATIVE_ONE_TO_ONE_EXT", VkDynamicState::VK_DYNAMIC_STATE_DEPTH_CLIP_NEGATIVE_ONE_TO_ONE_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_VIEWPORT_W_SCALING_ENABLE_NV", VkDynamicState::VK_DYNAMIC_STATE_VIEWPORT_W_SCALING_ENABLE_NV);
            b.addEnumValue("VK_DYNAMIC_STATE_VIEWPORT_SWIZZLE_NV", VkDynamicState::VK_DYNAMIC_STATE_VIEWPORT_SWIZZLE_NV);
            b.addEnumValue("VK_DYNAMIC_STATE_COVERAGE_TO_COLOR_ENABLE_NV", VkDynamicState::VK_DYNAMIC_STATE_COVERAGE_TO_COLOR_ENABLE_NV);
            b.addEnumValue("VK_DYNAMIC_STATE_COVERAGE_TO_COLOR_LOCATION_NV", VkDynamicState::VK_DYNAMIC_STATE_COVERAGE_TO_COLOR_LOCATION_NV);
            b.addEnumValue("VK_DYNAMIC_STATE_COVERAGE_MODULATION_MODE_NV", VkDynamicState::VK_DYNAMIC_STATE_COVERAGE_MODULATION_MODE_NV);
            b.addEnumValue("VK_DYNAMIC_STATE_COVERAGE_MODULATION_TABLE_ENABLE_NV", VkDynamicState::VK_DYNAMIC_STATE_COVERAGE_MODULATION_TABLE_ENABLE_NV);
            b.addEnumValue("VK_DYNAMIC_STATE_COVERAGE_MODULATION_TABLE_NV", VkDynamicState::VK_DYNAMIC_STATE_COVERAGE_MODULATION_TABLE_NV);
            b.addEnumValue("VK_DYNAMIC_STATE_SHADING_RATE_IMAGE_ENABLE_NV", VkDynamicState::VK_DYNAMIC_STATE_SHADING_RATE_IMAGE_ENABLE_NV);
            b.addEnumValue("VK_DYNAMIC_STATE_REPRESENTATIVE_FRAGMENT_TEST_ENABLE_NV", VkDynamicState::VK_DYNAMIC_STATE_REPRESENTATIVE_FRAGMENT_TEST_ENABLE_NV);
            b.addEnumValue("VK_DYNAMIC_STATE_COVERAGE_REDUCTION_MODE_NV", VkDynamicState::VK_DYNAMIC_STATE_COVERAGE_REDUCTION_MODE_NV);
            b.addEnumValue("VK_DYNAMIC_STATE_ATTACHMENT_FEEDBACK_LOOP_ENABLE_EXT", VkDynamicState::VK_DYNAMIC_STATE_ATTACHMENT_FEEDBACK_LOOP_ENABLE_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_CULL_MODE_EXT", VkDynamicState::VK_DYNAMIC_STATE_CULL_MODE_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_FRONT_FACE_EXT", VkDynamicState::VK_DYNAMIC_STATE_FRONT_FACE_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_PRIMITIVE_TOPOLOGY_EXT", VkDynamicState::VK_DYNAMIC_STATE_PRIMITIVE_TOPOLOGY_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_VIEWPORT_WITH_COUNT_EXT", VkDynamicState::VK_DYNAMIC_STATE_VIEWPORT_WITH_COUNT_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_SCISSOR_WITH_COUNT_EXT", VkDynamicState::VK_DYNAMIC_STATE_SCISSOR_WITH_COUNT_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_VERTEX_INPUT_BINDING_STRIDE_EXT", VkDynamicState::VK_DYNAMIC_STATE_VERTEX_INPUT_BINDING_STRIDE_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_DEPTH_TEST_ENABLE_EXT", VkDynamicState::VK_DYNAMIC_STATE_DEPTH_TEST_ENABLE_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_DEPTH_WRITE_ENABLE_EXT", VkDynamicState::VK_DYNAMIC_STATE_DEPTH_WRITE_ENABLE_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_DEPTH_COMPARE_OP_EXT", VkDynamicState::VK_DYNAMIC_STATE_DEPTH_COMPARE_OP_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_DEPTH_BOUNDS_TEST_ENABLE_EXT", VkDynamicState::VK_DYNAMIC_STATE_DEPTH_BOUNDS_TEST_ENABLE_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_STENCIL_TEST_ENABLE_EXT", VkDynamicState::VK_DYNAMIC_STATE_STENCIL_TEST_ENABLE_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_STENCIL_OP_EXT", VkDynamicState::VK_DYNAMIC_STATE_STENCIL_OP_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_RASTERIZER_DISCARD_ENABLE_EXT", VkDynamicState::VK_DYNAMIC_STATE_RASTERIZER_DISCARD_ENABLE_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_DEPTH_BIAS_ENABLE_EXT", VkDynamicState::VK_DYNAMIC_STATE_DEPTH_BIAS_ENABLE_EXT);
            b.addEnumValue("VK_DYNAMIC_STATE_PRIMITIVE_RESTART_ENABLE_EXT", VkDynamicState::VK_DYNAMIC_STATE_PRIMITIVE_RESTART_ENABLE_EXT);
        }

        {
            bind::EnumTypeBuilder<VkAttachmentLoadOp> b = ns->type<VkAttachmentLoadOp>("VkAttachmentLoadOp");
            b.addEnumValue("VK_ATTACHMENT_LOAD_OP_LOAD", VkAttachmentLoadOp::VK_ATTACHMENT_LOAD_OP_LOAD);
            b.addEnumValue("VK_ATTACHMENT_LOAD_OP_CLEAR", VkAttachmentLoadOp::VK_ATTACHMENT_LOAD_OP_CLEAR);
            b.addEnumValue("VK_ATTACHMENT_LOAD_OP_DONT_CARE", VkAttachmentLoadOp::VK_ATTACHMENT_LOAD_OP_DONT_CARE);
            b.addEnumValue("VK_ATTACHMENT_LOAD_OP_NONE_EXT", VkAttachmentLoadOp::VK_ATTACHMENT_LOAD_OP_NONE_EXT);
        }

        {
            bind::EnumTypeBuilder<VkAttachmentStoreOp> b = ns->type<VkAttachmentStoreOp>("VkAttachmentStoreOp");
            b.addEnumValue("VK_ATTACHMENT_STORE_OP_STORE", VkAttachmentStoreOp::VK_ATTACHMENT_STORE_OP_STORE);
            b.addEnumValue("VK_ATTACHMENT_STORE_OP_DONT_CARE", VkAttachmentStoreOp::VK_ATTACHMENT_STORE_OP_DONT_CARE);
            b.addEnumValue("VK_ATTACHMENT_STORE_OP_NONE", VkAttachmentStoreOp::VK_ATTACHMENT_STORE_OP_NONE);
            b.addEnumValue("VK_ATTACHMENT_STORE_OP_NONE_KHR", VkAttachmentStoreOp::VK_ATTACHMENT_STORE_OP_NONE_KHR);
            b.addEnumValue("VK_ATTACHMENT_STORE_OP_NONE_QCOM", VkAttachmentStoreOp::VK_ATTACHMENT_STORE_OP_NONE_QCOM);
            b.addEnumValue("VK_ATTACHMENT_STORE_OP_NONE_EXT", VkAttachmentStoreOp::VK_ATTACHMENT_STORE_OP_NONE_EXT);
        }

        {
            bind::EnumTypeBuilder<VkSampleCountFlagBits> b = ns->type<VkSampleCountFlagBits>("VkSampleCountFlags");
            b.addEnumValue("VK_SAMPLE_COUNT_1_BIT", VkSampleCountFlagBits::VK_SAMPLE_COUNT_1_BIT);
            b.addEnumValue("VK_SAMPLE_COUNT_2_BIT", VkSampleCountFlagBits::VK_SAMPLE_COUNT_2_BIT);
            b.addEnumValue("VK_SAMPLE_COUNT_4_BIT", VkSampleCountFlagBits::VK_SAMPLE_COUNT_4_BIT);
            b.addEnumValue("VK_SAMPLE_COUNT_8_BIT", VkSampleCountFlagBits::VK_SAMPLE_COUNT_8_BIT);
            b.addEnumValue("VK_SAMPLE_COUNT_16_BIT", VkSampleCountFlagBits::VK_SAMPLE_COUNT_16_BIT);
            b.addEnumValue("VK_SAMPLE_COUNT_32_BIT", VkSampleCountFlagBits::VK_SAMPLE_COUNT_32_BIT);
            b.addEnumValue("VK_SAMPLE_COUNT_64_BIT", VkSampleCountFlagBits::VK_SAMPLE_COUNT_64_BIT);
        }

        {
            bind::EnumTypeBuilder<VkAttachmentDescriptionFlagBits> b = ns->type<VkAttachmentDescriptionFlagBits>("VkAttachmentDescriptionFlags");
            b.addEnumValue("VK_ATTACHMENT_DESCRIPTION_MAY_ALIAS_BIT", VkAttachmentDescriptionFlagBits::VK_ATTACHMENT_DESCRIPTION_MAY_ALIAS_BIT);
        }

        /* clang-format on */

        //
        // Structures
        //

        {
            bind::ObjectTypeBuilder<VkAllocationCallbacks> b = ns->type<VkAllocationCallbacks>("VkAllocationCallbacks");
            b.getMeta().is_trivially_constructible           = 0;
            b.getMeta().is_trivial                           = 0;
        }

        {
            bind::ObjectTypeBuilder<render::vulkan::VulkanFormatInfo> b =
                ns->type<render::vulkan::VulkanFormatInfo>("VulkanFormatInfo");
            b.prop("size", &render::vulkan::VulkanFormatInfo::size);
            b.prop("channelCount", &render::vulkan::VulkanFormatInfo::channelCount);
            b.prop("blockSize", &render::vulkan::VulkanFormatInfo::blockSize);
            b.prop("isFloatingPoint", &render::vulkan::VulkanFormatInfo::isFloatingPoint);
            b.prop("isSigned", &render::vulkan::VulkanFormatInfo::isSigned);
        }

        {
            bind::ObjectTypeBuilder<VkAttachmentReference> b = ns->type<VkAttachmentReference>("VkAttachmentReference");
            b.prop("attachment", &VkAttachmentReference::attachment);
            b.prop("layout", &VkAttachmentReference::layout);
        }

        {
            bind::ObjectTypeBuilder<VkAttachmentDescription> b =
                ns->type<VkAttachmentDescription>("VkAttachmentDescription");
            b.prop("flags", &VkAttachmentDescription::flags);
            b.prop("format", &VkAttachmentDescription::format);
            b.prop("samples", &VkAttachmentDescription::samples);
            b.prop("loadOp", &VkAttachmentDescription::loadOp);
            b.prop("storeOp", &VkAttachmentDescription::storeOp);
            b.prop("stencilLoadOp", &VkAttachmentDescription::stencilLoadOp);
            b.prop("stencilStoreOp", &VkAttachmentDescription::stencilStoreOp);
            b.prop("initialLayout", &VkAttachmentDescription::initialLayout);
            b.prop("finalLayout", &VkAttachmentDescription::finalLayout);
        }

        {
            bind::ObjectTypeBuilder<VkMappedMemoryRange> b = ns->type<VkMappedMemoryRange>("VkMappedMemoryRange");
            b.pseudoCtor(+[](VkMappedMemoryRange* self) {
                self->sType  = VK_STRUCTURE_TYPE_MAPPED_MEMORY_RANGE;
                self->pNext  = nullptr;
                self->memory = VK_NULL_HANDLE;
                self->offset = 0;
                self->size   = 0;
            });
            b.prop("memory", &VkMappedMemoryRange::memory);
            b.prop("offset", &VkMappedMemoryRange::offset);
            b.prop("size", &VkMappedMemoryRange::size);
        }

        {
            bind::ObjectTypeBuilder<VkExtent2D> b = ns->type<VkExtent2D>("VkExtent2D");
            b.prop("width", &VkExtent2D::width);
            b.prop("height", &VkExtent2D::height);
        }

        {
            bind::ObjectTypeBuilder<VkSurfaceCapabilitiesKHR> b =
                ns->type<VkSurfaceCapabilitiesKHR>("VkSurfaceCapabilitiesKHR");
            b.prop("minImageCount", &VkSurfaceCapabilitiesKHR::minImageCount);
            b.prop("maxImageCount", &VkSurfaceCapabilitiesKHR::maxImageCount);
            b.prop("currentExtent", &VkSurfaceCapabilitiesKHR::currentExtent);
            b.prop("minImageExtent", &VkSurfaceCapabilitiesKHR::minImageExtent);
            b.prop("maxImageExtent", &VkSurfaceCapabilitiesKHR::maxImageExtent);
            b.prop("maxImageArrayLayers", &VkSurfaceCapabilitiesKHR::maxImageArrayLayers);
            b.prop("supportedTransforms", &VkSurfaceCapabilitiesKHR::supportedTransforms);
            b.prop("currentTransform", &VkSurfaceCapabilitiesKHR::currentTransform);
            b.prop("supportedCompositeAlpha", &VkSurfaceCapabilitiesKHR::supportedCompositeAlpha);
            b.prop("supportedUsageFlags", &VkSurfaceCapabilitiesKHR::supportedUsageFlags);
        }

        //
        // Functions
        //

        ns->function("getFormatInfo", render::vulkan::getFormatInfo);
    }
}