import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// ========================================
// TIPOS E INTERFACES
// ========================================

export interface CurrencyRates {
  USD: number; // Dólar → Real (USDBRL)
  EUR: number; // Euro → Real (EURBRL)
  GBP: number; // Libra → Real (GBPBRL)
}

interface CurrencyContextData {
  rates: CurrencyRates;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  refetch: () => Promise<void>;
}

// ========================================
// CONTEXTO
// ========================================

const CurrencyContext = createContext<CurrencyContextData | undefined>(undefined);

// ========================================
// PROVIDER
// ========================================

interface CurrencyProviderProps {
  children: ReactNode;
}

const CACHE_KEY = 'currency_rates_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [rates, setRates] = useState<CurrencyRates>({ USD: 5.0, EUR: 5.5, GBP: 6.5 }); // Fallback inicial
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // ===== FUNÇÃO: Carregar do Cache =====
  const loadFromCache = (): { rates: CurrencyRates; timestamp: number } | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const data = JSON.parse(cached);
      const now = Date.now();
      
      // Verificar se o cache ainda é válido
      if (now - data.timestamp < CACHE_DURATION) {
        return data;
      }
      
      return null;
    } catch (err) {
      console.error(' Erro ao ler cache de moedas:', err);
      return null;
    }
  };

  // ===== FUNÇÃO: Salvar no Cache =====
  const saveToCache = (rates: CurrencyRates) => {
    try {
      const data = {
        rates,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error(' Erro ao salvar cache de moedas:', err);
    }
  };

  // ===== FUNÇÃO: Buscar Cotações da API =====
  const fetchRates = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        'https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,GBP-BRL'
      );

      if (!response.ok) {
        throw new Error('Falha ao buscar cotações');
      }

      const data = await response.json();

      // Extrair valores
      const newRates: CurrencyRates = {
        USD: parseFloat(data?.USDBRL?.bid ?? '5.0'),
        EUR: parseFloat(data?.EURBRL?.bid ?? '5.5'),
        GBP: parseFloat(data?.GBPBRL?.bid ?? '6.5'),
      };

      // Validar valores (não aceitar zeros ou valores absurdos)
      if (newRates.USD > 0 && newRates.USD < 20 && 
          newRates.EUR > 0 && newRates.EUR < 20 &&
          newRates.GBP > 0 && newRates.GBP < 20) {
        
        setRates(newRates);
        setLastUpdate(new Date());
        saveToCache(newRates);
        
        console.log(' Cotações atualizadas:', newRates);
      } else {
        throw new Error('Valores de cotação inválidos');
      }

    } catch (err) {
      console.error(' Erro ao buscar cotações:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      
      // Tentar carregar do cache como fallback
      const cached = loadFromCache();
      if (cached) {
        setRates(cached.rates);
        setLastUpdate(new Date(cached.timestamp));
        console.log('️ Usando cotações em cache:', cached.rates);
      }
    } finally {
      setLoading(false);
    }
  };

  // ===== EFEITO: Inicialização =====
  useEffect(() => {
    // Tentar carregar do cache primeiro (resposta instantânea)
    const cached = loadFromCache();
    if (cached) {
      setRates(cached.rates);
      setLastUpdate(new Date(cached.timestamp));
      setLoading(false);
      console.log(' Cotações carregadas do cache:', cached.rates);
    }

    // Buscar cotações frescas da API
    fetchRates();

    // Atualizar a cada 5 minutos
    const interval = setInterval(fetchRates, CACHE_DURATION);

    return () => clearInterval(interval);
  }, []);

  return (
    <CurrencyContext.Provider
      value={{
        rates,
        loading,
        error,
        lastUpdate,
        refetch: fetchRates,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

// ========================================
// HOOK CUSTOMIZADO
// ========================================

export const useCurrency = (): CurrencyContextData => {
  const context = useContext(CurrencyContext);
  
  if (!context) {
    throw new Error('useCurrency deve ser usado dentro de CurrencyProvider');
  }
  
  return context;
};