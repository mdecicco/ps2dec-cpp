#pragma once
#include <decomp/types.h>
#include <utils/Array.h>

namespace decomp {
    typedef u32 EventListenerId;

    template <typename CallbackReturn, typename... CallbackArgs>
    class EventDispatcher;

    template <typename CallbackReturn, typename... CallbackArgs>
    class Event {
        public:
            using CallbackType = CallbackReturn (*)(CallbackArgs...);

            Event();
            ~Event();

            EventListenerId addListener(CallbackType callback, bool justOnce = false, bool isTsppCallback = false);
            void removeListener(EventListenerId id);
            CallbackType getListener(EventListenerId id);

        protected:
            friend class EventDispatcher<CallbackReturn, CallbackArgs...>;

            void dispatch(CallbackArgs... args);

            /* clang-format off */
            Array<CallbackReturn> dispatchWithResults(CallbackArgs... args)
            requires (!std::is_void_v<CallbackReturn>);
            /* clang-format on */

        private:
            struct Listener {
                public:
                    EventListenerId id;
                    CallbackType callback;
                    bool justOnce;
                    bool isTsppCallback;
            };

            Array<Listener> m_listeners;
            EventListenerId m_nextId;
    };

    template <typename CallbackReturn, typename... CallbackArgs>
    class EventDispatcher {
        public:
            using CallbackType = CallbackReturn (*)(CallbackArgs...);

            void dispatch(Event<CallbackReturn, CallbackArgs...>& event, CallbackArgs... args) const;

            /* clang-format off */
            Array<CallbackReturn> dispatchWithResults(Event<CallbackReturn, CallbackArgs...>& event, CallbackArgs... args) const
            requires (!std::is_void_v<CallbackReturn>);
            /* clang-format on */
    };
}