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
          grid-template-rows: auto 1fr;
          padding: 1rem;
          border-radius: 0.25rem;
          background-color: var(--white);
          border-right: 0.125rem var(--lighter-grey) solid;
          width: 100%;
          max-height: 100vh;
          z-index: 20;
        }

        .top-box {
          border-bottom: 0.125rem var(--lighter-grey) solid;
        }

        .main-box {
          position: relative;
          display: flex;
          justify-content: center;
          overflow-y: auto;
          max-height: calc(100% - 3rem);
        }

        .main-box::-webkit-scrollbar {
          display: none;
        }
      </style>
      <div class="top-box">
        <p-countdown-timer></p-countdown-timer>
      </div>
      <div class="main-box">
        <p-history></p-history>
      </div>
    `;

    this._shadowRoot.appendChild(wrapper.content.cloneNode(true));
  }

  public connectedCallback() {
    if (!this.isConnected) return;
    this._render();
  }
}
