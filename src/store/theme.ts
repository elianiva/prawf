import { Subject } from "rxjs";

export type Theme = "dark" | "light";
export interface ThemeState {
  previous: Theme;
  current: Theme;
}

export let currentTheme: Theme = "light";

export const currentTheme$ = new Subject<ThemeState>();
currentTheme$.subscribe(({ current }) => {
  currentTheme = current;
});
