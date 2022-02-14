import { chosenDuration } from "@/store/gameState";
import { currentRoute$ } from "@/store/route";
import { toReadableTime } from "@/utils/toReadableTime";
import { map, takeUntil, timer } from "rxjs";

export default class Timer extends HTMLElement {
  private _shadowRoot: ShadowRoot;
  private _readableTime: string = "00:00:00";

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
          top: 2rem;
          left: 1.5rem;
          padding: 1rem;
          border-radius: 0.25rem;
          box-shadow: 0 0.25rem 1rem rgba(0, 0, 0, 0.08);
          background-color: var(--white);
        }

        .timer {
          font-family: var(--font-heading);
          font-size: 2.5rem;
          font-weight: 400;
          display: relative;
          height: 100%;
          width: 100%;
        }
      </style>
      <span class="timer">
        ${this._readableTime}
      </span>
    `;

    this._shadowRoot.appendChild(wrapper.content.cloneNode(true));
  }

  public connectedCallback() {
    if (!this.isConnected) return;
    this._render();

    const finish$ = timer(chosenDuration * 60 * 1000);
    finish$.subscribe(() => {
      currentRoute$.next("/funfact");
    });

    timer(0, 1000)
      .pipe(
        takeUntil(finish$), // stop when it exceeds the time limit
        map((n) => chosenDuration * 60 - n),
        map(toReadableTime)
      )
      .subscribe((readableTime: string) => {
        this._readableTime = readableTime;
        this._render();
      });
  }
}
