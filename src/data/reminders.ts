import { Reminder } from '@/types';

const today = '2026-06-20';

export const reminders: Reminder[] = [
  {
    id: 'r1',
    medicineId: '3',
    medicineName: '硝苯地平控释片',
    dose: '30mg',
    time: '07:00',
    reminderType: 'before_meal',
    status: 'taken',
    actualTime: '07:05',
    date: today
  },
  {
    id: 'r2',
    medicineId: '6',
    medicineName: '奥美拉唑肠溶胶囊',
    dose: '20mg',
    time: '07:00',
    reminderType: 'before_meal',
    status: 'taken',
    actualTime: '07:05',
    date: today
  },
  {
    id: 'r3',
    medicineId: '1',
    medicineName: '阿莫西林胶囊',
    dose: '0.5g',
    time: '08:00',
    reminderType: 'after_meal',
    status: 'taken',
    actualTime: '08:12',
    date: today
  },
  {
    id: 'r4',
    medicineId: '2',
    medicineName: '二甲双胍缓释片',
    dose: '0.5g',
    time: '08:00',
    reminderType: 'after_meal',
    status: 'taken',
    actualTime: '08:10',
    date: today
  },
  {
    id: 'r5',
    medicineId: '4',
    medicineName: '维生素D3滴剂',
    dose: '400IU',
    time: '08:30',
    reminderType: 'after_meal',
    status: 'delayed',
    actualTime: '09:20',
    date: today,
    note: '外出买菜延迟服用'
  },
  {
    id: 'r6',
    medicineId: '8',
    medicineName: '碳酸钙D3片',
    dose: '1.2g',
    time: '12:30',
    reminderType: 'after_meal',
    status: 'pending',
    date: today
  },
  {
    id: 'r7',
    medicineId: '1',
    medicineName: '阿莫西林胶囊',
    dose: '0.5g',
    time: '12:30',
    reminderType: 'after_meal',
    status: 'pending',
    date: today
  },
  {
    id: 'r8',
    medicineId: '1',
    medicineName: '阿莫西林胶囊',
    dose: '0.5g',
    time: '18:30',
    reminderType: 'after_meal',
    status: 'pending',
    date: today
  },
  {
    id: 'r9',
    medicineId: '2',
    medicineName: '二甲双胍缓释片',
    dose: '0.5g',
    time: '18:30',
    reminderType: 'after_meal',
    status: 'pending',
    date: today
  },
  {
    id: 'r10',
    medicineId: '5',
    medicineName: '阿托伐他汀钙片',
    dose: '20mg',
    time: '22:00',
    reminderType: 'before_sleep',
    status: 'pending',
    date: today
  }
];

export default reminders;
