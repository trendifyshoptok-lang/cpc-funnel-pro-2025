// ==========================================
// TIPOS DE CONFIGURAÇÃO DO DASHBOARD
// ==========================================

export type DashboardMode = 'resumida' | 'completa' | 'custom';

export interface DashboardSections {
  // CONFIGURAÇÕES
  showFixedCosts: boolean;
  showFinancialSettings: boolean;
  
  // ALERTAS
  showAlerts: boolean;
  showInsights: boolean;
  
  // KPIs
  showMainKPIs: boolean;
  showSecondaryKPIs: boolean;
  showProjection: boolean;
  
  // DESTAQUES
  showHighlights: boolean;
  
  // GRÁFICOS NOVOS
  showTrendChart: boolean;
  showFunnelChart: boolean;
  
  // GRÁFICOS ANTIGOS
  showPieChart: boolean;
  showBarCharts: boolean;
  
  // TABELA
  showAdvancedFilters: boolean;
  showProductTable: boolean;
}

export interface DashboardConfig {
  mode: DashboardMode;
  sections: DashboardSections;
}

// ==========================================
// PRESETS (CONFIGURAÇÕES PRONTAS)
// ==========================================

export const PRESET_RESUMIDA: DashboardConfig = {
  mode: 'resumida',
  sections: {
    showFixedCosts: false,
    showFinancialSettings: false,
    showAlerts: true,
    showInsights: false,
    showMainKPIs: true,
    showSecondaryKPIs: false,
    showProjection: true,
    showHighlights: true,
    showTrendChart: false,
    showFunnelChart: false,
    showPieChart: false,
    showBarCharts: false,
    showAdvancedFilters: false,
    showProductTable: false,
  }
};

export const PRESET_COMPLETA: DashboardConfig = {
  mode: 'completa',
  sections: {
    showFixedCosts: true,
    showFinancialSettings: true,
    showAlerts: true,
    showInsights: true,
    showMainKPIs: true,
    showSecondaryKPIs: true,
    showProjection: true,
    showHighlights: true,
    showTrendChart: true,
    showFunnelChart: true,
    showPieChart: true,
    showBarCharts: true,
    showAdvancedFilters: true,
    showProductTable: true,
  }
};

export const PRESET_CUSTOM: DashboardConfig = {
  mode: 'custom',
  sections: {
    showFixedCosts: true,
    showFinancialSettings: true,
    showAlerts: true,
    showInsights: true,
    showMainKPIs: true,
    showSecondaryKPIs: true,
    showProjection: true,
    showHighlights: true,
    showTrendChart: true,
    showFunnelChart: true,
    showPieChart: true,
    showBarCharts: true,
    showAdvancedFilters: true,
    showProductTable: true,
  }
};

// ==========================================
// METADADOS DAS SEÇÕES (Para UI)
// ==========================================

export interface SectionMetadata {
  id: keyof DashboardSections;
  label: string;
  description: string;
  category: 'config' | 'alert' | 'kpi' | 'chart' | 'table';
  icon: string;
}

export const SECTIONS_METADATA: SectionMetadata[] = [
  // CONFIGURAÇÕES
  {
    id: 'showFixedCosts',
    label: 'Gerenciar Custos Fixos',
    description: 'Configurar custos operacionais mensais',
    category: 'config',
    icon: ''
  },
  {
    id: 'showFinancialSettings',
    label: 'Configurações Financeiras',
    description: 'Meta de lucro e receitas extras (AdSense)',
    category: 'config',
    icon: '️'
  },
  
  // ALERTAS
  {
    id: 'showAlerts',
    label: 'Alertas Inteligentes',
    description: 'Notificações sobre produtos e metas',
    category: 'alert',
    icon: ''
  },
  {
    id: 'showInsights',
    label: 'Insights Complementares',
    description: 'Análises e recomendações adicionais',
    category: 'alert',
    icon: ''
  },
  
  // KPIs
  {
    id: 'showMainKPIs',
    label: 'KPIs Principais',
    description: 'Cards grandes: Receita, Gasto, Lucro, ROI',
    category: 'kpi',
    icon: ''
  },
  {
    id: 'showSecondaryKPIs',
    label: 'KPIs Secundários',
    description: 'Cards menores: CR, CPC, Ticket Médio, etc',
    category: 'kpi',
    icon: ''
  },
  {
    id: 'showProjection',
    label: 'Projeção Mensal',
    description: 'Estimativa de receita/lucro para fim do mês',
    category: 'kpi',
    icon: ''
  },
  
  // DESTAQUES
  {
    id: 'showHighlights',
    label: 'Top 3 e Bottom 3',
    description: 'Melhores e piores produtos por lucro',
    category: 'kpi',
    icon: ''
  },
  
  // GRÁFICOS NOVOS
  {
    id: 'showTrendChart',
    label: 'Gráfico de Tendência',
    description: 'Evolução temporal com múltiplas métricas',
    category: 'chart',
    icon: ''
  },
  {
    id: 'showFunnelChart',
    label: 'Funil de Conversão',
    description: 'Visualização do fluxo: Cliques → Vendas',
    category: 'chart',
    icon: ''
  },
  
  // GRÁFICOS ANTIGOS
  {
    id: 'showPieChart',
    label: 'Distribuição de Gastos',
    description: 'Gráfico de pizza por produto',
    category: 'chart',
    icon: ''
  },
  {
    id: 'showBarCharts',
    label: 'Gráficos de Barras',
    description: 'Receita vs Gasto + Lucratividade',
    category: 'chart',
    icon: ''
  },
  
  // TABELA
  {
    id: 'showAdvancedFilters',
    label: 'Filtros Avançados',
    description: 'Filtrar por nicho, status, ROI, performance',
    category: 'table',
    icon: ''
  },
  {
    id: 'showProductTable',
    label: 'Tabela Detalhada',
    description: 'Lista completa de todos os produtos',
    category: 'table',
    icon: ''
  },
];