import { vec2 } from 'math-ext';
import { Window } from 'window';

import { Element } from '../renderer/element';
import { Overflow } from '../types/style';
import { TextNode } from '../types/text-node';
import { KeyboardEvent, MouseEvent, UIEvent, WheelEvent } from '../types/events';
import { getScrollBarHandles } from './box-geometry';
import { EventListener } from 'event';

function pointInBox(pos: vec2, x: f32, y: f32, width: f32, height: f32): boolean {
    if (pos.x < x || pos.x > x + width) return false;
    if (pos.y < y || pos.y > y + height) return false;
    return true;
}

const KeyMap: Record<KeyboardKey, string> = {
    [KeyboardKey.None]: '',
    [KeyboardKey._0]: '0',
    [KeyboardKey._1]: '1',
    [KeyboardKey._2]: '2',
    [KeyboardKey._3]: '3',
    [KeyboardKey._4]: '4',
    [KeyboardKey._5]: '5',
    [KeyboardKey._6]: '6',
    [KeyboardKey._7]: '7',
    [KeyboardKey._8]: '8',
    [KeyboardKey._9]: '9',
    [KeyboardKey.A]: 'a',
    [KeyboardKey.B]: 'b',
    [KeyboardKey.C]: 'c',
    [KeyboardKey.D]: 'd',
    [KeyboardKey.E]: 'e',
    [KeyboardKey.F]: 'f',
    [KeyboardKey.G]: 'g',
    [KeyboardKey.H]: 'h',
    [KeyboardKey.I]: 'i',
    [KeyboardKey.J]: 'j',
    [KeyboardKey.K]: 'k',
    [KeyboardKey.L]: 'l',
    [KeyboardKey.M]: 'm',
    [KeyboardKey.N]: 'n',
    [KeyboardKey.O]: 'o',
    [KeyboardKey.P]: 'p',
    [KeyboardKey.Q]: 'q',
    [KeyboardKey.R]: 'r',
    [KeyboardKey.S]: 's',
    [KeyboardKey.T]: 't',
    [KeyboardKey.U]: 'u',
    [KeyboardKey.V]: 'v',
    [KeyboardKey.W]: 'w',
    [KeyboardKey.X]: 'x',
    [KeyboardKey.Y]: 'y',
    [KeyboardKey.Z]: 'z',
    [KeyboardKey.SingleQuote]: "'",
    [KeyboardKey.Backslash]: '\\',
    [KeyboardKey.Comma]: ',',
    [KeyboardKey.Equal]: '=',
    [KeyboardKey.Backtick]: '`',
    [KeyboardKey.LeftBracket]: '[',
    [KeyboardKey.Minus]: '-',
    [KeyboardKey.Period]: '.',
    [KeyboardKey.RightBracket]: ']',
    [KeyboardKey.Semicolon]: ';',
    [KeyboardKey.Slash]: '/',
    [KeyboardKey.Backspace]: '',
    [KeyboardKey.Delete]: '',
    [KeyboardKey.End]: '',
    [KeyboardKey.Enter]: '\n',
    [KeyboardKey.Escape]: '',
    [KeyboardKey.GraveAccent]: '`',
    [KeyboardKey.Home]: '',
    [KeyboardKey.Insert]: '',
    [KeyboardKey.Menu]: '',
    [KeyboardKey.PageDown]: '',
    [KeyboardKey.PageUp]: '',
    [KeyboardKey.Pause]: '',
    [KeyboardKey.Space]: '',
    [KeyboardKey.Tab]: '\t',
    [KeyboardKey.CapLock]: '',
    [KeyboardKey.NumLock]: '',
    [KeyboardKey.ScrollLock]: '',
    [KeyboardKey.F1]: '',
    [KeyboardKey.F2]: '',
    [KeyboardKey.F3]: '',
    [KeyboardKey.F4]: '',
    [KeyboardKey.F5]: '',
    [KeyboardKey.F6]: '',
    [KeyboardKey.F7]: '',
    [KeyboardKey.F8]: '',
    [KeyboardKey.F9]: '',
    [KeyboardKey.F10]: '',
    [KeyboardKey.F11]: '',
    [KeyboardKey.F12]: '',
    [KeyboardKey.F13]: '',
    [KeyboardKey.F14]: '',
    [KeyboardKey.F15]: '',
    [KeyboardKey.F16]: '',
    [KeyboardKey.F17]: '',
    [KeyboardKey.F18]: '',
    [KeyboardKey.F19]: '',
    [KeyboardKey.F20]: '',
    [KeyboardKey.F21]: '',
    [KeyboardKey.F22]: '',
    [KeyboardKey.F23]: '',
    [KeyboardKey.F24]: '',
    [KeyboardKey.LeftAlt]: '',
    [KeyboardKey.LeftControl]: '',
    [KeyboardKey.LeftShift]: '',
    [KeyboardKey.LeftSuper]: '',
    [KeyboardKey.PrintScreen]: '',
    [KeyboardKey.RightAlt]: '',
    [KeyboardKey.RightControl]: '',
    [KeyboardKey.RightShift]: '',
    [KeyboardKey.RightSuper]: '',
    [KeyboardKey.Down]: '',
    [KeyboardKey.Left]: '',
    [KeyboardKey.Right]: '',
    [KeyboardKey.Up]: '',
    [KeyboardKey.Numpad0]: '0',
    [KeyboardKey.Numpad1]: '1',
    [KeyboardKey.Numpad2]: '2',
    [KeyboardKey.Numpad3]: '3',
    [KeyboardKey.Numpad4]: '4',
    [KeyboardKey.Numpad5]: '5',
    [KeyboardKey.Numpad6]: '6',
    [KeyboardKey.Numpad7]: '7',
    [KeyboardKey.Numpad8]: '8',
    [KeyboardKey.Numpad9]: '9',
    [KeyboardKey.NumpadAdd]: '+',
    [KeyboardKey.NumpadDecimal]: '.',
    [KeyboardKey.NumpadDivide]: '/',
    [KeyboardKey.NumpadEnter]: '\n',
    [KeyboardKey.NumpadEqual]: '=',
    [KeyboardKey.NumpadMultiply]: '*',
    [KeyboardKey.NumpadSubtract]: '-'
};

