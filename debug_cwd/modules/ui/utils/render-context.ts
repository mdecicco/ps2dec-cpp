import { Window } from 'window';
import * as Render from 'render';
import { vec4f } from 'math';
import {
    VkColorSpaceKHR,
    VkCommandBufferUsageFlags,
    VkCompositeAlphaFlagsKHR,
    VkDynamicState,
    VkFilter,
    VkFormat,
    VkImageLayout,
    VkImageType,
    VkImageUsageFlags,
    VkPipelineBindPoint,
    VkPipelineStageFlags,
    VkPresentModeKHR,
    VkShaderStageFlags
} from 'vulkan';

import { defaultChoosePhysicalDevice } from 'components/vulkan/logic';
import { DrawCall } from './draw-call';
import { TextDraw } from './text-draw';
import { ClipRectManager } from './clip-rect-mgr';
import { FontFamily } from './font-mgr';
import { InstanceManager } from './instance-mgr';
import { FragmentShader, VertexShader } from '../renderer/shaders';

export class RenderContext {
    private m_window: Window;
    private m_instance: Render.Instance | null;
    private m_surface: Render.Surface | null;
    private m_physicalDevice: Render.PhysicalDevice | null;
    private m_logicalDevice: Render.LogicalDevice | null;
    private m_shaderCompiler: Render.ShaderCompiler | null;
    private m_swapChainSupport: Render.SwapChainSupport | null;
    private m_swapChain: Render.SwapChain | null;
    private m_renderPass: Render.RenderPass | null;
    private m_frameManager: Render.FrameManager | null;
    private m_graphicsPipeline: Render.GraphicsPipeline | null;
    private m_vboFactory: Render.VertexBufferFactory | null;
    private m_uboFactory: Render.UniformObjectFactory | null;
    private m_dsFactory: Render.DescriptorFactory | null;
    private m_vertexFormat: Render.DataFormat | null;
    private m_uniformFormat: Render.DataFormat | null;
    private m_defaultTexture: Render.Texture | null;
    private m_windowSize: { width: u32; height: u32 };
    private m_resizeListener: u32 | null;
    private m_currentFrame: Render.FrameContext | null;
    private m_clipRectManager: ClipRectManager;
    private m_instanceManager: InstanceManager;
    private m_currentClipRectBuffer: Render.Buffer | null;
    private m_currentInstanceBuffer: Render.Buffer | null;
    private m_renderPassStarted: boolean;
    private m_drawCalls: DrawCall[];

    constructor(window: Window) {
        const size = window.getSize();

        this.m_window = window;
        this.m_instance = null;
        this.m_surface = null;
        this.m_physicalDevice = null;
        this.m_logicalDevice = null;
        this.m_shaderCompiler = null;
        this.m_swapChainSupport = null;
        this.m_swapChain = null;
        this.m_renderPass = null;
        this.m_frameManager = null;
        this.m_graphicsPipeline = null;
        this.m_vboFactory = null;
        this.m_uboFactory = null;
        this.m_dsFactory = null;
        this.m_vertexFormat = null;
        this.m_uniformFormat = null;
        this.m_defaultTexture = null;
        this.m_windowSize = { width: size.x, height: size.y };
        this.m_resizeListener = null;
        this.m_currentFrame = null;
        this.m_clipRectManager = new ClipRectManager(size.x, size.y);
        this.m_instanceManager = new InstanceManager();
        this.m_currentClipRectBuffer = null;
        this.m_currentInstanceBuffer = null;
        this.m_renderPassStarted = false;
        this.m_drawCalls = [];
    }

