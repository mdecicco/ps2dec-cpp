import { ClientWindow } from 'client-window';
import { decompiler, IWithLogging } from 'decompiler';
import { EventProducer } from 'event';
import { vec2 } from 'math-ext';

type WindowEvents = {
    open: () => void;
    close: () => void;
    focus: () => void;
    blur: () => void;
    resize: (width: number, height: number) => void;
    move: (x: number, y: number) => void;
    keyDown: (key: KeyboardKey) => void;
    keyUp: (key: KeyboardKey) => void;
    mouseMove: (x: number, y: number) => void;
    mouseDown: (button: MouseButton) => void;
    mouseUp: (button: MouseButton) => void;
    scroll: (delta: number) => void;
};

export class Window extends EventProducer<WindowEvents> {
    private m_clientWindow: ClientWindow;
    private m_isDestroyed: boolean;
    private m_isOpen: boolean;
    private m_isFocused: boolean;
    private m_title: string;
    private m_borderEnabled: boolean;
    private m_cursorIcon: CursorIcon;
    private m_size: vec2;
    private m_position: vec2;
    private m_openListener: u32 | null;
    private m_closeListener: u32 | null;
    private m_focusListener: u32 | null;
    private m_blurListener: u32 | null;
    private m_resizeListener: u32 | null;
    private m_moveListener: u32 | null;
    private m_keyDownListener: u32 | null;
    private m_keyUpListener: u32 | null;
    private m_mouseMoveListener: u32 | null;
    private m_mouseDownListener: u32 | null;
    private m_mouseUpListener: u32 | null;
    private m_scrollListener: u32 | null;

    constructor(title?: string, width?: number, height?: number) {
        super();
        this.m_clientWindow = new ClientWindow(title ?? '', width ?? 200, height ?? 200);
        this.m_isDestroyed = false;
        this.m_isOpen = false;
        this.m_isFocused = false;
        this.m_title = '';
        this.m_borderEnabled = true;
        this.m_cursorIcon = CursorIcon.Default;
        this.m_size = new vec2(width ?? 200, height ?? 200);
        this.m_position = new vec2(0, 0);
        this.m_openListener = null;
        this.m_closeListener = null;
        this.m_focusListener = null;
        this.m_blurListener = null;
        this.m_resizeListener = null;
        this.m_moveListener = null;
        this.m_keyDownListener = null;
        this.m_keyUpListener = null;
        this.m_mouseMoveListener = null;
        this.m_mouseDownListener = null;
        this.m_mouseUpListener = null;
        this.m_scrollListener = null;

        decompiler.addWindow(this.m_clientWindow);
        this.m_clientWindow.setPosition(0, 0);

        this.bindListeners();
    }

    destroy() {
        if (this.m_isDestroyed) return;
        if (this.m_openListener) this.m_clientWindow.offOpen(this.m_openListener);
        if (this.m_closeListener) this.m_clientWindow.offClose(this.m_closeListener);
        if (this.m_focusListener) this.m_clientWindow.offFocus(this.m_focusListener);
        if (this.m_blurListener) this.m_clientWindow.offBlur(this.m_blurListener);
        if (this.m_resizeListener) this.m_clientWindow.offResize(this.m_resizeListener);
        if (this.m_moveListener) this.m_clientWindow.offMove(this.m_moveListener);
        if (this.m_keyDownListener) this.m_clientWindow.offKeyDown(this.m_keyDownListener);
        if (this.m_keyUpListener) this.m_clientWindow.offKeyUp(this.m_keyUpListener);
        if (this.m_mouseMoveListener) this.m_clientWindow.offMouseMove(this.m_mouseMoveListener);
        if (this.m_mouseDownListener) this.m_clientWindow.offMouseDown(this.m_mouseDownListener);
        if (this.m_mouseUpListener) this.m_clientWindow.offMouseUp(this.m_mouseUpListener);
        if (this.m_scrollListener) this.m_clientWindow.offScroll(this.m_scrollListener);

        this.m_clientWindow.destroy();
        this.m_isDestroyed = true;
        this.m_isOpen = false;
    }

