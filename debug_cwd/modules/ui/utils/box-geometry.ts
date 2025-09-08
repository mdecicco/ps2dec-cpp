import { vec4 } from 'math-ext';
import {
    BorderStyle,
    BoxGeometry,
    BoxProperties,
    ClientRect,
    Color,
    GeometryType,
    Overflow,
    Direction
} from '../types';
import type { Element } from '../renderer/element';
import { VertexArray } from './vertex-array';

type ScrollBarHandleBox = {
    x: f32; // x coordinate of the scroll bar handle box (relative to the containing box's top-left corner)
    y: f32; // y coordinate of the scroll bar handle box (relative to the containing box's top-left corner)
    width: f32; // width of the scroll bar handle box
    height: f32; // height of the scroll bar handle box
    scrollOffsetPerHandlePixel: f32; // how much does the scroll offset change when the handle is moved by 1 pixel
};

type BoxParams = {
    x: f32;
    y: f32;
    z: f32;
    width: f32;
    height: f32;
    color: Color;
    radiusTL: f32;
    radiusTR: f32;
    radiusBL: f32;
    radiusBR: f32;
    instanceIdx: u32;
    inoutGeometry: BoxGeometry;
    borderTopWidth: f32;
    borderTopStyle: BorderStyle;
    borderTopColor: Color;
    borderRightWidth: f32;
    borderRightStyle: BorderStyle;
    borderRightColor: Color;
    borderBottomWidth: f32;
    borderBottomStyle: BorderStyle;
    borderBottomColor: Color;
    borderLeftWidth: f32;
    borderLeftStyle: BorderStyle;
    borderLeftColor: Color;
};

enum Side {
    Top = 0,
    Right,
    Bottom,
    Left
}

function getVerticalScrollBarHandleBox(
    rect: ClientRect,
    geometry: BoxGeometry,
    scrollBarWidth: f32,
    scrollBarMargin: f32
): ScrollBarHandleBox {
    const { x: boxX, y: boxY, width: boxWidth, height: boxHeight } = rect;
    const { scrollY, contentHeight } = geometry.properties;

    const minScrollBarLength = 20;
    const maxScrollBarLength = boxHeight - scrollBarMargin * 2 - scrollBarWidth;
    const scrollBarLength = Math.max(minScrollBarLength, (boxHeight / contentHeight) * maxScrollBarLength);
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

    const minScrollBarLength = 20;
    const maxScrollBarLength = boxWidth - scrollBarMargin * 2 - scrollBarWidth;
    const scrollBarLength = Math.max(minScrollBarLength, (boxWidth / contentWidth) * maxScrollBarLength);
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

function buildBoxScrollGeometry(rect: ClientRect, instanceIdx: u32, inoutGeometry: BoxGeometry) {
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

        buildBoxGeometryInternal({
            x: verticalScrollBarHandleBox.x,
            y: verticalScrollBarHandleBox.y,
            z: 0,
            width: verticalScrollBarHandleBox.width,
            height: verticalScrollBarHandleBox.height,
            color,
            radiusTL: scrollBarEndRadius,
            radiusTR: scrollBarEndRadius,
            radiusBL: scrollBarEndRadius,
            radiusBR: scrollBarEndRadius,
            instanceIdx,
            inoutGeometry,
            borderTopWidth: 0,
            borderTopStyle: BorderStyle.Solid,
            borderTopColor: scrollBarColor,
            borderRightWidth: 0,
            borderRightStyle: BorderStyle.Solid,
            borderRightColor: scrollBarColor,
            borderBottomWidth: 0,
            borderBottomStyle: BorderStyle.Solid,
            borderBottomColor: scrollBarColor,
            borderLeftWidth: 0,
            borderLeftStyle: BorderStyle.Solid,
            borderLeftColor: scrollBarColor
        });
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

        buildBoxGeometryInternal({
            x: horizontalScrollBarHandleBox.x,
            y: horizontalScrollBarHandleBox.y,
            z: 0,
            width: horizontalScrollBarHandleBox.width,
            height: horizontalScrollBarHandleBox.height,
            color,
            radiusTL: scrollBarEndRadius,
            radiusTR: scrollBarEndRadius,
            radiusBL: scrollBarEndRadius,
            radiusBR: scrollBarEndRadius,
            instanceIdx,
            inoutGeometry,
            borderTopWidth: 0,
            borderTopStyle: BorderStyle.Solid,
            borderTopColor: scrollBarColor,
            borderRightWidth: 0,
            borderRightStyle: BorderStyle.Solid,
            borderRightColor: scrollBarColor,
            borderBottomWidth: 0,
            borderBottomStyle: BorderStyle.Solid,
            borderBottomColor: scrollBarColor,
            borderLeftWidth: 0,
            borderLeftStyle: BorderStyle.Solid,
            borderLeftColor: scrollBarColor
        });
    }
}