    get renderContext() {
        if (!this.m_instance) {
            throw new Error('RenderContext.renderContext used before RenderContext.init()');
        }

        return {
            instance: this.m_instance!,
            surface: this.m_surface!,
            physicalDevice: this.m_physicalDevice!,
            logicalDevice: this.m_logicalDevice!,
            shaderCompiler: this.m_shaderCompiler!,
            swapChainSupport: this.m_swapChainSupport!,
            swapChain: this.m_swapChain!,
            renderPass: this.m_renderPass!,
            frameManager: this.m_frameManager!,
            graphicsPipeline: this.m_graphicsPipeline!,
            vertexFormat: this.m_vertexFormat!,
            uniformFormat: this.m_uniformFormat!,
            vboFactory: this.m_vboFactory!,
            uboFactory: this.m_uboFactory!,
            dsFactory: this.m_dsFactory!,
            windowSize: this.m_windowSize!,
            defaultTexture: this.m_defaultTexture!
        };
    }

    get currentFrame() {
        if (!this.m_currentFrame) throw new Error('RenderContext.currentFrame used before RenderContext.begin()');
        return this.m_currentFrame;
    }

    get commandBuffer() {
        if (!this.m_currentFrame) throw new Error('RenderContext.commandBuffer used before RenderContext.begin()');
        return this.m_currentFrame.getCommandBuffer();
    }

    get isInitialized() {
        return this.m_instance !== null;
    }

    get clipRects() {
        return this.m_clipRectManager;
    }

    get instances() {
        return this.m_instanceManager;
    }

