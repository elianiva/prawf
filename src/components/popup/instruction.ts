import { fromEvent, Subscription } from "rxjs";
import { instructionPopupVisibility$ } from "@/store/popup";
import baseStyles from "@/styles/base-popup.shadow.css?inline";
import styles from "@/styles/instruction-popup.shadow.css?inline";

export default class InstructionPopup extends HTMLElement {
  private _shadowRoot: ShadowRoot;
  private _pageNumber: number = 1;
  private _clickEvent$: Subscription | null = null;
  private _isVisible: boolean = false;

  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: "open" });
    instructionPopupVisibility$.subscribe((visible) => {
      if (!visible) this._pageNumber = 1;
      this._isVisible = visible;
      this._render();
    });
  }

  private _render() {
    // clean previous content and remove previous event listener
    this._clickEvent$?.unsubscribe();
    this._shadowRoot.innerHTML = "";

    const wrapper = document.createElement("template");
    wrapper.innerHTML = `
      <style>
        ${baseStyles}
        ${styles}

        :host {
          visibility: ${this._isVisible ? "visible" : "hidden"};
          opacity: ${this._isVisible ? "1" : "0"};
          transform: ${this._isVisible ? "translateY(0)" : "translateY(-2rem)"};
        }
      </style>
      <div class="content" id="content">
        <button class="close-button" id="close">&times;</button>
        <h1 class="title">Instructions</h1>
        <div class="body">
          <div style="display: ${this._pageNumber === 1 ? "block" : "none"}">
            <p>
              <b>PRAWF</b> is a <b>Pauli Test</b> simulation. If you don't know
              what it is, it's a very common psychological test to measure your
              consistency, accuracy, and concentration. It's usually done in 60
              minutes and written on a piece of paper.
            </p>
            <p>
              The test itself is very simple yet requires great energy and
              concentration. You will be presented with a series of numbers. Your
              task is to calculate the modulus of the sum from two numbers.
              Traditionally, you will be given a
              <a href="https://i.ibb.co/pbVPYvf/a.jpg" target="_blank">
                piece of paper with some numbers on it
              </a>
              and you need write the result between those two numbers.
            </p>
            <p>
              To calculate the result, what you need to do is sum the numbers,
              <code>8 + 7</code> for example, and then modulo it by <code>10</code>.
              For example: <code>8 + 7 = 15 % 10 = 5</code>
              <br />
              Another way to think about it is you sum the numbers, we'll use
              <code>8 + 7</code> again, and only write the last digit. So, the result
              will be <code>5</code> since <code>8 + 7</code> is <code>15</code> and
              its last digit is <code>5</code>.
              <br />
              If the result is only a single digit, <code>2 + 5 = 7</code> for example,
              then the final result would be <code>7</code>.
            </p>
          </div>
          <div style="display: ${this._pageNumber === 2 ? "block" : "none"}">
            <p>
              The test will be divided into several rounds. Each round will be
              15 minutes each. It is necessary to divide this test into several
              rounds to measure your consistency.
            </p>
            <p>
              You will get a notification when the round is changed. There will
              be no difference on your side, you can proceed to answer the
              question like you would normally do. You will also be able to see
              how much time you have left.
            </p>
            <p>
              Since this is a digital app, you will only be given 2 numbers at a
              time. The numbers will cycle through after you have answered the
              question.
            </p>
          </div>
          <div style="display: ${this._pageNumber === 3 ? "block" : "none"}">
            <p>
              Here are some rules that you need to keep in mind:
            </p>
            <ul>
              <li>
                For each correct answer, you will receive 1 point.
              </li>
              <li>
                If you get a question wrong, your point will be reduced by 1.
              </li>
              <li>
                It's more important to be consistent and accurate rather than
                to be quick, but you should aim to be quick and correct for the best
                result.
              </li>
              <li>
                You can choose how long do you want to take the test. The
                longer you do the test, the more accurate the result will be.
              </li>
              <li>
                You can answer the question either by using the provided numpad
                or use your keyboard.
              </li>
            </ul>
          </div>
        </div>
        <div class="footer" id="footer">
          <button id="prev" class="secondary-button" style="display: ${
            this._pageNumber === 1 ? "none" : "block"
          }">
            Previous
          </button>
          <button id="next" class="primary-button">
            ${this._pageNumber === 3 ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    `;

    this._shadowRoot.appendChild(wrapper.content.cloneNode(true));
    this._attachEventListener();
  }

  private _attachEventListener() {
    const content = this._shadowRoot.getElementById("content");

    this._clickEvent$ = fromEvent(
      content!,
      "click",
      (e) => e.target as HTMLButtonElement
    ).subscribe((button) => {
      if (button === null) return;

      switch (button.id) {
        case "next":
          if (this._pageNumber >= 3) {
            instructionPopupVisibility$.next(false);
            return;
          }
          this._pageNumber++;
          break;
        case "prev":
          if (this._pageNumber <= 1) return;
          this._pageNumber--;
          break;
        case "close":
          instructionPopupVisibility$.next(false);
          break;
        default: /* noop */
      }
      this._render();
    });
  }

  public get popupTitle() {
    return this.getAttribute("p-title") || "DEFAULT POPUP TITLE";
  }

  public connectedCallback() {
    this._render();
  }

  public disconnectedCallback() {
    this._clickEvent$?.unsubscribe();
  }
}
