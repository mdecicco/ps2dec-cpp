export function radians(degrees: number): number {
    return (degrees * Math.PI) / 180;
}

export function degrees(radians: number): number {
    return (radians * 180) / Math.PI;
}
