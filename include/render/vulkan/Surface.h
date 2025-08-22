#pragma once
#include <render/types.h>

#include <vulkan/vulkan.h>

namespace decomp {
    class Window;
};

namespace render {
    namespace vulkan {
        class Instance;
        class Surface {
            public:
                Surface(Instance* instance, ::decomp::Window* window);
                ~Surface();

                VkSurfaceKHR get() const;
                ::decomp::Window* getWindow() const;
                bool isInitialized() const;

                bool init();
                void shutdown();

            protected:
                Instance* m_instance;
                ::decomp::Window* m_window;
                VkSurfaceKHR m_surface;
        };
    };
};