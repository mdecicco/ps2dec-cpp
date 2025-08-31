#pragma once
#include <decomp/utils/event.h>

#include <utils/Array.hpp>
#include <utils/Exception.h>

#include <tspp/utils/Callback.h>

namespace decomp {
    template <typename CallbackReturn, typename... CallbackArgs>
    Event<CallbackReturn, CallbackArgs...>::Event() {
        m_nextId       = 1;
        m_listeners    = nullptr;
        m_lastListener = nullptr;
    }

    template <typename CallbackReturn, typename... CallbackArgs>
    Event<CallbackReturn, CallbackArgs...>::~Event() {
        clear();
    }

    template <typename CallbackReturn, typename... CallbackArgs>
    EventListenerId Event<CallbackReturn, CallbackArgs...>::addListener(
        CallbackType callback, bool justOnce, bool isTsppCallback
    ) {
        if (!callback) {
            throw InputException("EventManager::addListener - callback cannot be null");
        }

        if (isTsppCallback) {
            tspp::Callback::AddRef(callback);
        }

        EventListenerId id       = m_nextId++;
        Listener* listener       = new Listener();
        listener->id             = id;
        listener->callback       = callback;
        listener->justOnce       = justOnce;
        listener->isTsppCallback = isTsppCallback;
        listener->next           = nullptr;
        listener->prev           = m_lastListener;

        if (m_lastListener) {
            m_lastListener->next = listener;
        } else {
            m_listeners = listener;
        }

        m_lastListener = listener;
        return id;
    }

    template <typename CallbackReturn, typename... CallbackArgs>
    void Event<CallbackReturn, CallbackArgs...>::removeListener(EventListenerId id) {
        Listener* listener = m_listeners;
        while (listener) {
            if (listener->id == id) {
                removeListener(listener);
                return;
            }

            listener = listener->next;
        }

        throw InputException("Event::removeListener - listener not found");
    }

    template <typename CallbackReturn, typename... CallbackArgs>
    typename Event<CallbackReturn, CallbackArgs...>::CallbackType Event<CallbackReturn, CallbackArgs...>::getListener(
        EventListenerId id
    ) {
        Listener* listener = m_listeners;
        while (listener) {
            if (listener->id == id) {
                return listener->callback;
            }

            listener = listener->next;
        }

        throw InputException("Event::getListener - listener not found");
    }

    template <typename CallbackReturn, typename... CallbackArgs>
    void Event<CallbackReturn, CallbackArgs...>::dispatch(CallbackArgs... args) {
        struct CachedListener {
            public:
                EventListenerId id;
                Listener* listener;
        };

        u32 count   = 0;
        Listener* l = m_listeners;
        while (l) {
            count++;
            l = l->next;
        }

        Array<CachedListener> cache(count);

        l = m_listeners;
        while (l) {
            cache.push({l->id, l});
            l = l->next;
        }

        for (u32 i = 0; i < cache.size(); i++) {
            CachedListener& c = cache[i];

            if (i > 0) {
                bool isRemoved = true;
                l              = m_listeners;
                while (l) {
                    if (l->id == c.id) {
                        isRemoved = false;
                        break;
                    }
                    l = l->next;
                }

                if (isRemoved) {
                    continue;
                }
            }

            bool removeAfterCall = c.listener->justOnce;

            c.listener->callback(std::forward<CallbackArgs>(args)...);

            if (removeAfterCall) {
                bool isRemoved = true;
                l              = m_listeners;
                while (l) {
                    if (l->id == c.id) {
                        isRemoved = false;
                        break;
                    }
                    l = l->next;
                }

                if (isRemoved) {
                    continue;
                }

                removeListener(c.listener);
            }
        }
    }

    template <typename CallbackReturn, typename... CallbackArgs>
    Array<CallbackReturn> Event<CallbackReturn, CallbackArgs...>::dispatchWithResults(CallbackArgs... args)
        requires(!std::is_void_v<CallbackReturn>)
    {
        Array<CallbackReturn> results;

        struct CachedListener {
            public:
                EventListenerId id;
                Listener* listener;
        };

        u32 count   = 0;
        Listener* l = m_listeners;
        while (l) {
            count++;
            l = l->next;
        }

        Array<CachedListener> cache(count);

        l = m_listeners;
        while (l) {
            cache.push({l->id, l});
            l = l->next;
        }

        for (u32 i = 0; i < cache.size(); i++) {
            CachedListener& c = cache[i];

            if (i > 0) {
                bool isRemoved = true;
                l              = m_listeners;
                while (l) {
                    if (l->id == c.id) {
                        isRemoved = false;
                        break;
                    }
                    l = l->next;
                }

                if (isRemoved) {
                    continue;
                }
            }

            bool removeAfterCall = c.listener->justOnce;

            results.push(c.listener->callback(std::forward<CallbackArgs>(args)...));

            if (removeAfterCall) {
                bool isRemoved = true;
                l              = m_listeners;
                while (l) {
                    if (l->id == c.id) {
                        isRemoved = false;
                        break;
                    }
                    l = l->next;
                }

                if (isRemoved) {
                    continue;
                }

                removeListener(c.listener);
            }
        }

        return results;
    }

    template <typename CallbackReturn, typename... CallbackArgs>
    void Event<CallbackReturn, CallbackArgs...>::removeListener(Listener* listener) {
        if (listener->prev) {
            listener->prev->next = listener->next;
        }

        if (listener->next) {
            listener->next->prev = listener->prev;
        }

        if (listener == m_lastListener) {
            m_lastListener = listener->prev;
        }

        if (listener == m_listeners) {
            m_listeners = listener->next;
        }

        if (listener->isTsppCallback) {
            tspp::Callback::Release(listener->callback);
        }

        delete listener;
    }

    template <typename CallbackReturn, typename... CallbackArgs>
    void Event<CallbackReturn, CallbackArgs...>::clear() {
        Listener* listener = m_listeners;
        while (listener) {
            if (listener->isTsppCallback) {
                tspp::Callback::Release(listener->callback);
            }
            Listener* next = listener->next;
            delete listener;
            listener = next;
        }

        m_listeners    = nullptr;
        m_lastListener = nullptr;
    }

    template <typename CallbackReturn, typename... CallbackArgs>
    void EventDispatcher<CallbackReturn, CallbackArgs...>::dispatch(
        Event<CallbackReturn, CallbackArgs...>& event, CallbackArgs... args
    ) const {
        event.dispatch(std::forward<CallbackArgs>(args)...);
    }

    template <typename CallbackReturn, typename... CallbackArgs>
    Array<CallbackReturn> EventDispatcher<CallbackReturn, CallbackArgs...>::dispatchWithResults(
        Event<CallbackReturn, CallbackArgs...>& event, CallbackArgs... args
    ) const
        requires(!std::is_void_v<CallbackReturn>)
    {
        return event.dispatchWithResults(std::forward<CallbackArgs>(args)...);
    }
}