import * as Render from 'render';
import { VkColorSpaceKHR, VkFormat, VkPresentModeKHR } from 'vulkan';

export function defaultChoosePhysicalDevice(
    instance: Render.Instance,
    surface: Render.Surface
): Render.PhysicalDevice | null {
    const swapChainSupport = new Render.SwapChainSupport();
    const preferredFormat = VkFormat.VK_FORMAT_B8G8R8A8_SRGB;
    const preferredColorSpace = VkColorSpaceKHR.VK_COLOR_SPACE_SRGB_NONLINEAR_KHR;
    const preferredPresentMode = VkPresentModeKHR.VK_PRESENT_MODE_FIFO_KHR;

    const devices = Render.PhysicalDevice.list(instance);

    for (const device of devices) {
        if (!device.isDiscrete()) continue;
        if (!device.isExtensionAvailable('VK_KHR_swapchain')) continue;
        if (!device.getSurfaceSwapChainSupport(surface, swapChainSupport)) continue;
        if (!swapChainSupport.isValid()) continue;
        if (!swapChainSupport.hasFormat(preferredFormat, preferredColorSpace)) continue;
        if (!swapChainSupport.hasPresentMode(preferredPresentMode)) continue;

        const capabilities = swapChainSupport.getCapabilities();
        if (capabilities.maxImageCount > 0 && capabilities.maxImageCount < 3) continue;

        return device;
    }

    return null;
}
