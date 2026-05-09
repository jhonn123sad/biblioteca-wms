import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("MAIN_V1_INIT");

try {
  const container = document.getElementById("root");
  if (!container) {
    console.error("CRITICAL: Root element not found");
  } else {
    console.log("ROOT_ELEMENT_FOUND");
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("RENDER_CALLED");
  }
} catch (e) {
  console.error("MAIN_BOOTSTRAP_ERROR:", e);
}
