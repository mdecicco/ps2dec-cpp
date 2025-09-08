import * as React from 'mini-react';

export function useOptionallyControlledState<T>(
    initialValue: T,
    controlledValue: T | undefined,
    onChange: ((value: T) => void) | undefined
): [T, (value: T) => void] {
    const [value, setValue] = React.useState(controlledValue ?? initialValue);

    React.useEffect(() => {
        if (controlledValue === undefined) return;
        setValue(controlledValue);
    }, [controlledValue]);

    const setter = React.useMemo(() => {
        return (value: T) => {
            setValue(value);
            if (onChange && value !== controlledValue) onChange(value);
        };
    }, [onChange, controlledValue]);

    return [value, setter];
}
