import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("MAIN_BOOTSTRAP_INIT_CHECK");

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");
const root = createRoot(container);
root.render(<App />);
console.log("APP_RENDER_COMMAND_SENT");
