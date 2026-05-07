import React, { useEffect, useState, useRef } from 'react';
import { Search, ArrowRight } from 'lucide-react';

export interface PaletteCommand {
  id: string;
  label: string;
  hint?: string;
  group?: string;
  action: () => void;
}

interface CommandPaletteProps {
  commands: PaletteCommand[];
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  commands,
  isOpen,
  onClose,
}) => {
  const [query, setQuery]     = useState('');
  const [active, setActive]   = useState(0);
  const inputRef              = useRef<HTMLInputElement>(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  // Keyboard dismiss
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const filtered = commands.filter((c) => {
    const q = query.toLowerCase();
    return (
      c.label.toLowerCase().includes(q) ||
      (c.group?.toLowerCase().includes(q) ?? false)
    );
  });

  // Arrow navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown')  { e.preventDefault(); setActive((a) => Math.min(a + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp')    { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    if (e.key === 'Enter' && filtered[active]) {
      filtered[active].action();
      onClose();
    }
  };

  const groups = Array.from(new Set(filtered.map((c) => c.group ?? 'Geral')));

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] px-4"
      style={{ background: 'var(--bg-overlay)', backdropFilter: 'blur(6px)' }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg bg-white overflow-hidden tab-enter"
        style={{
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 24px 64px rgba(10,14,26,0.18), 0 0 0 1px rgba(10,14,26,0.06)',
        }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <Search size={15} className="text-stone-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Buscar comando ou página..."
            className="flex-1 outline-none text-sm bg-transparent text-stone-900 placeholder:text-stone-400"
            style={{ fontFamily: 'var(--font-body)' }}
          />
          <span className="kbd">Esc</span>
        </div>

        {/* Results */}
        <div className="max-h-[52vh] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-stone-400 py-8">
              Nenhum resultado para "<span className="text-stone-600">{query}</span>"
            </p>
          ) : (
            groups.map((group) => {
              const items = filtered.filter((c) => (c.group ?? 'Geral') === group);
              return (
                <div key={group} className="mb-1">
                  <div className="px-4 py-1.5">
                    <span
                      className="text-[10px] font-bold uppercase text-stone-400"
                      style={{ letterSpacing: '0.10em', fontFamily: 'var(--font-ui)' }}
                    >
                      {group}
                    </span>
                  </div>
                  {items.map((cmd, i) => {
                    const globalIdx = filtered.indexOf(cmd);
                    return (
                      <button
                        key={cmd.id}
                        onMouseEnter={() => setActive(globalIdx)}
                        onClick={() => { cmd.action(); onClose(); }}
                        className="w-full flex items-center justify-between px-4 py-2 text-left transition-colors duration-75"
                        style={{
                          background: active === globalIdx ? 'var(--bg-subtle)' : 'transparent',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <ArrowRight size={12} className="text-stone-300" />
                          <span className="text-[13px] font-medium text-stone-800">{cmd.label}</span>
                        </div>
                        {cmd.hint && <span className="kbd">{cmd.hint}</span>}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center gap-3 px-4 py-2.5"
          style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)' }}
        >
          <span className="text-[11px] text-stone-400">
            <span className="kbd mr-1">↑↓</span> navegar
          </span>
          <span className="text-[11px] text-stone-400">
            <span className="kbd mr-1">↵</span> abrir
          </span>
          <span className="text-[11px] text-stone-400 ml-auto">
            <span className="kbd mr-1">⌘K</span> fechar
          </span>
        </div>
      </div>
    </div>
  );
};
