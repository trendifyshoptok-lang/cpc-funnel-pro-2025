import * as XLSX from 'xlsx';

// ==========================================
// INTERFACE DE DADOS PARA EXPORTAÇÃO
// ==========================================
export interface ExcelExportData {
  // Resumo Geral
  summary: {
    periodo: string;
    receita: number;
    gasto: number;
    lucro: number;
    roi: number;
    campanhas: number;
    produtos: number;
    cr: number;
    cpc: number;
    conversoes: number;
    cliques: number;
    ticketMedio: number;
    margem: number;
  };
  
  // Performance por Produto
  products: Array<{
    produto: string;
    nicho: string;
    campanhas: number;
    gasto: number;
    receita: number;
    lucro: number;
    roi: number;
    conversoes: number;
    cr: number;
    cpc: number;
    cliques: number;
  }>;
  
  // Timeline (Histórico Diário)
  timeline: Array<{
    data: string;
    receita: number;
    gasto: number;
    lucro: number;
  }>;
}

// ==========================================
// FUNÇÃO PRINCIPAL DE EXPORTAÇÃO
// ==========================================
export const exportToExcel = (data: ExcelExportData, filename?: string) => {
  // Criar workbook
  const wb = XLSX.utils.book_new();
  
  // ==========================================
  // ABA 1: RESUMO EXECUTIVO
  // ==========================================
  const summaryData = [
    [' RELATÓRIO DE PERFORMANCE - AFILIADOS'],
    [''],
    ['Período:', data.summary.periodo],
    ['Gerado em:', new Date().toLocaleString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    })],
    [''],
    [' RESUMO FINANCEIRO'],
    ['Receita Total:', `R$ ${data.summary.receita.toFixed(2)}`],
    ['Investimento Total:', `R$ ${data.summary.gasto.toFixed(2)}`],
    ['Lucro Líquido:', `R$ ${data.summary.lucro.toFixed(2)}`],
    ['ROI Global:', `${data.summary.roi.toFixed(1)}%`],
    ['Margem de Lucro:', `${data.summary.margem.toFixed(1)}%`],
    [''],
    [' ESTATÍSTICAS DE CONVERSÃO'],
    ['Total de Campanhas:', data.summary.campanhas],
    ['Produtos Ativos:', data.summary.produtos],
    ['Total de Conversões:', data.summary.conversoes],
    ['Total de Cliques:', data.summary.cliques],
    ['Taxa de Conversão (CR):', `${data.summary.cr.toFixed(2)}%`],
    ['Custo por Clique (CPC):', `R$ ${data.summary.cpc.toFixed(2)}`],
    ['Ticket Médio:', `R$ ${data.summary.ticketMedio.toFixed(2)}`],
  ];
  
  const wsResumo = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Estilização da aba Resumo (largura das colunas)
  wsResumo['!cols'] = [
    { wch: 30 }, // Coluna A (Labels)
    { wch: 25 }  // Coluna B (Valores)
  ];
  
  XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo Executivo');
  
  // ==========================================
  // ABA 2: PERFORMANCE POR PRODUTO
  // ==========================================
  const productsHeaders = [
    'Produto',
    'Nicho',
    'Campanhas',
    'Gasto (R$)',
    'Receita (R$)',
    'Lucro (R$)',
    'ROI (%)',
    'Conversões',
    'Cliques',
    'CR (%)',
    'CPC (R$)'
  ];
  
  const productsRows = data.products.map(p => [
    p.produto,
    p.nicho,
    p.campanhas,
    p.gasto.toFixed(2),
    p.receita.toFixed(2),
    p.lucro.toFixed(2),
    p.roi.toFixed(1),
    p.conversoes,
    p.cliques,
    p.cr.toFixed(2),
    p.cpc.toFixed(2)
  ]);
  
  // Adicionar linha de totais
  const totalGasto = data.products.reduce((sum, p) => sum + p.gasto, 0);
  const totalReceita = data.products.reduce((sum, p) => sum + p.receita, 0);
  const totalLucro = data.products.reduce((sum, p) => sum + p.lucro, 0);
  const totalConversoes = data.products.reduce((sum, p) => sum + p.conversoes, 0);
  const totalCliques = data.products.reduce((sum, p) => sum + p.cliques, 0);
  const totalCampanhas = data.products.reduce((sum, p) => sum + p.campanhas, 0);
  const roiGlobal = totalGasto > 0 ? ((totalLucro / totalGasto) * 100) : 0;
  const crGlobal = totalCliques > 0 ? ((totalConversoes / totalCliques) * 100) : 0;
  const cpcGlobal = totalCliques > 0 ? (totalGasto / totalCliques) : 0;
  
  productsRows.push([
    ' TOTAL',
    '',
    totalCampanhas,
    totalGasto.toFixed(2),
    totalReceita.toFixed(2),
    totalLucro.toFixed(2),
    roiGlobal.toFixed(1),
    totalConversoes,
    totalCliques,
    crGlobal.toFixed(2),
    cpcGlobal.toFixed(2)
  ]);
  
  const wsProdutos = XLSX.utils.aoa_to_sheet([productsHeaders, ...productsRows]);
  
  // Largura das colunas
  wsProdutos['!cols'] = [
    { wch: 30 }, // Produto
    { wch: 15 }, // Nicho
    { wch: 12 }, // Campanhas
    { wch: 15 }, // Gasto
    { wch: 15 }, // Receita
    { wch: 15 }, // Lucro
    { wch: 12 }, // ROI
    { wch: 12 }, // Conversões
    { wch: 12 }, // Cliques
    { wch: 12 }, // CR
    { wch: 12 }  // CPC
  ];
  
  XLSX.utils.book_append_sheet(wb, wsProdutos, 'Performance Produtos');
  
  // ==========================================
  // ABA 3: TIMELINE (HISTÓRICO DIÁRIO)
  // ==========================================
  if (data.timeline && data.timeline.length > 0) {
    const timelineHeaders = [
      'Data',
      'Receita (R$)',
      'Gasto (R$)',
      'Lucro (R$)'
    ];
    
    const timelineRows = data.timeline.map(t => [
      t.data,
      t.receita.toFixed(2),
      t.gasto.toFixed(2),
      t.lucro.toFixed(2)
    ]);
    
    // Adicionar totais da timeline
    const timelineTotalReceita = data.timeline.reduce((sum, t) => sum + t.receita, 0);
    const timelineTotalGasto = data.timeline.reduce((sum, t) => sum + t.gasto, 0);
    const timelineTotalLucro = data.timeline.reduce((sum, t) => sum + t.lucro, 0);
    
    timelineRows.push([
      ' TOTAL',
      timelineTotalReceita.toFixed(2),
      timelineTotalGasto.toFixed(2),
      timelineTotalLucro.toFixed(2)
    ]);
    
    const wsTimeline = XLSX.utils.aoa_to_sheet([timelineHeaders, ...timelineRows]);
    
    wsTimeline['!cols'] = [
      { wch: 12 }, // Data
      { wch: 15 }, // Receita
      { wch: 15 }, // Gasto
      { wch: 15 }  // Lucro
    ];
    
    XLSX.utils.book_append_sheet(wb, wsTimeline, 'Timeline Diária');
  }
  
  // ==========================================
  // EXPORTAR ARQUIVO
  // ==========================================
  const fileName = filename || `relatorio-afiliados-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
  
  return true;
};