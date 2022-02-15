import { resultsByRound } from "@/store/result";

export default class Chart extends HTMLElement {
  private _shadowRoot: ShadowRoot;
  private _maxHeight: number;
  private _blockHeight = 0;
  private readonly CHART_WIDTH = 912;
  private readonly CHART_HEIGHT = 320;
  private readonly Y_OFFSET = 64;

  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: "open" });
    this._maxHeight = Object.values(resultsByRound).reduce((acc, curr) => {
      const total = curr.correct + curr.incorrect;
      return total > acc ? total : acc;
    }, 0);
    this._blockHeight = this.CHART_HEIGHT / this._maxHeight;
    console.log(this._maxHeight);
  }

  private _render() {
    // clean previous content and remove previous event listener
    this._shadowRoot.innerHTML = "";

    const wrapper = document.createElement("template");
    wrapper.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
        }

        .bar-label {
          font-family: var(--font-heading);
          fill: var(--black);
        }
      </style>
      <svg
        width="${this.CHART_WIDTH}"
        height="${this.CHART_HEIGHT + this.Y_OFFSET}"
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        viewBox="0 0 ${this.CHART_WIDTH} ${
      this.CHART_HEIGHT + this.Y_OFFSET
    }"
      >
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="${this.CHART_HEIGHT}"
          stroke="var(--light-grey)"
          stroke-width="2"
        />
        <line
          x1="0"
          y1="${this.CHART_HEIGHT}"
          x2="${this.CHART_WIDTH}"
          y2="${this.CHART_HEIGHT}"
          stroke="var(--light-grey)"
          stroke-width="2"
        />
        ${Object.values(resultsByRound)
          .map((result, idx, arr) => {
            const gap = 16;
            const width = this.CHART_WIDTH / arr.length - 16;
            const incorrectHeight = result.incorrect * this._blockHeight;
            const correctHeight = result.correct * this._blockHeight;
            const x = (width + gap) * idx;
            const correctY = this.CHART_HEIGHT - correctHeight;
            const incorrectY =
              this.CHART_HEIGHT - (incorrectHeight + correctHeight);

            let template = "";

            if (result.correct !== 0) {
              template += `<rect width="${width}" height="${correctHeight}" x="${x}" y="${correctY}" fill="var(--green)"></rect>`;
            }

            if (result.incorrect !== 0) {
              template += `<rect width="${width}" height="${incorrectHeight}" x="${x}" y="${incorrectY}" fill="var(--red)"></rect>`;
            }

            template += `
              <text
                x="${x + width / 2}"
                y="${this.CHART_HEIGHT - 8}"
                class="bar-label"
                transform="rotate(45, ${x}, ${this.CHART_HEIGHT - 8})"
              >
                Round ${idx + 1}
              </text>
            `;

            return template;
          })
          .join("")}
      </svg>
    `;

    this._shadowRoot.appendChild(wrapper.content.cloneNode(true));
  }

  public connectedCallback() {
    if (!this.isConnected) return;

    this._render();
  }
}
