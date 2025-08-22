#include <render/vulkan/Instance.h>
#ifdef _WIN32
#include <Windows.h>
#include <vulkan/vulkan_win32.h>
#endif

#include <utils/Array.hpp>

namespace render {
    namespace vulkan {
        void* allocMem(void* pUserData, size_t size, size_t alignment, VkSystemAllocationScope allocationScope) {
            // todo
            Instance* vi = (Instance*)pUserData;
            void* result = nullptr;

#ifdef _WIN32
            result = _aligned_malloc(size, alignment);
#else
            abort();
#endif

            return result;
        }

        void* reallocMem(
            void* pUserData, void* pOriginal, size_t size, size_t alignment, VkSystemAllocationScope allocationScope
        ) {
            // todo
            Instance* vi = (Instance*)pUserData;
            void* result = nullptr;

#ifdef _WIN32
            result = _aligned_realloc(pOriginal, size, alignment);
#else
            abort();
#endif

            return result;
        }

        void freeMem(void* pUserData, void* pMemory) {
            // todo
            Instance* vi = (Instance*)pUserData;

#ifdef _WIN32
            _aligned_free(pMemory);
#else
            abort();
#endif
        }

        void internalAllocNotify(
            void* pUserData,
            size_t size,
            VkInternalAllocationType allocationType,
            VkSystemAllocationScope allocationScope
        ) {
            // todo
            Instance* vi = (Instance*)pUserData;
        }

        void internalFreeNotify(
            void* pUserData,
            size_t size,
            VkInternalAllocationType allocationType,
            VkSystemAllocationScope allocationScope
        ) {
            // todo
            Instance* vi = (Instance*)pUserData;
        }

        VKAPI_ATTR VkBool32 VKAPI_CALL vulkanLog(
            VkDebugUtilsMessageSeverityFlagBitsEXT messageSeverity,
            VkDebugUtilsMessageTypeFlagsEXT messageType,
            const VkDebugUtilsMessengerCallbackDataEXT* pCallbackData,
            void* pUserData
        ) {
            Instance* vi = (Instance*)pUserData;
            return vi->onLogMessage(messageSeverity, messageType, pCallbackData) ? VK_TRUE : VK_FALSE;
        }

        Instance::Instance() : decomp::IWithLogging("Vulkan") {
            m_instance           = {};
            m_logger             = {};
            m_allocatorCallbacks = {};

            m_allocatorCallbacks.pfnAllocation         = allocMem;
            m_allocatorCallbacks.pfnReallocation       = reallocMem;
            m_allocatorCallbacks.pfnFree               = freeMem;
            m_allocatorCallbacks.pfnInternalAllocation = internalAllocNotify;
            m_allocatorCallbacks.pfnInternalFree       = internalFreeNotify;
            m_allocatorCallbacks.pUserData             = this;

            m_isInitialized      = false;
            m_validationEnabled  = false;
            m_canInterceptLogs   = false;
            m_applicationName    = "Untitled";
            m_engineName         = "None";
            m_applicationVersion = VK_MAKE_VERSION(1, 0, 0);
            m_engineVersion      = VK_MAKE_VERSION(1, 0, 0);

            u32 count = 0;
            vkEnumerateInstanceExtensionProperties(nullptr, &count, nullptr);
            if (count > 0) {
                m_availableExtensions.reserve(count, true);
                vkEnumerateInstanceExtensionProperties(nullptr, &count, m_availableExtensions.data());
            }

            count = 0;
            vkEnumerateInstanceLayerProperties(&count, nullptr);
            if (count > 0) {
                m_availableLayers.reserve(count, true);
                vkEnumerateInstanceLayerProperties(&count, m_availableLayers.data());
            }
        }

        Instance::~Instance() {
            shutdown(false);
        }

        void Instance::enableValidation() {
            if (m_isInitialized || m_validationEnabled) {
                return;
            }

            if (enableExtension(VK_EXT_DEBUG_UTILS_EXTENSION_NAME)) {
                m_canInterceptLogs = true;
            }

            if (enableLayer("VK_LAYER_KHRONOS_validation")) {
                m_validationEnabled = true;
            }
        }

        void Instance::setApplicationName(const String& name) {
            if (m_isInitialized) {
                return;
            }
            m_applicationName = name;
        }

        void Instance::setApplicationVersion(u32 major, u32 minor, u32 patch) {
            if (m_isInitialized) {
                return;
            }
            m_applicationVersion = VK_MAKE_VERSION(major, minor, patch);
        }

        void Instance::setEngineName(const String& name) {
            if (m_isInitialized) {
                return;
            }
            m_engineName = name;
        }

