import { vec3 } from './vec3';
import { vec4 } from './vec4';

export class mat4 {
    public x: vec4;
    public y: vec4;
    public z: vec4;
    public w: vec4;

    constructor(x: vec4, y: vec4, z: vec4, w: vec4) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    public set(other: mat4) {
        this.x.set(other.x);
        this.y.set(other.y);
        this.z.set(other.z);
        this.w.set(other.w);
    }

    public row(index: number) {
        switch (index) {
            case 0:
                return this.x;
            case 1:
                return this.y;
            case 2:
                return this.z;
            case 3:
                return this.w;
            default:
                throw new Error('Invalid index');
        }
    }

    public col(index: number) {
        switch (index) {
            case 0:
                return new vec4(this.x.x, this.y.x, this.z.x, this.w.x);
            case 1:
                return new vec4(this.x.y, this.y.y, this.z.y, this.w.y);
            case 2:
                return new vec4(this.x.z, this.y.z, this.z.z, this.w.z);
            case 3:
                return new vec4(this.x.w, this.y.w, this.z.w, this.w.w);
            default:
                throw new Error('Invalid index');
        }
    }

    public toArray(): number[] {
        return [
            this.x.x,
            this.x.y,
            this.x.z,
            this.x.w,
            this.y.x,
            this.y.y,
            this.y.z,
            this.y.w,
            this.z.x,
            this.z.y,
            this.z.z,
            this.z.w,
            this.w.x,
            this.w.y,
            this.w.z,
            this.w.w
        ];
    }

    public serialize(view: DataView, offset: number) {
        view.setFloat32(offset + 0, this.x.x, true);
        view.setFloat32(offset + 4, this.x.y, true);
        view.setFloat32(offset + 8, this.x.z, true);
        view.setFloat32(offset + 12, this.x.w, true);

        view.setFloat32(offset + 16, this.y.x, true);
        view.setFloat32(offset + 20, this.y.y, true);
        view.setFloat32(offset + 24, this.y.z, true);
        view.setFloat32(offset + 28, this.y.w, true);

        view.setFloat32(offset + 32, this.z.x, true);
        view.setFloat32(offset + 36, this.z.y, true);
        view.setFloat32(offset + 40, this.z.z, true);
        view.setFloat32(offset + 44, this.z.w, true);

        view.setFloat32(offset + 48, this.w.x, true);
        view.setFloat32(offset + 52, this.w.y, true);
        view.setFloat32(offset + 56, this.w.z, true);
        view.setFloat32(offset + 60, this.w.w, true);
    }

    public transpose() {
        const xy = this.x.y;
        const xz = this.x.z;
        const xw = this.x.w;

        const yx = this.y.x;
        const yz = this.y.z;
        const yw = this.y.w;

        const zx = this.z.x;
        const zy = this.z.y;
        const zw = this.z.w;

        const wx = this.w.x;
        const wy = this.w.y;
        const wz = this.w.z;

        this.x.y = yx;
        this.x.z = zx;
        this.x.w = wx;

        this.y.x = xy;
        this.y.z = zy;
        this.y.w = wy;

        this.z.x = xz;
        this.z.y = yz;
        this.z.w = wz;

        this.w.x = xw;
        this.w.y = yw;
        this.w.z = zw;
    }

    public get transposed() {
        return new mat4(
            new vec4(this.x.x, this.y.x, this.z.x, this.w.x),
            new vec4(this.x.y, this.y.y, this.z.y, this.w.y),
            new vec4(this.x.z, this.y.z, this.z.z, this.w.z),
            new vec4(this.x.w, this.y.w, this.z.w, this.w.w)
        );
    }

    public static mul(out: mat4, ...matrices: mat4[]): void;
    public static mul(out: vec4, lhs: mat4, rhs: vec4): void;
    public static mul(out: mat4 | vec4, ...args: (mat4 | vec4)[]): void {
        if (out instanceof mat4) {
            if (args.length === 0) {
                mat4.identity(out);
                return;
            }

            const first = args[0];
            if (!(first instanceof mat4)) throw new Error('mat4.mul: Invalid arguments');

            out.set(first);

            for (let i = 1; i < args.length; i++) {
                const next = args[i];
                if (!(next instanceof mat4)) {
                    throw new Error('mat4.mul: Invalid arguments');
                }

                this.mulMM(out, out, next);
            }

            return;
        }

        if (out instanceof vec4) {
            if (args.length != 2) throw new Error('mat4.mul: Invalid arguments');

            const lhs = args[0];
            const rhs = args[1];
            if (!(lhs instanceof mat4) || !(rhs instanceof vec4)) throw new Error('mat4.mul: Invalid arguments');

            this.mulMV(out, lhs, rhs);
            return;
        }

        throw new Error('mat4.mul: Invalid arguments');
    }

