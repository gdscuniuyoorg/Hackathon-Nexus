import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { CompProvider } from "../context/CompContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <CompProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </CompProvider>
);
