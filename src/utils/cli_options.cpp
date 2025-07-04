#include <decomp/utils/array.hpp>
#include <decomp/utils/cli_options.h>
#include <decomp/utils/exceptions.h>

namespace decomp {
    ICommandOption::ICommandOption(const String& name, const String& description, const String& defaultValue)
        : m_name(name), m_description(description), m_defaultValue(defaultValue) {}

    const String& ICommandOption::getName() const {
        return m_name;
    }

    const String& ICommandOption::getDescription() const {
        return m_description;
    }

    const String& ICommandOption::getDefaultValue() const {
        return m_defaultValue;
    }

    String ICommandOption::describe() const {
        String str = String::Format("-%s\t%s", m_name.c_str(), m_description.c_str());

        if (m_defaultValue.size() > 0) {
            str += String::Format("\t(default: %s)", m_defaultValue.c_str());
        }

        return str;
    }

    cmdStringOption::cmdStringOption(
        String* target, const String& name, const String& description, const String& defaultValue
    )
        : ICommandOption(name, description, defaultValue), m_target(target) {}

    bool cmdStringOption::tryParse(const Argument& arg) {
        if (arg.name != m_name) {
            return false;
        }

        *m_target = arg.value;
        return true;
    }

    cmdBoolOption::cmdBoolOption(bool* target, const String& name, const String& description, bool valueWhenSpecified)
        : ICommandOption(name, description, String()), m_target(target), m_valueWhenSpecified(valueWhenSpecified) {}

    bool cmdBoolOption::tryParse(const Argument& arg) {
        if (arg.name != m_name) {
            return false;
        }

        *m_target = m_valueWhenSpecified;
        return true;
    }

    cmdIntOption::cmdIntOption(
        i32* target,
        const String& name,
        const String& description,
        const String& defaultValue,
        i32 minValue,
        i32 maxValue
    )
        : ICommandOption(name, description, defaultValue),
          m_target(target),
          m_minValue(minValue),
          m_maxValue(maxValue) {}

    bool cmdIntOption::tryParse(const Argument& arg) {
        if (arg.name != m_name) {
            return false;
        }

        if (arg.value.size() == 0) {
            return false;
        }

        i32 value = 0;
        if (sscanf(arg.value.c_str(), "%d", &value) != 1) {
            throw InvalidArgumentException("Value %s is not a valid integer", arg.value.c_str());
        }

        if (value < m_minValue || value > m_maxValue) {
            throw InvalidArgumentException(
                "Value %d is out of range for option %s (min: %d, max: %d)",
                value,
                m_name.c_str(),
                m_minValue,
                m_maxValue
            );
        }

        *m_target = value;
        return true;
    }

    cmdFloatOption::cmdFloatOption(
        f32* target,
        const String& name,
        const String& description,
        const String& defaultValue,
        f32 minValue,
        f32 maxValue
    )
        : ICommandOption(name, description, defaultValue),
          m_target(target),
          m_minValue(minValue),
          m_maxValue(maxValue) {}

    bool cmdFloatOption::tryParse(const Argument& arg) {
        if (arg.name != m_name) {
            return false;
        }

        if (arg.value.size() == 0) {
            return false;
        }

        f32 value = 0;
        if (sscanf(arg.value.c_str(), "%f", &value) != 1) {
            throw InvalidArgumentException("Value %s is not a valid float", arg.value.c_str());
        }

        if (value < m_minValue || value > m_maxValue) {
            throw InvalidArgumentException(
                "Value %f is out of range for option %s (min: %f, max: %f)",
                value,
                m_name.c_str(),
                m_minValue,
                m_maxValue
            );
        }

        *m_target = value;
        return true;
    }
};