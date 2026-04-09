import React, { useEffect, useState } from 'react';
import { Icons, getAllMachines, MACHINE_TYPE_LABELS } from '../constants';
import { api } from '../api';
import { ViewPage } from '../types';

interface DashboardProps {
  onNavigate: (page: ViewPage) => void;
}

interface Stats {
  totalMachines: number;
  overdueCount: number;
  upcomingCount: number;
  recentRecords: number;
  weeklyCompletion: number;
  monthlyCompletion: number;
  machinesDown: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentRecords, setRecentRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const allMachines = getAllMachines();

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setError(null);
    try {
      const [scheduleAll, records] = await Promise.all([
        api.schedule.list(),
        api.records.list(),
      ]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekFromNow = new Date(today);
      weekFromNow.setDate(weekFromNow.getDate() + 7);

      const overdue = scheduleAll.filter((s: any) => !s.completed && new Date(s.scheduled_date) < today);
      const upcoming = scheduleAll.filter(
        (s: any) => !s.completed && new Date(s.scheduled_date) >= today && new Date(s.scheduled_date) <= weekFromNow
      );

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recent = records.filter((r: any) => new Date(r.completed_date) >= thirtyDaysAgo);

      const weeklyRecs = recent.filter((r: any) => r.frequency === 'weekly');
      const monthlyRecs = recent.filter((r: any) => r.frequency === 'monthly');

      const calcCompletion = (recs: any[]) => {
        if (recs.length === 0) return 0;
        const totalItems = recs.reduce((s: number, r: any) => s + r.total_items, 0);
        const completed = recs.reduce((s: number, r: any) => s + (Array.isArray(r.completed_items) ? r.completed_items.length : 0), 0);
        return totalItems > 0 ? Math.round((completed / totalItems) * 100) : 0;
      };

      setStats({
        totalMachines: allMachines.length,
        overdueCount: overdue.length,
        upcomingCount: upcoming.length,
        recentRecords: recent.length,
        weeklyCompletion: calcCompletion(weeklyRecs),
        monthlyCompletion: calcCompletion(monthlyRecs),
        machinesDown: allMachines.filter((m) => m.status === 'down').length,
      });

      setRecentRecords(records.slice(0, 10));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="view-transition space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 animate-pulse">
              <div className="h-3 bg-slate-200 rounded w-20 mb-3" />
              <div className="h-8 bg-slate-200 rounded w-16" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 animate-pulse p-6">
          <div className="h-4 bg-slate-200 rounded w-40 mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 mb-3">
              <div className="h-4 bg-slate-200 rounded w-24" />
              <div className="h-4 bg-slate-200 rounded w-32" />
              <div className="h-4 bg-slate-200 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="view-transition flex flex-col items-center justify-center py-16">
        <Icons.AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-red-600 font-medium mb-2">Failed to load dashboard</p>
        <p className="text-sm text-slate-400 mb-4">{error}</p>
        <button onClick={loadDashboard} className="px-4 py-2 bg-mac-navy hover:bg-mac-blue text-white font-bold rounded-lg text-sm transition-all">
          Retry
        </button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="view-transition space-y-6">
      {/* KPI Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border-l-4 border-l-mac-accent shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Machines</div>
          <div className="text-3xl font-bold text-slate-800 mt-1">{stats.totalMachines}</div>
          <div className="text-xs text-slate-500 mt-1">
            {stats.machinesDown > 0 ? `${stats.machinesDown} down` : 'All operational'}
          </div>
        </div>

        <button
          onClick={() => onNavigate('schedule')}
          className="bg-white p-5 rounded-xl border-l-4 border-l-red-500 shadow-sm text-left hover:shadow-md transition-shadow"
        >
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Overdue</div>
          <div className="text-3xl font-bold text-slate-800 mt-1">{stats.overdueCount}</div>
          <div className="text-xs text-red-500 mt-1 font-medium">Needs attention</div>
        </button>

        <button
          onClick={() => onNavigate('schedule')}
          className="bg-white p-5 rounded-xl border-l-4 border-l-orange-500 shadow-sm text-left hover:shadow-md transition-shadow"
        >
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Due This Week</div>
          <div className="text-3xl font-bold text-slate-800 mt-1">{stats.upcomingCount}</div>
          <div className="text-xs text-orange-500 mt-1 font-medium">Upcoming</div>
        </button>

        <div className="bg-white p-5 rounded-xl border-l-4 border-l-green-500 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Records (30d)</div>
          <div className="text-3xl font-bold text-slate-800 mt-1">{stats.recentRecords}</div>
          <div className="text-xs text-slate-500 mt-1">Maintenance entries</div>
        </div>
      </div>

      {/* Completion Rate Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-3">
            Weekly Completion (30d)
          </div>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-slate-800 font-mono">{stats.weeklyCompletion}%</span>
            <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-mac-accent rounded-full transition-all"
                style={{ width: `${stats.weeklyCompletion}%` }}
              />
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-3">
            Monthly Completion (30d)
          </div>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-slate-800 font-mono">{stats.monthlyCompletion}%</span>
            <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${stats.monthlyCompletion}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Machines Down Alert */}
      {stats.machinesDown > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <Icons.Warning className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-red-700">
              {stats.machinesDown} machine{stats.machinesDown > 1 ? 's' : ''} currently down
            </p>
            <p className="text-xs text-red-500">
              {allMachines
                .filter((m) => m.status === 'down')
                .map((m) => m.name)
                .join(', ')}
            </p>
          </div>
          <button
            onClick={() => onNavigate('machines')}
            className="ml-auto px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 rounded-lg transition-all"
          >
            View
          </button>
        </div>
      )}

      {/* Recent Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-700 text-sm">Recent Maintenance Records</h3>
          <button
            onClick={() => onNavigate('reports')}
            className="px-3 py-1.5 text-sm text-mac-accent hover:bg-slate-100 rounded-lg transition-all font-medium"
          >
            View All
          </button>
        </div>
        {recentRecords.length === 0 ? (
          <div className="py-12 text-center">
            <Icons.Inbox className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No maintenance records yet</p>
            <button
              onClick={() => onNavigate('checklists')}
              className="mt-3 px-4 py-2 bg-mac-navy hover:bg-mac-blue text-white font-bold rounded-lg text-sm transition-all"
            >
              Complete a Checklist
            </button>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wide">Date</th>
                <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wide">Machine</th>
                <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wide">Type</th>
                <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wide">Operator</th>
                <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wide">Completion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentRecords.map((r: any) => {
                const pct = r.total_items > 0 ? Math.round(((Array.isArray(r.completed_items) ? r.completed_items.length : 0) / r.total_items) * 100) : 0;
                return (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-xs text-slate-500 font-mono">
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
                            className={`h-full rounded-full ${pct >= 90 ? 'bg-green-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-slate-500">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
