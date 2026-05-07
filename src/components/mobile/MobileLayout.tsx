import React, { useState, useEffect } from 'react';
import {
  Sun,
  LayoutDashboard,
  Map,
  Settings,
  BarChart2,
  Briefcase,
  TrendingUp,
  GitCompare,
  BookOpen,
  Menu,
  X,
  Download,
  Upload,
  Clock,
  CheckCircle,
  Zap,
  ChevronRight,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface MobileLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onChangeTab: (tab: string) => void;
  isSaving?: boolean;
  lastSaveTime?: Date | null;
  productsCount?: number;
  campaignsCount?: number;
  onExport?: () => void;
  onImport?: () => void;
}

// ── Hook: detect mobile ────────────────────────────────────────────────────────

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return isMobile;
};

// ── Navigation config (IDs must match App.tsx) ────────────────────────────────

const ALL_TABS = [
  { id: 'hoje',       label: 'Início',      icon: Sun,           group: 'Principal' },
  { id: 'dashboard',  label: 'Dashboard',   icon: LayoutDashboard, group: 'Principal' },
  { id: 'portfolio',  label: 'Portfólio',   icon: Briefcase,     group: 'Principal' },
  { id: 'mapping',    label: 'Mapeamento',  icon: Map,           group: 'Produto'   },
  { id: 'setup',      label: 'Setup',       icon: Settings,      group: 'Produto'   },
  { id: 'analysis',   label: 'Análise',     icon: BarChart2,     group: 'Produto'   },
  { id: 'scale',      label: 'Simulação',   icon: TrendingUp,    group: 'Ferramentas' },
  { id: 'comparator', label: 'Comparador',  icon: GitCompare,    group: 'Ferramentas' },
  { id: 'manual',     label: 'Manual',      icon: BookOpen,      group: 'Ajuda'     },
];

const BOTTOM_NAV = [
  { id: 'hoje',      label: 'Início',   icon: Sun },
  { id: 'mapping',   label: 'Mapear',   icon: Map },
  { id: 'portfolio', label: 'Produtos', icon: Briefcase },
  { id: 'analysis',  label: 'Análise',  icon: BarChart2 },
  { id: 'menu',      label: 'Menu',     icon: Menu },
];

const PAGE_LABELS: Record<string, string> = {
  hoje:       'Início',
  dashboard:  'Dashboard',
  portfolio:  'Portfólio',
  mapping:    'Mapeamento',
  setup:      'Setup',
  analysis:   'Análise',
  scale:      'Simulação',
  comparator: 'Comparador',
  manual:     'Manual',
};

const GROUP_ORDER = ['Principal', 'Produto', 'Ferramentas', 'Ajuda'];

