import { currentTheme, currentTheme$ } from "@/store/theme";
import styles from "@/styles/theme-button.shadow.css?inline";
import { fromEvent, Subscription } from "rxjs";

export default class ThemeButton extends HTMLElement {
  private _shadowRoot: ShadowRoot;
  private _clickEvent: Subscription | null = null;
  private _icon: HTMLDivElement | null = null;

  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: "open" });

    currentTheme$.subscribe(({ previous, current }) => {
      this._icon?.classList.replace(previous, current);
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
      </style>
      <div class="circle ${currentTheme}" id="icon">
        <div class="inner-circle"></div>
      </div>
    `;

    this._shadowRoot.appendChild(wrapper.content.cloneNode(true));
    this._attachEventListener();
    this._icon = this._shadowRoot.getElementById(
      "icon"
    ) as HTMLDivElement | null;
  }

  private _attachEventListener() {
    this._clickEvent = fromEvent(this, "click").subscribe(() => {
      currentTheme$.next({
        previous: currentTheme,
        current: currentTheme === "light" ? "dark" : "light"
      });
    });
  }

  public connectedCallback() {
    this._render();
  }

  public disconnectedCallback() {
    this._clickEvent?.unsubscribe();
  }
}