function buildSimpleBoxGeometry(
    x: f32,
    y: f32,
    z: f32,
    width: f32,
    height: f32,
    color: Color,
    instanceIdx: u32,
    inoutGeometry: BoxGeometry
) {
    inoutGeometry.vertices.push(x, y, z, color.r, color.g, color.b, color.a, 0, 0, instanceIdx);
    inoutGeometry.vertices.push(x + width, y, z, color.r, color.g, color.b, color.a, 0, 0, instanceIdx);
    inoutGeometry.vertices.push(x + width, y + height, z, color.r, color.g, color.b, color.a, 0, 0, instanceIdx);
    inoutGeometry.vertices.push(x, y, z, color.r, color.g, color.b, color.a, 0, 0, instanceIdx);
    inoutGeometry.vertices.push(x + width, y + height, z, color.r, color.g, color.b, color.a, 0, 0, instanceIdx);
    inoutGeometry.vertices.push(x, y + height, z, color.r, color.g, color.b, color.a, 0, 0, instanceIdx);
}

function buildSimpleBoxWithBorders(params: BoxParams) {
    const {
        x,
        y,
        z,
        width,
        height,
        color,
        instanceIdx,
        inoutGeometry,
        borderTopWidth,
        borderTopStyle,
        borderTopColor,
        borderRightWidth,
        borderRightStyle,
        borderRightColor,
        borderBottomWidth,
        borderBottomStyle,
        borderBottomColor,
        borderLeftWidth,
        borderLeftStyle,
        borderLeftColor
    } = params;

    // Draw background (content area)
    const contentX = x + borderLeftWidth;
    const contentY = y + borderTopWidth;
    const contentWidth = width - borderLeftWidth - borderRightWidth;
    const contentHeight = height - borderTopWidth - borderBottomWidth;

    if (contentWidth > 0 && contentHeight > 0) {
        buildSimpleBoxGeometry(contentX, contentY, z, contentWidth, contentHeight, color, instanceIdx, inoutGeometry);
    }

    // Draw borders (for simple boxes, all corners have radius 0)
    buildSimpleBorderEdges(params);
}

function buildSimpleBorderEdges(params: BoxParams) {
    const {
        x,
        y,
        z,
        width,
        height,
        instanceIdx,
        inoutGeometry,
        borderTopWidth,
        borderTopStyle,
        borderTopColor,
        borderRightWidth,
        borderRightStyle,
        borderRightColor,
        borderBottomWidth,
        borderBottomStyle,
        borderBottomColor,
        borderLeftWidth,
        borderLeftStyle,
        borderLeftColor
    } = params;

    // For simple boxes (no rounded corners), all corner radii are 0
    // This means double borders should be inset to avoid corner overlap

    // Top border
    if (borderTopWidth > 0 && borderTopStyle !== BorderStyle.None && borderTopStyle !== BorderStyle.Hidden) {
        buildBorderEdge(
            x,
            y,
            x + width,
            y + borderTopWidth,
            borderTopWidth,
            borderTopStyle,
            borderTopColor,
            Direction.Horizontal,
            Side.Top,
            z,
            instanceIdx,
            inoutGeometry,
            0, // startCornerRadius = 0 (no rounded corners)
            0 // endCornerRadius = 0 (no rounded corners)
        );
    }

    // Right border
    if (borderRightWidth > 0 && borderRightStyle !== BorderStyle.None && borderRightStyle !== BorderStyle.Hidden) {
        buildBorderEdge(
            x + width - borderRightWidth,
            y,
            x + width,
            y + height,
            borderRightWidth,
            borderRightStyle,
            borderRightColor,
            Direction.Vertical,
            Side.Right,
            z,
            instanceIdx,
            inoutGeometry,
            0, // startCornerRadius = 0
            0 // endCornerRadius = 0
        );
    }

    // Bottom border
    if (borderBottomWidth > 0 && borderBottomStyle !== BorderStyle.None && borderBottomStyle !== BorderStyle.Hidden) {
        buildBorderEdge(
            x,
            y + height - borderBottomWidth,
            x + width,
            y + height,
            borderBottomWidth,
            borderBottomStyle,
            borderBottomColor,
            Direction.Horizontal,
            Side.Bottom,
            z,
            instanceIdx,
            inoutGeometry,
            0, // startCornerRadius = 0
            0 // endCornerRadius = 0
        );
    }

    // Left border
    if (borderLeftWidth > 0 && borderLeftStyle !== BorderStyle.None && borderLeftStyle !== BorderStyle.Hidden) {
        buildBorderEdge(
            x,
            y,
            x + borderLeftWidth,
            y + height,
            borderLeftWidth,
            borderLeftStyle,
            borderLeftColor,
            Direction.Vertical,
            Side.Left,
            z,
            instanceIdx,
            inoutGeometry,
            0, // startCornerRadius = 0
            0 // endCornerRadius = 0
        );
    }
}

