import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter
      basename={window.location.pathname.startsWith("/ifixspot") ? "/ifixspot" : "/"}
    >
      <App />
    </BrowserRouter>
  </StrictMode>
);
