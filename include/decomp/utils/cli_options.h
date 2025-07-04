#pragma once
#include <decomp/types.h>
#include <decomp/utils/args.h>

namespace decomp {
    class ICommandOption {
        public:
            ICommandOption(const String& name, const String& description, const String& defaultValue = String());
            virtual ~ICommandOption() = default;

            const String& getName() const;
            const String& getDescription() const;
            const String& getDefaultValue() const;

            virtual bool tryParse(const Argument& arg) = 0;
            virtual String describe() const;

        protected:
            String m_name;
            String m_description;
            String m_defaultValue;
    };

    class cmdStringOption : public ICommandOption {
        public:
            cmdStringOption(
                String* target, const String& name, const String& description, const String& defaultValue = String()
            );

            bool tryParse(const Argument& arg) override;

        protected:
            String* m_target;
    };

    class cmdBoolOption : public ICommandOption {
        public:
            /**
             * @brief Construct a new boolean command option
             *
             * @param target The target to store the value when parsed
             * @param name The name of the option
             * @param description The description of the option
             * @param valueWhenSpecified The value to store when the option is specified
             */
            cmdBoolOption(bool* target, const String& name, const String& description, bool valueWhenSpecified = true);

            bool tryParse(const Argument& arg) override;

        protected:
            bool* m_target;
            bool m_valueWhenSpecified;
    };

    class cmdIntOption : public ICommandOption {
        public:
            cmdIntOption(
                i32* target,
                const String& name,
                const String& description,
                const String& defaultValue = String(),
                i32 minValue = INT32_MIN,
                i32 maxValue = INT32_MAX
            );

            bool tryParse(const Argument& arg) override;

        protected:
            i32* m_target;
            i32 m_minValue;
            i32 m_maxValue;
    };

    class cmdFloatOption : public ICommandOption {
        public:
            cmdFloatOption(
                f32* target,
                const String& name,
                const String& description,
                const String& defaultValue = String(),
                f32 minValue = FLT_MIN,
                f32 maxValue = FLT_MAX
            );

            bool tryParse(const Argument& arg) override;

        protected:
            f32* m_target;
            f32 m_minValue;
            f32 m_maxValue;
    };
};