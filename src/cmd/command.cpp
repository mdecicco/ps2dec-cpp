#include <decomp/cmd/command.h>

#include <decomp/cmd/cmd_shutdown.h>
#include <decomp/cmd/command_mgr.h>
#include <decomp/comm/packets/cmd_response.h>
#include <decomp/comm/packets/cmd_state.h>

#include <decomp/app/application.h>

#include <decomp/utils/array.hpp>
#include <decomp/utils/buffer.h>
#include <decomp/utils/exceptions.h>

namespace decomp {
    namespace cmd {
        const char* CommandStateToString(CommandState state) {
            switch (state) {
                case CommandState::Pending: return "Pending";
                case CommandState::Committing: return "Committing";
                case CommandState::Committed: return "Committed";
                case CommandState::CommitFailed: return "CommitFailed";
                case CommandState::RollingBack: return "RollingBack";
                case CommandState::RolledBack: return "RolledBack";
                case CommandState::RollbackFailed: return "RollbackFailed";
            }

            return "Unknown";
        }

        ICommand::ICommand(const char* name) {
            m_app         = nullptr;
            m_commandId   = 0;
            m_state       = CommandState::Pending;
            m_name        = name;
            m_response    = nullptr;
            m_commandInfo = nullptr;
        }

        ICommand::~ICommand() {
            if (m_response != nullptr) {
                delete m_response;
            }

            if (m_state == CommandState::Committing || m_state == CommandState::RollingBack) {
                m_app->getCommandMgr()->error(
                    "Command '%s' was not fully resolved before its destruction (state: %s)",
                    m_name,
                    CommandStateToString(m_state)
                );
            }
        }

        void ICommand::serialize(Buffer& buffer) const {
            u64 pos = buffer.position();

            try {
                buffer.write(m_commandId);
                buffer.write(String(m_name));
                buffer.write(m_state);
                doSerialize(buffer);
            } catch (const GenericException& e) {
                buffer.seek(pos);
                throw e;
            } catch (const std::exception& e) {
                buffer.seek(pos);
                throw e;
            }
        }

        void ICommand::resolveCommit(ICommandListener* listener) {
            if (m_state != CommandState::Committing) {
                throw InvalidActionException("Command::resolveCommit() - Command is not committing");
            }

            i64 index = m_pendingListeners.findIndex([listener](ICommandListener* l) { return l == listener; });
            if (index == -1) {
                throw InvalidActionException("Command::resolveCommit() - Listener not pending");
            }

            m_pendingListeners.remove(index);
            m_resolvedListeners.push(listener);

            if (m_pendingListeners.size() > 0) {
                return;
            }

            setState(CommandState::Committed);

            if (m_response) {
                sendResponse();
            }
        }

        void ICommand::rejectCommit(ICommandListener* listener) {
            if (m_state != CommandState::Committing) {
                throw InvalidActionException("Command::rejectCommit() - Command is not committing");
            }

            i64 index = m_pendingListeners.findIndex([listener](ICommandListener* l) { return l == listener; });
            if (index == -1) {
                throw InvalidActionException("Command::rejectCommit() - Listener not pending");
            }

            m_pendingListeners.clear();

            setState(CommandState::CommitFailed);

            Array<ICommandListener*> dispatchTo = m_resolvedListeners;
            for (ICommandListener* listener : dispatchTo) {
                dispatchCommitFailed(listener);
            }

            m_resolvedListeners.clear();
        }

        void ICommand::resolveRollback(ICommandListener* listener) {
            if (m_state != CommandState::RollingBack) {
                throw InvalidActionException("Command::resolveRollback() - Command is not rolling back");
            }

            i64 index = m_pendingListeners.findIndex([listener](ICommandListener* l) { return l == listener; });
            if (index == -1) {
                throw InvalidActionException("Command::resolveRollback() - Listener not pending");
            }

            m_pendingListeners.remove(index);
            m_resolvedListeners.push(listener);

            if (m_pendingListeners.size() > 0) {
                return;
            }

            setState(CommandState::RolledBack);
        }

        void ICommand::rejectRollback(ICommandListener* listener) {
            if (m_state != CommandState::RollingBack) {
                throw InvalidActionException("Command::rejectRollback() - Command is not rolling back");
            }

            i64 index = m_pendingListeners.findIndex([listener](ICommandListener* l) { return l == listener; });
            if (index == -1) {
                throw InvalidActionException("Command::rejectRollback() - Listener not pending");
            }

            m_pendingListeners.clear();

            setState(CommandState::RollbackFailed);

            Array<ICommandListener*> dispatchTo = m_resolvedListeners;
            for (ICommandListener* listener : dispatchTo) {
                dispatchRollbackFailed(listener);
            }

            m_resolvedListeners.clear();
        }

        u32 ICommand::getCommandId() const {
            return m_commandId;
        }

        const char* ICommand::getName() const {
            return m_name;
        }

