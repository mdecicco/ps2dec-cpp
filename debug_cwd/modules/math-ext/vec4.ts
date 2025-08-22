import { vec3 } from './vec3';

export class vec4 {
    public x: number;
    public y: number;
    public z: number;
    public w: number;

    constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    public set(other: vec4) {
        this.x = other.x;
        this.y = other.y;
        this.z = other.z;
        this.w = other.w;
    }

    public get lengthSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
    }

    public get length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    }

    public get normalized() {
        const invLength = 1.0 / this.length;
        return new vec4(this.x * invLength, this.y * invLength, this.z * invLength, this.w * invLength);
    }

    public normalize() {
        const invLength = 1.0 / this.length;
        this.x *= invLength;
        this.y *= invLength;
        this.z *= invLength;
        this.w *= invLength;
    }

    public dot(other: vec4) {
        return this.x * other.x + this.y * other.y + this.z * other.z + this.w * other.w;
    }

    public cross(other: vec4) {
        return new vec4(
            this.y * other.z - this.z * other.y,
            this.z * other.x - this.x * other.z,
            this.x * other.y - this.y * other.x,
            0
        );
    }

    public static from(xyz: vec3, w: number = 0) {
        return new vec4(xyz.x, xyz.y, xyz.z, w);
    }

    public static add(out: vec4, lhs: vec4, rhs: vec4): void {
        out.x = lhs.x + rhs.x;
        out.y = lhs.y + rhs.y;
        out.z = lhs.z + rhs.z;
        out.w = lhs.w + rhs.w;
    }

    public static sub(out: vec4, lhs: vec4, rhs: vec4): void {
        out.x = lhs.x - rhs.x;
        out.y = lhs.y - rhs.y;
        out.z = lhs.z - rhs.z;
        out.w = lhs.w - rhs.w;
    }

    public static mul(out: vec4, lhs: vec4, rhs: vec4): void {
        out.x = lhs.x * rhs.x;
        out.y = lhs.y * rhs.y;
        out.z = lhs.z * rhs.z;
        out.w = lhs.w * rhs.w;
    }

    public static div(out: vec4, lhs: vec4, rhs: vec4): void {
        out.x = lhs.x / rhs.x;
        out.y = lhs.y / rhs.y;
        out.z = lhs.z / rhs.z;
        out.w = lhs.w / rhs.w;
    }

    public static addScalar(out: vec4, lhs: vec4, rhs: number): void {
        out.x = lhs.x + rhs;
        out.y = lhs.y + rhs;
        out.z = lhs.z + rhs;
        out.w = lhs.w + rhs;
    }

    public static subScalar(out: vec4, lhs: vec4, rhs: number): void {
        out.x = lhs.x - rhs;
        out.y = lhs.y - rhs;
        out.z = lhs.z - rhs;
        out.w = lhs.w - rhs;
    }

    public static mulScalar(out: vec4, lhs: vec4, rhs: number): void {
        out.x = lhs.x * rhs;
        out.y = lhs.y * rhs;
        out.z = lhs.z * rhs;
        out.w = lhs.w * rhs;
    }

    public static divScalar(out: vec4, lhs: vec4, rhs: number): void {
        out.x = lhs.x / rhs;
        out.y = lhs.y / rhs;
        out.z = lhs.z / rhs;
        out.w = lhs.w / rhs;
    }

    public static equals(lhs: vec4, rhs: vec4) {
        return lhs.x === rhs.x && lhs.y === rhs.y && lhs.z === rhs.z && lhs.w === rhs.w;
    }
}
