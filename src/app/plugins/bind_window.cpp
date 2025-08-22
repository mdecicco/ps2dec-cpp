#include <decomp/app/application.h>
#include <decomp/app/window.h>
#include <decomp/utils/event.hpp>

#include <bind/Namespace.hpp>
#include <bind/Registry.hpp>

#include <tspp/utils/Callback.h>
#include <tspp/utils/Docs.h>

namespace decomp {
    void bindKeyboardKeyEnum() {
        bind::EnumTypeBuilder<KeyboardKey> keyboardKey = bind::type<KeyboardKey>("KeyboardKey");
        tspp::describe(keyboardKey.getType()).desc("An enum representing a keyboard key");

        keyboardKey.addEnumValue("None", KeyboardKey::None);
        keyboardKey.addEnumValue("_0", KeyboardKey::_0);
        keyboardKey.addEnumValue("_1", KeyboardKey::_1);
        keyboardKey.addEnumValue("_2", KeyboardKey::_2);
        keyboardKey.addEnumValue("_3", KeyboardKey::_3);
        keyboardKey.addEnumValue("_4", KeyboardKey::_4);
        keyboardKey.addEnumValue("_5", KeyboardKey::_5);
        keyboardKey.addEnumValue("_6", KeyboardKey::_6);
        keyboardKey.addEnumValue("_7", KeyboardKey::_7);
        keyboardKey.addEnumValue("_8", KeyboardKey::_8);
        keyboardKey.addEnumValue("_9", KeyboardKey::_9);
        keyboardKey.addEnumValue("A", KeyboardKey::A);
        keyboardKey.addEnumValue("B", KeyboardKey::B);
        keyboardKey.addEnumValue("C", KeyboardKey::C);
        keyboardKey.addEnumValue("D", KeyboardKey::D);
        keyboardKey.addEnumValue("E", KeyboardKey::E);
        keyboardKey.addEnumValue("F", KeyboardKey::F);
        keyboardKey.addEnumValue("G", KeyboardKey::G);
        keyboardKey.addEnumValue("H", KeyboardKey::H);
        keyboardKey.addEnumValue("I", KeyboardKey::I);
        keyboardKey.addEnumValue("J", KeyboardKey::J);
        keyboardKey.addEnumValue("K", KeyboardKey::K);
        keyboardKey.addEnumValue("L", KeyboardKey::L);
        keyboardKey.addEnumValue("M", KeyboardKey::M);
        keyboardKey.addEnumValue("N", KeyboardKey::N);
        keyboardKey.addEnumValue("O", KeyboardKey::O);
        keyboardKey.addEnumValue("P", KeyboardKey::P);
        keyboardKey.addEnumValue("Q", KeyboardKey::Q);
        keyboardKey.addEnumValue("R", KeyboardKey::R);
        keyboardKey.addEnumValue("S", KeyboardKey::S);
        keyboardKey.addEnumValue("T", KeyboardKey::T);
        keyboardKey.addEnumValue("U", KeyboardKey::U);
        keyboardKey.addEnumValue("V", KeyboardKey::V);
        keyboardKey.addEnumValue("W", KeyboardKey::W);
        keyboardKey.addEnumValue("X", KeyboardKey::X);
        keyboardKey.addEnumValue("Y", KeyboardKey::Y);
        keyboardKey.addEnumValue("Z", KeyboardKey::Z);
        keyboardKey.addEnumValue("SingleQuote", KeyboardKey::SingleQuote);
        keyboardKey.addEnumValue("Backslash", KeyboardKey::Backslash);
        keyboardKey.addEnumValue("Comma", KeyboardKey::Comma);
        keyboardKey.addEnumValue("Equal", KeyboardKey::Equal);
        keyboardKey.addEnumValue("Backtick", KeyboardKey::Backtick);
        keyboardKey.addEnumValue("LeftBracket", KeyboardKey::LeftBracket);
        keyboardKey.addEnumValue("Minus", KeyboardKey::Minus);
        keyboardKey.addEnumValue("Period", KeyboardKey::Period);
        keyboardKey.addEnumValue("RightBracket", KeyboardKey::RightBracket);
        keyboardKey.addEnumValue("Semicolon", KeyboardKey::Semicolon);
        keyboardKey.addEnumValue("Slash", KeyboardKey::Slash);
        keyboardKey.addEnumValue("Backspace", KeyboardKey::Backspace);
        keyboardKey.addEnumValue("Delete", KeyboardKey::Delete);
        keyboardKey.addEnumValue("End", KeyboardKey::End);
        keyboardKey.addEnumValue("Enter", KeyboardKey::Enter);
        keyboardKey.addEnumValue("Escape", KeyboardKey::Escape);
        keyboardKey.addEnumValue("GraveAccent", KeyboardKey::GraveAccent);
        keyboardKey.addEnumValue("Home", KeyboardKey::Home);
        keyboardKey.addEnumValue("Insert", KeyboardKey::Insert);
        keyboardKey.addEnumValue("Menu", KeyboardKey::Menu);
        keyboardKey.addEnumValue("PageDown", KeyboardKey::PageDown);
        keyboardKey.addEnumValue("PageUp", KeyboardKey::PageUp);
        keyboardKey.addEnumValue("Pause", KeyboardKey::Pause);
        keyboardKey.addEnumValue("Space", KeyboardKey::Space);
        keyboardKey.addEnumValue("Tab", KeyboardKey::Tab);
        keyboardKey.addEnumValue("CapLock", KeyboardKey::CapLock);
        keyboardKey.addEnumValue("NumLock", KeyboardKey::NumLock);
        keyboardKey.addEnumValue("ScrollLock", KeyboardKey::ScrollLock);
        keyboardKey.addEnumValue("F1", KeyboardKey::F1);
        keyboardKey.addEnumValue("F2", KeyboardKey::F2);
        keyboardKey.addEnumValue("F3", KeyboardKey::F3);
        keyboardKey.addEnumValue("F4", KeyboardKey::F4);
        keyboardKey.addEnumValue("F5", KeyboardKey::F5);
        keyboardKey.addEnumValue("F6", KeyboardKey::F6);
        keyboardKey.addEnumValue("F7", KeyboardKey::F7);
        keyboardKey.addEnumValue("F8", KeyboardKey::F8);
        keyboardKey.addEnumValue("F9", KeyboardKey::F9);
        keyboardKey.addEnumValue("F10", KeyboardKey::F10);
        keyboardKey.addEnumValue("F11", KeyboardKey::F11);
        keyboardKey.addEnumValue("F12", KeyboardKey::F12);
        keyboardKey.addEnumValue("F13", KeyboardKey::F13);
        keyboardKey.addEnumValue("F14", KeyboardKey::F14);
        keyboardKey.addEnumValue("F15", KeyboardKey::F15);
        keyboardKey.addEnumValue("F16", KeyboardKey::F16);
        keyboardKey.addEnumValue("F17", KeyboardKey::F17);
        keyboardKey.addEnumValue("F18", KeyboardKey::F18);
        keyboardKey.addEnumValue("F19", KeyboardKey::F19);
        keyboardKey.addEnumValue("F20", KeyboardKey::F20);
        keyboardKey.addEnumValue("F21", KeyboardKey::F21);
        keyboardKey.addEnumValue("F22", KeyboardKey::F22);
        keyboardKey.addEnumValue("F23", KeyboardKey::F23);
        keyboardKey.addEnumValue("F24", KeyboardKey::F24);
        keyboardKey.addEnumValue("LeftAlt", KeyboardKey::LeftAlt);
        keyboardKey.addEnumValue("LeftControl", KeyboardKey::LeftControl);
        keyboardKey.addEnumValue("LeftShift", KeyboardKey::LeftShift);
        keyboardKey.addEnumValue("LeftSuper", KeyboardKey::LeftSuper);
        keyboardKey.addEnumValue("PrintScreen", KeyboardKey::PrintScreen);
        keyboardKey.addEnumValue("RightAlt", KeyboardKey::RightAlt);
        keyboardKey.addEnumValue("RightControl", KeyboardKey::RightControl);
        keyboardKey.addEnumValue("RightShift", KeyboardKey::RightShift);
        keyboardKey.addEnumValue("RightSuper", KeyboardKey::RightSuper);
        keyboardKey.addEnumValue("Down", KeyboardKey::Down);
        keyboardKey.addEnumValue("Left", KeyboardKey::Left);
        keyboardKey.addEnumValue("Right", KeyboardKey::Right);
        keyboardKey.addEnumValue("Up", KeyboardKey::Up);
        keyboardKey.addEnumValue("Numpad0", KeyboardKey::Numpad0);
        keyboardKey.addEnumValue("Numpad1", KeyboardKey::Numpad1);
        keyboardKey.addEnumValue("Numpad2", KeyboardKey::Numpad2);
        keyboardKey.addEnumValue("Numpad3", KeyboardKey::Numpad3);
        keyboardKey.addEnumValue("Numpad4", KeyboardKey::Numpad4);
        keyboardKey.addEnumValue("Numpad5", KeyboardKey::Numpad5);
        keyboardKey.addEnumValue("Numpad6", KeyboardKey::Numpad6);
        keyboardKey.addEnumValue("Numpad7", KeyboardKey::Numpad7);
        keyboardKey.addEnumValue("Numpad8", KeyboardKey::Numpad8);
        keyboardKey.addEnumValue("Numpad9", KeyboardKey::Numpad9);
        keyboardKey.addEnumValue("NumpadAdd", KeyboardKey::NumpadAdd);
        keyboardKey.addEnumValue("NumpadDecimal", KeyboardKey::NumpadDecimal);
        keyboardKey.addEnumValue("NumpadDivide", KeyboardKey::NumpadDivide);
        keyboardKey.addEnumValue("NumpadEnter", KeyboardKey::NumpadEnter);
        keyboardKey.addEnumValue("NumpadEqual", KeyboardKey::NumpadEqual);
        keyboardKey.addEnumValue("NumpadMultiply", KeyboardKey::NumpadMultiply);
        keyboardKey.addEnumValue("NumpadSubtract", KeyboardKey::NumpadSubtract);
    }

