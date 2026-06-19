import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';

interface StatCardProps {
  icon: string;
  iconBg?: string;
  label: string;
  value: string | number;
  sub?: string;
  trend?: 'up' | 'down' | 'neutral';
  iconColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  iconBg,
  label,
  value,
  sub,
  trend = 'neutral',
  iconColor
}) => {
  const trendClass = trend === 'up' ? styles.trendUp : trend === 'down' ? styles.trendDown : '';

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <View
          className={styles.icon}
          style={{
            background: iconBg,
            color: iconColor
          }}
        >
          <Text>{icon}</Text>
        </View>
        <Text className={styles.label}>{label}</Text>
      </View>
      <Text className={styles.valueMain}>
        <Text className={styles.value}>{value}</Text>
      </Text>
      {sub && (
        <Text className={classnames(styles.sub, trendClass)}>{sub}</Text>
      )}
    </View>
  );
};

export default StatCard;
