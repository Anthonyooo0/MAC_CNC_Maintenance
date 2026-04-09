export type MachineType = 'cnc-lathe' | 'manual-lathe' | 'cnc-mill' | 'manual-mill';

export interface Machine {
  id: string;
  name: string;
  type: MachineType;
  status?: 'active' | 'down';
  weekly?: string[];
  monthly?: string[];
  videos?: {
    weekly?: string;
    monthly?: string;
  };
}

export type Frequency = 'weekly' | 'monthly';

export interface MaintenanceRecord {
  id: number;
  machine_id: string;
  machine_name: string;
  machine_type: MachineType;
  frequency: Frequency;
  operator_email: string;
  completed_date: string;
  completed_items: number[];
  total_items: number;
  notes?: string;
  created_at: string;
}

export interface ScheduleItem {
  id: number;
  machine_id: string;
  machine_name: string;
  frequency: Frequency;
  scheduled_date: string;
  completed: boolean;
  completed_by?: string;
  completed_date?: string;
}

export interface ChangeLogEntry {
  id: string;
  created_at: string;
  timestamp: string;
  userEmail: string;
  projectId: number;
  projectInfo: string;
  action: string;
  changes: string;
}

export type ViewPage =
  | 'dashboard'
  | 'checklists'
  | 'schedule'
  | 'machines'
  | 'reports'
  | 'changelog';

export type ToastType = 'success' | 'warning' | 'error';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}
