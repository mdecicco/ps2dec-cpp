#pragma once
#include <decomp/types.h>

namespace decomp {
    class Window;

    enum class KeyboardKey : u32 {
        None           = 0,
        _0             = 0x00B,
        _1             = 0x002,
        _2             = 0x003,
        _3             = 0x004,
        _4             = 0x005,
        _5             = 0x006,
        _6             = 0x007,
        _7             = 0x008,
        _8             = 0x009,
        _9             = 0x00A,
        A              = 0x01E,
        B              = 0x030,
        C              = 0x02E,
        D              = 0x020,
        E              = 0x012,
        F              = 0x021,
        G              = 0x022,
        H              = 0x023,
        I              = 0x017,
        J              = 0x024,
        K              = 0x025,
        L              = 0x026,
        M              = 0x032,
        N              = 0x031,
        O              = 0x018,
        P              = 0x019,
        Q              = 0x010,
        R              = 0x013,
        S              = 0x01F,
        T              = 0x014,
        U              = 0x016,
        V              = 0x02F,
        W              = 0x011,
        X              = 0x02D,
        Y              = 0x015,
        Z              = 0x02C,
        SingleQuote    = 0x028,
        Backslash      = 0x02B,
        Comma          = 0x033,
        Equal          = 0x00D,
        Backtick       = 0x029,
        LeftBracket    = 0x01A,
        Minus          = 0x00C,
        Period         = 0x034,
        RightBracket   = 0x01B,
        Semicolon      = 0x027,
        Slash          = 0x035,
        Backspace      = 0x00E,
        Delete         = 0x153,
        End            = 0x14F,
        Enter          = 0x01C,
        Escape         = 0x001,
        GraveAccent    = 0x0C0,
        Home           = 0x147,
        Insert         = 0x152,
        Menu           = 0x15D,
        PageDown       = 0x151,
        PageUp         = 0x149,
        Pause          = 0x045,
        Space          = 0x039,
        Tab            = 0x00F,
        CapLock        = 0x03A,
        NumLock        = 0x145,
        ScrollLock     = 0x046,
        F1             = 0x03B,
        F2             = 0x03C,
        F3             = 0x03D,
        F4             = 0x03E,
        F5             = 0x03F,
        F6             = 0x040,
        F7             = 0x041,
        F8             = 0x042,
        F9             = 0x043,
        F10            = 0x044,
        F11            = 0x057,
        F12            = 0x058,
        F13            = 0x064,
        F14            = 0x065,
        F15            = 0x066,
        F16            = 0x067,
        F17            = 0x068,
        F18            = 0x069,
        F19            = 0x06A,
        F20            = 0x06B,
        F21            = 0x06C,
        F22            = 0x06D,
        F23            = 0x06E,
        F24            = 0x076,
        LeftAlt        = 0x038,
        LeftControl    = 0x01D,
        LeftShift      = 0x02A,
        LeftSuper      = 0x15B,
        PrintScreen    = 0x137,
        RightAlt       = 0x138,
        RightControl   = 0x11D,
        RightShift     = 0x036,
        RightSuper     = 0x15C,
        Down           = 0x150,
        Left           = 0x14B,
        Right          = 0x14D,
        Up             = 0x148,
        Numpad0        = 0x052,
        Numpad1        = 0x04F,
        Numpad2        = 0x050,
        Numpad3        = 0x051,
        Numpad4        = 0x04B,
        Numpad5        = 0x04C,
        Numpad6        = 0x04D,
        Numpad7        = 0x047,
        Numpad8        = 0x048,
        Numpad9        = 0x049,
        NumpadAdd      = 0x04E,
        NumpadDecimal  = 0x053,
        NumpadDivide   = 0x135,
        NumpadEnter    = 0x11C,
        NumpadEqual    = 0x059,
        NumpadMultiply = 0x037,
        NumpadSubtract = 0x04A
    };

    enum class MouseButton {
        Left   = 0,
        Right  = 1,
        Middle = 2
    };

    class IInputHandler {
        public:
            IInputHandler();
            virtual ~IInputHandler();

            virtual void onKeyDown(KeyboardKey key);
            virtual void onKeyUp(KeyboardKey key);
            virtual void onChar(u8 code);
            virtual void onMouseDown(MouseButton buttonIdx);
            virtual void onMouseUp(MouseButton buttonIdx);
            virtual void onMouseMove(i32 x, i32 y);
            virtual void onScroll(f32 delta);
            virtual void onWindowResize(Window* win, u32 width, u32 height);
            virtual void onWindowMove(Window* win, i32 x, i32 y);
    };
};