function buildBorderEdge(
    x1: f32,
    y1: f32,
    x2: f32,
    y2: f32,
    borderWidth: f32,
    borderStyle: BorderStyle,
    borderColor: Color,
    orientation: Direction,
    side: Side,
    z: f32,
    instanceIdx: u32,
    inoutGeometry: BoxGeometry,
    startCornerRadius: f32 = 0,
    endCornerRadius: f32 = 0
) {
    switch (borderStyle) {
        case BorderStyle.Solid:
            buildSolidBorder(x1, y1, x2, y2, borderColor, z, instanceIdx, inoutGeometry);
            break;

        case BorderStyle.Dashed:
            buildDashedBorder(x1, y1, x2, y2, borderWidth, borderColor, orientation, z, instanceIdx, inoutGeometry);
            break;

        case BorderStyle.Dotted:
            buildDottedBorder(x1, y1, x2, y2, borderWidth, borderColor, orientation, z, instanceIdx, inoutGeometry);
            break;

        case BorderStyle.Double:
            buildDoubleBorder(
                x1,
                y1,
                x2,
                y2,
                borderWidth,
                borderColor,
                side,
                z,
                instanceIdx,
                inoutGeometry,
                startCornerRadius,
                endCornerRadius
            );
            break;
    }
}

function buildSolidBorder(
    x1: f32,
    y1: f32,
    x2: f32,
    y2: f32,
    color: Color,
    z: f32,
    instanceIdx: u32,
    inoutGeometry: BoxGeometry
) {
    // Simple rectangle for solid border
    inoutGeometry.vertices.push(x1, y1, z, color.r, color.g, color.b, color.a, 0, 0, instanceIdx);
    inoutGeometry.vertices.push(x2, y1, z, color.r, color.g, color.b, color.a, 0, 0, instanceIdx);
    inoutGeometry.vertices.push(x2, y2, z, color.r, color.g, color.b, color.a, 0, 0, instanceIdx);
    inoutGeometry.vertices.push(x1, y1, z, color.r, color.g, color.b, color.a, 0, 0, instanceIdx);
    inoutGeometry.vertices.push(x2, y2, z, color.r, color.g, color.b, color.a, 0, 0, instanceIdx);
    inoutGeometry.vertices.push(x1, y2, z, color.r, color.g, color.b, color.a, 0, 0, instanceIdx);
}

function buildDashedBorder(
    x1: f32,
    y1: f32,
    x2: f32,
    y2: f32,
    borderWidth: f32,
    color: Color,
    orientation: Direction,
    z: f32,
    instanceIdx: u32,
    inoutGeometry: BoxGeometry
) {
    const dashLength = Math.max(borderWidth * 3, 4); // CSS spec suggests 3x border width
    const gapLength = dashLength;

    if (orientation === Direction.Horizontal) {
        const totalLength = x2 - x1;
        const dashCount = Math.floor(totalLength / (dashLength + gapLength));
        const actualDashLength = totalLength / (dashCount + (dashCount - 1) * (gapLength / dashLength));
        const actualGapLength = actualDashLength * (gapLength / dashLength);

        for (let i = 0; i < dashCount; i++) {
            const dashX1 = x1 + i * (actualDashLength + actualGapLength);
            const dashX2 = Math.min(dashX1 + actualDashLength, x2);
            buildSolidBorder(dashX1, y1, dashX2, y2, color, z, instanceIdx, inoutGeometry);
        }
    } else {
        const totalLength = y2 - y1;
        const dashCount = Math.floor(totalLength / (dashLength + gapLength));
        const actualDashLength = totalLength / (dashCount + (dashCount - 1) * (gapLength / dashLength));
        const actualGapLength = actualDashLength * (gapLength / dashLength);

        for (let i = 0; i < dashCount; i++) {
            const dashY1 = y1 + i * (actualDashLength + actualGapLength);
            const dashY2 = Math.min(dashY1 + actualDashLength, y2);
            buildSolidBorder(x1, dashY1, x2, dashY2, color, z, instanceIdx, inoutGeometry);
        }
    }
}

function buildDottedBorder(
    x1: f32,
    y1: f32,
    x2: f32,
    y2: f32,
    borderWidth: f32,
    color: Color,
    orientation: Direction,
    z: f32,
    instanceIdx: u32,
    inoutGeometry: BoxGeometry
) {
    const dotSize = borderWidth;
    const spacing = dotSize;

    if (orientation === Direction.Horizontal) {
        const totalLength = x2 - x1;
        const dotCount = Math.floor(totalLength / (dotSize + spacing));
        const actualSpacing = totalLength / dotCount - dotSize;

        for (let i = 0; i < dotCount; i++) {
            const dotX1 = x1 + i * (dotSize + actualSpacing);
            const dotX2 = Math.min(dotX1 + dotSize, x2);
            buildSolidBorder(dotX1, y1, dotX2, y2, color, z, instanceIdx, inoutGeometry);
        }
    } else {
        const totalLength = y2 - y1;
        const dotCount = Math.floor(totalLength / (dotSize + spacing));
        const actualSpacing = totalLength / dotCount - dotSize;

        for (let i = 0; i < dotCount; i++) {
            const dotY1 = y1 + i * (dotSize + actualSpacing);
            const dotY2 = Math.min(dotY1 + dotSize, y2);
            buildSolidBorder(x1, dotY1, x2, dotY2, color, z, instanceIdx, inoutGeometry);
        }
    }
}

