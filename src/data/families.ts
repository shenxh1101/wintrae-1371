import { FamilyMember } from '@/types';

export const familyMembers: FamilyMember[] = [
  {
    id: 'f1',
    name: '父亲',
    relationship: '父亲',
    phone: '138****5678',
    avatar: 'https://picsum.photos/id/64/200/200',
    isSyncEnabled: true,
    permissions: ['查看记录', '接收提醒', '编辑药品']
  },
  {
    id: 'f2',
    name: '母亲',
    relationship: '母亲',
    phone: '139****1234',
    avatar: 'https://picsum.photos/id/91/200/200',
    isSyncEnabled: true,
    permissions: ['查看记录', '接收提醒']
  },
  {
    id: 'f3',
    name: '妻子',
    relationship: '配偶',
    phone: '137****9012',
    avatar: 'https://picsum.photos/id/177/200/200',
    isSyncEnabled: true,
    permissions: ['查看记录', '接收提醒', '编辑药品', '管理家属']
  },
  {
    id: 'f4',
    name: '张医生',
    relationship: '家庭医生',
    phone: '135****3456',
    avatar: 'https://picsum.photos/id/338/200/200',
    isSyncEnabled: false,
    permissions: ['查看记录', '导出报告']
  }
];

export default familyMembers;
