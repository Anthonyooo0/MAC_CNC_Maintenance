import React, { useState, useMemo, useEffect } from 'react';
import { Icons, MACHINE_TYPE_LABELS } from '../constants';
import { Frequency, ToastMessage } from '../types';
import { api } from '../api';
import { EmptyState } from './EmptyState';
import { ConfirmDialog } from './ConfirmDialog';

interface ChecklistsProps {
  currentUser: string;
  addToast: (msg: string, type: ToastMessage['type']) => void;
}

export const Checklists: React.FC<ChecklistsProps> = ({ currentUser, addToast }) => {
  const [machines, setMachines] = useState<any[]>([]);
  const [loadingMachines, setLoadingMachines] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [freqFilter, setFreqFilter] = useState<string>('all');
  const [selectedMachineId, setSelectedMachineId] = useState<string>('');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState('');
  const [completedDate, setCompletedDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    loadMachines();
  }, []);

  async function loadMachines() {
    setLoadingMachines(true);
    try {
      const data = await api.machines.list();
      setMachines(data);
    } catch (err: any) {
      addToast('Failed to load machines', 'error');
    } finally {
      setLoadingMachines(false);
    }
  }

  const filteredMachines = useMemo(() => {
    if (typeFilter === 'all') return machines;
    return machines.filter((m) => m.type === typeFilter);
  }, [typeFilter, machines]);

  const selectedMachine = machines.find((m) => m.machine_id === selectedMachineId) || null;

  function handleTypeChange(type: string) {
    setTypeFilter(type);
    setSelectedMachineId('');
    setCheckedItems({});
  }

  function handleMachineChange(machineId: string) {
    setSelectedMachineId(machineId);
    setCheckedItems({});
    setNotes('');
  }

  function toggleItem(key: string) {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function clearAll() {
    setCheckedItems({});
    setNotes('');
    setShowClearConfirm(false);
  }

  async function saveChecklist(machine: any, frequency: Frequency, items: string[]) {
    const completedIndices: number[] = [];
    items.forEach((_, idx) => {
      if (checkedItems[`${machine.machine_id}-${frequency}-${idx}`]) {
        completedIndices.push(idx);
      }
    });

    if (completedIndices.length === 0) {
      addToast(`Please check at least one item for ${frequency} maintenance`, 'warning');
      return;
    }

    setSaving(true);
    try {
      await api.records.create({
        machine_id: machine.machine_id,
        machine_name: machine.name,
        machine_type: machine.type,
        frequency,
        operator_email: currentUser,
        completed_date: completedDate,
        completed_items: completedIndices,
        total_items: items.length,
        notes,
      });
      addToast(`${frequency} checklist saved for ${machine.name}`, 'success');
      const newChecked = { ...checkedItems };
      items.forEach((_, idx) => {
        delete newChecked[`${machine.machine_id}-${frequency}-${idx}`];
      });
      setCheckedItems(newChecked);
    } catch (err: any) {
      addToast(`Failed to save: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  }

  function renderChecklist(machine: any, frequency: Frequency, items: string[]) {
    const checkedCount = items.filter((_, idx) => checkedItems[`${machine.machine_id}-${frequency}-${idx}`]).length;
    const pct = Math.round((checkedCount / items.length) * 100);

    const videoUrl = frequency === 'weekly' ? machine.video_weekly : machine.video_monthly;

    return (
      <div key={`${machine.machine_id}-${frequency}`} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-4">
        <div className="px-5 py-4 border-b bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-slate-700 text-sm">{machine.name}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
              frequency === 'weekly'
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'bg-purple-50 text-purple-600 border-purple-200'
            }`}>
              {frequency}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-500">{checkedCount}/{items.length}</span>
            <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-green-500' : 'bg-mac-accent'}`}
                style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {items.map((item, idx) => {
            const key = `${machine.machine_id}-${frequency}-${idx}`;
            const isChecked = !!checkedItems[key];
            return (
              <label key={key}
                className={`flex items-start gap-3 px-5 py-3 cursor-pointer transition-colors ${
                  isChecked ? 'bg-green-50/50' : 'hover:bg-slate-50/50'
                }`}>
                <input type="checkbox" checked={isChecked} onChange={() => toggleItem(key)} className="mt-0.5 flex-shrink-0" />
                <span className={`text-sm ${isChecked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{item}</span>
              </label>
            );
          })}
        </div>

        {/* Video link */}
        {videoUrl && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
            <a href={videoUrl.startsWith('http') ? videoUrl : '#'} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-mac-accent hover:underline">
              <Icons.Play className="w-4 h-4" />
              <span className="font-medium">{videoUrl}</span>
            </a>
          </div>
        )}

        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button onClick={() => saveChecklist(machine, frequency, items)}
            disabled={saving}
            className="px-4 py-2 text-sm font-bold text-white bg-mac-accent hover:bg-mac-blue rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? 'Saving...' : `Save ${frequency} Checklist`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="view-transition space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Machine Type</label>
          <select value={typeFilter} onChange={(e) => handleTypeChange(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:border-mac-accent focus:ring-2 focus:ring-mac-accent/20 outline-none">
            <option value="all">All Machines</option>
            <option value="cnc-lathe">CNC Lathes</option>
            <option value="manual-lathe">Manual Lathes</option>
            <option value="cnc-mill">CNC Mills</option>
            <option value="manual-mill">Manual Mills</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Frequency</label>
          <select value={freqFilter} onChange={(e) => setFreqFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:border-mac-accent focus:ring-2 focus:ring-mac-accent/20 outline-none">
            <option value="all">All</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Machine</label>
          <select value={selectedMachineId} onChange={(e) => handleMachineChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:border-mac-accent focus:ring-2 focus:ring-mac-accent/20 outline-none">
            <option value="">Select a machine...</option>
            {filteredMachines.map((m) => (
              <option key={m.machine_id} value={m.machine_id}>
                {m.name} — {MACHINE_TYPE_LABELS[m.type] || m.type}
              </option>
            ))}
          </select>
        </div>
        {Object.keys(checkedItems).length > 0 && (
          <div className="self-end">
            <button onClick={() => setShowClearConfirm(true)}
              className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all">
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Date & Notes */}
      {selectedMachine && (
        <div className="flex items-start gap-4 flex-wrap">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Completion Date</label>
            <input type="date" value={completedDate} onChange={(e) => setCompletedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:border-mac-accent focus:ring-2 focus:ring-mac-accent/20 outline-none" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notes (optional)</label>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about this maintenance..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-mac-accent focus:ring-2 focus:ring-mac-accent/20 outline-none" />
          </div>
        </div>
      )}

      {/* Checklists */}
      {loadingMachines ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
              <div className="h-5 bg-slate-200 rounded w-40 mb-4" />
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-4 bg-slate-100 rounded w-full mb-2" />
              ))}
            </div>
          ))}
        </div>
      ) : !selectedMachine ? (
        <EmptyState
          icon={<Icons.Checklist className="w-16 h-16" />}
          title="Select a Machine"
          description="Choose a machine from the dropdown above to view its maintenance checklist."
        />
      ) : (
        <>
          {selectedMachine.status === 'down' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <Icons.Warning className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm font-bold text-red-700">This machine is currently marked as DOWN</p>
            </div>
          )}
          {(freqFilter === 'all' || freqFilter === 'weekly') &&
            selectedMachine.weekly_tasks && selectedMachine.weekly_tasks.length > 0 &&
            renderChecklist(selectedMachine, 'weekly', selectedMachine.weekly_tasks)}
          {(freqFilter === 'all' || freqFilter === 'monthly') &&
            selectedMachine.monthly_tasks && selectedMachine.monthly_tasks.length > 0 &&
            renderChecklist(selectedMachine, 'monthly', selectedMachine.monthly_tasks)}
        </>
      )}

      <ConfirmDialog open={showClearConfirm} title="Clear All Checkmarks"
        message="This will uncheck all items. Are you sure?" confirmLabel="Clear All" danger
        onConfirm={clearAll} onCancel={() => setShowClearConfirm(false)} />
    </div>
  );
};