function buildDoubleBorder(
    x1: f32,
    y1: f32,
    x2: f32,
    y2: f32,
    borderWidth: f32,
    color: Color,
    side: Side,
    z: f32,
    instanceIdx: u32,
    inoutGeometry: BoxGeometry,
    startCornerRadius: f32 = 0,
    endCornerRadius: f32 = 0
) {
    // CSS spec: double border has two lines separated by a gap
    // Each line should be 1/3 of border width, gap is 1/3
    const lineWidth = Math.max(1, borderWidth / 3);
    const gapWidth = lineWidth;

    switch (side) {
        case Side.Top: {
            // Outer line (full width)
            buildSolidBorder(x1, y1, x2, y1 + lineWidth, color, z, instanceIdx, inoutGeometry);

            // Inner line - adjust insets based on corner radii
            // If corner has radius > 0, don't inset as much (corner border will handle transition)
            // If corner has radius = 0, inset by line width to avoid overlap
            const startInset = startCornerRadius > 0 ? 0 : lineWidth + gapWidth;
            const endInset = endCornerRadius > 0 ? 0 : lineWidth + gapWidth;

            const innerX1 = x1 + startInset;
            const innerX2 = x2 - endInset;
            const innerY1 = y1 + lineWidth + gapWidth;
            const innerY2 = y2;

            if (innerX2 > innerX1) {
                buildSolidBorder(innerX1, innerY1, innerX2, innerY2, color, z, instanceIdx, inoutGeometry);
            }
            break;
        }
        case Side.Bottom: {
            // Outer line (full width)
            buildSolidBorder(
                x1,
                y1 + lineWidth + gapWidth,
                x2,
                y1 + lineWidth + lineWidth + gapWidth,
                color,
                z,
                instanceIdx,
                inoutGeometry
            );

            // Inner line - adjust insets based on corner radii
            // If corner has radius > 0, don't inset as much (corner border will handle transition)
            // If corner has radius = 0, inset by line width to avoid overlap
            const startInset = startCornerRadius > 0 ? 0 : lineWidth + gapWidth;
            const endInset = endCornerRadius > 0 ? 0 : lineWidth + gapWidth;

            const innerX1 = x1 + startInset;
            const innerX2 = x2 - endInset;
            const innerY1 = y1;
            const innerY2 = y1 + lineWidth;

            if (innerX2 > innerX1) {
                buildSolidBorder(innerX1, innerY1, innerX2, innerY2, color, z, instanceIdx, inoutGeometry);
            }
            break;
        }
        case Side.Left: {
            // Outer line (full height)
            buildSolidBorder(x1, y1, x1 + lineWidth, y2, color, z, instanceIdx, inoutGeometry);

            // Inner line - adjust insets based on corner radii
            const startInset = startCornerRadius > 0 ? 0 : lineWidth + gapWidth;
            const endInset = endCornerRadius > 0 ? 0 : lineWidth + gapWidth;

            const innerX1 = x1 + lineWidth + gapWidth;
            const innerX2 = x2;
            const innerY1 = y1 + startInset;
            const innerY2 = y2 - endInset;

            if (innerY2 > innerY1) {
                buildSolidBorder(innerX1, innerY1, innerX2, innerY2, color, z, instanceIdx, inoutGeometry);
            }
            break;
        }
        case Side.Right: {
            // Outer line (full height)
            buildSolidBorder(
                x1 + lineWidth + gapWidth,
                y1,
                x1 + lineWidth + lineWidth + gapWidth,
                y2,
                color,
                z,
                instanceIdx,
                inoutGeometry
            );

            // Inner line - adjust insets based on corner radii
            const startInset = startCornerRadius > 0 ? 0 : lineWidth + gapWidth;
            const endInset = endCornerRadius > 0 ? 0 : lineWidth + gapWidth;

            const innerX1 = x1;
            const innerX2 = x1 + lineWidth;
            const innerY1 = y1 + startInset;
            const innerY2 = y2 - endInset;

            if (innerY2 > innerY1) {
                buildSolidBorder(innerX1, innerY1, innerX2, innerY2, color, z, instanceIdx, inoutGeometry);
            }
            break;
        }
    }
}

