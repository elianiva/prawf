export default class NotFound extends HTMLElement {
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
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 2rem;
        }

        .message {
          font-family: var(--font-heading);
          font-weight: 500;
          font-size: 2rem;
          text-align: center;
        }

        a {
          color: var(--dark-sky);
        }
      </style>
      <h1 class="message">
        Page not found. Want to go back to the <a href="/">homepage</a>?
      </h1>
    `;

    this._shadowRoot.appendChild(wrapper.content.cloneNode(true));
  }

  public connectedCallback() {
    this._render();
  }
}