    void bindMouseButtonEnum() {
        bind::EnumTypeBuilder<MouseButton> mouseButton = bind::type<MouseButton>("MouseButton");
        tspp::describe(mouseButton.getType()).desc("An enum representing a mouse button");

        mouseButton.addEnumValue("Left", MouseButton::Left);
        mouseButton.addEnumValue("Right", MouseButton::Right);
        mouseButton.addEnumValue("Middle", MouseButton::Middle);
    }

    void bindMonitorInfoType(bind::Namespace* ns) {
        bind::ObjectTypeBuilder<MonitorInfo> monitorInfo = ns->type<MonitorInfo>("MonitorInfo");
        tspp::describe(monitorInfo.getType())
            .desc("Information about a physical monitor connected to the system")
            .property("isPrimary", "Whether the monitor is the primary monitor")
            .property("virtualDimensions", "The virtual dimensions of the monitor")
            .property("actualDimensions", "The actual dimensions of the monitor")
            .property("position", "The position of the monitor")
            .property("bitsPerPixel", "The number of bits per pixel of the monitor")
            .property("refreshRate", "The refresh rate of the monitor in Hertz");

        monitorInfo.prop("isPrimary", &MonitorInfo::isPrimary);
        monitorInfo.prop("virtualDimensions", &MonitorInfo::virtualDimensions);
        monitorInfo.prop("actualDimensions", &MonitorInfo::actualDimensions);
        monitorInfo.prop("position", &MonitorInfo::position);
        monitorInfo.prop("bitsPerPixel", &MonitorInfo::bitsPerPixel);
        monitorInfo.prop("refreshRate", &MonitorInfo::refreshRate);
    }

