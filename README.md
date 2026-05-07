# 🚀 Gestor de Campanhas Google Ads

Sistema completo para gestão de produtos afiliados com análise financeira, otimização de portfólio e integração com IA.

## ✨ Features

- 📊 **Dashboard** com métricas globais e projeções
- 🗺️ **Mapeamento** de produtos com análise de viabilidade
- ⚙️ **Setup** de campanhas com break-even automático
- 📈 **Análise** de performance com histórico
- 💼 **Portfólio** com otimização de budget (Simplex)
- 🤖 **IA Integrada** (Gemini) para keywords e anúncios

## 🛠️ Setup Inicial

1. **Clone e instale:**
```bash
   npm install
```

2. **Configure a chave da API:**
   - Crie `.env` na raiz
   - Adicione: `VITE_GEMINI_API_KEY=sua_chave_aqui`
   - Obtenha sua chave em: https://aistudio.google.com/apikey

3. **Execute:**
```bash
   npm run dev
```

## 📁 Estrutura do Projeto
```
src/
├── components/
│   ├── Setup/              # Configuração modular
│   │   ├── index.tsx
│   │   ├── CostsSection.tsx
│   │   ├── KeywordsSection.tsx
│   │   ├── NegativesSection.tsx
│   │   └── AdsSection.tsx
│   ├── shared/             # Componentes reutilizáveis
│   │   └── Tooltip.tsx
│   ├── Dashboard.tsx
│   ├── Mapping.tsx
│   ├── Analysis.tsx
│   ├── Portfolio.tsx
│   └── ...
├── constants/
│   └── negativeKeywords.ts # Base de keywords negativas
├── services/
│   ├── gemini.ts           # Integração Gemini AI
│   └── logic.ts            # Cálculos financeiros
└── types/
    └── index.ts            # TypeScript types
```

## 🔧 Tecnologias

- **React 18** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS** (estilização)
- **Recharts** (gráficos)
- **Google Gemini AI** (geração de conteúdo)
- **LocalStorage** (persistência com debounce)

## 📊 Funcionalidades Principais

### Dashboard
- Métricas globais (receita, custo, lucro, ROI)
- Gráficos de evolução temporal
- Health Score do negócio
- Projeções mensais automáticas

### Mapeamento
- Análise de viabilidade (ROI, CR, CPC)
- Cálculo de poder de fogo
- Classificação por profundidade de funil

### Setup
- Análise financeira completa
- Cálculo de break-even
- Geração de keywords e anúncios com IA
- Gestão de palavras negativas

### Portfolio
- Visão consolidada de todos os produtos
- Otimização de budget (Simple + Simplex)
- Health Score por produto
- Filtros e comparações

## 🚀 Performance

- ✅ Debounce no salvamento (reduz writes)
- ✅ Memoização com `useMemo` (evita re-cálculos)
- ✅ Componentes modulares (manutenibilidade)
- ✅ Validação de dados (proteção contra erros)

## 📝 Licença

MIT