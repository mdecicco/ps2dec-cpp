#include <decomp/app/window.h>

#include <decomp/app/application.h>
#include <decomp/utils/event.hpp>
#include <utils/Array.hpp>
#include <utils/String.h>

#include <render/core/FrameContext.h>
#include <render/vulkan/CommandBuffer.h>
#include <render/vulkan/Instance.h>
#include <render/vulkan/LogicalDevice.h>
#include <render/vulkan/PhysicalDevice.h>
#include <render/vulkan/SwapChain.h>
#include <render/vulkan/SwapChainSupport.h>

#include <utils/Array.hpp>

#define WIN32_LEAN_AND_MEAN
#include <Windows.h>
#include <Windowsx.h>

namespace decomp {
    class Window_Impl {
        public:
            static bool isKeyCodeValid(u32 code) {
                switch (KeyboardKey(code)) {
                    case KeyboardKey::_0:
                    case KeyboardKey::_1:
                    case KeyboardKey::_2:
                    case KeyboardKey::_3:
                    case KeyboardKey::_4:
                    case KeyboardKey::_5:
                    case KeyboardKey::_6:
                    case KeyboardKey::_7:
                    case KeyboardKey::_8:
                    case KeyboardKey::_9:
                    case KeyboardKey::A:
                    case KeyboardKey::B:
                    case KeyboardKey::C:
                    case KeyboardKey::D:
                    case KeyboardKey::E:
                    case KeyboardKey::F:
                    case KeyboardKey::G:
                    case KeyboardKey::H:
                    case KeyboardKey::I:
                    case KeyboardKey::J:
                    case KeyboardKey::K:
                    case KeyboardKey::L:
                    case KeyboardKey::M:
                    case KeyboardKey::N:
                    case KeyboardKey::O:
                    case KeyboardKey::P:
                    case KeyboardKey::Q:
                    case KeyboardKey::R:
                    case KeyboardKey::S:
                    case KeyboardKey::T:
                    case KeyboardKey::U:
                    case KeyboardKey::V:
                    case KeyboardKey::W:
                    case KeyboardKey::X:
                    case KeyboardKey::Y:
                    case KeyboardKey::Z:
                    case KeyboardKey::SingleQuote:
                    case KeyboardKey::Backslash:
                    case KeyboardKey::Comma:
                    case KeyboardKey::Equal:
                    case KeyboardKey::Backtick:
                    case KeyboardKey::LeftBracket:
                    case KeyboardKey::Minus:
                    case KeyboardKey::Period:
                    case KeyboardKey::RightBracket:
                    case KeyboardKey::Semicolon:
                    case KeyboardKey::Slash:
                    case KeyboardKey::Backspace:
                    case KeyboardKey::Delete:
                    case KeyboardKey::End:
                    case KeyboardKey::Enter:
                    case KeyboardKey::Escape:
                    case KeyboardKey::Home:
                    case KeyboardKey::Insert:
                    case KeyboardKey::Menu:
                    case KeyboardKey::PageDown:
                    case KeyboardKey::PageUp:
                    case KeyboardKey::Pause:
                    case KeyboardKey::Space:
                    case KeyboardKey::Tab:
                    case KeyboardKey::CapLock:
                    case KeyboardKey::NumLock:
                    case KeyboardKey::ScrollLock:
                    case KeyboardKey::F1:
                    case KeyboardKey::F2:
                    case KeyboardKey::F3:
                    case KeyboardKey::F4:
                    case KeyboardKey::F5:
                    case KeyboardKey::F6:
                    case KeyboardKey::F7:
                    case KeyboardKey::F8:
                    case KeyboardKey::F9:
                    case KeyboardKey::F10:
                    case KeyboardKey::F11:
                    case KeyboardKey::F12:
                    case KeyboardKey::F13:
                    case KeyboardKey::F14:
                    case KeyboardKey::F15:
                    case KeyboardKey::F16:
                    case KeyboardKey::F17:
                    case KeyboardKey::F18:
                    case KeyboardKey::F19:
                    case KeyboardKey::F20:
                    case KeyboardKey::F21:
                    case KeyboardKey::F22:
                    case KeyboardKey::F23:
                    case KeyboardKey::F24:
                    case KeyboardKey::LeftAlt:
                    case KeyboardKey::LeftControl:
                    case KeyboardKey::LeftShift:
                    case KeyboardKey::LeftSuper:
                    case KeyboardKey::PrintScreen:
                    case KeyboardKey::RightAlt:
                    case KeyboardKey::RightControl:
                    case KeyboardKey::RightShift:
                    case KeyboardKey::RightSuper:
                    case KeyboardKey::Down:
                    case KeyboardKey::Left:
                    case KeyboardKey::Right:
                    case KeyboardKey::Up:
                    case KeyboardKey::Numpad0:
                    case KeyboardKey::Numpad1:
                    case KeyboardKey::Numpad2:
                    case KeyboardKey::Numpad3:
                    case KeyboardKey::Numpad4:
                    case KeyboardKey::Numpad5:
                    case KeyboardKey::Numpad6:
                    case KeyboardKey::Numpad7:
                    case KeyboardKey::Numpad8:
                    case KeyboardKey::Numpad9:
                    case KeyboardKey::NumpadAdd:
                    case KeyboardKey::NumpadDecimal:
                    case KeyboardKey::NumpadDivide:
                    case KeyboardKey::NumpadEnter:
                    case KeyboardKey::NumpadEqual:
                    case KeyboardKey::NumpadMultiply:
                    case KeyboardKey::NumpadSubtract: return true;
                    default: return false;
                }
            }