        void Instance::setEngineVersion(u32 major, u32 minor, u32 patch) {
            if (m_isInitialized) {
                return;
            }
            m_engineVersion = VK_MAKE_VERSION(major, minor, patch);
        }

        bool Instance::enableExtension(const String& name) {
            if (m_isInitialized) {
                return false;
            }

            if (isExtensionEnabled(name)) {
                return true;
            }
            if (!isExtensionAvailable(name)) {
                return false;
            }

            m_enabledExtensions.push(name);
            return true;
        }

        bool Instance::enableLayer(const String& name) {
            if (m_isInitialized) {
                return false;
            }

            if (isLayerEnabled(name)) {
                return true;
            }
            if (!isLayerAvailable(name)) {
                return false;
            }

            m_enabledLayers.push(name);
            return true;
        }

        bool Instance::isExtensionAvailable(const String& name) const {
            for (u32 i = 0; i < m_availableExtensions.size(); i++) {
                if (name == m_availableExtensions[i].extensionName) {
                    return true;
                }
            }

            return false;
        }

        bool Instance::isLayerAvailable(const String& name) const {
            constexpr size_t nameLen = sizeof(VkLayerProperties::layerName);
            for (u32 i = 0; i < m_availableLayers.size(); i++) {
                if (name == m_availableLayers[i].layerName) {
                    return true;
                }
            }

            return false;
        }

        bool Instance::isExtensionEnabled(const String& name) const {
            for (u32 i = 0; i < m_enabledExtensions.size(); i++) {
                if (name == m_enabledExtensions[i]) {
                    return true;
                }
            }

            return false;
        }

        bool Instance::isLayerEnabled(const String& name) const {
            for (u32 i = 0; i < m_enabledLayers.size(); i++) {
                if (name == m_enabledLayers[i]) {
                    return true;
                }
            }

            return false;
        }

        bool Instance::isValidationEnabled() const {
            return m_validationEnabled;
        }

        bool Instance::isInitialized() const {
            return m_isInitialized;
        }

        bool Instance::initialize() {
            VkApplicationInfo info  = {};
            info.sType              = VK_STRUCTURE_TYPE_APPLICATION_INFO;
            info.pApplicationName   = m_applicationName.c_str();
            info.applicationVersion = m_applicationVersion;
            info.pEngineName        = m_engineName.c_str();
            info.engineVersion      = m_engineVersion;
            info.apiVersion         = VK_API_VERSION_1_3;

            if (!enableExtension(VK_KHR_SURFACE_EXTENSION_NAME)) {
                return false;
            }

#ifdef _WIN32
            if (!enableExtension(VK_KHR_WIN32_SURFACE_EXTENSION_NAME)) {
                return false;
            }
#endif

            Array<const char*> enabledExtensions;
            enabledExtensions.reserve(m_enabledExtensions.size());
            for (u32 i = 0; i < m_enabledExtensions.size(); i++) {
                enabledExtensions.push(m_enabledExtensions[i].c_str());
            }

            Array<const char*> enabledLayers;
            enabledLayers.reserve(m_enabledLayers.size());
            for (u32 i = 0; i < m_enabledLayers.size(); i++) {
                enabledLayers.push(m_enabledLayers[i].c_str());
            }

            VkInstanceCreateInfo ci    = {};
            ci.sType                   = VK_STRUCTURE_TYPE_INSTANCE_CREATE_INFO;
            ci.pApplicationInfo        = &info;
            ci.enabledExtensionCount   = enabledExtensions.size();
            ci.ppEnabledExtensionNames = enabledExtensions.data();
            ci.enabledLayerCount       = enabledLayers.size();
            ci.ppEnabledLayerNames     = enabledLayers.data();

            VkResult r;

            r = vkCreateInstance(&ci, &m_allocatorCallbacks, &m_instance);
            if (r != VK_SUCCESS) {
                return false;
            }

            if (m_canInterceptLogs) {
                VkDebugUtilsMessengerCreateInfoEXT mi = {};
                mi.sType                              = VK_STRUCTURE_TYPE_DEBUG_UTILS_MESSENGER_CREATE_INFO_EXT;
                mi.messageSeverity                    = VK_DEBUG_UTILS_MESSAGE_SEVERITY_VERBOSE_BIT_EXT |
                                     VK_DEBUG_UTILS_MESSAGE_SEVERITY_WARNING_BIT_EXT |
                                     VK_DEBUG_UTILS_MESSAGE_SEVERITY_ERROR_BIT_EXT;
                mi.messageType = VK_DEBUG_UTILS_MESSAGE_TYPE_GENERAL_BIT_EXT |
                                 VK_DEBUG_UTILS_MESSAGE_TYPE_VALIDATION_BIT_EXT |
                                 VK_DEBUG_UTILS_MESSAGE_TYPE_PERFORMANCE_BIT_EXT;
                mi.pfnUserCallback = vulkanLog;
                mi.pUserData       = this;

                auto createMessenger = (PFN_vkCreateDebugUtilsMessengerEXT
                )vkGetInstanceProcAddr(m_instance, "vkCreateDebugUtilsMessengerEXT");
                if (!createMessenger) {
                    vkDestroyInstance(m_instance, &m_allocatorCallbacks);
                    m_instance = {};
                    return false;
                }

                // Just in case...
                auto destroyMessenger = (PFN_vkDestroyDebugUtilsMessengerEXT
                )vkGetInstanceProcAddr(m_instance, "vkDestroyDebugUtilsMessengerEXT");
                if (!destroyMessenger) {
                    vkDestroyInstance(m_instance, &m_allocatorCallbacks);
                    m_instance = {};
                    return false;
                }

                r = createMessenger(m_instance, &mi, &m_allocatorCallbacks, &m_logger);
                if (r != VK_SUCCESS) {
                    vkDestroyInstance(m_instance, &m_allocatorCallbacks);
                    m_instance = {};
                    return false;
                }
            }

            m_isInitialized = true;
            return true;
        }

