// Dev mode: bypass MSAL auth and provide mock API responses
// Set VITE_DEV_MODE=true in .env or .env.local to enable

export const IS_DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';
export const DEV_USER = 'dev.user@macproducts.net';

// Mock data store (in-memory)
let mockRecords: any[] = [];
let mockChangelog: any[] = [];
let mockScheduleIdCounter = 1000;

function generateMockSchedule() {
  const machines = [
    { id: 'doosan-lynx-220l', name: 'DOOSAN LYNX 220L', freqs: ['weekly', 'monthly'] },
    { id: 'dn-puma-v8300m', name: 'DN Puma V8300M', freqs: ['weekly', 'monthly'] },
    { id: 'haas-st20y', name: 'HAAS ST20Y', freqs: ['weekly', 'monthly'] },
    { id: 'haas-ds-30y', name: 'HAAS DS-30Y', freqs: ['weekly', 'monthly'] },
    { id: 'c10msm-2540', name: 'C10MSM - 2540', freqs: ['monthly'] },
    { id: 'sn50b-20497', name: 'SN50B - 20497', freqs: ['monthly'] },
    { id: 'prototrak-2op', name: 'PROTOTRAK 2OP', freqs: ['weekly', 'monthly'] },
    { id: 'haas-vf1', name: 'HAAS VF1', freqs: ['weekly', 'monthly'] },
    { id: 'haas-vf6ss', name: 'HAAS VF6SS', freqs: ['weekly', 'monthly'] },
    { id: 'haas-umc-750-robot', name: 'HAAS UMC-750 Robot', freqs: ['weekly', 'monthly'] },
    { id: 'nhx-5000', name: 'NHX 5000', freqs: ['weekly', 'monthly'] },
    { id: 'acer-accurite', name: 'ACER ACCURITE', freqs: ['monthly'] },
    { id: 'bridgeport-kmx', name: 'BRIDGEPORT KMX', freqs: ['monthly'] },
  ];

  const items: any[] = [];
  const today = new Date();

  machines.forEach((m) => {
    m.freqs.forEach((freq) => {
      const count = freq === 'weekly' ? 6 : 3;
      for (let i = -2; i < count; i++) {
        const d = new Date(today);
        if (freq === 'weekly') d.setDate(d.getDate() + i * 7);
        else d.setMonth(d.getMonth() + i);
        items.push({
          id: mockScheduleIdCounter++,
          machine_id: m.id,
          machine_name: m.name,
          frequency: freq,
          scheduled_date: d.toISOString().split('T')[0],
          completed: i < -1 ? true : false,
          completed_by: i < -1 ? DEV_USER : null,
          completed_date: i < -1 ? d.toISOString().split('T')[0] : null,
        });
      }
    });
  });

  return items;
}

let mockSchedule = generateMockSchedule();