            static LRESULT CALLBACK windowProc(HWND win, UINT uMsg, WPARAM wParam, LPARAM lParam) {
                if (uMsg == WM_CREATE) {
                    CREATESTRUCT* cs = (CREATESTRUCT*)lParam;
                    SetWindowLongPtr(win, 0, (LONG_PTR)cs->lpCreateParams);
                    return 0;
                } else if (uMsg == WM_NCCREATE) {
                    CREATESTRUCT* cs = (CREATESTRUCT*)lParam;
                    SetWindowLongPtr(win, 0, (LONG_PTR)cs->lpCreateParams);
                    return TRUE;
                }

                Window* self = (Window*)GetWindowLongPtr(win, 0);
                if (!self) {
                    return DefWindowProc(win, uMsg, wParam, lParam);
                }

                switch (uMsg) {
                    case WM_CLOSE: {
                        self->setOpen(false);
                        return 0;
                    }
                    case WM_DESTROY: {
                        self->m_handle = nullptr;
                        self->m_onClose.dispatch(self->onClose);
                        break;
                    }
                    case WM_SETFOCUS: {
                        self->m_isFocused = true;
                        self->m_onFocus.dispatch(self->onFocus);
                        return 0;
                    }
                    case WM_KILLFOCUS: {
                        self->m_isFocused = false;
                        self->m_onBlur.dispatch(self->onBlur);
                        return 0;
                    }
                    case WM_SIZE:
                    case WM_MOVE: {
                        RECT rect;

                        if (GetClientRect(win, &rect)) {
                            i32 width  = rect.right - rect.left;
                            i32 height = rect.bottom - rect.top;

                            if (width != self->m_width || height != self->m_height) {
                                self->m_width  = width;
                                self->m_height = height;

                                self->onWindowResize(self, width, height);
                                self->m_onResize.dispatch(self->onResize, width, height);
                            }
                        }

                        if (GetWindowRect(win, &rect)) {
                            i32 posX = rect.left;
                            i32 posY = rect.top;

                            if (posX != self->m_posX || posY != self->m_posY) {
                                self->m_posX = posX;
                                self->m_posY = posY;

                                self->m_onMove.dispatch(self->onMove, posX, posY);
                            }
                        }
                        break;
                    }
                    case WM_KEYDOWN: {
                        KeyboardKey code = KeyboardKey(HIWORD(lParam) & (KF_EXTENDED | 0xff));
                        if (code == KeyboardKey::None) {
                            code = KeyboardKey(MapVirtualKeyW(u32(wParam), MAPVK_VK_TO_VSC));
                        }

                        if (!Window_Impl::isKeyCodeValid(u32(code))) {
                            break;
                        }

                        self->m_onKeyDown.dispatch(self->onKeyDown, code);
                        break;
                    }
                    case WM_KEYUP: {
                        KeyboardKey code = KeyboardKey(HIWORD(lParam) & (KF_EXTENDED | 0xff));
                        if (code == KeyboardKey::None) {
                            code = KeyboardKey(MapVirtualKeyW(u32(wParam), MAPVK_VK_TO_VSC));
                        }
                        if (!Window_Impl::isKeyCodeValid(u32(code))) {
                            break;
                        }

                        self->m_onKeyUp.dispatch(self->onKeyUp, code);

                        break;
                    }
                    case WM_MOUSEMOVE: {
                        i32 x = GET_X_LPARAM(lParam);
                        i32 y = GET_Y_LPARAM(lParam);

                        self->m_onMouseMove.dispatch(self->onMouseMove, x, y);
                        break;
                    }
                    case WM_MOUSEWHEEL: {
                        i16 x = HIWORD(wParam);
                        f32 d = x / f32(WHEEL_DELTA);

                        self->m_onScroll.dispatch(self->onScroll, d);
                        break;
                    }
                    case WM_LBUTTONDOWN: {
                        self->m_onMouseDown.dispatch(self->onMouseDown, MouseButton::Left);
                        break;
                    }
                    case WM_LBUTTONUP: {
                        self->m_onMouseUp.dispatch(self->onMouseUp, MouseButton::Left);
                        break;
                    }
                    case WM_MBUTTONDOWN: {
                        self->m_onMouseDown.dispatch(self->onMouseDown, MouseButton::Middle);
                        break;
                    }
                    case WM_MBUTTONUP: {
                        self->m_onMouseUp.dispatch(self->onMouseUp, MouseButton::Middle);
                        break;
                    }
                    case WM_RBUTTONDOWN: {
                        self->m_onMouseDown.dispatch(self->onMouseDown, MouseButton::Right);
                        break;
                    }
                    case WM_RBUTTONUP: {
                        self->m_onMouseUp.dispatch(self->onMouseUp, MouseButton::Right);
                        break;
                    }
                }

                return DefWindowProc(win, uMsg, wParam, lParam);
            }

