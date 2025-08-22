import { vec4 } from 'math-ext';
import * as Render from 'render';
import { VkShaderStageFlags } from 'vulkan';

export class PushConstants {
    private m_data: ArrayBuffer;
    private m_dataView: DataView;
    private m_clipEnabled: boolean;
    private m_clipRect: vec4;
    private m_clipRectRadii: vec4;
    private m_didChange: boolean;

    constructor(format: Render.DataFormat) {
        this.m_data = new ArrayBuffer(format.getUniformBlockSize());
        this.m_dataView = new DataView(this.m_data);

        console.log(format.getUniformBlockSize());

        this.m_clipEnabled = false;
        this.m_clipRect = new vec4(0, 0, 0, 0);
        this.m_clipRectRadii = new vec4(0, 0, 0, 0);
        this.m_didChange = true;
    }

    set clipEnabled(clipEnabled: boolean) {
        if (this.m_clipEnabled === clipEnabled) return;
        this.m_clipEnabled = clipEnabled;
        this.m_didChange = true;
    }

    set clipRect(clipRect: vec4) {
        if (vec4.equals(this.m_clipRect, clipRect)) return;
        this.m_clipRect = clipRect;
        this.m_didChange = true;
    }

    set clipRectRadii(clipRectRadii: vec4) {
        if (vec4.equals(this.m_clipRectRadii, clipRectRadii)) return;
        this.m_clipRectRadii = clipRectRadii;
        this.m_didChange = true;
    }

    update(cb: Render.CommandBuffer) {
        if (!this.m_didChange) return;

        this.m_dataView.setInt32(0, this.m_clipEnabled ? 1 : 0, true);
        this.m_dataView.setFloat32(16, this.m_clipRect.x, true);
        this.m_dataView.setFloat32(20, this.m_clipRect.y, true);
        this.m_dataView.setFloat32(24, this.m_clipRect.z, true);
        this.m_dataView.setFloat32(28, this.m_clipRect.w, true);
        this.m_dataView.setFloat32(32, this.m_clipRectRadii.x, true);
        this.m_dataView.setFloat32(36, this.m_clipRectRadii.y, true);
        this.m_dataView.setFloat32(40, this.m_clipRectRadii.z, true);
        this.m_dataView.setFloat32(44, this.m_clipRectRadii.w, true);

        cb.updatePushConstants(0, this.m_data, VkShaderStageFlags.VK_SHADER_STAGE_ALL);
    }
}
