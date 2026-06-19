import { create } from 'zustand';
import Taro from '@tarojs/taro';
import {
  Medicine,
  Reminder,
  DailyRecord,
  VitalsRecord,
  AbnormalRecord,
  Appointment,
  FamilyMember,
  ReminderStatus,
  ReminderTime,
  FrequencyType
} from '@/types';
import { medicines as seedMedicines } from '@/data/medicines';
import { reminders as seedReminders } from '@/data/reminders';
import { dailyRecords as seedDailyRecords, vitalsRecords as seedVitals, abnormalRecords as seedAbnormal } from '@/data/records';
import { appointments as seedAppointments } from '@/data/appointments';
import { familyMembers as seedFamilies } from '@/data/families';

const STORAGE_KEY = 'family_med_app_state_v1';

interface AppState {
  medicines: Medicine[];
  reminders: Reminder[];
  dailyRecords: DailyRecord[];
  vitalsRecords: VitalsRecord[];
  abnormalRecords: AbnormalRecord[];
  appointments: Appointment[];
  familyMembers: FamilyMember[];

  hydrate: () => void;
  persist: () => void;

  addMedicine: (data: Omit<Medicine, 'id' | 'createdAt'>) => void;
  updateMedicine: (id: string, data: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;
  updateMedicineStock: (id: string, delta: number) => void;
  savePrescriptionToMedicine: (medicineId: string, imageUrl: string) => void;

  takeReminder: (reminderId: string) => void;
  delayReminder: (reminderId: string, delayMinutes?: number) => void;
  missReminder: (reminderId: string, note?: string) => void;
  regenerateTodayReminders: () => void;

  addVitalsRecord: (data: Omit<VitalsRecord, 'id'>) => void;

  addAppointment: (data: Omit<Appointment, 'id'>) => void;
  updateAppointment: (id: string, data: Partial<Appointment>) => void;
  toggleAppointmentReminder: (id: string) => void;
  savePrescriptionToAppointment: (appointmentId: string, imageUrl: string) => void;

  addFamilyMember: (data: Omit<FamilyMember, 'id'>) => void;
  updateFamilyMember: (id: string, data: Partial<FamilyMember>) => void;
  deleteFamilyMember: (id: string) => void;
  toggleFamilySync: (id: string) => void;

  getTodayStats: () => { total: number; taken: number; delayed: number; missed: number; pending: number; adherenceRate: number };
  getAverageVitals: () => { avgSystolic: number; avgDiastolic: number; avgBloodSugar: number; avgPulse: number };
  getAdherenceRateHistory: (days: number) => DailyRecord[];
  generateDoctorReport: () => string;
}

const genId = (prefix = '') =>
  prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const getTodayStr = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

const getNowTimeStr = () => {
  const d = new Date();
  return d.toTimeString().slice(0, 5);
};

const calcAdherenceRate = (taken: number, total: number) =>
  total === 0 ? 100 : Math.round((taken / total) * 100);

const buildDailyRecordsFromReminders = (
  reminders: Reminder[],
  existingRecords: DailyRecord[]
): DailyRecord[] => {
  const map = new Map<string, DailyRecord>();
  existingRecords.forEach((r) => map.set(r.date, { ...r }));

  reminders.forEach((rem) => {
    const rec = map.get(rem.date) || {
      date: rem.date,
      totalCount: 0,
      takenCount: 0,
      delayedCount: 0,
      missedCount: 0,
      adherenceRate: 100
    };
    rec.totalCount += 1;
    if (rem.status === 'taken') rec.takenCount += 1;
    else if (rem.status === 'delayed') rec.delayedCount += 1;
    else if (rem.status === 'missed') rec.missedCount += 1;
    map.set(rem.date, rec);
  });

  return Array.from(map.values())
    .map((r) => ({
      ...r,
      adherenceRate: calcAdherenceRate(r.takenCount + r.delayedCount * 0.5, r.totalCount)
    }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
};

export const useAppStore = create<AppState>((set, get) => ({
  medicines: [],
  reminders: [],
  dailyRecords: [],
  vitalsRecords: [],
  abnormalRecords: [],
  appointments: [],
  familyMembers: [],

  hydrate: () => {
    try {
      const raw = Taro.getStorageSync(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        set({
          medicines: parsed.medicines || seedMedicines,
          reminders: parsed.reminders || seedReminders,
          dailyRecords: parsed.dailyRecords || seedDailyRecords,
          vitalsRecords: parsed.vitalsRecords || seedVitals,
          abnormalRecords: parsed.abnormalRecords || seedAbnormal,
          appointments: parsed.appointments || seedAppointments,
          familyMembers: parsed.familyMembers || seedFamilies
        });
      } else {
        set({
          medicines: seedMedicines,
          reminders: seedReminders,
          dailyRecords: seedDailyRecords,
          vitalsRecords: seedVitals,
          abnormalRecords: seedAbnormal,
          appointments: seedAppointments,
          familyMembers: seedFamilies
        });
        get().persist();
      }
    } catch (e) {
      console.error('hydrate failed', e);
      set({
        medicines: seedMedicines,
        reminders: seedReminders,
        dailyRecords: seedDailyRecords,
        vitalsRecords: seedVitals,
        abnormalRecords: seedAbnormal,
        appointments: seedAppointments,
        familyMembers: seedFamilies
      });
    }
  },

  persist: () => {
    try {
      const s = get();
      Taro.setStorageSync(
        STORAGE_KEY,
        JSON.stringify({
          medicines: s.medicines,
          reminders: s.reminders,
          dailyRecords: s.dailyRecords,
          vitalsRecords: s.vitalsRecords,
          abnormalRecords: s.abnormalRecords,
          appointments: s.appointments,
          familyMembers: s.familyMembers
        })
      );
    } catch (e) {
      console.error('persist failed', e);
    }
  },

  addMedicine: (data) => {
    const newMed: Medicine = {
      ...data,
      id: genId('m_'),
      createdAt: getTodayStr()
    };
    set((s) => ({ medicines: [...s.medicines, newMed] }));
    get().persist();
  },

  updateMedicine: (id, data) => {
    set((s) => ({
      medicines: s.medicines.map((m) => (m.id === id ? { ...m, ...data } : m))
    }));
    get().persist();
  },

  deleteMedicine: (id) => {
    set((s) => ({
      medicines: s.medicines.filter((m) => m.id !== id),
      reminders: s.reminders.filter((r) => r.medicineId !== id)
    }));
    get().persist();
  },

  updateMedicineStock: (id, delta) => {
    set((s) => ({
      medicines: s.medicines.map((m) =>
        m.id === id ? { ...m, stock: Math.max(0, m.stock + delta) } : m
      )
    }));
    get().persist();
  },

  savePrescriptionToMedicine: (medicineId, imageUrl) => {
    set((s) => ({
      medicines: s.medicines.map((m) =>
        m.id === medicineId ? { ...m, prescriptionImage: imageUrl } : m
      )
    }));
    get().persist();
  },

  takeReminder: (reminderId) => {
    const state = get();
    const reminder = state.reminders.find((r) => r.id === reminderId);
    if (!reminder || reminder.status === 'taken') return;

    set((s) => ({
      reminders: s.reminders.map((r) =>
        r.id === reminderId
          ? { ...r, status: 'taken' as ReminderStatus, actualTime: getNowTimeStr() }
          : r
      )
    }));
    get().updateMedicineStock(reminder.medicineId, -1);

    const { reminders, dailyRecords } = get();
    const newDaily = buildDailyRecordsFromReminders(reminders, dailyRecords);
    set({ dailyRecords: newDaily });
    get().persist();
  },

  delayReminder: (reminderId, delayMinutes = 30) => {
    const state = get();
    const reminder = state.reminders.find((r) => r.id === reminderId);
    if (!reminder || reminder.status === 'taken') return;

    const [h, m] = reminder.time.split(':').map(Number);
    const newTime = new Date();
    newTime.setHours(h, m + delayMinutes, 0, 0);
    const newTimeStr = newTime.toTimeString().slice(0, 5);

    set((s) => ({
      reminders: s.reminders.map((r) =>
        r.id === reminderId
          ? {
              ...r,
              status: 'delayed' as ReminderStatus,
              actualTime: getNowTimeStr(),
              time: newTimeStr
            }
          : r
      )),
      abnormalRecords: [
        {
          id: genId('a_'),
          date: getTodayStr(),
          medicineName: reminder.medicineName,
          type: 'delayed',
          time: reminder.time,
          note: `延后${delayMinutes}分钟`
        },
        ...s.abnormalRecords
      ]
    }));

    const { reminders, dailyRecords } = get();
    const newDaily = buildDailyRecordsFromReminders(reminders, dailyRecords);
    set({ dailyRecords: newDaily });
    get().persist();
  },

  missReminder: (reminderId, note) => {
    const state = get();
    const reminder = state.reminders.find((r) => r.id === reminderId);
    if (!reminder) return;

    set((s) => ({
      reminders: s.reminders.map((r) =>
        r.id === reminderId
          ? { ...r, status: 'missed' as ReminderStatus, note }
          : r
      )),
      abnormalRecords: [
        {
          id: genId('a_'),
          date: getTodayStr(),
          medicineName: reminder.medicineName,
          type: 'missed',
          time: reminder.time,
          note
        },
        ...s.abnormalRecords
      ]
    }));

    const { reminders, dailyRecords } = get();
    const newDaily = buildDailyRecordsFromReminders(reminders, dailyRecords);
    set({ dailyRecords: newDaily });
    get().persist();
  },

  regenerateTodayReminders: () => {
    const today = getTodayStr();
    const state = get();
    const existingToday = state.reminders.filter((r) => r.date === today);
    if (existingToday.length > 0) return;

    const newReminders: Reminder[] = [];
    state.medicines.forEach((med) => {
      med.reminderTimes.forEach((t, idx) => {
        newReminders.push({
          id: genId('r_'),
          medicineId: med.id,
          medicineName: med.name,
          dose: med.dose,
          time: t,
          reminderType: med.reminderType[idx] || 'custom',
          status: 'pending',
          date: today
        });
      });
    });
    set((s) => ({ reminders: [...s.reminders, ...newReminders] }));
    get().persist();
  },

  addVitalsRecord: (data) => {
    const rec: VitalsRecord = { ...data, id: genId('v_') };
    set((s) => ({ vitalsRecords: [rec, ...s.vitalsRecords] }));
    get().persist();
  },

  addAppointment: (data) => {
    const ap: Appointment = { ...data, id: genId('ap_') };
    set((s) => ({ appointments: [...s.appointments, ap] }));
    get().persist();
  },

  updateAppointment: (id, data) => {
    set((s) => ({
      appointments: s.appointments.map((a) => (a.id === id ? { ...a, ...data } : a))
    }));
    get().persist();
  },

  toggleAppointmentReminder: (id) => {
    set((s) => ({
      appointments: s.appointments.map((a) =>
        a.id === id ? { ...a, isReminder: !a.isReminder } : a
      )
    }));
    get().persist();
  },

  savePrescriptionToAppointment: (appointmentId, imageUrl) => {
    set((s) => ({
      appointments: s.appointments.map((a) =>
        a.id === appointmentId ? { ...a, prescriptionImage: imageUrl } : a
      )
    }));
    get().persist();
  },

  addFamilyMember: (data) => {
    const f: FamilyMember = { ...data, id: genId('f_') };
    set((s) => ({ familyMembers: [...s.familyMembers, f] }));
    get().persist();
  },

  updateFamilyMember: (id, data) => {
    set((s) => ({
      familyMembers: s.familyMembers.map((f) =>
        f.id === id ? { ...f, ...data } : f
      )
    }));
    get().persist();
  },

  deleteFamilyMember: (id) => {
    set((s) => ({
      familyMembers: s.familyMembers.filter((f) => f.id !== id)
    }));
    get().persist();
  },

  toggleFamilySync: (id) => {
    set((s) => ({
      familyMembers: s.familyMembers.map((f) =>
        f.id === id ? { ...f, isSyncEnabled: !f.isSyncEnabled } : f
      )
    }));
    get().persist();
  },

  getTodayStats: () => {
    const today = getTodayStr();
    const todayReminders = get().reminders.filter((r) => r.date === today);
    const total = todayReminders.length;
    const taken = todayReminders.filter((r) => r.status === 'taken').length;
    const delayed = todayReminders.filter((r) => r.status === 'delayed').length;
    const missed = todayReminders.filter((r) => r.status === 'missed').length;
    const pending = todayReminders.filter((r) => r.status === 'pending').length;
    const effective = taken + delayed * 0.5;
    const adherenceRate = total === 0 ? 100 : Math.round((effective / total) * 100);
    return { total, taken, delayed, missed, pending, adherenceRate };
  },

  getAverageVitals: () => {
    const records = get().vitalsRecords.slice(0, 7);
    const calcAvg = (key: keyof VitalsRecord) => {
      const vals = records
        .map((r) => r[key])
        .filter((v): v is number => typeof v === 'number');
      if (vals.length === 0) return 0;
      return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
    };
    return {
      avgSystolic: calcAvg('systolic'),
      avgDiastolic: calcAvg('diastolic'),
      avgBloodSugar: calcAvg('bloodSugar'),
      avgPulse: calcAvg('pulse')
    };
  },

  getAdherenceRateHistory: (days) => {
    const all = get().dailyRecords.sort((a, b) => (a.date < b.date ? 1 : -1));
    return all.slice(0, days).reverse();
  },

  generateDoctorReport: () => {
    const s = get();
    const stats = s.getTodayStats();
    const avg = s.getAverageVitals();
    const upcomingApts = s.appointments.filter((a) => a.status === 'upcoming');
    const abnormalRecent = s.abnormalRecords.slice(0, 10);
    const activeMeds = s.medicines;

    const lines: string[] = [];
    lines.push('=== 家庭用药与健康报告 ===');
    lines.push('');
    lines.push(`生成日期：${getTodayStr()}`);
    lines.push('');
    lines.push('【一、当前用药清单】');
    activeMeds.forEach((m, i) => {
      lines.push(
        `${i + 1}. ${m.name} - ${m.dose}，${m.frequencyDetail}，疗程：${m.duration}`
      );
      lines.push(`   库存：${m.stock}片，注意事项：${m.precautions}`);
    });
    lines.push('');
    lines.push('【二、近30天服药情况】');
    lines.push(
      `    今日服药率：${stats.adherenceRate}%（已服${stats.taken}次/延后${stats.delayed}次/漏服${stats.missed}次/待服${stats.pending}次）`
    );
    const history = s.getAdherenceRateHistory(30);
    if (history.length > 0) {
      const avgRate =
        Math.round(
          history.reduce((a, b) => a + b.adherenceRate, 0) / history.length
        ) || 100;
      lines.push(`    30天平均服药率：${avgRate}%`);
    }
    lines.push('');
    lines.push('【三、体征监测（近7天平均值）】');
    lines.push(
      `    血压：${avg.avgSystolic || '--'}/${avg.avgDiastolic || '--'} mmHg`
    );
    lines.push(`    空腹血糖：${avg.avgBloodSugar || '--'} mmol/L`);
    lines.push(`    心率：${avg.avgPulse || '--'} 次/分`);
    lines.push('');
    lines.push('【四、异常服药记录（最近10条）】');
    if (abnormalRecent.length === 0) {
      lines.push('    无异常记录');
    } else {
      abnormalRecent.forEach((a) => {
        lines.push(
          `    ${a.date} ${a.time} - ${a.medicineName} ${a.type === 'missed' ? '漏服' : '延后'}${a.note ? '：' + a.note : ''}`
        );
      });
    }
    lines.push('');
    lines.push('【五、近期复诊安排】');
    if (upcomingApts.length === 0) {
      lines.push('    暂无待就诊预约');
    } else {
      upcomingApts.forEach((a) => {
        lines.push(
          `    ${a.date} ${a.time} - ${a.hospital} ${a.department}${a.doctor ? '（' + a.doctor + '）' : ''}：${a.title}`
        );
      });
    }
    lines.push('');
    lines.push('=== 报告结束 ===');

    return lines.join('\n');
  }
}));

export default useAppStore;
