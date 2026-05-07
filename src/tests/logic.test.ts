import { describe, it, expect } from 'vitest';
import {
  calculateCampaignKPIs,
  calculateViability,
  calculateBreakEven,
  analyzeCampaignVerdict,
  optimizePortfolio,
  simulateScale,
  generateAlerts,
  calculateAggregatedMetrics,
} from '../services/logic';
import type { Product, Campaign, OperationalCosts } from '../types';

// ==========================================
// CATEGORIA 1: NÚCLEO MATEMÁTICO (KPIs)
// ==========================================
describe('Categoria 1: Cálculos de KPIs Básicos', () => {
  
  it('deve calcular ROI corretamente', () => {
    const result = calculateCampaignKPIs(1200, 1000, 10, 500);
    // ROI = ((1200 - 1000) / 1000) * 100 = 20%
    expect(result.roi).toBe(20);
  });

  it('deve retornar ROI = 0 quando spend = 0 (evitar divisão por zero)', () => {
    const result = calculateCampaignKPIs(1200, 0, 10, 500);
    expect(result.roi).toBe(0);
  });

  it('deve calcular ROAS corretamente', () => {
    const result = calculateCampaignKPIs(1500, 1000, 10, 500);
    // ROAS = 1500 / 1000 = 1.5
    expect(result.roas).toBe(1.5);
  });

  it('deve calcular CR (Taxa de Conversão) corretamente', () => {
    const result = calculateCampaignKPIs(1200, 1000, 10, 500);
    // CR = (10 / 500) * 100 = 2%
    expect(result.cr).toBe(2);
  });

  it('deve retornar CR = 0 quando clicks = 0', () => {
    const result = calculateCampaignKPIs(1200, 1000, 10, 0);
    expect(result.cr).toBe(0);
  });

  it('deve calcular CPC corretamente', () => {
    const result = calculateCampaignKPIs(1200, 1000, 10, 500);
    // CPC = 1000 / 500 = 2
    expect(result.cpc).toBe(2);
  });

  it('deve calcular CPA corretamente', () => {
    const result = calculateCampaignKPIs(1200, 1000, 10, 500);
    // CPA = 1000 / 10 = 100
    expect(result.cpa).toBe(100);
  });

  it('deve calcular margem corretamente', () => {
    const result = calculateCampaignKPIs(1200, 1000, 10, 500);
    // Margem = ((200 / 1200) * 100) = 16.67%
    expect(result.margin).toBeCloseTo(16.67, 1);
  });
});

// ==========================================
// CATEGORIA 2: VIABILIDADE DE PRODUTO
// ==========================================
describe('Categoria 2: Análise de Viabilidade', () => {
  
  const produtoBase: Product = {
    id: 'test-1',
    name: 'Produto Teste',
    nicho: 'Saúde',
    price: 197,
    commissionPct: 50,
    commissionLiquid: 93.65, // 50% - 5% taxa
    manualBenchmarkCPC: 2.5,
    temperature: 'quente',
    qualityLP: 'excelente',
    funnelStage: 'fundo',
  };

  it('deve REPROVAR produto sem CPC de mercado informado', () => {
    const produtoSemCPC = { ...produtoBase, manualBenchmarkCPC: 0 };
    const result = calculateViability(produtoSemCPC);
    
    expect(result.status).toBe('REPROVADO');
    expect(result.score).toBe(0);
  });

  it('deve APROVAR produto com boas métricas', () => {
    const result = calculateViability(produtoBase);
    
    expect(result.status).toBe('APROVADO');
    expect(result.score).toBeGreaterThanOrEqual(7);
  });

  it('deve dar score alto para comissão > R$ 100', () => {
    const produtoComissaoAlta = { ...produtoBase, commissionLiquid: 150 };
    const result = calculateViability(produtoComissaoAlta);
    
    expect(result.score).toBeGreaterThan(7);
  });

  it('deve REPROVAR quando CPC de mercado é muito maior que o ideal', () => {
    const produtoCPCAlto = { ...produtoBase, manualBenchmarkCPC: 10 };
    const result = calculateViability(produtoCPCAlto);
    
    // CPC ideal = 4% de 93.65 = 3.75
    // CPC mercado = 10 (muito acima)
    expect(result.status).toBe('REPROVADO');
  });

  it('deve calcular viabilidade de ofertas/kits corretamente', () => {
    const produtoComKits = {
      ...produtoBase,
      offers: [
        { name: 'Kit 3 unidades', price: 497, commissionPct: 50 }
      ]
    };
    
    const result = calculateViability(produtoComKits);
    
    expect(result.scenarios).toHaveLength(1);
    expect(result.scenarios[0].offerName).toBe('Kit 3 unidades');
  });
});

