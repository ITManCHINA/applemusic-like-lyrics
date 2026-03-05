import { atom } from "jotai";
import { onCycleRepeatModeAtom, onToggleShuffleAtom } from "./callbacks";

export enum RepeatMode {
	Off = "off",
	One = "one",
	All = "all",
}

export const isShuffleActiveAtom = atom<boolean>(false);
export const repeatModeAtom = atom<RepeatMode>(RepeatMode.Off);
export const isShuffleEnabledAtom = atom<boolean>(false);
export const isRepeatEnabledAtom = atom<boolean>(false);
export const toggleShuffleActionAtom = atom(null, (get) => {
	const callback = get(onToggleShuffleAtom);
	callback.onEmit?.();
});

export const cycleRepeatModeActionAtom = atom(null, (get) => {
	const callback = get(onCycleRepeatModeAtom);
	callback.onEmit?.();
});
