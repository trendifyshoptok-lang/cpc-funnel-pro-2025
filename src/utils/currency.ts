import type { Market } from "../types";
import type { CurrencyRates } from "../contexts/CurrencyContext";

// ========================================
//  FUNÇÃO: Detectar Símbolo da Moeda
// ========================================

export const getCurrencySymbol = (market: Market): string => {
  const symbols: Record<Market, string> = {
    BR: "R$",
    US: "$",
    EU: "€",
    UK: "£",
    OTHER: "$", // Assume USD por padrão
  };

  return symbols[market] || "R$";
};

// ========================================
//  FUNÇÃO: Obter Nome da Moeda
// ========================================

export const getCurrencyName = (market: Market): string => {
  const names: Record<Market, string> = {
    BR: "Real Brasileiro",
    US: "Dólar Americano",
    EU: "Euro",
    UK: "Libra Esterlina",
    OTHER: "Dólar Americano",
  };

  return names[market] || "Real Brasileiro";
};

// ========================================
//  FUNÇÃO: Obter Código ISO da Moeda
// ========================================

export const getCurrencyCode = (market: Market): string => {
  const codes: Record<Market, string> = {
    BR: "BRL",
    US: "USD",
    EU: "EUR",
    UK: "GBP",
    OTHER: "USD",
  };

  return codes[market] || "BRL";
};

// ========================================
//  FUNÇÃO: Converter para BRL (Real)
// ========================================

/**
 // NOVO BLOCO PARA convertToBRL (em src/utils/currency.ts)
import { getCurrencyCode } from './currency'; // Certifique-se de que getCurrencyCode está importado

/**
 * Converte qualquer valor na moeda original para Reais (BRL)
 * @param value - Valor na moeda original
 * @param market - Mercado do produto
 * @param rates - Taxas de câmbio atuais
 * @returns Valor convertido em BRL
 */
export const convertToBRL = (
  value: number,
  market: Market | string, // 1. Aceita string genérica para flexibilidade
  rates: CurrencyRates
): number => {
  let currencyCode = "BRL";

  // 2. Verifica se é um código de Mercado conhecido (US, EU, UK...)
  if (["US", "EU", "UK", "BR", "OTHER"].includes(market as string)) {
    currencyCode = getCurrencyCode(market as Market);
  } else {
    // 3. Se não for mercado, assume que já veio a moeda (ex: "USD")
    currencyCode = market as string;
  }

  if (currencyCode === "BRL") return value;

  // 4. Busca a taxa ou usa 1 se não encontrar
  const exchangeRate = rates[currencyCode as keyof CurrencyRates] || 1;
  return value * exchangeRate;
};

// ========================================
//  FUNÇÃO: Converter de BRL para Moeda Original
// ========================================

/**
 * Converte um valor em BRL de volta para a moeda original
 * @param valueBRL - Valor em Reais
 * @param market - Mercado do produto
 * @param rates - Taxas de câmbio atuais
 * @returns Valor na moeda original
 */
export const convertFromBRL = (
  valueBRL: number,
  market: Market,
  rates: CurrencyRates
): number => {
  // Se já é BRL, retorna direto
  if (market === "BR") return valueBRL;

  // Converter baseado no mercado
  switch (market) {
    case "US":
    case "OTHER":
      return valueBRL / rates.USD;

    case "EU":
      return valueBRL / rates.EUR;

    case "UK":
      return valueBRL / rates.GBP;

    default:
      return valueBRL; // Fallback
  }
};

// ========================================
//  FUNÇÃO: Formatar Valor com Moeda
// ========================================

/**
 * Formata um valor numérico com o símbolo da moeda apropriado
 * @param value - Valor numérico
 * @param market - Mercado do produto
 * @param decimals - Número de casas decimais (padrão: 2)
 * @returns String formatada com símbolo de moeda
 */
export const formatCurrency = (
  value: number,
  market: Market,
  decimals: number = 2
): string => {
  const symbol = getCurrencySymbol(market);
  const formatted = value.toFixed(decimals);

  // Formatar com separadores corretos
  if (market === "BR") {
    // Formato brasileiro: 1.234,56
    const parts = formatted.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${symbol} ${parts.join(",")}`;
  } else {
    // Formato internacional: 1,234.56
    const parts = formatted.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${symbol} ${parts.join(".")}`;
  }
};

// ========================================
//  FUNÇÃO: Obter Taxa de Câmbio Específica
// ========================================

/**
 * Retorna a taxa de câmbio para um mercado específico
 * @param market - Mercado do produto
 * @param rates - Taxas de câmbio atuais
 * @returns Taxa de câmbio (1 para BRL)
 */
export const getExchangeRate = (
  market: Market,
  rates: CurrencyRates
): number => {
  if (market === "BR") return 1;

  switch (market) {
    case "US":
    case "OTHER":
      return rates.USD;

    case "EU":
      return rates.EUR;

    case "UK":
      return rates.GBP;

    default:
      return 1;
  }
};

// ========================================
//  FUNÇÃO: Validar Valor de Moeda
// ========================================

/**
 * Valida se um valor de moeda é válido
 * @param value - Valor a validar
 * @returns true se válido, false caso contrário
 */
export const isValidCurrencyValue = (value: number): boolean => {
  return (
    typeof value === "number" && !isNaN(value) && isFinite(value) && value >= 0
  );
};
// ============================================================
//  NOVAS FUNÇÕES DE FORMATAÇÃO (PADRÃO BRASILEIRO)
// ============================================================

/**
 * Formata para dinheiro: R$ 1.234,56
 * Use no lugar de: `R$ ${value.toFixed(2)}`
 */
export const formatBRL = (value: number): string => {
  if (value === undefined || value === null || isNaN(value)) return "R$ 0,00";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Formata apenas o número: 1.234,56
 * Use quando o "R$" já estiver escrito no HTML
 */
export const formatNumber = (value: number): string => {
  if (value === undefined || value === null || isNaN(value)) return "0,00";

  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