            static BOOL CALLBACK MonitorEnumProc(HMONITOR hMonitor, HDC hdcMonitor, LPRECT lprcMonitor, LPARAM dwData) {
                Array<MonitorInfo>& arr = *(Array<MonitorInfo>*)dwData;

                MONITORINFOEX minfo;
                minfo.cbSize = sizeof(MONITORINFOEX);

                if (!GetMonitorInfo(hMonitor, &minfo)) {
                    return TRUE;
                }

                arr.push({});
                MonitorInfo& mi = arr.last();

                DEVMODE devmode = {};
                devmode.dmSize  = sizeof(DEVMODE);
                EnumDisplaySettings(minfo.szDevice, ENUM_CURRENT_SETTINGS, &devmode);

                mi.virtualDimensions =
                    vec2(minfo.rcMonitor.right - minfo.rcMonitor.left, minfo.rcMonitor.bottom - minfo.rcMonitor.top);
                mi.actualDimensions = vec2(devmode.dmPelsWidth, devmode.dmPelsHeight);
                mi.position         = vec2(minfo.rcMonitor.left, minfo.rcMonitor.top);
                mi.bitsPerPixel     = devmode.dmBitsPerPel;
                mi.refreshRate      = devmode.dmDisplayFrequency;
                mi.handle           = hMonitor;

                return TRUE;
            }
    };

    Window::Window() {
        m_application = nullptr;
        m_parent      = nullptr;
        m_handle      = nullptr;

        m_title         = "Window";
        m_borderEnabled = true;
        m_isOpen        = false;
        m_isFocused     = false;
        m_width         = 800;
        m_height        = 600;
        m_posX          = 0;
        m_posY          = 0;

        m_scope = m_title;
    }

    Window::Window(const utils::String& title) {
        m_application = nullptr;
        m_parent      = nullptr;
        m_handle      = nullptr;

        m_title = title;
        m_width = m_height = INT32_MAX;
        m_posX = m_posY = 0;
        m_isOpen        = false;
        m_borderEnabled = true;

        m_scope = m_title;
    }

    Window::Window(u32 width, u32 height) {
        m_application = nullptr;
        m_parent      = nullptr;
        m_handle      = nullptr;

        m_title  = "Window";
        m_width  = width;
        m_height = height;
        m_posX = m_posY = 0;
        m_isOpen        = false;
        m_borderEnabled = true;

        m_scope = m_title;
    }

    Window::Window(const utils::String& title, u32 width, u32 height) {
        m_application = nullptr;
        m_parent      = nullptr;
        m_handle      = nullptr;

        m_title  = title;
        m_width  = width;
        m_height = height;
        m_posX = m_posY = 0;
        m_isOpen        = false;
        m_borderEnabled = true;

        m_scope = m_title;
    }

