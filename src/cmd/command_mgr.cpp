#include <decomp/cmd/command_mgr.h>

#include <decomp/cmd/cmd_shutdown.h>

#include <decomp/utils/array.hpp>
#include <decomp/utils/buffer.hpp>
#include <decomp/utils/exceptions.h>

namespace decomp {
    namespace cmd {
        CommandMgr::CommandMgr(Application* app) {
            m_app = app;
        }

        CommandMgr::~CommandMgr() {
            clearStacks();
        }

        void CommandMgr::undo() {
            if (m_undoStack.size() == 0) {
                throw InvalidActionException("CommandMgr::undo() - No commands to undo");
            }

            ICommand* command = m_undoStack.pop();
            command->rollback();

            if (command->getFlags() & CommandFlags::Redoable) {
                m_redoStack.push(command);
            } else {
                delete command;
            }
        }

        void CommandMgr::redo() {
            if (m_redoStack.size() == 0) {
                throw InvalidActionException("CommandMgr::redo() - No commands to redo");
            }

            ICommand* command = m_redoStack.pop();
            command->commit();

            if (command->getFlags() & CommandFlags::Undoable) {
                m_undoStack.push(command);
            } else {
                delete command;
            }
        }

        void CommandMgr::serialize(Buffer& buffer) const {
            buffer.write<u32>(m_undoStack.size());
            buffer.write<u32>(m_redoStack.size());

            for (ICommand* command : m_undoStack) {
                command->serialize(buffer);
            }

            for (ICommand* command : m_redoStack) {
                command->serialize(buffer);
            }
        }

        void CommandMgr::deserialize(Buffer& buffer) {
            clearStacks();

            u32 undoStackSize;
            u32 redoStackSize;

            buffer.read(undoStackSize);
            buffer.read(redoStackSize);

            for (u32 i = 0; i < undoStackSize; i++) {
                ICommand* command = ICommand::deserialize(buffer, m_app);
                m_undoStack.push(command);
            }

            for (u32 i = 0; i < redoStackSize; i++) {
                ICommand* command = ICommand::deserialize(buffer, m_app);
                m_redoStack.push(command);
            }
        }

        void CommandMgr::submit(ICommand* command) {
            if ((command->getFlags() & CommandFlags::ForServer) == 0) {
                String msg = String::Format(
                    "CommandMgr::submit() - '%s' command is not intended for server", command->getTypeName()
                );

                delete command;

                throw InvalidActionException(msg.c_str());
            }

            command->commit();

            if (command->getFlags() & CommandFlags::Undoable) {
                m_undoStack.push(command);

                for (ICommand* cmd : m_redoStack) {
                    delete cmd;
                }

                m_redoStack.clear();
            } else {
                delete command;
            }
        }

        void CommandMgr::submitShutdown() {
            submit(new CmdShutdown(m_app));
        }

        void CommandMgr::clearStacks() {
            for (ICommand* command : m_undoStack) {
                delete command;
            }

            for (ICommand* command : m_redoStack) {
                delete command;
            }
        }
    }
}