    private static mulMV(out: vec4, lhs: mat4, rhs: vec4) {
        const x = lhs.x.x * rhs.x + lhs.x.y * rhs.y + lhs.x.z * rhs.z + lhs.x.w * rhs.w;
        const y = lhs.y.x * rhs.x + lhs.y.y * rhs.y + lhs.y.z * rhs.z + lhs.y.w * rhs.w;
        const z = lhs.z.x * rhs.x + lhs.z.y * rhs.y + lhs.z.z * rhs.z + lhs.z.w * rhs.w;
        const w = lhs.w.x * rhs.x + lhs.w.y * rhs.y + lhs.w.z * rhs.z + lhs.w.w * rhs.w;

        out.x = x;
        out.y = y;
        out.z = z;
        out.w = w;
    }

    private static mulMM(out: mat4, lhs: mat4, rhs: mat4) {
        const xx = lhs.x.x * rhs.x.x + lhs.x.y * rhs.y.x + lhs.x.z * rhs.z.x + lhs.x.w * rhs.w.x;
        const xy = lhs.x.x * rhs.x.y + lhs.x.y * rhs.y.y + lhs.x.z * rhs.z.y + lhs.x.w * rhs.w.y;
        const xz = lhs.x.x * rhs.x.z + lhs.x.y * rhs.y.z + lhs.x.z * rhs.z.z + lhs.x.w * rhs.w.z;
        const xw = lhs.x.x * rhs.x.w + lhs.x.y * rhs.y.w + lhs.x.z * rhs.z.w + lhs.x.w * rhs.w.w;

        const yx = lhs.y.x * rhs.x.x + lhs.y.y * rhs.y.x + lhs.y.z * rhs.z.x + lhs.y.w * rhs.w.x;
        const yy = lhs.y.x * rhs.x.y + lhs.y.y * rhs.y.y + lhs.y.z * rhs.z.y + lhs.y.w * rhs.w.y;
        const yz = lhs.y.x * rhs.x.z + lhs.y.y * rhs.y.z + lhs.y.z * rhs.z.z + lhs.y.w * rhs.w.z;
        const yw = lhs.y.x * rhs.x.w + lhs.y.y * rhs.y.w + lhs.y.z * rhs.z.w + lhs.y.w * rhs.w.w;

        const zx = lhs.z.x * rhs.x.x + lhs.z.y * rhs.y.x + lhs.z.z * rhs.z.x + lhs.z.w * rhs.w.x;
        const zy = lhs.z.x * rhs.x.y + lhs.z.y * rhs.y.y + lhs.z.z * rhs.z.y + lhs.z.w * rhs.w.y;
        const zz = lhs.z.x * rhs.x.z + lhs.z.y * rhs.y.z + lhs.z.z * rhs.z.z + lhs.z.w * rhs.w.z;
        const zw = lhs.z.x * rhs.x.w + lhs.z.y * rhs.y.w + lhs.z.z * rhs.z.w + lhs.z.w * rhs.w.w;

        const wx = lhs.w.x * rhs.x.x + lhs.w.y * rhs.y.x + lhs.w.z * rhs.z.x + lhs.w.w * rhs.w.x;
        const wy = lhs.w.x * rhs.x.y + lhs.w.y * rhs.y.y + lhs.w.z * rhs.z.y + lhs.w.w * rhs.w.y;
        const wz = lhs.w.x * rhs.x.z + lhs.w.y * rhs.y.z + lhs.w.z * rhs.z.z + lhs.w.w * rhs.w.z;
        const ww = lhs.w.x * rhs.x.w + lhs.w.y * rhs.y.w + lhs.w.z * rhs.z.w + lhs.w.w * rhs.w.w;

        out.x.x = xx;
        out.x.y = xy;
        out.x.z = xz;
        out.x.w = xw;

        out.y.x = yx;
        out.y.y = yy;
        out.y.z = yz;
        out.y.w = yw;

        out.z.x = zx;
        out.z.y = zy;
        out.z.z = zz;
        out.z.w = zw;

        out.w.x = wx;
        out.w.y = wy;
        out.w.z = wz;
        out.w.w = ww;
    }