    Window::Window(Window* parent) {
        m_application = nullptr;
        m_parent      = parent;
        m_handle      = nullptr;

        m_title = "Window";
        m_width = m_height = INT32_MAX;
        m_posX = m_posY = 0;
        m_isOpen        = false;
        m_borderEnabled = true;

        m_scope = m_title;
    }

    Window::Window(Window* parent, const utils::String& title) {
        m_application = nullptr;
        m_parent      = parent;
        m_handle      = nullptr;

        m_title = title;
        m_width = m_height = INT32_MAX;
        m_posX = m_posY = 0;
        m_isOpen        = false;
        m_borderEnabled = true;

        m_scope = m_title;
    }

    Window::Window(Window* parent, u32 width, u32 height) {
        m_application = nullptr;
        m_parent      = parent;
        m_handle      = nullptr;

        m_title  = "Window";
        m_width  = width;
        m_height = height;
        m_posX = m_posY = 0;
        m_isOpen        = false;
        m_borderEnabled = true;

        m_scope = m_title;
    }

    Window::Window(Window* parent, const utils::String& title, u32 width, u32 height) {
        m_application = nullptr;
        m_parent      = parent;
        m_handle      = nullptr;

        m_title  = title;
        m_width  = width;
        m_height = height;
        m_posX = m_posY = 0;
        m_isOpen        = false;
        m_borderEnabled = true;

        m_scope = m_title;
    }

    Window::~Window() {
        if (m_application) {
            m_application->removeWindow(this);
        }

        if (m_handle) {
            closeHandle();
        }
    }

    const render::vulkan::PhysicalDevice* Window::choosePhysicalDevice(
        const Array<render::vulkan::PhysicalDevice>& devices
    ) {
        const render::vulkan::PhysicalDevice* gpu = nullptr;
        render::vulkan::SwapChainSupport swapChainSupport;

        for (render::u32 i = 0; i < devices.size() && !gpu; i++) {
            if (!devices[i].isDiscrete()) {
                continue;
            }
            if (!devices[i].isExtensionAvailable(VK_KHR_SWAPCHAIN_EXTENSION_NAME)) {
                continue;
            }

            if (!devices[i].getSurfaceSwapChainSupport(getSurface(), &swapChainSupport)) {
                continue;
            }
            if (!swapChainSupport.isValid()) {
                continue;
            }

            if (!swapChainSupport.hasFormat(VK_FORMAT_A2B10G10R10_UNORM_PACK32, VK_COLOR_SPACE_SRGB_NONLINEAR_KHR)) {
                continue;
            }
            if (!swapChainSupport.hasPresentMode(VK_PRESENT_MODE_FIFO_KHR)) {
                continue;
            }

            auto& capabilities = swapChainSupport.getCapabilities();
            if (capabilities.maxImageCount > 0 && capabilities.maxImageCount < 3) {
                continue;
            }

            gpu = &devices[i];
        }

        return gpu;
    }

    bool Window::setupInstance(render::vulkan::Instance* instance) {
        instance->enableValidation();
        addNestedLogger(instance);

        return true;
    }

    bool Window::setupDevice(render::vulkan::LogicalDevice* device) {
        return device->init(true, true, false, getSurface());
    }

    bool Window::setupSwapchain(render::vulkan::SwapChain* swapChain, const render::vulkan::SwapChainSupport& support) {
        return swapChain->init(
            getSurface(),
            getLogicalDevice(),
            support,
            VK_FORMAT_A2B10G10R10_UNORM_PACK32,
            VK_COLOR_SPACE_SRGB_NONLINEAR_KHR,
            VK_PRESENT_MODE_FIFO_KHR,
            3
        );
    }

    bool Window::setOpen(bool open) {
        if (open == m_isOpen) {
            return true;
        }

        if (!open) {
            if (!m_handle) {
                m_isOpen = false;
                m_onClose.dispatch(onClose);
                return true;
            }

            ShowWindow((HWND)m_handle, SW_HIDE);
            m_isOpen = false;
            m_onClose.dispatch(onClose);
            return true;
        }

        if (m_parent && !m_parent->m_handle) {
            return false;
        }

        if (m_handle) {
            ShowWindow((HWND)m_handle, SW_SHOWNORMAL);
            m_isOpen = true;
            m_onOpen.dispatch(onOpen);
            return true;
        }

        if (!openHandle()) {
            return false;
        }

        m_isOpen = true;
        m_onOpen.dispatch(onOpen);
        return true;
    }

