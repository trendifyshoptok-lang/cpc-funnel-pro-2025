import { useEffect } from 'react';

export type ShortcutKey = 
  | 'Ctrl+1' | 'Ctrl+2' | 'Ctrl+3' | 'Ctrl+4' | 'Ctrl+5'
  | 'Ctrl+6' | 'Ctrl+7' | 'Ctrl+8' | 'Ctrl+9'
  | 'Ctrl+D' | 'Ctrl+C' | 'Ctrl+R' | 'Ctrl+S'
  | 'Ctrl+N' | 'Ctrl+F' | 'Ctrl+H'
  | '?'; // Help

interface ShortcutConfig {
  key: ShortcutKey;
  description: string;
  action: () => void;
}

export const useKeyboardShortcuts = (shortcuts: ShortcutConfig[]) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar se estiver digitando em input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      let shortcutKey = '';

      if (e.ctrlKey || e.metaKey) {
        shortcutKey = `Ctrl+${e.key.toUpperCase()}`;
      } else {
        shortcutKey = e.key;
      }

      const matchingShortcut = shortcuts.find(s => s.key === shortcutKey);

      if (matchingShortcut) {
        e.preventDefault();
        matchingShortcut.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
};

// Componente de ajuda de atalhos
export const KeyboardShortcutsHelp: React.FC<{ shortcuts: ShortcutConfig[] }> = ({ shortcuts }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg max-w-md">
      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
        ️ Atalhos de Teclado
      </h3>
      <div className="space-y-2">
        {shortcuts.map((shortcut, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded">
            <span className="text-sm text-slate-700">{shortcut.description}</span>
            <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-mono font-bold text-slate-700">
              {shortcut.key}
            </kbd>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-600">
         Pressione <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono">?</kbd> para ver esta ajuda novamente
      </div>
    </div>
  );
};