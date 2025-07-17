#pragma once
#include <decomp/types.h>

#include <decomp/utils/array.h>

namespace decomp {
    class Buffer;
    class Application;
    class Socket;

    namespace packet {
        class CommandResponse;
    }

    namespace cmd {
        class ICommandListener;
        struct CommandInfo;

        enum CommandFlags : u8 {
            None      = 0b00000000,
            Undoable  = 0b00000001,
            Redoable  = 0b00000010,
            ForServer = 0b00000100
        };

        enum class CommandState : u8 {
            Pending        = 0,
            Committing     = 1,
            Committed      = 2,
            CommitFailed   = 3,
            RollingBack    = 4,
            RolledBack     = 5,
            RollbackFailed = 6
        };

        class ICommand {
            public:
                ICommand(const char* name);
                virtual ~ICommand();

                void serialize(Buffer& buffer) const;
                void resolveCommit(ICommandListener* listener);
                void rejectCommit(ICommandListener* listener);
                void resolveRollback(ICommandListener* listener);
                void rejectRollback(ICommandListener* listener);

                u32 getCommandId() const;
                const char* getName() const;
                CommandState getState() const;
                packet::CommandResponse* getResponse() const;
                CommandInfo* getInfo() const;
                bool isResolved() const;

                static ICommand* deserialize(Buffer& buffer, bool withState, Application* app);

            private:
                void setState(CommandState state);
                Application* m_app;
                u32 m_commandId;
                CommandState m_state;
                const char* m_name;
                packet::CommandResponse* m_response;

            protected:
                friend class CommandMgr;
                friend class Application;

                void commit();
                void rollback();
                void initializeResponse(Socket* socket);
                void sendResponse();

                virtual void generateResponse();
                virtual void doSerialize(Buffer& buffer) const;
                virtual void doDeserialize(Buffer& buffer);
                virtual void dispatchCommit(ICommandListener* listener)         = 0;
                virtual void dispatchCommitFailed(ICommandListener* listener)   = 0;
                virtual void dispatchRollback(ICommandListener* listener)       = 0;
                virtual void dispatchRollbackFailed(ICommandListener* listener) = 0;

                Array<ICommandListener*> m_pendingListeners;
                Array<ICommandListener*> m_resolvedListeners;
                CommandInfo* m_commandInfo;
        };
    }
}