import "@/styles/main.css";

import Homepage from "@/pages/homepage";
import InstructionPopup from "@/components/popup/instruction";
import OptionsPopup from "@/components/popup/options";

customElements.define("p-homepage", Homepage);
customElements.define("p-instruction-popup", InstructionPopup);
customElements.define("p-options-popup", OptionsPopup);
