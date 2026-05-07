import React from "react";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = "" }) => {
  const [dark, setDark] = React.useState(() =>
    document.documentElement.classList.contains("dark")
  );

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      className={`p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors ${className}`}
      title={dark ? "Modo claro" : "Modo escuro"}
    >
      {dark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
};
