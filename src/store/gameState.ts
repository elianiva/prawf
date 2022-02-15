import { Subject } from "rxjs";

// TODO(elianiva): might add logic for endless test until user pressed end
//                 button
export const DURATION = [10, 15, 30, 60, 120] as const;

export type ValidDuration = typeof DURATION[number];

export let chosenDuration: ValidDuration = DURATION[0];
export function setChosenDuration(duration: ValidDuration) {
  chosenDuration = duration;
}

export type GameHistory = {
  questionNumber: [number, number, number];
  answer: number;
  durationMs: number;
};

export const gameHistory: GameHistory[] = [];

export const gameHistory$ = new Subject<GameHistory>();
gameHistory$.subscribe((history) => {
  gameHistory.push(history);
});
