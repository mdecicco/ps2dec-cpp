/*
import { useCurrentWindow, Window, Vulkan } from 'components';
import PluginManager from 'plugin-manager';
import { vec3f, vec4f } from 'math';
import * as React from 'mini-react';
import * as Render from 'render';
import * as BaseUI from 'base-ui';
import { IPlugin } from 'plugin';
import {
    VkColorSpaceKHR,
    VkCompositeAlphaFlagsKHR,
    VkFormat,
    VkImageUsageFlags,
    VkPipelineBindPoint,
    VkPresentModeKHR
} from 'vulkan';
import { useGraphicsPipeline, useRender } from 'components/vulkan';

type GridProps = {
    width: number;
    length: number;
};

const Grid: React.FC<GridProps> = props => {
    const draw = Vulkan.useDebugDraw();
    const { window } = useCurrentWindow();
    const [widthAdd, setWidthAdd] = React.useState(0);
    const [lengthAdd, setLengthAdd] = React.useState(0);

    React.useEffect(() => {
        if (!window) return;

        const l = window.onKeyDown(key => {
            switch (key) {
                case KeyboardKey.Up: {
                    setLengthAdd(lengthAdd + 1);
                    break;
                }
                case KeyboardKey.Down: {
                    setLengthAdd(lengthAdd - 1);
                    break;
                }
                case KeyboardKey.Left: {
                    setWidthAdd(widthAdd - 1);
                    break;
                }
                case KeyboardKey.Right: {
                    setWidthAdd(widthAdd + 1);
                }
            }
        });

        return () => {
            window.offKeyDown(l);
        };
    }, [window, widthAdd, lengthAdd]);

    if (!draw) return null;

    const { width, length } = props;

    return (
        <Vulkan.RenderNode
            execute={() => {
                const w = width + widthAdd;
                const l = length + lengthAdd;
                draw.originGrid(w, l);
                draw.box(new vec3f(-w / 2, -0.5, -l / 2), new vec3f(w / 2, 0.5, l / 2), new vec4f(1, 1, 0, 1));
            }}
        />
    );
};

const Triangle: React.FC<{ t: number }> = props => {
    const { initDraw, beforeRender } = BaseUI.useBaseUI();
    const { size } = useCurrentWindow();
    const { requestAdditionalFrame } = useRender();
    const { pipeline, allocateVertices } = useGraphicsPipeline();
    const vertices = React.useMemo<Render.Vertices>(
        prev => {
            if (prev && prev.value) {
                console.log('freeing vertices');
                prev.value.free();
            }

            console.log('allocating vertices');
            return allocateVertices(3);
        },
        [pipeline]
    );

    const t = React.useRef(props.t);

    if (!vertices || size.width === 0 || size.height === 0) return null;

    return (
        <Vulkan.RenderNode
            beforeRender={frame => {
                beforeRender(frame);

                t.current += 0.01;
                if (vertices.beginUpdate()) {
                    const xoff = Math.sin(t.current);
                    const yoff = Math.cos(t.current);
                    const data = new Float32Array([
                        // vertex 0
                        0.0 + xoff,
                        -0.5 + yoff,

                        // vertex 1
                        -0.5 + xoff,
                        0.5 + yoff,

                        // vertex 2
                        0.5 + xoff,
                        0.5 + yoff
                    ]);
                    vertices.write(data.buffer, 0, 3);
                    vertices.endUpdate();
                } else {
                    console.error('Failed to update vertices');
                }
            }}
            execute={frame => {
                const cb = frame.getCommandBuffer();
                initDraw(cb);
                cb.bindVertexBuffer(vertices.getBuffer(), vertices.getByteOffset());
                cb.drawAll(vertices);
                requestAdditionalFrame();
            }}
        />
    );
};

class TestPlugin extends IPlugin {
    constructor() {
        super('TestPlugin');
    }

    onInitialize() {
        const root = React.createRoot();
        root.render(
            <Window open={true} title='Test Window'>
                <Vulkan.Root enableValidation needsGraphics extensions={['VK_KHR_swapchain']}>
                    <Vulkan.RenderPass
                        imageFormat={VkFormat.VK_FORMAT_B8G8R8A8_SRGB}
                        imageColorSpace={VkColorSpaceKHR.VK_COLOR_SPACE_SRGB_NONLINEAR_KHR}
                        presentMode={VkPresentModeKHR.VK_PRESENT_MODE_FIFO_KHR}
                        imageCount={3}
                        usage={VkImageUsageFlags.VK_IMAGE_USAGE_COLOR_ATTACHMENT_BIT}
                        compositeAlpha={VkCompositeAlphaFlagsKHR.VK_COMPOSITE_ALPHA_OPAQUE_BIT_KHR}
                    >
                        <Vulkan.RenderGraph>
                            <BaseUI.Root>
                                {Array.from({ length: 10 }).map((_, i) => (
                                    <Triangle t={i} key={i} />
                                ))}
                            </BaseUI.Root>
                        </Vulkan.RenderGraph>
                    </Vulkan.RenderPass>
                </Vulkan.Root>
            </Window>
        );
    }
}

PluginManager.addPlugin(new TestPlugin());
*/
