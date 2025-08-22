export class vec3 {
    public x: number;
    public y: number;
    public z: number;

    constructor(x: number = 0, y: number = 0, z: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public set(other: vec3) {
        this.x = other.x;
        this.y = other.y;
        this.z = other.z;
    }

    public get lengthSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    public get length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    public get normalized() {
        const invLength = 1.0 / this.length;
        return new vec3(this.x * invLength, this.y * invLength, this.z * invLength);
    }

    public normalize() {
        const invLength = 1.0 / this.length;
        this.x *= invLength;
        this.y *= invLength;
        this.z *= invLength;
    }

    public dot(other: vec3) {
        return this.x * other.x + this.y * other.y + this.z * other.z;
    }

    public cross(other: vec3) {
        return new vec3(
            this.y * other.z - this.z * other.y,
            this.z * other.x - this.x * other.z,
            this.x * other.y - this.y * other.x
        );
    }

    public static add(out: vec3, lhs: vec3, rhs: vec3): void {
        out.x = lhs.x + rhs.x;
        out.y = lhs.y + rhs.y;
        out.z = lhs.z + rhs.z;
    }

    public static sub(out: vec3, lhs: vec3, rhs: vec3): void {
        out.x = lhs.x - rhs.x;
        out.y = lhs.y - rhs.y;
        out.z = lhs.z - rhs.z;
    }

    public static mul(out: vec3, lhs: vec3, rhs: vec3): void {
        out.x = lhs.x * rhs.x;
        out.y = lhs.y * rhs.y;
        out.z = lhs.z * rhs.z;
    }

    public static div(out: vec3, lhs: vec3, rhs: vec3): void {
        out.x = lhs.x / rhs.x;
        out.y = lhs.y / rhs.y;
        out.z = lhs.z / rhs.z;
    }

    public static addScalar(out: vec3, lhs: vec3, rhs: number): void {
        out.x = lhs.x + rhs;
        out.y = lhs.y + rhs;
        out.z = lhs.z + rhs;
    }

    public static subScalar(out: vec3, lhs: vec3, rhs: number): void {
        out.x = lhs.x - rhs;
        out.y = lhs.y - rhs;
        out.z = lhs.z - rhs;
    }

    public static mulScalar(out: vec3, lhs: vec3, rhs: number): void {
        out.x = lhs.x * rhs;
        out.y = lhs.y * rhs;
        out.z = lhs.z * rhs;
    }

    public static divScalar(out: vec3, lhs: vec3, rhs: number): void {
        out.x = lhs.x / rhs;
        out.y = lhs.y / rhs;
        out.z = lhs.z / rhs;
    }
}
