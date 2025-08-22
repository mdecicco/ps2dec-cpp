import * as React from 'mini-react';
import * as Render from 'render';
import { useVulkan } from './root';
import { VkDynamicState, VkPipelineBindPoint, VkShaderStageFlags } from 'vulkan';
import { useRenderPass } from './render-pass';
import { RenderNode } from './graph';

type VulkanGraphicsPipelineContext = {
    pipeline: Render.GraphicsPipeline;
    vertexFormat: Render.DataFormat | null;
    uniformBlocks: UniformBlock[];
    samplers: Sampler[];
};

const Context = React.createContext<VulkanGraphicsPipelineContext>();
Context.Provider.displayName = 'GraphicsPipelineProvider';

type UniformBlock = {
    bindIndex: u32;
    format: Render.DataFormat;
    stages: VkShaderStageFlags;
};

type Sampler = {
    bindIndex: u32;
    stages: VkShaderStageFlags;
};

type VulkanGraphicsPipelineProps = {
    children?: React.ReactNode;

    /**
     * The vertex format expected by the shaders
     */
    vertexFormat?: Render.DataFormat;

    /**
     * Description of the uniform blocks expected by the shaders
     */
    uniformBlocks?: UniformBlock[];

    /**
     * Description of the samplers expected by the shaders
     */
    samplers?: Sampler[];

    /**
     * The dynamic state fields that will be enabled
     */
    dynamicStateFields?: VkDynamicState[];

    /**
     * The source code of the vertex shader
     */
    vertexShaderSource?: string;

    /**
     * The source code of the fragment shader
     */
    fragmentShaderSource?: string;

    /**
     * The source code of the geometry shader
     */
    geometryShaderSource?: string;
};

function createContext(
    props: VulkanGraphicsPipelineProps,
    vulkan: ReturnType<typeof useVulkan>,
    renderPass: ReturnType<typeof useRenderPass>
): VulkanGraphicsPipelineContext {
    const pipeline = new Render.GraphicsPipeline(
        renderPass.shaderCompiler,
        vulkan.logicalDevice,
        renderPass.swapChain,
        renderPass.renderPass
    );

    vulkan.instance.addNestedLogger(pipeline);

    if (props.vertexFormat) pipeline.setVertexFormat(props.vertexFormat);

    if (props.uniformBlocks) {
        props.uniformBlocks.forEach(block => {
            pipeline.addUniformBlock(block.bindIndex, block.format, block.stages);
        });
    }

    if (props.samplers) {
        props.samplers.forEach(sampler => {
            pipeline.addSampler(sampler.bindIndex, sampler.stages);
        });
    }

    if (props.dynamicStateFields) {
        props.dynamicStateFields.forEach(field => pipeline.addDynamicState(field));
    }

    if (props.vertexShaderSource) {
        if (!pipeline.setVertexShader(props.vertexShaderSource)) {
            throw new Error('Failed to set vertex shader');
        }
    }

    if (props.fragmentShaderSource) {
        if (!pipeline.setFragmentShader(props.fragmentShaderSource)) {
            throw new Error('Failed to set fragment shader');
        }
    }
    if (props.geometryShaderSource) {
        if (!pipeline.setGeometryShader(props.geometryShaderSource)) {
            throw new Error('Failed to set geometry shader');
        }
    }

    if (!pipeline.init()) {
        throw new Error('Failed to initialize graphics pipeline');
    }

    return {
        pipeline,
        vertexFormat: props.vertexFormat || null,
        uniformBlocks: props.uniformBlocks || [],
        samplers: props.samplers || []
    };
}

function shutdownContext(context: VulkanGraphicsPipelineContext, vulkan: ReturnType<typeof useVulkan>) {
    if (context.pipeline) {
        try {
            vulkan.logicalDevice.waitForIdle();
            vulkan.instance.removeNestedLogger(context.pipeline);
            context.pipeline.destroy();
        } catch (e) {
            console.error('Failed to shutdown graphics pipeline', String(e));
        }
    }
}

export const GraphicsPipeline: React.FC<VulkanGraphicsPipelineProps> = props => {
    const vulkan = useVulkan();
    const renderPass = useRenderPass();
    const context = React.useRef<VulkanGraphicsPipelineContext | null>(null);
    const error = React.useRef<Error | null>(null);
    const prevProps = React.useRef<VulkanGraphicsPipelineProps | null>(null);

    const init = () => {
        let newContext: VulkanGraphicsPipelineContext | null = null;

        try {
            vulkan.logicalDevice.waitForIdle();
            newContext = createContext(props, vulkan, renderPass);
            if (context.current) shutdownContext(context.current, vulkan);
            context.current = newContext;
            error.current = null;
        } catch (e) {
            console.error('Failed to create graphics pipeline context', String(e));
            error.current = e as Error;

            if (newContext) {
                try {
                    if (newContext) shutdownContext(newContext, vulkan);
                } catch (e1) {
                    console.error(
                        'Failed to shutdown graphics pipeline context that was created but not used due to another error',
                        String(e1)
                    );
                }
            }
        }
    };

    const shutdown = () => {
        if (!context.current) return;
        shutdownContext(context.current, vulkan);
    };

    React.useEffect(init, [
        vulkan.logicalDevice,
        renderPass.shaderCompiler,
        renderPass.swapChain,
        renderPass.renderPass
    ]);

    React.useEffect(() => {
        if (error.current) return;

        if (!prevProps.current || !React.comparePropsDeep(prevProps.current, props)) init();
        prevProps.current = props;
    }, [props]);

    React.useEffect(() => {
        const listener = vulkan.addListener('before-shutdown', shutdown);

        return () => {
            listener.remove();
            shutdown();
        };
    }, []);

    if (!context.current) return null;
    const { pipeline } = context.current;

    return (
        <Context.Provider value={context.current}>
            <RenderNode
                execute={frame => {
                    const cb = frame.getCommandBuffer();
                    cb.beginRenderPass(pipeline, frame.getFramebuffer());
                    cb.bindPipeline(pipeline, VkPipelineBindPoint.VK_PIPELINE_BIND_POINT_GRAPHICS);
                }}
            />
            {props.children}
            <RenderNode
                execute={frame => {
                    const cb = frame.getCommandBuffer();
                    cb.endRenderPass();
                }}
            />
        </Context.Provider>
    );
};

export function useGraphicsPipeline() {
    const ctx = React.useContext(Context);
    if (!ctx) throw new Error('useGraphicsPipeline must be used within a Vulkan.GraphicsPipeline component');

    const { vboFactory, uboFactory, dsFactory } = useRenderPass();

    const allocateVertices = (count: u32) => {
        if (!ctx.vertexFormat) throw new Error('Vertex format not set');
        return vboFactory.allocate(ctx.vertexFormat, count);
    };

    const allocateUniformObject = (forBindingIndex: u32) => {
        const block = ctx.uniformBlocks.find(b => b.bindIndex === forBindingIndex);
        if (!block) {
            throw new Error(
                `No uniform block found in the pipeline for the specified binding index: ${forBindingIndex}`
            );
        }

        return uboFactory.allocate(block.format);
    };

    const allocateDescriptorSet = () => {
        return dsFactory.allocate(ctx.pipeline);
    };

    return {
        pipeline: ctx.pipeline,
        allocateVertices,
        allocateUniformObject,
        allocateDescriptorSet
    };
}
