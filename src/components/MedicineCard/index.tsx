import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';
import { Medicine, ReminderTime } from '@/types';

interface MedicineCardProps {
  medicine: Medicine;
  onEdit?: (medicine: Medicine) => void;
  onShowDetail?: (medicine: Medicine) => void;
}

const reminderTypeMap: Record<ReminderTime, string> = {
  before_meal: '饭前',
  after_meal: '饭后',
  before_sleep: '睡前',
  custom: ''
};

const MedicineCard: React.FC<MedicineCardProps> = ({ medicine, onEdit, onShowDetail }) => {
  const stockPercent = (medicine.stock / Math.max(medicine.stock, 1)) * 100;
  const stockLow = medicine.stock <= medicine.stockThreshold;
  const stockWarning = medicine.stock <= medicine.stockThreshold * 1.5;

  const stockClass = classnames(
    styles.stockBadge,
    stockLow ? styles.stockLow : stockWarning ? styles.stockWarning : styles.stockNormal
  );

  return (
    <View className={styles.container} onClick={() => onShowDetail?.(medicine)}>
      <View className={styles.header}>
        <View className={styles.titleSection}>
          <Text className={styles.medicineName}>{medicine.name}</Text>
          <Text className={styles.categoryTag}>{medicine.category}</Text>
        </View>
        <View className={stockClass}>
          <Text>📦 库存 {medicine.stock}份</Text>
        </View>
      </View>

      <View className={styles.infoGrid}>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>每次剂量</Text>
          <Text className={styles.infoValue}>{medicine.dose}</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>服用频次</Text>
          <Text className={styles.infoValue}>{medicine.frequencyDetail}</Text>
        </View>
      </View>

      {medicine.precautions && (
        <View className={styles.precautions}>
          <View className={styles.precautionsLabel}>
            <Text>⚠️ 注意事项</Text>
          </View>
          <Text className={styles.precautionsText}>{medicine.precautions}</Text>
        </View>
      )}

      <View className={styles.footer}>
        <View className={styles.timesRow}>
          {medicine.reminderTimes.length > 0 ? (
            medicine.reminderTimes.map((time, idx) => (
              <Text key={idx} className={styles.timePill}>
                {time} {reminderTypeMap[medicine.reminderType[idx] || '']}
              </Text>
            ))
          ) : (
            <Text className={styles.durationText}>按需服用</Text>
          )}
        </View>
        <Button
          className={styles.actionBtn}
          onClick={(e) => {
            e.stopPropagation?.();
            onEdit?.(medicine);
          }}
        >
          编辑
        </Button>
      </View>
    </View>
  );
};

export default MedicineCard;
