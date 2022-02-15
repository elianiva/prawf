import { GameHistory, gameHistory } from "@/store/gameState";
import { resultsByRound$ } from "@/store/result";
import styles from "@/styles/result.shadow.css?inline";
import { groupBy, map, mergeMap, of, reduce } from "rxjs";

export default class ResultPage extends HTMLElement {
  private _shadowRoot: ShadowRoot;
  private _correct: number = 0;
  private _incorrect: number = 0;
  private _averageRatio: number = 0;

  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: "open" });
  }

  private _render() {
    // clean previous content and remove previous event listener
    this._shadowRoot.innerHTML = "";

    const wrapper = document.createElement("template");
    wrapper.innerHTML = `
      <style>
        ${styles}
      </style>
      <div class="container">
        <h1 class="title">Your Test Result</h1>
        <div class="result-box">
          <div class="result-item">
            <span class="result-label">Correct</span>
            <span class="result-value">${this._correct}</span>
          </div>
          <div class="result-item">
            <span class="result-label">Incorrect</span>
            <span class="result-value">${this._incorrect}</span>
          </div>
          <div class="result-item">
            <span class="result-label">Ratio</span>
            <span class="result-value">${this._averageRatio * 100}%</span>
          </div>
        </div>
        <div class="chart-box">
          <span class="chart-label">Progression Overtime</span>
          <p-chart></p-chart>
        </div>
      </div>
    `;

    this._shadowRoot.appendChild(wrapper.content.cloneNode(true));
  }

  private _mapToResult({
    roundResult,
    round
  }: {
    roundResult: GameHistory[];
    round: number;
  }) {
    const correct = roundResult.filter(
      ({ questionNumber: [a, b], answer }) => (a + b) % 10 === answer
    ).length;
    const incorrect = roundResult.length - correct;

    return {
      correct: correct,
      incorrect: incorrect,
      correctRatio: parseFloat((correct / (correct + incorrect)).toFixed(2)),
      round
    };
  }

  public connectedCallback() {
    if (!this.isConnected) return;

    of(...gameHistory)
      .pipe(
        groupBy((x) => x.round),
        mergeMap((group$) =>
          group$.pipe(
            reduce((acc, curr) => [...acc, curr], [] as GameHistory[])
          )
        ),
        map((roundResult) => ({ roundResult, round: roundResult[0].round })),
        map(this._mapToResult)
      )
      .subscribe(({ correct, incorrect, correctRatio, round }) => {
        this._correct += correct;
        this._incorrect += incorrect;
        resultsByRound$.next({
          round,
          result: {
            correct: correct,
            incorrect: incorrect,
            correctRatio: correctRatio
          }
        });
      });
    this._averageRatio = parseFloat(
      (this._correct / (this._correct + this._incorrect)).toFixed(2)
    );

    this._render();
  }
}
