import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// COMPONENTES PRINCIPAIS — shell/landing sempre eager
import { Layout }       from "./components/Layout";
import { TodayPanel }   from "./components/TodayPanel";
import { AIAssistant }  from "./components/AIAssistant";
import { RouteLoader }  from "./components/ui/RouteLoader";

// ROTAS PESADAS — lazy loaded (cada uma vira chunk separado no build)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Dashboard = React.lazy(() =>
  import("./components/Dashboard").then(m => ({ default: m.Dashboard }))
) as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Mapping = React.lazy(() =>
  import("./components/Mapping").then(m => ({ default: m.Mapping }))
) as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Setup = React.lazy(() =>
  import("./components/Setup").then(m => ({ default: m.Setup }))
) as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Analysis = React.lazy(() =>
  import("./components/Analysis").then(m => ({ default: m.Analysis }))
) as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Portfolio = React.lazy(() =>
  import("./components/Portfolio").then(m => ({ default: m.Portfolio }))
) as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ScaleSimulator = React.lazy(() =>
  import("./components/ScaleSimulator").then(m => ({ default: m.ScaleSimulator }))
) as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ProductComparator = React.lazy(() =>
  import("./components/ProductComparator").then(m => ({ default: m.ProductComparator }))
) as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Manual = React.lazy(() =>
  import("./components/Manual").then(m => ({ default: m.Manual }))
) as any;
import "./premium-animations.css";
import { Onboarding } from "./components/Onboarding";
import { CommandPalette } from "./components/ui/CommandPalette";
import { Toast } from "./components/ui/Toast";
import { ApiKeySettings } from "./components/ApiKeySettings";
import { ProFeatureLock } from "./components/ProFeatureLock";
import { AppModeProvider } from "./contexts/AppModeContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import { SEED_PRODUCTS, SEED_CAMPAIGNS } from "./data/seedData";
import {
  useKeyboardShortcuts,
  KeyboardShortcutsHelp,
} from "./hooks/useKeyboardShortcuts";
import { MobileLayout } from "./components/mobile/MobileLayout";
import { useIsMobile } from "./components/mobile/MobileNavigation";
import "./mobile-styles.css";
import { ThemeProvider } from "./hooks/ThemeContext";
import "./dark-theme.css";

// TIPOS
import type { Product, Campaign, OperationalCosts } from "./types";
import { Button } from "./components/ui/Button";

// ÍCONES
import {
  Trash2,
  Briefcase,
  CheckCircle,
  AlertCircle,
  Info,
  BarChart,
  X,
} from "lucide-react";