export class UIEventManager {
    private m_window: Window;
    private m_tree: Element | null;
    private m_lastElementBelowCursor: Element | null;
    private m_focusedElement: Element | null;
    private m_keysDown: Set<KeyboardKey>;
    private m_mouseButtonsDown: Set<MouseButton>;
    private m_cursorPosition: vec2;
    private m_mouseMoveListener: EventListener | null;
    private m_mouseDownListener: EventListener | null;
    private m_mouseUpListener: EventListener | null;
    private m_keyDownListener: EventListener | null;
    private m_keyUpListener: EventListener | null;
    private m_scrollListener: EventListener | null;

    constructor(window: Window) {
        this.m_window = window;
        this.m_tree = null;
        this.m_lastElementBelowCursor = null;
        this.m_focusedElement = null;
        this.m_keysDown = new Set<KeyboardKey>();
        this.m_mouseButtonsDown = new Set<MouseButton>();
        this.m_cursorPosition = new vec2();
        this.m_mouseMoveListener = null;
        this.m_mouseDownListener = null;
        this.m_mouseUpListener = null;
        this.m_keyDownListener = null;
        this.m_keyUpListener = null;
        this.m_scrollListener = null;
    }

    init() {
        this.m_mouseMoveListener = this.m_window.addListener('mouseMove', this.onMouseMove.bind(this));
        this.m_mouseDownListener = this.m_window.addListener('mouseDown', this.onMouseDown.bind(this));
        this.m_mouseUpListener = this.m_window.addListener('mouseUp', this.onMouseUp.bind(this));
        this.m_keyDownListener = this.m_window.addListener('keyDown', this.onKeyDown.bind(this));
        this.m_keyUpListener = this.m_window.addListener('keyUp', this.onKeyUp.bind(this));
        this.m_scrollListener = this.m_window.addListener('scroll', this.onScroll.bind(this));
    }

