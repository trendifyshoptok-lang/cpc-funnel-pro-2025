// ================================
// HOOK DE VISÃO DE PÁGINA
// Extrai automaticamente a estrutura da página atual
// ================================

import { useState, useEffect } from "react";

export interface PageVision {
  titulo: string;
  elementos: string[];
  textos: string[];
  acoes: string[];
  dados: Record<string, any>;
}

/**
 * Hook que "lê" a página atual e extrai informações úteis
 */
export const usePageVision = (
  containerRef?: React.RefObject<HTMLElement>
): PageVision => {
  const [vision, setVision] = useState<PageVision>({
    titulo: "",
    elementos: [],
    textos: [],
    acoes: [],
    dados: {},
  });

  useEffect(() => {
    const extractPageInfo = () => {
      // Define o container a ser analisado (página inteira ou elemento específico)
      const container = containerRef?.current || document.body;

      //  Extrai título da página
      const titulo =
        document.querySelector("h1")?.textContent?.trim() ||
        document.title ||
        "Página sem título";

      //  Extrai elementos visíveis importantes
      const elementos: string[] = [];

      // Títulos e subtítulos
      container.querySelectorAll("h1, h2, h3").forEach((el) => {
        const text = el.textContent?.trim();
        if (text && text.length < 100) {
          elementos.push(`Título: ${text}`);
        }
      });

      // Cards, sections, articles
      container.querySelectorAll(".card, section, article").forEach((el) => {
        const title = el.querySelector("h2, h3, .title")?.textContent?.trim();
        if (title && title.length < 100) {
          elementos.push(`Seção: ${title}`);
        }
      });

      //  Extrai textos significativos (labels, descrições)
      const textos: string[] = [];

      container.querySelectorAll("p, span, div").forEach((el) => {
        const text = el.textContent?.trim();
        // Apenas textos relevantes (não muito longos, não muito curtos)
        if (text && text.length > 10 && text.length < 200) {
          // Evita duplicatas
          if (!textos.includes(text)) {
            textos.push(text);
          }
        }
      });

      //  Extrai ações disponíveis (botões, links)
      const acoes: string[] = [];

      container.querySelectorAll("button, a").forEach((el) => {
        const text = el.textContent?.trim();
        const ariaLabel = el.getAttribute("aria-label");
        const actionText = ariaLabel || text;

        if (actionText && actionText.length < 100) {
          acoes.push(actionText);
        }
      });

      //  Extrai dados de tabelas, listas, métricas
      const dados: Record<string, any> = {};

      // Métricas (geralmente em cards com números)
      container
        .querySelectorAll("[class*='metric'], [class*='stat'], [class*='card']")
        .forEach((el, index) => {
          const label = el
            .querySelector("label, .label, .title, h3, h4")
            ?.textContent?.trim();
          const value = el
            .querySelector(".value, .number, strong, b")
            ?.textContent?.trim();

          if (label && value) {
            dados[label] = value;
          }
        });

      // Tabelas
      const tabelas: any[] = [];
      container.querySelectorAll("table").forEach((table, index) => {
        const headers: string[] = [];
        table.querySelectorAll("th").forEach((th) => {
          headers.push(th.textContent?.trim() || "");
        });

        if (headers.length > 0) {
          tabelas.push({
            nome: `Tabela ${index + 1}`,
            colunas: headers,
            totalLinhas: table.querySelectorAll("tbody tr").length,
          });
        }
      });

      if (tabelas.length > 0) {
        dados.tabelas = tabelas;
      }

      // Remove duplicatas
      const elementosUnicos = [...new Set(elementos)].slice(0, 20); // Limita a 20
      const textosUnicos = [...new Set(textos)].slice(0, 15); // Limita a 15
      const acoesUnicas = [...new Set(acoes)].slice(0, 15); // Limita a 15

      setVision({
        titulo,
        elementos: elementosUnicos,
        textos: textosUnicos,
        acoes: acoesUnicas,
        dados,
      });
    };

    // Extrai info após a página carregar
    extractPageInfo();

    // Re-extrai se houver mudanças na página (opcional)
    const observer = new MutationObserver(() => {
      extractPageInfo();
    });

    const container = containerRef?.current || document.body;
    observer.observe(container, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [containerRef]);

  return vision;
};

/**
 * Converte a visão da página em texto legível para a IA
 */
export const formatPageVisionForAI = (vision: PageVision): string => {
  let texto = `ESTRUTURA DA PÁGINA ATUAL:\n\n`;

  texto += ` Título: ${vision.titulo}\n\n`;

  if (vision.elementos.length > 0) {
    texto += ` Elementos na Página:\n`;
    vision.elementos.forEach((el) => {
      texto += `  • ${el}\n`;
    });
    texto += "\n";
  }

  if (Object.keys(vision.dados).length > 0) {
    texto += ` Dados Visíveis:\n`;
    Object.entries(vision.dados).forEach(([key, value]) => {
      if (typeof value === "object") {
        texto += `  • ${key}: ${JSON.stringify(value)}\n`;
      } else {
        texto += `  • ${key}: ${value}\n`;
      }
    });
    texto += "\n";
  }

  if (vision.acoes.length > 0) {
    texto += ` Ações Disponíveis:\n`;
    vision.acoes.slice(0, 10).forEach((acao) => {
      texto += `  • ${acao}\n`;
    });
    texto += "\n";
  }

  return texto;
};
