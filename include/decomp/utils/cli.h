#pragma once
#include <decomp/types.h>
#include <decomp/utils/args.h>
#include <utils/Array.h>

namespace decomp {
    class ICommandOption;

    class CommandLineInterface {
        public:
            CommandLineInterface();
            ~CommandLineInterface();

            void addStringOption(
                String* target, const String& name, const String& description, const String& defaultValue = String()
            );

            void addBoolOption(
                bool* target, const String& name, const String& description, bool valueWhenSpecified = true
            );

            void addIntOption(
                i32* target,
                const String& name,
                const String& description,
                const String& defaultValue = String(),
                i32 minValue               = INT32_MIN,
                i32 maxValue               = INT32_MAX
            );

            void addFloatOption(
                f32* target,
                const String& name,
                const String& description,
                const String& defaultValue = String(),
                f32 minValue               = FLT_MIN,
                f32 maxValue               = FLT_MAX
            );

            void parse(const Arguments& args);

            const Array<ICommandOption*>& getOptions() const;

        protected:
            Array<ICommandOption*> m_options;
    };
};