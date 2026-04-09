import React, { useEffect, useState } from 'react';
import { Icons, getAllMachines, MACHINE_TYPE_LABELS } from '../constants';
import { Machine, MachineType } from '../types';
import { api } from '../api';

export const Machines: React.FC = () => {
  const [statsMap, setStatsMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMachine, setExpandedMachine] = useState<string | null>(null);

  const allMachines = getAllMachines();

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
    try {
      const stats = await api.machines.stats();
      const map: Record<string, any> = {};
      stats.forEach((s: any) => {
        map[s.machine_id] = s;
      });
      setStatsMap(map);
    } catch {
      // Stats load failed — show machines without stats
    } finally {
      setLoading(false);
    }
  }

  const filteredMachines = allMachines.filter((m) => {
    const matchesType = typeFilter === 'all' || m.type === typeFilter;
    const matchesSearch = !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  function getStatusInfo(machine: Machine) {
    if (machine.status === 'down') {
      return { label: 'Machine Down', color: 'bg-red-50 text-red-600 border-red-200' };
    }
    const stat = statsMap[machine.id];
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
      {/* Filters */}
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
              const stat = statsMap[machine.id];
              const status = getStatusInfo(machine);
              const isExpanded = expandedMachine === machine.id;

              return (
                <div
                  key={machine.id}
                  className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all cursor-pointer hover:shadow-md ${
                    machine.status === 'down' ? 'border-red-200' : 'border-slate-200'
                  }`}
                  onClick={() => setExpandedMachine(isExpanded ? null : machine.id)}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-slate-800 text-sm">{machine.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${status.color}`}>
                        {status.label}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Type</span>
                        <span className="font-medium text-slate-700">{MACHINE_TYPE_LABELS[machine.type]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Avg Completion</span>
                        <span className={`font-mono font-bold ${
                          !stat || stat.record_count === 0
                            ? 'text-slate-400'
                            : stat.avg_completion >= 90
                              ? 'text-green-600'
                              : stat.avg_completion >= 70
                                ? 'text-orange-600'
                                : 'text-red-600'
                        }`}>
                          {stat ? `${Math.round(stat.avg_completion)}%` : '—'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Records</span>
                        <span className="font-mono text-slate-600">{stat?.record_count ?? 0}</span>
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

                  {/* Expanded: show checklist summary */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 p-5 bg-slate-50/50">
                      {machine.weekly && (
                        <div className="mb-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                            Weekly Tasks ({machine.weekly.length})
                          </p>
                          <ul className="text-xs text-slate-600 space-y-0.5">
                            {machine.weekly.slice(0, 3).map((t, i) => (
                              <li key={i} className="truncate">- {t}</li>
                            ))}
                            {machine.weekly.length > 3 && (
                              <li className="text-mac-accent font-medium">
                                +{machine.weekly.length - 3} more
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                      {machine.monthly && (
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                            Monthly Tasks ({machine.monthly.length})
                          </p>
                          <ul className="text-xs text-slate-600 space-y-0.5">
                            {machine.monthly.slice(0, 3).map((t, i) => (
                              <li key={i} className="truncate">- {t}</li>
                            ))}
                            {machine.monthly.length > 3 && (
                              <li className="text-mac-accent font-medium">
                                +{machine.monthly.length - 3} more
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
      </div>
    </div>
  );
};
