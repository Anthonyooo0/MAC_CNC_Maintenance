import React, { useState, useEffect, useRef } from 'react';
import { Icons, getAllMachines, MACHINE_TYPE_LABELS } from '../constants';
import { ViewPage } from '../types';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (page: ViewPage) => void;
  onSelectMachine: (machineId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onClose,
  onNavigate,
  onSelectMachine,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  if (!open) return null;

  const pages: { label: string; page: ViewPage; icon: React.ReactNode }[] = [
    { label: 'Dashboard', page: 'dashboard', icon: <Icons.Dashboard className="w-4 h-4" /> },
    { label: 'Checklists', page: 'checklists', icon: <Icons.Checklist className="w-4 h-4" /> },
    { label: 'Schedule', page: 'schedule', icon: <Icons.Calendar className="w-4 h-4" /> },
    { label: 'Machines', page: 'machines', icon: <Icons.Machine className="w-4 h-4" /> },
    { label: 'Reports', page: 'reports', icon: <Icons.Report className="w-4 h-4" /> },
    { label: 'Audit Log', page: 'changelog', icon: <Icons.Changelog className="w-4 h-4" /> },
  ];

  const machines = getAllMachines();
  const q = query.toLowerCase();

  const filteredPages = pages.filter((p) => p.label.toLowerCase().includes(q));
  const filteredMachines = query.length > 0
    ? machines.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.type.toLowerCase().includes(q) ||
          MACHINE_TYPE_LABELS[m.type].toLowerCase().includes(q)
      )
    : [];

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-[20vh] backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200">
          <Icons.Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, machines..."
            className="flex-1 text-lg outline-none"
          />
          <kbd className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">ESC</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {filteredPages.length > 0 && (
            <div>
              <p className="px-6 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Pages
              </p>
              {filteredPages.map((p) => (
                <button
                  key={p.page}
                  onClick={() => { onNavigate(p.page); onClose(); }}
                  className="w-full flex items-center gap-3 px-6 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {p.icon}
                  {p.label}
                </button>
              ))}
            </div>
          )}
          {filteredMachines.length > 0 && (
            <div>
              <p className="px-6 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Machines
              </p>
              {filteredMachines.slice(0, 8).map((m) => (
                <button
                  key={m.id}
                  onClick={() => { onSelectMachine(m.id); onClose(); }}
                  className="w-full flex items-center gap-3 px-6 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Icons.Wrench className="w-4 h-4 text-slate-400" />
                  <span>{m.name}</span>
                  <span className="ml-auto text-[10px] font-mono text-slate-400">
                    {MACHINE_TYPE_LABELS[m.type]}
                  </span>
                </button>
              ))}
            </div>
          )}
          {filteredPages.length === 0 && filteredMachines.length === 0 && (
            <div className="py-8 text-center text-sm text-slate-400">No results found</div>
          )}
        </div>
      </div>
    </div>
  );
};
