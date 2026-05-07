# PRD — CPC Funnel Pro
**Versão:** 2.0  
**Data:** Abril 2025  
**Autor:** Pedro Leonardo  

---

## 1. Visão Geral do Produto

**CPC Funnel Pro** é uma plataforma SaaS voltada para afiliados digitais que gerenciam campanhas de tráfego pago (Google Ads, Meta Ads). O sistema centraliza o planejamento, controle e análise de campanhas de CPC (Custo Por Clique), calculando automaticamente métricas-chave como CPC ideal, CPA, ROI, taxa de conversão necessária e lucro líquido real — inclusive com conversão de moedas para produtos internacionais (USD, EUR, GBP → BRL).

### 1.1 Problema que Resolve
Afiliados iniciantes e intermediários não têm clareza sobre:
- Qual CPC máximo podem pagar sem ter prejuízo
- Quantos cliques o orçamento permite comprar
- Qual taxa de conversão precisam atingir para ser lucrativo
- Se uma campanha está performando bem ou mal com os dados reais

### 1.2 Proposta de Valor
- **Para iniciantes:** interface guiada, linguagem simples, tudo calculado automaticamente
- **Para avançados:** análise profunda, simuladores, comparadores, modo Pro com dados detalhados
- **Para todos:** dados em tempo real, alertas inteligentes, projeções e exportação

---

## 2. Usuários-Alvo

| Perfil | Descrição |
|--------|-----------|
| **Afiliado Iniciante** | Começando com tráfego pago, nunca usou ferramenta de gestão |
| **Afiliado Intermediário** | Já roda campanhas, quer controle e dados mais precisos |
| **Gestor de Tráfego** | Gerencia múltiplos produtos/clientes, precisa de visão consolidada |

---

## 3. Arquitetura de Telas

### Navegação Principal (Sidebar)
```
├── Hoje               ← visão diária rápida
├── Dashboard          ← KPIs + análise consolidada
├── Campanha
│   ├── Mapeamento    ← pesquisa e cadastro de produto
│   ├── Setup         ← configuração da campanha
│   └── Análise       ← input de dados reais + diagnóstico
├── Portfólio
│   ├── Portfólio     ← gestão da carteira de produtos
│   ├── Comparador    ← comparação lado a lado
│   └── Simulador de Escala
├── Dados
│   ├── Relatórios    ← exportação Excel/PDF
│   └── Histórico     ← histórico de campanhas
└── Suporte
    └── Manual        ← guia de uso
```

---

## 4. Especificação de Telas

---

### TELA 1 — Hoje (Today Panel)

**Propósito:** Visão rápida do dia atual. Substitui a necessidade de abrir o dashboard completo para ver o essencial.

**Dados exibidos:**
- Saudação personalizada (Bom dia / Boa tarde / Boa noite) + nome do usuário
- Lucro do dia atual (comparado com ontem)
- Gasto do dia
- Receita do dia
- Status de saúde da carteira (verde / amarelo / vermelho)
- Ações rápidas: ir para Setup, Análise, Portfólio, Mapeamento
- Produtos que precisam de atenção hoje (alertas críticos)

**Comportamento:**
- Dados filtrados para "hoje" automaticamente
- Sem configuração necessária — tela de landing do app
- Animações de entrada suaves

---

### TELA 2 — Dashboard

**Propósito:** Centro de controle de performance. Visão consolidada de todos os produtos e campanhas.

**Seções:**
1. **Filtro de Período** — Hoje / 7 dias / 30 dias / Todo período / Personalizado
2. **Custos Fixos Globais** — Card configurável para custos mensais operacionais
3. **KPIs Principais** (4 cards):
   - Receita Global (R$)
   - Custo Total (R$)
   - Lucro Líquido (R$) — colorido por status (verde/vermelho)
   - ROI Global (%) — colorido por status
4. **Métricas Detalhadas** (colapsável): CR Global, CPC Médio, Ticket Médio, Conversões, Cliques, Burn/Dia, Campanhas, Produtos
5. **Projeção para Fim do Mês** (colapsável): Receita, Custo, Lucro e Meta projetados
6. **Top 3 Melhores / Precisam de Atenção** — Ranking de produtos por lucro
7. **Gráficos:** Tendência temporal, Funil de Conversão, Pizza de Gastos, Receita vs Gasto por produto
8. **Tabela de Produtos** — Listagem com filtros avançados, busca e ordenação por coluna
9. **Alertas Inteligentes** — Sistema de notificações geradas automaticamente

**Controles:**
- Exportar Excel
- Configurações do Dashboard (preset de seções visíveis)
- Filtros avançados (nicho, status, ROI mínimo, performance)

---

### TELA 3 — Mapeamento de Produto

**Propósito:** Formulário guiado para cadastrar e pesquisar um novo produto afiliado antes de investir.

