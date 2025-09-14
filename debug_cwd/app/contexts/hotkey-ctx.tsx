import { useRootElement } from 'hooks';
import { KeyMap } from 'key-map';
import * as React from 'mini-react';
import { KeyboardEvent } from 'ui';

export type Hotkey = {
    key: KeyboardKey;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
};

type InternalHotkey = {
    id: number;
    name: string;
    callback: () => void;
} & Hotkey;

type HotkeyContext = {
    hotkeys: Map<number, InternalHotkey>;
};

const Context = React.createContext<HotkeyContext>();

export const HotkeyProvider: React.FC = props => {
    const root = useRootElement();
    const ctx = React.useRef<HotkeyContext>({
        hotkeys: new Map()
    });

    React.useEffect(() => {
        if (!root) return;

        const l = root.addListener('keydown', (e: KeyboardEvent) => {
            for (const h of ctx.current.hotkeys.values()) {
                if (h.key !== e.key) continue;
                if (!!h.ctrlKey !== e.ctrlKey) continue;
                if (!!h.shiftKey !== e.shiftKey) continue;
                if (!!h.altKey !== e.altKey) continue;
                h.callback();
            }
        });

        return () => l.remove();
    }, [root]);

    return <Context.Provider value={ctx.current}>{props.children}</Context.Provider>;
};

let nextHotkeyId = 1;

export function useHotkey(
    name: string,
    hotkey: Omit<Hotkey, 'name' | 'callback'> | null | undefined,
    callback: () => void
) {
    const ctx = React.useContext(Context);
    if (!ctx) throw new Error('useHotkey must be used within a HotkeyProvider');

    const id = React.useMemo(() => nextHotkeyId++, []);

    const hk = ctx.hotkeys.get(id);
    if (hk) {
        hk.name = name;
        hk.callback = callback;
    }

    React.useEffect(() => {
        if (!hotkey) return;
        ctx.hotkeys.set(id, {
            id,
            name,
            callback,
            ...hotkey
        });

        return () => ctx.hotkeys.delete(id);
    }, [hotkey]);
}

export function useManyHotkeys(hotkeys: { name: string; callback: () => void; hotkey: Hotkey }[]) {
    const ctx = React.useContext(Context);
    if (!ctx) throw new Error('useManyHotkeys must be used within a HotkeyProvider');

    const internal = React.useRef<InternalHotkey[]>([]);

    React.useEffect(() => {
        for (const hk of hotkeys) {
            const existing = internal.current.find(h => {
                if (h.name !== hk.name) return false;
                if (h.ctrlKey !== hk.hotkey.ctrlKey) return false;
                if (h.shiftKey !== hk.hotkey.shiftKey) return false;
                if (h.altKey !== hk.hotkey.altKey) return false;
                if (h.key !== hk.hotkey.key) return false;
                return true;
            });

            if (existing) {
                existing.name = hk.name;
                existing.callback = hk.callback;
                continue;
            }

            const newHk = {
                id: nextHotkeyId++,
                name: hk.name,
                callback: hk.callback,
                ...hk.hotkey
            };

            internal.current.push(newHk);
            ctx.hotkeys.set(newHk.id, newHk);
        }

        for (const hk of internal.current) {
            const isRemoved = !hotkeys.some(h => {
                if (h.name !== hk.name) return false;
                if (h.hotkey.ctrlKey !== hk.ctrlKey) return false;
                if (h.hotkey.shiftKey !== hk.shiftKey) return false;
                if (h.hotkey.altKey !== hk.altKey) return false;
                if (h.hotkey.key !== hk.key) return false;
                return true;
            });

            if (!isRemoved) continue;

            ctx.hotkeys.delete(hk.id);
            internal.current = internal.current.filter(h => h.id !== hk.id);
        }
    }, [hotkeys]);

    React.useEffect(() => {
        return () => {
            for (const hk of internal.current) {
                ctx.hotkeys.delete(hk.id);
            }

            internal.current = [];
        };
    }, []);
}

export function getHotkeyString(hotkey: Hotkey) {
    let result = '';
    if (hotkey.ctrlKey) result += 'CTRL+';
    if (hotkey.altKey) result += 'ALT+';
    if (hotkey.shiftKey) result += 'SHIFT+';
    result += KeyMap[hotkey.key].toUpperCase();
    return result;
}
