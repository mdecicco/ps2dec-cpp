import { vec2 } from 'math-ext';
import type { Element } from '../renderer/element';

export class UIEvent {
    private m_target: Element | null;
    private m_defaultPrevented: boolean;
    private m_propagationStopped: boolean;

    constructor(target: Element | null) {
        this.m_target = target;
        this.m_defaultPrevented = false;
        this.m_propagationStopped = false;
    }

    get target() {
        return this.m_target;
    }

    get defaultPrevented() {
        return this.m_defaultPrevented;
    }

    get propagationStopped() {
        return this.m_propagationStopped;
    }

    preventDefault() {
        this.m_defaultPrevented = true;
    }

    stopPropagation() {
        this.m_propagationStopped = true;
    }

    toString() {
        return `UIEvent { target: ${this.m_target?.source.node || 'null'} }`;
    }
}

export class MouseEvent extends UIEvent {
    private m_relativePosition: vec2;
    private m_absolutePosition: vec2;
    private m_deltaPosition: vec2;
    private m_shiftKey: boolean;
    private m_ctrlKey: boolean;
    private m_altKey: boolean;
    private m_button: MouseButton | null;

    constructor(
        target: Element,
        relativePosition: vec2,
        absolutePosition: vec2,
        deltaPosition: vec2,
        shiftKey: boolean,
        ctrlKey: boolean,
        altKey: boolean,
        button: MouseButton | null
    ) {
        super(target);

        this.m_relativePosition = relativePosition;
        this.m_absolutePosition = absolutePosition;
        this.m_deltaPosition = deltaPosition;
        this.m_shiftKey = shiftKey;
        this.m_ctrlKey = ctrlKey;
        this.m_altKey = altKey;
        this.m_button = button;
    }

    get relativePosition() {
        return this.m_relativePosition;
    }

    get absolutePosition() {
        return this.m_absolutePosition;
    }

    get deltaPosition() {
        return this.m_deltaPosition;
    }

    get shiftKey() {
        return this.m_shiftKey;
    }

    get ctrlKey() {
        return this.m_ctrlKey;
    }

    get altKey() {
        return this.m_altKey;
    }

    get button() {
        return this.m_button;
    }

    toString() {
        return `MouseEvent { relativePosition: ${this.m_relativePosition}, absolutePosition: ${
            this.m_absolutePosition
        }, deltaPosition: ${this.m_deltaPosition}, shiftKey: ${this.m_shiftKey ? 'true' : 'false'}, ctrlKey: ${
            this.m_ctrlKey ? 'true' : 'false'
        }, altKey: ${this.m_altKey ? 'true' : 'false'}, button: ${this.m_button} }`;
    }
}

export class WheelEvent extends UIEvent {
    private m_delta: vec2;
    private m_shiftKey: boolean;
    private m_ctrlKey: boolean;
    private m_altKey: boolean;

    constructor(target: Element | null, delta: vec2, shiftKey: boolean, ctrlKey: boolean, altKey: boolean) {
        super(target);

        this.m_delta = delta;
        this.m_shiftKey = shiftKey;
        this.m_ctrlKey = ctrlKey;
        this.m_altKey = altKey;
    }

    get delta() {
        return this.m_delta;
    }

    get shiftKey() {
        return this.m_shiftKey;
    }

    get ctrlKey() {
        return this.m_ctrlKey;
    }

    get altKey() {
        return this.m_altKey;
    }

    toString() {
        return `WheelEvent { delta: ${this.m_delta}, shiftKey: ${this.m_shiftKey ? 'true' : 'false'}, ctrlKey: ${
            this.m_ctrlKey ? 'true' : 'false'
        }, altKey: ${this.m_altKey ? 'true' : 'false'} }`;
    }
}

export class ScrollEvent extends UIEvent {
    private m_delta: vec2;

    constructor(target: Element | null, delta: vec2) {
        super(target);

        this.m_delta = delta;
    }

    get delta() {
        return this.m_delta;
    }

    toString() {
        return `ScrollEvent { delta: ${this.m_delta} }`;
    }
}

export class KeyboardEvent extends UIEvent {
    private m_key: KeyboardKey;
    private m_char: string;
    private m_shiftKey: boolean;
    private m_ctrlKey: boolean;
    private m_altKey: boolean;
    private m_repeat: boolean;

    constructor(
        target: Element | null,
        key: KeyboardKey,
        char: string,
        shiftKey: boolean,
        ctrlKey: boolean,
        altKey: boolean,
        repeat: boolean
    ) {
        super(target);

        this.m_key = key;
        this.m_char = char;
        this.m_shiftKey = shiftKey;
        this.m_ctrlKey = ctrlKey;
        this.m_altKey = altKey;
        this.m_repeat = repeat;
    }

    get key() {
        return this.m_key;
    }

    get char() {
        return this.m_char;
    }

    get shiftKey() {
        return this.m_shiftKey;
    }

    get ctrlKey() {
        return this.m_ctrlKey;
    }

    get altKey() {
        return this.m_altKey;
    }

    get repeat() {
        return this.m_repeat;
    }

    toString() {
        return `KeyboardEvent { key: ${this.m_key}, char: '${this.m_char}', shiftKey: ${
            this.m_shiftKey ? 'true' : 'false'
        }, ctrlKey: ${this.m_ctrlKey ? 'true' : 'false'}, altKey: ${this.m_altKey ? 'true' : 'false'}, repeat: ${
            this.m_repeat ? 'true' : 'false'
        } }`;
    }
}

export class ResizeEvent extends UIEvent {
    private m_width: number;
    private m_height: number;
    private m_prevWidth: number;
    private m_prevHeight: number;

    constructor(target: Element | null, width: number, height: number, prevWidth: number, prevHeight: number) {
        super(target);

        this.m_width = width;
        this.m_height = height;
        this.m_prevWidth = prevWidth;
        this.m_prevHeight = prevHeight;
    }

    get size() {
        return new vec2(this.m_width, this.m_height);
    }

    get prevSize() {
        return new vec2(this.m_prevWidth, this.m_prevHeight);
    }

    get deltaSize() {
        return new vec2(this.m_width - this.m_prevWidth, this.m_height - this.m_prevHeight);
    }

    get width() {
        return this.m_width;
    }

    get height() {
        return this.m_height;
    }

    get prevWidth() {
        return this.m_prevWidth;
    }

    get prevHeight() {
        return this.m_prevHeight;
    }

    get deltaWidth() {
        return this.m_width - this.m_prevWidth;
    }

    get deltaHeight() {
        return this.m_height - this.m_prevHeight;
    }

    toString() {
        return `ResizeEvent { width: ${this.m_width}, height: ${this.m_height}, prevWidth: ${this.m_prevWidth}, prevHeight: ${this.m_prevHeight} }`;
    }
}
