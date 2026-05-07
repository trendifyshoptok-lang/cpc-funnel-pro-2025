import React, { useState } from "react";
import {
  LayoutDashboard,
  Sun,
  Map,
  Settings,
  BarChart2,
  Briefcase,
  TrendingUp,
  GitCompare,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Zap,
  HelpCircle,
  Bot,
} from "lucide-react";
import { useAppMode } from "../contexts/AppModeContext";
import { useCurrency } from "../contexts/CurrencyContext";
import { StatusDot } from "./ui/StatusDot";

interface LayoutProps {
  activeTab: string;
  onChangeTab: (tab: string) => void;
  isSaving: boolean;
  lastSaveTime: Date | null;
  children: React.ReactNode;
  onOpenCommandPalette?: () => void;
  onOpenApiSettings?: () => void;
  /** User's display name from onboarding — drives avatar initial and topbar greeting */
  userName?: string;
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  group?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "hoje",       label: "Início",        icon: Sun,             group: "Principal" },
  { id: "dashboard",  label: "Dashboard",     icon: LayoutDashboard, group: "Principal" },
  { id: "portfolio",  label: "Portfólio",     icon: Briefcase,       group: "Principal" },
  { id: "mapping",    label: "Mapeamento",    icon: Map,             group: "Produto" },
  { id: "setup",      label: "Setup",         icon: Settings,        group: "Produto" },
  { id: "analysis",   label: "Análise",       icon: BarChart2,       group: "Produto" },
  { id: "scale",      label: "Simulação",     icon: TrendingUp,      group: "Ferramentas" },
  { id: "comparator", label: "Comparador",    icon: GitCompare,      group: "Ferramentas" },
  { id: "manual",     label: "Manual",        icon: BookOpen,        group: "Ajuda" },
];

const PAGE_TITLES: Record<string, string> = {
  hoje:       "Início",
  dashboard:  "Dashboard",
  portfolio:  "Portfólio",
  mapping:    "Mapeamento",
  setup:      "Setup do Produto",
  analysis:   "Análise e Otimização",
  scale:      "Simulador de Escala",
  comparator: "Comparador de Produtos",
  manual:     "Manual de Uso",
};

