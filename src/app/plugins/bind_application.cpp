#include <decomp/app/application.h>

#include <bind/Namespace.hpp>
#include <bind/Registry.hpp>

#include <tspp/utils/Callback.h>
#include <tspp/utils/Docs.h>

#include <decomp/utils/event.hpp>

namespace decomp {
    void bindLoggingInterface(bind::Namespace* ns) {
        using LogFn    = void (IWithLogging::*)(const String&);
        auto getScopes = +[](IWithLogging* self) {
            Array<String> scopes;
            self->getScopes(scopes);
            return scopes;
        };

        bind::EnumTypeBuilder<utils::LogLevel> e = ns->type<utils::LogLevel>("LogLevel");
        e.addEnumValue("Debug", utils::LogLevel::Debug);
        e.addEnumValue("Info", utils::LogLevel::Info);
        e.addEnumValue("Warn", utils::LogLevel::Warn);
        e.addEnumValue("Error", utils::LogLevel::Error);
        e.addEnumValue("Fatal", utils::LogLevel::Fatal);

        bind::ObjectTypeBuilder<ILogListener> ll = ns->type<ILogListener>("ILogListener");

        bind::ObjectTypeBuilder<IWithLogging> b = ns->type<IWithLogging>("IWithLogging");
        b.baseType<ILogListener>();

        b.ctor<const String&>();
        b.dtor();

        tspp::describe(
            b.method("log", static_cast<void (IWithLogging::*)(utils::LogLevel, const String&)>(&IWithLogging::log))
        )
            .desc("Logs a message at the specified log level")
            .param(0, "level", "The log level to log at")
            .param(1, "message", "The message to log");

        tspp::describe(b.method("debug", static_cast<LogFn>(&IWithLogging::debug)))
            .desc("Logs a debug message")
            .param(0, "message", "The message to log");

        tspp::describe(b.method("info", static_cast<LogFn>(&IWithLogging::log)))
            .desc("Logs an info message")
            .param(0, "message", "The message to log");

        tspp::describe(b.method("warn", static_cast<LogFn>(&IWithLogging::warn)))
            .desc("Logs a warning message")
            .param(0, "message", "The message to log");

        tspp::describe(b.method("error", static_cast<LogFn>(&IWithLogging::error)))
            .desc("Logs an error message")
            .param(0, "message", "The message to log");

        tspp::describe(b.method("fatal", static_cast<LogFn>(&IWithLogging::fatal)))
            .desc("Logs a fatal error message")
            .param(0, "message", "The message to log");

        tspp::describe(b.method("subscribeLogListener", &IWithLogging::subscribeLogListener))
            .desc("Subscribes a log listener to the logger")
            .param(0, "listener", "The listener to subscribe");

        tspp::describe(b.method("unsubscribeLogListener", &IWithLogging::unsubscribeLogListener))
            .desc("Unsubscribes a log listener from the logger")
            .param(0, "listener", "The listener to unsubscribe");

        tspp::describe(b.method("addNestedLogger", &IWithLogging::addNestedLogger))
            .desc("Adds a nested logger to the logger")
            .param(0, "logger", "The logger to add");

        tspp::describe(b.method("removeNestedLogger", &IWithLogging::removeNestedLogger))
            .desc("Removes a nested logger from the logger")
            .param(0, "logger", "The logger to remove");

        tspp::describe(b.pseudoMethod("getScopes", getScopes))
            .desc("Gets the scopes of the logger")
            .returns("An array of scopes that may log messages through this logger");
    }

    void bindApplicationInterface(Application* application) {
        bind::Namespace* ns = new bind::Namespace("decompiler");
        bind::Registry::Add(ns);

        bindLoggingInterface(ns);

        bind::ObjectTypeBuilder<Application> builder = ns->type<Application>("Application");

        builder.baseType<utils::IWithLogging>();

        bind::DataType::Property& onInitialized = builder.pseudoMethod(
            "onInitialized",
            +[](Application* self, void (*callback)()) {
                return self->onInitialized.addListener(callback, true, true);
            }
        );

        bind::DataType::Property& offInitialized = builder.pseudoMethod(
            "offInitialized",
            +[](Application* self, EventListenerId id) {
                self->onInitialized.removeListener(id);
            }
        );

        bind::DataType::Property& onShutdownRequested = builder.pseudoMethod(
            "onShutdownRequested",
            +[](Application* self, void (*callback)()) {
                return self->onShutdownRequested.addListener(callback, false, true);
            }
        );

        bind::DataType::Property& offShutdownRequested = builder.pseudoMethod(
            "offShutdownRequested",
            +[](Application* self, EventListenerId id) {
                self->onShutdownRequested.removeListener(id);
            }
        );

        bind::DataType::Property& onService = builder.pseudoMethod(
            "onService",
            +[](Application* self, void (*callback)()) {
                return self->onService.addListener(callback, false, true);
            }
        );

        bind::DataType::Property& offService = builder.pseudoMethod(
            "offService",
            +[](Application* self, EventListenerId id) {
                self->onService.removeListener(id);
            }
        );

        ns->value("decompiler", application);

        tspp::describe(onInitialized)
            .desc("Adds an event listener callback that will be called when the application finishes initializing")
            .param(0, "callback", "The callback to call")
            .returns("The ID of the listener that was added");

        tspp::describe(offInitialized)
            .desc("Removes an event listener callback that was added with onInitialized")
            .param(0, "id", "The ID of the listener to remove");

        tspp::describe(onShutdownRequested)
            .desc(
                "Adds an event listener callback that will be called when the application is requested to shut down, "
                "before any shutdown logic is executed"
            )
            .param(0, "callback", "The callback to call")
            .returns("The ID of the listener that was added");

        tspp::describe(offShutdownRequested)
            .desc("Removes an event listener callback that was added with onShutdownRequested")
            .param(0, "id", "The ID of the listener to remove");
    }
}