const STORAGE_KEY = "user_gemini_api_key";

/**
 * Retorna a chave da API do usuário salva no localStorage,
 * ou faz fallback para a chave padrão do ambiente (.env).
 */
export const getApiKey = (): string | undefined => {
  try {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(STORAGE_KEY);

      if (stored && stored.trim() !== "" && stored !== "undefined") {
        return stored;
      }
    }
  } catch (error) {
    console.error("Erro ao ler API Key do localStorage", error);
  }

  const envKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

  if (envKey && envKey !== "undefined" && envKey !== "") {
    return envKey;
  }

  return undefined;
};

/**
 * Salva a chave da API personalizada do usuário no localStorage.
 */
export const setApiKey = (key: string) => {
  try {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(STORAGE_KEY, key);
  } catch (error) {
    console.error("Erro ao salvar API Key no localStorage", error);
  }
};

/**
 * Remove a chave da API personalizada do usuário do localStorage.
 */
export const removeApiKey = () => {
  try {
    if (typeof window === "undefined") return;

    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Erro ao remover API Key do localStorage", error);
  }
};

/**
 * Indica se o usuário possui uma chave personalizada salva no localStorage.
 */
export const hasApiKey = (): boolean => {
  try {
    if (typeof window === "undefined") return false;

    const stored = window.localStorage.getItem(STORAGE_KEY);
    return !!(stored && stored.trim() !== "" && stored !== "undefined");
  } catch {
    return false;
  }
};