    shutdown() {
        if (this.m_mouseMoveListener) {
            this.m_mouseMoveListener.remove();
            this.m_mouseMoveListener = null;
        }

        if (this.m_mouseDownListener) {
            this.m_mouseDownListener.remove();
            this.m_mouseDownListener = null;
        }

        if (this.m_mouseUpListener) {
            this.m_mouseUpListener.remove();
            this.m_mouseUpListener = null;
        }

        if (this.m_keyDownListener) {
            this.m_keyDownListener.remove();
            this.m_keyDownListener = null;
        }

        if (this.m_keyUpListener) {
            this.m_keyUpListener.remove();
            this.m_keyUpListener = null;
        }

        if (this.m_scrollListener) {
            this.m_scrollListener.remove();
            this.m_scrollListener = null;
        }
    }

    setTreeRoot(root: Element) {
        if (root === this.m_tree) return;

        this.m_tree = root;
    }

    private elementAt(pos: vec2, currentNode?: Element): Element | null {
        if (!currentNode) currentNode = this.m_tree!;

        let isInSelf = false;
        if (currentNode.containsPoint(pos)) {
            isInSelf = true;
        } else if (currentNode.style.overflow !== Overflow.Visible) {
            // None of element's children will be visible at this position,
            // we can skip them
            return null;
        }

        for (const child of currentNode.children) {
            const result = this.elementAt(pos, child);
            if (result) return result;
        }

        return isInSelf ? currentNode : null;
    }

    private getRelativePos(element: Element, absPos: vec2) {
        const relPos = new vec2();
        const elePos = new vec2(element.style.clientRect.x, element.style.clientRect.y);
        vec2.sub(relPos, absPos, elePos);
        return relPos;
    }

    private getDeltaPos(absPos: vec2) {
        const deltaPos = new vec2();
        vec2.sub(deltaPos, absPos, this.m_cursorPosition);
        return deltaPos;
    }

    private propagate(element: Element, event: UIEvent, callback: (element: Element) => void) {
        callback(element);

        if (event.propagationStopped || !element.parent) return;
        this.propagate(element.parent, event, callback);
    }

    private blurElement() {
        if (!this.m_focusedElement) return;
        this.m_focusedElement.dispatch('blur', new UIEvent(this.m_focusedElement));
        this.m_focusedElement = null;
    }

    private focusElement(element: Element) {
        if (this.m_focusedElement === element) return;

        this.blurElement();
        this.m_focusedElement = element;
        element.dispatch('focus', new UIEvent(element));
    }

