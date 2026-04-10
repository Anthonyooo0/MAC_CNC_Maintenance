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
  if (res.status === 204) return undefined as any;
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
    update: (id: number, data: any) =>
      apiFetch<any>(`/records/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  schedule: {
    list: (params?: { filter?: string }) => {
      const qs = params?.filter ? `?filter=${params.filter}` : '';
      return apiFetch<any[]>(`/schedule${qs}`);
    },
    create: (data: any) =>
      apiFetch<any>('/schedule', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) =>
      apiFetch<any>(`/schedule/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    complete: (id: number, userEmail: string) =>
      apiFetch<any>(`/schedule/${id}/complete`, {
        method: 'PUT',
        body: JSON.stringify({ userEmail }),
      }),
    delete: (id: number, userEmail: string) =>
      apiFetch<void>(`/schedule/${id}?userEmail=${encodeURIComponent(userEmail)}`, { method: 'DELETE' }),
  },
  machines: {
    list: () => apiFetch<any[]>('/machines'),
    get: (id: number) => apiFetch<any>(`/machines/${id}`),
    create: (data: any) =>
      apiFetch<any>('/machines', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) =>
      apiFetch<any>(`/machines/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number, userEmail: string) =>
      apiFetch<void>(`/machines/${id}?userEmail=${encodeURIComponent(userEmail)}`, { method: 'DELETE' }),
    stats: () => apiFetch<any[]>('/stats/machines'),
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
