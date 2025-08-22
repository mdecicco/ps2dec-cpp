#pragma once
#include <decomp/utils/event.h>

#include <utils/Array.hpp>
#include <utils/Exception.h>

#include <tspp/utils/Callback.h>

namespace decomp {
    template <typename CallbackReturn, typename... CallbackArgs>
    Event<CallbackReturn, CallbackArgs...>::Event() {
        m_nextId = 1;
    }

    template <typename CallbackReturn, typename... CallbackArgs>
    Event<CallbackReturn, CallbackArgs...>::~Event() {
        for (const Listener& listener : m_listeners) {
            if (listener.isTsppCallback) {
                tspp::Callback::Release(listener.callback);
            }
        }
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

        EventListenerId id = m_nextId++;
        m_listeners.push({id, callback, justOnce, isTsppCallback});
        return id;
    }

    template <typename CallbackReturn, typename... CallbackArgs>
    void Event<CallbackReturn, CallbackArgs...>::removeListener(EventListenerId id) {
        for (u32 i = 0; i < m_listeners.size(); i++) {
            if (m_listeners[i].id == id) {
                m_listeners.remove(i);

                if (m_listeners[i].isTsppCallback) {
                    tspp::Callback::Release(m_listeners[i].callback);
                }
                return;
            }
        }

        throw InputException("Event::removeListener - listener not found");
    }

    template <typename CallbackReturn, typename... CallbackArgs>
    typename Event<CallbackReturn, CallbackArgs...>::CallbackType Event<CallbackReturn, CallbackArgs...>::getListener(
        EventListenerId id
    ) {
        for (const Listener& listener : m_listeners) {
            if (listener.id == id) {
                return listener.callback;
            }
        }

        throw InputException("Event::getListener - listener not found");
    }

    template <typename CallbackReturn, typename... CallbackArgs>
    void Event<CallbackReturn, CallbackArgs...>::dispatch(CallbackArgs... args) {
        Array<EventListenerId> toRemove;

        for (const Listener& listener : m_listeners) {
            listener.callback(std::forward<CallbackArgs>(args)...);
            if (listener.justOnce) {
                toRemove.push(listener.id);
            }
        }

        for (EventListenerId id : toRemove) {
            removeListener(id);
        }
    }

    template <typename CallbackReturn, typename... CallbackArgs>
    Array<CallbackReturn> Event<CallbackReturn, CallbackArgs...>::dispatchWithResults(CallbackArgs... args)
        requires(!std::is_void_v<CallbackReturn>)
    {
        Array<CallbackReturn> results;
        Array<EventListenerId> toRemove;

        for (const Listener& listener : m_listeners) {
            results.push(listener.callback(std::forward<CallbackArgs>(args)...));

            if (listener.justOnce) {
                toRemove.push(listener.id);
            }
        }

        for (EventListenerId id : toRemove) {
            removeListener(id);
        }

        return results;
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