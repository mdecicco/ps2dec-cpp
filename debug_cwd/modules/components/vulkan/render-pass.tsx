import * as React from 'mini-react';
import * as Render from 'render';
import { VkColorSpaceKHR, VkCompositeAlphaFlagsKHR, VkFormat, VkImageUsageFlags, VkPresentModeKHR } from 'vulkan';

import { useVulkan } from './root';
import { useCurrentWindow } from '../window';

type VulkanRenderPassContext = {
    swapChainSupport: Render.SwapChainSupport;
    swapChain: Render.SwapChain;
    renderPass: Render.RenderPass;
    frameManager: Render.FrameManager;
    shaderCompiler: Render.ShaderCompiler;
    vboFactory: Render.VertexBufferFactory;
    uboFactory: Render.UniformObjectFactory;
    dsFactory: Render.DescriptorFactory;
};

const Context = React.createContext<VulkanRenderPassContext>();
Context.Provider.displayName = 'RenderPassProvider';

type VulkanRenderPassProps = {
    children?: React.ReactNode;

    /**
     * The format of the swap chain images
     * @default VkFormat.VK_FORMAT_B8G8R8A8_SRGB
     */
    imageFormat?: VkFormat;

    /**
     * The color space of the swap chain images
     * @default VkColorSpaceKHR.VK_COLOR_SPACE_SRGB_NONLINEAR_KHR
     */
    imageColorSpace?: VkColorSpaceKHR;

    /**
     * The present mode of the swap chain
     * @default VkPresentModeKHR.VK_PRESENT_MODE_FIFO_KHR
     */
    presentMode?: VkPresentModeKHR;

    /**
     * The number of images in the swap chain
     * @default 3
     */
    imageCount?: u32;

    /**
     * The sample count of the swap chain
     * @default 1
     */
    sampleCount?: u32;

    /**
     * The usage flags of the swap chain images
     * @default VkImageUsageFlags.VK_IMAGE_USAGE_COLOR_ATTACHMENT_BIT
     */
    usage?: VkImageUsageFlags;

    /**
     * The composite alpha flags of the swap chain
     * @default VkCompositeAlphaFlagsKHR.VK_COMPOSITE_ALPHA_OPAQUE_BIT_KHR
     */
    compositeAlpha?: VkCompositeAlphaFlagsKHR;

    /**
     * The size (in vertices) of each vertex buffer pool allocated by the vertex buffer factory
     * @default 8096
     */
    vertexPoolSize?: u32;

    /**
     * The size (in objects) of each uniform object pool allocated by the uniform object factory
     * @default 1024
     */
    uniformPoolSize?: u32;

    /**
     * The size (in descriptors) of each descriptor pool allocated by the descriptor factory
     * @default 256
     */
    descriptorPoolSize?: u32;
};

function createContext(
    props: VulkanRenderPassProps,
    vulkan: ReturnType<typeof useVulkan>,
    prevSwapChain: Render.SwapChain | null
): VulkanRenderPassContext {
    let swapChainSupport: Render.SwapChainSupport | null = null;
    let swapChain: Render.SwapChain | null = null;
    let renderPass: Render.RenderPass | null = null;
    let frameManager: Render.FrameManager | null = null;
    let shaderCompiler: Render.ShaderCompiler | null = null;
    let vboFactory: Render.VertexBufferFactory | null = null;
    let uboFactory: Render.UniformObjectFactory | null = null;
    let dsFactory: Render.DescriptorFactory | null = null;

    const abort = (message: string) => {
        if (uboFactory) uboFactory.destroy();
        if (dsFactory) dsFactory.destroy();
        if (vboFactory) vboFactory.destroy();
        if (shaderCompiler) {
            vulkan.instance.removeNestedLogger(shaderCompiler);
            shaderCompiler.destroy();
        }
        if (frameManager) {
            vulkan.instance.removeNestedLogger(frameManager);
            frameManager.destroy();
        }
        if (renderPass) renderPass.destroy();
        if (swapChain) swapChain.destroy();
        if (swapChainSupport) swapChainSupport.destroy();

        throw new Error(message);
    };

    swapChainSupport = new Render.SwapChainSupport();
    if (!vulkan.physicalDevice.getSurfaceSwapChainSupport(vulkan.surface, swapChainSupport)) {
        abort(`Failed to get swap chain support for ${vulkan.physicalDevice.getName()}`);
    }

    swapChain = new Render.SwapChain();

    const result = swapChain.init(
        vulkan.surface,
        vulkan.logicalDevice,
        swapChainSupport,
        props.imageFormat ?? VkFormat.VK_FORMAT_B8G8R8A8_SRGB,
        props.imageColorSpace ?? VkColorSpaceKHR.VK_COLOR_SPACE_SRGB_NONLINEAR_KHR,
        props.presentMode ?? VkPresentModeKHR.VK_PRESENT_MODE_FIFO_KHR,
        props.imageCount ?? 3,
        props.sampleCount ?? 1,
        props.usage ?? VkImageUsageFlags.VK_IMAGE_USAGE_COLOR_ATTACHMENT_BIT,
        props.compositeAlpha ?? VkCompositeAlphaFlagsKHR.VK_COMPOSITE_ALPHA_OPAQUE_BIT_KHR,
        prevSwapChain
    );

    if (!result) {
        abort('Failed to initialize swap chain');
    }

    if (!swapChain.isValid()) {
        abort('Swap chain is invalid');
    }

    renderPass = new Render.RenderPass(swapChain);
    if (!renderPass.init()) {
        abort('Failed to initialize render pass');
    }

    frameManager = new Render.FrameManager(swapChain, renderPass);
    vulkan.instance.addNestedLogger(frameManager);
    if (!frameManager.init()) {
        abort('Failed to initialize frame manager');
    }

    shaderCompiler = new Render.ShaderCompiler(vulkan.logicalDevice);
    vulkan.instance.addNestedLogger(shaderCompiler);
    if (!shaderCompiler.init()) {
        abort('Failed to initialize shader compiler');
    }

    vboFactory = new Render.VertexBufferFactory(vulkan.logicalDevice, props.vertexPoolSize ?? 8096);
    uboFactory = new Render.UniformObjectFactory(vulkan.logicalDevice, props.uniformPoolSize ?? 1024);
    dsFactory = new Render.DescriptorFactory(vulkan.logicalDevice, props.descriptorPoolSize ?? 256);

    return {
        swapChainSupport,
        swapChain,
        renderPass,
        frameManager,
        shaderCompiler,
        vboFactory,
        uboFactory,
        dsFactory
    };
}

