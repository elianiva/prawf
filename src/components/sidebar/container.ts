export default class SidebarContainer extends HTMLElement {
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
          display: grid;
          grid-template-rows: auto 4rem 1fr;
          align-items: center;
          padding: 1rem;
          border-radius: 0.25rem;
          background-color: var(--white);
          border-right: 0.125rem var(--lighter-grey) solid;
          width: 100%;
          max-height: calc(100vh - 2rem);
          z-index: 20;
        }

        .top-box {
          border-bottom: 0.125rem var(--lighter-grey) solid;
        }

        .history-title {
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 1.5rem;
          line-height: 1em;
          color: var(--black);
        }
      </style>
      <div class="top-box">
        <p-countdown-timer></p-countdown-timer>
      </div>
      <span class="history-title">History</span>
      <p-history></p-history>
    `;

    this._shadowRoot.appendChild(wrapper.content.cloneNode(true));
  }

  public connectedCallback() {
    this._render();
  }
}