function buildBoxGeometryInternal(params: BoxParams) {
    const {
        x,
        y,
        z,
        width,
        height,
        color,
        radiusTL,
        radiusTR,
        radiusBL,
        radiusBR,
        instanceIdx,
        inoutGeometry,
        borderTopWidth,
        borderRightWidth,
        borderBottomWidth,
        borderLeftWidth
    } = params;

    if (radiusTL === 0 && radiusTR === 0 && radiusBL === 0 && radiusBR === 0) {
        buildSimpleBoxWithBorders(params);
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
        buildSimpleBoxWithBorders(params);
        return;
    }

    // Calculate content area (inner box minus borders)
    const contentX = x + borderLeftWidth;
    const contentY = y + borderTopWidth;
    const contentWidth = width - borderLeftWidth - borderRightWidth;
    const contentHeight = height - borderTopWidth - borderBottomWidth;

    // Generate triangles using center point (triangle fan approach converted to triangle list)
    const center = { x: contentX + contentWidth / 2, y: contentY + contentHeight / 2 };

    // Convert to triangle list (each triangle uses 3 vertices) - this draws the content area
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
        inoutGeometry.vertices.push(center.x, center.y, z, color.r, color.g, color.b, color.a, 0, 0, instanceIdx);
        inoutGeometry.vertices.push(current.x, current.y, z, color.r, color.g, color.b, color.a, 0, 0, instanceIdx);
        inoutGeometry.vertices.push(next.x, next.y, z, color.r, color.g, color.b, color.a, 0, 0, instanceIdx);
    }

    // Generate rounded borders
    buildRoundedBorders(params, clampedTL, clampedTR, clampedBL, clampedBR);
}

