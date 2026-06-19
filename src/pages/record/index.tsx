import React, { useState, useMemo } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { dailyRecords, vitalsRecords, abnormalRecords } from '@/data/records';
import { DailyRecord, VitalsRecord, AbnormalRecord } from '@/types';
import RecordCard from '@/components/RecordCard';
import StatCard from '@/components/StatCard';

type TabType = 'daily' | 'vitals' | 'abnormal';
type ChartPeriod = '7d' | '14d' | '30d';

const RecordPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('daily');
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('14d');

  const overview = useMemo(() => {
    const records = [...dailyRecords].reverse();
    const avgRate = Math.round(
      records.reduce((sum, r) => sum + r.adherenceRate, 0) / records.length
    );
    let streak = 0;
    for (const r of records) {
      if (r.adherenceRate >= 90) streak++;
      else break;
    }
    const totalAbnormal = abnormalRecords.length;
    const vitalsCount = vitalsRecords.length;
    return { avgRate, streak, totalAbnormal, vitalsCount };
  }, []);

  const chartData = useMemo(() => {
    const count = chartPeriod === '7d' ? 7 : chartPeriod === '14d' ? 14 : 30;
    return dailyRecords.slice(-count);
  }, [chartPeriod]);

  const latestVitals = useMemo(() => {
    if (vitalsRecords.length === 0) return null;
    const v = vitalsRecords[0];
    const avgSys = Math.round(
      vitalsRecords.reduce((s, r) => s + (r.systolic || 0), 0) / vitalsRecords.length
    );
    const avgDia = Math.round(
      vitalsRecords.reduce((s, r) => s + (r.diastolic || 0), 0) / vitalsRecords.length
    );
    const avgBS = (
      vitalsRecords.reduce((s, r) => s + (r.bloodSugar || 0), 0) / vitalsRecords.length
    ).toFixed(1);
    return { v, avgSys, avgDia, avgBS };
  }, []);

  const handleAddVitals = () => {
    Taro.showToast({ title: '记录体征数据', icon: 'none' });
  };

  const chartPeriods: { key: ChartPeriod; label: string }[] = [
    { key: '7d', label: '近7天' },
    { key: '14d', label: '近14天' },
    { key: '30d', label: '近30天' }
  ];

  const barLabels = chartData.map((_, idx) => {
    const d = new Date(chartData[idx].date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });

  return (
    <ScrollView scrollY style={{ minHeight: '100vh' }}>
      <View className="pageContainer">
        <View className="pageHeader">
          <Text className="pageTitle">服药与体征记录</Text>
          <Text className="pageSubtitle">掌握健康数据，养成良好习惯</Text>
        </View>

        <View className={styles.overviewCard}>
          <View className={styles.overviewBg} />
          <View className={styles.overviewHeader}>
            <Text className={styles.overviewTitle}>14天平均服药率</Text>
            <Text className={styles.overviewPeriod}>近14天</Text>
          </View>
          <View className={styles.overviewMain}>
            <Text className={styles.overviewRate}>{overview.avgRate}</Text>
            <Text className={styles.overviewUnit}>%</Text>
          </View>
          <Text className={styles.overviewSub}>
            继续保持，健康生活每一天！
          </Text>
          <View className={styles.overviewStreak}>
            <Text className={styles.streakIcon}>🔥</Text>
            <Text className={styles.streakText}>连续达标天数</Text>
            <Text className={styles.streakValue}>{overview.streak}天</Text>
          </View>
        </View>

        <View className={styles.statsCards}>
          <StatCard
            icon="🔥"
            label="连续达标"
            value={`${overview.streak}天`}
            sub="最高记录14天"
            iconBg="#FEF3C7"
            iconColor="#F59E0B"
            trend="up"
          />
          <StatCard
            icon="⚠️"
            label="异常次数"
            value={overview.totalAbnormal}
            sub="近14天共"
            iconBg="#FEE2E2"
            iconColor="#EF4444"
            trend="down"
          />
          <StatCard
            icon="🩺"
            label="体征记录"
            value={overview.vitalsCount}
            sub="条记录"
            iconBg="#DBEAFE"
            iconColor="#3B82F6"
          />
        </View>

        <View className={styles.chartSection}>
          <View className={styles.chartCard}>
            <View className={styles.chartHeader}>
              <Text className={styles.chartTitle}>服药率趋势</Text>
              <View className={styles.chartTabs}>
                {chartPeriods.map(p => (
                  <Button
                    key={p.key}
                    className={classnames(
                      styles.chartTab,
                      chartPeriod === p.key && styles.chartTabActive
                    )}
                    onClick={() => setChartPeriod(p.key)}
                  >
                    {p.label}
                  </Button>
                ))}
              </View>
            </View>
            <View className={styles.barsContainer}>
              {chartData.map((record, idx) => {
                const rate = record.adherenceRate;
                const barClass = classnames(
                  styles.barFill,
                  rate >= 90 ? styles.barSuccess :
                  rate >= 70 ? styles.barWarning : styles.barError
                );
                return (
                  <View key={idx} className={styles.barItem}>
                    <View
                      className={barClass}
                      style={{ height: `${Math.max(rate * 1.5, 8)}rpx` }}
                    />
                    <Text className={styles.barLabel}>{barLabels[idx]}</Text>
                  </View>
                );
              })}
            </View>
            <View className={styles.barsLegend}>
              <View className={styles.legendItem}>
                <View className={classnames(styles.legendDot, { background: '#22C55E' })} />
                <Text>优秀(≥90%)</Text>
              </View>
              <View className={styles.legendItem}>
                <View className={classnames(styles.legendDot, { background: '#F59E0B' })} />
                <Text>良好(70-89%)</Text>
              </View>
              <View className={styles.legendItem}>
                <View className={classnames(styles.legendDot, { background: '#EF4444' })} />
                <Text>待改进(&lt;70%)</Text>
              </View>
            </View>
          </View>
        </View>

        <View className={styles.sectionTabs}>
          <Button
            className={classnames(styles.sectionTab, activeTab === 'daily' && styles.sectionTabActive)}
            onClick={() => setActiveTab('daily')}
          >
            每日记录
          </Button>
          <Button
            className={classnames(styles.sectionTab, activeTab === 'vitals' && styles.sectionTabActive)}
            onClick={() => setActiveTab('vitals')}
          >
            体征监测
          </Button>
          <Button
            className={classnames(styles.sectionTab, activeTab === 'abnormal' && styles.sectionTabActive)}
            onClick={() => setActiveTab('abnormal')}
          >
            异常记录
          </Button>
        </View>

        {activeTab === 'daily' && (
          <View style={{ padding: '0 32rpx' }}>
            {[...dailyRecords].reverse().slice(0, 7).map((record: DailyRecord) => (
              <RecordCard key={record.date} record={record} type="daily" />
            ))}
          </View>
        )}

        {activeTab === 'vitals' && (
          <View>
            {latestVitals && (
              <View className={styles.vitalsChart}>
                <View className={styles.chartCard}>
                  <View className={styles.chartHeader}>
                    <Text className={styles.chartTitle}>体征统计</Text>
                  </View>
                  <View style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '24rpx'
                  }}>
                    <View style={{
                      padding: '24rpx',
                      background: '#F8FAFC',
                      borderRadius: '16rpx'
                    }}>
                      <Text style={{ fontSize: '22rpx', color: '#94A3B8', marginBottom: '8rpx' }}>
                        🩺 平均血压
                      </Text>
                      <Text style={{
                        fontSize: '32rpx',
                        fontWeight: '700',
                        color: latestVitals.avgSys >= 140 ? '#EF4444' : '#0F172A'
                      }}>
                        {latestVitals.avgSys}/{latestVitals.avgDia}
                        <Text style={{ fontSize: '22rpx', color: '#94A3B8', fontWeight: '400' }}> mmHg</Text>
                      </Text>
                    </View>
                    <View style={{
                      padding: '24rpx',
                      background: '#F8FAFC',
                      borderRadius: '16rpx'
                    }}>
                      <Text style={{ fontSize: '22rpx', color: '#94A3B8', marginBottom: '8rpx' }}>
                        🩸 平均血糖
                      </Text>
                      <Text style={{
                        fontSize: '32rpx',
                        fontWeight: '700',
                        color: parseFloat(latestVitals.avgBS) >= 7.0 ? '#EF4444' : '#0F172A'
                      }}>
                        {latestVitals.avgBS}
                        <Text style={{ fontSize: '22rpx', color: '#94A3B8', fontWeight: '400' }}> mmol/L</Text>
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
            <Button className={styles.addVitalsBtn} onClick={handleAddVitals}>
              + 记录今日体征
            </Button>
            <View style={{ padding: '0 32rpx' }}>
              {vitalsRecords.map((v: VitalsRecord) => (
                <RecordCard key={v.id} vitals={v} type="vitals" />
              ))}
            </View>
          </View>
        )}

        {activeTab === 'abnormal' && (
          <View className={styles.abnormalList}>
            {abnormalRecords.length === 0 ? (
              <View className="emptyState">
                <View className="emptyIcon">🎉</View>
                <Text className="emptyText">太棒了！暂无异常记录</Text>
                <Text className="emptyDesc">继续保持良好的服药习惯</Text>
              </View>
            ) : (
              abnormalRecords.map((record: AbnormalRecord) => (
                <View key={record.id} className={styles.abnormalItem}>
                  <View className={styles.abnormalHeader}>
                    <Text className={styles.abnormalMedicine}>{record.medicineName}</Text>
                    <Text className={classnames(
                      styles.abnormalType,
                      record.type === 'missed' ? styles.typeMissed : styles.typeDelayed
                    )}>
                      {record.type === 'missed' ? '漏服' : '延后'}
                    </Text>
                  </View>
                  <View className={styles.abnormalInfo}>
                    <Text>📅 {record.date}</Text>
                    <Text>⏰ {record.time}</Text>
                  </View>
                  {record.note && (
                    <View className={styles.abnormalNote}>💬 {record.note}</View>
                  )}
                </View>
              ))
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default RecordPage;
