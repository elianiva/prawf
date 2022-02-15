import { GameHistory, gameHistory } from "@/store/gameState";
import styles from "@/styles/homepage.shadow.css?inline";
import { groupBy, map, mergeMap, of, reduce } from "rxjs";

export default class ResultPage extends HTMLElement {
  private _shadowRoot: ShadowRoot;

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
      </div>
    `;

    this._shadowRoot.appendChild(wrapper.content.cloneNode(true));
  }

  public connectedCallback() {
    if (!this.isConnected) return;
    this._render();

    const resultsByRound: Record<number, any> = {};
    of(...gameHistory)
      .pipe(
        groupBy((x) => x.round),
        mergeMap((group$) =>
          group$.pipe(
            reduce((acc, curr) => [...acc, curr], [] as GameHistory[])
          )
        ),
        map((roundResult) => ({ roundResult, idx: roundResult[0].round }))
      )
      .subscribe(({ roundResult, idx }) => {
        const correct = roundResult.filter(
          ({ questionNumber: [a, b], answer }) => (a + b) % 10 === answer
        ).length;
        const incorrect = roundResult.length - correct;

        resultsByRound[idx] = {
          correct: correct,
          incorrect: incorrect,
          correctRatio: parseFloat((correct / roundResult.length).toFixed(2))
        };
      });

    console.log(resultsByRound);
  }
}
