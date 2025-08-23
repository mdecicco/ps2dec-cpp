import { useState, useEffect, useRef } from 'mini-react';
import { decompiler } from 'decompiler';

export type NumericalInterpolationOptions<T> = {
    /**
     * Interpolation function to use for the interpolation
     *
     * @default (a, b, t) => a + (b - a) * t
     */
    interpolate?: (a: T, b: T, t: number) => T;
};

export type CustomInterpolationOptions<T> = {
    /**
     * Interpolation function to use for the interpolation
     */
    interpolate: (a: T, b: T, t: number) => T;
};

export type InterpolationOptions<T> = {
    /** Duration of the interpolation in milliseconds */
    duration: number;

    /**
     * Easing function to use for the interpolation
     * @default t => t (linear)
     */
    easing?: (t: number) => number;

    /**
     * Whether to loop the animation when the target value is reached
     * @default false
     */
    loop?: boolean;

    /**
     * The initial target value to use for the animation, otherwise
     * no animation will be performed until the target value is set
     * @default initialValue
     */
    initialTarget?: T;
} & (T extends number ? NumericalInterpolationOptions<T> : CustomInterpolationOptions<T>);

type InterpolationState<T> = {
    prevValue: T;
    nextValue: T;
    currentValue: T;
    startTime: number;
    endTime: number;
    listener: number | null;
    onComplete: ((finalValue: T) => void) | null;
};

type useInterpolatedStateReturn<T> = [
    T,
    (targetValue: T) => void,
    {
        stop: () => void;
        onComplete: (callback: (finalValue: T) => void | null) => void;
        isAnimating: boolean;
    }
];

/**
 * Hook to animate changes to a value
 *
 * @param initialValue - The initial value of the state
 * @param options - The options for the interpolation
 * @returns An array containing the current value, a function to set the target value, a function to stop the animation, and a boolean indicating whether the animation is currently running
 */
export function useInterpolatedState<T>(
    initialValue: T,
    options: InterpolationOptions<T>
): useInterpolatedStateReturn<T> {
    const [value, setValue] = useState(initialValue);
    const state = useRef<InterpolationState<T>>({
        prevValue: initialValue,
        nextValue: initialValue,
        currentValue: initialValue,
        startTime: 0,
        endTime: 0,
        listener: null,
        onComplete: null
    });

    const stopAnimate = () => {
        if (state.current.listener) {
            decompiler.offService(state.current.listener);
            state.current.listener = null;
        }

        state.current.prevValue = state.current.currentValue;
        state.current.nextValue = state.current.currentValue;
        state.current.startTime = 0;
    };

    const updateAnimation = () => {
        const currentTime = Date.now();
        let t = (currentTime - state.current.startTime) / (state.current.endTime - state.current.startTime);
        if (t >= 1.0) {
            if (options.loop) {
                state.current.startTime = Date.now();
                state.current.endTime = state.current.startTime + options.duration;
                state.current.currentValue = state.current.prevValue;
                setValue(state.current.prevValue);
                return;
            }

            state.current.currentValue = state.current.nextValue;
            setValue(state.current.nextValue);
            stopAnimate();
            if (state.current.onComplete) state.current.onComplete(state.current.currentValue);
            return;
        }

        if (options.easing) t = options.easing(t);

        const a = state.current.prevValue;
        const b = state.current.nextValue;

        if (options.interpolate) {
            const interpolatedValue = options.interpolate(a, b, t);
            state.current.currentValue = interpolatedValue;
            setValue(interpolatedValue);
        } else {
            const interpolatedValue = ((a as number) + ((b as number) - (a as number)) * t) as T;
            state.current.currentValue = interpolatedValue;
            setValue(interpolatedValue);
        }
    };

    const startAnimate = (desiredValue: T) => {
        state.current.prevValue = state.current.currentValue;
        state.current.nextValue = desiredValue;
        state.current.startTime = Date.now();
        state.current.endTime = state.current.startTime + options.duration;

        if (state.current.listener === null) {
            state.current.listener = decompiler.onService(updateAnimation);
        }
    };

    useEffect(() => {
        if (options.initialTarget !== undefined) {
            startAnimate(options.initialTarget);
        }

        return () => {
            if (state.current.listener) {
                decompiler.offService(state.current.listener);
                state.current.listener = null;
            }
        };
    }, []);

    const setTargetValue = (desiredValue: T) => {
        if (state.current.currentValue === desiredValue) {
            stopAnimate();
            return;
        }

        startAnimate(desiredValue);
    };

    const stop = () => {
        stopAnimate();
    };

    const onComplete = (callback: (finalValue: T) => void | null) => {
        state.current.onComplete = callback;
    };

    const isAnimating = state.current.listener !== null;

    return [value, setTargetValue, { stop, onComplete, isAnimating }];
}
