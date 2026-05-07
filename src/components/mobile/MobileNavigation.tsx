import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Search,
  Settings,
  BarChart3,
  Briefcase,
  TrendingUp,
  Menu,
  X
} from 'lucide-react';

interface MobileNavigationProps {
  activeTab: string;
  onChangeTab: (tab: string) => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeTab,
  onChangeTab
}) => {
  const [showMenu, setShowMenu] = useState(false);

  // Prevenir scroll quando menu está aberto
  useEffect(() => {
    if (showMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMenu]);

  const mainTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'mapping', label: 'Mapear', icon: Search },
    { id: 'portfolio', label: 'Portfólio', icon: Briefcase },
    { id: 'scale', label: 'Escalar', icon: TrendingUp },
    { id: 'menu', label: 'Menu', icon: Menu }
  ];

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

  const handleTabClick = (tabId: string) => {
    if (tabId === 'menu') {
      setShowMenu(true);
    } else {
      onChangeTab(tabId);
      setShowMenu(false);
    }
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-bottom">
        <div className="flex justify-around items-center px-2 py-2">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg transition-all ${
                  isActive
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-500 active:bg-gray-100'
                }`}
              >
                <Icon 
                  size={24} 
                  className={`mb-1 transition-transform ${
                    isActive ? 'scale-110' : 'scale-100'
                  }`}
                />
                <span className="text-[10px] font-semibold">{tab.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-indigo-600 rounded-t-full" />
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
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-black">Menu</h2>
                  <p className="text-sm text-indigo-100">CPC & Funnel Pro</p>
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
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 active:scale-95'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        isActive ? 'bg-white/20' : 'bg-white'
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

      {/* Spacer para compensar a altura da bottom nav */}
      <div className="h-20" />
    </>
  );
};

// Hook para detectar se é mobile
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};