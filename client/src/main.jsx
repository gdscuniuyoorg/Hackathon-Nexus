import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { CompProvider } from "../context/CompContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CompProvider>
      <App />
    </CompProvider>
  </StrictMode>
);
