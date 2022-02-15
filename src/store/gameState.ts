// TODO(elianiva): might add logic for endless test until user pressed end
//                 button
export const DURATION = [10, 15, 30, 60, 120] as const;

export type ValidDuration = typeof DURATION[number];

export let chosenDuration: ValidDuration = DURATION[0];
export function setChosenDuration(duration: ValidDuration) {
  chosenDuration = duration;
}

export const history = [];
