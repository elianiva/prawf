import { gameHistory } from "@/store/gameState";
import styles from "@/styles/history-table.shadow.css?inline";

export default class CountdownBar extends HTMLElement {
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
        :host {
          margin-top: 1.5rem;
          display: block;
        }

        ${styles}
      </style>
      <table>
        <thead>
          <th>No.</th>
          <th>Time</th>
          <th>Question</th>
          <th>Answer</th>
          <th>Status</th>
          <th>Round</th>
        </thead>
        <tbody>
          ${
            /* prettier-ignore */
            gameHistory
              .map(({ durationMs, questionNumber: [a, b], answer, round }, idx, history) => `
                <tr class="${idx + 1 < history.length && history[idx + 1].round !== round ? 'bold-border' : 'thin-border'}">
                  <td>${idx + 1}</td>
                  <td>${durationMs}ms</td>
                  <td>${a} + ${b}</td>
                  <td>${answer}</td>
                  <td>
                    ${((a + b) % 10 === answer) ? "Correct" : "Incorrect" }
                  </td>
                  <td>${round}</td>
                </tr>
              `).join("")
          }
        </tbody>
      </table>
    `;

    this._shadowRoot.appendChild(wrapper.content.cloneNode(true));
  }

  public connectedCallback() {
    this._render();
  }
}
