#pragma once
#include <decomp/types.h>

#include <decomp/utils/math.hpp>

#include <utils/Array.h>
#include <utils/String.h>

namespace render {
    using u64 = decomp::u64;
    using i64 = decomp::i64;
    using u32 = decomp::u32;
    using i32 = decomp::i32;
    using u16 = decomp::u16;
    using i16 = decomp::i16;
    using u8  = decomp::u8;
    using i8  = decomp::i8;
    using f32 = decomp::f32;
    using f64 = decomp::f64;

    using vec2i  = ::decomp::vec2<i32>;
    using vec2ui = ::decomp::vec2<u32>;
    using vec2f  = ::decomp::vec2<f32>;
    using vec2d  = ::decomp::vec2<f64>;
    using vec3i  = ::decomp::vec3<i32>;
    using vec3ui = ::decomp::vec3<u32>;
    using vec3f  = ::decomp::vec3<f32>;
    using vec3d  = ::decomp::vec3<f64>;
    using vec4i  = ::decomp::vec4<i32>;
    using vec4ui = ::decomp::vec4<u32>;
    using vec4f  = ::decomp::vec4<f32>;
    using vec4d  = ::decomp::vec4<f64>;
    using quatf  = ::decomp::quat<f32>;
    using quatd  = ::decomp::quat<f64>;
    using mat2f  = ::decomp::mat2<f32>;
    using mat2d  = ::decomp::mat2<f64>;
    using mat3f  = ::decomp::mat3<f32>;
    using mat3d  = ::decomp::mat3<f64>;
    using mat4f  = ::decomp::mat4<f32>;
    using mat4d  = ::decomp::mat4<f64>;
    using String = ::utils::String;

    template <typename T>
    using Array = ::utils::Array<T>;

    enum DATA_TYPE {
        dt_int = 0,
        dt_float,
        dt_uint,
        dt_vec2i,
        dt_vec2f,
        dt_vec2ui,
        dt_vec3i,
        dt_vec3f,
        dt_vec3ui,
        dt_vec4i,
        dt_vec4f,
        dt_vec4ui,
        dt_mat2i,
        dt_mat2f,
        dt_mat2ui,
        dt_mat3i,
        dt_mat3f,
        dt_mat3ui,
        dt_mat4i,
        dt_mat4f,
        dt_mat4ui,
        dt_struct,
        dt_enum_count
    };

    enum PRIMITIVE_TYPE {
        PT_POINTS,
        PT_LINES,
        PT_LINE_STRIP,
        PT_TRIANGLES,
        PT_TRIANGLE_STRIP,
        PT_TRIANGLE_FAN
    };

    enum POLYGON_MODE {
        PM_FILLED,
        PM_WIREFRAME,
        PM_POINTS
    };

    enum CULL_MODE {
        CM_FRONT_FACE,
        CM_BACK_FACE,
        CM_BOTH_FACES
    };

    enum FRONT_FACE_MODE {
        FFM_CLOCKWISE,
        FFM_COUNTER_CLOCKWISE
    };

    enum COMPARE_OP {
        CO_NEVER,
        CO_ALWAYS,
        CO_LESS,
        CO_LESS_OR_EQUAL,
        CO_GREATER,
        CO_GREATER_OR_EQUAL,
        CO_EQUAL,
        CO_NOT_EQUAL
    };

    enum BLEND_FACTOR {
        BF_ZERO,
        BF_ONE,
        BF_SRC_COLOR,
        BF_ONE_MINUS_SRC_COLOR,
        BF_DST_COLOR,
        BF_ONE_MINUS_DST_COLOR,
        BF_SRC_ALPHA,
        BF_ONE_MINUS_SRC_ALPHA,
        BF_DST_ALPHA,
        BF_ONE_MINUS_DST_ALPHA,
        BF_CONSTANT_COLOR,
        BF_ONE_MINUS_CONSTANT_COLOR,
        BF_CONSTANT_ALPHA,
        BF_ONE_MINUS_CONSTANT_ALPHA,
        BF_SRC_ALPHA_SATURATE,
        BF_SRC1_COLOR,
        BF_ONE_MINUS_SRC1_COLOR,
        BF_SRC1_ALPHA,
        BF_ONE_MINUS_SRC1_ALPHA
    };

    enum BLEND_OP {
        BO_ADD,
        BO_SUBTRACT,
        BO_REVERSE_SUBTRACT,
        BO_MIN,
        BO_MAX
    };
};