    init() {
        this.m_instance = new Render.Instance();
        this.m_window.addNestedLogger(this.m_instance);
        this.m_instance.enableValidation();
        if (!this.m_instance.initialize()) {
            this.shutdown();
            throw new Error('Failed to initialize Vulkan instance');
        }

        this.m_surface = new Render.Surface(this.m_instance, this.m_window);
        if (!this.m_surface.init()) {
            this.shutdown();
            throw new Error('Failed to initialize Vulkan surface');
        }

        const physicalDevice = defaultChoosePhysicalDevice(this.m_instance, this.m_surface);
        if (!physicalDevice) {
            this.shutdown();
            throw new Error('Failed to find suitable physical device');
        }

        this.m_physicalDevice = new Render.PhysicalDevice(physicalDevice);

        this.m_logicalDevice = new Render.LogicalDevice(this.m_physicalDevice);
        this.m_logicalDevice.enableExtension('VK_KHR_swapchain');
        if (!this.m_logicalDevice.init(true, false, false, this.m_surface)) {
            this.shutdown();
            throw new Error('Failed to initialize Vulkan logical device');
        }

        this.m_swapChainSupport = new Render.SwapChainSupport();
        if (!this.m_physicalDevice.getSurfaceSwapChainSupport(this.m_surface, this.m_swapChainSupport)) {
            this.shutdown();
            throw new Error('Failed to get swap chain support');
        }

        this.m_swapChain = new Render.SwapChain();
        const swapChainResult = this.m_swapChain.init(
            this.m_surface,
            this.m_logicalDevice,
            this.m_swapChainSupport,
            VkFormat.VK_FORMAT_B8G8R8A8_SRGB,
            VkColorSpaceKHR.VK_COLOR_SPACE_SRGB_NONLINEAR_KHR,
            VkPresentModeKHR.VK_PRESENT_MODE_FIFO_KHR,
            3,
            8,
            VkImageUsageFlags.VK_IMAGE_USAGE_COLOR_ATTACHMENT_BIT,
            VkCompositeAlphaFlagsKHR.VK_COMPOSITE_ALPHA_OPAQUE_BIT_KHR,
            null
        );

        if (!swapChainResult) {
            this.shutdown();
            throw new Error('Failed to initialize swap chain');
        }

        if (!this.m_swapChain.isValid()) {
            this.shutdown();
            throw new Error('Swap chain is invalid');
        }

        this.m_resizeListener = this.m_window.onResize((width, height) => {
            this.onResize(width, height);
        });

        this.m_renderPass = new Render.RenderPass(this.m_swapChain);
        if (!this.m_renderPass.init()) {
            this.shutdown();
            throw new Error('Failed to initialize render pass');
        }

        this.m_frameManager = new Render.FrameManager(this.m_swapChain, this.m_renderPass);
        this.m_instance.addNestedLogger(this.m_frameManager);
        if (!this.m_frameManager.init()) {
            this.shutdown();
            throw new Error('Failed to initialize frame manager');
        }

        this.m_shaderCompiler = new Render.ShaderCompiler(this.m_logicalDevice);
        this.m_instance.addNestedLogger(this.m_shaderCompiler);
        if (!this.m_shaderCompiler.init()) {
            this.shutdown();
            throw new Error('Failed to initialize shader compiler');
        }

        this.m_graphicsPipeline = new Render.GraphicsPipeline(
            this.m_shaderCompiler,
            this.m_logicalDevice,
            this.m_swapChain,
            this.m_renderPass
        );

        this.m_instance.addNestedLogger(this.m_graphicsPipeline);

        this.m_vertexFormat = new Render.DataFormat();
        this.m_vertexFormat.addAttr(Render.DataType.Vec4f, 0, 1); // position
        this.m_vertexFormat.addAttr(Render.DataType.Vec4f, 16, 1); // color
        this.m_vertexFormat.addAttr(Render.DataType.Vec2f, 32, 1); // uv
        this.m_vertexFormat.addAttr(Render.DataType.Int, 40, 1); // instanceIdx

        this.m_uniformFormat = new Render.DataFormat();
        this.m_uniformFormat.addAttr(Render.DataType.Mat4f, 0, 1); // mvp
        this.m_uniformFormat.addAttr(Render.DataType.Float, 64, 1); // fontPixelRange
        this.m_uniformFormat.addAttr(Render.DataType.Int, 68, 1); // isFont

        this.m_graphicsPipeline.setVertexFormat(this.m_vertexFormat);
        this.m_graphicsPipeline.addUniformBlock(
            0,
            this.m_uniformFormat,
            VkShaderStageFlags.VK_SHADER_STAGE_VERTEX_BIT | VkShaderStageFlags.VK_SHADER_STAGE_FRAGMENT_BIT
        );
        this.m_graphicsPipeline.addStorageBuffer(1, VkShaderStageFlags.VK_SHADER_STAGE_FRAGMENT_BIT);
        this.m_graphicsPipeline.addStorageBuffer(
            2,
            VkShaderStageFlags.VK_SHADER_STAGE_VERTEX_BIT | VkShaderStageFlags.VK_SHADER_STAGE_FRAGMENT_BIT
        );
        this.m_graphicsPipeline.addSampler(3, VkShaderStageFlags.VK_SHADER_STAGE_FRAGMENT_BIT);
        this.m_graphicsPipeline.addDynamicState(VkDynamicState.VK_DYNAMIC_STATE_VIEWPORT);
        this.m_graphicsPipeline.addDynamicState(VkDynamicState.VK_DYNAMIC_STATE_SCISSOR);
        this.m_graphicsPipeline.setColorBlendEnabled(true);
        this.m_graphicsPipeline.setColorBlendOp(Render.BlendOp.Add);
        this.m_graphicsPipeline.setAlphaBlendOp(Render.BlendOp.Add);
        this.m_graphicsPipeline.setSrcColorBlendFactor(Render.BlendFactor.SrcAlpha);
        this.m_graphicsPipeline.setDstColorBlendFactor(Render.BlendFactor.OneMinusSrcAlpha);
        this.m_graphicsPipeline.setSrcAlphaBlendFactor(Render.BlendFactor.One);
        this.m_graphicsPipeline.setDstAlphaBlendFactor(Render.BlendFactor.OneMinusSrcAlpha);

        this.m_graphicsPipeline.setVertexShader(VertexShader);
        this.m_graphicsPipeline.setFragmentShader(FragmentShader);

        if (!this.m_graphicsPipeline.init()) {
            this.shutdown();
            throw new Error('Failed to initialize graphics pipeline');
        }

        this.m_vboFactory = new Render.VertexBufferFactory(this.m_logicalDevice, 8096);
        this.m_uboFactory = new Render.UniformObjectFactory(this.m_logicalDevice, 1024);
        this.m_dsFactory = new Render.DescriptorFactory(this.m_logicalDevice, 256);

        this.m_defaultTexture = new Render.Texture(this.m_logicalDevice);
        const textureResult = this.m_defaultTexture.init(
            1,
            1,
            VkFormat.VK_FORMAT_R8G8B8A8_SRGB,
            VkImageType.VK_IMAGE_TYPE_2D,
            1,
            1,
            1,
            VkImageUsageFlags.VK_IMAGE_USAGE_SAMPLED_BIT,
            VkImageLayout.VK_IMAGE_LAYOUT_UNDEFINED,
            1
        );

        if (!textureResult) {
            this.shutdown();
            throw new Error('Failed to initialize default texture');
        }

        if (!this.m_defaultTexture.initStagingBuffer()) {
            this.shutdown();
            throw new Error('Failed to initialize default texture staging buffer');
        }

        if (!this.m_defaultTexture.initSampler(VkFilter.VK_FILTER_LINEAR, VkFilter.VK_FILTER_LINEAR)) {
            this.shutdown();
            throw new Error('Failed to initialize default texture sampler');
        }

        const cb = this.m_frameManager.getCommandPool().createBuffer(true);
        this.m_defaultTexture.setLayout(cb, VkImageLayout.VK_IMAGE_LAYOUT_SHADER_READ_ONLY_OPTIMAL);

        if (!cb.begin(VkCommandBufferUsageFlags.VK_COMMAND_BUFFER_USAGE_ONE_TIME_SUBMIT_BIT)) {
            this.shutdown();
            throw new Error('Failed to begin command buffer for updating default texture');
        }

        const data = new ArrayBuffer(4);
        const view = new Uint8Array(data);
        view[0] = 255;
        view[1] = 255;
        view[2] = 255;
        view[3] = 255;
        this.m_defaultTexture.getStagingBuffer().write(data, 0, 4);

        this.m_defaultTexture.setLayout(cb, VkImageLayout.VK_IMAGE_LAYOUT_TRANSFER_DST_OPTIMAL);
        this.m_defaultTexture.flushPixels(cb);
        this.m_defaultTexture.setLayout(cb, VkImageLayout.VK_IMAGE_LAYOUT_SHADER_READ_ONLY_OPTIMAL);
        cb.end();

        this.m_logicalDevice.getGraphicsQueue().submit(cb, null, [], [], VkPipelineStageFlags.VK_PIPELINE_STAGE_NONE);
        this.m_logicalDevice.getGraphicsQueue().waitForIdle();
        this.m_defaultTexture.shutdownStagingBuffer();
    }

