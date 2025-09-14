#include <decomp/app/window.h>

#include <decomp/app/application.h>
#include <decomp/utils/event.hpp>
#include <utils/Array.hpp>
#include <utils/String.h>

#include <utils/Array.hpp>

#define WIN32_LEAN_AND_MEAN
#include <Windows.h>
#include <Windowsx.h>
#include <commdlg.h>
#include <shlobj.h>

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

                try {
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
                        case WM_SETCURSOR: {
                            if (LOWORD(lParam) == HTCLIENT) {
                                switch (self->m_cursorIcon) {
                                    case CursorIcon::Arrow: SetCursor((HCURSOR)self->m_cursorArrow); break;
                                    case CursorIcon::Crosshair: SetCursor((HCURSOR)self->m_cursorCrosshair); break;
                                    case CursorIcon::Hand: SetCursor((HCURSOR)self->m_cursorHand); break;
                                    case CursorIcon::IBeam: SetCursor((HCURSOR)self->m_cursorIBeam); break;
                                    case CursorIcon::SizeAll: SetCursor((HCURSOR)self->m_cursorSizeAll); break;
                                    case CursorIcon::SizeNESW: SetCursor((HCURSOR)self->m_cursorSizeNESW); break;
                                    case CursorIcon::SizeNS: SetCursor((HCURSOR)self->m_cursorSizeNS); break;
                                    case CursorIcon::SizeNWSE: SetCursor((HCURSOR)self->m_cursorSizeNWSE); break;
                                    case CursorIcon::SizeWE: SetCursor((HCURSOR)self->m_cursorSizeWE); break;
                                    case CursorIcon::UpArrow: SetCursor((HCURSOR)self->m_cursorUpArrow); break;
                                    case CursorIcon::Wait: SetCursor((HCURSOR)self->m_cursorWait); break;
                                    case CursorIcon::Help: SetCursor((HCURSOR)self->m_cursorHelp); break;
                                    default: SetCursor((HCURSOR)self->m_cursorArrow); break;
                                }
                                return TRUE;
                            }
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
                } catch (const GenericException& e) {
                    self->error(e.what());
                } catch (const std::exception& e) {
                    self->error(e.what());
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

    Window::Window() : IWithLogging("Window") {
        m_application = nullptr;
        m_parent      = nullptr;
        m_handle      = nullptr;

        m_cursorArrow     = nullptr;
        m_cursorCrosshair = nullptr;
        m_cursorHand      = nullptr;
        m_cursorIBeam     = nullptr;
        m_cursorSizeAll   = nullptr;
        m_cursorSizeNESW  = nullptr;
        m_cursorSizeNS    = nullptr;
        m_cursorSizeNWSE  = nullptr;
        m_cursorSizeWE    = nullptr;
        m_cursorUpArrow   = nullptr;
        m_cursorWait      = nullptr;
        m_cursorHelp      = nullptr;
        m_cursorIcon      = CursorIcon::Default;

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

    Window::Window(const utils::String& title) : IWithLogging("Window") {
        m_application = nullptr;
        m_parent      = nullptr;
        m_handle      = nullptr;

        m_cursorArrow     = nullptr;
        m_cursorCrosshair = nullptr;
        m_cursorHand      = nullptr;
        m_cursorIBeam     = nullptr;
        m_cursorSizeAll   = nullptr;
        m_cursorSizeNESW  = nullptr;
        m_cursorSizeNS    = nullptr;
        m_cursorSizeNWSE  = nullptr;
        m_cursorSizeWE    = nullptr;
        m_cursorUpArrow   = nullptr;
        m_cursorWait      = nullptr;
        m_cursorHelp      = nullptr;
        m_cursorIcon      = CursorIcon::Default;

        m_title = title;
        m_width = m_height = INT32_MAX;
        m_posX = m_posY = 0;
        m_isOpen        = false;
        m_borderEnabled = true;

        m_scope = m_title;
    }

    Window::Window(u32 width, u32 height) : IWithLogging("Window") {
        m_application = nullptr;
        m_parent      = nullptr;
        m_handle      = nullptr;

        m_cursorArrow     = nullptr;
        m_cursorCrosshair = nullptr;
        m_cursorHand      = nullptr;
        m_cursorIBeam     = nullptr;
        m_cursorSizeAll   = nullptr;
        m_cursorSizeNESW  = nullptr;
        m_cursorSizeNS    = nullptr;
        m_cursorSizeNWSE  = nullptr;
        m_cursorSizeWE    = nullptr;
        m_cursorUpArrow   = nullptr;
        m_cursorWait      = nullptr;
        m_cursorHelp      = nullptr;
        m_cursorIcon      = CursorIcon::Default;

        m_title  = "Window";
        m_width  = width;
        m_height = height;
        m_posX = m_posY = 0;
        m_isOpen        = false;
        m_borderEnabled = true;

        m_scope = m_title;
    }

    Window::Window(const utils::String& title, u32 width, u32 height) : IWithLogging("Window") {
        m_application = nullptr;
        m_parent      = nullptr;
        m_handle      = nullptr;

        m_cursorArrow     = nullptr;
        m_cursorCrosshair = nullptr;
        m_cursorHand      = nullptr;
        m_cursorIBeam     = nullptr;
        m_cursorSizeAll   = nullptr;
        m_cursorSizeNESW  = nullptr;
        m_cursorSizeNS    = nullptr;
        m_cursorSizeNWSE  = nullptr;
        m_cursorSizeWE    = nullptr;
        m_cursorUpArrow   = nullptr;
        m_cursorWait      = nullptr;
        m_cursorHelp      = nullptr;
        m_cursorIcon      = CursorIcon::Default;

        m_title  = title;
        m_width  = width;
        m_height = height;
        m_posX = m_posY = 0;
        m_isOpen        = false;
        m_borderEnabled = true;

        m_scope = m_title;
    }

    Window::Window(Window* parent) : IWithLogging("Window") {
        m_application = nullptr;
        m_parent      = parent;
        m_handle      = nullptr;

        m_cursorArrow     = nullptr;
        m_cursorCrosshair = nullptr;
        m_cursorHand      = nullptr;
        m_cursorIBeam     = nullptr;
        m_cursorSizeAll   = nullptr;
        m_cursorSizeNESW  = nullptr;
        m_cursorSizeNS    = nullptr;
        m_cursorSizeNWSE  = nullptr;
        m_cursorSizeWE    = nullptr;
        m_cursorUpArrow   = nullptr;
        m_cursorWait      = nullptr;
        m_cursorHelp      = nullptr;
        m_cursorIcon      = CursorIcon::Default;

        m_title = "Window";
        m_width = m_height = INT32_MAX;
        m_posX = m_posY = 0;
        m_isOpen        = false;
        m_borderEnabled = true;

        m_scope = m_title;
    }

    Window::Window(Window* parent, const utils::String& title) : IWithLogging("Window") {
        m_application = nullptr;
        m_parent      = parent;
        m_handle      = nullptr;

        m_cursorArrow     = nullptr;
        m_cursorCrosshair = nullptr;
        m_cursorHand      = nullptr;
        m_cursorIBeam     = nullptr;
        m_cursorSizeAll   = nullptr;
        m_cursorSizeNESW  = nullptr;
        m_cursorSizeNS    = nullptr;
        m_cursorSizeNWSE  = nullptr;
        m_cursorSizeWE    = nullptr;
        m_cursorUpArrow   = nullptr;
        m_cursorWait      = nullptr;
        m_cursorHelp      = nullptr;
        m_cursorIcon      = CursorIcon::Default;

        m_title = title;
        m_width = m_height = INT32_MAX;
        m_posX = m_posY = 0;
        m_isOpen        = false;
        m_borderEnabled = true;

        m_scope = m_title;
    }

    Window::Window(Window* parent, u32 width, u32 height) : IWithLogging("Window") {
        m_application = nullptr;
        m_parent      = parent;
        m_handle      = nullptr;

        m_cursorArrow     = nullptr;
        m_cursorCrosshair = nullptr;
        m_cursorHand      = nullptr;
        m_cursorIBeam     = nullptr;
        m_cursorSizeAll   = nullptr;
        m_cursorSizeNESW  = nullptr;
        m_cursorSizeNS    = nullptr;
        m_cursorSizeNWSE  = nullptr;
        m_cursorSizeWE    = nullptr;
        m_cursorUpArrow   = nullptr;
        m_cursorWait      = nullptr;
        m_cursorHelp      = nullptr;
        m_cursorIcon      = CursorIcon::Default;

        m_title  = "Window";
        m_width  = width;
        m_height = height;
        m_posX = m_posY = 0;
        m_isOpen        = false;
        m_borderEnabled = true;

        m_scope = m_title;
    }

    Window::Window(Window* parent, const utils::String& title, u32 width, u32 height) : IWithLogging("Window") {
        m_application = nullptr;
        m_parent      = parent;
        m_handle      = nullptr;

        m_cursorArrow     = nullptr;
        m_cursorCrosshair = nullptr;
        m_cursorHand      = nullptr;
        m_cursorIBeam     = nullptr;
        m_cursorSizeAll   = nullptr;
        m_cursorSizeNESW  = nullptr;
        m_cursorSizeNS    = nullptr;
        m_cursorSizeNWSE  = nullptr;
        m_cursorSizeWE    = nullptr;
        m_cursorUpArrow   = nullptr;
        m_cursorWait      = nullptr;
        m_cursorHelp      = nullptr;
        m_cursorIcon      = CursorIcon::Default;

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

    bool Window::setCursorIcon(CursorIcon icon) {
        m_cursorIcon = icon;
        if (!m_handle) {
            return true;
        }

        switch (icon) {
            case CursorIcon::Arrow: SetCursor((HCURSOR)m_cursorArrow); break;
            case CursorIcon::Crosshair: SetCursor((HCURSOR)m_cursorCrosshair); break;
            case CursorIcon::Hand: SetCursor((HCURSOR)m_cursorHand); break;
            case CursorIcon::IBeam: SetCursor((HCURSOR)m_cursorIBeam); break;
            case CursorIcon::SizeAll: SetCursor((HCURSOR)m_cursorSizeAll); break;
            case CursorIcon::SizeNESW: SetCursor((HCURSOR)m_cursorSizeNESW); break;
            case CursorIcon::SizeNS: SetCursor((HCURSOR)m_cursorSizeNS); break;
            case CursorIcon::SizeNWSE: SetCursor((HCURSOR)m_cursorSizeNWSE); break;
            case CursorIcon::SizeWE: SetCursor((HCURSOR)m_cursorSizeWE); break;
            case CursorIcon::UpArrow: SetCursor((HCURSOR)m_cursorUpArrow); break;
            case CursorIcon::Wait: SetCursor((HCURSOR)m_cursorWait); break;
            case CursorIcon::Help: SetCursor((HCURSOR)m_cursorHelp); break;
            default: SetCursor((HCURSOR)m_cursorArrow); break;
        }

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

    bool Window::showConfirmationDialog(const utils::String& title, const utils::String& message, Window* parent) {
        HWND parentHandle = parent ? (HWND)parent->m_handle : nullptr;
        return MessageBox(parentHandle, message.c_str(), title.c_str(), MB_OKCANCEL) == IDOK;
    }

    void Window::showErrorDialog(const utils::String& title, const utils::String& message, Window* parent) {
        HWND parentHandle = parent ? (HWND)parent->m_handle : nullptr;
        MessageBox(parentHandle, message.c_str(), title.c_str(), MB_OK | MB_ICONERROR);
    }

    void Window::showWarningDialog(const utils::String& title, const utils::String& message, Window* parent) {
        HWND parentHandle = parent ? (HWND)parent->m_handle : nullptr;
        MessageBox(parentHandle, message.c_str(), title.c_str(), MB_OK | MB_ICONWARNING);
    }

    void Window::showMessageDialog(const utils::String& title, const utils::String& message, Window* parent) {
        HWND parentHandle = parent ? (HWND)parent->m_handle : nullptr;
        MessageBox(parentHandle, message.c_str(), title.c_str(), MB_OK | MB_ICONINFORMATION);
    }

    String Window::showOpenDirectoryDialog(const String& title, const String* defaultPath, Window* parent) {
        HWND parentHandle = parent ? (HWND)parent->m_handle : nullptr;

        HRESULT hr;

        hr = CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED);
        if (FAILED(hr)) {
            throw GenericException("Failed to initialize COM");
        }

        IFileOpenDialog* dialog;
        hr = CoCreateInstance(CLSID_FileOpenDialog, nullptr, CLSCTX_ALL, IID_PPV_ARGS(&dialog));
        if (FAILED(hr)) {
            CoUninitialize();
            throw GenericException("Failed to create file open dialog");
        }

        DWORD options;
        hr = dialog->GetOptions(&options);
        if (FAILED(hr)) {
            CoUninitialize();
            throw GenericException("Failed to get file open dialog options");
        }

        hr = dialog->SetOptions(options | FOS_PICKFOLDERS);
        if (FAILED(hr)) {
            CoUninitialize();
            throw GenericException("Failed to set file open dialog options");
        }

        hr = dialog->Show(parentHandle);
        if (FAILED(hr)) {
            CoUninitialize();
            throw GenericException("Failed to show file open dialog");
        }

        IShellItem* item;
        hr = dialog->GetResult(&item);
        if (FAILED(hr)) {
            CoUninitialize();
            throw GenericException("Failed to get file open dialog result");
        }

        PWSTR path;
        hr = item->GetDisplayName(SIGDN_FILESYSPATH, &path);
        if (FAILED(hr)) {
            item->Release();
            CoUninitialize();
            throw GenericException("Failed to get file open dialog result");
        }

        char* result = new char[wcslen(path) + 1];
        wcstombs(result, path, wcslen(path) + 1);
        CoTaskMemFree(path);

        item->Release();
        dialog->Release();
        CoUninitialize();

        String resultStr = result;
        delete[] result;

        for (u32 i = 0; i < resultStr.size(); i++) {
            if (resultStr[i] == '\\') {
                resultStr[i] = '/';
            }
        }

        return resultStr;
    }

    Array<String> Window::showOpenFileDialog(
        const String& title,
        const Array<String>& allowedExtensionNames,
        const Array<String>& allowedExtensions,
        u32 maxFileCount,
        const String* defaultPath,
        Window* parent
    ) {
        if (allowedExtensionNames.size() != allowedExtensions.size()) {
            throw InvalidArgumentException("Allowed extension names and extensions must have the same size");
        }

        String filter = "";
        for (u32 i = 0; i < allowedExtensions.size(); i++) {
            filter += allowedExtensionNames[i];
            filter += '\0';
            filter += allowedExtensions[i];
            filter += '\0';
        }
        filter += '\0';
        filter += '\0';

        char* results = new char[(MAX_PATH + 1) * maxFileCount];
        memset(results, 0, (MAX_PATH + 1) * maxFileCount);

        OPENFILENAME ofn;
        memset(&ofn, 0, sizeof(OPENFILENAME));

        ofn.lStructSize     = sizeof(OPENFILENAME);
        ofn.hwndOwner       = parent ? (HWND)parent->m_handle : nullptr;
        ofn.lpstrTitle      = title.c_str();
        ofn.lpstrFilter     = filter.c_str();
        ofn.lpstrFile       = results;
        ofn.lpstrInitialDir = defaultPath ? defaultPath->c_str() : nullptr;
        ofn.nMaxFile        = MAX_PATH * maxFileCount;

        u32 flags = OFN_EXPLORER | OFN_FILEMUSTEXIST | OFN_PATHMUSTEXIST;
        if (maxFileCount > 1) {
            flags |= OFN_ALLOWMULTISELECT;
        }

        ofn.Flags = flags;

        if (GetOpenFileName(&ofn)) {
            Array<String> out;

            String dir = results;
            if (dir.size() == 0) {
                delete[] results;
                return out;
            }

            for (u32 i = 0; i < dir.size(); i++) {
                if (dir[i] == '\\') {
                    dir[i] = '/';
                }
            }

            if (maxFileCount == 1) {
                out.push(dir);
                delete[] results;
                return out;
            }

            char* ptr = results + dir.size() + 1;
            while (*ptr) {
                if (out.size() > maxFileCount) {
                    delete[] results;
                    throw RangeException("Max file count exceeded by user selection");
                }

                String file     = ptr;
                String fullPath = dir + "/" + file;

                out.push(fullPath);
                ptr += file.size() + 1;
            }

            delete[] results;

            return out;
        }

        delete[] results;
        return Array<String>();
    }

    String Window::showSaveFileDialog(
        const String& title,
        const Array<String>& allowedExtensionNames,
        const Array<String>& allowedExtensions,
        const String* defaultPath,
        Window* parent
    ) {
        if (allowedExtensionNames.size() != allowedExtensions.size()) {
            throw InvalidArgumentException("Allowed extension names and extensions must have the same size");
        }

        String filter = "";
        for (u32 i = 0; i < allowedExtensions.size(); i++) {
            filter += allowedExtensionNames[i];
            filter += '\0';
            filter += allowedExtensions[i];
            filter += '\0';
        }
        filter += '\0';
        filter += '\0';

        char results[MAX_PATH + 1];
        memset(results, 0, MAX_PATH + 1);

        OPENFILENAME ofn;
        memset(&ofn, 0, sizeof(OPENFILENAME));

        ofn.lStructSize     = sizeof(OPENFILENAME);
        ofn.hwndOwner       = parent ? (HWND)parent->m_handle : nullptr;
        ofn.lpstrTitle      = title.c_str();
        ofn.lpstrFilter     = filter.c_str();
        ofn.lpstrFile       = results;
        ofn.lpstrInitialDir = defaultPath ? defaultPath->c_str() : nullptr;
        ofn.nMaxFile        = MAX_PATH;

        u32 flags = OFN_EXPLORER | OFN_PATHMUSTEXIST | OFN_OVERWRITEPROMPT;

        ofn.Flags = flags;

        if (GetOpenFileName(&ofn)) {
            String file = results;
            if (file.size() == 0) {
                return "";
            }

            for (u32 i = 0; i < file.size(); i++) {
                if (file[i] == '\\') {
                    file[i] = '/';
                }
            }

            delete[] results;
            return file;
        }

        delete[] results;
        return "";
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

        m_cursorArrow     = LoadCursor(nullptr, IDC_ARROW);
        m_cursorCrosshair = LoadCursor(nullptr, IDC_CROSS);
        m_cursorHand      = LoadCursor(nullptr, IDC_HAND);
        m_cursorIBeam     = LoadCursor(nullptr, IDC_IBEAM);
        m_cursorSizeAll   = LoadCursor(nullptr, IDC_SIZEALL);
        m_cursorSizeNESW  = LoadCursor(nullptr, IDC_SIZENESW);
        m_cursorSizeNS    = LoadCursor(nullptr, IDC_SIZENS);
        m_cursorSizeNWSE  = LoadCursor(nullptr, IDC_SIZENWSE);
        m_cursorSizeWE    = LoadCursor(nullptr, IDC_SIZEWE);
        m_cursorUpArrow   = LoadCursor(nullptr, IDC_UPARROW);
        m_cursorWait      = LoadCursor(nullptr, IDC_WAIT);
        m_cursorHelp      = LoadCursor(nullptr, IDC_HELP);

        ShowWindow((HWND)m_handle, SW_SHOWNORMAL);
        SetWindowText((HWND)m_handle, m_title.c_str());

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

        return DestroyWindow((HWND)m_handle) == TRUE;
    }
}