import { Subscription } from "rxjs";
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
      <p-countdown-bar></p-countdown-bar>
      <p-countdown-timer></p-countdown-timer>
      <div class="container">
        <h1 class="title">PLAY</h1>
      </div>
    `;

    this._shadowRoot.appendChild(wrapper.content.cloneNode(true));
    this._attachEventListener();
  }

  private _attachEventListener() {
  }

  public connectedCallback() {
    if (!this.isConnected) return;
    this._render();
  }

  public disconnectedCallback() {
    this._clickEvent$?.unsubscribe();
  }
}
