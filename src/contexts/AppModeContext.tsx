import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import type { ReactNode } from "react";

type AppMode = "free" | "pro";

interface AppModeContextType {
  mode: AppMode;
  toggleMode: () => void;
  setMode: (mode: AppMode) => void;
  isPro: boolean;
  isFree: boolean;
  /** @deprecated use isFree */
  isIniciante: boolean;
}

const AppModeContext = createContext<AppModeContextType | undefined>(undefined);

export const AppModeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [mode, setModeState] = useState<AppMode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("app_mode");
      // migra valor legado "iniciante" → "free"
      if (saved === "iniciante") return "free";
      return saved === "pro" ? "pro" : "free";
    }
    return "free";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("app_mode", mode);
    }
  }, [mode]);

  const toggleMode = () =>
    setModeState((prev) => (prev === "free" ? "pro" : "free"));

  const setMode = (newMode: AppMode) => setModeState(newMode);

  const value: AppModeContextType = {
    mode,
    toggleMode,
    setMode,
    isPro: mode === "pro",
    isFree: mode === "free",
    isIniciante: mode === "free", // backward compat
  };

  return (
    <AppModeContext.Provider value={value}>{children}</AppModeContext.Provider>
  );
};

export const useAppMode = (): AppModeContextType => {
  const context = useContext(AppModeContext);
  if (context === undefined) {
    throw new Error("useAppMode deve ser usado dentro de um AppModeProvider");
  }
  return context;
};
