import * as React from 'mini-react';
import * as Render from 'render';
import * as Vulkan from '../components/vulkan';
import { VkDynamicState, VkPipelineBindPoint, VkShaderStageFlags } from 'vulkan';
import { mat4 } from 'math-ext';
import { useCurrentWindow } from 'components';
import { vec4f } from 'math';

type RootProps = {
    children?: React.ReactNode;
};

export const Root: React.FC<RootProps> = props => {
    const { size } = useCurrentWindow();
    const vertexFormat = React.useMemo(() => {
        const fmt = new Render.DataFormat();
        fmt.addAttr(Render.DataType.Vec2f, 0, 1);

        return fmt;
    });

    const uniformFormat = React.useMemo(() => {
        const fmt = new Render.DataFormat();
        fmt.addAttr(Render.DataType.Mat4f, 0, 1);

        return fmt;
    });

    React.useEffect(() => {
        return () => {
            vertexFormat.destroy();
            uniformFormat.destroy();
        };
    }, []);

    return (
        <Vulkan.GraphicsPipeline
            vertexFormat={vertexFormat}
            dynamicStateFields={[VkDynamicState.VK_DYNAMIC_STATE_VIEWPORT, VkDynamicState.VK_DYNAMIC_STATE_SCISSOR]}
            uniformBlocks={[
                {
                    bindIndex: 0,
                    format: uniformFormat,
                    stages: VkShaderStageFlags.VK_SHADER_STAGE_VERTEX_BIT
                }
            ]}
            vertexShaderSource='
                #version 450

                layout(std140, binding = 0) uniform Data {
                    mat4 mvp;
                };

                layout(location = 0) in vec2 position;

                void main() {
                    gl_Position = mvp * vec4(position * 0.5, 0.0, 1.0);
                }
            '
            fragmentShaderSource='
                #version 450

                layout(location = 0) out vec4 outColor;

                void main() {
                    outColor = vec4(1.0, 0.0, 0.0, 1.0);
                }
            '
        >
            <Vulkan.RenderNode
                beforeRender={frame => {
                    const cb = frame.getCommandBuffer();
                    frame.setClearColorF(0, new vec4f(0.05, 0.05, 0.05, 1));
                    frame.setClearDepthStencil(1, 1.0, 0);
                    cb.setViewport(0, size.height, size.width, -size.height, 0, 1);
                }}
            >
                {props.children}
            </Vulkan.RenderNode>
        </Vulkan.GraphicsPipeline>
    );
};

type BaseUIContext = {
    mvpMatrix: mat4;
    uniforms: Render.UniformObject;
    uniformData: ArrayBuffer;
    uniformDataView: DataView;
    descriptorSet: Render.DescriptorSet;
    scissorRegion: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
};

export function useBaseUI() {
    const { logicalDevice } = Vulkan.useVulkan();
    const { pipeline, allocateUniformObject, allocateDescriptorSet } = Vulkan.useGraphicsPipeline();
    const { size } = useCurrentWindow();

    const ctx = React.useMemo<BaseUIContext>(() => {
        const mvpMatrix = mat4.identity();
        const uniforms = allocateUniformObject(0);
        const uniformData = new ArrayBuffer(
            // 16 floats for the MVP matrix
            16 * 4
        );
        const uniformDataView = new DataView(uniformData);
        const descriptorSet = allocateDescriptorSet();

        descriptorSet.addUniformObject(uniforms, 0);
        descriptorSet.update();
        mvpMatrix.serialize(uniformDataView, 0);

        return {
            mvpMatrix,
            uniforms,
            uniformData,
            uniformDataView,
            descriptorSet,
            scissorRegion: {
                x: 0,
                y: 0,
                width: size.width,
                height: size.height
            }
        };
    });

    React.useEffect(() => {
        return () => {
            logicalDevice.getGraphicsQueue().waitForIdle();
            ctx.descriptorSet.free();
            ctx.uniforms.free();
        };
    }, []);

    const updateMVP = (mvp: mat4) => {
        ctx.mvpMatrix = mvp;
        mvp.serialize(ctx.uniformDataView, 0);
    };

    const updateUniforms = (cb: Render.CommandBuffer) => {
        ctx.uniforms.write(ctx.uniformData);
        ctx.uniforms.getBuffer().submitUpdates(cb);
    };

    const beforeRender = (frame: Render.FrameContext) => {
        const cb = frame.getCommandBuffer();
        updateUniforms(cb);
    };

    const initDraw = (cb: Render.CommandBuffer) => {
        cb.bindPipeline(pipeline, VkPipelineBindPoint.VK_PIPELINE_BIND_POINT_GRAPHICS);
        cb.setScissor(ctx.scissorRegion.x, ctx.scissorRegion.y, ctx.scissorRegion.width, ctx.scissorRegion.height);
        cb.bindDescriptorSet(ctx.descriptorSet, VkPipelineBindPoint.VK_PIPELINE_BIND_POINT_GRAPHICS);
    };

    return {
        updateMVP,
        updateUniforms,
        initDraw,
        beforeRender
    };
}
