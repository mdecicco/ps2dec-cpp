import { vec4 } from 'math-ext';
import { BoxGeometry, BoxProperties, ClientRect, Color, GeometryType, Overflow, Vertex } from '../types';
import type { Element } from '../renderer/element';

type ScrollBarHandleBox = {
    x: f32; // x coordinate of the scroll bar handle box (relative to the containing box's top-left corner)
    y: f32; // y coordinate of the scroll bar handle box (relative to the containing box's top-left corner)
    width: f32; // width of the scroll bar handle box
    height: f32; // height of the scroll bar handle box
    scrollOffsetPerHandlePixel: f32; // how much does the scroll offset change when the handle is moved by 1 pixel
};

function getVerticalScrollBarHandleBox(
    rect: ClientRect,
    geometry: BoxGeometry,
    scrollBarWidth: f32,
    scrollBarMargin: f32
): ScrollBarHandleBox {
    const { x: boxX, y: boxY, width: boxWidth, height: boxHeight } = rect;
    const { scrollY, contentHeight } = geometry.properties;

    const maxScrollBarLength = boxHeight - scrollBarMargin * 2 - scrollBarWidth;
    const scrollBarLength = (boxHeight / contentHeight) * maxScrollBarLength;
    const scrollBarPosition = (scrollY / (contentHeight - boxHeight)) * (maxScrollBarLength - scrollBarLength);
    const scrollOffsetPerHandlePixel = (contentHeight - boxHeight) / (maxScrollBarLength - scrollBarLength);

    return {
        x: boxX + boxWidth - scrollBarWidth - scrollBarMargin,
        y: boxY + scrollBarPosition + scrollBarMargin,
        width: scrollBarWidth,
        height: scrollBarLength,
        scrollOffsetPerHandlePixel
    };
}

function getHorizontalScrollBarHandleBox(
    rect: ClientRect,
    geometry: BoxGeometry,
    scrollBarWidth: f32,
    scrollBarMargin: f32
): ScrollBarHandleBox {
    const { x: boxX, y: boxY, width: boxWidth, height: boxHeight } = rect;
    const { scrollX, contentWidth } = geometry.properties;

    const maxScrollBarLength = boxWidth - scrollBarMargin * 2 - scrollBarWidth;
    const scrollBarLength = (boxWidth / contentWidth) * maxScrollBarLength;
    const scrollBarPosition = (scrollX / (contentWidth - boxWidth)) * (maxScrollBarLength - scrollBarLength);
    const scrollOffsetPerHandlePixel = (contentWidth - boxWidth) / (maxScrollBarLength - scrollBarLength);

    return {
        x: boxX + scrollBarPosition + scrollBarMargin,
        y: boxY + boxHeight - scrollBarWidth - scrollBarMargin,
        width: scrollBarLength,
        height: scrollBarWidth,
        scrollOffsetPerHandlePixel
    };
}

function buildBoxScrollGeometry(rect: ClientRect, inoutGeometry: BoxGeometry) {
    if (inoutGeometry.properties.overflow !== Overflow.Scroll) return;

    const { width, height } = rect;
    const {
        contentWidth,
        contentHeight,
        verticalScrollBarHovered,
        horizontalScrollBarHovered,
        verticalScrollBarDragging,
        horizontalScrollBarDragging
    } = inoutGeometry.properties;

    const scrollBarEndRadius = 5; // radius of the scroll bar end caps in pixels
    const scrollBarWidth = 10; // width of the scroll bar in pixels
    const scrollBarColor = { r: 0.5, g: 0.5, b: 0.5, a: 0.7 }; // color of the scroll bar
    const scrollBarHoverColor = { r: 0.8, g: 0.8, b: 0.8, a: 0.9 }; // color of the scroll bar when hovered
    const scrollBarDraggingColor = { r: 1.0, g: 1.0, b: 1.0, a: 1.0 }; // color of the scroll bar when dragging
    const scrollBarMargin = 5; // margin of the scroll bar from the edge of the box

    if (contentHeight > height) {
        const verticalScrollBarHandleBox = getVerticalScrollBarHandleBox(
            rect,
            inoutGeometry,
            scrollBarWidth,
            scrollBarMargin
        );

        let color = scrollBarColor;
        if (verticalScrollBarDragging) color = scrollBarDraggingColor;
        else if (verticalScrollBarHovered) color = scrollBarHoverColor;

        buildBoxGeometryInternal(
            verticalScrollBarHandleBox.x,
            verticalScrollBarHandleBox.y,
            rect.depth,
            verticalScrollBarHandleBox.width,
            verticalScrollBarHandleBox.height,
            color,
            scrollBarEndRadius,
            scrollBarEndRadius,
            scrollBarEndRadius,
            scrollBarEndRadius,
            inoutGeometry
        );
    }

    if (contentWidth > width) {
        const horizontalScrollBarHandleBox = getHorizontalScrollBarHandleBox(
            rect,
            inoutGeometry,
            scrollBarWidth,
            scrollBarMargin
        );

        let color = scrollBarColor;
        if (horizontalScrollBarDragging) color = scrollBarDraggingColor;
        else if (horizontalScrollBarHovered) color = scrollBarHoverColor;

        buildBoxGeometryInternal(
            horizontalScrollBarHandleBox.x,
            horizontalScrollBarHandleBox.y,
            rect.depth,
            horizontalScrollBarHandleBox.width,
            horizontalScrollBarHandleBox.height,
            color,
            scrollBarEndRadius,
            scrollBarEndRadius,
            scrollBarEndRadius,
            scrollBarEndRadius,
            inoutGeometry
        );
    }
}