function buildRoundedBorders(params: BoxParams, clampedTL: f32, clampedTR: f32, clampedBL: f32, clampedBR: f32) {
    const {
        x,
        y,
        z,
        width,
        height,
        borderTopWidth,
        borderTopStyle,
        borderTopColor,
        borderRightWidth,
        borderRightStyle,
        borderRightColor,
        borderBottomWidth,
        borderBottomStyle,
        borderBottomColor,
        borderLeftWidth,
        borderLeftStyle,
        borderLeftColor,
        instanceIdx,
        inoutGeometry
    } = params;

    // For rounded rectangles, we need to generate border paths that follow the curves
    // This is a simplified implementation - for full browser compatibility,
    // we'd need more complex path generation for each border style

    // Calculate the inner radii for each corner (outer radii are the clamped values)
    const innerRadii = {
        tl: Math.max(0, clampedTL - Math.max(borderTopWidth, borderLeftWidth)),
        tr: Math.max(0, clampedTR - Math.max(borderTopWidth, borderRightWidth)),
        bl: Math.max(0, clampedBL - Math.max(borderBottomWidth, borderLeftWidth)),
        br: Math.max(0, clampedBR - Math.max(borderBottomWidth, borderRightWidth))
    };

    // Generate border geometry for each edge
    // Note: This is a simplified approach. For perfect browser compliance,
    // we'd need to handle corner mitring and complex path intersections

    // Top border
    if (borderTopWidth > 0 && borderTopStyle !== BorderStyle.None && borderTopStyle !== BorderStyle.Hidden) {
        const startX = x + clampedTL;
        const endX = x + width - clampedTR;
        if (endX > startX) {
            buildBorderEdge(
                startX,
                y,
                endX,
                y + borderTopWidth,
                borderTopWidth,
                borderTopStyle,
                borderTopColor,
                Direction.Horizontal,
                Side.Top,
                z,
                instanceIdx,
                inoutGeometry,
                clampedTL,
                clampedTR
            );
        }
    }

    // Right border
    if (borderRightWidth > 0 && borderRightStyle !== BorderStyle.None && borderRightStyle !== BorderStyle.Hidden) {
        const startY = y + clampedTR;
        const endY = y + height - clampedBR;
        if (endY > startY) {
            buildBorderEdge(
                x + width - borderRightWidth,
                startY,
                x + width,
                endY,
                borderRightWidth,
                borderRightStyle,
                borderRightColor,
                Direction.Vertical,
                Side.Right,
                z,
                instanceIdx,
                inoutGeometry,
                clampedTR,
                clampedBR
            );
        }
    }

    // Bottom border
    if (borderBottomWidth > 0 && borderBottomStyle !== BorderStyle.None && borderBottomStyle !== BorderStyle.Hidden) {
        const startX = x + clampedBL;
        const endX = x + width - clampedBR;
        if (endX > startX) {
            buildBorderEdge(
                startX,
                y + height - borderBottomWidth,
                endX,
                y + height,
                borderBottomWidth,
                borderBottomStyle,
                borderBottomColor,
                Direction.Horizontal,
                Side.Bottom,
                z,
                instanceIdx,
                inoutGeometry,
                clampedBL,
                clampedBR
            );
        }
    }

    // Left border
    if (borderLeftWidth > 0 && borderLeftStyle !== BorderStyle.None && borderLeftStyle !== BorderStyle.Hidden) {
        const startY = y + clampedTL;
        const endY = y + height - clampedBL;
        if (endY > startY) {
            buildBorderEdge(
                x,
                startY,
                x + borderLeftWidth,
                endY,
                borderLeftWidth,
                borderLeftStyle,
                borderLeftColor,
                Direction.Vertical,
                Side.Left,
                z,
                instanceIdx,
                inoutGeometry,
                clampedTL,
                clampedBL
            );
        }
    }

    // Generate corner borders (respects edge border styles)
    // Top-left corner
    if (
        clampedTL > 0 &&
        ((borderTopWidth > 0 && borderTopStyle !== BorderStyle.None && borderTopStyle !== BorderStyle.Hidden) ||
            (borderLeftWidth > 0 && borderLeftStyle !== BorderStyle.None && borderLeftStyle !== BorderStyle.Hidden))
    ) {
        // Use the style from the dominant border (top takes precedence if both exist)
        const cornerStyle = borderTopWidth > 0 ? borderTopStyle : borderLeftStyle;
        const cornerWidth = Math.max(borderTopWidth, borderLeftWidth);
        buildRoundedCornerBorder(
            x + clampedTL,
            y + clampedTL,
            clampedTL,
            innerRadii.tl,
            Math.PI,
            Math.PI * 1.5, // 180° to 270°
            borderTopColor,
            borderLeftColor,
            cornerStyle,
            cornerWidth,
            z,
            instanceIdx,
            inoutGeometry
        );
    }

    // Top-right corner
    if (
        clampedTR > 0 &&
        ((borderTopWidth > 0 && borderTopStyle !== BorderStyle.None && borderTopStyle !== BorderStyle.Hidden) ||
            (borderRightWidth > 0 && borderRightStyle !== BorderStyle.None && borderRightStyle !== BorderStyle.Hidden))
    ) {
        const cornerStyle = borderTopWidth > 0 ? borderTopStyle : borderRightStyle;
        const cornerWidth = Math.max(borderTopWidth, borderRightWidth);
        buildRoundedCornerBorder(
            x + width - clampedTR,
            y + clampedTR,
            clampedTR,
            innerRadii.tr,
            Math.PI * 1.5,
            Math.PI * 2, // 270° to 360°
            borderTopColor,
            borderRightColor,
            cornerStyle,
            cornerWidth,
            z,
            instanceIdx,
            inoutGeometry
        );
    }

    // Bottom-right corner
    if (
        clampedBR > 0 &&
        ((borderBottomWidth > 0 &&
            borderBottomStyle !== BorderStyle.None &&
            borderBottomStyle !== BorderStyle.Hidden) ||
            (borderRightWidth > 0 && borderRightStyle !== BorderStyle.None && borderRightStyle !== BorderStyle.Hidden))
    ) {
        const cornerStyle = borderRightWidth > 0 ? borderRightStyle : borderBottomStyle;
        const cornerWidth = Math.max(borderRightWidth, borderBottomWidth);
        buildRoundedCornerBorder(
            x + width - clampedBR,
            y + height - clampedBR,
            clampedBR,
            innerRadii.br,
            0,
            Math.PI * 0.5, // 0° to 90°
            borderRightColor,
            borderBottomColor,
            cornerStyle,
            cornerWidth,
            z,
            instanceIdx,
            inoutGeometry
        );
    }

    // Bottom-left corner
    if (
        clampedBL > 0 &&
        ((borderBottomWidth > 0 &&
            borderBottomStyle !== BorderStyle.None &&
            borderBottomStyle !== BorderStyle.Hidden) ||
            (borderLeftWidth > 0 && borderLeftStyle !== BorderStyle.None && borderLeftStyle !== BorderStyle.Hidden))
    ) {
        const cornerStyle = borderBottomWidth > 0 ? borderBottomStyle : borderLeftStyle;
        const cornerWidth = Math.max(borderBottomWidth, borderLeftWidth);
        buildRoundedCornerBorder(
            x + clampedBL,
            y + height - clampedBL,
            clampedBL,
            innerRadii.bl,
            Math.PI * 0.5,
            Math.PI, // 90° to 180°
            borderBottomColor,
            borderLeftColor,
            cornerStyle,
            cornerWidth,
            z,
            instanceIdx,
            inoutGeometry
        );
    }
}

