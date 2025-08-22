#include <decomp/app/application.h>

#include <bind/Namespace.hpp>
#include <bind/Registry.hpp>

#include <tspp/utils/Docs.h>

#include <decomp/utils/math.hpp>

namespace decomp {
    template <typename T>
    void bindVec2(bind::Namespace* ns, const char* name) {
        bind::ObjectTypeBuilder<vec2<T>> v2 = ns->type<vec2<T>>(name);
        tspp::describe(v2.ctor()).desc("Constructs a new vec2 object with all components set to 0.0");
        tspp::describe(v2.ctor<T, T>())
            .param(0, "x", "The x component of the vector")
            .param(1, "y", "The y component of the vector");
        tspp::describe(v2.ctor<const vec2<T>&>()).param(0, "v", "The vec2 object to copy from");
        v2.prop("x", &vec2<T>::x);
        v2.prop("y", &vec2<T>::y);
        v2.pseudoMethod(
            "toString",
            +[](vec2<T>* self) {
                if constexpr (std::is_floating_point_v<T>) {
                    return utils::String::Format("vec2(%f, %f)", self->x, self->y);
                } else if constexpr (std::is_unsigned_v<T>) {
                    return utils::String::Format("vec2(%u, %u)", self->x, self->y);
                } else {
                    return utils::String::Format("vec2(%d, %d)", self->x, self->y);
                }
            }
        );
    }

    template <typename T>
    void bindVec3(bind::Namespace* ns, const char* name) {
        bind::ObjectTypeBuilder<vec3<T>> v3 = ns->type<vec3<T>>(name);
        tspp::describe(v3.ctor()).desc("Constructs a new vec3 object with all components set to 0.0");
        tspp::describe(v3.ctor<T, T, T>())
            .param(0, "x", "The x component of the vector")
            .param(1, "y", "The y component of the vector")
            .param(2, "z", "The z component of the vector");
        tspp::describe(v3.ctor<const vec3<T>&>()).param(0, "v", "The vec3 object to copy from");
        v3.prop("x", &vec3<T>::x);
        v3.prop("y", &vec3<T>::y);
        v3.prop("z", &vec3<T>::z);
        v3.pseudoMethod(
            "toString",
            +[](vec3<T>* self) {
                if constexpr (std::is_floating_point_v<T>) {
                    return utils::String::Format("vec3(%f, %f, %f)", self->x, self->y, self->z);
                } else if constexpr (std::is_unsigned_v<T>) {
                    return utils::String::Format("vec3(%u, %u, %u)", self->x, self->y, self->z);
                } else {
                    return utils::String::Format("vec3(%d, %d, %d)", self->x, self->y, self->z);
                }
            }
        );
    }

    template <typename T>
    void bindVec4(bind::Namespace* ns, const char* name) {
        bind::ObjectTypeBuilder<vec4<T>> v4 = ns->type<vec4<T>>(name);
        tspp::describe(v4.ctor()).desc("Constructs a new vec4 object with all components set to 0.0");
        tspp::describe(v4.ctor<T, T, T, T>())
            .param(0, "x", "The x component of the vector")
            .param(1, "y", "The y component of the vector")
            .param(2, "z", "The z component of the vector")
            .param(3, "w", "The w component of the vector");
        tspp::describe(v4.ctor<const vec3<T>&>())
            .param(0, "xyz", "The vec3 object to copy the x, y, and z components from (w is set to 0)");
        tspp::describe(v4.ctor<const vec3<T>&, T>())
            .param(0, "xyz", "The vec3 object to copy the x, y, and z components from")
            .param(1, "w", "The w component of the vector");
        tspp::describe(v4.ctor<const vec4<T>&>()).param(0, "v", "The vec4 object to copy from");

        v4.prop("x", &vec4<T>::x);
        v4.prop("y", &vec4<T>::y);
        v4.prop("z", &vec4<T>::z);
        v4.prop("w", &vec4<T>::w);
        v4.pseudoMethod(
            "toString",
            +[](vec4<T>* self) {
                if constexpr (std::is_floating_point_v<T>) {
                    return utils::String::Format("vec4(%f, %f, %f, %f)", self->x, self->y, self->z, self->w);
                } else if constexpr (std::is_unsigned_v<T>) {
                    return utils::String::Format("vec4(%u, %u, %u, %u)", self->x, self->y, self->z, self->w);
                } else {
                    return utils::String::Format("vec4(%d, %d, %d, %d)", self->x, self->y, self->z, self->w);
                }
            }
        );
    }

