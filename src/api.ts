import { IS_DEV_MODE, mockApi } from './devMode';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`API Error ${res.status}: ${error}`);
  }
  return res.json();
}

const realApi = {
  records: {
    list: (params?: { machineId?: string; startDate?: string; endDate?: string }) => {
      const query = new URLSearchParams();
      if (params?.machineId) query.set('machineId', params.machineId);
      if (params?.startDate) query.set('startDate', params.startDate);
      if (params?.endDate) query.set('endDate', params.endDate);
      const qs = query.toString();
      return apiFetch<any[]>(`/records${qs ? `?${qs}` : ''}`);
    },
    create: (data: any) =>
      apiFetch<any>('/records', { method: 'POST', body: JSON.stringify(data) }),
  },
  schedule: {
    list: (params?: { filter?: string }) => {
      const qs = params?.filter ? `?filter=${params.filter}` : '';
      return apiFetch<any[]>(`/schedule${qs}`);
    },
    complete: (id: number, userEmail: string) =>
      apiFetch<any>(`/schedule/${id}/complete`, {
        method: 'PUT',
        body: JSON.stringify({ userEmail }),
      }),
  },
  machines: {
    stats: () => apiFetch<any[]>('/machines/stats'),
  },
  reports: {
    completion: (startDate: string, endDate: string) =>
      apiFetch<any>(`/reports/completion?startDate=${startDate}&endDate=${endDate}`),
    byMachine: (startDate: string, endDate: string) =>
      apiFetch<any[]>(`/reports/by-machine?startDate=${startDate}&endDate=${endDate}`),
    byOperator: (startDate: string, endDate: string) =>
      apiFetch<any[]>(`/reports/by-operator?startDate=${startDate}&endDate=${endDate}`),
    timeline: (startDate: string, endDate: string) =>
      apiFetch<any[]>(`/reports/timeline?startDate=${startDate}&endDate=${endDate}`),
  },
  changelog: {
    list: () => apiFetch<any[]>('/changelog'),
  },
};

export const api = IS_DEV_MODE ? mockApi : realApi;