    bool Window::isOpen() const {
        return m_handle && m_isOpen;
    }

    bool Window::focus() {
        if (!m_handle) {
            return false;
        }

        if (SetForegroundWindow((HWND)m_handle) != TRUE) {
            return false;
        }

        if (SetFocus((HWND)m_handle) == NULL) {
            return false;
        }

        m_isFocused = true;
        return true;
    }

    bool Window::isFocused() const {
        return m_isFocused;
    }

    bool Window::setBorderEnabled(bool borderEnabled) {
        if (!m_handle || borderEnabled == m_borderEnabled) {
            m_borderEnabled = borderEnabled;
            return true;
        }

        if (!borderEnabled) {
            LONG lStyle = GetWindowLong((HWND)m_handle, GWL_STYLE);
            lStyle &= ~(WS_CAPTION | WS_THICKFRAME | WS_MINIMIZEBOX | WS_MAXIMIZEBOX | WS_SYSMENU);
            SetWindowLong((HWND)m_handle, GWL_STYLE, lStyle);

            LONG lExStyle = GetWindowLong((HWND)m_handle, GWL_EXSTYLE);
            lExStyle &= ~(WS_EX_DLGMODALFRAME | WS_EX_CLIENTEDGE | WS_EX_STATICEDGE);
            SetWindowLong((HWND)m_handle, GWL_EXSTYLE, lExStyle);

            bool result = SetWindowPos(
                (HWND)m_handle,
                NULL,
                0,
                0,
                0,
                0,
                SWP_FRAMECHANGED | SWP_NOMOVE | SWP_NOSIZE | SWP_NOZORDER | SWP_NOOWNERZORDER
            );

            if (!result) {
                return false;
            }
        } else {
            LONG lStyle = GetWindowLong((HWND)m_handle, GWL_STYLE);
            lStyle |= WS_CAPTION | WS_THICKFRAME | WS_MINIMIZEBOX | WS_MAXIMIZEBOX | WS_SYSMENU;
            SetWindowLong((HWND)m_handle, GWL_STYLE, lStyle);

            LONG lExStyle = GetWindowLong((HWND)m_handle, GWL_EXSTYLE);
            lExStyle |= WS_EX_DLGMODALFRAME | WS_EX_CLIENTEDGE | WS_EX_STATICEDGE;
            SetWindowLong((HWND)m_handle, GWL_EXSTYLE, lExStyle);

            bool result = SetWindowPos(
                (HWND)m_handle,
                NULL,
                0,
                0,
                0,
                0,
                SWP_FRAMECHANGED | SWP_NOMOVE | SWP_NOSIZE | SWP_NOZORDER | SWP_NOOWNERZORDER
            );

            if (!result) {
                return false;
            }
        }

        m_borderEnabled = borderEnabled;
        return true;
    }

    bool Window::isBorderEnabled() const {
        return m_borderEnabled;
    }

    bool Window::setTitle(const utils::String& title) {
        if (m_handle && SetWindowText((HWND)m_handle, title.c_str()) != TRUE) {
            return false;
        }

        m_title = title;
        return true;
    }

    utils::String Window::getTitle() const {
        return m_title;
    }

    bool Window::setSize(u32 width, u32 height) {
        if (m_handle) {
            BOOL success = SetWindowPos((HWND)m_handle, nullptr, m_posX, m_posY, width, height, SWP_NOMOVE);

            if (success != TRUE) {
                return false;
            }
        }

        m_width  = width;
        m_height = height;
        return true;
    }

    vec2ui Window::getSize() const {
        return vec2ui(m_width, m_height);
    }

    bool Window::setPosition(i32 x, i32 y) {
        if (m_handle) {
            BOOL success = SetWindowPos((HWND)m_handle, nullptr, x, y, m_width, m_height, SWP_NOSIZE);

            if (success != TRUE) {
                return false;
            }
        }

        m_posX = x;
        m_posY = y;
        return true;
    }

    vec2i Window::getPosition() const {
        return vec2i(m_posX, m_posY);
    }

