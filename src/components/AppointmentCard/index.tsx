import React, { useState } from 'react';
import { View, Text, Button, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { Appointment } from '@/types';

interface AppointmentCardProps {
  appointment: Appointment;
  onToggleReminder?: (id: string, enabled: boolean) => void;
  onComplete?: (id: string) => void;
  onCancel?: (id: string) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onToggleReminder,
  onComplete,
  onCancel
}) => {
  const [isReminder, setIsReminder] = useState(appointment.isReminder);

  const containerClass = classnames(
    styles.container,
    appointment.status === 'upcoming' && styles.containerUpcoming,
    appointment.status === 'completed' && styles.containerCompleted,
    appointment.status === 'cancelled' && styles.containerCancelled
  );

  const badgeClass = classnames(
    styles.statusBadge,
    appointment.status === 'upcoming' && styles.statusUpcoming,
    appointment.status === 'completed' && styles.statusCompleted,
    appointment.status === 'cancelled' && styles.statusCancelled
  );

  const statusText = {
    upcoming: '待就诊',
    completed: '已完成',
    cancelled: '已取消'
  };

  const calculateCountdown = () => {
    const target = new Date(`${appointment.date}T${appointment.time}`);
    const now = new Date('2026-06-20T10:00:00');
    const diff = target.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const daysLeft = calculateCountdown();

  const handleToggleReminder = () => {
    const newValue = !isReminder;
    setIsReminder(newValue);
    onToggleReminder?.(appointment.id, newValue);
    console.log('[AppointmentCard] 提醒开关:', { id: appointment.id, enabled: newValue });
  };

  const showPrescription = () => {
    if (appointment.prescriptionImage) {
      Taro.previewImage({
        urls: [appointment.prescriptionImage],
        current: appointment.prescriptionImage
      });
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  };

  return (
    <View className={containerClass}>
      <View className={styles.header}>
      <View className={styles.titleSection}>
        <Text className={styles.appointmentTitle}>{appointment.title}</Text>
        <Text className={badgeClass}>{statusText[appointment.status]}</Text>
      </View>
    </View>

    {appointment.status === 'upcoming' && daysLeft > 0 && (
      <View className={styles.countdown}>
        <View className={styles.countdownLeft}>
          <Text className={styles.countdownIcon}>📅</Text>
          <View className={styles.countdownText}>
            <Text className={styles.countdownValue}>{daysLeft}天后</Text>
            <Text className={styles.countdownLabel}>距离就诊</Text>
          </View>
        </View>
        <View className={styles.reminderToggle}>
          <Text style={{ fontSize: '24rpx', color: '#94A3B8' }}>提醒</Text>
          <View
            className={classnames(styles.toggle, isReminder && styles.toggleActive)}
            onClick={handleToggleReminder}
          />
        </View>
      </View>
    )}

    <View className={styles.infoGrid}>
      <View className={styles.infoItem}>
        <Text className={styles.infoLabel}>🏥 医院</Text>
        <Text className={styles.infoValue}>{appointment.hospital}</Text>
      </View>
      <View className={styles.infoItem}>
        <Text className={styles.infoLabel}>📋 科室</Text>
        <Text className={styles.infoValue}>{appointment.department}</Text>
      </View>
      <View className={styles.infoItem}>
        <Text className={styles.infoLabel}>📆 日期</Text>
        <Text className={styles.infoValue}>{formatDate(appointment.date)}</Text>
      </View>
      <View className={styles.infoItem}>
        <Text className={styles.infoLabel}>⏰ 时间</Text>
        <Text className={styles.infoValue}>{appointment.time}</Text>
      </View>
      {appointment.doctor && (
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>👨‍⚕️ 医生</Text>
          <Text className={styles.infoValue}>{appointment.doctor}</Text>
        </View>
      )}
    </View>

    {appointment.notes && (
      <View className={styles.notes}>
      💡 {appointment.notes}
    </View>
    )}

    {appointment.prescriptionImage && (
      <View
        className={styles.prescription}
        onClick={showPrescription}
      >
        <Image
          src={appointment.prescriptionImage}
          style={{ width: '80rpx', height: '80rpx', borderRadius: '8rpx' }}
          mode="aspectFill"
        />
        <Text>📄 查看处方照片</Text>
      </View>
    )}

    {appointment.status === 'upcoming' && (
      <View className={styles.footer}>
        <Button
          className={classnames(styles.actionBtn, styles.btnSecondary)}
          onClick={() => onCancel?.(appointment.id)}
        >
          取消
        </Button>
        <Button
          className={classnames(styles.actionBtn, styles.btnPrimary)}
          onClick={() => onComplete?.(appointment.id)}
        >
          标记完成
        </Button>
      </View>
    )}
  );
};

export default AppointmentCard;
