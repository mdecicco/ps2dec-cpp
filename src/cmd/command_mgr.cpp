#include <decomp/cmd/command_mgr.h>

#include <decomp/app/application.h>
#include <decomp/cmd/cmd_shutdown.h>
#include <decomp/cmd/command_listener.h>
#include <decomp/comm/packets/client_command.h>
#include <decomp/utils/buffer.h>
#include <utils/Array.hpp>
#include <utils/Exception.h>

namespace decomp {
    namespace cmd {
        CommandMgr::CommandMgr(Application* app) : IWithLogging("CommandMgr") {
            m_app = app;
        }

        CommandMgr::~CommandMgr() {
            shutdown();
        }

        void CommandMgr::shutdown() {
            reset();
        }

        void CommandMgr::undo() {
            if (m_undoStack.size() == 0) {
                throw InvalidActionException("CommandMgr::undo() - No commands to undo");
            }

            ICommand* command = m_undoStack.pop();
            debug("Undoing command: %s", command->getName());

            command->rollback();

            if (command->getInfo()->flags & CommandFlags::Redoable) {
                m_redoStack.push(command);
            }
        }

        void CommandMgr::redo() {
            if (m_redoStack.size() == 0) {
                throw InvalidActionException("CommandMgr::redo() - No commands to redo");
            }

            ICommand* command = m_redoStack.pop();
            debug("Redoing command: %s", command->getName());

            command->commit();

            if (command->getInfo()->flags & CommandFlags::Undoable) {
                m_undoStack.push(command);
            }
        }

        void CommandMgr::serializeState(Buffer& buffer) {
            debug("Serializing command state (undoStack: %d, redoStack: %d)", m_undoStack.size(), m_redoStack.size());

            buffer.write<u32>(m_undoStack.size());
            buffer.write<u32>(m_redoStack.size());

            for (ICommand* command : m_undoStack) {
                command->serialize(buffer);
            }

            for (ICommand* command : m_redoStack) {
                command->serialize(buffer);
            }
        }

        void CommandMgr::deserializeState(Buffer& buffer) {
            debug("Deserializing command state");

            reset();

            u32 undoStackSize;
            u32 redoStackSize;

            buffer.read(undoStackSize);
            buffer.read(redoStackSize);

            debug("undoStack: %d, redoStack: %d", undoStackSize, redoStackSize);

            for (u32 i = 0; i < undoStackSize; i++) {
                ICommand* command = ICommand::deserialize(buffer, true, m_app);
                m_undoStack.push(command);
                m_submittedCommands.push(command);
            }

            for (u32 i = 0; i < redoStackSize; i++) {
                ICommand* command = ICommand::deserialize(buffer, true, m_app);
                m_redoStack.push(command);
                m_submittedCommands.push(command);
            }
        }

        Application* CommandMgr::getApplication() const {
            return m_app;
        }

        void CommandMgr::submit(ICommand* command) {
            CommandInfo* registeredCommand = nullptr;
            for (CommandInfo& cmd : m_registeredCommands) {
                if (strcmp(cmd.name, command->getName()) == 0) {
                    registeredCommand = &cmd;
                    break;
                }
            }

            if (registeredCommand == nullptr) {
                String msg =
                    String::Format("CommandMgr::submit() - '%s' command is not registered", command->getName());

                delete command;

                throw InvalidActionException(msg.c_str());
            }

            if ((registeredCommand->flags & CommandFlags::ForServer) == 0) {
                packet::ClientCommand cmd(command, m_app->getSocket());
                cmd.send();
                delete command;
                return;
            }

            debug("Received '%s' command", command->getName());

            command->m_app         = m_app;
            command->m_commandInfo = registeredCommand;
            command->commit();

            if (registeredCommand->flags & CommandFlags::Undoable) {
                m_undoStack.push(command);
                m_redoStack.clear();
            }

            m_submittedCommands.push(command);
        }

        void CommandMgr::unsubscribeFromAll(ICommandListener* listener) {
            for (CommandInfo& cmd : m_registeredCommands) {
                i64 index = cmd.listeners.findIndex([listener](ICommandListener* l) {
                    return l == listener;
                });
                if (index == -1) {
                    continue;
                }

                cmd.listeners.remove(index);
                listener->m_listeningTo.erase(cmd.name);
            }
        }

        const Array<CommandInfo>& CommandMgr::getRegisteredCommands() const {
            return m_registeredCommands;
        }

        void CommandMgr::reset() {
            for (ICommand* command : m_submittedCommands) {
                delete command;
            }

            m_submittedCommands.clear();
            m_undoStack.clear();
            m_redoStack.clear();
        }
    }
}