// ── Component ──────────────────────────────────────────────────────────────────

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  activeTab,
  onChangeTab,
  isSaving,
  lastSaveTime,
  productsCount = 0,
  campaignsCount = 0,
  onExport,
  onImport,
}) => {
  const isMobile = useIsMobile();
  const [showMenu, setShowMenu] = useState(false);

  // Always force light theme — Clean Pro doesn't support dark mode
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('darkMode');
  }, []);

  const handleTabClick = (tabId: string) => {
    if (tabId === 'menu') {
      setShowMenu(true);
    } else {
      onChangeTab(tabId);
      setShowMenu(false);
    }
  };

  // Desktop: let Layout.tsx render normally
  if (!isMobile) return <>{children}</>;

  const currentLabel = PAGE_LABELS[activeTab] ?? 'CPC Funnel Pro';

  // Group menu tabs
  const groupedTabs = GROUP_ORDER.map(group => ({
    group,
    tabs: ALL_TABS.filter(t => t.group === group),
  }));

  return (
    <div className="min-h-dvh bg-slate-50">

      {/* ── Mobile Header (Clean Pro Dark Navy) ──────────────────────────── */}
      <header className="sticky top-0 z-30 overflow-hidden" style={{ background: 'linear-gradient(135deg, #0A0E1A 0%, #0E2233 55%, #0A1628 100%)' }}>

        {/* Dot matrix texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(34,211,238,0.06) 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        />

        {/* Top row — Logo + Save indicator + Actions */}
        <div className="relative flex items-center justify-between px-4 pt-4 pb-3">

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.25)' }}
            >
              <Zap size={15} style={{ color: '#22D3EE' }} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-white tracking-tight leading-none">CPC FUNNEL</span>
                <span
                  className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest leading-none"
                  style={{ background: 'rgba(34,211,238,0.20)', color: '#22D3EE', border: '1px solid rgba(34,211,238,0.30)' }}
                >
                  PRO
                </span>
              </div>
              {/* Current page breadcrumb */}
              <p className="text-[10px] font-medium mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {currentLabel}
              </p>
            </div>
          </div>

          {/* Right: save status + quick-actions */}
          <div className="flex items-center gap-2">
            {/* Save indicator */}
            {isSaving && (
              <div
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.60)' }}
              >
                <Clock size={10} className="animate-spin" />
                <span>Salvando</span>
              </div>
            )}
            {!isSaving && lastSaveTime && (
              <div
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(52,211,153,0.85)' }}
              >
                <CheckCircle size={10} />
                <span>{lastSaveTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            )}

            {/* Quick actions (export/import) */}
            <button
              onClick={onExport}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-95"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
              aria-label="Exportar dados"
            >
              <Download size={14} style={{ color: 'rgba(255,255,255,0.65)' }} />
            </button>
            <button
              onClick={onImport}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-95"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
              aria-label="Importar dados"
            >
              <Upload size={14} style={{ color: 'rgba(255,255,255,0.65)' }} />
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="relative grid grid-cols-2 gap-2 px-4 pb-3.5">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}
          >
            <Briefcase size={13} style={{ color: 'rgba(34,211,238,0.70)' }} />
            <div>
              <div className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.40)' }}>Produtos</div>
              <div className="text-base font-black text-white leading-tight tabular-nums">{productsCount}</div>
            </div>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}
          >
            <BarChart2 size={13} style={{ color: 'rgba(96,165,250,0.70)' }} />
            <div>
              <div className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.40)' }}>Campanhas</div>
              <div className="text-base font-black text-white leading-tight tabular-nums">{campaignsCount}</div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ────────────────────────────────────────────────────── */}
      <main className="pb-[72px] min-h-[calc(100dvh-180px)] bg-slate-50">
        {children}
      </main>

      {/* ── Bottom Navigation ────────────────────────────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 shadow-[0_-1px_8px_rgba(0,0,0,0.06)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex justify-around items-center px-1 py-1.5">
          {BOTTOM_NAV.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => handleTabClick(id)}
                className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all duration-150 relative min-h-[48px] ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-slate-400 active:bg-slate-100'
                }`}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-blue-600 rounded-b-full" />
                )}
                <Icon size={20} className={`transition-transform duration-150 ${isActive ? 'scale-110' : 'scale-100'}`} />
                <span className={`text-[10px] font-semibold mt-0.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Full Menu Drawer ──────────────────────────────────────────────────── */}
      {showMenu && (
        <div className="fixed inset-0 z-50 animate-in fade-in duration-200">
          {/* Scrim */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMenu(false)}
          />

          {/* Slide-in panel */}
          <div className="absolute inset-y-0 right-0 w-full max-w-[320px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-250">

            {/* Menu header — dark navy matching main header */}
            <div
              className="relative px-5 py-5 overflow-hidden flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #0A0E1A 0%, #0E2233 55%, #0A1628 100%)' }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(circle, rgba(34,211,238,0.05) 1px, transparent 1px)',
                  backgroundSize: '18px 18px',
                }}
              />
              <div className="relative flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Zap size={14} style={{ color: '#22D3EE' }} />
                    <span className="text-sm font-black text-white tracking-tight">CPC FUNNEL PRO</span>
                  </div>
                  <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.40)' }}>Navegação completa</p>
                </div>
                <button
                  onClick={() => setShowMenu(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-95"
                  style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.15)' }}
                  aria-label="Fechar menu"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>
            </div>

            {/* Nav groups */}
            <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
              {groupedTabs.map(({ group, tabs }) => (
                <div key={group}>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-2 mb-1.5">{group}</p>
                  <div className="space-y-0.5">
                    {tabs.map(({ id, label, icon: Icon }) => {
                      const isActive = activeTab === id;
                      return (
                        <button
                          key={id}
                          onClick={() => handleTabClick(id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-700 hover:bg-slate-100 active:bg-slate-100'
                          }`}
                        >
                          <Icon size={16} className={isActive ? 'text-white' : 'text-slate-500'} />
                          <span className="text-sm font-semibold flex-1 text-left">{label}</span>
                          {isActive
                            ? <div className="w-1.5 h-1.5 bg-white/60 rounded-full" />
                            : <ChevronRight size={14} className="text-slate-300" />
                          }
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Data actions */}
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-2 mb-1.5">Dados</p>
                <div className="space-y-0.5">
                  <button
                    onClick={() => { onExport?.(); setShowMenu(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 active:bg-slate-100 transition-colors"
                  >
                    <Download size={16} className="text-slate-500" />
                    <span className="text-sm font-semibold flex-1 text-left">Exportar Backup</span>
                    <ChevronRight size={14} className="text-slate-300" />
                  </button>
                  <button
                    onClick={() => { onImport?.(); setShowMenu(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 active:bg-slate-100 transition-colors"
                  >
                    <Upload size={16} className="text-slate-500" />
                    <span className="text-sm font-semibold flex-1 text-left">Importar Backup</span>
                    <ChevronRight size={14} className="text-slate-300" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
