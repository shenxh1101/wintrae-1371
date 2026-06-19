export type ReminderStatus = 'pending' | 'taken' | 'delayed' | 'missed';

export type ReminderTime = 'before_meal' | 'after_meal' | 'before_sleep' | 'custom';

export type FrequencyType = 'daily' | 'weekly' | 'interval';

export interface Medicine {
  id: string;
  name: string;
  dose: string;
  frequency: FrequencyType;
  frequencyDetail: string;
  duration: string;
  precautions: string;
  reminderTimes: string[];
  reminderType: ReminderTime[];
  stock: number;
  stockThreshold: number;
  prescriptionImage?: string;
  createdAt: string;
  category: string;
}

export interface Reminder {
  id: string;
  medicineId: string;
  medicineName: string;
  dose: string;
  time: string;
  reminderType: ReminderTime;
  status: ReminderStatus;
  actualTime?: string;
  date: string;
  note?: string;
}

export interface DailyRecord {
  date: string;
  totalCount: number;
  takenCount: number;
  delayedCount: number;
  missedCount: number;
  adherenceRate: number;
}

export interface VitalsRecord {
  id: string;
  date: string;
  time: string;
  systolic?: number;
  diastolic?: number;
  bloodSugar?: number;
  pulse?: number;
  temperature?: number;
  note?: string;
}

export interface Appointment {
  id: string;
  title: string;
  hospital: string;
  department: string;
  doctor?: string;
  date: string;
  time: string;
  notes?: string;
  prescriptionImage?: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  isReminder: boolean;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  avatar: string;
  isSyncEnabled: boolean;
  permissions: string[];
}

export interface AbnormalRecord {
  id: string;
  date: string;
  medicineName: string;
  type: 'missed' | 'delayed';
  time: string;
  note?: string;
}
