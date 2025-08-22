import * as React from 'mini-react';
import * as Render from 'render';
import { EventProducer } from 'event';
import { Window } from 'window';

import { useCurrentWindow } from '../window';
import { defaultChoosePhysicalDevice } from './logic';

type VulkanRootEventMap = {
    'before-shutdown': () => void;
};

type VulkanRootContext = {
    instance: Render.Instance;
    physicalDevice: Render.PhysicalDevice;
    logicalDevice: Render.LogicalDevice;
    surface: Render.Surface;
    eventSource: EventProducer<VulkanRootEventMap>;
};

const Context = React.createContext<VulkanRootContext>();
Context.Provider.displayName = 'VulkanRootProvider';

type VulkanRootProps = {
    children?: React.ReactNode;
    enableValidation?: boolean;
    extensions?: string[];
    needsGraphics?: boolean;
    needsCompute?: boolean;
    needsTransfer?: boolean;
    selectPhysicalDevice?: (devices: Render.PhysicalDevice[]) => Render.PhysicalDevice;
};

function createContext(window: Window, props: VulkanRootProps): VulkanRootContext {
    const extensions = props.extensions ?? [];
    let instance: Render.Instance | null = null;
    let surface: Render.Surface | null = null;
    let physicalDevice: Render.PhysicalDevice | null = null;
    let logicalDevice: Render.LogicalDevice | null = null;

    const abort = (message: string) => {
        if (logicalDevice) logicalDevice.destroy();
        if (physicalDevice) physicalDevice.destroy();
        if (surface) surface.destroy();
        if (instance) {
            window.removeNestedLogger(instance);
            instance.destroy();
        }

        throw new Error(message);
    };

    instance = new Render.Instance();
    window.addNestedLogger(instance);

    if (props.enableValidation) instance.enableValidation();

    if (!instance.initialize()) {
        abort('Failed to initialize Vulkan instance');
    }

    surface = new Render.Surface(instance, window);
    if (!surface.init()) {
        abort('Failed to initialize Vulkan surface');
    }

    try {
        if (props.selectPhysicalDevice) {
            physicalDevice = props.selectPhysicalDevice(Render.PhysicalDevice.list(instance));
        } else {
            physicalDevice = defaultChoosePhysicalDevice(instance, surface);
        }
    } catch (e) {
        abort(`Caught exception while selecting physical device: ${String(e)}`);
    }

    if (!physicalDevice) {
        abort('Failed to find suitable physical device');
    }

    physicalDevice = new Render.PhysicalDevice(physicalDevice!);

    logicalDevice = new Render.LogicalDevice(physicalDevice!);
    for (const extension of extensions) {
        if (!logicalDevice.enableExtension(extension)) {
            abort(`Failed to enable extension: ${extension}`);
        }
    }

    let result = logicalDevice.init(
        props.needsGraphics ?? false,
        props.needsCompute ?? false,
        props.needsTransfer ?? false,
        surface
    );

    if (!result) abort('Failed to initialize logical device');

    return {
        instance,
        physicalDevice: physicalDevice!,
        logicalDevice,
        surface,
        eventSource: new EventProducer<VulkanRootEventMap>()
    };
}

function shutdownContext(window: Window, ctx: VulkanRootContext) {
    ctx.eventSource.dispatchReverse('before-shutdown');
    if (ctx.logicalDevice) ctx.logicalDevice.destroy();
    if (ctx.surface) ctx.surface.destroy();
    if (ctx.instance) {
        window.removeNestedLogger(ctx.instance);
        ctx.instance.destroy();
    }
}

export const Root: React.FC<VulkanRootProps> = props => {
    const { window } = useCurrentWindow();
    const context = React.useRef<VulkanRootContext | null>(null);
    const error = React.useRef<Error | null>(null);
    const prevProps = React.useRef<VulkanRootProps | null>(null);

    React.useEffect(() => {
        if (error.current) return;

        if (!window) {
            if (context.current) {
                shutdownContext(window, context.current);
                context.current = null;
                error.current = null;
            }

            return;
        }

        if (!prevProps.current) {
            prevProps.current = props;

            try {
                context.current = createContext(window, props);
                error.current = null;
            } catch (e) {
                console.error('Failed to create Vulkan root context', String(e));
                context.current = null;
                error.current = e as Error;
            }

            return;
        }

        if (!context.current) {
            prevProps.current = props;

            try {
                context.current = createContext(window, props);
                error.current = null;
            } catch (e) {
                console.error('Failed to create Vulkan root context', String(e));
                context.current = null;
                error.current = e as Error;
            }

            return;
        }

        if (!React.comparePropsDeep(prevProps.current, props)) {
            prevProps.current = props;
            let newContext: VulkanRootContext | null = null;

            try {
                newContext = createContext(window, props);
                shutdownContext(window, context.current);

                context.current = newContext;
                error.current = null;
            } catch (e) {
                console.error('Failed to create Vulkan root context', String(e));

                if (newContext) {
                    try {
                        shutdownContext(window, newContext);
                    } catch (e1) {
                        console.error(
                            'Failed to shutdown vulkan root context that was created but not used due to another error',
                            String(e1)
                        );
                    }
                }

                context.current = null;
                error.current = e as Error;
            }

            return;
        }
    }, [window, context, props, error]);

    React.useEffect(() => {
        return () => {
            if (context.current) {
                shutdownContext(window, context.current);
                context.current = null;
                error.current = null;
            }
        };
    }, []);

    if (!context.current) return null;
    return <Context.Provider value={context.current}>{props.children}</Context.Provider>;
};

export function useVulkan() {
    const context = React.useContext(Context);
    if (!context) throw new Error('useVulkan must be used within a Vulkan.Root component');

    const addListener = context.eventSource.addListener.bind(context.eventSource);

    return {
        instance: context.instance,
        physicalDevice: context.physicalDevice,
        logicalDevice: context.logicalDevice,
        surface: context.surface,
        addListener
    };
}
