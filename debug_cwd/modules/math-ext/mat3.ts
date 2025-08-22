import { vec3 } from './vec3';

export class mat3 {
    public x: vec3;
    public y: vec3;
    public z: vec3;

    constructor(x: vec3, y: vec3, z: vec3) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public set(other: mat3) {
        this.x.set(other.x);
        this.y.set(other.y);
        this.z.set(other.z);
    }

    public row(index: number) {
        switch (index) {
            case 0:
                return this.x;
            case 1:
                return this.y;
            case 2:
                return this.z;
            default:
                throw new Error('Invalid index');
        }
    }

    public col(index: number) {
        switch (index) {
            case 0:
                return new vec3(this.x.x, this.y.x, this.z.x);
            case 1:
                return new vec3(this.x.y, this.y.y, this.z.y);
            case 2:
                return new vec3(this.x.z, this.y.z, this.z.z);
            default:
                throw new Error('Invalid index');
        }
    }

    public static mul(out: mat3, lhs: mat3, rhs: mat3): void;
    public static mul(out: vec3, lhs: mat3, rhs: vec3): void;
    public static mul(out: mat3 | vec3, lhs: mat3, rhs: mat3 | vec3): void {
        if (out instanceof mat3 && rhs instanceof mat3) {
            return this.mulMM(out, lhs, rhs);
        } else if (out instanceof vec3 && rhs instanceof vec3) {
            return this.mulMV(out, lhs, rhs);
        }

        throw new Error('mat3.mul: Invalid arguments');
    }

    private static mulMV(out: vec3, lhs: mat3, rhs: vec3) {
        const x = lhs.x.x * rhs.x + lhs.x.y * rhs.y + lhs.x.z * rhs.z;
        const y = lhs.y.x * rhs.x + lhs.y.y * rhs.y + lhs.y.z * rhs.z;
        const z = lhs.z.x * rhs.x + lhs.z.y * rhs.y + lhs.z.z * rhs.z;

        out.x = x;
        out.y = y;
        out.z = z;
    }

    private static mulMM(out: mat3, lhs: mat3, rhs: mat3) {
        const xx = lhs.x.x * rhs.x.x + lhs.x.y * rhs.y.x + lhs.x.z * rhs.z.x;
        const xy = lhs.x.x * rhs.x.y + lhs.x.y * rhs.y.y + lhs.x.z * rhs.z.y;
        const xz = lhs.x.x * rhs.x.z + lhs.x.y * rhs.y.z + lhs.x.z * rhs.z.z;

        const yx = lhs.y.x * rhs.x.x + lhs.y.y * rhs.y.x + lhs.y.z * rhs.z.x;
        const yy = lhs.y.x * rhs.x.y + lhs.y.y * rhs.y.y + lhs.y.z * rhs.z.y;
        const yz = lhs.y.x * rhs.x.z + lhs.y.y * rhs.y.z + lhs.y.z * rhs.z.z;

        const zx = lhs.z.x * rhs.x.x + lhs.z.y * rhs.y.x + lhs.z.z * rhs.z.x;
        const zy = lhs.z.x * rhs.x.y + lhs.z.y * rhs.y.y + lhs.z.z * rhs.z.y;
        const zz = lhs.z.x * rhs.x.z + lhs.z.y * rhs.y.z + lhs.z.z * rhs.z.z;

        out.x.x = xx;
        out.x.y = xy;
        out.x.z = xz;

        out.y.x = yx;
        out.y.y = yy;
        out.y.z = yz;

        out.z.x = zx;
        out.z.y = zy;
        out.z.z = zz;
    }

    public static identity(out: mat3) {
        out.x.x = 1;
        out.x.y = 0;
        out.x.z = 0;

        out.y.x = 0;
        out.y.y = 1;
        out.y.z = 0;

        out.z.x = 0;
        out.z.y = 0;
        out.z.z = 1;
    }

    /**
     * Creates a scale matrix.
     *
     * @param out - The output matrix.
     * @param x - The x-coordinate of the scale.
     * @param y - The y-coordinate of the scale.
     * @param z - The z-coordinate of the scale.
     */
    public static scale(out: mat3, x: number, y: number, z: number) {
        out.x.x = x;
        out.x.y = 0;
        out.x.z = 0;

        out.y.x = 0;
        out.y.y = y;
        out.y.z = 0;

        out.z.x = 0;
        out.z.y = 0;
        out.z.z = z;
    }

    /**
     * Creates a rotation matrix around the X axis.
     *
     * @param angle - The angle of rotation in radians.
     */
    public static rotationX(out: mat3, angle: number) {
        const s = Math.sin(angle);
        const c = Math.cos(angle);

        out.x.x = 1;
        out.x.y = 0;
        out.x.z = 0;

        out.y.x = 0;
        out.y.y = c;
        out.y.z = s;

        out.z.x = 0;
        out.z.y = -s;
        out.z.z = c;
    }

    /**
     * Creates a rotation matrix around the Y axis.
     *
     * @param out - The output matrix.
     * @param angle - The angle of rotation in radians.
     */
    public static rotationY(out: mat3, angle: number) {
        const s = Math.sin(angle);
        const c = Math.cos(angle);

        out.x.x = c;
        out.x.y = 0;
        out.x.z = -s;

        out.y.x = 0;
        out.y.y = 1;
        out.y.z = 0;

        out.z.x = s;
        out.z.y = 0;
        out.z.z = c;
    }

    /**
     * Creates a rotation matrix around the Z axis.
     *
     * @param out - The output matrix.
     * @param angle - The angle of rotation in radians.
     */
    public static rotationZ(out: mat3, angle: number) {
        const s = Math.sin(angle);
        const c = Math.cos(angle);

        out.x.x = c;
        out.x.y = -s;
        out.x.z = 0;

        out.y.x = s;
        out.y.y = c;
        out.y.z = 0;

        out.z.x = 0;
        out.z.y = 0;
        out.z.z = 1;
    }
}