function buildSimpleBoxGeometry(
    x: f32,
    y: f32,
    z: f32,
    width: f32,
    height: f32,
    color: Color,
    inoutGeometry: BoxGeometry
) {
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

function buildBoxGeometryInternal(
    x: f32,
    y: f32,
    z: f32,
    width: f32,
    height: f32,
    color: Color,
    radiusTL: f32,
    radiusTR: f32,
    radiusBL: f32,
    radiusBR: f32,
    inoutGeometry: BoxGeometry
) {
    if (radiusTL === 0 && radiusTR === 0 && radiusBL === 0 && radiusBR === 0) {
        buildSimpleBoxGeometry(x, y, z, width, height, color, inoutGeometry);
        return;
    }

    // Clamp radii to prevent overlapping corners
    const maxRadiusX = width * 0.5;
    const maxRadiusY = height * 0.5;
    const clampedTL = Math.min(radiusTL, maxRadiusX, maxRadiusY);
    const clampedTR = Math.min(radiusTR, maxRadiusX, maxRadiusY);
    const clampedBL = Math.min(radiusBL, maxRadiusX, maxRadiusY);
    const clampedBR = Math.min(radiusBR, maxRadiusX, maxRadiusY);

    // Calculate corner centers
    const corners = {
        tl: { x: x + clampedTL, y: y + clampedTL },
        tr: { x: x + width - clampedTR, y: y + clampedTR },
        bl: { x: x + clampedBL, y: y + height - clampedBL },
        br: { x: x + width - clampedBR, y: y + height - clampedBR }
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
        buildSimpleBoxGeometry(x, y, z, width, height, color, inoutGeometry);
        return;
    }

    // Generate triangles using center point (triangle fan approach converted to triangle list)
    const center = { x: x + width / 2, y: y + height / 2 };
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
        inoutGeometry.vertices.push(new Vertex(new vec4(center.x, center.y, z, 0.0), colorVec));
        inoutGeometry.vertices.push(new Vertex(new vec4(current.x, current.y, z, 0.0), colorVec));
        inoutGeometry.vertices.push(new Vertex(new vec4(next.x, next.y, z, 0.0), colorVec));
    }

    return;
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

    buildBoxGeometryInternal(rect.x, rect.y, rect.depth, rect.width, rect.height, color, tl, tr, bl, br, geometry);
    buildBoxScrollGeometry(rect, geometry);

    return geometry;
}

export function getScrollBarHandles(element: Element) {
    if (!element.geometry || element.geometry.type !== GeometryType.Box) return null;
    const geometry = element.geometry;
    if (geometry.properties.overflow !== Overflow.Scroll) return null;

    const rect = element.style.clientRect;

    const { width, height } = rect;
    const { contentWidth, contentHeight } = geometry.properties;

    const scrollBarWidth = 10; // width of the scroll bar in pixels
    const scrollBarMargin = 5; // margin of the scroll bar from the edge of the box

    let verticalScrollBarHandleBox: ScrollBarHandleBox | null = null;
    let horizontalScrollBarHandleBox: ScrollBarHandleBox | null = null;

    if (contentHeight > height) {
        verticalScrollBarHandleBox = getVerticalScrollBarHandleBox(rect, geometry, scrollBarWidth, scrollBarMargin);
    }

    if (contentWidth > width) {
        horizontalScrollBarHandleBox = getHorizontalScrollBarHandleBox(rect, geometry, scrollBarWidth, scrollBarMargin);
    }

    return {
        horizontal: horizontalScrollBarHandleBox,
        vertical: verticalScrollBarHandleBox
    };
}
