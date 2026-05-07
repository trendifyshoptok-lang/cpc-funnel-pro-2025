import { useState } from 'react';

// Hook personalizado para acessar o localStorage
function useLocalStorage<T>(key: string, initialValue: T) {
  // Tentando pegar o valor do localStorage, caso contrário usa o valor inicial
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      // Se o item existe e é um valor válido, faz o parse
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Erro ao ler ${key} do localStorage`, error);
      return initialValue; // Retorna o valor inicial em caso de erro
    }
  });

  // Função para atualizar o valor no localStorage e no estado
  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      localStorage.setItem(key, JSON.stringify(value)); // Atualiza o localStorage
    } catch (error) {
      console.error(`Erro ao salvar ${key} no localStorage`, error);
    }
  };

  // Função para remover o item do localStorage
  const removeValue = () => {
    try {
      setStoredValue(initialValue); // Reseta o valor no estado
      localStorage.removeItem(key); // Remove o item do localStorage
    } catch (error) {
      console.error(`Erro ao remover ${key} do localStorage`, error);
    }
  };

  return [storedValue, setValue, removeValue] as const; // Retorna um tuple [valor, função de set, função de remove]
}

export default useLocalStorage;