        void Instance::shutdown(bool doResetConfiguration) {
            if (doResetConfiguration) {
                m_validationEnabled  = false;
                m_applicationName    = "Untitled";
                m_engineName         = "None";
                m_applicationVersion = VK_MAKE_VERSION(1, 0, 0);
                m_engineVersion      = VK_MAKE_VERSION(1, 0, 0);
                m_enabledExtensions.clear();
                m_enabledLayers.clear();
            }

            if (!m_isInitialized) {
                return;
            }

            if (m_validationEnabled && m_canInterceptLogs) {
                auto destroyMessenger = (PFN_vkDestroyDebugUtilsMessengerEXT
                )vkGetInstanceProcAddr(m_instance, "vkDestroyDebugUtilsMessengerEXT");
                if (destroyMessenger) {
                    destroyMessenger(m_instance, m_logger, &m_allocatorCallbacks);
                    m_logger = {};
                }
            }

            vkDestroyInstance(m_instance, &m_allocatorCallbacks);
            m_isInitialized = false;
            m_instance      = {};
        }

        bool Instance::onLogMessage(
            VkDebugUtilsMessageSeverityFlagBitsEXT messageSeverity,
            VkDebugUtilsMessageTypeFlagsEXT messageType,
            const VkDebugUtilsMessengerCallbackDataEXT* pCallbackData
        ) {
            decomp::LogLevel level = decomp::LogLevel::Info;
            if (messageSeverity & VK_DEBUG_UTILS_MESSAGE_SEVERITY_VERBOSE_BIT_EXT) {
                level = decomp::LogLevel::Info;
            } else if (messageSeverity & VK_DEBUG_UTILS_MESSAGE_SEVERITY_INFO_BIT_EXT) {
                level = decomp::LogLevel::Info;
            } else if (messageSeverity & VK_DEBUG_UTILS_MESSAGE_SEVERITY_WARNING_BIT_EXT) {
                level = decomp::LogLevel::Warn;
            } else if (messageSeverity & VK_DEBUG_UTILS_MESSAGE_SEVERITY_ERROR_BIT_EXT) {
                level = decomp::LogLevel::Error;
            }

            decomp::String msg;
            if (messageType & VK_DEBUG_UTILS_MESSAGE_TYPE_GENERAL_BIT_EXT) {
                msg += "[GENERAL]";
            }
            if (messageType & VK_DEBUG_UTILS_MESSAGE_TYPE_VALIDATION_BIT_EXT) {
                msg += "[VALIDATION]";
            }
            if (messageType & VK_DEBUG_UTILS_MESSAGE_TYPE_PERFORMANCE_BIT_EXT) {
                msg += "[PERFORMANCE]";
            }
            if (messageType & VK_DEBUG_UTILS_MESSAGE_TYPE_DEVICE_ADDRESS_BINDING_BIT_EXT) {
                msg += "[DEVICE_ADDRESS_BINDING]";
            }

            msg += " ";
            msg += pCallbackData->pMessage;

            log(level, msg);

            return false;
        }

        VkInstance Instance::get() {
            if (!m_isInitialized) {
                return nullptr;
            }
            return m_instance;
        }

        const VkAllocationCallbacks* Instance::getAllocator() const {
            if (!m_isInitialized) {
                return nullptr;
            }
            return &m_allocatorCallbacks;
        }
    };
};