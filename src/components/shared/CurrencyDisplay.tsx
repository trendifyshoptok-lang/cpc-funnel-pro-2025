import React from "react";

interface CurrencyDisplayProps {
  value: number;
  currency?: string;
  className?: string;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  value,
  currency = "BRL",
  className = "",
}) => (
  <span className={`tabular-nums ${className}`}>
    {value.toLocaleString("pt-BR", { style: "currency", currency })}
  </span>
);