    template <typename T>
    void bindQuat(bind::Namespace* ns, const char* name) {
        bind::ObjectTypeBuilder<quat<T>> quat_t = ns->type<quat<T>>(name);
        tspp::describe(quat_t.ctor()).desc("Constructs a new quaternion object with all components set to 0.0");
        tspp::describe(quat_t.ctor<T, T, T, T>())
            .param(0, "x", "The x component of the quaternion")
            .param(1, "y", "The y component of the quaternion")
            .param(2, "z", "The z component of the quaternion")
            .param(3, "angle", "The angle of the quaternion");
        tspp::describe(quat_t.ctor<const quat<T>&>()).param(0, "q", "The quaternion object to copy from");

        quat_t.prop("axis", &quat<T>::axis);
        quat_t.prop("angle", &quat<T>::angle);
        quat_t.pseudoMethod(
            "toString",
            +[](quat<T>* self) {
                return utils::String::Format(
                    "quat(axis: %f, %f, %f, angle: %f)", self->axis.x, self->axis.y, self->axis.z, self->angle
                );
            }
        );
    }

    template <typename T>
    void bindMat2(bind::Namespace* ns, const char* name) {
        bind::ObjectTypeBuilder<mat2<T>> mat = ns->type<mat2<T>>(name);
        tspp::describe(mat.ctor()).desc("Constructs a new mat2 object, identity matrix by default");
        tspp::describe(mat.ctor<T, T, T, T>())
            .param(0, "xx", "The x.x component of the matrix")
            .param(1, "xy", "The x.y component of the matrix")
            .param(2, "yx", "The y.x component of the matrix")
            .param(3, "yy", "The y.y component of the matrix");
        tspp::describe(mat.ctor<const vec2<T>&, const vec2<T>&>())
            .param(0, "x", "The x component of the matrix")
            .param(1, "y", "The y component of the matrix");
        tspp::describe(mat.ctor<const mat2<T>&>()).param(0, "m", "The mat2 object to copy from");

        mat.prop("x", &mat2<T>::x);
        mat.prop("y", &mat2<T>::y);

        mat.pseudoMethod(
            "toString",
            +[](mat2<T>* self) {
                return utils::String::Format("mat2(%f, %f, %f, %f)", self->x.x, self->x.y, self->y.x, self->y.y);
            }
        );
    }

    template <typename T>
    void bindMat3(bind::Namespace* ns, const char* name) {
        bind::ObjectTypeBuilder<mat3<T>> mat = ns->type<mat3<T>>(name);
        tspp::describe(mat.ctor()).desc("Constructs a new mat3 object, identity matrix by default");
        tspp::describe(mat.ctor<T, T, T, T, T, T, T, T, T>())
            .param(0, "xx", "The x.x component of the matrix")
            .param(1, "xy", "The x.y component of the matrix")
            .param(2, "xz", "The x.z component of the matrix")
            .param(3, "yx", "The y.x component of the matrix")
            .param(4, "yy", "The y.y component of the matrix")
            .param(5, "yz", "The y.z component of the matrix")
            .param(6, "zx", "The z.x component of the matrix")
            .param(7, "zy", "The z.y component of the matrix")
            .param(8, "zz", "The z.z component of the matrix");
        tspp::describe(mat.ctor<const vec3<T>&, const vec3<T>&, const vec3<T>&>())
            .param(0, "x", "The x component of the matrix")
            .param(1, "y", "The y component of the matrix")
            .param(2, "z", "The z component of the matrix");
        tspp::describe(mat.ctor<const mat3<T>&>()).param(0, "m", "The mat3 object to copy from");
        tspp::describe(mat.ctor<const quat<T>&>())
            .desc("Constructs a new mat3 object using the provided quaternion object")
            .param(0, "q", "The quaternion object to generate the matrix from");

        mat.prop("x", &mat3<T>::x);
        mat.prop("y", &mat3<T>::y);
        mat.prop("z", &mat3<T>::z);

        mat.pseudoMethod(
            "toString",
            +[](mat3<T>* self) {
                return utils::String::Format(
                    "mat3(%f, %f, %f, %f, %f, %f, %f, %f, %f)",
                    self->x.x,
                    self->x.y,
                    self->x.z,
                    self->y.x,
                    self->y.y,
                    self->y.z,
                    self->z.x,
                    self->z.y,
                    self->z.z
                );
            }
        );
    }