    shutdown() {
        if (this.m_resizeListener) {
            this.m_window.offResize(this.m_resizeListener);
            this.m_resizeListener = null;
        }

        if (this.m_logicalDevice) {
            this.m_logicalDevice.getGraphicsQueue().waitForIdle();
            this.m_logicalDevice.waitForIdle();
        }

        this.m_drawCalls.forEach(dc => {
            dc.vertices.free();
            dc.uniforms.uniformObject.free();
            dc.uniforms.descriptorSet.free();
        });

        if (this.m_currentClipRectBuffer) {
            this.m_currentClipRectBuffer.destroy();
        }

        if (this.m_currentInstanceBuffer) {
            this.m_currentInstanceBuffer.destroy();
        }

        if (this.m_defaultTexture) this.m_defaultTexture.destroy();
        if (this.m_dsFactory) this.m_dsFactory.destroy();
        if (this.m_uboFactory) this.m_uboFactory.destroy();
        if (this.m_vboFactory) this.m_vboFactory.destroy();
        if (this.m_graphicsPipeline) {
            this.m_instance!.removeNestedLogger(this.m_graphicsPipeline);
            this.m_graphicsPipeline.destroy();
        }
        if (this.m_uniformFormat) this.m_uniformFormat.destroy();
        if (this.m_vertexFormat) this.m_vertexFormat.destroy();
        if (this.m_shaderCompiler) {
            this.m_instance!.removeNestedLogger(this.m_shaderCompiler);
            this.m_shaderCompiler.destroy();
        }
        if (this.m_frameManager) {
            this.m_instance!.removeNestedLogger(this.m_frameManager);
            this.m_frameManager.destroy();
        }
        if (this.m_renderPass) this.m_renderPass.destroy();
        if (this.m_swapChain) this.m_swapChain.destroy();
        if (this.m_swapChainSupport) this.m_swapChainSupport.destroy();
        if (this.m_logicalDevice) this.m_logicalDevice.destroy();
        if (this.m_physicalDevice) this.m_physicalDevice.destroy();
        if (this.m_surface) this.m_surface.destroy();
        if (this.m_instance) {
            this.m_window.removeNestedLogger(this.m_instance);
            this.m_instance.destroy();
        }

        this.m_instance = null;
        this.m_surface = null;
        this.m_physicalDevice = null;
        this.m_logicalDevice = null;
        this.m_shaderCompiler = null;
        this.m_swapChainSupport = null;
        this.m_swapChain = null;
        this.m_renderPass = null;
        this.m_frameManager = null;
        this.m_graphicsPipeline = null;
        this.m_vboFactory = null;
        this.m_uboFactory = null;
        this.m_dsFactory = null;
        this.m_vertexFormat = null;
        this.m_uniformFormat = null;
        this.m_defaultTexture = null;
        this.m_currentFrame = null;
        this.m_renderPassStarted = false;
        this.m_drawCalls = [];
        this.m_currentClipRectBuffer = null;
        this.m_currentInstanceBuffer = null;
    }

