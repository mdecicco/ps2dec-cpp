export type EventMap = Record<string, (...args: any[]) => any>;

type ListenerOptions = {
    once?: boolean;
};

type InternalListener<Events extends EventMap, EvtTp extends keyof Events> = {
    id: number;
    callback: Events[EvtTp];
    options: ListenerOptions;
};
type ListenerMap<Events extends EventMap, EvtTp extends keyof Events> = InternalListener<Events, EvtTp>[];
type EventListenerStorage<Events extends EventMap> = {
    [eventName in keyof Events]?: ListenerMap<Events, eventName>;
};

export interface EventListener {
    id: number;
    remove: () => void;
}

export class EventProducer<Events extends EventMap> {
    private m_nextId: number;
    private m_listeners: EventListenerStorage<Events>;
    private static defaultOptions: ListenerOptions = {
        once: false
    };

    constructor() {
        this.m_nextId = 1;
        this.m_listeners = {};
    }

    addListener<Event extends keyof Events>(
        event: Event,
        callback: Events[Event],
        options?: ListenerOptions
    ): EventListener {
        const id = this.m_nextId++;
        if (!(event in this.m_listeners)) {
            this.m_listeners[event] = [];
        }

        const map = this.m_listeners[event] as ListenerMap<Events, Event>;
        map.push({
            id,
            callback,
            options: options ?? EventProducer.defaultOptions
        });

        return {
            id,
            remove: () => {
                const index = map.findIndex(l => l.id === id);
                if (index !== -1) map.splice(index, 1);
            }
        };
    }

    dispatch<Event extends keyof Events>(event: Event, ...args: Parameters<Events[Event]>) {
        if (!(event in this.m_listeners)) return [];
        const listeners = this.m_listeners[event] as ListenerMap<Events, Event>;

        const removeIndices: number[] = [];

        listeners.forEach((cb, idx) => {
            try {
                cb.callback(...args);
            } catch (err) {
                console.error(err);
            } finally {
                if (cb.options.once) removeIndices.push(idx);
            }
        });

        for (let i = removeIndices.length - 1; i >= 0; i--) {
            listeners.splice(removeIndices[i], 1);
        }
    }

    dispatchReverse<Event extends keyof Events>(event: Event, ...args: Parameters<Events[Event]>) {
        if (!(event in this.m_listeners)) return [];
        const listeners = this.m_listeners[event] as ListenerMap<Events, Event>;

        for (let i = listeners.length - 1; i >= 0; i--) {
            const cb = listeners[i];

            try {
                cb.callback(...args);
            } catch (err) {
                console.error(err);
            } finally {
                if (cb.options.once) listeners.splice(i, 1);
            }
        }
    }
}
