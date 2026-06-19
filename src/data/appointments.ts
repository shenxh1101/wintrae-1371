import { Appointment } from '@/types';

export const appointments: Appointment[] = [
  {
    id: 'ap1',
    title: '高血压定期复查',
    hospital: '市第一人民医院',
    department: '心血管内科',
    doctor: '王主任',
    date: '2026-06-28',
    time: '09:30',
    notes: '携带近期血压记录，复查血脂、肝肾功能',
    status: 'upcoming',
    isReminder: true
  },
  {
    id: 'ap2',
    title: '糖尿病随访',
    hospital: '市中医院',
    department: '内分泌科',
    doctor: '李医生',
    date: '2026-07-05',
    time: '14:00',
    notes: '检查糖化血红蛋白，调整降糖方案',
    status: 'upcoming',
    isReminder: true
  },
  {
    id: 'ap3',
    title: '全科体检',
    hospital: '市第一人民医院',
    department: '体检中心',
    date: '2026-07-15',
    time: '08:00',
    notes: '空腹8小时，提前3天清淡饮食',
    status: 'upcoming',
    isReminder: false
  },
  {
    id: 'ap4',
    title: '抗生素疗程复查',
    hospital: '社区卫生服务中心',
    department: '全科',
    doctor: '张医生',
    date: '2026-06-17',
    time: '10:00',
    notes: '阿莫西林疗程结束，确认感染控制情况',
    prescriptionImage: 'https://picsum.photos/id/431/750/500',
    status: 'completed',
    isReminder: true
  },
  {
    id: 'ap5',
    title: '血脂检查',
    hospital: '市第一人民医院',
    department: '心血管内科',
    doctor: '王主任',
    date: '2026-05-25',
    time: '09:00',
    notes: '服用他汀类药物3个月后复查',
    prescriptionImage: 'https://picsum.photos/id/431/750/500',
    status: 'completed',
    isReminder: true
  },
  {
    id: 'ap6',
    title: '口腔科检查',
    hospital: '市口腔医院',
    department: '牙周科',
    date: '2026-05-10',
    time: '15:30',
    status: 'cancelled',
    isReminder: false
  }
];

export default appointments;
