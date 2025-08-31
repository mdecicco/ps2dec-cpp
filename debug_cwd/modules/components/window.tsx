import * as React from 'mini-react';
import { Window } from 'window';
import { decompiler } from 'decompiler';

type WindowProps = {
    window: Window;
    open?: boolean;
    title?: string;
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    borderEnabled?: boolean;
    onOpen?: () => void;
    onClose?: () => void;
    onFocus?: () => void;
    onBlur?: () => void;
    onResize?: (width: number, height: number) => void;
    onMove?: (x: number, y: number) => void;
    onKeyDown?: (key: KeyboardKey) => void;
    onKeyUp?: (key: KeyboardKey) => void;
    onMouseMove?: (x: number, y: number) => void;
    onMouseDown?: (button: MouseButton) => void;
    onMouseUp?: (button: MouseButton) => void;
    onScroll?: (delta: number) => void;
    children?: React.ReactNode;
};

type WindowContext = {
    window: Window;
    isOpen: boolean;
    isFocused: boolean;
    size: { width: number; height: number };
    position: { x: number; y: number };
};

const Context = React.createContext<WindowContext>();

export const WindowProvider: React.FC<WindowProps> = props => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);
    const [size, setSize] = React.useState({ width: props.width ?? 0, height: props.height ?? 0 });
    const [position, setPosition] = React.useState({ x: props.x ?? 0, y: props.y ?? 0 });
    const { window } = props;

    React.useEffect(() => {
        const sz = window.getSize();
        const p = window.getPosition();
        const open = window.isOpen();
        const focused = window.isFocused();

        if (sz.x !== size.width || sz.y !== size.height) {
            setSize({ width: sz.x, height: sz.y });
        }

        if (p.x !== position.x || p.y !== position.y) {
            setPosition({ x: p.x, y: p.y });
        }

        if (open !== isOpen) {
            setIsOpen(open);
        }

        if (focused !== isFocused) {
            setIsFocused(focused);
        }

        const openListener = window.onOpen(() => {
            setIsOpen(true);
            if (props.onOpen) props.onOpen();
        });

        const closeListener = window.onClose(() => {
            setIsOpen(false);
            if (props.onClose) props.onClose();
        });

        const focusListener = window.onFocus(() => {
            setIsFocused(true);
            if (props.onFocus) props.onFocus();
        });

        const blurListener = window.onBlur(() => {
            setIsFocused(false);
            if (props.onBlur) props.onBlur();
        });

        const resizeListener = window.onResize((width, height) => {
            setSize({ width, height });
            if (props.onResize) props.onResize(width, height);
        });

        const moveListener = window.onMove((x, y) => {
            setPosition({ x, y });
            if (props.onMove) props.onMove(x, y);
        });

        return () => {
            console.log(`Destroying window ${window.getTitle()}`);

            window.offOpen(openListener);
            window.offClose(closeListener);
            window.offFocus(focusListener);
            window.offBlur(blurListener);
            window.offResize(resizeListener);
            window.offMove(moveListener);

            window.destroy();
        };
    }, []);

    React.useEffect(() => {
        if (props.title) {
            window.setTitle(props.title);
        }
    }, [props.title]);

    React.useEffect(() => {
        if (props.width || props.height) {
            let newWidth = props.width ?? size.width;
            let newHeight = props.height ?? size.height;

            if (newWidth !== size.width || newHeight !== size.height) {
                window.setSize(newWidth, newHeight);
            }
        }
    }, [props.width, props.height]);

    React.useEffect(() => {
        if (props.x || props.y) {
            let newX = props.x ?? position.x;
            let newY = props.y ?? position.y;

            if (newX !== position.x || newY !== position.y) {
                window.setPosition(newX, newY);
            }
        }
    }, [props.x, props.y, position]);

    React.useEffect(() => {
        if (props.open === true && !isOpen) {
            window.setOpen(true);
        } else if (props.open === false && isOpen) {
            window.setOpen(false);
        }
    }, [isOpen, props.open]);

    React.useEffect(() => {
        if (props.onKeyDown && window) {
            const listener = window.onKeyDown(props.onKeyDown);

            return () => {
                window.offKeyDown(listener);
            };
        }
    }, [props.onKeyDown]);

    React.useEffect(() => {
        if (props.onKeyUp && window) {
            const listener = window.onKeyUp(props.onKeyUp);

            return () => {
                window.offKeyUp(listener);
            };
        }
    }, [props.onKeyUp]);

    React.useEffect(() => {
        if (props.onMouseMove && window) {
            const listener = window.onMouseMove(props.onMouseMove);

            return () => {
                window.offMouseMove(listener);
            };
        }
    }, [props.onMouseMove]);

    React.useEffect(() => {
        if (props.onMouseDown && window) {
            const listener = window.onMouseDown(props.onMouseDown);

            return () => {
                window.offMouseDown(listener);
            };
        }
    }, [props.onMouseDown]);

    React.useEffect(() => {
        if (props.onMouseUp && window) {
            const listener = window.onMouseUp(props.onMouseUp);

            return () => {
                window.offMouseUp(listener);
            };
        }
    }, [props.onMouseUp]);

    React.useEffect(() => {
        if (props.onScroll && window) {
            const listener = window.onScroll(props.onScroll);

            return () => {
                window.offScroll(listener);
            };
        }
    }, [props.onScroll]);

    if (!isOpen) return null;

    return (
        <Context.Provider
            value={{
                window,
                isOpen,
                isFocused,
                size,
                position
            }}
        >
            {props.children}
        </Context.Provider>
    );
};

export function useCurrentWindow() {
    const context = React.useContext(Context);
    if (!context) {
        throw new Error('useCurrentWindow must be used within a Window component');
    }

    return context;
}
