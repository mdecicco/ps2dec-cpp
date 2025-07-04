#pragma once
#include <decomp/types.h>

namespace decomp {
    class Buffer;
    class Application;

    namespace cmd {
        enum CommandFlags : u8 {
            None      = 0b00000000,
            Undoable  = 0b00000001,
            Redoable  = 0b00000010,
            ForServer = 0b00000100
        };

        enum class CommandState : u8 {
            Pending,
            Committed,
            RolledBack,
            CommitFailed,
            RollbackFailed
        };

        enum class CommandType : u16 {
            Shutdown
        };

        class ICommand {
            public:
                ICommand(CommandType type, u8 flags, Application* app);
                virtual ~ICommand() = default;

                void commit();
                void rollback();
                void serialize(Buffer& buffer) const;

                CommandType getType() const;
                CommandState getState() const;
                CommandFlags getFlags() const;

                virtual const char* getTypeName() const = 0;

                static ICommand* deserialize(Buffer& buffer, Application* app);

            protected:
                virtual void doCommit();
                virtual void doRollback();
                virtual void doSerialize(Buffer& buffer) const;
                virtual void doDeserialize(Buffer& buffer);

                Application* m_app;
                CommandType m_type;
                CommandState m_state;
                CommandFlags m_flags;
        };

        class IServerCommand : public ICommand {
            public:
                IServerCommand(CommandType type, u8 flags, Application* app);
        };

        class IClientCommand : public ICommand {
            public:
                IClientCommand(CommandType type, u8 flags, Application* app);
        };
    }
}