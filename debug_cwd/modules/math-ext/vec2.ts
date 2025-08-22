export class vec2 {
    public x: number;
    public y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    public set(other: vec2) {
        this.x = other.x;
        this.y = other.y;
    }

    public get lengthSq() {
        return this.x * this.x + this.y * this.y;
    }

    public get length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    public get normalized() {
        const invLength = 1.0 / this.length;
        return new vec2(this.x * invLength, this.y * invLength);
    }

    public normalize() {
        const invLength = 1.0 / this.length;
        this.x *= invLength;
        this.y *= invLength;
    }

    public dot(other: vec2) {
        return this.x * other.x + this.y * other.y;
    }

    public toString() {
        return `vec2(${this.x}, ${this.y})`;
    }

    public static add(out: vec2, lhs: vec2, rhs: vec2): void {
        out.x = lhs.x + rhs.x;
        out.y = lhs.y + rhs.y;
    }

    public static sub(out: vec2, lhs: vec2, rhs: vec2): void {
        out.x = lhs.x - rhs.x;
        out.y = lhs.y - rhs.y;
    }

    public static mul(out: vec2, lhs: vec2, rhs: vec2): void {
        out.x = lhs.x * rhs.x;
        out.y = lhs.y * rhs.y;
    }

    public static div(out: vec2, lhs: vec2, rhs: vec2): void {
        out.x = lhs.x / rhs.x;
        out.y = lhs.y / rhs.y;
    }

    public static addScalar(out: vec2, lhs: vec2, rhs: number): void {
        out.x = lhs.x + rhs;
        out.y = lhs.y + rhs;
    }

    public static subScalar(out: vec2, lhs: vec2, rhs: number): void {
        out.x = lhs.x - rhs;
        out.y = lhs.y - rhs;
    }

    public static mulScalar(out: vec2, lhs: vec2, rhs: number): void {
        out.x = lhs.x * rhs;
        out.y = lhs.y * rhs;
    }

    public static divScalar(out: vec2, lhs: vec2, rhs: number): void {
        out.x = lhs.x / rhs;
        out.y = lhs.y / rhs;
    }
}
