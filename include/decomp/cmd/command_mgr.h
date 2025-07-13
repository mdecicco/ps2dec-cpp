#pragma once
#include <decomp/types.h>

#include <decomp/utils/array.h>
#include <decomp/utils/logging.h>

namespace decomp {
    class Application;
    class Buffer;

    namespace cmd {
        class ICommand;
        class Response;
        class ICommandListener;

        enum CommandFlags : u8;
        typedef ICommand* (*CommandDeserializer)(Buffer& buffer);

        class CommandMgr : public IWithLogging {
            public:
                struct RegisteredCommand {
                    public:
                        size_t commandTypeHash;
                        CommandDeserializer deserializer;
                        const char* name;
                        CommandFlags flags;
                        Array<ICommandListener*> listeners;
                };

                CommandMgr(Application* app);
                ~CommandMgr();

                void shutdown();

                void undo();
                void redo();

                void serializeState(Buffer& buffer);
                void deserializeState(Buffer& buffer);

                void submit(ICommand* command);

                template <typename CommandType>
                void registerCommand();

                template <typename CommandType>
                void subscribeCommandListener(ICommandListener* listener);

                template <typename CommandType>
                void unsubscribeCommandListener(ICommandListener* listener);

                void unsubscribeFromAll(ICommandListener* listener);

                const Array<RegisteredCommand>& getRegisteredCommands() const;

            protected:
                void reset();

                Application* m_app;
                Array<ICommand*> m_undoStack;
                Array<ICommand*> m_redoStack;
                Array<ICommand*> m_submittedCommands;
                Array<RegisteredCommand> m_registeredCommands;
        };
    }
}