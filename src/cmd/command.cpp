#include <decomp/cmd/command.h>

#include <decomp/cmd/cmd_shutdown.h>

#include <decomp/utils/buffer.hpp>
#include <decomp/utils/exceptions.h>

namespace decomp {
    namespace cmd {
        const char* CommandStateToString(CommandState state) {
            switch (state) {
                case CommandState::Pending: return "Pending";
                case CommandState::Committed: return "Committed";
                case CommandState::RolledBack: return "RolledBack";
                case CommandState::CommitFailed: return "CommitFailed";
                case CommandState::RollbackFailed: return "RollbackFailed";
            }

            return "Unknown";
        }

        ICommand::ICommand(CommandType type, u8 flags, Application* app) {
            m_type  = type;
            m_state = CommandState::Pending;
            m_flags = static_cast<CommandFlags>(flags);
            m_app   = app;
        }

        void ICommand::commit() {
            if (m_state != CommandState::Pending && m_state != CommandState::RolledBack) {
                throw InvalidActionException(
                    "Command::commit() - Command state is '%s' and cannot be committed", CommandStateToString(m_state)
                );
            }

            try {
                doCommit();
                m_state = CommandState::Committed;
            } catch (const GenericException& e) {
                m_state = CommandState::CommitFailed;
                throw e;
            } catch (const std::exception& e) {
                m_state = CommandState::CommitFailed;
                throw e;
            }
        }

        void ICommand::rollback() {
            if (m_state != CommandState::Committed) {
                throw InvalidActionException("Command::rollback() - Command is not committed");
            }

            try {
                doRollback();
                m_state = CommandState::RolledBack;
            } catch (const GenericException& e) {
                m_state = CommandState::RollbackFailed;
                throw e;
            } catch (const std::exception& e) {
                m_state = CommandState::RollbackFailed;
                throw e;
            }
        }

        void ICommand::serialize(Buffer& buffer) const {
            u64 pos = buffer.position();

            try {
                buffer.write(m_type);
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

        CommandType ICommand::getType() const {
            return m_type;
        }

        CommandState ICommand::getState() const {
            return m_state;
        }

        CommandFlags ICommand::getFlags() const {
            return m_flags;
        }

        ICommand* ICommand::deserialize(Buffer& buffer, Application* app) {
            u64 pos = buffer.position();

            CommandType type;
            CommandState state;
            CommandFlags flags;

            try {
                buffer.read(type);
                buffer.read(state);
                buffer.read(flags);
            } catch (const GenericException& e) {
                buffer.position(pos);
                throw e;
            } catch (const std::exception& e) {
                buffer.position(pos);
                throw e;
            }

            ICommand* result = nullptr;

            switch (type) {
                case CommandType::Shutdown: {
                    result = CmdShutdown::fromBuffer(buffer, state, flags, app);
                    break;
                }
                default: {
                    throw InputException("Command::deserialize() - Unknown command type '%d'", type);
                }
            }

            return result;
        }

        void ICommand::doCommit() {}

        void ICommand::doRollback() {}

        void ICommand::doSerialize(Buffer& buffer) const {}

        void ICommand::doDeserialize(Buffer& buffer) {}

        IServerCommand::IServerCommand(CommandType type, u8 flags, Application* app)
            : ICommand(type, flags | CommandFlags::ForServer, app) {}

        IClientCommand::IClientCommand(CommandType type, u8 flags, Application* app)
            : ICommand(type, flags & ~CommandFlags::ForServer, app) {}
    }
}