#include <decomp/app/plugins/scripting.h>
#include <decomp/io/file.h>
#include <tspp/tspp.h>
#include <utils/Exception.h>

#include <filesystem>

namespace decomp {
    ScriptingPlugin::ScriptingPlugin(Application* application) : IPlugin("ScriptPlugin") {
        m_application = application;

        bind::Registry::Create();
        tspp::RuntimeConfig config;
        config.scriptConfig.enableDebugger = true;
        m_runtime                          = new tspp::Runtime(config);
        addNestedLogger(m_runtime);
    }

    ScriptingPlugin::~ScriptingPlugin() {
        delete m_runtime;
        // bind::Registry::Destroy();
    }

    void ScriptingPlugin::initPlugin() {
        if (!m_runtime->initialize()) {
            throw GenericException("Failed to initialize script runtime");
        }

        bindInterface();

        m_runtime->commitBindings();

        initializeScriptedPlugins();
    }

    void ScriptingPlugin::shutdownPlugin() {
        m_runtime->shutdown();
    }

    void ScriptingPlugin::service() {
        m_runtime->service();
    }

    void ScriptingPlugin::initializeScriptedPlugins() {
        std::filesystem::path path = std::filesystem::current_path();

        if (!m_runtime->buildProject(path.string().c_str())) {
            error("Failed to build project");
            return;
        }

        std::string buildJsPath = (path / "build.js").string();
        if (!std::filesystem::exists(buildJsPath)) {
            error("Apparently the project was built, but no build.js file was found in the output directory");
            return;
        }

        io::File* buildJsFile = io::File::open(buildJsPath, "rb");
        if (!buildJsFile) {
            error("Failed to open build.js file");
            return;
        }

        char* code = new char[buildJsFile->size() + 1];
        buildJsFile->read(code, buildJsFile->size());
        code[buildJsFile->size()] = '\0';
        io::File::close(buildJsFile);

        v8::Isolate::Scope isolateScope(m_runtime->getIsolate());
        v8::HandleScope scope(m_runtime->getIsolate());
        m_runtime->executeString(code, buildJsPath.c_str());

        v8::Local<v8::Value> exports = m_runtime->requireModule("main");
        if (exports->IsUndefined()) {
            error("Script entrypoint has no exports or failed to load");
            return;
        }

        if (!exports->IsObject()) {
            error("Script entrypoint does not export an object");
            return;
        }

        v8::Local<v8::Object> exportsObj        = exports.As<v8::Object>();
        v8::MaybeLocal<v8::Value> maybeMainFunc = exportsObj->Get(
            m_runtime->getContext(), v8::String::NewFromUtf8(m_runtime->getIsolate(), "main").ToLocalChecked()
        );

        if (maybeMainFunc.IsEmpty()) {
            error("Script entrypoint does not export a 'main' function");
            return;
        }

        v8::Local<v8::Value> mainFuncVal = maybeMainFunc.ToLocalChecked();
        if (!mainFuncVal->IsFunction()) {
            error("Script entrypoint exports 'main', but it is not a function");
            return;
        }

        v8::TryCatch tryCatch(m_runtime->getIsolate());

        v8::Local<v8::Function> mainFunc = v8::Local<v8::Function>::Cast(mainFuncVal);
        mainFunc->Call(m_runtime->getContext(), v8::Null(m_runtime->getIsolate()), 0, nullptr);

        if (tryCatch.HasCaught()) {
            error("Script entrypoint threw an error during initialization");
            v8::Local<v8::Message> message = tryCatch.Message();
            if (!message.IsEmpty()) {
                v8::String::Utf8Value messageStr(m_runtime->getIsolate(), message->Get());
                error("Error: %s", *messageStr);
            }

            v8::MaybeLocal<v8::Value> maybeStackTrace = tryCatch.StackTrace(m_runtime->getContext());
            if (!maybeStackTrace.IsEmpty()) {
                v8::MaybeLocal<v8::String> maybeStackTraceStr =
                    maybeStackTrace.ToLocalChecked()->ToString(m_runtime->getContext());
                if (!maybeStackTraceStr.IsEmpty()) {
                    v8::String::Utf8Value stackTraceStr(m_runtime->getIsolate(), maybeStackTraceStr.ToLocalChecked());
                    error("Stack trace: %s", *stackTraceStr);
                }
            }
            return;
        }
    }

    void bindApplicationInterface(Application* application);
    void bindMathInterface();
    void bindWindowInterface();
    void bindRenderInterface();
    void bindYogaInterface();
    void bindMSDFGenInterface();

    void ScriptingPlugin::bindInterface() {
        bindApplicationInterface(m_application);
        bindMathInterface();
        bindWindowInterface();
        bindRenderInterface();
        bindYogaInterface();
        bindMSDFGenInterface();
    }
}