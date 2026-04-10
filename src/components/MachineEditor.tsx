import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { ConfirmDialog } from './ConfirmDialog';

interface MachineEditorProps {
  open: boolean;
  machine: any | null; // null = creating new
  onSave: (data: any) => void;
  onDelete?: (id: number) => void;
  onClose: () => void;
  saving: boolean;
}

const MACHINE_TYPES = [
  { value: 'cnc-lathe', label: 'CNC Lathe' },
  { value: 'manual-lathe', label: 'Manual Lathe' },
  { value: 'cnc-mill', label: 'CNC Mill' },
  { value: 'manual-mill', label: 'Manual Mill' },
];

export const MachineEditor: React.FC<MachineEditorProps> = ({
  open,
  machine,
  onSave,
  onDelete,
  onClose,
  saving,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('cnc-lathe');
  const [status, setStatus] = useState('active');
  const [weeklyTasks, setWeeklyTasks] = useState<string[]>([]);
  const [monthlyTasks, setMonthlyTasks] = useState<string[]>([]);
  const [videoWeekly, setVideoWeekly] = useState('');
  const [videoMonthly, setVideoMonthly] = useState('');
  const [newWeeklyTask, setNewWeeklyTask] = useState('');
  const [newMonthlyTask, setNewMonthlyTask] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isEditing = !!machine;

  useEffect(() => {
    if (machine) {
      setName(machine.name || '');
      setType(machine.type || 'cnc-lathe');
      setStatus(machine.status || 'active');
      setWeeklyTasks(machine.weekly_tasks || []);
      setMonthlyTasks(machine.monthly_tasks || []);
      setVideoWeekly(machine.video_weekly || '');
      setVideoMonthly(machine.video_monthly || '');
    } else {
      setName('');
      setType('cnc-lathe');
      setStatus('active');
      setWeeklyTasks([]);
      setMonthlyTasks([]);
      setVideoWeekly('');
      setVideoMonthly('');
    }
    setNewWeeklyTask('');
    setNewMonthlyTask('');
  }, [machine, open]);

  if (!open) return null;

  function addTask(list: string[], setList: (v: string[]) => void, task: string, clear: () => void) {
    if (task.trim()) {
      setList([...list, task.trim()]);
      clear();
    }
  }

  function removeTask(list: string[], setList: (v: string[]) => void, idx: number) {
    setList(list.filter((_, i) => i !== idx));
  }

  function moveTask(list: string[], setList: (v: string[]) => void, idx: number, dir: -1 | 1) {
    const newList = [...list];
    const target = idx + dir;
    if (target < 0 || target >= newList.length) return;
    [newList[idx], newList[target]] = [newList[target], newList[idx]];
    setList(newList);
  }

  function handleSubmit() {
    if (!name.trim()) {
      alert('Please enter a machine name before saving.');
      return;
    }
    onSave({
      name: name.trim(),
      type,
      status,
      weekly_tasks: weeklyTasks,
      monthly_tasks: monthlyTasks,
      video_weekly: videoWeekly.trim() || null,
      video_monthly: videoMonthly.trim() || null,
    });
  }

  function renderTaskList(
    label: string,
    tasks: string[],
    setTasks: (v: string[]) => void,
    newTask: string,
    setNewTask: (v: string) => void
  ) {
    return (
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{label}</label>
        <div className="space-y-1 mb-2 max-h-48 overflow-y-auto">
          {tasks.length === 0 && (
            <p className="text-xs text-slate-400 italic py-2">No tasks yet. Add one below.</p>
          )}
          {tasks.map((task, idx) => (
            <div key={idx} className="flex items-center gap-2 group bg-slate-50 rounded-lg px-3 py-2">
              <span className="text-xs font-mono text-slate-400 w-5 flex-shrink-0">{idx + 1}.</span>
              <span className="text-sm text-slate-700 flex-1">{task}</span>
              <button
                onClick={() => moveTask(tasks, setTasks, idx, -1)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition-all"
                title="Move up"
              >
                <Icons.ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => moveTask(tasks, setTasks, idx, 1)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition-all"
                title="Move down"
              >
                <Icons.ChevronDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => removeTask(tasks, setTasks, idx)}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all"
                title="Remove"
              >
                <Icons.X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTask(tasks, setTasks, newTask, () => setNewTask(''));
              }
            }}
            placeholder="Type a task and press Enter..."
            className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-mac-accent focus:ring-2 focus:ring-mac-accent/20 outline-none"
          />
          <button
            onClick={() => addTask(tasks, setTasks, newTask, () => setNewTask(''))}
            className="px-3 py-2 bg-mac-accent text-white rounded-lg text-sm font-bold hover:bg-mac-blue transition-all"
          >
            Add
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="sticky top-0 bg-mac-navy text-white px-6 py-4 rounded-t-xl z-10">
            <h2 className="text-xl font-bold">{isEditing ? 'Edit Machine' : 'Add New Machine'}</h2>
            <p className="text-blue-200 text-sm">
              {isEditing ? `Editing ${machine.name}` : 'Configure machine details and checklist tasks'}
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            {/* Name & Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Machine Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. HAAS VF2"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-mac-accent focus:ring-2 focus:ring-mac-accent/20 outline-none transition-all"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Machine Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-mac-accent focus:ring-2 focus:ring-mac-accent/20 outline-none bg-white transition-all"
                >
                  {MACHINE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Status</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setStatus('active')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${
                    status === 'active'
                      ? 'bg-green-50 text-green-600 border-green-200'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setStatus('down')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${
                    status === 'down'
                      ? 'bg-red-50 text-red-600 border-red-200'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Down
                </button>
              </div>
            </div>

            {/* Weekly Tasks */}
            {renderTaskList('Weekly Checklist Tasks', weeklyTasks, setWeeklyTasks, newWeeklyTask, setNewWeeklyTask)}

            {/* Monthly Tasks */}
            {renderTaskList('Monthly Checklist Tasks', monthlyTasks, setMonthlyTasks, newMonthlyTask, setNewMonthlyTask)}

            {/* Video Links */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Weekly Video URL</label>
                <input
                  value={videoWeekly}
                  onChange={(e) => setVideoWeekly(e.target.value)}
                  placeholder="https://youtube.com/..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-mac-accent focus:ring-2 focus:ring-mac-accent/20 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Monthly Video URL</label>
                <input
                  value={videoMonthly}
                  onChange={(e) => setVideoMonthly(e.target.value)}
                  placeholder="https://youtube.com/..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-mac-accent focus:ring-2 focus:ring-mac-accent/20 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 p-4 border-t bg-slate-50 flex justify-between rounded-b-xl">
            <div>
              {isEditing && onDelete && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all"
                >
                  Delete Machine
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                title={!name.trim() ? 'Enter a machine name' : ''}
                className="px-6 py-2.5 text-sm font-bold text-white bg-mac-accent hover:bg-mac-blue rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Machine'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Machine"
        message={`Are you sure you want to delete "${machine?.name}"? This cannot be undone. Existing maintenance records will be preserved.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          setShowDeleteConfirm(false);
          onDelete?.(machine.id);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};
