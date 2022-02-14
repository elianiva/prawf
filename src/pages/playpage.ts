import { fromEvent, Subscription } from "rxjs";
import { instructionPopupVisibility$ } from "@/store/popup";
import styles from "@/styles/homepage.shadow.css?inline";

export default class Playpage extends HTMLElement {
  private _shadowRoot: ShadowRoot;
  private _clickEvent$: Subscription | null = null;

  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: "open" });
  }

  private _render() {
    // clean previous content and remove previous event listener
    this._clickEvent$?.unsubscribe();
    this._shadowRoot.innerHTML = "";

    const wrapper = document.createElement("template");
    wrapper.innerHTML = `
      <style>
        ${styles}
      </style>
      <div class="container">
        <h1 class="title">PLAY</h1>
      </div>
    `;

    this._shadowRoot.appendChild(wrapper.content.cloneNode(true));
    this._attachEventListener();
  }

  private _attachEventListener() {
    const buttons = this._shadowRoot.getElementById("buttons");

    this._clickEvent$ = fromEvent(
      buttons!,
      "click",
      (e) => e.target as HTMLButtonElement
    ).subscribe((button) => {
      if (button === null) return;

      if (button.id === "start-button") {
        instructionPopupVisibility$.next(true);
      }
    });
  }

  public connectedCallback() {
    if (!this.isConnected) return;
    this._render();
  }

  public disconnectedCallback() {
    this._clickEvent$?.unsubscribe();
  }
}
