import { gameHistory } from "@/store/gameState";
import styles from "@/styles/history.shadow.css?inline";
import checkmarkIcon from "@/icons/checkmark.svg?raw";
import crossIcon from "@/icons/cross.svg?raw";

export default class History extends HTMLElement {
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
      ${gameHistory
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
        .join("")}
    `;

    this._shadowRoot.appendChild(wrapper.content.cloneNode(true));
  }

  public connectedCallback() {
    if (!this.isConnected) return;
    this._render();
  }
}