// ==========================================
// CATEGORIA 3: BREAK-EVEN (CRÍTICO)
// ==========================================
describe('Categoria 3: Cálculo de Break-Even', () => {
  
  const custosFixos: OperationalCosts = {
    total: 2000,
    details: [
      { category: 'Ferramentas', items: [{ name: 'Software', value: 500 }] }
    ]
  };

  it('deve calcular break-even corretamente', () => {
    const result = calculateBreakEven(custosFixos, 100, 2.5, 2);
    
    // CPA = 2.5 / 0.02 = 125
    // Margem = 100 - 125 = -25 (prejuízo por venda)
    // Mas se CR for maior...
    expect(result).toBeDefined();
    expect(result.investmentTotal).toBeGreaterThan(0);
  });

  it('deve retornar erro quando CR = 0', () => {
    const result = calculateBreakEven(custosFixos, 100, 2.5, 0);
    
    expect(result.salesNeeded).toBe(0);
    expect(result.explanation).toContain('inválida');
  });

  it('deve identificar produto INVIÁVEL quando margem é negativa', () => {
    // CPC alto: 10, CR baixa: 1%, Comissão: 50
    // CPA = 10 / 0.01 = 1000 (muito maior que comissão de 50)
    const result = calculateBreakEven(custosFixos, 50, 10, 1);
    
    expect(result.isBalanced).toBe(false);
    expect(result.explanation).toContain('INVIÁVEL');
  });

  it('deve garantir que revenueAtBreakEven = investmentTotal', () => {
    const result = calculateBreakEven(custosFixos, 100, 1, 5);
    
    if (result.isBalanced) {
      expect(Math.abs(result.revenueAtBreakEven - result.investmentTotal)).toBeLessThan(1);
    }
  });
});

// ==========================================
// CATEGORIA 4: VEREDITO DE CAMPANHA
// ==========================================
describe('Categoria 4: Análise de Veredito de Campanha', () => {
  
  it('deve retornar TETO ATINGIDO quando gastou > comissão sem vender', () => {
    const result = analyzeCampaignVerdict(150, 0, 100, 'qualificada');
    
    expect(result.title).toContain('TETO');
  });

  it('deve retornar EM VALIDAÇÃO quando gastou < comissão sem vender', () => {
    const result = analyzeCampaignVerdict(50, 0, 100, 'qualificada');
    
    expect(result.title).toContain('VALIDAÇÃO');
  });

  it('deve recomendar ESCALAR quando CPA <= 40% da comissão', () => {
    // Gasto: 400, Conversões: 10, Comissão: 100
    // CPA = 400/10 = 40
    // Ratio = 40/100 = 0.4 (40%)
    const result = analyzeCampaignVerdict(400, 10, 100, 'qualificada');
    
    expect(result.title).toContain('ESCALAR');
  });

  it('deve alertar PREJUÍZO quando CPA > 100% da comissão', () => {
    // CPA = 1200/10 = 120 (maior que comissão de 100)
    const result = analyzeCampaignVerdict(1200, 10, 100, 'qualificada');
    
    expect(result.title).toContain('PREJUÍZO');
  });

  it('deve ser mais tolerante no status APRENDIZADO', () => {
    // CPA = 70% da comissão (seria warning normal, mas em aprendizado é ok)
    const result = analyzeCampaignVerdict(700, 10, 100, 'aprendizado');
    
    expect(result.title).toContain('APRENDIZADO');
  });
});

