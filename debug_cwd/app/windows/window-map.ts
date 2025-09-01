import type { FC } from 'mini-react';
import { MainWindow } from './main/MainWindow';
import { WindowComponent } from './types';

export const WindowMap = {
    Main: MainWindow
} as const;

export type WindowMapType = typeof WindowMap;
export type WindowId = keyof WindowMapType;

export const WindowIds = Object.keys(WindowMap) as WindowId[];

type NoProps = Record<string, never>;
type OnlyOptionalProps<T> = {
    [K in keyof T]-?: {} extends Pick<T, K> ? true : false;
}[keyof T] extends true
    ? true
    : false;

type PropsParam<PropsType> = unknown extends PropsType
    ? []
    : PropsType extends NoProps
    ? []
    : OnlyOptionalProps<PropsType> extends true
    ? [props?: PropsType]
    : [props: PropsType];

type ExtractWindowProps<WC extends FC<any>> = WC extends WindowComponent<infer P> ? P : never;

export type WindowProps<W extends WindowId> = ExtractWindowProps<WindowMapType[W]>;
export type OpenWindowParams<W extends WindowId> = PropsParam<WindowProps<W>>;
