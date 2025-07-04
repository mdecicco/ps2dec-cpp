#pragma once
#include <decomp/types.h>

namespace decomp {
    template <typename T>
    class UniquePtr {
        public:
            UniquePtr();
            UniquePtr(const UniquePtr&) = delete;
            UniquePtr& operator=(const UniquePtr&) = delete;
            ~UniquePtr();

            T* get() const;
            T* operator->() const;
            T& operator*() const;

            T* release();
            void reset(T* ptr = nullptr);

            template <typename... Args>
            static UniquePtr<T> make(Args&&... args);

        protected:
            UniquePtr(T* ptr);
            T* m_ptr;
    };
};