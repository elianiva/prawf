import { fromEvent, Subscription } from "rxjs";
import { optionsPopupVisibility } from "@/store/popup";
import styles from "@/styles/options-popup.shadow.css?inline";

export default class OptionsPopup extends HTMLElement {
  private _shadowRoot: ShadowRoot;
  private _clickEvent: Subscription | null = null;
  private _isVisible: boolean = false;

  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: "open" });
    optionsPopupVisibility.subscribe((visible) => {
      this._isVisible = visible;
      this._render();
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
          <h1>BRUH</h1>
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

    this._clickEvent = fromEvent(content!, "click", (e) =>
      (e.target as Element).closest("button")
    ).subscribe((button) => {
      if (button === null) return;

      switch (button.id) {
        case "start":
          optionsPopupVisibility.next(true);
          break;
        case "close":
          optionsPopupVisibility.next(false);
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
}
