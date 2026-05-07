import React, { useState } from "react";

interface TooltipProps {
  content?: string;
  text?: string; // alias for content
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export const Tooltip: React.FC<TooltipProps> = ({ content, text, children, position = "top" }) => {
  const label = content ?? text ?? "";
  const [visible, setVisible] = useState(false);
  const posMap: Record<string, string> = {
    top:    "bottom-full left-1/2 -translate-x-1/2 mb-1.5",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-1.5",
    left:   "right-full top-1/2 -translate-y-1/2 mr-1.5",
    right:  "left-full top-1/2 -translate-y-1/2 ml-1.5",
  };
  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && label && (
        <div className={`absolute z-50 px-2.5 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-medium whitespace-nowrap shadow-lg pointer-events-none ${posMap[position]}`}>
          {label}
        </div>
      )}
    </div>
  );
};
