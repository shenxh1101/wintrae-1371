import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Button, ScrollView, Image, Input, Picker, Switch } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import useAppStore from '@/store';
import { Appointment } from '@/types';
import AppointmentCard from '@/components/AppointmentCard';
import StatCard from '@/components/StatCard';

type FilterType = 'all' | 'upcoming' | 'completed';

const STATUS_OPTIONS: { value: 'upcoming' | 'completed' | 'cancelled'; label: string }[] = [
  { value: 'upcoming', label: '待就诊' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' }
];

const getTodayStr = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

const modalMaskStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'flex-end',
  zIndex: 1000
};

const modalContentStyle: React.CSSProperties = {
  width: '100%',
  maxHeight: '85vh',
  background: '#FFFFFF',
  borderRadius: '24rpx 24rpx 0 0',
  display: 'flex',
  flexDirection: 'column'
};

const modalTitleStyle: React.CSSProperties = {
  padding: '32rpx 32rpx 24rpx',
  fontSize: '36rpx',
  fontWeight: '700',
  color: '#0F172A',
  textAlign: 'center',
  borderBottom: '1rpx solid #F1F5F9'
};

const modalScrollStyle: React.CSSProperties = {
  flex: 1,
  padding: '24rpx 32rpx 32rpx',
  maxHeight: '60vh'
};

const formItemStyle: React.CSSProperties = {
  marginBottom: '24rpx'
};

const formLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '28rpx',
  fontWeight: '500',
  color: '#0F172A',
  marginBottom: '12rpx'
};

const formInputStyle: React.CSSProperties = {
  width: '100%',
  height: '80rpx',
  padding: '0 24rpx',
  background: '#F8FAFC',
  borderRadius: '16rpx',
  fontSize: '28rpx',
  color: '#0F172A',
  boxSizing: 'border-box'
};

const formPickerStyle: React.CSSProperties = {
  width: '100%',
  height: '80rpx',
  padding: '0 24rpx',
  background: '#F8FAFC',
  borderRadius: '16rpx',
  fontSize: '28rpx',
  color: '#0F172A',
  display: 'flex',
  alignItems: 'center',
  boxSizing: 'border-box'
};

const optionScrollStyle: React.CSSProperties = {
  display: 'flex',
  gap: '12rpx',
  whiteSpace: 'nowrap'
};

const optionBtnStyle: React.CSSProperties = {
  height: '64rpx',
  padding: '0 24rpx',
  background: '#F8FAFC',
  border: '1rpx solid #E2E8F0',
  borderRadius: '32rpx',
  fontSize: '24rpx',
  color: '#64748B',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const optionBtnActiveStyle: React.CSSProperties = {
  ...optionBtnStyle,
  background: 'linear-gradient(135deg, #22C55E 0%, #4ADE80 100%)',
  color: '#FFFFFF',
  border: 'none'
};

const switchRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 24rpx',
  height: '80rpx',
  background: '#F8FAFC',
  borderRadius: '16rpx'
};

const modalFooterStyle: React.CSSProperties = {
  display: 'flex',
  gap: '24rpx',
  padding: '24rpx 32rpx',
  paddingBottom: 'calc(24rpx + env(safe-area-inset-bottom))',
  borderTop: '1rpx solid #F1F5F9',
  background: '#FFFFFF'
};