    template <typename T>
    void bindMat4(bind::Namespace* ns, const char* name) {
        bind::ObjectTypeBuilder<mat4<T>> mat = ns->type<mat4<T>>(name);
        tspp::describe(mat.ctor()).desc("Constructs a new mat4 object, identity matrix by default");
        tspp::describe(mat.ctor<T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, T>())
            .param(0, "xx", "The x.x component of the matrix")
            .param(1, "xy", "The x.y component of the matrix")
            .param(2, "xz", "The x.z component of the matrix")
            .param(3, "xw", "The x.w component of the matrix")
            .param(4, "yx", "The y.x component of the matrix")
            .param(5, "yy", "The y.y component of the matrix")
            .param(6, "yz", "The y.z component of the matrix")
            .param(7, "yw", "The y.w component of the matrix")
            .param(8, "zx", "The z.x component of the matrix")
            .param(9, "zy", "The z.y component of the matrix")
            .param(10, "zz", "The z.z component of the matrix")
            .param(11, "zw", "The z.w component of the matrix")
            .param(12, "wx", "The w.x component of the matrix")
            .param(13, "wy", "The w.y component of the matrix")
            .param(14, "wz", "The w.z component of the matrix")
            .param(15, "ww", "The w.w component of the matrix");
        tspp::describe(mat.ctor<const vec4<T>&, const vec4<T>&, const vec4<T>&, const vec4<T>&>())
            .param(0, "x", "The x component of the matrix")
            .param(1, "y", "The y component of the matrix")
            .param(2, "z", "The z component of the matrix")
            .param(3, "w", "The w component of the matrix");
        tspp::describe(mat.ctor<const mat4<T>&>()).param(0, "m", "The mat4 object to copy from");
        tspp::describe(mat.ctor<const mat3<T>&>())
            .desc("Constructs a new mat4 object using the provided mat3 object as the upper left 3x3")
            .param(0, "m", "The upper left 3x3 of the matrix");
        tspp::describe(mat.ctor<const quat<T>&>())
            .desc("Constructs a new mat4 object using the provided quaternion object to generate the basis")
            .param(0, "q", "The quaternion object to generate the basis from");

        mat.prop("x", &mat4<T>::x);
        mat.prop("y", &mat4<T>::y);
        mat.prop("z", &mat4<T>::z);
        mat.prop("w", &mat4<T>::w);

        mat.pseudoMethod(
            "toString",
            +[](mat4<T>* self) {
                return utils::String::Format(
                    "mat4(%f, %f, %f, %f, %f, %f, %f, %f, %f, %f, %f, %f, %f, %f, %f, %f)",
                    self->x.x,
                    self->x.y,
                    self->x.z,
                    self->x.w,
                    self->y.x,
                    self->y.y,
                    self->y.z,
                    self->y.w,
                    self->z.x,
                    self->z.y,
                    self->z.z,
                    self->z.w,
                    self->w.x,
                    self->w.y,
                    self->w.z,
                    self->w.w
                );
            }
        );
    }

    void bindMathInterface() {
        bind::Namespace* ns = new bind::Namespace("math");
        bind::Registry::Add(ns);

        bindVec2<i32>(ns, "vec2i");
        bindVec2<u32>(ns, "vec2ui");
        bindVec2<f32>(ns, "vec2f");
        bindVec2<f64>(ns, "vec2d");
        bindVec3<i32>(ns, "vec3i");
        bindVec3<u32>(ns, "vec3ui");
        bindVec3<f32>(ns, "vec3f");
        bindVec3<f64>(ns, "vec3d");
        bindVec4<i32>(ns, "vec4i");
        bindVec4<u32>(ns, "vec4ui");
        bindVec4<f32>(ns, "vec4f");
        bindVec4<f64>(ns, "vec4d");
        bindQuat<f32>(ns, "quatf");
        bindQuat<f64>(ns, "quatd");
        bindMat2<f32>(ns, "mat2f");
        bindMat2<f64>(ns, "mat2d");
        bindMat3<f32>(ns, "mat3f");
        bindMat3<f64>(ns, "mat3d");
        bindMat4<f32>(ns, "mat4f");
        bindMat4<f64>(ns, "mat4d");
    }
}