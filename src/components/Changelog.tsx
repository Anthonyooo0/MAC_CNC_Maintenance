import React, { useEffect, useState } from 'react';
import { Icons } from '../constants';
import { api } from '../api';
import { EmptyState } from './EmptyState';

export const Changelog: React.FC = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChangelog();
  }, []);

  async function loadChangelog() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.changelog.list();
      setEntries(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="view-transition bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-bold text-slate-600">Timestamp</th>
              <th className="px-6 py-4 font-bold text-slate-600">User</th>
              <th className="px-6 py-4 font-bold text-slate-600">Record</th>
              <th className="px-6 py-4 font-bold text-slate-600">Action</th>
              <th className="px-6 py-4 font-bold text-slate-600">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[...Array(8)].map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-32" /></td>
                <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-40" /></td>
                <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-28" /></td>
                <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20" /></td>
                <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-48" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (error) {
    return (
      <div className="view-transition text-center py-12">
        <Icons.AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-red-600 text-sm mb-3">{error}</p>
        <button onClick={loadChangelog} className="px-4 py-2 bg-mac-navy hover:bg-mac-blue text-white font-bold rounded-lg text-sm transition-all">
          Retry
        </button>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="view-transition">
        <EmptyState
          icon={<Icons.Changelog className="w-16 h-16" />}
          title="No Audit Log Entries"
          description="Activity will appear here when maintenance records are created or updated."
        />
      </div>
    );
  }

  return (
    <div className="view-transition bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 font-bold text-slate-600">Timestamp</th>
            <th className="px-6 py-4 font-bold text-slate-600">User</th>
            <th className="px-6 py-4 font-bold text-slate-600">Record</th>
            <th className="px-6 py-4 font-bold text-slate-600">Action</th>
            <th className="px-6 py-4 font-bold text-slate-600">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {entries.map((entry: any) => (
            <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 text-xs text-slate-500 font-mono">{entry.timestamp}</td>
              <td className="px-6 py-4 font-medium text-slate-800">{entry.user_email}</td>
              <td className="px-6 py-4 text-slate-600">{entry.project_info}</td>
              <td className="px-6 py-4">
                <span className="px-2 py-0.5 bg-blue-50 text-mac-accent rounded text-[10px] font-bold uppercase">
                  {entry.action}
                </span>
              </td>
              <td className="px-6 py-4 text-xs text-slate-500 italic max-w-xs truncate">{entry.changes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
