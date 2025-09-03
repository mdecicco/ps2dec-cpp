export const VertexShader = `
#version 450

struct Instance {
    vec3 offset;
    float opacity;
    int clipRectIndex;
};

layout(std140, binding = 0) uniform Data {
    mat4 mvp;
    float fontPixelRange;
    int isFont;
};

layout(std140, binding = 2) buffer InstanceBuffer {
    Instance instances[];
};

layout(location = 0) in vec4 position;
layout(location = 1) in vec4 color;
layout(location = 2) in vec2 uv;
layout(location = 3) in int instanceIdx;

layout(location = 0) out vec4 v_color;
layout(location = 1) out vec2 v_uv;
layout(location = 2) flat out int v_instanceIdx;
layout(location = 3) out vec2 v_pos;

void main() {
    Instance instance = instances[instanceIdx];
    vec3 offset = instance.offset;
    vec4 pos = vec4(position.x + offset.x, position.y + offset.y, position.z + offset.z, 1.0);
    gl_Position = mvp * pos;
    v_color = color;
    v_uv = uv;
    v_instanceIdx = instanceIdx;
    v_pos = pos.xy;
}`;

export const FragmentShader = `
#version 450

struct ClippingInfo {
    float left;
    float top;
    float right;
    float bottom;
    float topLeftRadius;
    float topRightRadius;
    float bottomLeftRadius;
    float bottomRightRadius;
};

struct Instance {
    vec3 offset;
    float opacity;
    int clipRectIndex;
};

layout(std140, binding = 0) uniform Data {
    mat4 mvp;
    float fontPixelRange;
    int isFont;
};

layout(std140, binding = 1) buffer ClipRectBuffer {
    ClippingInfo clipRects[];
};

layout(std140, binding = 2) buffer InstanceBuffer {
    Instance instances[];
};

layout(binding = 3) uniform sampler2D fontAtlas;

layout(location = 0) in vec4 v_color;
layout(location = 1) in vec2 v_uv;
layout(location = 2) flat in int v_instanceIdx;
layout(location = 3) in vec2 v_pos;

layout(location = 0) out vec4 outColor;

float screenPxRange() {
    vec2 unitRange = vec2(fontPixelRange) / vec2(textureSize(fontAtlas, 0));
    vec2 screenTexSize = vec2(1.0) / fwidth(v_uv);
    return max(0.5 * dot(unitRange, screenTexSize), 1.0);
}

float median(float r, float g, float b) {
    return max(min(r, g), min(max(r, g), b));
}

void main() {
    Instance instance = instances[v_instanceIdx];
    int clipRectIndex = instance.clipRectIndex;
    float opacity = v_color.a * instance.opacity;

    if (clipRectIndex != -1) {
        ClippingInfo clip = clipRects[clipRectIndex];
        if (v_pos.x < clip.left) opacity = 0.0;
        else if (v_pos.x > clip.right) opacity = 0.0;
        else if (v_pos.y < clip.top) opacity = 0.0;
        else if (v_pos.y > clip.bottom) opacity = 0.0;
        else {
            float bl = clip.bottomLeftRadius;

            bool inTopLeft = v_pos.x < clip.left + clip.topLeftRadius && v_pos.y < clip.top + clip.topLeftRadius;
            bool inTopRight = v_pos.x > clip.right - clip.topRightRadius && v_pos.y < clip.top + clip.topRightRadius;
            bool inBottomRight = v_pos.x > clip.right - clip.bottomRightRadius && v_pos.y > clip.bottom - clip.bottomRightRadius;
            bool inBottomLeft = v_pos.x < clip.left + clip.bottomLeftRadius && v_pos.y > clip.bottom - clip.bottomLeftRadius;
            
            if (inTopLeft && clip.topLeftRadius > 0.0) {
                vec2 center = vec2(clip.left + clip.topLeftRadius, clip.top + clip.topLeftRadius);
                vec2 diff = v_pos - center;
                if (dot(diff, diff) > clip.topLeftRadius * clip.topLeftRadius) opacity = 0.0;
            } else if (inTopRight && clip.topRightRadius > 0.0) {
                vec2 center = vec2(clip.right - clip.topRightRadius, clip.top + clip.topRightRadius);
                vec2 diff = v_pos - center;
                if (dot(diff, diff) > clip.topRightRadius * clip.topRightRadius) opacity = 0.0;
            } else if (inBottomRight && clip.bottomRightRadius > 0.0) {
                vec2 center = vec2(clip.right - clip.bottomRightRadius, clip.bottom - clip.bottomRightRadius);
                vec2 diff = v_pos - center;
                if (dot(diff, diff) > clip.bottomRightRadius * clip.bottomRightRadius) opacity = 0.0;
            } else if (inBottomLeft && clip.bottomLeftRadius > 0.0) {
                vec2 center = vec2(clip.left + clip.bottomLeftRadius, clip.bottom - clip.bottomLeftRadius);
                vec2 diff = v_pos - center;
                if (dot(diff, diff) > clip.bottomLeftRadius * clip.bottomLeftRadius) opacity = 0.0;
            }
        }
    }

    if (isFont == 1) {
        vec4 msd = texture(fontAtlas, v_uv);
        float sd = median(msd.r, msd.g, msd.b);
        float screenPxDistance = screenPxRange() * (sd - 0.5);
        opacity *= clamp(screenPxDistance + 0.5, 0.0, 1.0);
        outColor = vec4(v_color.rgb, opacity);
    } else {
        outColor = vec4(v_color.rgb, v_color.a * opacity);
    }
}`;
