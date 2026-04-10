import React, { useEffect, useState } from 'react';
import { Icons, MACHINE_TYPE_LABELS } from '../constants';
import { api } from '../api';
import { MachineEditor } from './MachineEditor';
import { ToastMessage } from '../types';

interface MachinesProps {
  currentUser: string;
  addToast: (msg: string, type: ToastMessage['type']) => void;
}

export const Machines: React.FC<MachinesProps> = ({ currentUser, addToast }) => {
  const [machines, setMachines] = useState<any[]>([]);
  const [statsMap, setStatsMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMachine, setExpandedMachine] = useState<string | null>(null);

  // Editor state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [machineList, stats] = await Promise.all([
        api.machines.list(),
        api.machines.stats().catch(() => []),
      ]);
      setMachines(machineList);
      const map: Record<string, any> = {};
      stats.forEach((s: any) => { map[s.machine_id] = s; });
      setStatsMap(map);
    } catch {
      addToast('Failed to load machines', 'error');
    } finally {
      setLoading(false);
    }
  }

  function openNewMachine() {
    setEditingMachine(null);
    setEditorOpen(true);
  }

  function openEditMachine(machine: any) {
    setEditingMachine(machine);
    setEditorOpen(true);
  }

  async function handleSave(data: any) {
    setSaving(true);
    // Safety timeout so the Save button never gets stuck disabled
    const timeoutId = setTimeout(() => {
      setSaving(false);
      addToast('Save is taking longer than expected — check your connection', 'warning');
    }, 20000);
    try {
      if (editingMachine) {
        await api.machines.update(editingMachine.id, { ...data, userEmail: currentUser });
        addToast(`${data.name} updated`, 'success');
      } else {
        await api.machines.create({ ...data, userEmail: currentUser });
        addToast(`${data.name} added`, 'success');
      }
      setEditorOpen(false);
      loadData();
    } catch (err: any) {
      addToast(`Failed to save: ${err.message}`, 'error');
    } finally {
      clearTimeout(timeoutId);
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await api.machines.delete(id, currentUser);
      addToast('Machine deleted', 'success');
      setEditorOpen(false);
      loadData();
    } catch (err: any) {
      addToast(`Failed to delete: ${err.message}`, 'error');
    }
  }

  const filteredMachines = machines.filter((m) => {
    const matchesType = typeFilter === 'all' || m.type === typeFilter;
    const matchesSearch = !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  function getStatusInfo(machine: any) {
    if (machine.status === 'down') {
      return { label: 'Machine Down', color: 'bg-red-50 text-red-600 border-red-200' };
    }
    const stat = statsMap[machine.machine_id];
    if (!stat || stat.record_count === 0) {
      return { label: 'No Records', color: 'bg-slate-50 text-slate-600 border-slate-200' };
    }
    const avg = stat.avg_completion;
    if (avg >= 90) return { label: 'Good', color: 'bg-green-50 text-green-600 border-green-200' };
    if (avg >= 70) return { label: 'Fair', color: 'bg-orange-50 text-orange-600 border-orange-200' };
    return { label: 'Needs Attention', color: 'bg-red-50 text-red-600 border-red-200' };
  }

  return (
    <div className="view-transition space-y-4">
      {/* Filters + Add button */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Icons.Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search machines..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-mac-accent focus:ring-2 focus:ring-mac-accent/20 outline-none"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:border-mac-accent focus:ring-2 focus:ring-mac-accent/20 outline-none"
        >
          <option value="all">All Types</option>
          <option value="cnc-lathe">CNC Lathes</option>
          <option value="manual-lathe">Manual Lathes</option>
          <option value="cnc-mill">CNC Mills</option>
          <option value="manual-mill">Manual Mills</option>
        </select>
        <button
          onClick={openNewMachine}
          className="px-4 py-2 bg-mac-navy hover:bg-mac-blue text-white font-bold rounded-lg text-sm transition-all shadow-sm"
        >
          + Add Machine
        </button>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border-l-4 border-l-mac-accent shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{filteredMachines.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border-l-4 border-l-green-500 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">CNC</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">
            {filteredMachines.filter((m) => m.type.startsWith('cnc')).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border-l-4 border-l-slate-300 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Manual</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">
            {filteredMachines.filter((m) => m.type.startsWith('manual')).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border-l-4 border-l-red-500 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Down</div>
          <div className="text-2xl font-bold text-red-600 mt-1">
            {filteredMachines.filter((m) => m.status === 'down').length}
          </div>
        </div>
      </div>

      {/* Machine Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? [...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
                <div className="h-5 bg-slate-200 rounded w-32 mb-3" />
                <div className="h-3 bg-slate-200 rounded w-20 mb-2" />
                <div className="h-3 bg-slate-200 rounded w-24 mb-2" />
                <div className="h-3 bg-slate-200 rounded w-16" />
              </div>
            ))
          : filteredMachines.map((machine) => {
              const stat = statsMap[machine.machine_id];
              const statusInfo = getStatusInfo(machine);
              const isExpanded = expandedMachine === machine.machine_id;
              const weeklyCount = (machine.weekly_tasks || []).length;
              const monthlyCount = (machine.monthly_tasks || []).length;

              return (
                <div
                  key={machine.id}
                  className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${
                    machine.status === 'down' ? 'border-red-200' : 'border-slate-200'
                  }`}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-slate-800 text-sm">{machine.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Type</span>
                        <span className="font-medium text-slate-700">{MACHINE_TYPE_LABELS[machine.type] || machine.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Weekly Tasks</span>
                        <span className="font-mono text-slate-600">{weeklyCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Monthly Tasks</span>
                        <span className="font-mono text-slate-600">{monthlyCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Avg Completion</span>
                        <span className={`font-mono font-bold ${
                          !stat || stat.record_count === 0 ? 'text-slate-400'
                            : stat.avg_completion >= 90 ? 'text-green-600'
                              : stat.avg_completion >= 70 ? 'text-orange-600'
                                : 'text-red-600'
                        }`}>
                          {stat ? `${Math.round(stat.avg_completion)}%` : '—'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Last Maintenance</span>
                        <span className="font-mono text-xs text-slate-500">
                          {stat?.last_maintenance
                            ? new Date(stat.last_maintenance).toLocaleDateString()
                            : 'Never'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="border-t border-slate-100 px-5 py-3 bg-slate-50/50 flex justify-between items-center">
                    <button
                      onClick={() => setExpandedMachine(isExpanded ? null : machine.machine_id)}
                      className="text-xs text-mac-accent hover:underline font-medium"
                    >
                      {isExpanded ? 'Hide Tasks' : 'View Tasks'}
                    </button>
                    <button
                      onClick={() => openEditMachine(machine)}
                      className="px-3 py-1.5 text-xs font-bold text-mac-accent hover:bg-blue-50 rounded-lg transition-all"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Expanded: show tasks */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 p-5 bg-slate-50/50">
                      {weeklyCount > 0 && (
                        <div className="mb-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                            Weekly Tasks ({weeklyCount})
                          </p>
                          <ul className="text-xs text-slate-600 space-y-0.5">
                            {machine.weekly_tasks.map((t: string, i: number) => (
                              <li key={i} className="truncate">- {t}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {monthlyCount > 0 && (
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                            Monthly Tasks ({monthlyCount})
                          </p>
                          <ul className="text-xs text-slate-600 space-y-0.5">
                            {machine.monthly_tasks.map((t: string, i: number) => (
                              <li key={i} className="truncate">- {t}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {(machine.video_weekly || machine.video_monthly) && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Videos</p>
                          {machine.video_weekly && (
                            <a href={machine.video_weekly} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-mac-accent hover:underline mb-1">
                              <Icons.Play className="w-3 h-3" /> Weekly: {machine.video_weekly}
                            </a>
                          )}
                          {machine.video_monthly && (
                            <a href={machine.video_monthly} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-mac-accent hover:underline">
                              <Icons.Play className="w-3 h-3" /> Monthly: {machine.video_monthly}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
      </div>

      {/* Machine Editor Modal */}
      <MachineEditor
        open={editorOpen}
        machine={editingMachine}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={() => setEditorOpen(false)}
        saving={saving}
      />
    </div>
  );
};
