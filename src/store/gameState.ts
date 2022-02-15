// TODO(elianiva): might add logic for endless test until user pressed end

import { randomNumber } from "@/utils/randomNumber";

//                 button
export const DURATION = [10, 15, 30, 60, 120] as const;

export type ValidDuration = typeof DURATION[number];

export let chosenDuration: ValidDuration = DURATION[0];
export function setChosenDuration(duration: ValidDuration) {
  chosenDuration = duration;
}

export type History = {
  questionNumber: [number, number, number];
  answer: number;
  durationMs: number;
};

// TODO(elianiva): remove these stuff later on
function windowElements(array: number[], windowSize: number): number[][] {
  const result: number[][] = [];
  for (let i = 0; i < array.length - windowSize; i += 1) {
    result.push(array.slice(i, i + windowSize));
  }
  return result;
}
const FAKE_HISTORY = windowElements(
  [4, 5, 6, 5, 4, 5, 6, 5, 4, 5, 6, 7, 4, 5, 2, 2, 6, 7, 8, 9, 6, 7, 8, 9, 7],
  3
).map((arr) => ({
  questionNumber: arr as [number, number, number],
  answer: randomNumber(0, 9),
  durationMs: arr[1] * randomNumber(1, 9)
}));

export const gameHistory: History[] = [...FAKE_HISTORY];