export const Layout: React.FC<LayoutProps> = ({
  activeTab,
  onChangeTab,
  isSaving,
  lastSaveTime,
  children,
  onOpenCommandPalette,
  onOpenApiSettings,
  userName,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const { toggleMode, isPro } = useAppMode();
  const { rates, loading: ratesLoading } = useCurrency();

  const groups = Array.from(new Set(NAV_ITEMS.map((i) => i.group)));
  const sidebarW = collapsed ? 64 : 232;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-app)" }}>

      {/* ─── SIDEBAR ─────────────────────────────────── */}
      <aside
        className="sidebar-dark flex-shrink-0 flex flex-col overflow-hidden scrollbar-hide"
        style={{
          width: sidebarW,
          transition: `width var(--motion-base) var(--ease-out)`,
          borderRight: "1px solid rgba(255,255,255,0.06)",
          background: "linear-gradient(180deg, #0F172A 0%, #1a2540 60%, #1E293B 100%)",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 px-3 flex-shrink-0"
          style={{
            height: 52,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            overflow: "hidden",
          }}
        >
          {/* Icon mark */}
          <div
            className="flex-shrink-0 flex items-center justify-center rounded-xl"
            style={{
              width: 32,
              height: 32,
              background: "linear-gradient(135deg, #0E7490 0%, #0891B2 100%)",
              boxShadow: "0 0 16px rgba(14,116,144,0.50), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            <Zap size={15} className="text-white" />
          </div>

          {!collapsed && (
            <div className="flex flex-col min-w-0 overflow-hidden gap-0.5">
              <div className="flex items-center gap-1.5">
                <span
                  className="text-white font-black text-[13px] leading-none uppercase tracking-tight truncate"
                  style={{ fontFamily: "var(--font-ui)", letterSpacing: "-0.02em" }}
                >
                  CPC Funnel
                </span>
                <span
                  className="flex-shrink-0 text-[8px] font-semibold uppercase px-1.5 py-0.5 rounded-md"
                  style={{
                    letterSpacing: "0.12em",
                    background: "rgba(59,130,246,0.20)",
                    color: "#93C5FD",
                    border: "1px solid rgba(59,130,246,0.30)",
                    fontFamily: "var(--font-ui)",
                  }}
                >
                  PRO
                </span>
              </div>
              <span
                className="text-[9px] font-medium truncate"
                style={{ color: "rgba(255,255,255,0.28)", fontFamily: "var(--font-ui)", letterSpacing: "0.02em" }}
              >
                Gerenciador de Campanhas
              </span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav
          className="flex-1 overflow-y-auto py-3 scrollbar-hide"
          style={{ padding: "12px 8px" }}
        >
          {groups.map((group) => {
            const items = NAV_ITEMS.filter((i) => i.group === group);
            return (
              <div key={group} className="mb-4">
                {!collapsed && (
                  <p
                    className="px-2.5 mb-1"
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: 9,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.14em",
                      color: "rgba(250,250,249,0.22)",
                    }}
                  >
                    {group}
                  </p>
                )}
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onChangeTab(item.id)}
                      title={collapsed ? item.label : undefined}
                      className={`nav-item w-full ${isActive ? "nav-item-active" : ""} ${
                        collapsed ? "justify-center" : ""
                      }`}
                    >
                      <span
                        className="flex-shrink-0"
                        style={{
                          color: isActive
                            ? "var(--accent-glow)"
                            : "rgba(250,250,249,0.40)",
                          transition: "color var(--motion-fast) var(--ease-out)",
                          display: "flex",
                        }}
                      >
                        <Icon size={15} />
                      </span>
                      {!collapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          className="flex-shrink-0"
          style={{ borderTop: "1px solid var(--border-dark)" }}
        >
          {/* Status indicator */}
          {!collapsed && (
            <div className="flex items-center justify-between px-3 py-2">
              <StatusDot
                status={isSaving ? "warn" : "live"}
                label={isSaving ? "Salvando" : "Sincronizado"}
              />
              {lastSaveTime && (
                <span
                  className="tnum"
                  style={{ fontSize: 10, color: "rgba(250,250,249,0.25)", fontFamily: "var(--font-mono)" }}
                >
                  {lastSaveTime.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
          )}

          {/* Mode toggle */}
          {!collapsed && (
            <div className="px-2 pb-2">
              <button
                onClick={toggleMode}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] font-semibold transition-all"
                style={{
                  fontFamily: "var(--font-ui)",
                  background: isPro
                    ? "rgba(139,92,246,0.12)"
                    : "rgba(34,211,238,0.08)",
                  color: isPro ? "#A78BFA" : "rgba(250,250,249,0.50)",
                  border: `1px solid ${isPro ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.08)"}`,
                }}
              >
                <Zap size={11} />
                <span>{isPro ? "Modo Pro" : "Free"}</span>
                <ChevronDown size={9} className="ml-auto" />
              </button>
            </div>
          )}

          {/* Collapse toggle */}
          <div className="px-2 pb-3">
            <button
              onClick={() => setCollapsed((c) => !c)}
              className={`nav-item w-full ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? "Expandir" : "Recolher"}
            >
              {collapsed ? <ChevronRight size={14} /> : (
                <>
                  <ChevronLeft size={14} />
                  <span>Recolher</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* ─── MAIN ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Topbar */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-5 flex-shrink-0"
          style={{
            height: 48,
            background: "var(--bg-card)",
            borderBottom: "1px solid var(--border-subtle)",
            boxShadow: "var(--shadow-xs)",
          }}
        >
          {/* Left: breadcrumb */}
          <div className="flex items-center gap-2">
            <span
              className="text-[11px] font-medium"
              style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}
            >
              CPC Funnel Pro
            </span>
            <span style={{ color: "var(--border-strong)" }}>/</span>
            <span
              className="text-[13px] font-semibold"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-ui)", letterSpacing: "-0.01em" }}
            >
              {PAGE_TITLES[activeTab] ?? activeTab}
            </span>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">

            {/* Currency pills */}
            <div className="hidden lg:flex items-center gap-1.5">
              <CurrencyPill label="USD" value={rates.USD} loading={ratesLoading} />
              <CurrencyPill label="EUR" value={rates.EUR} loading={ratesLoading} />
            </div>

            {/* Mode badge — clicável para alternar */}
            <button
              onClick={toggleMode}
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition-all"
              style={{
                letterSpacing: "0.06em",
                fontFamily: "var(--font-ui)",
                background: isPro ? "rgba(139,92,246,0.10)" : "rgba(5,150,105,0.08)",
                color: isPro ? "#7C3AED" : "#059669",
                border: `1px solid ${isPro ? "rgba(139,92,246,0.20)" : "rgba(5,150,105,0.20)"}`,
                transition: `all var(--motion-fast) var(--ease-out)`,
              }}
              title={isPro ? "Modo Pro ativo — clique para Free" : "Plano Free — clique para ativar Pro"}
            >
              <Zap size={10} />
              {isPro ? "Pro" : "Free"}
            </button>

            {/* Configurar IA */}
            {onOpenApiSettings && (
              <button
                onClick={onOpenApiSettings}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all"
                style={{
                  background: "var(--bg-subtle)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-ui)",
                  fontSize: 12,
                  transition: `all var(--motion-fast) var(--ease-out)`,
                }}
                title="Configurar Chave da IA"
              >
                <Bot size={13} />
                <span className="hidden sm:inline">IA</span>
              </button>
            )}

            {/* Help */}
            <button
              onClick={() => onChangeTab("manual")}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: "var(--text-muted)" }}
              title="Manual"
            >
              <HelpCircle size={15} />
            </button>

            {/* Greeting + Avatar */}
            <div className="flex items-center gap-2 ml-1">
              {userName && (
                <span
                  className="hidden md:block text-[12px] font-medium"
                  style={{ color: "var(--text-secondary)", fontFamily: "var(--font-ui)" }}
                >
                  {greeting()}, <strong style={{ color: "var(--text-primary)" }}>{userName}</strong>
                </span>
              )}
              <div
                className="flex-shrink-0 flex items-center justify-center rounded-full"
                style={{
                  width: 26,
                  height: 26,
                  background: "linear-gradient(135deg, var(--accent) 0%, #6366F1 100%)",
                }}
                title={userName ? `${greeting()}, ${userName}` : "CPC Funnel Pro"}
              >
                <span
                  className="text-white font-bold"
                  style={{ fontSize: 10, fontFamily: "var(--font-ui)" }}
                >
                  {userName ? userName.charAt(0).toUpperCase() : "CP"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto" data-scroll-area>
          <div className="p-5">{children}</div>
        </main>
      </div>
    </div>
  );
};

/* ─── Currency Pill ─── */
const CurrencyPill: React.FC<{
  label: string;
  value: number;
  loading: boolean;
}> = ({ label, value, loading }) => (
  <div
    className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold"
    style={{
      background: "var(--bg-subtle)",
      border: "1px solid var(--border-subtle)",
      color: "var(--text-secondary)",
      fontFamily: "var(--font-ui)",
    }}
  >
    <span style={{ color: "var(--text-muted)" }}>{label}</span>
    {loading ? (
      <span style={{ color: "var(--border-strong)" }}>—</span>
    ) : (
      <span className="tnum" style={{ color: "var(--text-primary)" }}>
        R$ {value.toFixed(2)}
      </span>
    )}
  </div>
);
