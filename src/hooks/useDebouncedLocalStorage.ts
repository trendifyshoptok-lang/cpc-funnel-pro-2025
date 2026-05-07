// Criar hook com debounce
import { useState, useEffect, useRef } from 'react';

function useDebouncedLocalStorage<T>(key: string, initialValue: T, delay = 1000) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    // Limpa timeout anterior
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    // Salva após delay
    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`Erro ao salvar ${key}:`, error);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value, key, delay]);

  return [value, setValue] as const;
}