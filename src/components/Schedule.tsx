import React, { useEffect, useState } from 'react';
import { Icons, MACHINE_TYPE_LABELS } from '../constants';
import { api } from '../api';
import { EmptyState } from './EmptyState';
import { ConfirmDialog } from './ConfirmDialog';

interface ScheduleProps {
  currentUser: string;
  addToast: (msg: string, type: 'success' | 'warning' | 'error') => void;
}

type FilterMode = 'all' | 'overdue' | 'upcoming';

export const Schedule: React.FC<ScheduleProps> = ({ currentUser, addToast }) => {
  const [items, setItems] = useState<any[]>([]);
  const [machines, setMachines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterMode>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add new schedule
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMachineId, setNewMachineId] = useState('');
  const [newFreq, setNewFreq] = useState('weekly');
  const [newDate, setNewDate] = useState('');

  // Edit schedule
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDate, setEditDate] = useState('');

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  useEffect(() => {
    loadSchedule();
    loadMachines();
  }, [filter]);

  async function loadMachines() {
    try {
      const data = await api.machines.list();
      setMachines(data);
    } catch {}
  }

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
      addToast('Marked as complete', 'success');
      loadSchedule();
    } catch (err: any) {
      addToast(`Failed: ${err.message}`, 'error');
    }
  }

  async function handleAddSchedule() {
    if (!newMachineId || !newDate) {
      addToast('Select a machine and date', 'warning');
      return;
    }
    const machine = machines.find((m: any) => m.machine_id === newMachineId);
    if (!machine) return;
    try {
      await api.schedule.create({
        machine_id: machine.machine_id,
        machine_name: machine.name,
        frequency: newFreq,
        scheduled_date: newDate,
        userEmail: currentUser,
      });
      addToast('Schedule entry added', 'success');
      setShowAddForm(false);
      setNewMachineId('');
      setNewDate('');
      loadSchedule();
    } catch (err: any) {
      addToast(`Failed: ${err.message}`, 'error');
    }
  }

  async function handleUpdateDate(id: number) {
    if (!editDate) return;
    try {
      await api.schedule.update(id, { scheduled_date: editDate, userEmail: currentUser });
      addToast('Date updated', 'success');
      setEditingId(null);
      loadSchedule();
    } catch (err: any) {
      addToast(`Failed: ${err.message}`, 'error');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await api.schedule.delete(deleteTarget.id, currentUser);
      addToast('Schedule entry deleted', 'success');
      setDeleteTarget(null);
      loadSchedule();
    } catch (err: any) {
      addToast(`Failed: ${err.message}`, 'error');
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filtered = items.filter((item) => {
    if (searchQuery) return item.machine_name.toLowerCase().includes(searchQuery.toLowerCase());
    return true;
  });

  const overdueCount = items.filter((i) => !i.completed && new Date(i.scheduled_date) < today).length;
  const weekOut = new Date(today);
  weekOut.setDate(weekOut.getDate() + 7);
  const upcomingCount = items.filter(
    (i) => !i.completed && new Date(i.scheduled_date) >= today && new Date(i.scheduled_date) <= weekOut
  ).length;

  return (
    <div className="view-transition space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4">
        <button onClick={() => setFilter('all')}
          className={`p-4 rounded-xl border shadow-sm text-left transition-all ${filter === 'all' ? 'border-mac-accent bg-blue-50' : 'border-slate-200 bg-white hover:shadow-md'}`}>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">All Scheduled</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{items.length}</div>
        </button>
        <button onClick={() => setFilter('overdue')}
          className={`p-4 rounded-xl border shadow-sm text-left transition-all ${filter === 'overdue' ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white hover:shadow-md'}`}>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Overdue</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{overdueCount}</div>
        </button>
        <button onClick={() => setFilter('upcoming')}
          className={`p-4 rounded-xl border shadow-sm text-left transition-all ${filter === 'upcoming' ? 'border-orange-400 bg-orange-50' : 'border-slate-200 bg-white hover:shadow-md'}`}>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Due This Week</div>
          <div className="text-2xl font-bold text-orange-600 mt-1">{upcomingCount}</div>
        </button>
      </div>

      {/* Search + Add */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Icons.Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search machines..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-mac-accent focus:ring-2 focus:ring-mac-accent/20 outline-none" />
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-mac-navy hover:bg-mac-blue text-white font-bold rounded-lg text-sm transition-all shadow-sm">
          + Add Entry
        </button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-bold text-slate-700 text-sm mb-3">Add Schedule Entry</h3>
          <div className="flex items-end gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Machine</label>
              <select value={newMachineId} onChange={(e) => setNewMachineId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:border-mac-accent focus:ring-2 focus:ring-mac-accent/20 outline-none">
                <option value="">Select machine...</option>
                {machines.map((m: any) => (
                  <option key={m.machine_id} value={m.machine_id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Frequency</label>
              <select value={newFreq} onChange={(e) => setNewFreq(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:border-mac-accent focus:ring-2 focus:ring-mac-accent/20 outline-none">
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
              <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-mac-accent focus:ring-2 focus:ring-mac-accent/20 outline-none" />
            </div>
            <button onClick={handleAddSchedule}
              className="px-4 py-2 bg-mac-accent hover:bg-mac-blue text-white font-bold rounded-lg text-sm transition-all">
              Add
            </button>
            <button onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg transition-all">
              Cancel
            </button>
          </div>
        </div>
      )}

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
          <button onClick={loadSchedule} className="px-4 py-2 bg-mac-navy hover:bg-mac-blue text-white font-bold rounded-lg text-sm transition-all">Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Icons.Calendar className="w-16 h-16" />}
          title="No Scheduled Items"
          description={filter !== 'all' ? `No ${filter} maintenance items found.` : 'No schedule entries. Click "+ Add Entry" to create one.'}
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
                const isUpcoming = !item.completed && itemDate >= today && itemDate <= weekOut;
                const isEditing = editingId === item.id;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{item.machine_name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.frequency === 'weekly' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                      }`}>{item.frequency}</span>
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)}
                            className="px-2 py-1 rounded border border-slate-300 text-xs focus:border-mac-accent outline-none" />
                          <button onClick={() => handleUpdateDate(item.id)}
                            className="text-xs font-bold text-mac-accent hover:underline">Save</button>
                          <button onClick={() => setEditingId(null)}
                            className="text-xs text-slate-400 hover:underline">Cancel</button>
                        </div>
                      ) : (
                        <span className="font-mono text-xs text-slate-500">{itemDate.toLocaleDateString()}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {item.completed ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase border bg-green-50 text-green-600 border-green-200">Completed</span>
                      ) : isOverdue ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase border bg-red-50 text-red-600 border-red-200">Overdue</span>
                      ) : isUpcoming ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase border bg-orange-50 text-orange-600 border-orange-200">Due Soon</span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase border bg-slate-50 text-slate-600 border-slate-200">Scheduled</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {!item.completed && (
                          <>
                            <button onClick={() => markComplete(item.id)}
                              className="text-xs font-bold text-green-600 hover:bg-green-50 px-2 py-1 rounded transition-all">
                              Complete
                            </button>
                            <button onClick={() => { setEditingId(item.id); setEditDate(String(item.scheduled_date).slice(0, 10)); }}
                              className="text-xs font-bold text-mac-accent hover:bg-blue-50 px-2 py-1 rounded transition-all">
                              Edit Date
                            </button>
                          </>
                        )}
                        <button onClick={() => setDeleteTarget(item)}
                          className="text-xs font-bold text-red-400 hover:bg-red-50 px-2 py-1 rounded transition-all">
                          Delete
                        </button>
                        {item.completed && item.completed_by && (
                          <span className="text-xs text-slate-400 ml-1">{item.completed_by}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Schedule Entry"
        message={deleteTarget ? `Delete ${deleteTarget.frequency} maintenance for ${deleteTarget.machine_name} on ${new Date(deleteTarget.scheduled_date).toLocaleDateString()}?` : ''}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
