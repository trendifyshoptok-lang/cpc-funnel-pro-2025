// ================================
// HOOK DE CONTEXTO GLOBAL DO APP
// Coleta informações de toda a aplicação
// ================================

import { useMemo } from "react";

// react-router-dom stub for apps not using routing
const useLocation = () => ({ pathname: window.location.pathname });

export interface AppContext {
  // Informações da página atual
  paginaAtual: string;
  rotaAtual: string;

  // Estatísticas gerais (você vai preencher com seus dados reais)
  totalProdutos?: number;
  totalCampanhas?: number;
  totalVendas?: number;
  totalComissoes?: number;

  // Dados específicos da página (quando aplicável)
  produtoAtual?: {
    id: string;
    nome: string;
    categoria?: string;
  };

  campanhaAtual?: {
    id: string;
    nome: string;
    status?: string;
  };

  // Capacidades do assistente
  capacidades: string[];
}

/**
 * Hook que retorna o contexto completo do aplicativo
 * Use este hook para passar informações para o AIAssistant
 */
export const useAppContext = (
  // Parâmetros opcionais que você passa de cada página
  dadosPagina?: {
    produtos?: any[];
    campanhas?: any[];
    vendas?: any[];
    produtoSelecionado?: any;
    campanhaSelecionada?: any;
  }
): AppContext => {
  const location = useLocation();

  // ️ Detecta qual página o usuário está
  const paginaAtual = useMemo(() => {
    const path = location.pathname;

    if (path === "/" || path === "/dashboard") return "Dashboard";
    if (path.includes("/produtos") && path.includes("/edit"))
      return "Edição de Produto";
    if (path.includes("/produtos") && path.includes("/new"))
      return "Novo Produto";
    if (path.includes("/produtos/")) return "Detalhes do Produto";
    if (path.includes("/produtos")) return "Lista de Produtos";
    if (path.includes("/campanhas") && path.includes("/edit"))
      return "Edição de Campanha";
    if (path.includes("/campanhas") && path.includes("/new"))
      return "Nova Campanha";
    if (path.includes("/campanhas/")) return "Detalhes da Campanha";
    if (path.includes("/campanhas")) return "Lista de Campanhas";
    if (path.includes("/vendas")) return "Relatório de Vendas";
    if (path.includes("/comissoes")) return "Gestão de Comissões";
    if (path.includes("/afiliados")) return "Gestão de Afiliados";
    if (path.includes("/configuracoes")) return "Configurações";
    if (path.includes("/relatorios")) return "Relatórios";

    return "Página Desconhecida";
  }, [location.pathname]);

  //  Monta o contexto completo
  const contexto: AppContext = useMemo(() => {
    return {
      paginaAtual,
      rotaAtual: location.pathname,

      // Estatísticas gerais
      totalProdutos: dadosPagina?.produtos?.length,
      totalCampanhas: dadosPagina?.campanhas?.length,
      totalVendas: dadosPagina?.vendas?.length,

      // Produto atual (se estiver em página de produto)
      produtoAtual: dadosPagina?.produtoSelecionado
        ? {
            id: dadosPagina.produtoSelecionado.id,
            nome:
              dadosPagina.produtoSelecionado.nome ||
              dadosPagina.produtoSelecionado.name,
            categoria: dadosPagina.produtoSelecionado.categoria,
          }
        : undefined,

      // Campanha atual (se estiver em página de campanha)
      campanhaAtual: dadosPagina?.campanhaSelecionada
        ? {
            id: dadosPagina.campanhaSelecionada.id,
            nome:
              dadosPagina.campanhaSelecionada.nome ||
              dadosPagina.campanhaSelecionada.name,
            status: dadosPagina.campanhaSelecionada.status,
          }
        : undefined,

      //  Capacidades do assistente (o que ele pode fazer)
      capacidades: [
        "Explicar funcionalidades do sistema",
        "Ajudar com estratégias de marketing de afiliados",
        "Sugerir otimizações de campanhas",
        "Analisar dados e métricas",
        "Tirar dúvidas sobre produtos e comissões",
        "Dar dicas de gestão de afiliados",
        "Auxiliar na configuração do sistema",
      ],
    };
  }, [paginaAtual, location.pathname, dadosPagina]);

  return contexto;
};
