import styles from "@/styles/playpage.shadow.css?inline";
import { randomNumber } from "@/utils/randomNumber";
import { fromEvent, map, timer } from "rxjs";

export default class Playpage extends HTMLElement {
  private _shadowRoot: ShadowRoot;
  private _numbers: number[] = [9, 7, 4];

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
      <p-countdown-bar></p-countdown-bar>
      <p-countdown-timer></p-countdown-timer>
      <div class="container">
        <div class="question-wrapper">
          <div class="question-blocker"></div>
          <div class="question" id="question">
            ${this._numbers
              .map((number) => `<span class="question-item">${number}</span>`)
              .join("")}
          </div>
        </div>
        <div class="numpad" id="numpad">
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, ""]
            .map((n) => `<button class="numpad-button">${n}</button>`)
            .join("")}
        </div>
      </div>
    `;

    this._shadowRoot.appendChild(wrapper.content.cloneNode(true));
    this._attachEventListener();
  }

  private _attachEventListener() {
    const numpad = this._shadowRoot.getElementById("numpad");
    const question = this._shadowRoot.getElementById("question");

    fromEvent(numpad!, "click", (e) => e.target as HTMLButtonElement)
      .pipe(
        map(this._mapToAnswer),
        map((answer) => ({
          answer,
          numbers: [...this._numbers.slice(1), randomNumber(1, 9)]
        }))
      )
      .subscribe(({ answer, numbers }) => {
        if (answer === null || numbers === null) return;

        question!.style.transition = "transform 0.2s ease-out";
        question!.style.transform = "translateY(-5rem)";

        this._numbers = numbers;

        timer(200).subscribe(() => {
          question!.style.transition = "none";
          question!.style.transform = "translateY(6rem)";
          question!.innerHTML = this._numbers
            .map((number) => `<span class="question-item">${number}</span>`)
            .join("");
        });
      });
  }

  private _mapToAnswer(button: HTMLButtonElement) {
    if (
      button.tagName !== "BUTTON" ||
      (button.tagName === "BUTTON" && button.innerText === "")
    ) {
      return null;
    }
    return parseInt(button.innerText);
  }

  public connectedCallback() {
    if (!this.isConnected) return;
    this._render();
  }
}
