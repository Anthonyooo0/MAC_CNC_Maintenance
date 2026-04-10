import React, { useEffect, useState, useMemo } from 'react';
import { Icons } from '../constants';
import { api } from '../api';
import { EmptyState } from './EmptyState';

type Tab = 'activity' | 'maintenance';

export const Changelog: React.FC = () => {
  const [tab, setTab] = useState<Tab>('activity');
  const [entries, setEntries] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [machines, setMachines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRecord, setExpandedRecord] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [machineFilter, setMachineFilter] = useState<string>('all');

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [changelog, recordList, machineList] = await Promise.all([
        api.changelog.list(),
        api.records.list(),
        api.machines.list().catch(() => []),
      ]);
      setEntries(changelog);
      setRecords(recordList);
      setMachines(machineList);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Build a lookup of machine_id -> { weekly_tasks, monthly_tasks }
  const machineTaskMap = useMemo(() => {
    const map: Record<string, { weekly: string[]; monthly: string[] }> = {};
    machines.forEach((m: any) => {
      map[m.machine_id] = {
        weekly: Array.isArray(m.weekly_tasks) ? m.weekly_tasks : [],
        monthly: Array.isArray(m.monthly_tasks) ? m.monthly_tasks : [],
      };
    });
    return map;
  }, [machines]);

  // Unique users and machines for filters
  const uniqueUsers = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => set.add(r.operator_email));
    return Array.from(set).sort();
  }, [records]);

  const uniqueMachines = useMemo(() => {
    const set = new Map<string, string>();
    records.forEach((r) => set.set(r.machine_id, r.machine_name));
    return Array.from(set.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [records]);

  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((r) => {
      if (userFilter !== 'all' && r.operator_email !== userFilter) return false;
      if (machineFilter !== 'all' && r.machine_id !== machineFilter) return false;
      if (!q) return true;
      return (
        r.machine_name?.toLowerCase().includes(q) ||
        r.operator_email?.toLowerCase().includes(q) ||
        r.notes?.toLowerCase().includes(q)
      );
    });
  }, [records, search, userFilter, machineFilter]);

  function getTaskDetail(record: any): { completed: string[]; skipped: string[] } {
    const tasks = machineTaskMap[record.machine_id];
    if (!tasks) return { completed: [], skipped: [] };
    const allTasks = record.frequency === 'weekly' ? tasks.weekly : tasks.monthly;
    const completedSet = new Set<number>(
      Array.isArray(record.completed_items) ? record.completed_items : []
    );
    const completed: string[] = [];
    const skipped: string[] = [];
    allTasks.forEach((name, idx) => {
      if (completedSet.has(idx)) completed.push(name);
      else skipped.push(name);
    });
    return { completed, skipped };
  }

  function exportMaintenanceCsv() {
    const rows = ['Date,Machine,Type,Frequency,Operator,Completed,Total,Rate,Completed Tasks,Skipped Tasks,Notes'];
    filteredRecords.forEach((r) => {
      const { completed, skipped } = getTaskDetail(r);
      const completedCount = Array.isArray(r.completed_items) ? r.completed_items.length : 0;
      const rate = r.total_items > 0 ? Math.round((completedCount / r.total_items) * 100) : 0;
      rows.push([
        r.completed_date,
        `"${r.machine_name}"`,
        r.machine_type,
        r.frequency,
        `"${r.operator_email}"`,
        completedCount,
        r.total_items,
        `${rate}%`,
        `"${completed.join(' | ').replace(/"/g, '""')}"`,
        `"${skipped.join(' | ').replace(/"/g, '""')}"`,
        `"${(r.notes || '').replace(/"/g, '""')}"`,
      ].join(','));
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `maintenance-log-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  // ── Loading
  if (loading) {
    return (
      <div className="view-transition bg-white rounded-xl border border-slate-200 shadow-sm p-6 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-40 mb-4" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-4 bg-slate-100 rounded mb-2" />
        ))}
      </div>
    );
  }

  // ── Error
  if (error) {
    return (
      <div className="view-transition text-center py-12">
        <Icons.AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-red-600 text-sm mb-3">{error}</p>
        <button
          onClick={loadAll}
          style={{ backgroundColor: '#1a365d', color: '#ffffff' }}
          className="px-4 py-2 font-bold rounded-lg text-sm transition-all hover:brightness-110"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="view-transition space-y-4">
      {/* Tab bar */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setTab('activity')}
          className={`px-4 py-2 text-sm font-bold transition-all border-b-2 -mb-px ${
            tab === 'activity'
              ? 'border-mac-accent text-mac-accent'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          style={tab === 'activity' ? { borderColor: '#3182ce', color: '#3182ce' } : undefined}
        >
          All Activity ({entries.length})
        </button>
        <button
          onClick={() => setTab('maintenance')}
          className={`px-4 py-2 text-sm font-bold transition-all border-b-2 -mb-px ${
            tab === 'maintenance'
              ? 'border-mac-accent text-mac-accent'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
          style={tab === 'maintenance' ? { borderColor: '#3182ce', color: '#3182ce' } : undefined}
        >
          Maintenance Log ({records.length})
        </button>
      </div>

      {/* ── Activity Tab ───────────────────────────── */}
      {tab === 'activity' && (
        entries.length === 0 ? (
          <EmptyState
            icon={<Icons.Changelog className="w-16 h-16" />}
            title="No Audit Log Entries"
            description="Activity will appear here when maintenance records are created or updated."
          />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wide">Timestamp</th>
                  <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wide">User</th>
                  <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wide">Record</th>
                  <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wide">Action</th>
                  <th className="px-6 py-4 font-bold text-slate-600 text-xs uppercase tracking-wide">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map((entry: any) => (
                  <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-xs text-slate-500 font-mono whitespace-nowrap">{entry.timestamp}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{entry.user_email}</td>
                    <td className="px-6 py-4 text-slate-600">{entry.project_info}</td>
                    <td className="px-6 py-4">
                      <span
                        style={{ backgroundColor: '#eff6ff', color: '#3182ce' }}
                        className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                      >
                        {entry.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 italic">{entry.changes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* ── Maintenance Log Tab ────────────────────── */}
      {tab === 'maintenance' && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-end gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Search</label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Machine, user, notes..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-mac-accent focus:ring-2 focus:ring-mac-accent/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">User</label>
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:border-mac-accent focus:ring-2 focus:ring-mac-accent/20 outline-none"
              >
                <option value="all">All Users</option>
                {uniqueUsers.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Machine</label>
              <select
                value={machineFilter}
                onChange={(e) => setMachineFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:border-mac-accent focus:ring-2 focus:ring-mac-accent/20 outline-none"
              >
                <option value="all">All Machines</option>
                {uniqueMachines.map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={exportMaintenanceCsv}
              disabled={filteredRecords.length === 0}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Icons.Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          {filteredRecords.length === 0 ? (
            <EmptyState
              icon={<Icons.Checklist className="w-16 h-16" />}
              title="No Maintenance Records"
              description="Completed checklists will appear here with full details."
            />
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wide w-8"></th>
                    <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wide">Date</th>
                    <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wide">Machine</th>
                    <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wide">Frequency</th>
                    <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wide">Operator</th>
                    <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wide">Completion</th>
                    <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wide">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map((r: any) => {
                    const isExpanded = expandedRecord === r.id;
                    const completedCount = Array.isArray(r.completed_items) ? r.completed_items.length : 0;
                    const pct = r.total_items > 0 ? Math.round((completedCount / r.total_items) * 100) : 0;
                    const { completed, skipped } = getTaskDetail(r);
                    return (
                      <React.Fragment key={r.id}>
                        <tr
                          className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                          onClick={() => setExpandedRecord(isExpanded ? null : r.id)}
                        >
                          <td className="px-4 py-3 text-slate-400">
                            {isExpanded ? <Icons.ChevronUp className="w-4 h-4" /> : <Icons.ChevronDown className="w-4 h-4" />}
                          </td>
                          <td className="px-4 py-3 text-xs font-mono text-slate-500 whitespace-nowrap">
                            {new Date(r.completed_date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-800">{r.machine_name}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              r.frequency === 'weekly' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                            }`}>
                              {r.frequency}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{r.operator_email}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    pct >= 90 ? 'bg-green-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-xs font-mono text-slate-500 whitespace-nowrap">
                                {completedCount}/{r.total_items} ({pct}%)
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500 italic max-w-xs truncate">
                            {r.notes || '—'}
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-slate-50/70">
                            <td colSpan={7} className="px-6 py-5">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Completed */}
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Icons.Check className="w-4 h-4 text-green-600" />
                                    <h4 className="text-xs font-bold uppercase tracking-wide text-green-700">
                                      Completed ({completed.length})
                                    </h4>
                                  </div>
                                  {completed.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic">None</p>
                                  ) : (
                                    <ul className="space-y-1">
                                      {completed.map((name, i) => (
                                        <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                                          <span className="text-green-500 flex-shrink-0">✓</span>
                                          <span>{name}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                                {/* Skipped */}
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Icons.X className="w-4 h-4 text-red-500" />
                                    <h4 className="text-xs font-bold uppercase tracking-wide text-red-600">
                                      Not Completed ({skipped.length})
                                    </h4>
                                  </div>
                                  {skipped.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic">None — all tasks completed</p>
                                  ) : (
                                    <ul className="space-y-1">
                                      {skipped.map((name, i) => (
                                        <li key={i} className="text-xs text-slate-500 flex items-start gap-2">
                                          <span className="text-red-400 flex-shrink-0">✗</span>
                                          <span>{name}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </div>
                              {r.notes && (
                                <div className="mt-4 pt-4 border-t border-slate-200">
                                  <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Notes</h4>
                                  <p className="text-sm text-slate-700">{r.notes}</p>
                                </div>
                              )}
                              <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400 font-mono">
                                <span>Record ID: {r.id}</span>
                                <span>Submitted: {r.created_at ? new Date(r.created_at).toLocaleString() : '—'}</span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};
