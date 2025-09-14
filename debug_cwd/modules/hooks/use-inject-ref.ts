import * as React from 'mini-react';

export function useInjectRef<RefType>(
    initialValue: RefType,
    refPassthrough?: React.Ref<RefType>
): React.RefObject<RefType> {
    const ref = React.useRef<RefType>(initialValue);
    React.useMemo(() => {
        return (r: RefType) => {
            if (refPassthrough) {
                if (typeof refPassthrough === 'function') {
                    refPassthrough(r);
                } else {
                    refPassthrough.current = r;
                }
            }

            ref.current = r;
        };
    }, [refPassthrough]);

    return ref;
}
