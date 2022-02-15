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
          display: block;
          border-radius: 0.25rem;
          background-color: var(--white);
          width: 100%;
          padding: 1rem 0;
          text-align: center;
        }

        .timer {
          font-family: var(--font-heading);
          font-size: 4rem;
          font-weight: 400;
          height: 100%;
          width: 100%;
          color: var(--black);
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
