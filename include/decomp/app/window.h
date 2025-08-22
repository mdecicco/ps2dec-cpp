#pragma once
#include <decomp/types.h>
#include <decomp/utils/event.h>
#include <decomp/utils/math.hpp>

#include <decomp/app/input.h>

#include <render/IWithRendering.h>

#include <utils/Array.h>
#include <utils/String.h>

namespace decomp {
    struct MonitorInfo {
        public:
            bool isPrimary;
            vec2ui virtualDimensions;
            vec2ui actualDimensions;
            vec2i position;
            u32 bitsPerPixel;
            u32 refreshRate;
            void* handle;
    };

    class Window_Impl;
    class Application;
    class Window : public render::IWithRendering {
        public:
            Window();
            Window(const utils::String& title);
            Window(u32 width, u32 height);
            Window(const utils::String& title, u32 width, u32 height);
            Window(Window* parent);
            Window(Window* parent, const utils::String& title);
            Window(Window* parent, u32 width, u32 height);
            Window(Window* parent, const utils::String& title, u32 width, u32 height);
            ~Window();

            virtual const render::vulkan::PhysicalDevice* choosePhysicalDevice(
                const Array<render::vulkan::PhysicalDevice>& devices
            );
            virtual bool setupInstance(render::vulkan::Instance* instance) override;
            virtual bool setupDevice(render::vulkan::LogicalDevice* device) override;
            virtual bool setupSwapchain(
                render::vulkan::SwapChain* swapChain,
                const render::vulkan::SwapChainSupport& support,
                u32 sampleCount = 1
            ) override;

            bool setOpen(bool open);
            bool isOpen() const;
            bool focus();
            bool isFocused() const;
            bool setBorderEnabled(bool borderEnabled);
            bool isBorderEnabled() const;
            bool setTitle(const utils::String& title);
            utils::String getTitle() const;
            bool setSize(u32 width, u32 height);
            vec2ui getSize() const;
            bool setPosition(i32 x, i32 y);
            vec2i getPosition() const;
            bool pollEvents();
            void* getHandle() const;

            void subscribeInputHandler(IInputHandler* handler);
            void unsubscribeInputHandler(IInputHandler* handler);

            static utils::Array<MonitorInfo> getMonitors();

            Event<void> onOpen;
            Event<void> onClose;
            Event<void> onFocus;
            Event<void> onBlur;
            Event<void, u32, u32> onResize;
            Event<void, i32, i32> onMove;
            Event<void, KeyboardKey> onKeyDown;
            Event<void, KeyboardKey> onKeyUp;
            Event<void, i32, i32> onMouseMove;
            Event<void, MouseButton> onMouseDown;
            Event<void, MouseButton> onMouseUp;
            Event<void, f32> onScroll;

        protected:
            friend class Application;
            friend class Window_Impl;
            Application* m_application;

            void* m_handle;
            EventDispatcher<void> m_onOpen;
            EventDispatcher<void> m_onClose;
            EventDispatcher<void> m_onFocus;
            EventDispatcher<void> m_onBlur;
            EventDispatcher<void, u32, u32> m_onResize;
            EventDispatcher<void, i32, i32> m_onMove;
            EventDispatcher<void, KeyboardKey> m_onKeyDown;
            EventDispatcher<void, KeyboardKey> m_onKeyUp;
            EventDispatcher<void, i32, i32> m_onMouseMove;
            EventDispatcher<void, MouseButton> m_onMouseDown;
            EventDispatcher<void, MouseButton> m_onMouseUp;
            EventDispatcher<void, f32> m_onScroll;
            Array<IInputHandler*> m_inputHandlers;

        private:
            bool openHandle();
            bool closeHandle();

            Window* m_parent;

            utils::String m_title;
            bool m_borderEnabled;
            bool m_isOpen;
            bool m_isFocused;
            u32 m_width;
            u32 m_height;
            i32 m_posX;
            i32 m_posY;
    };
}