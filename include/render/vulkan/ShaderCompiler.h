#pragma once
#include <render/types.h>

#include <glslang/Public/ShaderLang.h>
#include <utils/String.h>
#include <utils/interfaces/IWithLogging.h>

namespace render {
    namespace vulkan {
        class LogicalDevice;
        class ShaderCompiler : public decomp::IWithLogging {
            public:
                ShaderCompiler(LogicalDevice* device);
                ~ShaderCompiler();

                bool init();
                void shutdown();

                glslang::TShader* compileShader(const String& source, EShLanguage type);

            protected:
                LogicalDevice* m_device;
                bool m_isInitialized;
        };
    };
};