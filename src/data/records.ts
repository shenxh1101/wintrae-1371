import { DailyRecord, VitalsRecord, AbnormalRecord } from '@/types';

export const dailyRecords: DailyRecord[] = Array.from({ length: 14 }, (_, i) => {
  const date = new Date(2026, 5, 20 - i);
  const dateStr = date.toISOString().split('T')[0];
  const rates = [100, 100, 85, 100, 92, 100, 78, 100, 100, 88, 95, 100, 80, 100];
  const adherenceRate = rates[i] || 100;
  const totalCount = 8;
  const missed = totalCount * (100 - adherenceRate) / 100;
  const delayed = Math.floor(missed * 0.6);
  const missedCount = Math.floor(missed * 0.4);
  const takenCount = totalCount - delayed - missedCount;
  return {
    date: dateStr,
    totalCount,
    takenCount,
    delayedCount: delayed,
    missedCount,
    adherenceRate
  };
}).reverse();

export const vitalsRecords: VitalsRecord[] = [
  {
    id: 'v1',
    date: '2026-06-20',
    time: '07:30',
    systolic: 132,
    diastolic: 85,
    bloodSugar: 6.8,
    pulse: 72
  },
  {
    id: 'v2',
    date: '2026-06-19',
    time: '07:25',
    systolic: 128,
    diastolic: 82,
    bloodSugar: 6.5,
    pulse: 70
  },
  {
    id: 'v3',
    date: '2026-06-18',
    time: '07:35',
    systolic: 135,
    diastolic: 88,
    bloodSugar: 7.2,
    pulse: 75
  },
  {
    id: 'v4',
    date: '2026-06-17',
    time: '07:28',
    systolic: 130,
    diastolic: 84,
    bloodSugar: 6.3,
    pulse: 68
  },
  {
    id: 'v5',
    date: '2026-06-16',
    time: '07:40',
    systolic: 142,
    diastolic: 90,
    bloodSugar: 7.5,
    pulse: 78,
    note: '今日血压偏高，已咨询医生'
  },
  {
    id: 'v6',
    date: '2026-06-15',
    time: '07:30',
    systolic: 136,
    diastolic: 86,
    bloodSugar: 6.9,
    pulse: 73
  },
  {
    id: 'v7',
    date: '2026-06-14',
    time: '07:32',
    systolic: 129,
    diastolic: 81,
    bloodSugar: 6.4,
    pulse: 71
  }
];

export const abnormalRecords: AbnormalRecord[] = [
  {
    id: 'a1',
    date: '2026-06-18',
    medicineName: '阿托伐他汀钙片',
    type: 'missed',
    time: '22:00',
    note: '加班忘记服用'
  },
  {
    id: 'a2',
    date: '2026-06-17',
    medicineName: '二甲双胍缓释片',
    type: 'delayed',
    time: '18:30',
    note: '聚餐后延迟2小时'
  },
  {
    id: 'a3',
    date: '2026-06-14',
    medicineName: '阿莫西林胶囊',
    type: 'delayed',
    time: '12:30',
    note: '中午外出延迟'
  },
  {
    id: 'a4',
    date: '2026-06-13',
    medicineName: '硝苯地平控释片',
    type: 'missed',
    time: '07:00',
    note: '早起赶车忘记'
  },
  {
    id: 'a5',
    date: '2026-06-11',
    medicineName: '奥美拉唑肠溶胶囊',
    type: 'delayed',
    time: '07:00',
    note: '空腹时间不足'
  }
];

export default dailyRecords;