    void bindWindowType(bind::Namespace* ns) {
        bind::ObjectTypeBuilder<Window> window = ns->type<Window>("Window");
        tspp::describe(window.ctor()).desc("Creates a new window with default settings");

        tspp::describe(window.ctor<const utils::String&>())
            .desc("Creates a new window")
            .param(0, "title", "The title of the window");

        tspp::describe(window.ctor<u32, u32>())
            .desc("Creates a new window with the specified size")
            .param(0, "width", "The width of the window")
            .param(1, "height", "The height of the window");

        tspp::describe(window.ctor<const utils::String&, u32, u32>())
            .desc("Creates a new window with the specified size and title")
            .param(0, "title", "The title of the window")
            .param(1, "width", "The width of the window")
            .param(2, "height", "The height of the window");

        tspp::describe(window.ctor<Window*>())
            .desc("Creates a new child window for a specified parent")
            .param(0, "parent", "The parent window");

        tspp::describe(window.ctor<Window*, const utils::String&>())
            .desc("Creates a new child window for a specified parent with the specified title")
            .param(0, "parent", "The parent window")
            .param(1, "title", "The title of the window");

        tspp::describe(window.ctor<Window*, const utils::String&, u32, u32>())
            .desc("Creates a new child window for a specified parent with the specified size and title")
            .param(0, "parent", "The parent window")
            .param(1, "title", "The title of the window")
            .param(2, "width", "The width of the window")
            .param(3, "height", "The height of the window");

        tspp::describe(window.method("setOpen", &Window::setOpen))
            .desc("Sets whether the window is open")
            .param(0, "open", "Whether the window should be open")
            .returns("true if the operation was successful, false otherwise");

        tspp::describe(window.method("isOpen", &Window::isOpen))
            .desc("Checks if the window is open")
            .returns("true if the window is open, false otherwise");

        tspp::describe(window.method("focus", &Window::focus))
            .desc("Focuses the window")
            .returns("true if the operation was successful, false otherwise");

        tspp::describe(window.method("isFocused", &Window::isFocused))
            .desc("Checks if the window is focused")
            .returns("true if the window is focused, false otherwise");

        tspp::describe(window.method("setBorderEnabled", &Window::setBorderEnabled))
            .desc("Sets whether the window has a border")
            .param(0, "borderEnabled", "Whether the window should have a border")
            .returns("true if the operation was successful, false otherwise");

        tspp::describe(window.method("isBorderEnabled", &Window::isBorderEnabled))
            .desc("Checks if the window has a border")
            .returns("true if the window has a border, false otherwise");

        tspp::describe(window.method("setTitle", &Window::setTitle))
            .desc("Sets the title of the window")
            .param(0, "title", "The title of the window")
            .returns("true if the operation was successful, false otherwise");

        tspp::describe(window.method("getTitle", &Window::getTitle))
            .desc("Gets the title of the window")
            .returns("The title of the window");

        tspp::describe(window.method("setSize", &Window::setSize))
            .desc("Sets the size of the window")
            .param(0, "width", "The width of the window")
            .param(1, "height", "The height of the window")
            .returns("true if the operation was successful, false otherwise");

        tspp::describe(window.method("getSize", &Window::getSize))
            .desc("Gets the size of the window")
            .returns("The size of the window");

        tspp::describe(window.method("setPosition", &Window::setPosition))
            .desc("Sets the position of the window")
            .param(0, "x", "The x-coordinate of the window")
            .param(1, "y", "The y-coordinate of the window")
            .returns("true if the operation was successful, false otherwise");

        tspp::describe(window.method("getPosition", &Window::getPosition))
            .desc("Gets the position of the window")
            .returns("The position of the window");

        tspp::describe(window.staticMethod("getMonitors", &Window::getMonitors))
            .desc("Gets all the monitors connected to the system")
            .returns("An array of MonitorInfo objects");

        //
        // Event listeners
        //

        auto onOpen = window.pseudoMethod(
            "onOpen",
            +[](Window* self, void (*callback)()) {
                return self->onOpen.addListener(callback, false, true);
            }
        );

        tspp::describe(onOpen)
            .desc("Adds an event listener callback that will be called when the window is opened")
            .param(0, "callback", "The callback to call when the window is opened")
            .returns("The ID of the listener that was added");

        auto offOpen = window.pseudoMethod(
            "offOpen",
            +[](Window* self, EventListenerId id) {
                self->onOpen.removeListener(id);
            }
        );

        tspp::describe(offOpen)
            .desc("Removes an event listener callback that was added with onOpen")
            .param(0, "id", "The ID of the listener to remove");

        auto onClose = window.pseudoMethod(
            "onClose",
            +[](Window* self, void (*callback)()) {
                return self->onClose.addListener(callback, false, true);
            }
        );

        tspp::describe(onClose)
            .desc("Adds an event listener callback that will be called when the window is closed")
            .param(0, "callback", "The callback to call when the window is closed")
            .returns("The ID of the listener that was added");

        auto offClose = window.pseudoMethod(
            "offClose",
            +[](Window* self, EventListenerId id) {
                self->onClose.removeListener(id);
            }
        );

        tspp::describe(offClose)
            .desc("Removes an event listener callback that was added with onClose")
            .param(0, "id", "The ID of the listener to remove");

        auto onFocus = window.pseudoMethod(
            "onFocus",
            +[](Window* self, void (*callback)()) {
                return self->onFocus.addListener(callback, false, true);
            }
        );

        tspp::describe(onFocus)
            .desc("Adds an event listener callback that will be called when the window is focused")
            .param(0, "callback", "The callback to call when the window is focused")
            .returns("The ID of the listener that was added");

        auto offFocus = window.pseudoMethod(
            "offFocus",
            +[](Window* self, EventListenerId id) {
                self->onFocus.removeListener(id);
            }
        );

        tspp::describe(offFocus)
            .desc("Removes an event listener callback that was added with onFocus")
            .param(0, "id", "The ID of the listener to remove");

        auto onBlur = window.pseudoMethod(
            "onBlur",
            +[](Window* self, void (*callback)()) {
                return self->onBlur.addListener(callback, false, true);
            }
        );

        tspp::describe(onBlur)
            .desc("Adds an event listener callback that will be called when the window is blurred")
            .param(0, "callback", "The callback to call when the window is blurred")
            .returns("The ID of the listener that was added");

        auto offBlur = window.pseudoMethod(
            "offBlur",
            +[](Window* self, EventListenerId id) {
                self->onBlur.removeListener(id);
            }
        );

        tspp::describe(offBlur)
            .desc("Removes an event listener callback that was added with onBlur")
            .param(0, "id", "The ID of the listener to remove");

        auto onResize = window.pseudoMethod(
            "onResize",
            +[](Window* self, void (*callback)(u32, u32)) {
                return self->onResize.addListener(callback, false, true);
            }
        );

        tspp::describe(onResize)
            .desc("Adds an event listener callback that will be called when the window is resized")
            .param(0, "callback", "The callback to call when the window is resized")
            .returns("The ID of the listener that was added");

        auto offResize = window.pseudoMethod(
            "offResize",
            +[](Window* self, EventListenerId id) {
                self->onResize.removeListener(id);
            }
        );

        tspp::describe(offResize)
            .desc("Removes an event listener callback that was added with onResize")
            .param(0, "id", "The ID of the listener to remove");

        auto onMove = window.pseudoMethod(
            "onMove",
            +[](Window* self, void (*callback)(i32, i32)) {
                return self->onMove.addListener(callback, false, true);
            }
        );

        tspp::describe(onMove)
            .desc("Adds an event listener callback that will be called when the window is moved")
            .param(0, "callback", "The callback to call when the window is moved")
            .returns("The ID of the listener that was added");

        auto offMove = window.pseudoMethod(
            "offMove",
            +[](Window* self, EventListenerId id) {
                self->onMove.removeListener(id);
            }
        );

        tspp::describe(offMove)
            .desc("Removes an event listener callback that was added with onMove")
            .param(0, "id", "The ID of the listener to remove");

        auto onKeyDown = window.pseudoMethod(
            "onKeyDown",
            +[](Window* self, void (*callback)(KeyboardKey)) {
                return self->onKeyDown.addListener(callback, false, true);
            }
        );

        tspp::describe(onKeyDown)
            .desc("Adds an event listener callback that will be called when a key is pressed")
            .param(0, "callback", "The callback to call when a key is pressed")
            .returns("The ID of the listener that was added");

        auto offKeyDown = window.pseudoMethod(
            "offKeyDown",
            +[](Window* self, EventListenerId id) {
                self->onKeyDown.removeListener(id);
            }
        );

        tspp::describe(offKeyDown)
            .desc("Removes an event listener callback that was added with onKeyDown")
            .param(0, "id", "The ID of the listener to remove");

        auto onKeyUp = window.pseudoMethod(
            "onKeyUp",
            +[](Window* self, void (*callback)(KeyboardKey)) {
                return self->onKeyUp.addListener(callback, false, true);
            }
        );

        tspp::describe(onKeyUp)
            .desc("Adds an event listener callback that will be called when a key is released")
            .param(0, "callback", "The callback to call when a key is released")
            .returns("The ID of the listener that was added");

        auto offKeyUp = window.pseudoMethod(
            "offKeyUp",
            +[](Window* self, EventListenerId id) {
                self->onKeyUp.removeListener(id);
            }
        );

        tspp::describe(offKeyUp)
            .desc("Removes an event listener callback that was added with onKeyUp")
            .param(0, "id", "The ID of the listener to remove");

        auto onMouseMove = window.pseudoMethod(
            "onMouseMove",
            +[](Window* self, void (*callback)(i32, i32)) {
                return self->onMouseMove.addListener(callback, false, true);
            }
        );

        tspp::describe(onMouseMove)
            .desc("Adds an event listener callback that will be called when the mouse is moved")
            .param(0, "callback", "The callback to call when the mouse is moved")
            .returns("The ID of the listener that was added");

        auto offMouseMove = window.pseudoMethod(
            "offMouseMove",
            +[](Window* self, EventListenerId id) {
                self->onMouseMove.removeListener(id);
            }
        );

        tspp::describe(offMouseMove)
            .desc("Removes an event listener callback that was added with onMouseMove")
            .param(0, "id", "The ID of the listener to remove");

        auto onMouseDown = window.pseudoMethod(
            "onMouseDown",
            +[](Window* self, void (*callback)(MouseButton)) {
                return self->onMouseDown.addListener(callback, false, true);
            }
        );

        tspp::describe(onMouseDown)
            .desc("Adds an event listener callback that will be called when a mouse button is pressed")
            .param(0, "callback", "The callback to call when a mouse button is pressed")
            .returns("The ID of the listener that was added");

        auto offMouseDown = window.pseudoMethod(
            "offMouseDown",
            +[](Window* self, EventListenerId id) {
                self->onMouseDown.removeListener(id);
            }
        );

        tspp::describe(offMouseDown)
            .desc("Removes an event listener callback that was added with onMouseDown")
            .param(0, "id", "The ID of the listener to remove");

        auto onMouseUp = window.pseudoMethod(
            "onMouseUp",
            +[](Window* self, void (*callback)(MouseButton)) {
                return self->onMouseUp.addListener(callback, false, true);
            }
        );

        tspp::describe(onMouseUp)
            .desc("Adds an event listener callback that will be called when a mouse button is released")
            .param(0, "callback", "The callback to call when a mouse button is released")
            .returns("The ID of the listener that was added");

        auto offMouseUp = window.pseudoMethod(
            "offMouseUp",
            +[](Window* self, EventListenerId id) {
                self->onMouseUp.removeListener(id);
            }
        );

        tspp::describe(offMouseUp)
            .desc("Removes an event listener callback that was added with onMouseUp")
            .param(0, "id", "The ID of the listener to remove");

        auto onScroll = window.pseudoMethod(
            "onScroll",
            +[](Window* self, void (*callback)(f32)) {
                return self->onScroll.addListener(callback, false, true);
            }
        );

        tspp::describe(onScroll)
            .desc("Adds an event listener callback that will be called when the mouse is scrolled")
            .param(0, "callback", "The callback to call when the mouse is scrolled")
            .returns("The ID of the listener that was added");

        auto offScroll = window.pseudoMethod(
            "offScroll",
            +[](Window* self, EventListenerId id) {
                self->onScroll.removeListener(id);
            }
        );

        tspp::describe(offScroll)
            .desc("Removes an event listener callback that was added with onScroll")
            .param(0, "id", "The ID of the listener to remove");
    }

    void bindWindowInterface() {
        bind::Namespace* ns = new bind::Namespace("window");
        bind::Registry::Add(ns);

        bindKeyboardKeyEnum();
        bindMouseButtonEnum();
        bindMonitorInfoType(ns);
        bindWindowType(ns);

        bind::ObjectTypeBuilder<Application> app = bind::extend<Application>();
        tspp::describe(app.method("addWindow", &Application::addWindow))
            .desc("Adds a window to the application, enabling it to receive events")
            .param(0, "window", "The window to add");
    }
}