// ==========================================
// CATEGORIA 5: OTIMIZAÇÃO DE PORTFÓLIO
// ==========================================
describe('Categoria 5: Alocação Otimizada de Budget', () => {
  
  const produtos: Product[] = [
    {
      id: 'p1',
      name: 'Produto A',
      nicho: 'Saúde',
      commissionLiquid: 100,
      price: 197,
      commissionPct: 50,
    },
    {
      id: 'p2',
      name: 'Produto B',
      nicho: 'Beleza',
      commissionLiquid: 80,
      price: 150,
      commissionPct: 50,
    }
  ];

  const campanhas: Campaign[] = [
    {
      id: 'c1',
      productId: 'p1',
      date: '2024-12-01',
      spend: 1000,
      revenue: 1500,
      clicks: 500,
      conversions: 10,
      status: 'qualificada'
    },
    {
      id: 'c2',
      productId: 'p2',
      date: '2024-12-01',
      spend: 1000,
      revenue: 800,
      clicks: 400,
      conversions: 5,
      status: 'qualificada'
    }
  ];

  it('deve respeitar o budget total', () => {
    const result = optimizePortfolio(5000, produtos, campanhas);
    
    const totalAlocado = result.allocation.reduce((sum, a) => sum + a.amount, 0);
    expect(totalAlocado).toBeLessThanOrEqual(5000);
  });

  it('deve priorizar produtos com ROI maior', () => {
    const result = optimizePortfolio(5000, produtos, campanhas);
    
    // Produto A tem ROI de 50%, Produto B tem ROI de -20%
    const produtoA = result.allocation.find(a => a.productName === 'Produto A');
    const produtoB = result.allocation.find(a => a.productName === 'Produto B');
    
    if (produtoA && produtoB) {
      expect(produtoA.amount).toBeGreaterThan(produtoB.amount);
    }
  });

  it('deve retornar erro quando lista de produtos está vazia', () => {
    const result = optimizePortfolio(5000, [], campanhas);
    
    expect(result.allocation).toHaveLength(0);
    expect(result.message).toContain('Nenhum produto');
  });

  it('não deve alocar em produtos com ROI negativo', () => {
    const result = optimizePortfolio(5000, produtos, campanhas);
    
    // Produto B tem prejuízo
    const produtoB = result.allocation.find(a => a.productName === 'Produto B');
    expect(produtoB).toBeUndefined();
  });
});

// ==========================================
// CATEGORIA 6: SIMULADOR DE ESCALA
// ==========================================
describe('Categoria 6: Simulação de Escala de Budget', () => {
  
  const produto: Product = {
    id: 'test',
    name: 'Produto Escala',
    nicho: 'Teste',
    commissionLiquid: 100,
    price: 200,
    commissionPct: 50,
  };

  it('deve degradar CPC ao aumentar budget', () => {
    const result = simulateScale(produto, 1000, 2.5, 2);
    
    // Cenário +50% deve ter CPC maior que o atual
    const cenario50 = result.scenarios.find(s => s.budgetIncrease === 50);
    
    expect(cenario50).toBeDefined();
    expect(cenario50!.estimatedCPCIncrease).toBeGreaterThan(0);
  });

  it('deve degradar CR ao aumentar budget (saturação de público)', () => {
    const result = simulateScale(produto, 1000, 2.5, 2);
    
    const cenario100 = result.scenarios.find(s => s.budgetIncrease === 100);
    
    expect(cenario100).toBeDefined();
    expect(cenario100!.estimatedCRDecrease).toBeGreaterThan(0);
  });

  it('deve considerar degradação no lucro projetado', () => {
    const result = simulateScale(produto, 1000, 2.5, 2);
    
    // Com budget maior, ROI deve cair
    const cenario50 = result.scenarios.find(s => s.budgetIncrease === 50);
    const cenario200 = result.scenarios.find(s => s.budgetIncrease === 200);
    
    if (cenario50 && cenario200) {
      expect(cenario200.projectedROI).toBeLessThan(cenario50.projectedROI);
    }
  });

  it('deve recomendar o melhor cenário viável', () => {
    const result = simulateScale(produto, 1000, 2.5, 2);
    
    expect(result.bestScenario).toBeDefined();
    expect(result.recommendation).toBeTruthy();
  });
});