**Fluxo em etapas:**
1. **Identificação:** Nome do produto, nicho, mercado (BR/US/EU/UK), moeda, plataforma (Hotmart, Monetizze, etc.)
2. **Oferta e Comissão:** Preço de venda, comissão bruta (%), comissão líquida calculada
3. **Pesquisa de CPC:** Input do CPC de benchmark do mercado
4. **Temperatura do Produto:** Escala de 1-5 de validação (Frio → Quente)
5. **Análise de Viabilidade:** Calculadora automática mostrando:
   - CPC máximo recomendado
   - Cliques possíveis por R$ 100
   - CR necessário para lucro
   - Semáforo de viabilidade (Verde/Amarelo/Vermelho)
6. **Checklist de Validação:** Lista de critérios de qualidade do produto
7. **Salvar Produto** → vai para Setup

---

### TELA 4 — Setup da Campanha

**Propósito:** Configuração completa da estratégia de campanha para um produto específico.

**Navegação em 4 abas:**

**Aba 1 — Ficha Técnica**
- Dados do produto (readonly, vindo do Mapeamento)
- CPC sugerido calculado automaticamente
- Configuração de funil (topo/meio/fundo)

**Aba 2 — Financeiro**
- Custos específicos do produto (hosting, ferramentas dedicadas)
- Configuração de ofertas (upsell, downsell, bump)
- Margem real calculada considerando todos os custos

**Aba 3 — Simulador**
- Slider de orçamento diário
- Resultado projetado: cliques, vendas estimadas, lucro estimado
- Gráficos de cenários (pessimista / realista / otimista)

**Aba 4 — Estratégia**
- Gerenciador de palavras-chave (positivas e negativas)
- Banco de anúncios (títulos, descrições, URLs)
- Anotações estratégicas

**Header fixo em todas as abas:**
- Nome do produto + etapa de funil + tipo
- 4 métricas-chave: Comissão Líquida, CPC de Mercado, Cliques Possíveis, CR Necessário

---

### TELA 5 — Análise e Otimização

**Propósito:** Input dos dados reais da campanha e diagnóstico automático de performance.

**Seções:**

**Header de Referência (5 métricas):**
- Comissão Líquida (meta)
- CPC de Mercado (benchmark)
- Meta CPC Bom (calculada)
- Poder de Fogo (cliques compráveis)
- Meta de Conversão (CR necessário)

**Painel de Input (esquerda):**
- Seletor de período (1d / 7d / 15d / 30d / customizado)
- Status da campanha: Aprendizado / Qualificada
- Campos: Impressões, Cliques, Gasto (R$), Conversões
- CTR calculado automaticamente
- CPC real calculado automaticamente

**Painel de Diagnóstico (direita):**
- Veredicto: Lucrativo / No Limite / Prejuízo (com cor e ícone)
- CPC Real vs CPC Meta — comparação visual
- CR Real vs CR Necessário — barra de progresso
- Sugestões automáticas de otimização

**Alertas Contextuais:**
- Gerados automaticamente baseados nos dados inseridos
- Segmentados por severidade: Crítico / Atenção / Informativo

**Histórico de Campanhas:**
- Salvar dados como entrada histórica
- Visualizar entradas anteriores

---

### TELA 6 — Portfólio

**Propósito:** Gestão e visão consolidada de todos os produtos na carteira.

**Navegação em 3 abas:**

**Aba 1 — Resumo (Overview)**
- 4 cards de métricas: Total de Produtos, Produtos Lucrativos, Gasto Total, Lucro Total
- Top 3 Melhores Produtos (por lucro)
- Bottom 3 Produtos com Atenção

**Aba 2 — Meus Produtos**
- Busca e filtros (status: lucrativo/negativo/neutro, ordenação)
- Cards por produto: nome, nicho, mercado, status, métricas-chave
- Ações: Editar / Ir para Setup / Ir para Análise / Deletar

**Aba 3 — Otimizar Budget**
- Input de orçamento total disponível
- Seleção de método de otimização (simples / linear programming)
- Resultado: como distribuir o budget entre os produtos para maximizar ROI

---

### TELA 7 — Comparador de Produtos

**Propósito:** Comparação lado a lado de 2+ produtos para decidir onde investir mais.

**Layout:**
- Seletor de produtos para comparar (até 4)
- Tabela comparativa com métricas: Comissão, CPC, CR Necessário, ROI Estimado, Cliques, etc.
- Gráfico de radar/araña comparando perfis de performance
- Recomendação automática: qual produto priorizar

---

### TELA 8 — Simulador de Escala

**Propósito:** Simular o que acontece ao escalar o orçamento de uma campanha.

**Inputs:**
- Produto selecionado
- Orçamento atual e orçamento alvo
- Taxa de conversão atual e esperada
- CPC atual

**Outputs:**
- Projeção de receita, gasto e lucro
- Ponto de break-even
- Risco estimado
- Cronograma de escala sugerido (semanal/quinzenal)

---

### TELA 9 — Relatórios

**Propósito:** Exportação de dados para planilhas e relatórios.

**Funcionalidades:**
- Seletor de período e produtos
- Exportar Excel completo (todas as métricas)
- Preview do conteúdo antes de exportar
- Histórico de exportações recentes