function buildRoundedCornerBorder(
    centerX: f32,
    centerY: f32,
    outerRadius: f32,
    innerRadius: f32,
    startAngle: number,
    endAngle: number,
    color1: Color,
    color2: Color,
    borderStyle: BorderStyle,
    borderWidth: f32,
    z: f32,
    instanceIdx: u32,
    inoutGeometry: BoxGeometry
) {
    // For simplicity, use the first color for the entire corner
    // In a full implementation, we'd blend colors or create separate segments
    const color = color1;

    // Handle different border styles for corners
    switch (borderStyle) {
        case BorderStyle.Solid:
            buildSolidRoundedCorner(
                centerX,
                centerY,
                outerRadius,
                innerRadius,
                startAngle,
                endAngle,
                color,
                z,
                instanceIdx,
                inoutGeometry
            );
            break;
        case BorderStyle.Dashed:
            buildDashedRoundedCorner(
                centerX,
                centerY,
                outerRadius,
                innerRadius,
                startAngle,
                endAngle,
                color,
                borderWidth,
                z,
                instanceIdx,
                inoutGeometry
            );
            break;
        case BorderStyle.Dotted:
            buildDottedRoundedCorner(
                centerX,
                centerY,
                outerRadius,
                innerRadius,
                startAngle,
                endAngle,
                color,
                borderWidth,
                z,
                instanceIdx,
                inoutGeometry
            );
            break;
        case BorderStyle.Double:
            buildDoubleRoundedCorner(
                centerX,
                centerY,
                outerRadius,
                innerRadius,
                startAngle,
                endAngle,
                color,
                borderWidth,
                z,
                instanceIdx,
                inoutGeometry
            );
            break;
    }
}

function buildSolidRoundedCorner(
    centerX: f32,
    centerY: f32,
    outerRadius: f32,
    innerRadius: f32,
    startAngle: number,
    endAngle: number,
    color: Color,
    z: f32,
    instanceIdx: u32,
    inoutGeometry: BoxGeometry
) {
    if (innerRadius <= 0) {
        // No inner radius, fill the entire corner arc
        const segments = Math.max(Math.floor((endAngle - startAngle) * outerRadius * 0.5), 3);
        const center = { x: centerX, y: centerY };

        for (let i = 0; i < segments; i++) {
            const angle1 = startAngle + (endAngle - startAngle) * (i / segments);
            const angle2 = startAngle + (endAngle - startAngle) * ((i + 1) / segments);

            const x1 = centerX + Math.cos(angle1) * outerRadius;
            const y1 = centerY + Math.sin(angle1) * outerRadius;
            const x2 = centerX + Math.cos(angle2) * outerRadius;
            const y2 = centerY + Math.sin(angle2) * outerRadius;

            // Triangle from center to arc edge (clockwise winding)
            inoutGeometry.vertices.push(centerX, centerY, z, color.r, color.g, color.b, color.a, 0, 0, instanceIdx);
            inoutGeometry.vertices.push(x2, y2, z, color.r, color.g, color.b, color.a, 0, 0, instanceIdx);
            inoutGeometry.vertices.push(x1, y1, z, color.r, color.g, color.b, color.a, 0, 0, instanceIdx);
        }
    } else {
        // Generate border ring between inner and outer radius
        const segments = Math.max(Math.floor((endAngle - startAngle) * outerRadius * 0.5), 3);

        for (let i = 0; i < segments; i++) {
            const angle1 = startAngle + (endAngle - startAngle) * (i / segments);
            const angle2 = startAngle + (endAngle - startAngle) * ((i + 1) / segments);

            const outerX1 = centerX + Math.cos(angle1) * outerRadius;
            const outerY1 = centerY + Math.sin(angle1) * outerRadius;
            const outerX2 = centerX + Math.cos(angle2) * outerRadius;
            const outerY2 = centerY + Math.sin(angle2) * outerRadius;

            const innerX1 = centerX + Math.cos(angle1) * innerRadius;
            const innerY1 = centerY + Math.sin(angle1) * innerRadius;
            const innerX2 = centerX + Math.cos(angle2) * innerRadius;
            const innerY2 = centerY + Math.sin(angle2) * innerRadius;

            // Create two triangles to form a quad (clockwise winding)
            // Triangle 1: outer1 -> outer2 -> inner1
            inoutGeometry.vertices.push(outerX1, outerY1, z, color.r, color.g, color.b, color.a, 0, 0, instanceIdx);
            inoutGeometry.vertices.push(outerX2, outerY2, z, color.r, color.g, color.b, color.a, 0, 0, instanceIdx);
            inoutGeometry.vertices.push(innerX1, innerY1, z, color.r, color.g, color.b, color.a, 0, 0, instanceIdx);

            // Triangle 2: outer2 -> inner2 -> inner1
            inoutGeometry.vertices.push(outerX2, outerY2, z, color.r, color.g, color.b, color.a, 0, 0, instanceIdx);
            inoutGeometry.vertices.push(innerX2, innerY2, z, color.r, color.g, color.b, color.a, 0, 0, instanceIdx);
            inoutGeometry.vertices.push(innerX1, innerY1, z, color.r, color.g, color.b, color.a, 0, 0, instanceIdx);
        }
    }
}

