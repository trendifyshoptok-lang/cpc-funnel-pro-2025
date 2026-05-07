import { useState, useEffect, useCallback } from 'react';
import type { 
  DashboardConfig, 
  DashboardMode, 
  DashboardSections 
} from '../types/dashboardConfig';
import { 
  PRESET_RESUMIDA, 
  PRESET_COMPLETA, 
  PRESET_CUSTOM 
} from '../types/dashboardConfig';

const STORAGE_KEY = 'dashboard_config_v1';

// ==========================================
// CARREGAR CONFIGURAÇÃO DO LOCALSTORAGE
// ==========================================
const loadConfig = (): DashboardConfig => {
  if (typeof window === 'undefined') {
    return PRESET_RESUMIDA; // Padrão: Modo Resumida
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as DashboardConfig;
      
      // Validar que tem todas as propriedades necessárias
      if (parsed.mode && parsed.sections) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Erro ao carregar config do dashboard:', error);
  }

  return PRESET_RESUMIDA; // Fallback
};

// ==========================================
// HOOK PRINCIPAL
// ==========================================
export const useDashboardConfig = () => {
  const [config, setConfig] = useState<DashboardConfig>(loadConfig);

  // Salvar no localStorage sempre que mudar
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('Erro ao salvar config do dashboard:', error);
    }
  }, [config]);

  // ==========================================
  // APLICAR PRESET (Resumida, Completa, Custom)
  // ==========================================
  const applyPreset = useCallback((mode: DashboardMode) => {
    switch (mode) {
      case 'resumida':
        setConfig(PRESET_RESUMIDA);
        break;
      case 'completa':
        setConfig(PRESET_COMPLETA);
        break;
      case 'custom':
        setConfig(PRESET_CUSTOM);
        break;
    }
  }, []);

  // ==========================================
  // TOGGLE DE SEÇÃO INDIVIDUAL
  // ==========================================
  const toggleSection = useCallback((sectionId: keyof DashboardSections) => {
    setConfig(prev => ({
      ...prev,
      mode: 'custom', // Automaticamente vira custom ao alterar
      sections: {
        ...prev.sections,
        [sectionId]: !prev.sections[sectionId],
      }
    }));
  }, []);

  // ==========================================
  // ATUALIZAR SEÇÕES EM LOTE
  // ==========================================
  const updateSections = useCallback((newSections: Partial<DashboardSections>) => {
    setConfig(prev => ({
      ...prev,
      mode: 'custom',
      sections: {
        ...prev.sections,
        ...newSections,
      }
    }));
  }, []);

  // ==========================================
  // RESETAR PARA PADRÃO
  // ==========================================
  const resetToDefault = useCallback(() => {
    setConfig(PRESET_RESUMIDA);
  }, []);

  // ==========================================
  // EXPORTAR CONFIGURAÇÃO (JSON)
  // ==========================================
  const exportConfig = useCallback(() => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-config-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }, [config]);

  // ==========================================
  // IMPORTAR CONFIGURAÇÃO (JSON)
  // ==========================================
  const importConfig = useCallback((file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const imported = JSON.parse(text) as DashboardConfig;
        
        // Validar estrutura básica
        if (imported.mode && imported.sections) {
          setConfig(imported);
          alert(' Configuração importada com sucesso!');
        } else {
          alert(' Arquivo inválido');
        }
      } catch (error) {
        console.error('Erro ao importar config:', error);
        alert(' Erro ao ler arquivo');
      }
    };
    
    reader.readAsText(file);
  }, []);

  return {
    config,
    applyPreset,
    toggleSection,
    updateSections,
    resetToDefault,
    exportConfig,
    importConfig,
  };
};