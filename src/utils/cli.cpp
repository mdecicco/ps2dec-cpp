#include <decomp/utils/array.hpp>
#include <decomp/utils/cli.h>
#include <decomp/utils/cli_options.h>
#include <decomp/utils/exceptions.h>

namespace decomp {
    CommandLineInterface::CommandLineInterface() {}

    CommandLineInterface::~CommandLineInterface() {
        for (auto option : m_options) {
            delete option;
        }
    }

    void CommandLineInterface::addStringOption(
        String* target, const String& name, const String& description, const String& defaultValue
    ) {
        m_options.push(new cmdStringOption(target, name, description, defaultValue));
    }

    void CommandLineInterface::addBoolOption(
        bool* target, const String& name, const String& description, bool valueWhenSpecified
    ) {
        m_options.push(new cmdBoolOption(target, name, description, valueWhenSpecified));
    }

    void CommandLineInterface::addIntOption(
        i32* target,
        const String& name,
        const String& description,
        const String& defaultValue,
        i32 minValue,
        i32 maxValue
    ) {
        m_options.push(new cmdIntOption(target, name, description, defaultValue, minValue, maxValue));
    }

    void CommandLineInterface::addFloatOption(
        f32* target,
        const String& name,
        const String& description,
        const String& defaultValue,
        f32 minValue,
        f32 maxValue
    ) {
        m_options.push(new cmdFloatOption(target, name, description, defaultValue, minValue, maxValue));
    }

    void CommandLineInterface::parse(const Arguments& args) {
        auto allArgs = args.getAll();

        for (auto& arg : allArgs) {
            bool parsed = false;
            for (auto& option : m_options) {
                if (option->tryParse(arg)) {
                    parsed = true;
                    break;
                }
            }

            if (!parsed) {
                throw InvalidArgumentException("Unknown option: %s", arg.name.c_str());
            }
        }
    }

    const Array<ICommandOption*>& CommandLineInterface::getOptions() const {
        return m_options;
    }
}