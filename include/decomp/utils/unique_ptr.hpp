#pragma once
#include <decomp/utils/unique_ptr.h>

namespace decomp {
    template <typename T>
    UniquePtr<T>::UniquePtr(T* ptr) : m_ptr(ptr) {}

    template <typename T>
    UniquePtr<T>::UniquePtr() : m_ptr(nullptr) {}

    template <typename T>
    UniquePtr<T>::~UniquePtr() {
        if (m_ptr != nullptr) {
            delete m_ptr;
        }
    }

    template <typename T>
    T* UniquePtr<T>::get() const {
        return m_ptr;
    }

    template <typename T>
    T* UniquePtr<T>::operator->() const {
        return m_ptr;
    }

    template <typename T>
    T& UniquePtr<T>::operator*() const {
        return *m_ptr;
    }

    template <typename T>
    T* UniquePtr<T>::release() {
        T* ptr = m_ptr;
        m_ptr = nullptr;
        return ptr;
    }

    template <typename T>
    void UniquePtr<T>::reset(T* ptr) {
        if (m_ptr != nullptr) {
            delete m_ptr;
        }

        m_ptr = ptr;
    }

    template <typename T>
    template <typename... Args>
    UniquePtr<T> UniquePtr<T>::make(Args&&... args) {
        return UniquePtr<T>(new T(std::forward<Args>(args)...));
    }
};