    onResize(width: u32, height: u32) {
        this.m_windowSize = { width, height };

        if (!this.m_swapChain || !this.m_frameManager || !this.m_logicalDevice) return;
        this.m_logicalDevice.waitForIdle();
        if (!this.m_swapChain.recreate()) {
            this.shutdown();
            throw new Error('Failed to recreate swap chain after window resized');
        }

        this.m_frameManager.shutdown();
        if (!this.m_frameManager.init()) {
            this.shutdown();
            throw new Error('Failed to recreate frame manager after window resized');
        }

        this.m_clipRectManager.setRootSize({ width, height });
    }

    allocateDrawCall(vertexCount: u32) {
        const { vboFactory, uboFactory, dsFactory, vertexFormat, uniformFormat, graphicsPipeline, defaultTexture } =
            this.renderContext;

        const vertices = vboFactory.allocate(vertexFormat, vertexCount);
        const uniforms = uboFactory.allocate(uniformFormat);
        const ds = dsFactory.allocate(graphicsPipeline);

        ds.addUniformObject(uniforms, 0);
        // ds.addStorageBuffer(clipRectBuffer, 1);
        ds.addTexture(defaultTexture, 3);
        // ds.update();

        const call = new DrawCall(vertices, uniforms, ds, vertexCount, vertexFormat.getSize());
        this.m_drawCalls.push(call);
        return call;
    }

    allocateTextDraw(vertexCount: u32, fontFamily: FontFamily) {
        if (!fontFamily.isLoaded) throw new Error('FontFamily.atlas is not loaded');

        const { vboFactory, uboFactory, dsFactory, vertexFormat, uniformFormat, graphicsPipeline } = this.renderContext;

        const vertices = vboFactory.allocate(vertexFormat, vertexCount);
        const uniforms = uboFactory.allocate(uniformFormat);
        const ds = dsFactory.allocate(graphicsPipeline);

        ds.addUniformObject(uniforms, 0);
        // ds.addStorageBuffer(clipRectBuffer, 1);
        ds.addTexture(fontFamily.atlas!.texture, 3);
        // ds.update();

        const call = new DrawCall(vertices, uniforms, ds, vertexCount, vertexFormat.getSize());
        this.m_drawCalls.push(call);

        return new TextDraw(call, fontFamily.atlas!, fontFamily.name);
    }

