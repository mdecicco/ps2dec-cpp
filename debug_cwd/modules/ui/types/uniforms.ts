import { mat4 } from 'math-ext';
import * as Render from 'render';

export class Uniforms {
    private m_uniformObject: Render.UniformObject;
    private m_uniformData: ArrayBuffer;
    private m_uniformDataView: DataView;
    private m_ds: Render.DescriptorSet;
    private m_projection: mat4;
    private m_view: mat4;
    private m_model: mat4;
    private m_mvp: mat4;
    private m_fontPixelRange: f32;
    private m_isFont: boolean;
    private m_mvpNeedsUpdate: boolean;
    private m_fontPixelRangeNeedsUpdate: boolean;
    private m_isFontNeedsUpdate: boolean;

    constructor(uniforms: Render.UniformObject, ds: Render.DescriptorSet) {
        const format = uniforms.getBuffer().getFormat();

        this.m_uniformObject = uniforms;
        this.m_uniformData = new ArrayBuffer(format.getUniformBlockSize());
        this.m_uniformDataView = new DataView(this.m_uniformData);
        this.m_ds = ds;

        this.m_projection = mat4.identity();
        this.m_view = mat4.identity();
        this.m_model = mat4.identity();
        this.m_mvp = mat4.identity();
        this.m_mvpNeedsUpdate = true;
        this.m_fontPixelRange = 0.0;
        this.m_isFont = false;
        this.m_fontPixelRangeNeedsUpdate = true;
        this.m_isFontNeedsUpdate = true;
    }

    get uniformObject() {
        return this.m_uniformObject;
    }

    get descriptorSet() {
        return this.m_ds;
    }

    set projection(projection: mat4) {
        this.m_projection = projection;
        this.m_mvpNeedsUpdate = true;
    }

    set view(view: mat4) {
        this.m_view = view;
        this.m_mvpNeedsUpdate = true;
    }

    set model(model: mat4) {
        this.m_model = model;
        this.m_mvpNeedsUpdate = true;
    }

    set fontPixelRange(fontPixelRange: f32) {
        this.m_fontPixelRange = fontPixelRange;
        this.m_fontPixelRangeNeedsUpdate = true;
    }

    set isText(isText: boolean) {
        this.m_isFont = isText;
        this.m_isFontNeedsUpdate = true;
    }

    update(cb: Render.CommandBuffer) {
        let uniformsNeedUpdate = this.m_mvpNeedsUpdate || this.m_fontPixelRangeNeedsUpdate || this.m_isFontNeedsUpdate;

        if (this.m_mvpNeedsUpdate) {
            mat4.mul(this.m_mvp, this.m_projection, this.m_view, this.m_model);
            this.m_mvp.serialize(this.m_uniformDataView, 0);
            this.m_mvpNeedsUpdate = false;
        }

        if (this.m_fontPixelRangeNeedsUpdate) {
            this.m_uniformDataView.setFloat32(64, this.m_fontPixelRange, true);
            this.m_fontPixelRangeNeedsUpdate = false;
        }

        if (this.m_isFontNeedsUpdate) {
            this.m_uniformDataView.setInt32(68, this.m_isFont ? 1 : 0, true);
            this.m_isFontNeedsUpdate = false;
        }

        if (uniformsNeedUpdate) {
            this.m_uniformObject.write(this.m_uniformData);
            this.m_uniformObject.getBuffer().submitUpdates(cb);
        }
    }
}
