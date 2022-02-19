import { Subject } from "rxjs";

export const DURATION = [1, 10, 15, 30, 60, 120] as const;
export type ValidDuration = typeof DURATION[number];

export let chosenDuration: ValidDuration = DURATION[1];
export const chosenDuration$ = new Subject<ValidDuration>();
chosenDuration$.subscribe((d) => (chosenDuration = d));

export const ROUNDS = [5, 10, 15, 20] as const;
export type ValidRounds = typeof ROUNDS[number];

export let chosenRounds: ValidRounds = ROUNDS[1];
export const chosenRounds$ = new Subject<ValidRounds>();
chosenRounds$.subscribe((d) => (chosenRounds = d));

export let currentRound: number = 1;
export const currentRound$ = new Subject<number>();
currentRound$.subscribe((round) => (currentRound = round));

export type GameHistory = {
  questionNumber: [number, number, number];
  answer: number;
  durationMs: number;
  round: number;
};

// debugging purpose only
// import FAKE from "@/FAKE.json";
// export const gameHistory: GameHistory[] = [...(FAKE) as GameHistory[]];

export const gameHistory: GameHistory[] = [];
export const gameHistory$ = new Subject<GameHistory>();
gameHistory$.subscribe((history) => gameHistory.push(history));
