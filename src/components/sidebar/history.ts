import { gameHistory, gameHistory$ } from "@/store/gameState";
import styles from "@/styles/sidebar-history.shadow.css?inline";
import checkmarkIcon from "@/icons/checkmark.svg?raw";
import crossIcon from "@/icons/cross.svg?raw";

export default class SidebarHistory extends HTMLElement {
  private _shadowRoot: ShadowRoot;

  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: "open" });

    gameHistory$.subscribe(() => {
      this._render();
      this.scrollTo({
        top: 0
      });
    });
  }

  private _render() {
    // clean previous content and remove previous event listener
    this._shadowRoot.innerHTML = "";

    const wrapper = document.createElement("template");
    wrapper.innerHTML = `
      <style>
        ${styles}
      </style>
      ${
        gameHistory.length === 0
          ? '<span class="history-message">Your answer history will appear here</span>'
          : gameHistory
              .slice()
              .reverse()
              .map(({ answer, durationMs, questionNumber }) => {
                const [firstNumber, secondNumber] = questionNumber;
                const isCorrect = answer === (firstNumber + secondNumber) % 10;
                return `
            <div class="item">
              <div class="item-icon ${isCorrect ? "green" : "red"}">
                ${isCorrect ? checkmarkIcon : crossIcon}
              </div>
              <div class="item-question">
                ${firstNumber} + ${secondNumber}
              </div>
              <div class="item-equal-sign">
                =
              </div>
              <div class="item-answer">
                ${answer}
              </div>
              <div class="item-duration">
                ${durationMs}
              </div>
            </div>`;
              })
              .join("")
      }
    `;

    this._shadowRoot.appendChild(wrapper.content.cloneNode(true));
  }

  public connectedCallback() {
    this._render();
  }
}
