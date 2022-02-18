import { chosenDuration } from "@/store/gameState";

export default class CountdownBar extends HTMLElement {
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
        :host {
          position: fixed;
          display: block;
          top: 0;
          left: 0;
          right: 0;
          height: 0.5rem;
          background-color: var(--lighter-grey);
          z-index: 100;
        }

        .countdown {
          display: relative;
          height: 100%;
          width: 100%;
          background-color: var(--sky);
          transition: width ${chosenDuration * 60}s linear;
        }
      </style>
      <div class="countdown">
      </div>
    `;

    this._shadowRoot.appendChild(wrapper.content.cloneNode(true));
  }

  public connectedCallback() {
    this._render();

    // start the animation on next frame
    window.requestAnimationFrame(() => {
      const countdownBar = this._shadowRoot.querySelector(".countdown");
      if (countdownBar === null) return;
      (countdownBar as HTMLDivElement).style.width = "0%";
    });
  }
}
