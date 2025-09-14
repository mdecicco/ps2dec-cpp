import * as React from 'mini-react';
import { px, StyleParser } from 'ui/utils';
import { Color, SizeUnit } from 'ui/types';

import { useInterpolatedState } from './use-interpolated-state';

const unitStrings: Record<SizeUnit, string> = {
    [SizeUnit.em]: 'em',
    [SizeUnit.rem]: 'rem',
    [SizeUnit.px]: 'px',
    [SizeUnit.vh]: 'vh',
    [SizeUnit.vw]: 'vw',
    [SizeUnit.percent]: '%'
};

export enum EasingMode {
    Linear = 0,
    EaseIn = 1,
    EaseOut = 2,
    EaseInOut = 3
}

const easingCallbacks: Record<EasingMode, (t: number) => number> = {
    [EasingMode.Linear]: (t: number) => t,
    [EasingMode.EaseIn]: (t: number) => t * t * t,
    [EasingMode.EaseOut]: (t: number) => (t - 1) * (t - 1) * (t - 1) + 1,
    [EasingMode.EaseInOut]: (t: number) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1)
};

function interpolateColor(from: Color, to: Color, t: number): Color {
    return {
        r: from.r + (to.r - from.r) * t,
        g: from.g + (to.g - from.g) * t,
        b: from.b + (to.b - from.b) * t,
        a: from.a + (to.a - from.a) * t
    };
}

type useInterpolatedSizeReturn = [
    string,
    (targetValue: string) => void,
    {
        stop: () => void;
        onComplete: (callback: (finalValue: string) => void | null) => void;
        isAnimating: boolean;
    }
];

export function useInterpolatedSize(
    size: string,
    duration: number,
    easingMode: EasingMode = EasingMode.Linear
): useInterpolatedSizeReturn {
    const parsedSize = React.useMemo(() => {
        const parser = new StyleParser(size);
        const value = parser.parseSize();
        return value || px(0);
    }, [size]);

    const [value, setValue, { stop, onComplete, isAnimating }] = useInterpolatedState(parsedSize.value, {
        duration,
        easing: easingCallbacks[easingMode]
    });

    const setTargetValue = (desiredValue: string) => {
        const parser = new StyleParser(desiredValue);
        const value = parser.parseSize();
        if (!value) return;

        setValue(value.value);
    };

    const ownOnComplete = (callback: (finalValue: string) => void | null) => {
        onComplete(value => {
            callback?.(`${value}${unitStrings[parsedSize.unit]}`);
        });
    };

    React.useEffect(() => {
        setValue(parsedSize.value);
    }, [parsedSize]);

    return [
        `${value}${unitStrings[parsedSize.unit]}`,
        setTargetValue,
        { stop, onComplete: ownOnComplete, isAnimating }
    ];
}

type useInterpolatedColorReturn = [
    string,
    (targetValue: string) => void,
    {
        stop: () => void;
        onComplete: (callback: (finalValue: string) => void | null) => void;
        isAnimating: boolean;
    }
];

export function useInterpolatedColor(
    size: string,
    duration: number,
    easingMode: EasingMode = EasingMode.Linear
): useInterpolatedColorReturn {
    const parsedColor = React.useMemo(() => {
        const parser = new StyleParser(size);
        const value = parser.parseColor();
        return value || { r: 0, g: 0, b: 0, a: 0 };
    }, [size]);

    const [value, setValue, { stop, onComplete, isAnimating }] = useInterpolatedState(parsedColor, {
        duration,
        easing: easingCallbacks[easingMode],
        interpolate: interpolateColor
    });

    const setTargetValue = (desiredValue: string) => {
        const parser = new StyleParser(desiredValue);
        const value = parser.parseColor();
        if (!value) return;

        setValue(value);
    };

    const ownOnComplete = (callback: (finalValue: string) => void | null) => {
        onComplete(value => {
            callback?.(
                `rgba(${Math.round(value.r * 255.0)}, ${Math.round(value.g * 255.0)}, ${Math.round(value.b * 255.0)}, ${
                    value.a
                })`
            );
        });
    };

    React.useEffect(() => {
        setValue(parsedColor);
    }, [parsedColor]);

    return [
        `rgba(${Math.round(value.r * 255.0)}, ${Math.round(value.g * 255.0)}, ${Math.round(value.b * 255.0)}, ${
            value.a
        })`,
        setTargetValue,
        { stop, onComplete: ownOnComplete, isAnimating }
    ];
}

type useInterpolatedNumberReturn = [
    number,
    (targetValue: number) => void,
    {
        stop: () => void;
        onComplete: (callback: (finalValue: number) => void | null) => void;
        isAnimating: boolean;
    }
];

export function useInterpolatedNumber(
    value: number,
    duration: number,
    easingMode: EasingMode = EasingMode.Linear
): useInterpolatedNumberReturn {
    const [v, setValue, { stop, onComplete, isAnimating }] = useInterpolatedState(value, {
        duration,
        easing: easingCallbacks[easingMode]
    });

    const ownOnComplete = (callback: (finalValue: number) => void | null) => {
        onComplete(fv => {
            callback?.(fv);
        });
    };

    React.useEffect(() => {
        setValue(value);
    }, [value]);

    return [v, setValue, { stop, onComplete: ownOnComplete, isAnimating }];
}
