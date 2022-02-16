import { Subject } from "rxjs";

export type ChartMode = "line" | "bar";

export let chartMode: ChartMode = "line";
export const chartMode$ = new Subject<ChartMode>();
chartMode$.subscribe((mode) => {
  chartMode = mode;
});