    bool Window::pollEvents() {
        if (!m_handle) {
            return false;
        }

        u32 count = 0;
        MSG msg;
        while (PeekMessage(&msg, (HWND)m_handle, 0, 0, PM_REMOVE)) {
            TranslateMessage(&msg);
            DispatchMessage(&msg);
            count++;
        }

        return count > 0;
    }

    void* Window::getHandle() const {
        return m_handle;
    }

    void Window::subscribeInputHandler(IInputHandler* handler) {
        m_inputHandlers.push(handler);
    }

    void Window::unsubscribeInputHandler(IInputHandler* handler) {
        for (u32 i = 0; i < m_inputHandlers.size(); i++) {
            if (m_inputHandlers[i] == handler) {
                m_inputHandlers.remove(i);
                break;
            }
        }
    }

    utils::Array<MonitorInfo> Window::getMonitors() {
        HMONITOR primary = MonitorFromWindow(GetDesktopWindow(), MONITOR_DEFAULTTOPRIMARY);
        utils::Array<MonitorInfo> out;
        EnumDisplayMonitors(nullptr, nullptr, Window_Impl::MonitorEnumProc, (LPARAM)&out);

        for (u32 i = 0; i < out.size(); i++) {
            if (out[i].handle == primary) {
                out[i].isPrimary = true;
                break;
            }
        }

        return out;
    }

    bool Window::openHandle() {
        if (m_handle) {
            return true;
        }

        SetProcessDPIAware();

        String className = String::Format("WinUtil_%d", rand());
        WNDCLASSEX wnd;
        wnd.hInstance     = GetModuleHandle(nullptr);
        wnd.lpszClassName = className.c_str();
        wnd.lpfnWndProc   = Window_Impl::windowProc;
        wnd.style         = CS_DBLCLKS;
        wnd.cbSize        = sizeof(WNDCLASSEX);
        wnd.hIcon         = LoadIcon(nullptr, IDI_APPLICATION);
        wnd.hIconSm       = LoadIcon(nullptr, IDI_APPLICATION);
        wnd.hCursor       = LoadCursor(nullptr, IDC_ARROW);
        wnd.lpszMenuName  = nullptr;
        wnd.cbClsExtra    = 0;
        wnd.cbWndExtra    = sizeof(Window*);
        wnd.hbrBackground = (HBRUSH)GetStockObject(BLACK_BRUSH);

        if (!RegisterClassEx(&wnd)) {
            return false;
        }

        u32 styleFlags;
        if (!m_borderEnabled) {
            styleFlags = WS_OVERLAPPED;
        } else {
            styleFlags = WS_OVERLAPPED | WS_CAPTION | WS_SYSMENU | WS_THICKFRAME | WS_MINIMIZEBOX | WS_MAXIMIZEBOX;
        }

        m_handle = CreateWindowEx(
            0,
            className.c_str(),
            m_title.c_str(),
            styleFlags,
            m_posX == INT32_MAX ? CW_USEDEFAULT : m_posX,
            m_posY == INT32_MAX ? CW_USEDEFAULT : m_posY,
            m_width == INT32_MAX ? 800 : m_width,
            m_height == INT32_MAX ? 600 : m_height,
            m_parent ? (HWND)m_parent->m_handle : HWND_DESKTOP,
            nullptr,
            GetModuleHandle(nullptr),
            (LPVOID)this
        );

        if (!m_handle) {
            return false;
        }

        ShowWindow((HWND)m_handle, SW_SHOWNORMAL);

        // Don't ask me why CreateWindowEx won't just create the window with the correct style from the
        // beginning...
        if (!m_borderEnabled) {
            m_borderEnabled = true;
            setBorderEnabled(false);
        }

        RECT rect;
        if (GetWindowRect((HWND)m_handle, &rect)) {
            m_width  = rect.right - rect.left;
            m_height = rect.bottom - rect.top;
            m_posX   = rect.left;
            m_posY   = rect.top;
        }

        // if (!initRendering(this)) {
        //     closeHandle();
        //     m_handle = nullptr;
        //     return false;
        // }

        // if (!initDebugDrawing()) {
        //     closeHandle();
        //     m_handle = nullptr;
        //     return false;
        // }

        return true;
    }

    bool Window::closeHandle() {
        if (!m_handle) {
            return true;
        }

        shutdownRendering();
        return DestroyWindow((HWND)m_handle) == TRUE;
    }
}