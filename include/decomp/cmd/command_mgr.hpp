#pragma once
#include <decomp/cmd/command_listener.h>
#include <decomp/cmd/command_mgr.h>

#include <utils/Array.hpp>
#include <utils/Exception.h>

namespace decomp {
    namespace cmd {
        template <typename CommandType>
        void CommandMgr::registerCommand() {
            static_assert(std::is_base_of<ICommand, CommandType>::value, "CommandType must derive from ICommand");
            static_assert(
                std::is_same_v<typename std::decay<decltype(CommandType::name)>::type, const char*>,
                "CommandType must have a static constexpr const char* name property"
            );
            static_assert(
                std::is_same_v<typename std::decay<decltype(CommandType::flags)>::type, CommandFlags>,
                "CommandType must have a static constexpr CommandFlags flags property"
            );
            static_assert(
                std::is_same_v<typename std::decay<decltype(CommandType::deserialize)>::type, CommandDeserializer>,
                "CommandType must have a static ICommand* deserialize(Buffer& source) method"
            );

            size_t commandTypeHash = typeid(CommandType).hash_code();

            for (CommandInfo& cmd : m_registeredCommands) {
                if (strcmp(cmd.name, CommandType::name) == 0) {
                    throw InvalidActionException(
                        "CommandMgr::registerCommand() - Command '%s' already registered", CommandType::name
                    );
                }
            }

            /* clang-format off */
            m_registeredCommands.push({
                commandTypeHash,
                CommandType::deserialize,
                CommandType::name,
                CommandType::flags,
                Array<ICommandListener*>()
            });
            /* clang-format on */

            debug("Registered command: %s (0x%llX)", CommandType::name, (u64)commandTypeHash);
        }

        template <typename CommandType>
        void CommandMgr::subscribeCommandListener(ICommandListener* listener) {
            size_t commandTypeHash = typeid(CommandType).hash_code();

            for (CommandInfo& cmd : m_registeredCommands) {
                if (cmd.commandTypeHash != commandTypeHash) {
                    continue;
                }

                for (ICommandListener* listener : cmd.listeners) {
                    if (listener == listener) {
                        throw InvalidActionException(
                            "CommandMgr::subscribeCommandListener() - Listener already subscribed"
                        );
                    }
                }

                listener->m_mgr = this;
                listener->m_listeningTo.insert(cmd.name);

                cmd.listeners.push(listener);
                break;
            }
        }

        template <typename CommandType>
        void CommandMgr::unsubscribeCommandListener(ICommandListener* listener) {
            size_t commandTypeHash = typeid(CommandType).hash_code();

            if (!listener->m_mgr) {
                throw InvalidActionException(
                    "CommandMgr::unsubscribeCommandListener() - Listener is not subscribed to any CommandMgr"
                );
            }

            if (listener->m_mgr != this) {
                throw InvalidActionException(
                    "CommandMgr::unsubscribeCommandListener() - Listener is not subscribed to this CommandMgr"
                );
            }

            for (CommandInfo& cmd : m_registeredCommands) {
                if (cmd.commandTypeHash != commandTypeHash) {
                    continue;
                }

                i64 index = cmd.listeners.findIndex([listener](ICommandListener* l) {
                    return l == listener;
                });
                if (index == -1) {
                    throw InvalidActionException("CommandMgr::unsubscribeCommandListener() - Listener not subscribed");
                }

                listener->m_listeningTo.erase(cmd.name);

                cmd.listeners.remove(index);

                return;
            }

            throw InvalidActionException(
                "CommandMgr::unsubscribeCommandListener() - Listener is for a command type that has not been registered"
            );
        }
    }
}