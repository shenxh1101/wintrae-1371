import React, { useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { Reminder, ReminderStatus, ReminderTime } from '@/types';

interface ReminderCardProps {
  reminder: Reminder;
  onStatusChange?: (id: string, status: ReminderStatus) => void;
}

const reminderTypeMap: Record<ReminderTime, string> = {
  before_meal: '饭前',
  after_meal: '饭后',
  before_sleep: '睡前',
  custom: '自定义'
};

const statusTextMap: Record<ReminderStatus, string> = {
  taken: '已服用',
  pending: '待服用',
  delayed: '已延后',
  missed: '已漏服'
};

const ReminderCard: React.FC<ReminderCardProps> = ({ reminder, onStatusChange }) => {
  const containerClass = classnames(
    styles.container,
    reminder.status === 'pending' && styles.containerPending,
    reminder.status === 'delayed' && styles.containerDelayed,
    reminder.status === 'missed' && styles.containerMissed
  );

  const badgeClass = classnames(
    styles.statusBadge,
    reminder.status === 'taken' && styles.statusTaken,
    reminder.status === 'pending' && styles.statusPending,
    reminder.status === 'delayed' && styles.statusDelayed,
    reminder.status === 'missed' && styles.statusMissed
  );

  const handleAction = (action: ReminderStatus) => {
    onStatusChange?.(reminder.id, action);
    console.log('[ReminderCard] 状态变更:', { id: reminder.id, medicine: reminder.medicineName, action });
  };

  return (
    <View className={containerClass}>
      <View className={styles.header}>
        <View className={styles.timeSection}>
          <View className={styles.timeBlock}>
            <Text className={styles.time}>{reminder.time}</Text>
            <Text className={styles.timeTag}>
              {reminderTypeMap[reminder.reminderType]}
            </Text>
          </View>
        </View>
        <Text className={badgeClass}>{statusTextMap[reminder.status]}</Text>
      </View>

      <View className={styles.medicineSection}>
        <Text className={styles.medicineName}>{reminder.medicineName}</Text>
        <View className={styles.medicineInfo}>
          <View className={styles.infoItem}>
            <Text>💊</Text>
            <Text>{reminder.dose}</Text>
          </View>
        </View>
        {reminder.actualTime && (
          <Text className={styles.actualTime}>
            实际服用时间：{reminder.actualTime}
          </Text>
        )}
      </View>

      {reminder.note && (
        <View className={styles.noteText}>
          💬 {reminder.note}
        </View>
      )}

      {reminder.status === 'pending' && (
        <View className={styles.actions}>
          <Button
            className={classnames(styles.actionBtn, styles.btnPrimary)}
            onClick={() => handleAction('taken')}
          >
            确认服用
          </Button>
          <Button
            className={classnames(styles.actionBtn, styles.btnSecondary)}
            onClick={() => handleAction('delayed')}
          >
            延后30分
          </Button>
          <Button
            className={classnames(styles.actionBtn, styles.btnDanger)}
            onClick={() => handleAction('missed')}
          >
            漏服
          </Button>
        </View>
      )}
    </View>
  );
};

export default ReminderCard;
