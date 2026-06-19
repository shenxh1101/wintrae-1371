import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';
import { DailyRecord, VitalsRecord } from '@/types';

interface RecordCardProps {
  record?: DailyRecord;
  vitals?: VitalsRecord;
  type: 'daily' | 'vitals';
}

const RecordCard: React.FC<RecordCardProps> = ({ record, vitals, type }) => {
  if (type === 'daily' && record) {
    const rateClass = classnames(
      styles.rateValue,
      record.adherenceRate >= 90 ? styles.rateHigh :
      record.adherenceRate >= 70 ? styles.rateMid : styles.rateLow
    );
    const barClass = classnames(
      styles.barFill,
      record.adherenceRate >= 90 ? styles.barSuccess :
      record.adherenceRate >= 70 ? styles.barWarning : styles.barError
    );

    const formatDate = (dateStr: string) => {
      const d = new Date(dateStr);
      const month = d.getMonth() + 1;
      const day = d.getDate();
      const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      return `${month}月${day}日 ${weekDays[d.getDay()]}`;
    };

    return (
      <View className={styles.container}>
        <View className={styles.header}>
          <Text className={styles.dateText}>{formatDate(record.date)}</Text>
          <Text className={rateClass}>{record.adherenceRate}%</Text>
        </View>
        <View className={styles.barContainer}>
          <View className={barClass} style={{ width: `${record.adherenceRate}%` }} />
        </View>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <View className={classnames(styles.statDot, styles.dotTaken)} />
            <Text className={styles.statLabel}>按时</Text>
            <Text className={styles.statValue}>{record.takenCount}次</Text>
          </View>
          <View className={styles.statItem}>
            <View className={classnames(styles.statDot, styles.dotDelayed)} />
            <Text className={styles.statLabel}>延后</Text>
            <Text className={styles.statValue}>{record.delayedCount}次</Text>
          </View>
          <View className={styles.statItem}>
            <View className={classnames(styles.statDot, styles.dotMissed)} />
            <Text className={styles.statLabel}>漏服</Text>
            <Text className={styles.statValue}>{record.missedCount}次</Text>
          </View>
        </View>
      </View>
    );
  }

  if (type === 'vitals' && vitals) {
    const isBPAbnormal = (vitals.systolic && vitals.systolic >= 140) ||
                         (vitals.diastolic && vitals.diastolic >= 90);
    const isBSAbnormal = vitals.bloodSugar && vitals.bloodSugar >= 7.0;

    return (
      <View className={styles.container}>
        <View className={styles.header}>
          <Text className={styles.dateText}>{vitals.date} {vitals.time}</Text>
        </View>
        <View className={styles.vitalsContainer}>
          {vitals.systolic && vitals.diastolic && (
            <View className={classnames(styles.vitalItem, isBPAbnormal && styles.vitalAbnormal)}>
              <View className={styles.vitalLabel}>
                <Text>🩺</Text>
                <Text>血压</Text>
              </View>
              <Text className={styles.vitalValue}>
                {vitals.systolic}/{vitals.diastolic}
                <Text className={styles.vitalUnit}>mmHg</Text>
              </Text>
            </View>
          )}
          {vitals.bloodSugar && (
            <View className={classnames(styles.vitalItem, isBSAbnormal && styles.vitalAbnormal)}>
              <View className={styles.vitalLabel}>
                <Text>🩸</Text>
                <Text>血糖</Text>
              </View>
              <Text className={styles.vitalValue}>
                {vitals.bloodSugar}
                <Text className={styles.vitalUnit}>mmol/L</Text>
              </Text>
            </View>
          )}
          {vitals.pulse && (
            <View className={styles.vitalItem}>
              <View className={styles.vitalLabel}>
                <Text>❤️</Text>
                <Text>心率</Text>
              </View>
              <Text className={styles.vitalValue}>
                {vitals.pulse}
                <Text className={styles.vitalUnit}>次/分</Text>
              </Text>
            </View>
          )}
          {vitals.temperature && (
            <View className={styles.vitalItem}>
              <View className={styles.vitalLabel}>
                <Text>🌡️</Text>
                <Text>体温</Text>
              </View>
              <Text className={styles.vitalValue}>
                {vitals.temperature}
                <Text className={styles.vitalUnit}>°C</Text>
              </Text>
            </View>
          )}
        </View>
        {vitals.note && (
          <View className={styles.noteText}>💬 {vitals.note}</View>
        )}
      </View>
    );
  }

  return null;
};

export default RecordCard;