    public static identity(): mat4;
    public static identity(out: mat4): void;
    public static identity(out?: mat4): mat4 | void {
        if (!out) {
            return new mat4(new vec4(1, 0, 0, 0), new vec4(0, 1, 0, 0), new vec4(0, 0, 1, 0), new vec4(0, 0, 0, 1));
        }

        out.x.x = 1;
        out.x.y = 0;
        out.x.z = 0;
        out.x.w = 0;

        out.y.x = 0;
        out.y.y = 1;
        out.y.z = 0;
        out.y.w = 0;

        out.z.x = 0;
        out.z.y = 0;
        out.z.z = 1;
        out.z.w = 0;

        out.w.x = 0;
        out.w.y = 0;
        out.w.z = 0;
        out.w.w = 1;
    }

    /**
     * Creates a translation matrix.
     *
     * @param out - The output matrix.
     * @param x - The x-coordinate of the translation.
     * @param y - The y-coordinate of the translation.
     * @param z - The z-coordinate of the translation.
     */
    public static translation(out: mat4, x: number, y: number, z: number) {
        out.x.x = 1;
        out.x.y = 0;
        out.x.z = 0;
        out.x.w = x;

        out.y.x = 0;
        out.y.y = 1;
        out.y.z = 0;
        out.y.w = y;

        out.z.x = 0;
        out.z.y = 0;
        out.z.z = 1;
        out.z.w = z;

        out.w.x = 0;
        out.w.y = 0;
        out.w.z = 0;
        out.w.w = 1;
    }

    /**
     * Creates a scale matrix.
     *
     * @param out - The output matrix.
     * @param x - The x-coordinate of the scale.
     * @param y - The y-coordinate of the scale.
     * @param z - The z-coordinate of the scale.
     */
    public static scale(out: mat4, x: number, y: number, z: number) {
        out.x.x = x;
        out.x.y = 0;
        out.x.z = 0;
        out.x.w = 0;

        out.y.x = 0;
        out.y.y = y;
        out.y.z = 0;
        out.y.w = 0;

        out.z.x = 0;
        out.z.y = 0;
        out.z.z = z;
        out.z.w = 0;

        out.w.x = 0;
        out.w.y = 0;
        out.w.z = 0;
        out.w.w = 1;
    }

    /**
     * Creates a rotation matrix around the X axis.
     *
     * @param angle - The angle of rotation in radians.
     */
    public static rotationX(out: mat4, angle: number) {
        const s = Math.sin(angle);
        const c = Math.cos(angle);

        out.x.x = 1;
        out.x.y = 0;
        out.x.z = 0;
        out.x.w = 0;

        out.y.x = 0;
        out.y.y = c;
        out.y.z = s;
        out.y.w = 0;

        out.z.x = 0;
        out.z.y = -s;
        out.z.z = c;
        out.z.w = 0;

        out.w.x = 0;
        out.w.y = 0;
        out.w.z = 0;
        out.w.w = 1;
    }

    /**
     * Creates a rotation matrix around the Y axis.
     *
     * @param out - The output matrix.
     * @param angle - The angle of rotation in radians.
     */
    public static rotationY(out: mat4, angle: number) {
        const s = Math.sin(angle);
        const c = Math.cos(angle);

        out.x.x = c;
        out.x.y = 0;
        out.x.z = -s;
        out.x.w = 0;

        out.y.x = 0;
        out.y.y = 1;
        out.y.z = 0;
        out.y.w = 0;

        out.z.x = s;
        out.z.y = 0;
        out.z.z = c;
        out.z.w = 0;

        out.w.x = 0;
        out.w.y = 0;
        out.w.z = 0;
        out.w.w = 1;
    }

    /**
     * Creates a rotation matrix around the Z axis.
     *
     * @param out - The output matrix.
     * @param angle - The angle of rotation in radians.
     */
    public static rotationZ(out: mat4, angle: number) {
        const s = Math.sin(angle);
        const c = Math.cos(angle);

        out.x.x = c;
        out.x.y = -s;
        out.x.z = 0;
        out.x.w = 0;

        out.y.x = s;
        out.y.y = c;
        out.y.z = 0;
        out.y.w = 0;

        out.z.x = 0;
        out.z.y = 0;
        out.z.z = 1;
        out.z.w = 0;

        out.w.x = 0;
        out.w.y = 0;
        out.w.z = 0;
        out.w.w = 1;
    }
}
