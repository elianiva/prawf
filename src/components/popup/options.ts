import { fromEvent, Subscription } from "rxjs";
import { optionsPopupVisibility$ } from "@/store/popup";
import baseStyles from "@/styles/base-popup.shadow.css?inline";
import styles from "@/styles/options-popup.shadow.css?inline";
import { currentRoute$ } from "@/store/route";

export default class OptionsPopup extends HTMLElement {
  private _shadowRoot: ShadowRoot;
  private _clickEvent$: Subscription | null = null;
  private _isVisible: boolean = false;
  private _durations: number[] = [10, 15, 30, 60, 120];
  private _chosenDuration: number = 0;

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
              <div class="durations">
                ${this._durations
                  .map(
                    (duration, idx) =>
                      `<button
                        class="duration-item ${
                          this._chosenDuration === idx ? "active" : ""
                        }"
                        id=${"duration-" + idx}
                      >
                        ${duration}m
                      </button>`
                  )
                  .join("")}
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
          this._chosenDuration = parseInt(button.id.split("-")[1]);
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
    if (!this.isConnected) return;
    this._render();
  }

  public disconnectedCallback() {
    this._clickEvent$?.unsubscribe();
  }
}
