import * as Render from 'render';
import { vec4 } from 'math-ext';

import { Vertex } from '../types/vertex';
import { Uniforms } from '../types/uniforms';
import { PushConstants } from '../types/push-constants';
import { VkPipelineBindPoint } from 'vulkan';

export class DrawCall {
    private m_vertices: Render.Vertices;
    private m_vertexData: ArrayBuffer;
    private m_vertexDataView: DataView;
    private m_vertexDataDirty: boolean;
    private m_uniforms: Uniforms;
    private m_ds: Render.DescriptorSet;
    private m_vertexCount: u32;
    private m_vertexSize: u32;
    private m_usedVertices: u32;

    constructor(
        vertices: Render.Vertices,
        uniforms: Render.UniformObject,
        ds: Render.DescriptorSet,
        vertexCount: u32,
        vertexSize: u32
    ) {
        this.m_vertices = vertices;
        this.m_vertexData = new ArrayBuffer(vertexCount * vertexSize);
        this.m_vertexDataView = new DataView(this.m_vertexData);
        this.m_vertexDataDirty = true;

        this.m_uniforms = new Uniforms(uniforms, ds);
        this.m_ds = ds;

        this.m_vertexCount = vertexCount;
        this.m_vertexSize = vertexSize;
        this.m_usedVertices = 0;
    }

    get vertices() {
        return this.m_vertices;
    }

    get uniforms() {
        return this.m_uniforms;
    }

    set descriptorSet(ds: Render.DescriptorSet) {
        this.m_ds = ds;
    }

    get descriptorSet() {
        return this.m_ds;
    }

    private updateVertexData() {
        if (!this.m_vertices.beginUpdate()) throw new Error('Failed to update vertex data');
        this.m_vertices.write(this.m_vertexData, 0, this.m_vertexCount);
        this.m_vertices.endUpdate();
    }

    getVertex(index: u32) {
        if (index >= this.m_vertexCount) throw new RangeError(`Index out of bounds: ${index} >= ${this.m_vertexCount}`);

        const offset = index * this.m_vertexSize;
        return {
            position: new vec4(
                this.m_vertexDataView.getFloat32(offset, true),
                this.m_vertexDataView.getFloat32(offset + 4, true),
                this.m_vertexDataView.getFloat32(offset + 8, true),
                this.m_vertexDataView.getFloat32(offset + 12, true)
            ),
            color: new vec4(
                this.m_vertexDataView.getFloat32(offset + 16, true),
                this.m_vertexDataView.getFloat32(offset + 20, true),
                this.m_vertexDataView.getFloat32(offset + 24, true),
                this.m_vertexDataView.getFloat32(offset + 28, true)
            )
        };
    }

    setVertex(index: u32, vertex: Vertex) {
        if (index >= this.m_vertexCount) throw new RangeError(`Index out of bounds: ${index} >= ${this.m_vertexCount}`);

        const offset = index * this.m_vertexSize;
        this.m_vertexDataView.setFloat32(offset, vertex.position.x, true);
        this.m_vertexDataView.setFloat32(offset + 4, vertex.position.y, true);
        this.m_vertexDataView.setFloat32(offset + 8, vertex.position.z, true);
        this.m_vertexDataView.setFloat32(offset + 12, vertex.position.w, true);

        this.m_vertexDataView.setFloat32(offset + 16, vertex.color.x, true);
        this.m_vertexDataView.setFloat32(offset + 20, vertex.color.y, true);
        this.m_vertexDataView.setFloat32(offset + 24, vertex.color.z, true);
        this.m_vertexDataView.setFloat32(offset + 28, vertex.color.w, true);

        this.m_vertexDataView.setFloat32(offset + 32, vertex.uv.x, true);
        this.m_vertexDataView.setFloat32(offset + 36, vertex.uv.y, true);

        this.m_vertexDataView.setInt32(offset + 40, vertex.clipRectIndex, true);

        this.m_vertexDataDirty = true;
    }

    addVertex(vertex: Vertex) {
        this.setVertex(this.m_usedVertices, vertex);
        this.m_usedVertices++;
    }

    beforeRenderPass(cb: Render.CommandBuffer) {
        if (this.m_vertexDataDirty) {
            this.updateVertexData();
            this.m_vertexDataDirty = false;
        }

        this.m_uniforms.update(cb);
    }

    resetUsedVertices() {
        this.m_usedVertices = 0;
    }

    draw(cb: Render.CommandBuffer) {
        cb.bindVertexBuffer(this.m_vertices.getBuffer(), 0);
        cb.bindDescriptorSet(this.m_uniforms.descriptorSet, VkPipelineBindPoint.VK_PIPELINE_BIND_POINT_GRAPHICS);
        cb.drawSubset(this.m_usedVertices, 0, 1, 0);
    }
}
