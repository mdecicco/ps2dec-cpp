import * as React from 'mini-react';

export function useCombineRefs<RefType>(refA?: React.Ref<RefType>, refB?: React.Ref<RefType>): React.Ref<RefType> {
    return React.useMemo(() => {
        return (r: RefType) => {
            if (refA) {
                if (typeof refA === 'function') {
                    refA(r);
                } else {
                    refA.current = r;
                }
            }

            if (refB) {
                if (typeof refB === 'function') {
                    refB(r);
                } else {
                    refB.current = r;
                }
            }
        };
    }, [refA, refB]);
}
