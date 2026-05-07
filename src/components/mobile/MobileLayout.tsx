import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Search,
  Settings,
  BarChart3,
  Briefcase,
  TrendingUp,
  Menu,
  X,
  Download,
  Upload,
  Database,
  CheckCircle,
  Clock,
  Package,
  DollarSign,
  Moon,
  Sun
} from 'lucide-react';

// ==========================================
// TIPOS
// ==========================================

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

// ==========================================
// HOOK: Detectar dispositivo mobile
// ==========================================

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobile(width < 768 || isTouchDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

// ==========================================
// HOOK: Dark Mode
// ==========================================

const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('darkMode', String(isDark));
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return { isDark, toggleDark: () => setIsDark(!isDark) };
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  activeTab,
  onChangeTab,
  isSaving,
  lastSaveTime,
  productsCount = 0,
  campaignsCount = 0,
  onExport,
  onImport
}) => {
  const isMobile = useIsMobile();
  const { isDark, toggleDark } = useDarkMode();
  const [showMenu, setShowMenu] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Tabs disponíveis
  const allTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, emoji: '' },
    { id: 'mapping', label: 'Mapeamento', icon: Search, emoji: '' },
    { id: 'setup', label: 'Setup', icon: Settings, emoji: '️' },
    { id: 'analysis', label: 'Análise', icon: BarChart3, emoji: '' },
    { id: 'portfolio', label: 'Portfólio', icon: Briefcase, emoji: '' },
    { id: 'scale', label: 'Escala', icon: TrendingUp, emoji: '' },
    { id: 'comparator', label: 'Comparador', icon: BarChart3, emoji: '️' },
    { id: 'reports', label: 'Relatórios', icon: BarChart3, emoji: '' },
    { id: 'history', label: 'Histórico', icon: BarChart3, emoji: '' },
    { id: 'manual', label: 'Manual', icon: Settings, emoji: '' }
  ];

  // Bottom Navigation (4 principais + Menu)
  const bottomNavTabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'mapping', label: 'Mapear', icon: Search },
    { id: 'portfolio', label: 'Produtos', icon: Briefcase },
    { id: 'scale', label: 'Escalar', icon: TrendingUp },
    { id: 'menu', label: 'Menu', icon: Menu }
  ];

  const handleTabClick = (tabId: string) => {
    if (tabId === 'menu') {
      setShowMenu(true);
    } else {
      onChangeTab(tabId);
      setShowMenu(false);
    }
  };

  // Renderização condicional: Mobile ou Desktop
  if (!isMobile) {
    // Desktop: renderizar children normalmente (Layout.tsx existente)
    return <>{children}</>;
  }

  // ==========================================
  // MOBILE LAYOUT
  // ==========================================

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-800 shadow-lg">
          <div className="px-4 py-3">
            {/* Top Row */}
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                  <Database size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-black text-white">
                    CPC & Funnel Pro
                  </h1>
                  <p className="text-xs text-indigo-100">v4.0 Mobile</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleDark}
                  className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  {isDark ? <Sun size={20} className="text-white" /> : <Moon size={20} className="text-white" />}
                </button>
                
                <button
                  onClick={() => setShowQuickActions(!showQuickActions)}
                  className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <Settings size={20} className="text-white" />
                </button>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2">
                <Package size={16} className="text-white/80" />
                <div>
                  <div className="text-[10px] text-white/60 font-semibold">Produtos</div>
                  <div className="text-lg font-black text-white">{productsCount}</div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2">
                <BarChart3 size={16} className="text-white/80" />
                <div>
                  <div className="text-[10px] text-white/60 font-semibold">Campanhas</div>
                  <div className="text-lg font-black text-white">{campaignsCount}</div>
                </div>
              </div>
            </div>

            {/* Saving Indicator */}
            {isSaving && (
              <div className="mt-2 flex items-center gap-2 text-xs text-white/90 bg-white/10 px-3 py-1.5 rounded-full">
                <Clock size={12} className="animate-spin" />
                <span>Salvando...</span>
              </div>
            )}

            {!isSaving && lastSaveTime && (
              <div className="mt-2 flex items-center gap-2 text-xs text-white/80 bg-white/10 px-3 py-1.5 rounded-full">
                <CheckCircle size={12} className="text-green-300" />
                <span>
                  Salvo {lastSaveTime.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Quick Actions Drawer */}
        {showQuickActions && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setShowQuickActions(false)}
          >
            <div 
              className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl p-6 animate-in slide-in-from-bottom duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6" />
              
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                Ações Rápidas
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    onExport?.();
                    setShowQuickActions(false);
                  }}
                  className="flex flex-col items-center gap-2 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                >
                  <Download size={24} className="text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Backup
                  </span>
                </button>

                <button
                  onClick={() => {
                    onImport?.();
                    setShowQuickActions(false);
                  }}
                  className="flex flex-col items-center gap-2 p-4 bg-purple-50 dark:bg-purple-900/30 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                >
                  <Upload size={24} className="text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Restaurar
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="pb-20 min-h-[calc(100vh-180px)]">
          {children}
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-30 safe-area-bottom shadow-lg">
          <div className="flex justify-around items-center px-2 py-2">
            {bottomNavTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-xl transition-all relative ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                      : 'text-gray-500 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-700'
                  }`}
                >
                  <Icon 
                    size={22} 
                    className={`mb-1 transition-transform ${
                      isActive ? 'scale-110' : 'scale-100'
                    }`}
                  />
                  <span className="text-[10px] font-semibold">{tab.label}</span>
                  
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-t-full" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Menu Lateral Fullscreen */}
        {showMenu && (
          <div className="fixed inset-0 z-50 animate-in fade-in duration-200">
            {/* Overlay */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowMenu(false)}
            />
            
            {/* Menu Panel */}
            <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-gray-800 shadow-2xl animate-in slide-in-from-right duration-300">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-xl font-black">Menu Completo</h2>
                    <p className="text-sm text-indigo-100">Todas as funcionalidades</p>
                  </div>
                  <button
                    onClick={() => setShowMenu(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Menu Items */}
              <div className="overflow-y-auto h-[calc(100vh-120px)] p-4">
                <div className="space-y-2">
                  {allTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-lg scale-105'
                            : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 active:scale-95'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          isActive ? 'bg-white/20' : 'bg-white dark:bg-gray-600'
                        }`}>
                          <span className="text-2xl">{tab.emoji}</span>
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-bold">{tab.label}</div>
                        </div>
                        {isActive && (
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PWA Install Prompt (bonus) */}
      <style>{`
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
        
        @supports (-webkit-touch-callout: none) {
          .safe-area-bottom {
            padding-bottom: max(env(safe-area-inset-bottom), 8px);
          }
        }
      `}</style>
    </div>
  );
};