import { vec4 } from 'math-ext';
import { BoxGeometry, BoxProperties, ClientRect, Color, GeometryType, Vertex } from '../types';

function buildSimpleBoxGeometry(rect: ClientRect, color: Color, inoutGeometry: BoxGeometry) {
    const { x, y, width, height } = rect;
    const p0 = new vec4(x, y, 0.1, 0.0);
    const p1 = new vec4(x + width, y, 0.1, 0.0);
    const p2 = new vec4(x + width, y + height, 0.1, 0.0);
    const p3 = new vec4(x, y + height, 0.1, 0.0);

    inoutGeometry.vertices.push(new Vertex(p0, new vec4(color.r, color.g, color.b, color.a)));
    inoutGeometry.vertices.push(new Vertex(p1, new vec4(color.r, color.g, color.b, color.a)));
    inoutGeometry.vertices.push(new Vertex(p2, new vec4(color.r, color.g, color.b, color.a)));
    inoutGeometry.vertices.push(new Vertex(p0, new vec4(color.r, color.g, color.b, color.a)));
    inoutGeometry.vertices.push(new Vertex(p2, new vec4(color.r, color.g, color.b, color.a)));
    inoutGeometry.vertices.push(new Vertex(p3, new vec4(color.r, color.g, color.b, color.a)));
}

export function buildBoxGeometry(properties: BoxProperties): BoxGeometry {
    const geometry: BoxGeometry = {
        type: GeometryType.Box,
        properties,
        offsetPosition: new vec4(0, 0, 0, 0),
        vertices: []
    };

    const { rect, color } = properties;

    const tl = rect.topLeftRadius;
    const tr = rect.topRightRadius;
    const bl = rect.bottomLeftRadius;
    const br = rect.bottomRightRadius;

    if (tl === 0 && tr === 0 && bl === 0 && br === 0) {
        buildSimpleBoxGeometry(rect, color, geometry);
        return geometry;
    }

    // Clamp radii to prevent overlapping corners
    const maxRadiusX = rect.width * 0.5;
    const maxRadiusY = rect.height * 0.5;
    const clampedTL = Math.min(tl, maxRadiusX, maxRadiusY);
    const clampedTR = Math.min(tr, maxRadiusX, maxRadiusY);
    const clampedBL = Math.min(bl, maxRadiusX, maxRadiusY);
    const clampedBR = Math.min(br, maxRadiusX, maxRadiusY);

    // Calculate corner centers
    const corners = {
        tl: { x: rect.x + clampedTL, y: rect.y + clampedTL },
        tr: { x: rect.x + rect.width - clampedTR, y: rect.y + clampedTR },
        bl: { x: rect.x + clampedBL, y: rect.y + rect.height - clampedBL },
        br: { x: rect.x + rect.width - clampedBR, y: rect.y + rect.height - clampedBR }
    };

    // Optimized vertex generation - adaptive segments based on radius size
    const getOptimalSegments = (radius: number): number => {
        const arcLength = Math.PI * radius * 0.5;
        return Math.max(Math.floor(arcLength * 0.25), 5);
    };

    // Helper function to generate arc vertices for a corner
    const generateCornerArc = (
        center: { x: number; y: number },
        radius: number,
        startAngle: number,
        endAngle: number
    ) => {
        const arcVertices = [];
        if (radius > 0) {
            const segments = getOptimalSegments(radius);
            // Always include the start and end points
            for (let i = 0; i <= segments; i++) {
                const angle = startAngle + (endAngle - startAngle) * (i / segments);
                arcVertices.push({
                    x: center.x + Math.cos(angle) * radius,
                    y: center.y + Math.sin(angle) * radius
                });
            }
        } else {
            // For zero radius, just add the corner point
            arcVertices.push({ x: center.x, y: center.y });
        }
        return arcVertices;
    };

    // Generate vertices for each corner (clockwise from top-left)
    const tlArc = generateCornerArc(corners.tl, clampedTL, Math.PI, Math.PI * 1.5); // 180° to 270°
    const trArc = generateCornerArc(corners.tr, clampedTR, Math.PI * 1.5, Math.PI * 2); // 270° to 360°
    const brArc = generateCornerArc(corners.br, clampedBR, 0, Math.PI * 0.5); // 0° to 90°
    const blArc = generateCornerArc(corners.bl, clampedBL, Math.PI * 0.5, Math.PI); // 90° to 180°

    // Combine all vertices in order (clockwise)
    // Remove duplicates at corner connections to avoid degenerate triangles
    const allVertices = [];

    // Add top-left arc
    allVertices.push(...tlArc);

    // Add top-right arc (skip first point if it's the same as last TL point)
    const trStart =
        tlArc.length > 0 &&
        trArc.length > 0 &&
        Math.abs(tlArc[tlArc.length - 1].x - trArc[0].x) < 0.001 &&
        Math.abs(tlArc[tlArc.length - 1].y - trArc[0].y) < 0.001
            ? 1
            : 0;
    allVertices.push(...trArc.slice(trStart));

    // Add bottom-right arc
    const brStart =
        trArc.length > 0 &&
        brArc.length > 0 &&
        Math.abs(trArc[trArc.length - 1].x - brArc[0].x) < 0.001 &&
        Math.abs(trArc[trArc.length - 1].y - brArc[0].y) < 0.001
            ? 1
            : 0;
    allVertices.push(...brArc.slice(brStart));

    // Add bottom-left arc
    const blStart =
        brArc.length > 0 &&
        blArc.length > 0 &&
        Math.abs(brArc[brArc.length - 1].x - blArc[0].x) < 0.001 &&
        Math.abs(brArc[brArc.length - 1].y - blArc[0].y) < 0.001
            ? 1
            : 0;
    allVertices.push(...blArc.slice(blStart));

    // Skip duplicate points to prevent degenerate triangles
    if (allVertices.length < 3) {
        buildSimpleBoxGeometry(rect, color, geometry);
        return geometry;
    }

    // Generate triangles using center point (triangle fan approach converted to triangle list)
    const center = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    const colorVec = new vec4(color.r, color.g, color.b, color.a);

    // Convert to triangle list (each triangle uses 3 vertices)
    for (let i = 0; i < allVertices.length; i++) {
        const current = allVertices[i];
        const next = allVertices[(i + 1) % allVertices.length];

        // Skip degenerate triangles (points too close together)
        const dx1 = current.x - center.x;
        const dy1 = current.y - center.y;
        const dx2 = next.x - center.x;
        const dy2 = next.y - center.y;

        // Calculate cross product to check if triangle has area
        const crossProduct = dx1 * dy2 - dx2 * dy1;
        if (Math.abs(crossProduct) < 0.001) continue; // Skip degenerate triangle

        // Create triangle: center -> current -> next
        geometry.vertices.push(new Vertex(new vec4(center.x, center.y, rect.depth, 0.0), colorVec));
        geometry.vertices.push(new Vertex(new vec4(current.x, current.y, rect.depth, 0.0), colorVec));
        geometry.vertices.push(new Vertex(new vec4(next.x, next.y, rect.depth, 0.0), colorVec));
    }

    return geometry;
}
