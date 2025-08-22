import * as React from 'mini-react';
import * as Render from 'render';

import { useRenderPass } from './render-pass';
import { RenderNode } from './graph';

type DebugDrawProps = {
    children?: React.ReactNode;

    /**
     * The maximum number of lines that can be drawn per frame
     * @default 4096
     */
    maxLines?: number;
};

type DebugDrawContext = {
    debugDraw: Render.SimpleDebugDraw;
};

const Context = React.createContext<DebugDrawContext>();
Context.Provider.displayName = 'DebugDrawProvider';

export const DebugDraw: React.FC<DebugDrawProps> = props => {
    const { children, maxLines } = props;
    const renderPass = useRenderPass();

    const context = React.useRef<DebugDrawContext | null>(null);

    React.useEffect(() => {
        if (!context.current) {
            const debugDraw = new Render.SimpleDebugDraw();
            const result = debugDraw.init(
                renderPass.shaderCompiler,
                renderPass.swapChain,
                renderPass.renderPass,
                renderPass.vboFactory,
                renderPass.uboFactory,
                renderPass.dsFactory,
                maxLines ?? 4096
            );

            if (!result) {
                console.error('Failed to initialize debug draw');
                return;
            }

            context.current = { debugDraw };
        }

        return () => {
            if (context.current) {
                renderPass.renderPass.getDevice().waitForIdle();
                context.current.debugDraw.destroy();
                context.current = null;
            }
        };
    }, []);

    if (!context.current) return null;
    const { debugDraw } = context.current;

    return (
        <Context.Provider value={context.current}>
            <RenderNode
                execute={frame => {
                    debugDraw.begin(frame.getSwapChainImageIndex());
                }}
            />
            {children}
            <RenderNode
                execute={frame => {
                    const cb = frame.getCommandBuffer();
                    debugDraw.end(cb);

                    cb.beginRenderPass(debugDraw.getPipeline(), frame.getFramebuffer());
                    debugDraw.draw(cb);
                    cb.endRenderPass();
                }}
            />
        </Context.Provider>
    );
};

export function useDebugDraw() {
    const context = React.useContext(Context);
    if (!context) throw new Error('useDebugDraw must be used within a DebugDraw component');

    return context.debugDraw;
}