    private processScrollBarOnMouseMove(element: Element, pos: vec2) {
        if (element.source instanceof TextNode) {
            // Text nodes don't have scroll bars, check the parent
            if (!element.parent) return false;
            element = element.parent;
        }

        const scrollBarHandles = getScrollBarHandles(element);
        if (!scrollBarHandles) {
            if (element.rendererState.horizontalScrollBarHovered || element.rendererState.verticalScrollBarHovered) {
                element.rendererState.horizontalScrollBarHovered = false;
                element.rendererState.verticalScrollBarHovered = false;
                element.treeNode.root.enqueueForRender(element.treeNode);
            }

            return false;
        }

        const { horizontal, vertical } = scrollBarHandles;

        if (element.rendererState.horizontalScrollBarDragStart) {
            const delta = new vec2();
            vec2.sub(delta, pos, element.rendererState.horizontalScrollBarDragStart);
            element.scrollX =
                element.rendererState.horizontalScrollValueStart +
                delta.x * element.rendererState.horizontalScrollBarDragMultiplier;
            element.treeNode.root.enqueueForRender(element.treeNode);
            return true;
        }

        if (element.rendererState.verticalScrollBarDragStart) {
            const delta = new vec2();
            vec2.sub(delta, pos, element.rendererState.verticalScrollBarDragStart);
            element.scrollY =
                element.rendererState.verticalScrollValueStart +
                delta.y * element.rendererState.verticalScrollBarDragMultiplier;
            element.treeNode.root.enqueueForRender(element.treeNode);
            return true;
        }

        if (horizontal && pointInBox(pos, horizontal.x, horizontal.y, horizontal.width, horizontal.height)) {
            if (element.rendererState.horizontalScrollBarHovered) return true;

            element.rendererState.horizontalScrollBarHovered = true;
            element.treeNode.root.enqueueForRender(element.treeNode);
            return true;
        }

        if (element.rendererState.horizontalScrollBarHovered) {
            element.rendererState.horizontalScrollBarHovered = false;
            element.treeNode.root.enqueueForRender(element.treeNode);
        }

        if (vertical && pointInBox(pos, vertical.x, vertical.y, vertical.width, vertical.height)) {
            if (element.rendererState.verticalScrollBarHovered) return true;

            element.rendererState.verticalScrollBarHovered = true;
            element.treeNode.root.enqueueForRender(element.treeNode);
            return true;
        }

        if (element.rendererState.verticalScrollBarHovered) {
            element.rendererState.verticalScrollBarHovered = false;
            element.treeNode.root.enqueueForRender(element.treeNode);
        }

        return false;
    }

    private processScrollBarOnMouseDown(element: Element, pos: vec2) {
        if (element.source instanceof TextNode) {
            // Text nodes don't have scroll bars, check the parent
            if (!element.parent) return false;
            element = element.parent;
        }

        const scrollBarHandles = getScrollBarHandles(element);
        if (!scrollBarHandles) return false;

        const { horizontal, vertical } = scrollBarHandles;
        if (horizontal && element.rendererState.horizontalScrollBarHovered) {
            element.rendererState.horizontalScrollBarDragStart = new vec2(pos.x, pos.y);
            element.rendererState.horizontalScrollValueStart = element.scrollX;
            element.rendererState.horizontalScrollBarDragMultiplier = horizontal.scrollOffsetPerHandlePixel;
            element.treeNode.root.enqueueForRender(element.treeNode);
            return true;
        }

        if (vertical && element.rendererState.verticalScrollBarHovered) {
            element.rendererState.verticalScrollBarDragStart = new vec2(pos.x, pos.y);
            element.rendererState.verticalScrollValueStart = element.scrollY;
            element.rendererState.verticalScrollBarDragMultiplier = vertical.scrollOffsetPerHandlePixel;
            element.treeNode.root.enqueueForRender(element.treeNode);
            return true;
        }

        return false;
    }

    private processScrollBarOnMouseUp(element: Element, pos: vec2) {
        if (element.source instanceof TextNode) {
            // Text nodes don't have scroll bars, check the parent
            if (!element.parent) return false;
            element = element.parent;
        }

        const scrollBarHandles = getScrollBarHandles(element);
        if (!scrollBarHandles) return false;

        const { horizontal, vertical } = scrollBarHandles;
        if (horizontal && element.rendererState.horizontalScrollBarDragStart) {
            element.rendererState.horizontalScrollBarDragStart = null;
            element.rendererState.horizontalScrollValueStart = 0;
            const isHovered = pointInBox(pos, horizontal.x, horizontal.y, horizontal.width, horizontal.height);
            element.rendererState.horizontalScrollBarHovered = isHovered;
            element.treeNode.root.enqueueForRender(element.treeNode);
            return isHovered;
        }

        if (vertical && element.rendererState.verticalScrollBarDragStart) {
            element.rendererState.verticalScrollBarDragStart = null;
            element.rendererState.verticalScrollValueStart = 0;
            const isHovered = pointInBox(pos, vertical.x, vertical.y, vertical.width, vertical.height);
            element.rendererState.verticalScrollBarHovered = isHovered;
            element.treeNode.root.enqueueForRender(element.treeNode);
            return isHovered;
        }
    }

