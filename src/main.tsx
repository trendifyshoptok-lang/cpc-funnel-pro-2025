import { StrictMode, Component } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AIProvider } from "./contexts/AIContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, fontFamily: "monospace", background: "#fff1f2", color: "#be123c", minHeight: "100vh" }}>
          <h2 style={{ marginBottom: 12 }}>Runtime Error</h2>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: 13 }}>{this.state.error.message}</pre>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: 11, opacity: 0.7, marginTop: 16 }}>{this.state.error.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <AIProvider>
          <CurrencyProvider>
            <App />
          </CurrencyProvider>
        </AIProvider>
      </ErrorBoundary>
    </StrictMode>
  );
} else {
  console.error("Elemento #root não encontrado no HTML");
}
