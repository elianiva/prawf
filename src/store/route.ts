import { Subject } from "rxjs";

export interface Route {
  component: string;
  title: string;
}

export const currentRoute$ = new Subject<string>();
