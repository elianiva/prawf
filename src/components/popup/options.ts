import { fromEvent, Subscription } from "rxjs";
import { optionsPopupVisibility$ } from "@/store/popup";
import baseStyles from "@/styles/base-popup.shadow.css?inline";
import styles from "@/styles/options-popup.shadow.css?inline";
import { currentRoute$ } from "@/store/route";
import {
  chosenDuration,
  chosenDuration$,
  DURATION,
  chosenRounds,
  chosenRounds$,
  ROUNDS
} from "@/store/gameState";

export default class OptionsPopup extends HTMLElement {
  private _shadowRoot: ShadowRoot;
  private _clickEvent$: Subscription | null = null;
  private _isVisible: boolean = false;

  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: "open" });
    optionsPopupVisibility$.subscribe((visible) => {
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
        <h1 class="title">Test Options</h1>
        <div class="body">
          <div class="options">
            <label class="option-item">
              <span class="option-label">Duration</span>
              <div class="choices">
                ${DURATION.map(
                  (duration, idx) =>
                    `<button
                        class="choice-item ${
                          chosenDuration === duration ? "active" : ""
                        }"
                        id=${"duration-" + idx}
                      >
                        ${duration}m
                      </button>`
                ).join("")}
              </div>
            </label>
            <label class="option-item">
              <span class="option-label">Rounds</span>
              <div class="choices">
                ${ROUNDS.map(
                  (round, idx) =>
                    `<button
                        class="choice-item ${
                          chosenRounds === round ? "active" : ""
                        }"
                        id=${"rounds-" + idx}
                      >
                        ${round}
                      </button>`
                ).join("")}
              </div>
            </label>
          </div>
        </div>
        <div class="footer" id="footer">
          <button id="start" class="primary-button">
            Start
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

      switch (true) {
        case button.id === "start":
          optionsPopupVisibility$.next(false);
          currentRoute$.next("/play");
          break;
        case button.id === "close":
          optionsPopupVisibility$.next(false);
          break;
        case button.id.startsWith("duration-"):
          const durationIdx = parseInt(button.id.split("-")[1]);
          chosenDuration$.next(DURATION[durationIdx]);
          break;
        case button.id.startsWith("rounds-"):
          const roundsIdx = parseInt(button.id.split("-")[1]);
          chosenRounds$.next(ROUNDS[roundsIdx]);
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
