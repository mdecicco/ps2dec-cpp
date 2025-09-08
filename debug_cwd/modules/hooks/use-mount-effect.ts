import * as React from 'mini-react';

export function useMountEffect(effect: () => void | (() => void)) {
    React.useEffect(effect, []);
}