    private bindListeners() {
        this.m_openListener = this.m_clientWindow.onOpen(() => {
            this.m_isOpen = true;
            this.dispatch('open');
        });

        this.m_closeListener = this.m_clientWindow.onClose(() => {
            this.m_isOpen = false;
            this.dispatch('close');
        });

        this.m_focusListener = this.m_clientWindow.onFocus(() => {
            this.m_isFocused = true;
            this.dispatch('focus');
        });

        this.m_blurListener = this.m_clientWindow.onBlur(() => {
            this.m_isFocused = false;
            this.dispatch('blur');
        });

        this.m_resizeListener = this.m_clientWindow.onResize((width, height) => {
            this.m_size.x = width;
            this.m_size.y = height;
            this.dispatch('resize', width, height);
        });

        this.m_moveListener = this.m_clientWindow.onMove((x, y) => {
            this.dispatch('move', x, y);
        });

        this.m_keyDownListener = this.m_clientWindow.onKeyDown(key => {
            this.dispatch('keyDown', key);
        });

        this.m_keyUpListener = this.m_clientWindow.onKeyUp(key => {
            this.dispatch('keyUp', key);
        });

        this.m_mouseMoveListener = this.m_clientWindow.onMouseMove((x, y) => {
            this.dispatch('mouseMove', x, y);
        });

        this.m_mouseDownListener = this.m_clientWindow.onMouseDown(button => {
            this.dispatch('mouseDown', button);
        });

        this.m_mouseUpListener = this.m_clientWindow.onMouseUp(button => {
            this.dispatch('mouseUp', button);
        });

        this.m_scrollListener = this.m_clientWindow.onScroll(delta => {
            this.dispatch('scroll', delta);
        });
    }

    get isDestroyed() {
        return this.m_isDestroyed;
    }

    get internalHandle() {
        return this.m_clientWindow;
    }

    get isOpen() {
        return this.m_isOpen;
    }

    get title() {
        return this.m_title;
    }

    set title(title: string) {
        if (this.m_title === title) return;
        this.m_title = title;
        this.m_clientWindow.setTitle(title);
    }

    get width() {
        return this.m_size.x;
    }

    set width(width: number) {
        this.m_clientWindow.setSize(width, this.m_size.y);
    }

    get height() {
        return this.m_size.y;
    }

    set height(height: number) {
        this.m_clientWindow.setSize(this.m_size.x, height);
    }

    get size() {
        return this.m_size;
    }

    set size(size: vec2) {
        this.m_clientWindow.setSize(size.x, size.y);
    }

    get positionX() {
        return this.m_position.x;
    }

    set positionX(x: number) {
        this.m_clientWindow.setPosition(x, this.m_position.y);
    }

    get positionY() {
        return this.m_position.y;
    }

    set positionY(y: number) {
        this.m_clientWindow.setPosition(this.m_position.x, y);
    }

    get position() {
        return this.m_position;
    }

    set position(position: vec2) {
        this.m_clientWindow.setPosition(position.x, position.y);
    }

    get isFocused() {
        return this.m_isFocused;
    }

    get borderEnabled() {
        return this.m_borderEnabled;
    }

    set borderEnabled(borderEnabled: boolean) {
        if (this.m_borderEnabled === borderEnabled) return;
        this.m_borderEnabled = borderEnabled;
        this.m_clientWindow.setBorderEnabled(borderEnabled);
    }

    set cursor(icon: CursorIcon) {
        if (this.m_cursorIcon === icon) return;
        this.m_cursorIcon = icon;
        this.m_clientWindow.setCursorIcon(icon);
    }

    get cursor() {
        return this.m_cursorIcon;
    }

    open() {
        if (this.m_isOpen) return;
        this.m_clientWindow.setOpen(true);
    }

    close() {
        if (!this.m_isOpen) return;
        this.m_clientWindow.setOpen(false);
    }

    focus() {
        if (this.m_isFocused) return;
        this.m_clientWindow.focus();
    }

    addNestedLogger(logger: IWithLogging) {
        this.m_clientWindow.addNestedLogger(logger);
    }

    removeNestedLogger(logger: IWithLogging) {
        this.m_clientWindow.removeNestedLogger(logger);
    }
}
