// ================================
// GEMINI SERVICE - VERSÃO OTIMIZADA
// Usa os melhores modelos disponíveis na sua API Key
// ================================

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getApiKey } from "../hooks/useApiKey";

export interface AIResponse {
  text: string;
  urls?: string[];
}

//  Lista de modelos em ordem de preferência (BASEADO NA SUA API KEY)
const MODEL_FALLBACK_ORDER = [
  "gemini-2.5-flash", // Melhor! Rápido e potente
  "gemini-flash-latest", // Sempre atualizado
  "gemini-2.5-pro", // Mais avançado
  "gemini-pro-latest", // Pro atualizado
  "gemini-2.0-flash", // Alternativa rápida
  "gemini-2.0-flash-001", // Versão estável 2.0
  "gemini-exp-1206", // Experimental avançado
  "gemini-2.5-flash-lite", // Versão lite (mais leve)
  "gemini-3-flash-preview", // Preview Gemini 3
];

/**
 * Função principal para gerar resposta da IA com fallback automático
 */
export const generateAIResponse = async (
  prompt: string,
  modelId: string = "gemini-2.5-flash",
  useSearch: boolean = false,
  apiKey?: string
): Promise<AIResponse> => {
  //  Resolve a chave da API na seguinte ordem:
  // 1) apiKey passada por parâmetro
  // 2) chave do hook (localStorage do usuário ou .env)
  const resolvedApiKey = apiKey ?? getApiKey();

  //  Se não tem chave configurada em nenhum lugar
  if (!resolvedApiKey) {
    return {
      text:
        "️ API Gemini não configurada.\n\n" +
        "Para ativar a IA, você pode:\n" +
        "1. Ir em Configurações do app e informar sua própria chave\n" +
        "   (ela ficará salva apenas no seu navegador)\n" +
        "OU\n" +
        "2. Configurar a chave padrão do sistema no arquivo .env:\n" +
        "   VITE_GEMINI_API_KEY=sua_chave_aqui\n",
      urls: [],
    };
  }

  let genAI: GoogleGenerativeAI;

  try {
    genAI = new GoogleGenerativeAI(resolvedApiKey);
  } catch (err) {
    console.error(" Erro ao inicializar GoogleGenerativeAI:", err);
    return {
      text:
        " Erro ao inicializar o cliente da IA.\n\n" +
        "Verifique se a chave da API Gemini é válida.",
      urls: [],
    };
  }

  //  Prepara lista de modelos para tentar (começa com o preferido)
  const modelsToTry = [
    modelId,
    ...MODEL_FALLBACK_ORDER.filter((m) => m !== modelId),
  ];

  console.log(" Ordem de tentativa:", modelsToTry.slice(0, 3).join(" → "));

  let lastError: any = null;

  //  Tenta cada modelo até um funcionar
  for (const currentModel of modelsToTry) {
    try {
      console.log(` Tentando: ${currentModel}...`);

      const model = genAI.getGenerativeModel({
        model: currentModel,
      });

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      console.log(` Sucesso com: ${currentModel}! `);

      return {
        text,
        urls: useSearch ? extractUrls(text) : [],
      };
    } catch (error: any) {
      console.warn(
        `️ ${currentModel} falhou:`,
        error.message?.substring(0, 80)
      );
      lastError = error;

      // Se for erro 404 (modelo não existe), tenta próximo
      if (
        error?.message?.includes("404") ||
        error?.message?.includes("not found")
      ) {
        continue;
      }

      // Se for erro de permissão/quota, para (não adianta tentar outros)
      if (
        error?.message?.includes("403") ||
        error?.message?.includes("PERMISSION_DENIED") ||
        error?.message?.includes("QUOTA_EXCEEDED")
      ) {
        break;
      }

      // Outros erros: tenta próximo modelo
      continue;
    }
  }

  //  Se chegou aqui, nenhum modelo funcionou
  console.error(" Todos os modelos falharam");

  // Mensagens personalizadas de erro
  if (lastError?.message?.includes("API_KEY_INVALID")) {
    return {
      text:
        " Chave da API inválida.\n\n" +
        "Gere uma nova em: https://aistudio.google.com/app/apikey",
      urls: [],
    };
  }

  if (lastError?.message?.includes("QUOTA_EXCEEDED")) {
    return {
      text:
        "️ Limite gratuito atingido.\n\n" +
        "Aguarde renovação (geralmente 1 minuto) ou atualize seu plano.",
      urls: [],
    };
  }

  if (
    lastError?.message?.includes("403") ||
    lastError?.message?.includes("PERMISSION_DENIED")
  ) {
    return {
      text:
        " Sem permissão para acessar a API.\n\n" +
        "Possíveis causas:\n" +
        "1. API Key sem permissões\n" +
        "2. Billing não habilitado no projeto\n\n" +
        "Verifique: https://console.cloud.google.com/",
      urls: [],
    };
  }

  return {
    text:
      " Erro ao conectar com a IA.\n\n" +
      "Detalhes: " +
      (lastError?.message?.substring(0, 200) || "Erro desconhecido"),
    urls: [],
  };
};

/**
 * Extrai URLs do texto gerado
 */
function extractUrls(text: string): string[] {
  const regex = /(https?:\/\/[^\s]+)/g;
  return text.match(regex) || [];
}

/**
 * Retorna status útil para o app
 */
export const getGeminiStatus = () => ({
  configured: !!getApiKey(),
  hasKey: !!getApiKey(),
  preview: getApiKey() ? getApiKey()!.substring(0, 8) + "..." : "nenhuma",
  recommendedModel: "gemini-2.5-flash",
});
