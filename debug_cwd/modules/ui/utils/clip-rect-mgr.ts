import * as Render from 'render';
import { Element } from '../renderer/element';
import { ClientRect, Overflow } from '../types';
import { VkBufferUsageFlags, VkMemoryPropertyFlags, VkSharingMode } from 'vulkan';

type ClipRect = {
    left: f32;
    top: f32;
    right: f32;
    bottom: f32;
    topLeftRadius: f32;
    topRightRadius: f32;
    bottomLeftRadius: f32;
    bottomRightRadius: f32;
};

const CLIP_RECT_SIZE = 4 * 8;

export class ClipRectManager {
    private m_clipRects: ClientRect[];
    private m_clipRectIndexStack: u32[];
    private m_rootWidth: f32;
    private m_rootHeight: f32;

    constructor(rootWidth: f32, rootHeight: f32) {
        this.m_clipRects = [
            {
                x: 0,
                y: 0,
                width: rootWidth,
                height: rootHeight,
                top: 0,
                left: 0,
                right: rootWidth,
                bottom: rootHeight,
                topLeftRadius: 0,
                topRightRadius: 0,
                bottomLeftRadius: 0,
                bottomRightRadius: 0,
                paddingLeft: 0,
                paddingRight: 0,
                paddingTop: 0,
                paddingBottom: 0,
                marginLeft: 0,
                marginRight: 0,
                marginTop: 0,
                marginBottom: 0,
                depth: 0
            }
        ];
        this.m_clipRectIndexStack = [0];
        this.m_rootWidth = rootWidth;
        this.m_rootHeight = rootHeight;
    }

    get currentClip() {
        const index = this.m_clipRectIndexStack[this.m_clipRectIndexStack.length - 1];
        return {
            rect: this.m_clipRects[index],
            index
        };
    }

    setRootSize(size: { width: f32; height: f32 }) {
        this.m_rootWidth = size.width;
        this.m_rootHeight = size.height;
    }

    reset() {
        this.m_clipRects = [
            {
                x: 0,
                y: 0,
                width: this.m_rootWidth,
                height: this.m_rootHeight,
                top: 0,
                left: 0,
                right: this.m_rootWidth,
                bottom: this.m_rootHeight,
                topLeftRadius: 0,
                topRightRadius: 0,
                bottomLeftRadius: 0,
                bottomRightRadius: 0,
                paddingLeft: 0,
                paddingRight: 0,
                paddingTop: 0,
                paddingBottom: 0,
                marginLeft: 0,
                marginRight: 0,
                marginTop: 0,
                marginBottom: 0,
                depth: 0
            }
        ];
        this.m_clipRectIndexStack = [0];
    }

    beginElement(element: Element) {
        if (element.style.overflow === Overflow.Visible) {
            // No clip rect to apply
            return;
        }

        this.m_clipRectIndexStack.push(this.m_clipRects.length);
        this.m_clipRects.push(element.style.clientRect);
    }

    endElement(element: Element) {
        if (element.style.overflow === Overflow.Visible) {
            // No clip rect applied
            return;
        }

        if (this.m_clipRectIndexStack.length === 0) return;
        this.m_clipRectIndexStack.pop();
    }

    generateBuffer(logicalDevice: Render.LogicalDevice) {
        const buffer = new Render.Buffer(logicalDevice);

        let status: boolean;
        const size = Math.max(CLIP_RECT_SIZE * this.m_clipRects.length, 64);
        status = buffer.init(
            size,
            VkBufferUsageFlags.VK_BUFFER_USAGE_STORAGE_BUFFER_BIT,
            VkSharingMode.VK_SHARING_MODE_EXCLUSIVE,
            VkMemoryPropertyFlags.VK_MEMORY_PROPERTY_DEVICE_LOCAL_BIT |
                VkMemoryPropertyFlags.VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT
        );

        if (!status) {
            throw new Error('Failed to initialize clip rect buffer');
        }

        const data = new ArrayBuffer(size);
        const dataView = new DataView(data);
        for (let i = 0; i < this.m_clipRects.length; i++) {
            const clipRect = this.m_clipRects[i];
            const offset = i * CLIP_RECT_SIZE;
            dataView.setFloat32(offset + 0, clipRect.left, true);
            dataView.setFloat32(offset + 4, clipRect.top, true);
            dataView.setFloat32(offset + 8, clipRect.right, true);
            dataView.setFloat32(offset + 12, clipRect.bottom, true);
            dataView.setFloat32(offset + 16, clipRect.topLeftRadius, true);
            dataView.setFloat32(offset + 20, clipRect.topRightRadius, true);
            dataView.setFloat32(offset + 24, clipRect.bottomLeftRadius, true);
            dataView.setFloat32(offset + 28, clipRect.bottomRightRadius, true);
        }

        if (!buffer.map()) {
            buffer.shutdown();
            buffer.destroy();
            throw new Error('Failed to map clip rect buffer');
        }

        if (!buffer.write(data, 0, data.byteLength)) {
            buffer.shutdown();
            buffer.destroy();
            throw new Error('Failed to write clip rect buffer');
        }

        if (!buffer.flush(0, data.byteLength)) {
            buffer.shutdown();
            buffer.destroy();
            throw new Error('Failed to flush clip rect buffer');
        }

        buffer.unmap();

        return buffer;
    }
}
