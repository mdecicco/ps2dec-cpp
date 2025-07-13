#include <decomp/cmd/command.h>

#include <decomp/cmd/cmd_shutdown.h>
#include <decomp/cmd/command_mgr.h>
#include <decomp/cmd/response.h>

#include <decomp/app/application.h>

#include <decomp/utils/array.hpp>
#include <decomp/utils/buffer.hpp>
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
            m_app      = nullptr;
            m_name     = name;
            m_response = nullptr;
            m_state    = CommandState::Pending;
            m_flags    = CommandFlags::None;
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
                buffer.write(String(m_name));
                buffer.write(m_state);
                buffer.write(m_flags);
                doSerialize(buffer);
            } catch (const GenericException& e) {
                buffer.position(pos);
                throw e;
            } catch (const std::exception& e) {
                buffer.position(pos);
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

            m_state = CommandState::Committed;

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

            m_state = CommandState::CommitFailed;

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

            m_state = CommandState::RolledBack;
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

            m_state = CommandState::RollbackFailed;

            Array<ICommandListener*> dispatchTo = m_resolvedListeners;
            for (ICommandListener* listener : dispatchTo) {
                dispatchRollbackFailed(listener);
            }

            m_resolvedListeners.clear();
        }

        void ICommand::initializeResponse(u32 commandId, Socket* socket) {
            if (m_response != nullptr) {
                throw InvalidActionException("Command::initializeResponse() - Command already has a response handler");
            }

            m_response = new Response(commandId, socket);
        }

        void ICommand::sendResponse() {
            if (m_response == nullptr) {
                throw InvalidActionException("Command::sendResponse() - Command has no response handler");
            }

            generateResponse();
            m_response->send();
        }

        void ICommand::generateResponse() {}

        const char* ICommand::getName() const {
            return m_name;
        }

        CommandState ICommand::getState() const {
            return m_state;
        }

        CommandFlags ICommand::getFlags() const {
            return m_flags;
        }

        ICommand* ICommand::deserialize(Buffer& buffer, bool withState, Application* app) {
            u64 pos = buffer.position();

            ICommand* result = nullptr;
            String type;
            CommandState state;

            try {
                type  = buffer.readStr();
                state = CommandState::Pending;
                if (withState) {
                    buffer.read(state);
                }

                const Array<CommandMgr::RegisteredCommand>& commands = app->getCommandMgr()->getRegisteredCommands();
                for (const CommandMgr::RegisteredCommand& cmd : commands) {
                    if (type == cmd.name) {
                        result          = cmd.deserializer(buffer);
                        result->m_app   = app;
                        result->m_name  = cmd.name;
                        result->m_state = state;
                        result->m_flags = cmd.flags;
                        break;
                    }
                }
            } catch (const GenericException& e) {
                buffer.position(pos);
                throw e;
            } catch (const std::exception& e) {
                buffer.position(pos);
                throw e;
            }

            if (!result) {
                buffer.position(pos);
                throw InputException("Command::deserialize() - Unknown command '%s'", type.c_str());
            }

            return result;
        }

        void ICommand::commit() {
            if (m_state != CommandState::Pending && m_state != CommandState::RolledBack) {
                throw InvalidActionException(
                    "Command::commit() - Command state is '%s' and cannot be committed", CommandStateToString(m_state)
                );
            }

            m_state = CommandState::Committing;

            const Array<CommandMgr::RegisteredCommand>& commands = m_app->getCommandMgr()->getRegisteredCommands();
            for (const CommandMgr::RegisteredCommand& cmd : commands) {
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
                m_state = CommandState::CommitFailed;

                Array<ICommandListener*> dispatchTo = m_resolvedListeners;
                for (ICommandListener* listener : dispatchTo) {
                    dispatchCommitFailed(listener);
                }

                throw e;
            } catch (const std::exception& e) {
                m_state = CommandState::CommitFailed;

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

            m_state = CommandState::RollingBack;

            const Array<CommandMgr::RegisteredCommand>& commands = m_app->getCommandMgr()->getRegisteredCommands();
            for (const CommandMgr::RegisteredCommand& cmd : commands) {
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

                m_state = CommandState::RolledBack;
            } catch (const GenericException& e) {
                m_state = CommandState::RollbackFailed;

                Array<ICommandListener*> dispatchTo = m_resolvedListeners;
                for (ICommandListener* listener : dispatchTo) {
                    dispatchRollbackFailed(listener);
                }

                throw e;
            } catch (const std::exception& e) {
                m_state = CommandState::RollbackFailed;

                Array<ICommandListener*> dispatchTo = m_resolvedListeners;
                for (ICommandListener* listener : dispatchTo) {
                    dispatchRollbackFailed(listener);
                }

                throw e;
            }
        }

        void ICommand::doSerialize(Buffer& buffer) const {}

        void ICommand::doDeserialize(Buffer& buffer) {}
    }
}