// COMPONENTE PRINCIPAL
const App = () => {
  const isMobile = useIsMobile();

  //  NOVO: Trigger para resetar o Mapeamento
  const [mappingResetTrigger, setMappingResetTrigger] = useState(0);

  /* ----------------------------------------
   * 1. CARREGAMENTO COM VALIDAÇÃO
   ---------------------------------------- */

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem("products");
      const parsed = saved ? JSON.parse(saved) : [];

      if (!Array.isArray(parsed)) return [];

      // Garantir fallback para produtos sem currency/market
      return parsed.map((p: Product) => ({
        ...p,
        currency: p.currency || "BRL",
        market: p.market || "BR",
        //  Converter fixedCosts legado para Array
        fixedCosts: Array.isArray((p as any).fixedCosts) ? (p as any).fixedCosts : [],
      }));
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      return []; // <--- 2. Retorna lista vazia se der erro no banco
    }
  });

  const [history, setHistory] = useState<Campaign[]>(() => {
    try {
      const saved = localStorage.getItem("history");
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  // ─── Carregar dados de exemplo ───────────────────────────────────────────
  const loadSeedData = () => {
    setProducts(SEED_PRODUCTS);
    setHistory(SEED_CAMPAIGNS);
    localStorage.setItem("products", JSON.stringify(SEED_PRODUCTS));
    localStorage.setItem("history", JSON.stringify(SEED_CAMPAIGNS));
  };

  const hasSeedData = products.some((p) => p.id.startsWith("seed_prod_"));
  const clearSeedData = () => {
    setProducts([]);
    setHistory([]);
    localStorage.removeItem("products");
    localStorage.removeItem("history");
  };

  //  ESTADO GLOBAL: CUSTOS FIXOS MENSAIS (NOVA ESTRUTURA)
  const [fixedCosts, setFixedCosts] = useState<OperationalCosts>(() => {
    try {
      const saved = localStorage.getItem("fixedCosts");
      if (saved) {
        const parsed = JSON.parse(saved);

        //  MIGRAÇÃO AUTOMÁTICA: Se for estrutura antiga, converter
        if (parsed.mktTools !== undefined) {
          console.log(" Migrando custos fixos para nova estrutura...");

          const migratedItems = [];

          if (parsed.mktTools > 0) {
            migratedItems.push({
              id: `cost_${Date.now()}_1`,
              name: "Ferramentas de Marketing",
              value: parsed.mktTools,
            });
          }

          if (parsed.aiTools > 0) {
            migratedItems.push({
              id: `cost_${Date.now()}_2`,
              name: "Ferramentas de IA",
              value: parsed.aiTools,
            });
          }

          if (parsed.hosting > 0) {
            migratedItems.push({
              id: `cost_${Date.now()}_3`,
              name: "Hospedagem",
              value: parsed.hosting,
            });
          }

          if (parsed.domain > 0) {
            migratedItems.push({
              id: `cost_${Date.now()}_4`,
              name: "Domínio",
              value: parsed.domain,
            });
          }

          if (parsed.others > 0) {
            migratedItems.push({
              id: `cost_${Date.now()}_5`,
              name: "Outros",
              value: parsed.others,
            });
          }

          const total = migratedItems.reduce(
            (sum, item) => sum + item.value,
            0
          );

          return {
            items: migratedItems,
            total: total,
          };
        }

        //  Estrutura nova - usar diretamente
        if (parsed.items && Array.isArray(parsed.items)) {
          return {
            items: parsed.items,
            total: parsed.total || 0,
          };
        }
      }
    } catch (error) {
      console.error("Erro ao carregar custos fixos:", error);
    }

    //  Padrão vazio
    return { items: [], total: 0 };
  });

  //  CÁLCULO AUTOMÁTICO DO TOTAL (Reagente)
  const totalFixedCosts = fixedCosts.items.reduce(
    (sum, item) => sum + (item.value || 0),
    0
  );

  const activeProductsCount = useMemo(() => {
    return (
      products.filter((p) => history.some((c) => c.productId === p.id))
        .length || 1
    );
  }, [products, history]);

  const [activeTab, setActiveTab] = useState<string>("hoje");

  // Nome do usuário — persistido no localStorage
  const [userName, setUserName] = useState<string>(() => {
    try { return localStorage.getItem("user_name") || ""; } catch { return ""; }
  });
  const saveUserName = (name: string) => {
    setUserName(name);
    try { localStorage.setItem("user_name", name); } catch {}
  };

  //  NOVO: Estado para edição de produtos
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [monthlyTarget, setMonthlyTarget] = useState<number>(() => {
    try { return Number(localStorage.getItem("monthlyTarget")) || 10000; } catch { return 10000; }
  });

  const [currentProduct, setCurrentProduct] = useState<Product | null>(() => {
    try {
      const lastId = localStorage.getItem("lastProductId");
      if (!lastId) return null;

      const saved = localStorage.getItem("products");
      if (!saved) return null;

      const list = JSON.parse(saved);
      return list.find((p: Product) => p.id === lastId) || null;
    } catch {
      return null;
    }
  });

  /* ----------------------------------------
   * 2. UI STATES
   ---------------------------------------- */

  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info" | "warning";
    message: string;
  } | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);

  /* ----------------------------------------
   * 3. SISTEMA DE NOTIFICAÇÕES
   ---------------------------------------- */

  const showNotification = (
    type: "success" | "error" | "info" | "warning",
    message: string
  ) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  /* ----------------------------------------
   * 4. SALVAMENTO COM DEBOUNCE + PROTEÇÃO
   ---------------------------------------- */

  const productsSaveTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const historySaveTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const isFirstRenderProducts = React.useRef(true);
  const isFirstRenderHistory = React.useRef(true);

  //  SALVAMENTO DE PRODUTOS COM DEBOUNCE (1 segundo)
  useEffect(() => {
    if (isFirstRenderProducts.current) {
      isFirstRenderProducts.current = false;
      return;
    }

    if (productsSaveTimeout.current) {
      clearTimeout(productsSaveTimeout.current);
    }

    productsSaveTimeout.current = setTimeout(() => {
      try {
        setIsSaving(true);

        const dataToSave = JSON.stringify(products);
        const sizeInKB = new Blob([dataToSave]).size / 1024;

        if (sizeInKB > 1024) {
          console.warn(`️ Products está grande: ${sizeInKB.toFixed(0)}KB`);
        }

        localStorage.setItem("products", dataToSave);
        setLastSaveTime(new Date());

        setTimeout(() => setIsSaving(false), 300);
      } catch (error: any) {
        if (error?.name === "QuotaExceededError") {
          showNotification(
            "error",
            "Espaço esgotado! Exclua produtos antigos."
          );
        } else {
          showNotification("error", "Erro ao salvar produtos!");
        }
        setIsSaving(false);
      }
    }, 1000);

    return () => {
      if (productsSaveTimeout.current) {
        clearTimeout(productsSaveTimeout.current);
      }
    };
  }, [products]);

  //  SALVAMENTO DE HISTÓRICO COM DEBOUNCE (1 segundo)
  useEffect(() => {
    if (isFirstRenderHistory.current) {
      isFirstRenderHistory.current = false;
      return;
    }

    if (historySaveTimeout.current) {
      clearTimeout(historySaveTimeout.current);
    }

    historySaveTimeout.current = setTimeout(() => {
      try {
        setIsSaving(true);

        const dataToSave = JSON.stringify(history);
        const sizeInKB = new Blob([dataToSave]).size / 1024;

        if (sizeInKB > 1024) {
          console.warn(`️ History está grande: ${sizeInKB.toFixed(0)}KB`);
        }

        localStorage.setItem("history", dataToSave);
        setLastSaveTime(new Date());

        setTimeout(() => setIsSaving(false), 300);
      } catch (error: any) {
        if (error?.name === "QuotaExceededError") {
          showNotification(
            "error",
            "Espaço esgotado! Exclua campanhas antigas."
          );
        } else {
          showNotification("error", "Erro ao salvar histórico!");
        }
        setIsSaving(false);
      }
    }, 1000);

    return () => {
      if (historySaveTimeout.current) {
        clearTimeout(historySaveTimeout.current);
      }
    };
  }, [history]);

  // Salvamento leve (sem debounce - é só 1 string)
  useEffect(() => {
    localStorage.setItem("lastActiveTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    currentProduct
      ? localStorage.setItem("lastProductId", currentProduct.id)
      : localStorage.removeItem("lastProductId");
  }, [currentProduct]);

  //  SALVAMENTO DOS CUSTOS FIXOS GLOBAIS (NOVA ESTRUTURA)
  useEffect(() => {
    try {
      const costsWithUpdatedTotal = {
        items: fixedCosts.items,
        total: totalFixedCosts,
      };
      localStorage.setItem("fixedCosts", JSON.stringify(costsWithUpdatedTotal));
    } catch (error) {
      console.error("Erro ao salvar custos fixos:", error);
    }
  }, [fixedCosts, totalFixedCosts]);

  // Persistir meta mensal e receita extra
  useEffect(() => {
    try {
      localStorage.setItem("monthlyTarget", String(monthlyTarget));
    } catch {}
  }, [monthlyTarget]);

  /* ----------------------------------------
   * 5. FUNÇÃO PARA GERENCIAR TROCA DE ABAS COM RESET
   ---------------------------------------- */
  const handleTabChange = (tab: string) => {
    if (tab === "mapping") {
      // Se não estiver em modo de edição, resetar o Mapping (novo cadastro)
      if (!editingProduct) {
        setMappingResetTrigger((prev) => prev + 1);
      }
    }
    setActiveTab(tab);
  };

  /* ----------------------------------------
   * 6. CONFIGURAR ATALHOS DE TECLADO
   ---------------------------------------- */
  useKeyboardShortcuts([
    {
      key: "Ctrl+1",
      description: "Ir para Dashboard",
      action: () => handleTabChange("dashboard"),
    },
    {
      key: "Ctrl+2",
      description: "Ir para Comparador",
      action: () => handleTabChange("comparator"),
    },
    {
      key: "Ctrl+3",
      description: "Ir para Relatórios",
      action: () => handleTabChange("reports"),
    },
    {
      key: "Ctrl+4",
      description: "Ir para Simulador de Escala",
      action: () => handleTabChange("scale"),
    },
    {
      key: "Ctrl+5",
      description: "Ir para Mapeamento",
      action: () => handleTabChange("mapping"),
    },
    {
      key: "Ctrl+6",
      description: "Ir para Portfólio",
      action: () => handleTabChange("portfolio"),
    },
    {
      key: "?",
      description: "Mostrar atalhos",
      action: () => setShowShortcutsHelp(true),
    },
  ]);

  /* ----------------------------------------
   * 7. VERIFICAÇÃO DE CONSISTÊNCIA E ROBUSTEZ
   ---------------------------------------- */
  useEffect(() => {
    if (currentProduct) {
      const exists = products.some((p) => p.id === currentProduct.id);

      if (!exists) {
        setCurrentProduct(null);
        localStorage.removeItem("lastProductId");

        if (activeTab === "setup" || activeTab === "analysis") {
          handleTabChange("portfolio");
        }

        showNotification(
          "warning",
          "O produto selecionado não foi encontrado e foi desmarcado."
        );
      }
    }
  }, [products, currentProduct, activeTab]);

  /* ----------------------------------------
   * 8. CRUD DE PRODUTOS
   ---------------------------------------- */

  const handleSaveProduct = (product: Product) => {
    if (!product.name || !product.nicho) {
      showNotification("error", "Produto precisa ter nome e nicho!");
      return;
    }

    setProducts((prev) => {
      const index = prev.findIndex((p) => p.id === product.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = product;
        showNotification("success", `Produto "${product.name}" atualizado!`);
        return updated;
      }

      showNotification("success", `Produto "${product.name}" criado!`);
      return [...prev, product];
    });

    setCurrentProduct(product);

    //  Limpar modo de edição após salvar
    if (editingProduct) {
      setEditingProduct(null);
    }

    if (activeTab === "mapping") {
      handleTabChange("setup");
      showNotification("info", "Configure o setup do produto.");
    }
  };

  const handleDeleteProduct = (id: string) => {
    const product = products.find((p) => p.id === id);
    const name = product?.name || "produto";

    const confirmDelete = window.confirm(
      `Excluir "${name}"?\nToda campanha associada será removida.`
    );

    if (!confirmDelete) return;

    setProducts((prev) => prev.filter((p) => p.id !== id));
    setHistory((prev) => prev.filter((h) => h.productId !== id));

    if (currentProduct?.id === id) {
      setCurrentProduct(null);
    }

    showNotification("success", `"${name}" excluído com sucesso!`);
  };

  /* ----------------------------------------
   * 9. CRUD DE CAMPANHAS
   ---------------------------------------- */

  const handleDeleteHistory = (id: number) => {
    if (!window.confirm("Excluir registro desta campanha?")) return;

    setHistory((prev) => prev.filter((h) => h.id !== id));
    showNotification("success", "Campanha excluída!");
  };

  const handleAddToHistory = (campaign: Campaign) => {
    if (!campaign.productName) {
      showNotification("error", "Campanha inválida!");
      return;
    }

    setHistory((prev) => [campaign, ...prev]);
    showNotification("success", `Campanha adicionada!`);
  };

  /* ----------------------------------------
   * 10. MUDAR ABA PELO PRODUTO
   ---------------------------------------- */

  const handleSelectProduct = (
    product: Product,
    nextTab: string = "analysis"
  ) => {
    setCurrentProduct(product);
    handleTabChange(nextTab);
    showNotification("info", `Abrindo "${product.name}"`);
  };

  // Seleciona produto sem navegar (usado no TodayPanel)
  const handleSetActiveProduct = (product: Product | null) => {
    setCurrentProduct(product);
    if (product) showNotification("info", `Produto ativo: "${product.name}"`);
  };

  /* ----------------------------------------
   * 11. CONTEXTO DA IA
   ---------------------------------------- */

  const getAIContext = () => ({
    tab: activeTab,
    productsCount: products.length,
    campaignsCount: history.length,
    currentProduct: currentProduct?.name || null,
  });

  /* ----------------------------------------
   * 12. VERIFICAR ESPAÇO DO LOCALSTORAGE
   ---------------------------------------- */

  useEffect(() => {
    try {
      const used = JSON.stringify(localStorage).length;
      const max = 5 * 1024 * 1024;
      const percent = (used / max) * 100;

      if (percent > 90) {
        showNotification(
          "warning",
          `Espaço quase cheio (${percent.toFixed(0)}%)`
        );
      }
    } catch {}
  }, []);

  /* ----------------------------------------
   * 13. EXPORTAR E IMPORTAR BACKUP
   ---------------------------------------- */

  const handleExport = () => {
    const data = {
      products: localStorage.getItem("products"),
      history: localStorage.getItem("history"),
      fixedCosts: localStorage.getItem("fixedCosts"),
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cpc-funnel-backup-${
      new Date().toISOString().split("T")[0]
    }.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";

    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (data.products) localStorage.setItem("products", data.products);
          if (data.history) localStorage.setItem("history", data.history);
          if (data.fixedCosts)
            localStorage.setItem("fixedCosts", data.fixedCosts);

          alert(" Backup restaurado! A página será recarregada.");
          window.location.reload();
        } catch (err) {
          alert(" Erro ao ler backup.");
        }
      };
      reader.readAsText(file);
    };

    input.click();
  };

  /* ----------------------------------------
   * 14. RENDER
   ---------------------------------------- */

  return (
    <CurrencyProvider>
      <AppModeProvider>
        {" "}
        <ThemeProvider>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
          {isMobile ? (
            /* ========== VERSÃO MOBILE ========== */
            <MobileLayout
              activeTab={activeTab}
              onChangeTab={handleTabChange}
              isSaving={isSaving}
              lastSaveTime={lastSaveTime}
              productsCount={products.length}
              campaignsCount={history.length}
              onExport={handleExport}
              onImport={handleImport}
            >
              <React.Suspense fallback={<RouteLoader />}>
                {activeTab === "dashboard" && (
                  <Dashboard
                    products={products}
                    history={history}
                    fixedCostsTotal={totalFixedCosts}
                    monthlyTarget={monthlyTarget}
                    onLoadSeedData={loadSeedData}
                    onClearSeedData={clearSeedData}
                    hasSeedData={hasSeedData}
                  />
                )}

                {activeTab === "comparator" && (
                  <ProFeatureLock featureName="Comparador de Produtos">
                    <ProductComparator products={products} campaigns={history} />
                  </ProFeatureLock>
                )}

                {activeTab === "mapping" && (
                  <Mapping
                    onSave={handleSaveProduct}
                    resetTrigger={mappingResetTrigger}
                    editingProduct={editingProduct}
                    setEditingProduct={setEditingProduct}
                  />
                )}

                {activeTab === "setup" && (
                  <Setup
                    product={currentProduct}
                    onUpdate={handleSaveProduct}
                    fixedCosts={fixedCosts}
                    setFixedCosts={setFixedCosts}
                    globalFixedCostsTotal={totalFixedCosts}
                    activeProductsCount={activeProductsCount}
                    monthlyTarget={monthlyTarget}
                    setMonthlyTarget={setMonthlyTarget}
                    onChangeTab={handleTabChange}
                    allProducts={products}
                    onSelectProduct={setCurrentProduct}
                  />
                )}

                {activeTab === "analysis" && (
                  <ProFeatureLock featureName="Análise Avançada de Campanhas">
                    {currentProduct ? (
                      <Analysis
                        product={currentProduct}
                        products={products}
                        history={history}
                        onAddToHistory={handleAddToHistory}
                        fixedCostsTotal={totalFixedCosts}
                        activeProductsCount={activeProductsCount}
                      />
                    ) : (
                      <EmptyState
                        message="Selecione um produto para fazer a análise."
                        onSelectFromPortfolio={() => handleTabChange("portfolio")}
                      />
                    )}
                  </ProFeatureLock>
                )}

                {activeTab === "portfolio" && (
                  <Portfolio
                    products={products}
                    history={history}
                    onDeleteProduct={handleDeleteProduct}
                    onSelectProductForAnalysis={handleSelectProduct}
                    fixedCostsTotal={totalFixedCosts}
                    editingProduct={editingProduct}
                    setEditingProduct={setEditingProduct}
                    onChangeTab={handleTabChange}
                  />
                )}

                {activeTab === "scale" && (
                  <ProFeatureLock featureName="Simulador de Escala">
                    <ScaleSimulator
                      products={products}
                      fixedCostsTotal={totalFixedCosts}
                      activeProductsCount={activeProductsCount}
                    />
                  </ProFeatureLock>
                )}

                {activeTab === "manual" && <Manual />}
              </React.Suspense>
            </MobileLayout>
          ) : (
            /* ========== VERSÃO DESKTOP ========== */
            <Layout
              activeTab={activeTab}
              onChangeTab={handleTabChange}
              isSaving={isSaving}
              lastSaveTime={lastSaveTime}
              onOpenCommandPalette={() => setCmdPaletteOpen(true)}
              onOpenApiSettings={() => setApiKeyModalOpen(true)}
              userName={userName}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
                >
                  <React.Suspense fallback={<RouteLoader />}>
                    {activeTab === "hoje" && (
                      <TodayPanel
                        products={products}
                        history={history}
                        currentProduct={currentProduct}
                        fixedCosts={fixedCosts}
                        fixedCostsTotal={totalFixedCosts}
                        onChangeTab={handleTabChange}
                        onSelectProduct={handleSetActiveProduct}
                        onLoadSeedData={loadSeedData}
                        onClearSeedData={clearSeedData}
                        hasSeedData={hasSeedData}
                        userName={userName}
                      />
                    )}

                    {activeTab === "dashboard" && (
                      <Dashboard
                        products={products}
                        history={history}
                        fixedCostsTotal={totalFixedCosts}
                        monthlyTarget={monthlyTarget}
                        onLoadSeedData={loadSeedData}
                        onClearSeedData={clearSeedData}
                        hasSeedData={hasSeedData}
                      />
                    )}

                    {activeTab === "comparator" && (
                      <ProFeatureLock featureName="Comparador de Produtos">
                        <ProductComparator products={products} campaigns={history} />
                      </ProFeatureLock>
                    )}

                    {activeTab === "mapping" && (
                      <Mapping
                        onSave={handleSaveProduct}
                        resetTrigger={mappingResetTrigger}
                        editingProduct={editingProduct}
                        setEditingProduct={setEditingProduct}
                      />
                    )}

                    {activeTab === "setup" && (
                      <Setup
                        product={currentProduct}
                        onUpdate={handleSaveProduct}
                        fixedCosts={fixedCosts}
                        setFixedCosts={setFixedCosts}
                        globalFixedCostsTotal={totalFixedCosts}
                        activeProductsCount={activeProductsCount}
                        monthlyTarget={monthlyTarget}
                        setMonthlyTarget={setMonthlyTarget}
                        onChangeTab={handleTabChange}
                        allProducts={products}
                        onSelectProduct={setCurrentProduct}
                      />
                    )}

                    {activeTab === "analysis" && (
                      <ProFeatureLock featureName="Análise Avançada de Campanhas">
                        {currentProduct ? (
                          <Analysis
                            product={currentProduct}
                            products={products}
                            history={history}
                            onAddToHistory={handleAddToHistory}
                            fixedCostsTotal={totalFixedCosts}
                            activeProductsCount={activeProductsCount}
                          />
                        ) : (
                          <EmptyState
                            message="Selecione um produto para fazer a análise."
                            onSelectFromPortfolio={() => handleTabChange("portfolio")}
                          />
                        )}
                      </ProFeatureLock>
                    )}

                    {activeTab === "portfolio" && (
                      <Portfolio
                        products={products}
                        history={history}
                        onDeleteProduct={handleDeleteProduct}
                        onSelectProductForAnalysis={handleSelectProduct}
                        fixedCostsTotal={totalFixedCosts}
                        editingProduct={editingProduct}
                        setEditingProduct={setEditingProduct}
                        onChangeTab={handleTabChange}
                      />
                    )}

                    {activeTab === "scale" && (
                      <ProFeatureLock featureName="Simulador de Escala">
                        <ScaleSimulator
                          products={products}
                          fixedCostsTotal={totalFixedCosts}
                          activeProductsCount={activeProductsCount}
                        />
                      </ProFeatureLock>
                    )}

                    {activeTab === "manual" && <Manual />}
                  </React.Suspense>
                </motion.div>
              </AnimatePresence>
            </Layout>
          )}

          {/* Toast de Notificações */}
          {notification && (
            <Toast
              type={notification.type === "warning" ? "warn" : notification.type as any}
              message={notification.message}
              onClose={() => setNotification(null)}
            />
          )}

          {/* Command Palette */}
          <CommandPalette
            isOpen={cmdPaletteOpen}
            onClose={() => setCmdPaletteOpen(false)}
            commands={[
              { id: "hoje",       label: "Ir para Início",        group: "Navegacao", hint: "⌘1", action: () => handleTabChange("hoje") },
              { id: "dashboard",  label: "Ir para Dashboard",     group: "Navegacao", hint: "⌘2", action: () => handleTabChange("dashboard") },
              { id: "portfolio",  label: "Ir para Portfolio",     group: "Navegacao", hint: "⌘3", action: () => handleTabChange("portfolio") },
              { id: "mapping",    label: "Mapear novo produto",   group: "Acoes",               action: () => handleTabChange("mapping") },
              { id: "setup",      label: "Setup do produto",      group: "Acoes",               action: () => handleTabChange("setup") },
              { id: "analysis",   label: "Analisar campanha",     group: "Acoes",               action: () => handleTabChange("analysis") },
              { id: "scale",      label: "Simulador de escala",   group: "Ferramentas",          action: () => handleTabChange("scale") },
              { id: "export",     label: "Exportar backup",       group: "Sistema",              action: handleExport },
              { id: "import",     label: "Importar backup",       group: "Sistema",              action: handleImport },
              { id: "manual",     label: "Ver manual",            group: "Ajuda",                action: () => handleTabChange("manual") },
            ]}
          />

          {/* Modal de Configuração de IA */}
          {apiKeyModalOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: "rgba(10,14,26,0.60)" }}
              onClick={() => setApiKeyModalOpen(false)}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <ApiKeySettings onClose={() => setApiKeyModalOpen(false)} />
              </div>
            </div>
          )}

          {/* Botão IA - mostrar em todos os dispositivos */}
          <AIAssistant contextPrompt={JSON.stringify(getAIContext())} />

          {/* Onboarding */}
          <Onboarding
            onComplete={(name?: string) => { if (name) saveUserName(name); }}
            onSkip={() => {}}
            userName={userName}
          />

          {/* Modal de atalhos de teclado */}
          {showShortcutsHelp && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowShortcutsHelp(false)}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <KeyboardShortcutsHelp
                  shortcuts={[
                    {
                      key: "Ctrl+1",
                      description: "Dashboard",
                      action: () => {},
                    },
                    {
                      key: "Ctrl+2",
                      description: "Comparador",
                      action: () => {},
                    },
                    {
                      key: "Ctrl+3",
                      description: "Relatórios",
                      action: () => {},
                    },
                    {
                      key: "Ctrl+4",
                      description: "Simulador de Escala",
                      action: () => {},
                    },
                    {
                      key: "Ctrl+5",
                      description: "Mapeamento",
                      action: () => {},
                    },
                    {
                      key: "Ctrl+6",
                      description: "Portfólio",
                      action: () => {},
                    },
                    {
                      key: "?",
                      description: "Mostrar atalhos",
                      action: () => {},
                    },
                  ]}
                />
              </div>
            </div>
          )}
        </div>
        </ThemeProvider>
      </AppModeProvider>
    </CurrencyProvider>
  );
};