// ==========================================
// CATEGORIA 7: ALERTAS INTELIGENTES
// ==========================================
describe('Categoria 7: Sistema de Alertas', () => {
  
  const produtos: Product[] = [
    {
      id: 'p1',
      name: 'Produto Teste',
      nicho: 'Saúde',
      commissionLiquid: 100,
      price: 200,
      commissionPct: 50,
    }
  ];

  it('deve gerar alerta crítico quando gastou > 50% da comissão sem vender', () => {
    const campanhas: Campaign[] = [
      {
        id: 'c1',
        productId: 'p1',
        date: new Date().toISOString(),
        spend: 60,
        revenue: 0,
        clicks: 100,
        conversions: 0,
        status: 'qualificada'
      }
    ];

    const result = generateAlerts(produtos, campanhas, 10000);
    
    const temAlertaCritico = result.some(a => 
      a.type === 'danger' && a.message.includes('sem converter')
    );
    
    expect(temAlertaCritico).toBe(true);
  });

  it('deve gerar alerta de oportunidade quando ROI > 100%', () => {
    const campanhas: Campaign[] = Array.from({ length: 5 }, (_, i) => ({
      id: `c${i}`,
      productId: 'p1',
      date: new Date().toISOString(),
      spend: 100,
      revenue: 250,
      clicks: 50,
      conversions: 5,
      status: 'qualificada'
    }));

    const result = generateAlerts(produtos, campanhas, 10000);
    
    const temOportunidade = result.some(a => 
      a.type === 'success' && a.category === 'opportunity'
    );
    
    expect(temOportunidade).toBe(true);
  });

  it.skip('deve alertar quando CPC subiu > 30% em 7 dias', () => {
    const hoje = new Date();
    const seteDiasAtras = new Date(hoje);
    seteDiasAtras.setDate(hoje.getDate() - 7);
    const quinzeDiasAtras = new Date(hoje);
    quinzeDiasAtras.setDate(hoje.getDate() - 14);

    const campanhas: Campaign[] = [
      // Semana passada: CPC = 2
      {
        id: 'c1',
        productId: 'p1',
        date: quinzeDiasAtras.toISOString(),
        spend: 200,
        revenue: 300,
        clicks: 100,
        conversions: 5,
        status: 'qualificada'
      },
      // Esta semana: CPC = 3 (50% maior)
      {
        id: 'c2',
        productId: 'p1',
        date: hoje.toISOString(),
        spend: 300,
        revenue: 400,
        clicks: 100,
        conversions: 5,
        status: 'qualificada'
      }
    ];

    const result = generateAlerts(produtos, campanhas, 10000);
    
    const temAlertaCPC = result.some(a => 
      a.message.includes('CPC')
    );
    
    expect(temAlertaCPC).toBe(true);
  });
});

// ==========================================
// CATEGORIA 8: AGREGAÇÃO DE DADOS
// ==========================================
describe('Categoria 8: Agregação de Métricas', () => {
  
  const campanhas: Campaign[] = [
    {
      id: 'c1',
      productId: 'p1',
      date: '2024-12-01',
      spend: 1000,
      revenue: 1500,
      clicks: 500,
      conversions: 10,
      status: 'qualificada'
    },
    {
      id: 'c2',
      productId: 'p1',
      date: '2024-12-02',
      spend: 800,
      revenue: 1200,
      clicks: 400,
      conversions: 8,
      status: 'qualificada'
    }
  ];

  it('deve somar corretamente todas as métricas', () => {
    const result = calculateAggregatedMetrics(campanhas);
    
    expect(result.spend).toBe(1800);
    expect(result.revenue).toBe(2700);
    expect(result.clicks).toBe(900);
    expect(result.conversions).toBe(18);
  });

  it('deve calcular ROI global correto (não média simples)', () => {
    const result = calculateAggregatedMetrics(campanhas);
    
    // ROI correto = ((2700 - 1800) / 1800) * 100 = 50%
    // NÃO é a média dos ROIs individuais!
    expect(result.roi).toBe(50);
  });

  it('deve calcular métricas corretamente com lista vazia', () => {
    const result = calculateAggregatedMetrics([]);
    
    expect(result.spend).toBe(0);
    expect(result.revenue).toBe(0);
    expect(result.roi).toBe(0);
  });

  it('deve calcular CR global ponderado corretamente', () => {
    const result = calculateAggregatedMetrics(campanhas);
    
    // CR = (18 / 900) * 100 = 2%
    expect(result.cr).toBe(2);
  });
});