import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: "#1f2937",
          color: "#fff",
          borderRadius: "0.5rem",
          border: "1px solid #374151",
          fontSize: "14px",
          padding: "12px 16px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
        },
        success: {
          style: {
            background: "#065f46",
            borderColor: "#10b981",
          },
          iconTheme: {
            primary: "#10b981",
            secondary: "#065f46",
          },
        },
        error: {
          style: {
            background: "#7f1d1d",
            borderColor: "#ef4444",
          },
          iconTheme: {
            primary: "#ef4444",
            secondary: "#7f1d1d",
          },
        },
      }}
    />
    <App />
  </StrictMode>
);