function shutdownContext(ctx: VulkanRenderPassContext, device: Render.LogicalDevice) {
    device.waitForIdle();

    if (ctx.dsFactory) ctx.dsFactory.destroy();
    if (ctx.uboFactory) ctx.uboFactory.destroy();
    if (ctx.vboFactory) ctx.vboFactory.destroy();
    if (ctx.shaderCompiler) ctx.shaderCompiler.destroy();
    if (ctx.frameManager) ctx.frameManager.destroy();
    if (ctx.renderPass) ctx.renderPass.destroy();
    if (ctx.swapChain) ctx.swapChain.destroy();
    if (ctx.swapChainSupport) ctx.swapChainSupport.destroy();
}

export const RenderPass: React.FC<VulkanRenderPassProps> = props => {
    const vulkan = useVulkan();
    const { size } = useCurrentWindow();
    const context = React.useRef<VulkanRenderPassContext | null>(null);
    const error = React.useRef<Error | null>(null);
    const prevProps = React.useRef<VulkanRenderPassProps | null>(null);

    const shutdown = () => {
        if (!context.current) return;
        shutdownContext(context.current, vulkan.logicalDevice);
        context.current = null;
        error.current = null;
    };

    React.useEffect(() => {
        if (!context.current) return;

        try {
            vulkan.logicalDevice.waitForIdle();
            vulkan.instance.removeNestedLogger(context.current.frameManager);
            context.current.frameManager.destroy();

            vulkan.logicalDevice.waitForIdle();
            context.current.swapChain.recreate();

            context.current.frameManager = new Render.FrameManager(
                context.current.swapChain,
                context.current.renderPass
            );
            vulkan.instance.addNestedLogger(context.current.frameManager);

            if (!context.current.frameManager.init()) {
                throw new Error('Failed to recreate frame manager');
            }
        } catch (e) {
            console.error('Failed to recreate swap chain after window resize', String(e));
            shutdown();
        }
    }, [size.width, size.height]);

    React.useEffect(() => {
        if (error.current) return;

        if (!prevProps.current) {
            prevProps.current = props;

            try {
                context.current = createContext(props, vulkan, null);
                error.current = null;
            } catch (e) {
                console.error('Failed to create render pass context', String(e));
                context.current = null;
                error.current = e as Error;
            }

            return;
        }

        if (!context.current) {
            prevProps.current = props;

            try {
                context.current = createContext(props, vulkan, null);
                error.current = null;
            } catch (e) {
                console.error('Failed to create render pass context', String(e));
                context.current = null;
                error.current = e as Error;
            }

            return;
        }

        if (!React.comparePropsDeep(prevProps.current, props)) {
            prevProps.current = props;
            let nextContext: VulkanRenderPassContext | null = null;

            try {
                nextContext = createContext(props, vulkan, context.current.swapChain);
                shutdown();

                context.current = nextContext;
                error.current = null;
            } catch (e) {
                console.error('Failed to create render pass context', String(e));

                try {
                    if (nextContext) shutdownContext(nextContext, vulkan.logicalDevice);
                } catch (e1) {
                    console.error(
                        'Failed to shutdown render pass context that was created but not used due to another error',
                        String(e1)
                    );
                }

                context.current = null;
                error.current = e as Error;
            }

            return;
        }
    }, [context, props, error]);

    React.useEffect(() => {
        const listener = vulkan.addListener('before-shutdown', shutdown);

        return () => {
            listener.remove();
            shutdown();
        };
    }, []);

    if (!context.current) return null;
    return <Context.Provider value={context.current}>{props.children}</Context.Provider>;
};

export function useRenderPass() {
    const context = React.useContext(Context);
    if (!context) throw new Error('useRenderPass must be used within a Vulkan.RenderPass component');

    return context;
}
