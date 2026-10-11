import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { hydrateLab } from "./stores/lab";
import { hydrate } from "./stores/progress";
import "./styles.css";
void hydrate();
void hydrateLab();
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
);
