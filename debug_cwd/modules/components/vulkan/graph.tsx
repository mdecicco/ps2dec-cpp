import * as React from 'mini-react';
import * as Render from 'render';
import { decompiler } from 'decompiler';

import { useCurrentWindow } from '../window';
import { useRenderPass } from './render-pass';
import { ContextTreeNode } from 'mini-react';

type RenderGraphProps = {
    children?: React.ReactNode;
};

type BeforeRenderCallback = (frame: Render.FrameContext) => void;
type RenderCallback = (frame: Render.FrameContext) => void;
type RenderNodeData = {
    beforeRender: BeforeRenderCallback | null;
    render: RenderCallback | null;
};

type RenderContext = {
    setNeedsRender: (value: boolean) => void;
};

const RenderContext = React.createContext<RenderContext>();
RenderContext.Provider.displayName = 'RenderGraphProvider';

const RenderNodeContext = React.createContext<RenderNodeData>();
RenderNodeContext.Provider.displayName = 'RenderNodeProvider';

function beforeRenderNode(node: ContextTreeNode<RenderNodeData>, frame: Render.FrameContext) {
    if (node.value.beforeRender) node.value.beforeRender(frame);
    for (const child of node.children) beforeRenderNode(child, frame);
}

function renderNode(node: ContextTreeNode<RenderNodeData>, frame: Render.FrameContext) {
    if (node.value.render) node.value.render(frame);
    for (const child of node.children) renderNode(child, frame);
}

export const RenderGraph: React.FC<RenderGraphProps> = props => {
    const { size } = useCurrentWindow();
    const renderPass = useRenderPass();
    const needsRender = React.useRef(true);
    const renderTrees = React.useRef<ContextTreeNode<RenderNodeData>[]>([]);

    React.useContextTree(RenderNodeContext, trees => {
        renderTrees.current = trees;
    });

    const render = () => {
        if (!needsRender.current || !renderPass.frameManager) return;
        needsRender.current = false;

        const frame = renderPass.frameManager.getFrame();

        if (frame.begin()) {
            for (const tree of renderTrees.current) {
                beforeRenderNode(tree, frame);
            }

            for (const tree of renderTrees.current) {
                renderNode(tree, frame);
            }

            frame.end();
        }

        renderPass.frameManager.releaseFrame(frame);
    };

    React.useEffect(() => {
        const l = decompiler.onService(render);

        return () => {
            decompiler.offService(l);
        };
    }, [renderPass.frameManager]);

    React.useEffect(() => {
        needsRender.current = true;

        // windows blocks event polling on resize, so we must render now to update the view
        render();
    }, [size.width, size.height]);

    const setNeedsRender = (value: boolean) => {
        needsRender.current = value;
    };

    const ctx = React.useRef<RenderContext>({
        setNeedsRender
    });

    return <RenderContext.Provider value={ctx.current}>{props.children}</RenderContext.Provider>;
};

export function useRender() {
    const ctx = React.useContext(RenderContext);
    if (!ctx) throw new Error('useRenderer must be used within a RenderProvider component');

    const requestAdditionalFrame = () => {
        ctx.setNeedsRender(true);
    };

    return {
        requestAdditionalFrame
    };
}

type RenderNodeProps = {
    beforeRender?: BeforeRenderCallback;
    execute?: RenderCallback;
    children?: React.ReactNode;
};

export const RenderNode: React.FC<RenderNodeProps> = props => {
    const renderCtx = React.useContext(RenderContext);
    if (!renderCtx) throw new Error('RenderNode must be used within a RenderProvider component');
    renderCtx.setNeedsRender(true);

    const nodeData = {
        beforeRender: props.beforeRender || null,
        render: props.execute || null
    };

    return <RenderNodeContext.Provider value={nodeData}>{props.children}</RenderNodeContext.Provider>;
};
