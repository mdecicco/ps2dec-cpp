import { Vertex } from '../types/vertex';

export class VertexArray {
    private m_vertexData: ArrayBuffer | null;
    private m_vertexDataView: DataView | null;
    private m_vertexCount: u32;
    private m_vertexCapacity: u32;

    constructor() {
        this.m_vertexData = null;
        this.m_vertexDataView = null;
        this.m_vertexCount = 0;
        this.m_vertexCapacity = 0;
    }

    get data() {
        if (this.m_vertexData === null) {
            throw new Error('Vertex array is not initialized');
        }

        return this.m_vertexData;
    }

    get count() {
        return this.m_vertexCount;
    }

    get size() {
        return Vertex.size * this.m_vertexCount;
    }

    get capacity() {
        return this.m_vertexCapacity;
    }

    copyTo(view: DataView, offset: u32) {
        if (this.m_vertexDataView === null) {
            throw new Error('Vertex array is not initialized');
        }

        let writeOffset = offset;
        let readOffset = 0;
        const readSize = this.size;
        while (readOffset < readSize) {
            const remaining = readSize - readOffset;
            if (remaining >= 4) {
                const value = this.m_vertexDataView.getUint32(readOffset);
                view.setUint32(writeOffset, value);
                writeOffset += 4;
                readOffset += 4;
            } else if (remaining >= 2) {
                const value = this.m_vertexDataView.getUint16(readOffset);
                view.setUint16(writeOffset, value);
                writeOffset += 2;
                readOffset += 2;
            } else if (remaining >= 1) {
                const value = this.m_vertexDataView.getUint8(readOffset);
                view.setUint8(writeOffset, value);
                writeOffset += 1;
                readOffset += 1;
            }
        }
    }

    init(capacity: u32) {
        this.m_vertexData = new ArrayBuffer(capacity * Vertex.size);
        this.m_vertexDataView = new DataView(this.m_vertexData);
        this.m_vertexCount = 0;
        this.m_vertexCapacity = capacity;
    }

    push(x: f32, y: f32, z: f32, r: f32, g: f32, b: f32, a: f32, u: f32, v: f32, instanceIdx: u32) {
        if (this.m_vertexDataView === null) {
            throw new Error('Vertex array is not initialized');
        }

        if (this.m_vertexCount >= this.m_vertexCapacity) {
            throw new Error('Vertex array is full');
        }

        const offset = this.m_vertexCount * Vertex.size;
        this.m_vertexCount++;

        this.m_vertexDataView.setFloat32(offset, x, true);
        this.m_vertexDataView.setFloat32(offset + 4, y, true);
        this.m_vertexDataView.setFloat32(offset + 8, z, true);
        this.m_vertexDataView.setFloat32(offset + 12, 0.0, true);

        this.m_vertexDataView.setFloat32(offset + 16, r, true);
        this.m_vertexDataView.setFloat32(offset + 20, g, true);
        this.m_vertexDataView.setFloat32(offset + 24, b, true);
        this.m_vertexDataView.setFloat32(offset + 28, a, true);

        this.m_vertexDataView.setFloat32(offset + 32, u, true);
        this.m_vertexDataView.setFloat32(offset + 36, v, true);

        this.m_vertexDataView.setInt32(offset + 40, instanceIdx, true);
    }
}
