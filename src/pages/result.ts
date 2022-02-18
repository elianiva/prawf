import { chartMode, chartMode$ } from "@/store/chart";
import { chosenDuration, GameHistory, gameHistory } from "@/store/gameState";
import { resultsByRound, resultsByRound$ } from "@/store/result";
import styles from "@/styles/result.shadow.css?inline";
import { toFixedTwo } from "@/utils/toFixedTwo";
import barChartIcon from "@/icons/bar-chart.svg?raw";
import lineChartIcon from "@/icons/line-chart.svg?raw";
import questionIcon from "@/icons/question.svg?raw";
import {
  fromEvent,
  groupBy,
  map,
  mergeMap,
  of,
  reduce,
  Subscription
} from "rxjs";

export default class ResultPage extends HTMLElement {
  private _shadowRoot: ShadowRoot;
  private _clickEvent: Subscription | null = null;
  private _correct: number = 0;
  private _incorrect: number = 0;
  private _averageRatio: number = 0;
  private _standardDeviation: number = 0;
  private _totalAnswered: number = 0;
  private _chartToggle: HTMLElement | null = null;

  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: "open" });

    chartMode$.subscribe((mode) => {
      if (this._chartToggle === null) return;
      this._chartToggle.innerHTML =
        mode === "line" ? barChartIcon : lineChartIcon;
    });
  }

  private _render() {
    // clean previous content and remove previous event listener
    this._clickEvent?.unsubscribe();
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
            <span class="result-question">${questionIcon}</span>
            <div class="result-info">
              <p>This is the total of your correct answers for every rounds combined.</p>
            </div>
            <span class="result-label">Correct</span>
            <span class="result-value">${this._correct}</span>
          </div>
          <div class="result-item">
            <span class="result-question">${questionIcon}</span>
            <div class="result-info">
              <p>This is the total of your incorrect answers for every rounds combined.</p>
            </div>
            <span class="result-label">Incorrect</span>
            <span class="result-value">${this._incorrect}</span>
          </div>
          <div class="result-item">
            <span class="result-question">${questionIcon}</span>
            <div class="result-info">
              <p>This is the ratio of your correct answers from the entire questions.</p>
            </div>
            <span class="result-label">Ratio</span>
            <span class="result-value">${this._averageRatio * 100}%</span>
          </div>
          <div class="result-item">
            <span class="result-question">${questionIcon}</span>
            <div class="result-info">
              <p>
                Standard Deviation is how much your total answers deviate between each rounds.
                Low number means you're consistent. High number means you're
                inconsistent between rounds. The lower, the better.
              </p>
            </div>
            <span class="result-label">Standard Deviation</span>
            <span class="result-value">${this._standardDeviation}</span>
          </div>
          <div class="result-item">
            <span class="result-question">${questionIcon}</span>
            <div class="result-info">
              <p>
                This is how long you've been doing the test. This was chosen before you start the test.
              </p>
            </div>
            <span class="result-label">Duration</span>
            <span class="result-value">${chosenDuration}m</span>
          </div>
          <div class="result-item">
            <span class="result-question">${questionIcon}</span>
            <div class="result-info">
              <p>
                This is the average of how many questions you answered for each round.
              </p>
            </div>
            <span class="result-label">Answers per round</span>
            <span class="result-value">${
              (this._correct + this._incorrect) / 10
            }</span>
          </div>
        </div>
        <div class="chart-box">
          <div class="chart-header">
            <button class="chart-toggle" id="chart-toggle">
              ${chartMode === "line" ? barChartIcon : lineChartIcon}
            </button>
            <span class="chart-title">Progression Overtime</span>
            <div class="chart-legend">
              <span class="chart-legend-item correct"></span>
              <span class="chart-legend-item incorrect"></span>
            </div>
          </div>
          <p-chart></p-chart>
        </div>
        <div class="history-box">
          <span class="history-title">History</span>
          <p-history-table></p-history-table>
        </div>
      </div>
    `;

    this._shadowRoot.appendChild(wrapper.content.cloneNode(true));
    this._attachEventListener();
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
      correctRatio: toFixedTwo(correct / (correct + incorrect)),
      round
    };
  }

  private _findStandardDeviation() {
    const results = Object.values(resultsByRound);
    const mean = this._totalAnswered / results.length;

    // I could've done this without rxjs... but meh,
    // it's fun to do it this way :p
    of(...results)
      .pipe(
        map((r) => r.correct + r.incorrect),
        map((x) => (x - mean) ** 2),
        reduce((acc, curr) => acc + curr, 0),
        map((sum) => toFixedTwo(sum / (results.length - 1)))
      )
      .subscribe((s) => {
        this._standardDeviation = s;
      });
  }

  private _findStatistics() {
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
    this._totalAnswered = this._correct + this._incorrect;
    this._averageRatio = toFixedTwo(
      this._correct / (this._correct + this._incorrect)
    );
  }

  private _attachEventListener() {
    this._chartToggle = this._shadowRoot.getElementById("chart-toggle");
    fromEvent(this._chartToggle!, "click").subscribe(() => {
      chartMode$.next(chartMode === "line" ? "bar" : "line");
    });
  }

  public connectedCallback() {
    this._findStatistics();
    this._findStandardDeviation();
    this._render();
  }
}
