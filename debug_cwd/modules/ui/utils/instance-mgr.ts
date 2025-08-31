import * as Render from 'render';
import { Element } from '../renderer/element';
import { VkBufferUsageFlags, VkMemoryPropertyFlags, VkSharingMode } from 'vulkan';

type Instance = {
    offsetX: f32;
    offsetY: f32;
    offsetZ: f32;
    clipRectIndex: i32;

    // used internally by the instance manager, not passed to the storage buffer
    isFreed: boolean;
};

const INSTANCE_SIZE = 4 * 4;

export class InstanceManager {
    private m_instances: Instance[];

    constructor() {
        this.m_instances = [
            {
                offsetX: 0,
                offsetY: 0,
                offsetZ: 0,
                clipRectIndex: -1,
                isFreed: false
            }
        ];
    }

    allocateInstance(element: Element) {
        if (element.rendererState.instanceIdx !== -1) {
            throw new Error('Element already has an instance');
        }

        const instance: Instance = {
            offsetX: 0,
            offsetY: 0,
            offsetZ: 0,
            clipRectIndex: -1,
            isFreed: false
        };

        this.m_instances.push(instance);
        element.rendererState.instanceIdx = this.m_instances.length - 1;
        return this.m_instances.length - 1;
    }

    freeInstance(element: Element) {
        if (element.rendererState.instanceIdx === -1) {
            throw new Error('Element has no instance');
        }

        this.m_instances[element.rendererState.instanceIdx].isFreed = true;
    }

    updateInstance(element: Element, instance: Partial<Omit<Instance, 'isFreed'>>) {
        const index = element.rendererState.instanceIdx;
        if (index === -1) {
            throw new Error('Element has no instance');
        }

        const current = this.m_instances[index];
        Object.assign(current, instance);
    }

    generateBuffer(logicalDevice: Render.LogicalDevice) {
        const buffer = new Render.Buffer(logicalDevice);

        let status: boolean;
        const size = Math.max(Math.max(INSTANCE_SIZE, 64) * this.m_instances.length, 64);
        status = buffer.init(
            size,
            VkBufferUsageFlags.VK_BUFFER_USAGE_STORAGE_BUFFER_BIT,
            VkSharingMode.VK_SHARING_MODE_EXCLUSIVE,
            VkMemoryPropertyFlags.VK_MEMORY_PROPERTY_DEVICE_LOCAL_BIT |
                VkMemoryPropertyFlags.VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT
        );

        if (!status) {
            throw new Error('Failed to initialize instance buffer');
        }

        const data = new ArrayBuffer(size);
        const dataView = new DataView(data);
        for (let i = 0; i < this.m_instances.length; i++) {
            const instance = this.m_instances[i];
            const offset = i * INSTANCE_SIZE;
            dataView.setFloat32(offset + 0, instance.offsetX, true);
            dataView.setFloat32(offset + 4, instance.offsetY, true);
            dataView.setFloat32(offset + 8, instance.offsetZ, true);
            dataView.setInt32(offset + 12, instance.clipRectIndex, true);
        }

        if (!buffer.map()) {
            buffer.shutdown();
            buffer.destroy();
            throw new Error('Failed to map instance buffer');
        }

        if (!buffer.write(data, 0, data.byteLength)) {
            buffer.shutdown();
            buffer.destroy();
            throw new Error('Failed to write instance buffer');
        }

        if (!buffer.flush(0, data.byteLength)) {
            buffer.shutdown();
            buffer.destroy();
            throw new Error('Failed to flush instance buffer');
        }

        buffer.unmap();

        return buffer;
    }
}
