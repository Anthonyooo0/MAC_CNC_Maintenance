import React, { useEffect, useState } from 'react';
import { Icons, MACHINE_TYPE_LABELS } from '../constants';
import { api } from '../api';
import { EmptyState } from './EmptyState';

interface ScheduleProps {
  currentUser: string;
  addToast: (msg: string, type: 'success' | 'warning' | 'error') => void;
}

type FilterMode = 'all' | 'overdue' | 'upcoming';

export const Schedule: React.FC<ScheduleProps> = ({ currentUser, addToast }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterMode>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSchedule();
  }, [filter]);

  async function loadSchedule() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.schedule.list({ filter });
      setItems(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function markComplete(id: number) {
    try {
      await api.schedule.complete(id, currentUser);
      addToast('Schedule item marked as complete', 'success');
      loadSchedule();
    } catch (err: any) {
      addToast(`Failed to update: ${err.message}`, 'error');
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filtered = items.filter((item) => {
    if (searchQuery) {
      return item.machine_name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const overdueCount = items.filter(
    (i) => !i.completed && new Date(i.scheduled_date) < today
  ).length;
  const upcomingCount = items.filter((i) => {
    const d = new Date(i.scheduled_date);
    const weekOut = new Date(today);
    weekOut.setDate(weekOut.getDate() + 7);
    return !i.completed && d >= today && d <= weekOut;
  }).length;

  return (
    <div className="view-transition space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => setFilter('all')}
          className={`p-4 rounded-xl border shadow-sm text-left transition-all ${
            filter === 'all' ? 'border-mac-accent bg-blue-50' : 'border-slate-200 bg-white hover:shadow-md'
          }`}
        >
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">All Scheduled</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{items.length}</div>
        </button>
        <button
          onClick={() => setFilter('overdue')}
          className={`p-4 rounded-xl border shadow-sm text-left transition-all ${
            filter === 'overdue' ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white hover:shadow-md'
          }`}
        >
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Overdue</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{overdueCount}</div>
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`p-4 rounded-xl border shadow-sm text-left transition-all ${
            filter === 'upcoming' ? 'border-orange-400 bg-orange-50' : 'border-slate-200 bg-white hover:shadow-md'
          }`}
        >
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Due This Week</div>
          <div className="text-2xl font-bold text-orange-600 mt-1">{upcomingCount}</div>
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Icons.Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search machines..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-mac-accent focus:ring-2 focus:ring-mac-accent/20 outline-none"
          />
        </div>
      </div>

      {/* Schedule Table */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wide">Machine</th>
                <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wide">Frequency</th>
                <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wide">Date</th>
                <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wide">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...Array(6)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-32" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-16" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-24" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-20" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-16" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <Icons.AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-red-600 text-sm mb-3">{error}</p>
          <button onClick={loadSchedule} className="px-4 py-2 bg-mac-navy hover:bg-mac-blue text-white font-bold rounded-lg text-sm transition-all">
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Icons.Calendar className="w-16 h-16" />}
          title="No Scheduled Items"
          description={filter !== 'all' ? `No ${filter} maintenance items found.` : 'No maintenance schedule items found.'}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wide">Machine</th>
                <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wide">Frequency</th>
                <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wide">Scheduled Date</th>
                <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item: any) => {
                const itemDate = new Date(item.scheduled_date);
                const isOverdue = !item.completed && itemDate < today;
                const weekOut = new Date(today);
                weekOut.setDate(weekOut.getDate() + 7);
                const isUpcoming = !item.completed && itemDate >= today && itemDate <= weekOut;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{item.machine_name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.frequency === 'weekly' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                      }`}>
                        {item.frequency}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                      {itemDate.toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {item.completed ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase border bg-green-50 text-green-600 border-green-200">
                          Completed
                        </span>
                      ) : isOverdue ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase border bg-red-50 text-red-600 border-red-200">
                          Overdue
                        </span>
                      ) : isUpcoming ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase border bg-orange-50 text-orange-600 border-orange-200">
                          Due Soon
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase border bg-slate-50 text-slate-600 border-slate-200">
                          Scheduled
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {!item.completed && (
                        <button
                          onClick={() => markComplete(item.id)}
                          className="px-3 py-1.5 text-xs font-bold text-mac-accent hover:bg-blue-50 rounded-lg transition-all"
                        >
                          Mark Complete
                        </button>
                      )}
                      {item.completed && item.completed_by && (
                        <span className="text-xs text-slate-400">{item.completed_by}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
