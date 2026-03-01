import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Robust Service Worker handling for mobile
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // 1. Unregister all existing service workers (to clear broken caches)
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }

      // 2. Re-register a fresh one
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("PWA: Ready"))
        .catch((err) => console.error("PWA: Failed", err));
    });
  });
}

