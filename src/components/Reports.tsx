import React, { useState } from 'react';
import { Icons } from '../constants';
import { api } from '../api';
import { EmptyState } from './EmptyState';

type ReportType = 'completion' | 'machine' | 'operator' | 'timeline';

export const Reports: React.FC = () => {
  const [reportType, setReportType] = useState<ReportType>('completion');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateReport() {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates.');
      return;
    }
    setLoading(true);
    setError(null);
    setData(null);
    try {
      let result: any;
      switch (reportType) {
        case 'completion':
          result = await api.reports.completion(startDate, endDate);
          break;
        case 'machine':
          result = await api.reports.byMachine(startDate, endDate);
          break;
        case 'operator':
          result = await api.reports.byOperator(startDate, endDate);
          break;
        case 'timeline':
          result = await api.reports.timeline(startDate, endDate);
          break;
      }
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function exportCsv() {
    if (!data) return;
    let csvContent = '';

    if (reportType === 'completion' && data.records) {
      csvContent = [
        'Date,Machine,Frequency,Operator,Completed,Total,Rate',
        ...data.records.map((r: any) => {
          const rate = r.total_items > 0 ? ((r.completed_count / r.total_items) * 100).toFixed(1) : '0';
          return `${r.completed_date},"${r.machine_name}",${r.frequency},"${r.operator_email}",${r.completed_count},${r.total_items},${rate}%`;
        }),
      ].join('\n');
    } else if (reportType === 'machine' && Array.isArray(data)) {
      csvContent = [
        'Machine,Type,Records,Completed Tasks,Total Tasks,Rate',
        ...data.map((m: any) => `"${m.machine_name}",${m.machine_type},${m.record_count},${m.completed_tasks},${m.total_tasks},${m.completion_rate}%`),
      ].join('\n');
    } else if (reportType === 'operator' && Array.isArray(data)) {
      csvContent = [
        'Operator,Records,Completed Tasks,Total Tasks,Rate',
        ...data.map((o: any) => `"${o.operator_email}",${o.record_count},${o.completed_tasks},${o.total_tasks},${o.completion_rate}%`),
      ].join('\n');
    } else if (reportType === 'timeline' && Array.isArray(data)) {
      csvContent = [
        'Date,Machine,Type,Frequency,Operator,Completed,Total,Rate',
        ...data.map((r: any) => {
          const rate = r.total_items > 0 ? ((r.completed_count / r.total_items) * 100).toFixed(1) : '0';
          return `${r.completed_date},"${r.machine_name}",${r.machine_type},${r.frequency},"${r.operator_email}",${r.completed_count},${r.total_items},${rate}%`;
        }),
      ].join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `maintenance-report-${reportType}-${startDate}-to-${endDate}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <div className="view-transition space-y-4">
      {/* Controls */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-end gap-3 flex-wrap">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => { setReportType(e.target.value as ReportType); setData(null); }}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:border-mac-accent focus:ring-2 focus:ring-mac-accent/20 outline-none"
            >
              <option value="completion">Completion Rate</option>
              <option value="machine">By Machine</option>
              <option value="operator">By Operator</option>
              <option value="timeline">Timeline</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-mac-accent focus:ring-2 focus:ring-mac-accent/20 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-mac-accent focus:ring-2 focus:ring-mac-accent/20 outline-none"
            />
          </div>
          <button
            onClick={generateReport}
            disabled={loading}
            className="px-4 py-2 bg-mac-navy hover:bg-mac-blue text-white font-bold rounded-lg text-sm transition-all disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
          {data && (
            <button
              onClick={exportCsv}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all flex items-center gap-2"
            >
              <Icons.Download className="w-4 h-4" />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">{error}</div>
      )}

      {/* Report Output */}
      {loading && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-48 mb-6" />
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-xl" />
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-slate-100 rounded" />
            ))}
          </div>
        </div>
      )}

      {!loading && !data && !error && (
        <EmptyState
          icon={<Icons.Report className="w-16 h-16" />}
          title="Generate a Report"
          description="Select a report type, date range, and click Generate Report to view data."
        />
      )}

      {/* Completion Report */}
      {!loading && data && reportType === 'completion' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border-l-4 border-l-mac-accent shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Overall Completion</div>
              <div className="text-3xl font-bold text-slate-800 mt-1 font-mono">{data.overall_rate}%</div>
              <div className="text-xs text-slate-500 mt-1">{data.completed_tasks} of {data.total_tasks} tasks</div>
            </div>
            <div className="bg-white p-5 rounded-xl border-l-4 border-l-blue-500 shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Weekly</div>
              <div className="text-3xl font-bold text-slate-800 mt-1 font-mono">{data.weekly_rate}%</div>
              <div className="text-xs text-slate-500 mt-1">{data.weekly_count} records</div>
            </div>
            <div className="bg-white p-5 rounded-xl border-l-4 border-l-purple-500 shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Monthly</div>
              <div className="text-3xl font-bold text-slate-800 mt-1 font-mono">{data.monthly_rate}%</div>
              <div className="text-xs text-slate-500 mt-1">{data.monthly_count} records</div>
            </div>
            <div className="bg-white p-5 rounded-xl border-l-4 border-l-green-500 shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Records</div>
              <div className="text-3xl font-bold text-slate-800 mt-1 font-mono">{data.total_records}</div>
            </div>
          </div>

          {data.records && data.records.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b bg-slate-50">
                <h3 className="font-bold text-slate-700 text-sm">Detailed Records</h3>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wide">Date</th>
                    <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wide">Machine</th>
                    <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wide">Freq</th>
                    <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wide">Operator</th>
                    <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wide">Completion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.records.map((r: any, idx: number) => {
                    const pct = r.total_items > 0 ? Math.round((r.completed_count / r.total_items) * 100) : 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 text-xs font-mono text-slate-500">{new Date(r.completed_date).toLocaleDateString()}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{r.machine_name}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            r.frequency === 'weekly' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                          }`}>{r.frequency}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{r.operator_email}</td>
                        <td className="px-4 py-3">
                          <span className={`font-mono font-bold text-xs ${pct >= 90 ? 'text-green-600' : pct >= 70 ? 'text-orange-600' : 'text-red-600'}`}>
                            {r.completed_count}/{r.total_items} ({pct}%)
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Machine Report */}
      {!loading && data && reportType === 'machine' && Array.isArray(data) && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b bg-slate-50">
            <h3 className="font-bold text-slate-700 text-sm">Machine Performance</h3>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wide">Machine</th>
                <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wide">Type</th>
                <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wide">Records</th>
                <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wide">Tasks</th>
                <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wide">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((m: any, i: number) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{m.machine_name}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs uppercase">{m.machine_type?.replace('-', ' ')}</td>
                  <td className="px-4 py-3 font-mono text-slate-600">{m.record_count}</td>
                  <td className="px-4 py-3 font-mono text-slate-600">{m.completed_tasks}/{m.total_tasks}</td>
                  <td className="px-4 py-3">
                    <span className={`font-mono font-bold ${
                      m.completion_rate >= 90 ? 'text-green-600' : m.completion_rate >= 70 ? 'text-orange-600' : 'text-red-600'
                    }`}>{m.completion_rate}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Operator Report */}
      {!loading && data && reportType === 'operator' && Array.isArray(data) && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b bg-slate-50">
            <h3 className="font-bold text-slate-700 text-sm">Operator Performance</h3>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wide">Operator</th>
                <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wide">Records</th>
                <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wide">Tasks</th>
                <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wide">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((o: any, i: number) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{o.operator_email}</td>
                  <td className="px-4 py-3 font-mono text-slate-600">{o.record_count}</td>
                  <td className="px-4 py-3 font-mono text-slate-600">{o.completed_tasks}/{o.total_tasks}</td>
                  <td className="px-4 py-3">
                    <span className={`font-mono font-bold ${
                      o.completion_rate >= 90 ? 'text-green-600' : o.completion_rate >= 70 ? 'text-orange-600' : 'text-red-600'
                    }`}>{o.completion_rate}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Timeline Report */}
      {!loading && data && reportType === 'timeline' && Array.isArray(data) && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b bg-slate-50">
            <h3 className="font-bold text-slate-700 text-sm">Timeline</h3>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wide">Date</th>
                <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wide">Machine</th>
                <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wide">Type</th>
                <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wide">Freq</th>
                <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wide">Operator</th>
                <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase tracking-wide">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((r: any, i: number) => {
                const pct = r.total_items > 0 ? Math.round((r.completed_count / r.total_items) * 100) : 0;
                return (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{new Date(r.completed_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{r.machine_name}</td>
                    <td className="px-4 py-3 text-xs text-slate-600 uppercase">{r.machine_type?.replace('-', ' ')}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        r.frequency === 'weekly' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                      }`}>{r.frequency}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.operator_email}</td>
                    <td className="px-4 py-3">
                      <span className={`font-mono font-bold text-xs ${pct >= 90 ? 'text-green-600' : pct >= 70 ? 'text-orange-600' : 'text-red-600'}`}>
                        {pct}%
                      </span>
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
