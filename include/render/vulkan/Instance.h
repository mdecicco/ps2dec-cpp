#pragma once
#include <render/types.h>

#include <utils/Array.h>
#include <utils/String.h>
#include <utils/interfaces/IWithLogging.h>
#include <vulkan/vulkan.h>

namespace utils {
    class GeneralAllocator;
};

namespace render {
    namespace vulkan {
        class Instance : public decomp::IWithLogging {
            public:
                Instance();
                ~Instance();

                void enableValidation();
                void setApplicationName(const String& name);
                void setApplicationVersion(u32 major, u32 minor, u32 patch);
                void setEngineName(const String& name);
                void setEngineVersion(u32 major, u32 minor, u32 patch);
                bool enableExtension(const String& name);
                bool enableLayer(const String& name);
                bool isExtensionAvailable(const String& name) const;
                bool isLayerAvailable(const String& name) const;
                bool isExtensionEnabled(const String& name) const;
                bool isLayerEnabled(const String& name) const;
                bool isValidationEnabled() const;

                bool isInitialized() const;
                bool initialize();
                void shutdown(bool doResetConfiguration);

                bool onLogMessage(
                    VkDebugUtilsMessageSeverityFlagBitsEXT messageSeverity,
                    VkDebugUtilsMessageTypeFlagsEXT messageType,
                    const VkDebugUtilsMessengerCallbackDataEXT* pCallbackData
                );

                VkInstance get();
                const VkAllocationCallbacks* getAllocator() const;

            protected:
                bool m_isInitialized;
                VkInstance m_instance;
                VkAllocationCallbacks m_allocatorCallbacks;
                VkDebugUtilsMessengerEXT m_logger;

                bool m_validationEnabled;
                bool m_canInterceptLogs;
                String m_applicationName;
                String m_engineName;
                u32 m_applicationVersion;
                u32 m_engineVersion;
                Array<VkExtensionProperties> m_availableExtensions;
                Array<VkLayerProperties> m_availableLayers;
                Array<String> m_enabledExtensions;
                Array<String> m_enabledLayers;
        };
    };
};