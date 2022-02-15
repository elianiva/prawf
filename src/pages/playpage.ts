import styles from "@/styles/playpage.shadow.css?inline";
import { randomNumber } from "@/utils/randomNumber";
import { filter, fromEvent, map, Subscription, timer } from "rxjs";

export default class Playpage extends HTMLElement {
  private _shadowRoot: ShadowRoot;
  private _numbers: number[] = [9, 7, 4];
  private _numpadEvent$: Subscription | null = null;
  private _keyboardEvent$: Subscription | null = null;
  private _questionBox: HTMLDivElement | null = null;

  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: "open" });
  }

  private _render() {
    // clean previous content and remove previous event listener
    this._numpadEvent$?.unsubscribe();
    this._keyboardEvent$?.unsubscribe();
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
    this._questionBox = this._shadowRoot.getElementById(
      "question"
    ) as HTMLDivElement | null;
    this._attachEventListener();
  }

  private _attachEventListener() {
    const numpad = this._shadowRoot.getElementById("numpad");

    this._numpadEvent$ = fromEvent(
      numpad!,
      "click",
      (e) => e.target as HTMLButtonElement
    )
      .pipe(
        filter(
          (button) => button.tagName === "BUTTON" && button.innerText !== ""
        ),
        map(this._mapToAnswer),
        map(this._withNumbers.bind(this))
      )
      .subscribe(this._answerQuestion.bind(this));

    this._keyboardEvent$ = fromEvent(document, "keydown")
      .pipe(
        filter((e) => /^[0-9]$/.test((e as KeyboardEvent).key)),
        map((e) => parseInt((e as KeyboardEvent).key)),
        map(this._withNumbers.bind(this))
      )
      .subscribe(this._answerQuestion.bind(this));
  }

  private _answerQuestion({
    answer,
    numbers
  }: {
    answer: number;
    numbers: number[];
  }) {
    console.log(answer, numbers);

    this._questionBox!.style.transition = "transform 0.2s ease-out";
    this._questionBox!.style.transform = "translateY(-5rem)";

    this._numbers = numbers;

    timer(200).subscribe(() => {
      this._questionBox!.style.transition = "none";
      this._questionBox!.style.transform = "translateY(6rem)";
      this._questionBox!.innerHTML = this._numbers
        .map((number) => `<span class="question-item">${number}</span>`)
        .join("");
    });
  }

  private _mapToAnswer(button: HTMLButtonElement) {
    return parseInt(button.innerText);
  }

  private _withNumbers(answer: number) {
    return {
      answer,
      numbers: [...this._numbers.slice(1), randomNumber(1, 9)]
    };
  }

  public connectedCallback() {
    if (!this.isConnected) return;
    this._render();
  }

  public disconnectedCallback() {
    this._numpadEvent$?.unsubscribe();
    this._keyboardEvent$?.unsubscribe();
  }
}