// Mock API that mirrors the real api.ts interface
export const mockApi = {
  records: {
    list: async (_params?: any) => mockRecords,
    create: async (data: any) => {
      const record = { id: Date.now(), ...data, created_at: new Date().toISOString() };
      mockRecords.unshift(record);
      mockChangelog.unshift({
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        timestamp: new Date().toLocaleString(),
        user_email: data.operator_email,
        project_id: record.id,
        project_info: `${data.machine_name} (${data.frequency})`,
        action: 'Checklist Completed',
        changes: `${Array.isArray(data.completed_items) ? data.completed_items.length : 0}/${data.total_items} tasks completed`,
      });
      return record;
    },
  },
  schedule: {
    list: async (params?: { filter?: string }) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekOut = new Date(today);
      weekOut.setDate(weekOut.getDate() + 7);

      if (params?.filter === 'overdue') {
        return mockSchedule.filter((s) => !s.completed && new Date(s.scheduled_date) < today);
      }
      if (params?.filter === 'upcoming') {
        return mockSchedule.filter(
          (s) => !s.completed && new Date(s.scheduled_date) >= today && new Date(s.scheduled_date) <= weekOut
        );
      }
      return mockSchedule;
    },
    create: async (data: any) => {
      const item = { id: mockScheduleIdCounter++, ...data, completed: false };
      mockSchedule.push(item);
      return item;
    },
    update: async (id: number, data: any) => {
      const item = mockSchedule.find((s) => s.id === id);
      if (item) {
        if (data.scheduled_date) item.scheduled_date = data.scheduled_date;
        if (data.frequency) item.frequency = data.frequency;
      }
      return item;
    },
    complete: async (id: number, userEmail: string) => {
      const item = mockSchedule.find((s) => s.id === id);
      if (item) {
        item.completed = true;
        item.completed_by = userEmail;
        item.completed_date = new Date().toISOString().split('T')[0];
        mockChangelog.unshift({
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          timestamp: new Date().toLocaleString(),
          user_email: userEmail,
          project_id: id,
          project_info: `${item.machine_name} (${item.frequency})`,
          action: 'Schedule Completed',
          changes: `Marked scheduled ${item.frequency} maintenance as complete`,
        });
      }
      return item;
    },
    delete: async (id: number, _userEmail: string) => {
      mockSchedule = mockSchedule.filter((s) => s.id !== id);
    },
  },
  machines: {
    list: async () => {
      // Return machines from constants as mock DB data
      const { getAllMachines } = await import('./constants');
      return getAllMachines().map((m, i) => ({
        id: i + 1,
        machine_id: m.id,
        name: m.name,
        type: m.type,
        status: m.status || 'active',
        weekly_tasks: m.weekly || [],
        monthly_tasks: m.monthly || [],
        video_weekly: m.videos?.weekly || null,
        video_monthly: m.videos?.monthly || null,
      }));
    },
    get: async (id: number) => {
      const list = await mockApi.machines.list();
      return list.find((m: any) => m.id === id);
    },
    create: async (data: any) => ({ id: Date.now(), machine_id: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), ...data }),
    update: async (_id: number, data: any) => data,
    delete: async (_id: number, _userEmail: string) => {},
    stats: async () => {
      const groups: Record<string, any> = {};
      mockRecords.forEach((r) => {
        if (!groups[r.machine_id]) {
          groups[r.machine_id] = {
            machine_id: r.machine_id,
            machine_name: r.machine_name,
            machine_type: r.machine_type,
            record_count: 0,
            last_maintenance: null,
            total_completion: 0,
          };
        }
        const g = groups[r.machine_id];
        g.record_count++;
        const completed = Array.isArray(r.completed_items) ? r.completed_items.length : 0;
        g.total_completion += r.total_items > 0 ? (completed / r.total_items) * 100 : 0;
        if (!g.last_maintenance || r.completed_date > g.last_maintenance) {
          g.last_maintenance = r.completed_date;
        }
      });
      return Object.values(groups).map((g: any) => ({
        ...g,
        avg_completion: g.record_count > 0 ? g.total_completion / g.record_count : 0,
      }));
    },
  },
  reports: {
    completion: async (startDate: string, endDate: string) => {
      const filtered = mockRecords.filter(
        (r) => r.completed_date >= startDate && r.completed_date <= endDate
      );
      const totalTasks = filtered.reduce((s, r) => s + r.total_items, 0);
      const completedTasks = filtered.reduce(
        (s, r) => s + (Array.isArray(r.completed_items) ? r.completed_items.length : 0),
        0
      );
      const weeklyRecs = filtered.filter((r) => r.frequency === 'weekly');
      const monthlyRecs = filtered.filter((r) => r.frequency === 'monthly');
      const calcRate = (recs: any[]) => {
        const t = recs.reduce((s, r) => s + r.total_items, 0);
        const c = recs.reduce((s, r) => s + (Array.isArray(r.completed_items) ? r.completed_items.length : 0), 0);
        return t > 0 ? Math.round((c / t) * 1000) / 10 : 0;
      };
      return {
        total_records: filtered.length,
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        overall_rate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 1000) / 10 : 0,
        weekly_count: weeklyRecs.length,
        weekly_rate: calcRate(weeklyRecs),
        monthly_count: monthlyRecs.length,
        monthly_rate: calcRate(monthlyRecs),
        records: filtered.map((r) => ({
          completed_date: r.completed_date,
          machine_name: r.machine_name,
          frequency: r.frequency,
          operator_email: r.operator_email,
          completed_count: Array.isArray(r.completed_items) ? r.completed_items.length : 0,
          total_items: r.total_items,
        })),
      };
    },
    byMachine: async (startDate: string, endDate: string) => {
      const filtered = mockRecords.filter(
        (r) => r.completed_date >= startDate && r.completed_date <= endDate
      );
      const groups: Record<string, any> = {};
      filtered.forEach((r) => {
        if (!groups[r.machine_id]) {
          groups[r.machine_id] = { machine_name: r.machine_name, machine_type: r.machine_type, record_count: 0, total_tasks: 0, completed_tasks: 0 };
        }
        groups[r.machine_id].record_count++;
        groups[r.machine_id].total_tasks += r.total_items;
        groups[r.machine_id].completed_tasks += Array.isArray(r.completed_items) ? r.completed_items.length : 0;
      });
      return Object.values(groups).map((g: any) => ({
        ...g,
        completion_rate: g.total_tasks > 0 ? Math.round((g.completed_tasks / g.total_tasks) * 1000) / 10 : 0,
      }));
    },
    byOperator: async (startDate: string, endDate: string) => {
      const filtered = mockRecords.filter(
        (r) => r.completed_date >= startDate && r.completed_date <= endDate
      );
      const groups: Record<string, any> = {};
      filtered.forEach((r) => {
        if (!groups[r.operator_email]) {
          groups[r.operator_email] = { operator_email: r.operator_email, record_count: 0, total_tasks: 0, completed_tasks: 0 };
        }
        groups[r.operator_email].record_count++;
        groups[r.operator_email].total_tasks += r.total_items;
        groups[r.operator_email].completed_tasks += Array.isArray(r.completed_items) ? r.completed_items.length : 0;
      });
      return Object.values(groups).map((g: any) => ({
        ...g,
        completion_rate: g.total_tasks > 0 ? Math.round((g.completed_tasks / g.total_tasks) * 1000) / 10 : 0,
      }));
    },
    timeline: async (startDate: string, endDate: string) => {
      return mockRecords
        .filter((r) => r.completed_date >= startDate && r.completed_date <= endDate)
        .map((r) => ({
          completed_date: r.completed_date,
          machine_name: r.machine_name,
          machine_type: r.machine_type,
          frequency: r.frequency,
          operator_email: r.operator_email,
          completed_count: Array.isArray(r.completed_items) ? r.completed_items.length : 0,
          total_items: r.total_items,
        }));
    },
  },
  changelog: {
    list: async () => mockChangelog,
  },
};
