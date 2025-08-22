#include <decomp/app/input.h>

namespace decomp {
    IInputHandler::IInputHandler() {}
    IInputHandler::~IInputHandler() {}

    void IInputHandler::onKeyDown(KeyboardKey key) {}
    void IInputHandler::onKeyUp(KeyboardKey key) {}
    void IInputHandler::onChar(u8 code) {}
    void IInputHandler::onMouseDown(MouseButton buttonIdx) {}
    void IInputHandler::onMouseUp(MouseButton buttonIdx) {}
    void IInputHandler::onMouseMove(i32 x, i32 y) {}
    void IInputHandler::onScroll(f32 delta) {}
    void IInputHandler::onWindowResize(Window* win, u32 width, u32 height) {}
    void IInputHandler::onWindowMove(Window* win, i32 x, i32 y) {}
};