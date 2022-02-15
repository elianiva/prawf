import { Subject } from "rxjs";

export interface Result {
  correct: number;
  incorrect: number;
  correctRatio: number;
}

export const resultsByRound: Record<number, Result> = {};
export const resultsByRound$ = new Subject<{ round: number; result: Result }>();
resultsByRound$.subscribe(({ round, result }) => {
  resultsByRound[round] = result;
});
