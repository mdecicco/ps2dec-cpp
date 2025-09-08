import * as React from 'mini-react';
import { useMountEffect } from './use-mount-effect';

const BASE_INDEX = 1;

// Used to ensure there's some room to play with z-indices within each layer, if needed
// There's likely no reason to make a whole mechanism for application code to be aware
// of this so we'll just stick to 10 for now
const Z_INDEX_BUFFER = 10;

const activeLayers = new Set<number>([BASE_INDEX]);

function getNextIndex() {
    const highestIndex = Math.max(...activeLayers);

    return highestIndex + Z_INDEX_BUFFER;
}

export function useDepthLayer() {
    const ref = React.useRef<number>(getNextIndex());

    useMountEffect(() => {
        activeLayers.add(ref.current);

        return () => {
            activeLayers.delete(ref.current);
        };
    });

    return ref.current;
}