    private onMouseMove(x: f32, y: f32) {
        const pos = new vec2(x, y);
        const deltaPos = this.getDeltaPos(pos);

        this.m_cursorPosition.x = x;
        this.m_cursorPosition.y = y;

        if (!this.m_tree) return;
        const element = this.elementAt(pos) || this.m_tree;
        const relPos = this.getRelativePos(element, pos);

        if (this.processScrollBarOnMouseMove(element, pos)) return;

        const shiftKey = this.m_keysDown.has(KeyboardKey.LeftShift) || this.m_keysDown.has(KeyboardKey.RightShift);
        const ctrlKey = this.m_keysDown.has(KeyboardKey.LeftControl) || this.m_keysDown.has(KeyboardKey.RightControl);
        const altKey = this.m_keysDown.has(KeyboardKey.LeftAlt) || this.m_keysDown.has(KeyboardKey.RightAlt);

        if (this.m_lastElementBelowCursor && element !== this.m_lastElementBelowCursor) {
            let e: Element | null = this.m_lastElementBelowCursor;
            while (e) {
                if (e.rendererState.isHovered && !e.containsPoint(pos)) {
                    e.rendererState.isHovered = false;
                    const relPos = this.getRelativePos(e, pos);
                    const mouseLeave = new MouseEvent(e, relPos, pos, deltaPos, shiftKey, ctrlKey, altKey, null);

                    e.dispatch('mouseleave', mouseLeave);
                }
                e = e.parent;
            }

            const mouseOut = new MouseEvent(
                this.m_lastElementBelowCursor,
                relPos,
                pos,
                deltaPos,
                shiftKey,
                ctrlKey,
                altKey,
                null
            );

            this.propagate(this.m_lastElementBelowCursor, mouseOut, e => e.dispatch('mouseout', mouseOut));

            this.m_lastElementBelowCursor = null;
        }

        if (element !== this.m_lastElementBelowCursor) {
            this.m_lastElementBelowCursor = element;

            let e: Element | null = element;
            while (e) {
                if (!e.rendererState.isHovered && e.containsPoint(pos)) {
                    e.rendererState.isHovered = true;
                    const mouseEnter = new MouseEvent(e, relPos, pos, deltaPos, shiftKey, ctrlKey, altKey, null);
                    e.dispatch('mouseenter', mouseEnter);
                }
                e = e.parent;
            }

            const mouseOver = new MouseEvent(element, relPos, pos, deltaPos, shiftKey, ctrlKey, altKey, null);
            this.propagate(element, mouseOver, e => e.dispatch('mouseover', mouseOver));
        }

        this.m_window.cursor = element.style.cursor;

        const event = new MouseEvent(element, relPos, pos, deltaPos, shiftKey, ctrlKey, altKey, null);
        this.propagate(element, event, e => e.dispatch('mousemove', event));
    }

    private onMouseDown(button: MouseButton) {
        this.m_mouseButtonsDown.add(button);

        if (!this.m_tree) return;

        const element = this.elementAt(this.m_cursorPosition) || this.m_tree;

        if (this.processScrollBarOnMouseDown(element, this.m_cursorPosition)) return;

        const shiftKey = this.m_keysDown.has(KeyboardKey.LeftShift) || this.m_keysDown.has(KeyboardKey.RightShift);
        const ctrlKey = this.m_keysDown.has(KeyboardKey.LeftControl) || this.m_keysDown.has(KeyboardKey.RightControl);
        const altKey = this.m_keysDown.has(KeyboardKey.LeftAlt) || this.m_keysDown.has(KeyboardKey.RightAlt);
        const relPos = this.getRelativePos(element, this.m_cursorPosition);
        const deltaPos = new vec2();

        const event = new MouseEvent(
            element,
            relPos,
            this.m_cursorPosition,
            deltaPos,
            shiftKey,
            ctrlKey,
            altKey,
            button
        );

        this.propagate(element, event, e => e.dispatch('mousedown', event));

        if (!event.defaultPrevented) this.focusElement(element);
    }