export default App;

/* ----------------------------------------
 * COMPONENTES INTERNOS
 ---------------------------------------- */

const Notification = ({
  type,
  message,
  onClose,
}: {
  type: "success" | "error" | "info" | "warning";
  message: string;
  onClose: () => void;
}) => {
  const style = {
    success: {
      bg: "bg-green-50",
      border: "border-green-500",
      text: "text-green-800",
      icon: <CheckCircle size={20} />,
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-500",
      text: "text-red-800",
      icon: <AlertCircle size={20} />,
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-500",
      text: "text-yellow-800",
      icon: <AlertCircle size={20} />,
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-500",
      text: "text-blue-800",
      icon: <Info size={20} />,
    },
  }[type];

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div
        className={`${style.bg} border-l-4 ${style.border} p-4 rounded-lg shadow-xl flex items-start gap-3`}
      >
        <div className={style.text}>{style.icon}</div>
        <p className={`${style.text} text-sm font-medium flex-1`}>{message}</p>
        <button
          onClick={onClose}
          className={`${style.text} hover:opacity-70 transition`}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

const EmptyState = ({
  message,
  onSelectFromPortfolio,
}: {
  message: string;
  onSelectFromPortfolio: () => void;
}) => (
  <div className="py-20 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300 m-4">
    <Briefcase size={64} className="text-slate-300 mx-auto mb-4" />
    <p className="font-bold text-lg mb-2">{message}</p>
    <p className="text-sm text-slate-400 mb-6">
      Selecione um produto salvo primeiro
    </p>
    <Button variant="primary" size="md" onClick={onSelectFromPortfolio}>
      Escolher Produto
    </Button>
  </div>
);

