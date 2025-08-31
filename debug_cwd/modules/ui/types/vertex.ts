export class Vertex {
    x: f32;
    y: f32;
    z: f32;
    w: f32;
    r: f32;
    g: f32;
    b: f32;
    a: f32;
    u: f32;
    v: f32;
    instanceIdx: i32;

    constructor(x: f32, y: f32, z: f32, w: f32, r: f32, g: f32, b: f32, a: f32, u: f32, v: f32, instanceIdx: i32) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
        this.u = u;
        this.v = v;
        this.instanceIdx = instanceIdx;
    }

    static get size() {
        return 4 * 11;
    }
}