        CommandState ICommand::getState() const {
            return m_state;
        }

        packet::CommandResponse* ICommand::getResponse() const {
            return m_response;
        }

        CommandInfo* ICommand::getInfo() const {
            return m_commandInfo;
        }

        ICommand* ICommand::deserialize(Buffer& buffer, bool withState, Application* app) {
            u64 pos = buffer.position();

            ICommand* result = nullptr;
            u32 commandId    = 0;
            String type;
            CommandState state = CommandState::Pending;

            try {
                buffer.read(commandId);
                type  = buffer.readStr();
                state = CommandState::Pending;
                if (withState) {
                    buffer.read(state);
                }

                const Array<CommandInfo>& commands = app->getCommandMgr()->getRegisteredCommands();
                for (const CommandInfo& cmd : commands) {
                    if (type == cmd.name) {
                        result              = cmd.deserializer(buffer);
                        result->m_app       = app;
                        result->m_commandId = commandId;
                        result->m_name      = cmd.name;
                        result->m_state     = state;
                        break;
                    }
                }
            } catch (const GenericException& e) {
                buffer.seek(pos);
                throw e;
            } catch (const std::exception& e) {
                buffer.seek(pos);
                throw e;
            }

            if (!result) {
                buffer.seek(pos);
                throw InputException("Command::deserialize() - Unknown command '%s'", type.c_str());
            }

            return result;
        }

        void ICommand::setState(CommandState state) {
            m_state = state;
            packet::CommandStateChanged cmdState(m_commandId, state, m_app->getSocket());
            cmdState.send();
        }

        void ICommand::commit() {
            if (m_state != CommandState::Pending && m_state != CommandState::RolledBack) {
                throw InvalidActionException(
                    "Command::commit() - Command state is '%s' and cannot be committed", CommandStateToString(m_state)
                );
            }

            setState(CommandState::Committing);

            const Array<CommandInfo>& commands = m_app->getCommandMgr()->getRegisteredCommands();
            for (const CommandInfo& cmd : commands) {
                if (strcmp(cmd.name, m_name) != 0) {
                    continue;
                }

                m_pendingListeners = cmd.listeners;
                break;
            }

            try {
                Array<ICommandListener*> dispatchTo = m_pendingListeners;
                for (ICommandListener* listener : dispatchTo) {
                    dispatchCommit(listener);
                }
            } catch (const GenericException& e) {
                setState(CommandState::CommitFailed);

                Array<ICommandListener*> dispatchTo = m_resolvedListeners;
                for (ICommandListener* listener : dispatchTo) {
                    dispatchCommitFailed(listener);
                }

                throw e;
            } catch (const std::exception& e) {
                setState(CommandState::CommitFailed);

                Array<ICommandListener*> dispatchTo = m_resolvedListeners;
                for (ICommandListener* listener : dispatchTo) {
                    dispatchCommitFailed(listener);
                }

                throw e;
            }
        }

        void ICommand::rollback() {
            if (m_state != CommandState::Committed) {
                throw InvalidActionException("Command::rollback() - Command is not committed");
            }

            setState(CommandState::RollingBack);

            const Array<CommandInfo>& commands = m_app->getCommandMgr()->getRegisteredCommands();
            for (const CommandInfo& cmd : commands) {
                if (strcmp(cmd.name, m_name) != 0) {
                    continue;
                }

                m_pendingListeners = cmd.listeners;
                break;
            }

            try {
                Array<ICommandListener*> dispatchTo = m_pendingListeners;
                for (ICommandListener* listener : dispatchTo) {
                    dispatchRollback(listener);
                }

                setState(CommandState::RolledBack);
            } catch (const GenericException& e) {
                setState(CommandState::RollbackFailed);

                Array<ICommandListener*> dispatchTo = m_resolvedListeners;
                for (ICommandListener* listener : dispatchTo) {
                    dispatchRollbackFailed(listener);
                }

                throw e;
            } catch (const std::exception& e) {
                setState(CommandState::RollbackFailed);

                Array<ICommandListener*> dispatchTo = m_resolvedListeners;
                for (ICommandListener* listener : dispatchTo) {
                    dispatchRollbackFailed(listener);
                }

                throw e;
            }
        }

        void ICommand::initializeResponse(Socket* socket) {
            if (m_response != nullptr) {
                throw InvalidActionException("Command::initializeResponse() - Command already has a response handler");
            }

            if (m_commandId == 0) {
                throw InvalidActionException("Command::initializeResponse() - Command has no id");
            }

            m_response = new packet::CommandResponse(m_commandId, socket);
        }

        void ICommand::sendResponse() {
            if (m_response == nullptr) {
                throw InvalidActionException("Command::sendResponse() - Command has no response handler");
            }

            generateResponse();
            m_response->send();
        }

        void ICommand::generateResponse() {}

        void ICommand::doSerialize(Buffer& buffer) const {}

        void ICommand::doDeserialize(Buffer& buffer) {}
    }
}