    freeDrawCall(drawCall: DrawCall) {
        drawCall.vertices.free();
        drawCall.uniforms.uniformObject.free();
        drawCall.uniforms.descriptorSet.free();
        this.m_drawCalls = this.m_drawCalls.filter(dc => dc !== drawCall);
    }

    begin() {
        const { frameManager } = this.renderContext;
        if (this.m_currentFrame) throw new Error('RenderContext.begin() called without RenderContext.end()');
        this.m_currentFrame = frameManager.getFrame();

        if (!this.m_currentFrame.begin()) {
            console.error('Failed to begin frame');
            frameManager.releaseFrame(this.m_currentFrame);
            this.m_currentFrame = null;
            return false;
        }

        return true;
    }

    end() {
        const { frameManager } = this.renderContext;
        if (!this.m_currentFrame) throw new Error('RenderContext.end() called without RenderContext.begin()');

        this.m_currentFrame.end();
        frameManager.releaseFrame(this.m_currentFrame);
        this.m_currentFrame = null;
    }

    beginRenderPass() {
        if (!this.m_currentFrame) {
            throw new Error('RenderContext.beginRenderPass() called without RenderContext.begin()');
        }

        if (this.m_renderPassStarted) {
            throw new Error('RenderContext.beginRenderPass() called without RenderContext.endRenderPass()');
        }

        const { logicalDevice, graphicsPipeline, windowSize } = this.renderContext;
        const cb = this.m_currentFrame.getCommandBuffer();

        this.m_logicalDevice!.waitForIdle();

        if (this.m_currentClipRectBuffer) {
            this.m_currentClipRectBuffer.shutdown();
            this.m_currentClipRectBuffer.destroy();
            this.m_currentClipRectBuffer = null;
        }

        if (this.m_currentInstanceBuffer) {
            this.m_currentInstanceBuffer.shutdown();
            this.m_currentInstanceBuffer.destroy();
            this.m_currentInstanceBuffer = null;
        }

        this.m_currentClipRectBuffer = this.m_clipRectManager.generateBuffer(logicalDevice);
        this.m_currentInstanceBuffer = this.m_instanceManager.generateBuffer(logicalDevice);

        this.m_drawCalls.forEach(dc => {
            const descriptorSet = dc.descriptorSet;
            descriptorSet.addStorageBuffer(this.m_currentClipRectBuffer!, 1);
            descriptorSet.addStorageBuffer(this.m_currentInstanceBuffer!, 2);
            descriptorSet.update();
            dc.beforeRenderPass(cb);
        });

        cb.beginRenderPass(graphicsPipeline, this.m_currentFrame.getFramebuffer());
        cb.bindPipeline(graphicsPipeline, VkPipelineBindPoint.VK_PIPELINE_BIND_POINT_GRAPHICS);
        this.m_currentFrame.setClearColorF(0, new vec4f(0.05, 0.05, 0.05, 1));
        this.m_currentFrame.setClearDepthStencil(1, 1.0, 0);
        cb.setViewport(0, windowSize.height, windowSize.width, -windowSize.height, 0, 1);
        cb.setScissor(0, 0, windowSize.width, windowSize.height);

        this.m_drawCalls.forEach(dc => dc.draw(cb));
        this.m_renderPassStarted = true;
    }

    endRenderPass() {
        if (!this.m_currentFrame) {
            throw new Error('RenderContext.endRenderPass() called without RenderContext.beginRenderPass()');
        }

        if (!this.m_renderPassStarted) {
            throw new Error('RenderContext.endRenderPass() called without RenderContext.beginRenderPass()');
        }

        this.m_currentFrame.getCommandBuffer().endRenderPass();
        this.m_renderPassStarted = false;
    }
}
