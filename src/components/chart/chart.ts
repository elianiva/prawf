import { chartMode, chartMode$ } from "@/store/chart";
import { resultsByRound } from "@/store/result";
import { toFixedTwo } from "@/utils/toFixedTwo";

type Point = [number, number];
interface ChartData {
  point: Point;
  barWidth: number;
  correctHeight: number;
  incorrectHeight: number;
  correctYPosition: number;
  incorrectYPosition: number;
  xPosition: number;
}

export default class Chart extends HTMLElement {
  private _shadowRoot: ShadowRoot;
  private _maxSteps: number;
  private _stepHeight = 0;
  private _points: Point[] = [];
  private _chartData: ChartData[];
  private readonly CHART_WIDTH = 912;
  private readonly CHART_HEIGHT = 360;
  private readonly CHART_GAP = 16;
  private readonly Y_OFFSET = 80;
  private readonly SMOOTHING_RATIO = 0.2;

  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: "open" });
    this._maxSteps =
      Object.values(resultsByRound).reduce((acc, curr) => {
        const total = curr.correct + curr.incorrect;
        return total > acc ? total : acc;
      }, 0) + 1;
    this._stepHeight = this.CHART_HEIGHT / this._maxSteps;
    this._chartData = this._calculateChartData();
    this._points = this._chartData.reduce(
      (acc, { point }) => acc.concat([point]),
      [] as Point[]
    );

    chartMode$.subscribe(() => this._render());
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

        .bar {
          transition: filter 0.2s ease-out;
        }
      </style>
      <svg
        width="${this.CHART_WIDTH}"
        height="${this.CHART_HEIGHT + this.Y_OFFSET}"
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        viewBox="0 0 ${this.CHART_WIDTH} ${this.CHART_HEIGHT + this.Y_OFFSET}"
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
          x1="${this.CHART_WIDTH}"
          y1="0"
          x2="${this.CHART_WIDTH}"
          y2="${this.CHART_HEIGHT}"
          stroke="var(--light-grey)"
          stroke-width="2"
        />
        ${Array(this._maxSteps + 1)
          .fill(0)
          .map(
            (_, idx) => `
              <line
                x1="0"
                y1="${toFixedTwo(idx * this._stepHeight)}"
                x2="${this.CHART_WIDTH}"
                y2="${toFixedTwo(idx * this._stepHeight)}"
                stroke="var(--lighter-grey)"
                stroke-width="2"
              />`
          )
          .join("")}
        ${this._chartData
          .map(
            ({
              xPosition,
              correctYPosition,
              incorrectYPosition,
              correctHeight,
              incorrectHeight,
              barWidth
            }) => {
              let template = "";

              if (chartMode === "bar" && correctHeight > 0) {
                template += this._renderBar(
                  xPosition,
                  correctYPosition,
                  barWidth,
                  correctHeight,
                  "green"
                );
              }

              if (chartMode === "bar" && incorrectHeight > 0) {
                template += this._renderBar(
                  xPosition,
                  incorrectYPosition,
                  barWidth,
                  incorrectHeight,
                  "red"
                );
              }

              return template;
            }
          )
          .join("")}
        ${this._chartData
          .map(
            ({ barWidth, xPosition }, idx) => `
              <text
                x="${toFixedTwo(xPosition + barWidth / 2)}"
                y="${this.CHART_HEIGHT - 8}"
                class="bar-label"
                transform="rotate(45, ${toFixedTwo(xPosition)}, ${
              this.CHART_HEIGHT - 8
            })"
              >
                Round ${idx + 1}
              </text>`
          )
          .join("")}
        ${
          chartMode === "line"
            ? this._renderLines() + this._renderPoints()
            : ""
        }
      </svg>
    `;

    this._shadowRoot.appendChild(wrapper.content.cloneNode(true));
  }

  private _calculateChartData(): ChartData[] {
    return Object.values(resultsByRound).reduce((acc, result, idx, arr) => {
      const barWidth = this.CHART_WIDTH / arr.length - 16;
      const incorrectHeight = result.incorrect * this._stepHeight;
      const correctHeight = result.correct * this._stepHeight;
      const correctYPosition = this.CHART_HEIGHT - correctHeight;
      const incorrectYPosition =
        this.CHART_HEIGHT - (incorrectHeight + correctHeight);
      const xPosition = (barWidth + this.CHART_GAP) * idx;

      return acc.concat({
        barWidth: toFixedTwo(barWidth),
        correctHeight: toFixedTwo(correctHeight),
        incorrectHeight: toFixedTwo(incorrectHeight),
        correctYPosition: toFixedTwo(correctYPosition),
        incorrectYPosition: toFixedTwo(incorrectYPosition),
        xPosition: toFixedTwo(xPosition),
        point: [
          toFixedTwo(xPosition + barWidth / 2),
          result.correct > result.incorrect
            ? toFixedTwo(correctYPosition)
            : toFixedTwo(incorrectYPosition)
        ]
      });
    }, [] as ChartData[]);
  }

  private _renderPoints() {
    return this._points
      .map(
        ([x, y]) =>
          `<circle cx="${x}" cy="${y}" r="6" fill="var(--sky)"></circle>`
      )
      .join("");
  }

  private _renderBar(
    x: number,
    y: number,
    width: number,
    height: number,
    colour: "green" | "red"
  ) {
    return `<rect
      class="bar"
      width="${width}"
      height="${height}"
      x="${x}"
      y="${y}"
      fill="var(--${colour})"></rect>`;
  }

  private _renderLines() {
    return `<path
      class="line"
      d="${[
        [0, this.CHART_HEIGHT] as Point,
        ...this._points,
        [this.CHART_WIDTH, this.CHART_HEIGHT] as Point
      ]
        .map((point, i, points) => {
          const [x, y] = point;

          if (i === 0) return `M ${x} ${y}`;

          const [cpsX, cpsY] = this._findControlPoint(
            points[i - 1],
            points[i - 2],
            point
          );

          const [cpeX, cpeY] = this._findControlPoint(
            point,
            points[i - 1],
            points[i + 1],
            true
          );

          return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${x},${y}`;
        })
        .join(" ")}"
      stroke-width="2"
      stroke="var(--sky)"
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="var(--sky)"
      fill-opacity="0.1"
    />`;
  }

  // see: https://francoisromain.medium.com/smooth-a-svg-path-with-cubic-bezier-curves-e37b49d46c74
  private _getLineProperty(
    pointA: Point,
    pointB: Point
  ): { length: number; angle: number } {
    const lengthX = pointB[0] - pointA[0];
    const lengthY = pointB[1] - pointA[1];

    return {
      length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
      angle: Math.atan2(lengthY, lengthX)
    };
  }

  // see: https://francoisromain.medium.com/smooth-a-svg-path-with-cubic-bezier-curves-e37b49d46c74
  private _findControlPoint(
    current: Point,
    previous: Point,
    next: Point,
    reverse?: boolean
  ) {
    // when the previous/next point doesn't exist, we use the current one
    const p = previous || current;
    const n = next || current;

    const o = this._getLineProperty(p, n);

    // If it's an end-control-point, add PI to reverse the angle direction
    const angle = o.angle + (reverse ? Math.PI : 0);
    const length = o.length * this.SMOOTHING_RATIO;

    // the control point position is relative to the current point
    const x = current[0] + Math.cos(angle) * length;
    const y = current[1] + Math.sin(angle) * length;

    return [toFixedTwo(x), toFixedTwo(y)];
  }

  public connectedCallback() {
    this._render();
  }
}