const modalCancelStyle: React.CSSProperties = {
  flex: 1,
  height: '88rpx',
  background: '#F8FAFC',
  borderRadius: '44rpx',
  fontSize: '32rpx',
  fontWeight: '600',
  color: '#64748B',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const modalConfirmStyle: React.CSSProperties = {
  flex: 1,
  height: '88rpx',
  background: 'linear-gradient(135deg, #22C55E 0%, #4ADE80 100%)',
  borderRadius: '44rpx',
  fontSize: '32rpx',
  fontWeight: '600',
  color: '#FFFFFF',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 8rpx 20rpx rgba(34, 197, 94, 0.3)'
};

const AppointmentPage: React.FC = () => {
  const appointments = useAppStore((s) => s.appointments);
  const addAppointment = useAppStore((s) => s.addAppointment);
  const updateAppointment = useAppStore((s) => s.updateAppointment);
  const toggleAppointmentReminder = useAppStore((s) => s.toggleAppointmentReminder);
  const savePrescriptionToAppointment = useAppStore((s) => s.savePrescriptionToAppointment);
  const hydrate = useAppStore((s) => s.hydrate);

  const [filter, setFilter] = useState<FilterType>('all');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formHospital, setFormHospital] = useState('');
  const [formDepartment, setFormDepartment] = useState('');
  const [formDoctor, setFormDoctor] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('09:00');
  const [formNotes, setFormNotes] = useState('');
  const [formStatusIdx, setFormStatusIdx] = useState(0);
  const [formIsReminder, setFormIsReminder] = useState(true);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const summary = useMemo(() => {
    const upcoming = appointments.filter(a => a.status === 'upcoming');
    const completed = appointments.filter(a => a.status === 'completed');
    const cancelled = appointments.filter(a => a.status === 'cancelled');
    const nextDate = upcoming.length > 0
      ? Math.ceil(
          (new Date(upcoming[0].date).getTime() - new Date().getTime())
          / (1000 * 60 * 60 * 24)
        )
      : 0;
    return { upcoming: upcoming.length, completed: completed.length, cancelled: cancelled.length, nextDate };
  }, [appointments]);

  const nextAppointment = useMemo(() => {
    const upcoming = appointments
      .filter(a => a.status === 'upcoming')
      .sort((a, b) => a.date.localeCompare(b.date));
    return upcoming[0] || null;
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    let list = [...appointments];
    if (filter === 'upcoming') {
      list = list.filter(a => a.status === 'upcoming');
    } else if (filter === 'completed') {
      list = list.filter(a => a.status === 'completed' || a.status === 'cancelled');
    }
    return list.sort((a, b) => {
      if (a.status === 'upcoming' && b.status !== 'upcoming') return -1;
      if (a.status !== 'upcoming' && b.status === 'upcoming') return 1;
      return b.date.localeCompare(a.date);
    });
  }, [appointments, filter]);

  const resetForm = () => {
    setFormTitle('');
    setFormHospital('');
    setFormDepartment('');
    setFormDoctor('');
    setFormDate('');
    setFormTime('09:00');
    setFormNotes('');
    setFormStatusIdx(0);
    setFormIsReminder(true);
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setFormDate(getTodayStr());
    setShowAddModal(true);
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingId(appointment.id);
    setFormTitle(appointment.title);
    setFormHospital(appointment.hospital);
    setFormDepartment(appointment.department);
    setFormDoctor(appointment.doctor || '');
    setFormDate(appointment.date);
    setFormTime(appointment.time);
    setFormNotes(appointment.notes || '');
    const statusIdx = STATUS_OPTIONS.findIndex(s => s.value === appointment.status);
    setFormStatusIdx(statusIdx >= 0 ? statusIdx : 0);
    setFormIsReminder(appointment.isReminder);
    setShowAddModal(true);
  };

  const handleSaveAppointment = () => {
    if (!formTitle.trim()) {
      Taro.showToast({ title: '请输入预约标题', icon: 'none' });
      return;
    }
    if (!formHospital.trim()) {
      Taro.showToast({ title: '请输入医院名称', icon: 'none' });
      return;
    }
    if (!formDepartment.trim()) {
      Taro.showToast({ title: '请输入科室', icon: 'none' });
      return;
    }
    if (!formDate) {
      Taro.showToast({ title: '请选择就诊日期', icon: 'none' });
      return;
    }
    if (!formTime) {
      Taro.showToast({ title: '请选择就诊时间', icon: 'none' });
      return;
    }

    const status = STATUS_OPTIONS[formStatusIdx].value;
    const data: Omit<Appointment, 'id'> = {
      title: formTitle.trim(),
      hospital: formHospital.trim(),
      department: formDepartment.trim(),
      doctor: formDoctor.trim() || undefined,
      date: formDate,
      time: formTime,
      notes: formNotes.trim() || undefined,
      status,
      isReminder: formIsReminder
    };

    if (editingId) {
      updateAppointment(editingId, data);
      Taro.showToast({ title: '预约已更新', icon: 'success' });
    } else {
      addAppointment(data);
      Taro.showToast({ title: '预约已添加', icon: 'success' });
    }
    setShowAddModal(false);
    resetForm();
  };

  const handleToggleReminder = (id: string, enabled: boolean) => {
    toggleAppointmentReminder(id);
    Taro.showToast({
      title: enabled ? '已开启提醒' : '已关闭提醒',
      icon: 'success'
    });
  };

  const handleComplete = (id: string) => {
    Taro.showModal({
      title: '确认完成',
      content: '确认标记此次就诊已完成？',
      success: (res) => {
        if (res.confirm) {
          updateAppointment(id, { status: 'completed' });
          Taro.showToast({ title: '已标记完成', icon: 'success' });
        }
      }
    });
  };

  const handleCancel = (id: string) => {
    Taro.showModal({
      title: '取消预约',
      content: '确定要取消此次预约吗？',
      confirmColor: '#EF4444',
      success: (res) => {
        if (res.confirm) {
          updateAppointment(id, { status: 'cancelled' });
          Taro.showToast({ title: '已取消预约', icon: 'none' });
        }
      }
    });
  };

  const handleUploadPrescriptionForAppointment = (appointmentId: string) => {
    Taro.chooseImage({
      count: 1,
      success: (res) => {
        const path = res.tempFilePaths[0];
        savePrescriptionToAppointment(appointmentId, path);
        Taro.showToast({ title: '处方已保存', icon: 'success' });
      },
      fail: (err) => {
        console.error('[Appointment] 选择图片失败:', err);
        Taro.showToast({ title: '选择图片失败', icon: 'none' });
      }
    });
  };

  const handleUploadPrescription = () => {
    const upcomingList = appointments.filter(a => a.status === 'upcoming');
    if (upcomingList.length === 0) {
      Taro.showToast({ title: '暂无待就诊预约', icon: 'none' });
      return;
    }
    Taro.showActionSheet({
      itemList: upcomingList.map(a => `${a.title} - ${a.hospital} ${a.date.slice(5)}`),
      success: (res) => {
        const selected = upcomingList[res.tapIndex];
        handleUploadPrescriptionForAppointment(selected.id);
      }
    });
  };

  const handleShowDetail = (appointment: Appointment) => {
    const hasPrescription = !!appointment.prescriptionImage;
    const actions: string[] = [];
    actions.push('查看详细信息');
    if (hasPrescription) {
      actions.push('查看处方照片');
    }
    actions.push('编辑预约');
    if (appointment.status === 'upcoming') {
      actions.push('标记完成');
      actions.push('取消预约');
    }

    Taro.showActionSheet({
      itemList: actions,
      success: (res) => {
        const action = actions[res.tapIndex];
        if (action === '查看详细信息') {
          const contentLines: string[] = [];
          contentLines.push(`医院: ${appointment.hospital}`);
          contentLines.push(`科室: ${appointment.department}`);
          if (appointment.doctor) contentLines.push(`医生: ${appointment.doctor}`);
          contentLines.push(`日期: ${appointment.date}`);
          contentLines.push(`时间: ${appointment.time}`);
          contentLines.push(`状态: ${appointment.status === 'upcoming' ? '待就诊' : appointment.status === 'completed' ? '已完成' : '已取消'}`);
          contentLines.push(`提醒: ${appointment.isReminder ? '已开启' : '已关闭'}`);
          if (appointment.notes) contentLines.push(`\n备注:\n${appointment.notes}`);
          Taro.showModal({
            title: appointment.title,
            content: contentLines.join('\n'),
            showCancel: false,
            confirmText: '知道了'
          });
        } else if (action === '查看处方照片' && appointment.prescriptionImage) {
          Taro.previewImage({
            urls: [appointment.prescriptionImage],
            current: appointment.prescriptionImage
          });
        } else if (action === '编辑预约') {
          handleEdit(appointment);
        } else if (action === '标记完成') {
          handleComplete(appointment.id);
        } else if (action === '取消预约') {
          handleCancel(appointment.id);
        }
      }
    });
  };

  const filterButtons: { key: FilterType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'upcoming', label: '待就诊' },
    { key: 'completed', label: '已完成' }
  ];

  const upcomingList = filteredAppointments.filter(a => a.status === 'upcoming');
  const historyList = filteredAppointments.filter(a => a.status !== 'upcoming');

  return (
    <ScrollView scrollY style={{ minHeight: '100vh' }}>
      <View className="pageContainer">
        <View className="pageHeader">
          <Text className="pageTitle">复诊计划</Text>
          <Text className="pageSubtitle">合理安排复诊，守护家人健康</Text>
        </View>

        <View className={styles.summaryRow}>
          <StatCard
            icon="📅"
            label="待就诊"
            value={summary.upcoming}
            sub={`最近${summary.nextDate}天后`}
            iconBg="#DBEAFE"
            iconColor="#3B82F6"
          />
          <StatCard
            icon="✅"
            label="已完成"
            value={summary.completed}
            sub={`取消${summary.cancelled}次`}
            iconBg="#DCFCE7"
            iconColor="#22C55E"
          />
        </View>

        {nextAppointment && (
          <View className={styles.nextAppointment}>
            <View className={styles.nextBg} />
            <View className={styles.nextHeader}>
              <Text className={styles.nextBadge}>🎯 最近预约</Text>
            </View>
            <View className={styles.nextCountdown}>
              <Text className={styles.nextDays}>{summary.nextDate}</Text>
              <Text className={styles.nextUnit}>天后</Text>
            </View>
            <Text className={styles.nextTitle}>{nextAppointment.title}</Text>
            <View className={styles.nextMeta}>
              <View className={styles.nextMetaItem}>
                <Text>🏥</Text>
                <Text>{nextAppointment.hospital}</Text>
              </View>
              <View className={styles.nextMetaItem}>
                <Text>📋</Text>
                <Text>{nextAppointment.department}</Text>
              </View>
              <View className={styles.nextMetaItem}>
                <Text>📆</Text>
                <Text>{nextAppointment.date.slice(5)}</Text>
              </View>
              <View className={styles.nextMetaItem}>
                <Text>⏰</Text>
                <Text>{nextAppointment.time}</Text>
              </View>
            </View>
          </View>
        )}

        <View className={styles.uploadPrescription} onClick={handleUploadPrescription}>
          <View className={styles.uploadIcon}>📷</View>
          <Text className={styles.uploadTitle}>拍照保存处方/检查报告</Text>
          <Text className={styles.uploadDesc}>随时查看历史处方，就诊时方便医生了解</Text>
        </View>

        <View className={styles.sectionFilter}>
          {filterButtons.map(btn => (
            <Button
              key={btn.key}
              className={classnames(
                styles.filterBtn,
                filter === btn.key && styles.filterBtnActive
              )}
              onClick={() => setFilter(btn.key)}
            >
              {btn.label}
            </Button>
          ))}
        </View>

        {(filter === 'all' || filter === 'upcoming') && upcomingList.length > 0 && (
          <View className={styles.listContainer}>
            <View className="sectionTitle" style={{ marginBottom: '24rpx' }}>
              <View className="sectionTitleText">
                <View className="sectionTitleDot" />
                <Text>待就诊</Text>
              </View>
              <Text style={{ fontSize: '24rpx', color: '#94A3B8' }}>
                共{upcomingList.length}次
              </Text>
            </View>
            {upcomingList.map(appt => (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                onToggleReminder={handleToggleReminder}
                onComplete={handleComplete}
                onCancel={handleCancel}
                onClick={handleShowDetail}
              />
            ))}
          </View>
        )}

        {filter === 'upcoming' && upcomingList.length === 0 && (
          <View className={styles.emptyUpcoming}>
            <View className={styles.emptyIcon}>🎉</View>
            <Text className={styles.emptyTitle}>暂无待就诊预约</Text>
            <Text className={styles.emptyDesc}>点击右下角按钮添加新的复诊预约</Text>
          </View>
        )}

        {(filter === 'all' || filter === 'completed') && historyList.length > 0 && (
          <View className={styles.historySection}>
            <View className={styles.listContainer}>
              <View className="sectionTitle" style={{ marginBottom: '24rpx' }}>
                <View className="sectionTitleText">
                  <View className="sectionTitleDot" />
                  <Text>历史记录</Text>
                </View>
                <Text style={{ fontSize: '24rpx', color: '#94A3B8' }}>
                  共{historyList.length}次
                </Text>
              </View>
              {historyList.map(appt => (
                <AppointmentCard
                  key={appt.id}
                  appointment={appt}
                  onToggleReminder={handleToggleReminder}
                  onClick={handleShowDetail}
                />
              ))}
            </View>
          </View>
        )}
      </View>

      {showAddModal && (
        <View style={modalMaskStyle} onClick={() => setShowAddModal(false)}>
          <View style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <Text style={modalTitleStyle}>
              {editingId ? '编辑复诊预约' : '添加复诊预约'}
            </Text>
            <ScrollView scrollY style={modalScrollStyle}>
              <View style={formItemStyle}>
                <Text style={formLabelStyle}>预约标题 *</Text>
                <Input
                  style={formInputStyle}
                  placeholder="如：高血压定期复查"
                  value={formTitle}
                  onInput={(e) => setFormTitle(e.detail.value)}
                />
              </View>
              <View style={formItemStyle}>
                <Text style={formLabelStyle}>医院 *</Text>
                <Input
                  style={formInputStyle}
                  placeholder="如：市第一人民医院"
                  value={formHospital}
                  onInput={(e) => setFormHospital(e.detail.value)}
                />
              </View>
              <View style={formItemStyle}>
                <Text style={formLabelStyle}>科室 *</Text>
                <Input
                  style={formInputStyle}
                  placeholder="如：心血管内科"
                  value={formDepartment}
                  onInput={(e) => setFormDepartment(e.detail.value)}
                />
              </View>
              <View style={formItemStyle}>
                <Text style={formLabelStyle}>医生</Text>
                <Input
                  style={formInputStyle}
                  placeholder="如：王主任"
                  value={formDoctor}
                  onInput={(e) => setFormDoctor(e.detail.value)}
                />
              </View>
              <View style={formItemStyle}>
                <Text style={formLabelStyle}>就诊日期 *</Text>
                <Picker
                  mode="date"
                  value={formDate}
                  onChange={(e: any) => setFormDate(e.detail.value)}
                >
                  <View style={formPickerStyle}>{formDate || '请选择日期'}</View>
                </Picker>
              </View>
              <View style={formItemStyle}>
                <Text style={formLabelStyle}>就诊时间 *</Text>
                <Picker
                  mode="time"
                  value={formTime}
                  onChange={(e: any) => setFormTime(e.detail.value)}
                >
                  <View style={formPickerStyle}>{formTime || '请选择时间'}</View>
                </Picker>
              </View>
              <View style={formItemStyle}>
                <Text style={formLabelStyle}>状态</Text>
                <ScrollView scrollX style={optionScrollStyle}>
                  {STATUS_OPTIONS.map((opt, idx) => (
                    <Button
                      key={opt.value}
                      style={formStatusIdx === idx ? optionBtnActiveStyle : optionBtnStyle}
                      onClick={() => setFormStatusIdx(idx)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </ScrollView>
              </View>
              <View style={formItemStyle}>
                <Text style={formLabelStyle}>就诊提醒</Text>
                <View style={switchRowStyle}>
                  <Text style={{ fontSize: '28rpx', color: '#64748B' }}>
                    {formIsReminder ? '已开启' : '已关闭'}
                  </Text>
                  <Switch
                    checked={formIsReminder}
                    onChange={(e) => setFormIsReminder(e.detail.value)}
                    color="#22C55E"
                  />
                </View>
              </View>
              <View style={formItemStyle}>
                <Text style={formLabelStyle}>备注</Text>
                <Input
                  style={formInputStyle}
                  placeholder="如：携带近期血压记录"
                  value={formNotes}
                  onInput={(e) => setFormNotes(e.detail.value)}
                />
              </View>
            </ScrollView>
            <View style={modalFooterStyle}>
              <Button style={modalCancelStyle} onClick={() => setShowAddModal(false)}>
                取消
              </Button>
              <Button style={modalConfirmStyle} onClick={handleSaveAppointment}>
                保存
              </Button>
            </View>
          </View>
        </View>
      )}

      <View className="fabButton" onClick={openAddModal}>
        <Text className="fabButtonText">+</Text>
      </View>
    </ScrollView>
  );
};

export default AppointmentPage;