---

### TELA 10 — Histórico de Campanhas

**Propósito:** Registro cronológico de todas as entradas de dados de campanhas.

**Layout:**
- Linha do tempo com entradas por data
- Filtros por produto e período
- Visualização de métricas de cada entrada
- Editar / Deletar entradas

---

### TELA 11 — Manual / Help

**Propósito:** Documentação interna do produto — como usar cada funcionalidade.

---

## 5. Sistema de Design

### 5.1 Tipografia
- **Font:** DM Sans (Google Fonts)
- **KPI Values:** `text-4xl font-black tabular-nums` (ex: R$ 12.450,00)
- **Card Labels:** `text-[11px] font-semibold uppercase tracking-widest text-slate-400`
- **Body:** `text-sm font-medium text-slate-700`
- **Section Titles:** `text-sm font-bold text-slate-800`

### 5.2 Paleta de Cores
| Token | Hex | Uso |
|-------|-----|-----|
| Primary | `#2563EB` (blue-600) | Ações, links, tabs ativos |
| Text | `#0F172A` (slate-900) | Títulos e KPI values |
| Subtle | `#94A3B8` (slate-400) | Labels e texto secundário |
| Border | `#E2E8F0` (slate-200) | Bordas de cards |
| Surface | `#F8FAFC` (slate-50) | Background da página |
| Revenue | `#10B981` (emerald-500) | Receita, positivo, lucro |
| Cost | `#F43F5E` (rose-500) | Custo, negativo, prejuízo |
| ROI | `#3B82F6` (blue-500) | ROI, conversão |
| Warning | `#F59E0B` (amber-500) | Atenção, ranking #1 |

### 5.3 Componentes Base
- **Card:** `bg-white rounded-2xl border border-slate-200 overflow-hidden`
- **Card Accent Bar:** `h-1 w-full bg-[color]` no topo do card
- **Input:** `rounded-xl border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-slate-300`
- **Button Primary:** `bg-slate-900 text-white rounded-xl px-5 py-2.5 text-sm font-semibold`
- **Button Pill (ativo):** `bg-slate-900 text-white rounded-xl text-xs font-semibold`
- **Button Pill (inativo):** `text-slate-500 rounded-xl text-xs font-semibold hover:bg-slate-100`
- **Tab:** `border-b-2 border-slate-900 text-slate-900 text-[11px] uppercase tracking-widest` (ativo)
- **Divider:** `border-slate-100` ou `divide-slate-100`

### 5.4 Layout
- **Sidebar:** 256px (expandida), 72px (colapsada), fundo `slate-900`
- **Content area:** `max-w-[1400px] mx-auto`
- **Spacing grid:** Tailwind 4pt/8pt system
- **Page padding:** `p-6 lg:p-8`

### 5.5 Hierarquia de Informação
1. **Nível 1 — KPI:** número grande (4xl), label minúscula (11px), accent bar colorida
2. **Nível 2 — Stat secundária:** número médio (2xl), label minúscula (11px)
3. **Nível 3 — Detalhe:** texto (sm), cor slate-600
4. **Nível 4 — Meta:** texto (11px), cor slate-400

---

## 6. Regras de Negócio Principais

### CPC Sugerido
```
CPC Sugerido = Comissão Líquida (em BRL) × Percentual de Risco
```
Onde o percentual varia por temperatura do produto (0.3 a 0.5).

### Break-Even CPC
```
Break-Even CPC = Comissão Líquida / Cliques por Conversão Esperados
```

### Cliques Compráveis
```
Cliques Compráveis = Orçamento Disponível / CPC de Mercado
```

### CR Necessário
```
CR Necessário = (CPC Real / Comissão Líquida) × 100
```

### Lucro Real
```
Lucro Real = Receita Ads - Gasto Ads - Custos Fixos Proporcionais - Custos Específicos
```

### ROI
```
ROI = (Lucro / Custo Total) × 100
```

---

## 7. Integrações e Dados

| Fonte | Dado | Frequência |
|-------|------|-----------|
| AwesomeAPI | Cotações USD, EUR, GBP → BRL | A cada 5 minutos |
| Google Ads Importer | Dados reais de campanha (CSV) | Manual |
| localStorage | Todos os dados do usuário | Persistente |
| AI (OpenAI/Claude) | Análise e sugestões contextuais | Sob demanda |

---

## 8. Modos de Uso

| Modo | Descrição | Telas disponíveis |
|------|-----------|-------------------|
| **Iniciante** | Interface simplificada, campos essenciais | Todas com complexidade reduzida |
| **Avançado (Pro)** | Todos os dados e configurações | Todas completas |

---

## 9. Métricas de Sucesso do Produto

- Tempo para primeira campanha configurada: < 5 minutos
- Número de cliques para ver o lucro do dia: ≤ 2
- Taxa de erro de preenchimento de formulários: < 5%
- Clareza do diagnóstico (o usuário entende o veredicto sem explicação): 100%
