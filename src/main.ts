import "@/styles/main.css";

import Homepage from "@/pages/homepage";
import Playpage from "@/pages/playpage";
import NotFound from "@/pages/notfound";
import InstructionPopup from "@/components/popup/instruction";
import OptionsPopup from "@/components/popup/options";
import { currentRoute$, Route } from "./store/route";

customElements.define("p-homepage", Homepage);
customElements.define("p-playpage", Playpage);
customElements.define("p-notfound", NotFound);
customElements.define("p-instruction-popup", InstructionPopup);
customElements.define("p-options-popup", OptionsPopup);

const outlet = document.querySelector("p-outlet");
const outletShadowRoot = outlet!.attachShadow({ mode: "open" });

const routes: Record<string, Route> = {
  "/": {
    component: "p-homepage",
    title: "Homepage"
  },
  "/play": {
    component: "p-playpage",
    title: "Play"
  },
  "*": {
    component: "p-notfound",
    title: "Not Found"
  }
};

currentRoute$.subscribe((route) => {
  const r = routes[route] || routes["*"];

  document.title = r.title + " | Prawf";
  outletShadowRoot.innerHTML = `<${r.component}></${r.component}>`;
});

// load the correct page on initial load
window.onload = () => {
  const route = window.location.pathname;
  currentRoute$.next(route);
};