    private onMouseUp(button: MouseButton) {
        this.m_mouseButtonsDown.delete(button);

        if (!this.m_tree) return;

        const element = this.elementAt(this.m_cursorPosition) || this.m_tree;

        if (this.processScrollBarOnMouseUp(element, this.m_cursorPosition)) return;

        const shiftKey = this.m_keysDown.has(KeyboardKey.LeftShift) || this.m_keysDown.has(KeyboardKey.RightShift);
        const ctrlKey = this.m_keysDown.has(KeyboardKey.LeftControl) || this.m_keysDown.has(KeyboardKey.RightControl);
        const altKey = this.m_keysDown.has(KeyboardKey.LeftAlt) || this.m_keysDown.has(KeyboardKey.RightAlt);
        const relPos = this.getRelativePos(element, this.m_cursorPosition);
        const deltaPos = new vec2();

        const event = new MouseEvent(
            element,
            relPos,
            this.m_cursorPosition,
            deltaPos,
            shiftKey,
            ctrlKey,
            altKey,
            button
        );

        this.propagate(element, event, e => e.dispatch('mouseup', event));

        if (event.defaultPrevented) return;

        if (button === MouseButton.Left) {
            const click = new MouseEvent(
                element,
                relPos,
                this.m_cursorPosition,
                deltaPos,
                shiftKey,
                ctrlKey,
                altKey,
                button
            );

            this.propagate(element, click, e => e.dispatch('click', click));
        }
    }

    private onKeyDown(key: KeyboardKey) {
        this.m_keysDown.add(key);

        if (!this.m_tree) return;

        const shiftKey = this.m_keysDown.has(KeyboardKey.LeftShift) || this.m_keysDown.has(KeyboardKey.RightShift);
        const ctrlKey = this.m_keysDown.has(KeyboardKey.LeftControl) || this.m_keysDown.has(KeyboardKey.RightControl);
        const altKey = this.m_keysDown.has(KeyboardKey.LeftAlt) || this.m_keysDown.has(KeyboardKey.RightAlt);

        const element = this.m_focusedElement || this.m_tree;
        const event = new KeyboardEvent(element, key, KeyMap[key], shiftKey, ctrlKey, altKey, false);
        this.propagate(element, event, e => e.dispatch('keydown', event));

        if (event.defaultPrevented) return;

        if (key === KeyboardKey.Escape) {
            this.blurElement();
        }
    }

    private onKeyUp(key: KeyboardKey) {
        this.m_keysDown.delete(key);

        if (!this.m_tree) return;

        const shiftKey = this.m_keysDown.has(KeyboardKey.LeftShift) || this.m_keysDown.has(KeyboardKey.RightShift);
        const ctrlKey = this.m_keysDown.has(KeyboardKey.LeftControl) || this.m_keysDown.has(KeyboardKey.RightControl);
        const altKey = this.m_keysDown.has(KeyboardKey.LeftAlt) || this.m_keysDown.has(KeyboardKey.RightAlt);

        const element = this.m_focusedElement || this.m_tree;
        const event = new KeyboardEvent(element, key, KeyMap[key], shiftKey, ctrlKey, altKey, false);
        this.propagate(element, event, e => e.dispatch('keyup', event));
    }

    private onScroll(delta: f32) {
        if (!this.m_tree) return;

        const shiftKey = this.m_keysDown.has(KeyboardKey.LeftShift) || this.m_keysDown.has(KeyboardKey.RightShift);
        const ctrlKey = this.m_keysDown.has(KeyboardKey.LeftControl) || this.m_keysDown.has(KeyboardKey.RightControl);
        const altKey = this.m_keysDown.has(KeyboardKey.LeftAlt) || this.m_keysDown.has(KeyboardKey.RightAlt);

        const element = this.m_focusedElement || this.m_tree;
        const event = new WheelEvent(element, new vec2(0, delta), shiftKey, ctrlKey, altKey);
        this.propagate(element, event, e => e.dispatch('mousewheel', event));
    }
}
