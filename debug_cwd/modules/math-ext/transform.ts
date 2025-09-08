import { mat4 } from './mat4';
import { mat3 } from './mat3';

export function translation(out: mat4, x: number, y: number, z: number) {
    mat4.translation(out, x, y, z);
}

export function scale(out: mat3, x: number, y: number, z: number): void;
export function scale(out: mat4, x: number, y: number, z: number): void;
export function scale(out: mat3 | mat4, x: number, y: number, z: number): void {
    if (out instanceof mat3) {
        mat3.scale(out, x, y, z);
    } else {
        mat4.scale(out, x, y, z);
    }
}

export function rotationX(out: mat3, angle: number): void;
export function rotationX(out: mat4, angle: number): void;
export function rotationX(out: mat3 | mat4, angle: number): void {
    if (out instanceof mat3) {
        mat3.rotationX(out, angle);
    } else {
        mat4.rotationX(out, angle);
    }
}

export function rotationY(out: mat3, angle: number): void;
export function rotationY(out: mat4, angle: number): void;
export function rotationY(out: mat3 | mat4, angle: number): void {
    if (out instanceof mat3) {
        mat3.rotationY(out, angle);
    } else {
        mat4.rotationY(out, angle);
    }
}

export function rotationZ(out: mat3, angle: number): void;
export function rotationZ(out: mat4, angle: number): void;
export function rotationZ(out: mat3 | mat4, angle: number): void {
    if (out instanceof mat3) {
        mat3.rotationZ(out, angle);
    } else {
        mat4.rotationZ(out, angle);
    }
}

export function frustum(
    out: mat4,
    left: number,
    right: number,
    top: number,
    bottom: number,
    near: number,
    far: number
): void {
    const a = 2.0 * near;
    const w = right - left;
    const h = top - bottom;
    const d = far - near;
    const invW = 1.0 / w;
    const invH = 1.0 / h;
    const invD = 1.0 / d;

    out.x.x = a * invW;
    out.x.y = 0;
    out.x.z = (right + left) * invW;
    out.x.w = 0;

    out.y.x = 0;
    out.y.y = a * invH;
    out.y.z = (top + bottom) * invH;
    out.y.w = 0;

    out.z.x = 0;
    out.z.y = 0;
    out.z.z = (-far - near) * invD;
    out.z.w = -a * far * invD;

    out.w.x = 0;
    out.w.y = 0;
    out.w.z = -1.0;
    out.w.w = 0;
}

export function perspective(out: mat4, fov: number, aspect: number, near: number, far: number): void {
    const yMax = near * Math.tan(fov * 0.5);
    const xMax = yMax * aspect;

    frustum(out, -xMax, xMax, -yMax, yMax, near, far);
}

export function ortho(
    out: mat4,
    left: number,
    right: number,
    top: number,
    bottom: number,
    near: number,
    far: number
): void {
    const w = right - left;
    const h = top - bottom;
    const d = far - near;

    out.x.x = 2 / w;
    out.x.y = 0;
    out.x.z = 0;
    out.x.w = -(left + right) / w;

    out.y.x = 0;
    out.y.y = 2 / h;
    out.y.z = 0;
    out.y.w = -(top + bottom) / h;

    out.z.x = 0;
    out.z.y = 0;
    out.z.z = -1 / d;
    out.z.w = (far + near) / d;

    out.w.x = 0;
    out.w.y = 0;
    out.w.z = 0;
    out.w.w = 1;
}
