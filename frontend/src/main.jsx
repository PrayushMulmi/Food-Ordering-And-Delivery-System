import { jsx } from "react/jsx-runtime";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/index.css";
import { initTheme } from "./lib/theme";

initTheme();
createRoot(document.getElementById("root")).render(/* @__PURE__ */ jsx(App, {}));