function buildDashedRoundedCorner(
    centerX: f32,
    centerY: f32,
    outerRadius: f32,
    innerRadius: f32,
    startAngle: number,
    endAngle: number,
    color: Color,
    borderWidth: f32,
    z: f32,
    instanceIdx: u32,
    inoutGeometry: BoxGeometry
) {
    // For dashed rounded corners, approximate with shorter solid arcs
    const totalAngle = endAngle - startAngle;
    const dashLength = Math.max(borderWidth * 3, 0.2); // Dash length in radians
    const gapLength = dashLength;
    const dashCount = Math.floor(totalAngle / (dashLength + gapLength));

    for (let i = 0; i < dashCount; i++) {
        const dashStart = startAngle + i * (dashLength + gapLength);
        const dashEnd = Math.min(dashStart + dashLength, endAngle);
        buildSolidRoundedCorner(
            centerX,
            centerY,
            outerRadius,
            innerRadius,
            dashStart,
            dashEnd,
            color,
            z,
            instanceIdx,
            inoutGeometry
        );
    }
}

function buildDottedRoundedCorner(
    centerX: f32,
    centerY: f32,
    outerRadius: f32,
    innerRadius: f32,
    startAngle: number,
    endAngle: number,
    color: Color,
    borderWidth: f32,
    z: f32,
    instanceIdx: u32,
    inoutGeometry: BoxGeometry
) {
    // For dotted rounded corners, create short arcs with gaps
    const totalAngle = endAngle - startAngle;
    const dotLength = Math.max(borderWidth * 0.1, 0.1); // Dot length in radians
    const spacing = dotLength;
    const dotCount = Math.floor(totalAngle / (dotLength + spacing));

    for (let i = 0; i < dotCount; i++) {
        const dotStart = startAngle + i * (dotLength + spacing);
        const dotEnd = Math.min(dotStart + dotLength, endAngle);
        buildSolidRoundedCorner(
            centerX,
            centerY,
            outerRadius,
            innerRadius,
            dotStart,
            dotEnd,
            color,
            z,
            instanceIdx,
            inoutGeometry
        );
    }
}

function buildDoubleRoundedCorner(
    centerX: f32,
    centerY: f32,
    outerRadius: f32,
    innerRadius: f32,
    startAngle: number,
    endAngle: number,
    color: Color,
    borderWidth: f32,
    z: f32,
    instanceIdx: u32,
    inoutGeometry: BoxGeometry
) {
    // For double rounded corners, create two concentric arcs
    const lineWidth = Math.max(1, borderWidth / 3);
    const gapWidth = lineWidth;

    // Outer line
    const outerInnerRadius = Math.max(0, outerRadius - lineWidth);
    buildSolidRoundedCorner(
        centerX,
        centerY,
        outerRadius,
        outerInnerRadius,
        startAngle,
        endAngle,
        color,
        z,
        instanceIdx,
        inoutGeometry
    );

    // Inner line (only if there's enough space)
    const innerOuterRadius = Math.max(0, innerRadius + lineWidth);
    if (innerOuterRadius > innerRadius && innerRadius >= 0) {
        buildSolidRoundedCorner(
            centerX,
            centerY,
            innerOuterRadius,
            innerRadius,
            startAngle,
            endAngle,
            color,
            z,
            instanceIdx,
            inoutGeometry
        );
    }
}

export function buildBoxGeometry(properties: BoxProperties, instanceIdx: u32): BoxGeometry {
    const geometry: BoxGeometry = {
        type: GeometryType.Box,
        properties,
        offsetPosition: new vec4(0, 0, 0, 0),
        vertices: new VertexArray()
    };

    // todo: calculate the exact number of vertices needed
    geometry.vertices.init(2048);

    const { rect } = properties;

    const tl = rect.topLeftRadius;
    const tr = rect.topRightRadius;
    const bl = rect.bottomLeftRadius;
    const br = rect.bottomRightRadius;

    buildBoxGeometryInternal({
        x: rect.x,
        y: rect.y,
        z: 0,
        width: rect.width,
        height: rect.height,
        color: properties.color,
        radiusTL: tl,
        radiusTR: tr,
        radiusBL: bl,
        radiusBR: br,
        instanceIdx,
        inoutGeometry: geometry,
        borderTopWidth: properties.borderTop.width,
        borderTopStyle: properties.borderTop.style,
        borderTopColor: properties.borderTop.color,
        borderRightWidth: properties.borderRight.width,
        borderRightStyle: properties.borderRight.style,
        borderRightColor: properties.borderRight.color,
        borderBottomWidth: properties.borderBottom.width,
        borderBottomStyle: properties.borderBottom.style,
        borderBottomColor: properties.borderBottom.color,
        borderLeftWidth: properties.borderLeft.width,
        borderLeftStyle: properties.borderLeft.style,
        borderLeftColor: properties.borderLeft.color
    });
    buildBoxScrollGeometry(rect, instanceIdx, geometry);

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
