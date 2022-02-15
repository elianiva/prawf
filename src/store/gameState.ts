import { Subject } from "rxjs";
import FAKE from "@/FAKE.json";

// TODO(elianiva): might add logic for endless test until user pressed end
//                 button
export const DURATION = [1, 10, 15, 30, 60, 120] as const;
export type ValidDuration = typeof DURATION[number];
export type GameHistory = {
  questionNumber: [number, number, number];
  answer: number;
  durationMs: number;
  round: number;
};

export let chosenDuration: ValidDuration = DURATION[0];
export const chosenDuration$ = new Subject<ValidDuration>();
chosenDuration$.subscribe((d) => (chosenDuration = d));

export const gameHistory: GameHistory[] = [...(FAKE as GameHistory[])];
// export const gameHistory: GameHistory[] = [];
export const gameHistory$ = new Subject<GameHistory>();
gameHistory$.subscribe((history) => gameHistory.push(history));

export let currentRound: number = 1;
export const currentRound$ = new Subject<number>();
currentRound$.subscribe((round) => (currentRound = round));
