#pragma once
#include <decomp/types.h>

#include <decomp/utils/array.h>

namespace decomp {
    class Application;
    class Buffer;

    namespace cmd {
        class ICommand;

        class CommandMgr {
            public:
                CommandMgr(Application* app);
                ~CommandMgr();

                void undo();
                void redo();

                void serialize(Buffer& buffer) const;
                void deserialize(Buffer& buffer);

                void submit(ICommand* command);
                void submitShutdown();

            protected:
                void clearStacks();

                Application* m_app;
                Array<ICommand*> m_undoStack;
                Array<ICommand*> m_redoStack;
        };
    }
}