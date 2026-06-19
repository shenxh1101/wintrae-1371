import React, { useState, useMemo } from 'react';
import { View, Text, Button, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import useAppStore from '@/store';
import { DailyRecord, VitalsRecord, AbnormalRecord } from '@/types';
import RecordCard from '@/components/RecordCard';
import StatCard from '@/components/StatCard';

type TabType = 'daily' | 'vitals' | 'abnormal';
type ChartPeriod = '7d' | '14d' | '30d';

const RecordPage: React.FC = () => {
  const dailyRecords = useAppStore((s) => s.dailyRecords);
  const vitalsRecords = useAppStore((s) => s.vitalsRecords);
  const abnormalRecords = useAppStore((s) => s.abnormalRecords);
  const addVitalsRecord = useAppStore((s) => s.addVitalsRecord);
  const getAverageVitals = useAppStore((s) => s.getAverageVitals);
  const getAdherenceRateHistory = useAppStore((s) => s.getAdherenceRateHistory);

  const [activeTab, setActiveTab] = useState<TabType>('daily');
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('14d');

  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [formSys, setFormSys] = useState('');
  const [formDia, setFormDia] = useState('');
  const [formBS, setFormBS] = useState('');
  const [formPulse, setFormPulse] = useState('');
  const [formNote, setFormNote] = useState('');

  const overview = useMemo(() => {
    const records = getAdherenceRateHistory(14).reverse();
    const avgRate =
      records.length > 0
        ? Math.round(records.reduce((sum, r) => sum + r.adherenceRate, 0) / records.length)
        : 100;
    let streak = 0;
    for (const r of records) {
      if (r.adherenceRate >= 90) streak++;
      else break;
    }
    const totalAbnormal = abnormalRecords.length;
    const vitalsCount = vitalsRecords.length;
    return { avgRate, streak, totalAbnormal, vitalsCount };
  }, [dailyRecords, abnormalRecords, vitalsRecords, getAdherenceRateHistory]);

  const chartData = useMemo(() => {
    const count = chartPeriod === '7d' ? 7 : chartPeriod === '14d' ? 14 : 30;
    return getAdherenceRateHistory(count);
  }, [chartPeriod, getAdherenceRateHistory]);

  const avgVitals = useMemo(() => getAverageVitals(), [getAverageVitals, vitalsRecords]);

  const handleAddVitals = () => {
    setFormSys('');
    setFormDia('');
    setFormBS('');
    setFormPulse('');
    setFormNote('');
    setShowVitalsModal(true);
  };

  const handleSaveVitals = () => {
    if (!formSys && !formDia && !formBS && !formPulse) {
      Taro.showToast({ title: '请至少填写一项', icon: 'none' });
      return;
    }
    const now = new Date();
    addVitalsRecord({
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5),
      systolic: formSys ? parseInt(formSys) : undefined,
      diastolic: formDia ? parseInt(formDia) : undefined,
      bloodSugar: formBS ? parseFloat(formBS) : undefined,
      pulse: formPulse ? parseInt(formPulse) : undefined,
      note: formNote || undefined
    });
    Taro.showToast({ title: '体征已保存', icon: 'success' });
    setShowVitalsModal(false);
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
          <Text className={styles.overviewSub}>继续保持，健康生活每一天！</Text>
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
            sub="累计共"
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
                {chartPeriods.map((p) => (
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
                  rate >= 90
                    ? styles.barSuccess
                    : rate >= 70
                    ? styles.barWarning
                    : styles.barError
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
            className={classnames(
              styles.sectionTab,
              activeTab === 'daily' && styles.sectionTabActive
            )}
            onClick={() => setActiveTab('daily')}
          >
            每日记录
          </Button>
          <Button
            className={classnames(
              styles.sectionTab,
              activeTab === 'vitals' && styles.sectionTabActive
            )}
            onClick={() => setActiveTab('vitals')}
          >
            体征监测
          </Button>
          <Button
            className={classnames(
              styles.sectionTab,
              activeTab === 'abnormal' && styles.sectionTabActive
            )}
            onClick={() => setActiveTab('abnormal')}
          >
            异常记录
          </Button>
        </View>

        {activeTab === 'daily' && (
          <View style={{ padding: '0 32rpx' }}>
            {getAdherenceRateHistory(7).reverse().map((record: DailyRecord) => (
              <RecordCard key={record.date} record={record} type="daily" />
            ))}
          </View>
        )}

        {activeTab === 'vitals' && (
          <View>
            <View className={styles.vitalsChart}>
              <View className={styles.chartCard}>
                <View className={styles.chartHeader}>
                  <Text className={styles.chartTitle}>体征统计（近7天平均）</Text>
                </View>
                <View
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '24rpx'
                  }}
                >
                  <View
                    style={{
                      padding: '24rpx',
                      background: '#F8FAFC',
                      borderRadius: '16rpx'
                    }}
                  >
                    <Text style={{ fontSize: '22rpx', color: '#94A3B8', marginBottom: '8rpx' }}>
                      🩺 平均血压
                    </Text>
                    <Text
                      style={{
                        fontSize: '32rpx',
                        fontWeight: '700',
                        color: avgVitals.avgSystolic >= 140 ? '#EF4444' : '#0F172A'
                      }}
                    >
                      {avgVitals.avgSystolic || '--'}/{avgVitals.avgDiastolic || '--'}
                      <Text style={{ fontSize: '22rpx', color: '#94A3B8', fontWeight: '400' }}>
                        {' '}
                        mmHg
                      </Text>
                    </Text>
                  </View>
                  <View
                    style={{
                      padding: '24rpx',
                      background: '#F8FAFC',
                      borderRadius: '16rpx'
                    }}
                  >
                    <Text style={{ fontSize: '22rpx', color: '#94A3B8', marginBottom: '8rpx' }}>
                      🩸 平均血糖
                    </Text>
                    <Text
                      style={{
                        fontSize: '32rpx',
                        fontWeight: '700',
                        color: avgVitals.avgBloodSugar >= 7.0 ? '#EF4444' : '#0F172A'
                      }}
                    >
                      {avgVitals.avgBloodSugar || '--'}
                      <Text style={{ fontSize: '22rpx', color: '#94A3B8', fontWeight: '400' }}>
                        {' '}
                        mmol/L
                      </Text>
                    </Text>
                  </View>
                  <View
                    style={{
                      padding: '24rpx',
                      background: '#F8FAFC',
                      borderRadius: '16rpx'
                    }}
                  >
                    <Text style={{ fontSize: '22rpx', color: '#94A3B8', marginBottom: '8rpx' }}>
                      💓 平均心率
                    </Text>
                    <Text
                      style={{
                        fontSize: '32rpx',
                        fontWeight: '700',
                        color:
                          avgVitals.avgPulse >= 100 || avgVitals.avgPulse <= 50
                            ? '#EF4444'
                            : '#0F172A'
                      }}
                    >
                      {avgVitals.avgPulse || '--'}
                      <Text style={{ fontSize: '22rpx', color: '#94A3B8', fontWeight: '400' }}>
                        {' '}
                        次/分
                      </Text>
                    </Text>
                  </View>
                  <View
                    style={{
                      padding: '24rpx',
                      background: '#F8FAFC',
                      borderRadius: '16rpx'
                    }}
                  >
                    <Text style={{ fontSize: '22rpx', color: '#94A3B8', marginBottom: '8rpx' }}>
                      📋 记录总数
                    </Text>
                    <Text
                      style={{
                        fontSize: '32rpx',
                        fontWeight: '700',
                        color: '#0F172A'
                      }}
                    >
                      {vitalsRecords.length}
                      <Text style={{ fontSize: '22rpx', color: '#94A3B8', fontWeight: '400' }}>
                        {' '}
                        条
                      </Text>
                    </Text>
                  </View>
                </View>
              </View>
            </View>
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
                    <Text
                      className={classnames(
                        styles.abnormalType,
                        record.type === 'missed' ? styles.typeMissed : styles.typeDelayed
                      )}
                    >
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

      {showVitalsModal && (
        <View className={styles.modalMask} onClick={() => setShowVitalsModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>记录体征数据</Text>
            <ScrollView scrollY style={{ maxHeight: '60vh', padding: '0 32rpx 16rpx' }}>
              <View style={{ marginBottom: '24rpx' }}>
                <Text
                  style={{
                    display: 'block',
                    fontSize: '26rpx',
                    fontWeight: '500',
                    color: '#0F172A',
                    marginBottom: '12rpx'
                  }}
                >
                  血压（收缩压/舒张压 mmHg）
                </Text>
                <View style={{ display: 'flex', gap: '16rpx' }}>
                  <Input
                    style={{
                      flex: 1,
                      height: '80rpx',
                      padding: '0 24rpx',
                      background: '#F8FAFC',
                      borderRadius: '16rpx',
                      fontSize: '28rpx'
                    }}
                    type="number"
                    placeholder="收缩压 如 130"
                    value={formSys}
                    onInput={(e) => setFormSys(e.detail.value)}
                  />
                  <Input
                    style={{
                      flex: 1,
                      height: '80rpx',
                      padding: '0 24rpx',
                      background: '#F8FAFC',
                      borderRadius: '16rpx',
                      fontSize: '28rpx'
                    }}
                    type="number"
                    placeholder="舒张压 如 85"
                    value={formDia}
                    onInput={(e) => setFormDia(e.detail.value)}
                  />
                </View>
              </View>
              <View style={{ marginBottom: '24rpx' }}>
                <Text
                  style={{
                    display: 'block',
                    fontSize: '26rpx',
                    fontWeight: '500',
                    color: '#0F172A',
                    marginBottom: '12rpx'
                  }}
                >
                  血糖（mmol/L）
                </Text>
                <Input
                  style={{
                    height: '80rpx',
                    padding: '0 24rpx',
                    background: '#F8FAFC',
                    borderRadius: '16rpx',
                    fontSize: '28rpx'
                  }}
                  type="digit"
                  placeholder="如 6.5"
                  value={formBS}
                  onInput={(e) => setFormBS(e.detail.value)}
                />
              </View>
              <View style={{ marginBottom: '24rpx' }}>
                <Text
                  style={{
                    display: 'block',
                    fontSize: '26rpx',
                    fontWeight: '500',
                    color: '#0F172A',
                    marginBottom: '12rpx'
                  }}
                >
                  心率（次/分）
                </Text>
                <Input
                  style={{
                    height: '80rpx',
                    padding: '0 24rpx',
                    background: '#F8FAFC',
                    borderRadius: '16rpx',
                    fontSize: '28rpx'
                  }}
                  type="number"
                  placeholder="如 72"
                  value={formPulse}
                  onInput={(e) => setFormPulse(e.detail.value)}
                />
              </View>
              <View style={{ marginBottom: '24rpx' }}>
                <Text
                  style={{
                    display: 'block',
                    fontSize: '26rpx',
                    fontWeight: '500',
                    color: '#0F172A',
                    marginBottom: '12rpx'
                  }}
                >
                  备注（选填）
                </Text>
                <Input
                  style={{
                    height: '80rpx',
                    padding: '0 24rpx',
                    background: '#F8FAFC',
                    borderRadius: '16rpx',
                    fontSize: '28rpx'
                  }}
                  placeholder="如有特殊情况请备注"
                  value={formNote}
                  onInput={(e) => setFormNote(e.detail.value)}
                />
              </View>
            </ScrollView>
            <View
              style={{
                display: 'flex',
                gap: '16rpx',
                padding: '16rpx 32rpx',
                paddingBottom: 'calc(16rpx + env(safe-area-inset-bottom))',
                borderTop: '1rpx solid #F1F5F9'
              }}
            >
              <Button
                style={{
                  flex: 1,
                  height: '88rpx',
                  background: '#F1F5F9',
                  borderRadius: '48rpx',
                  fontSize: '30rpx',
                  fontWeight: '600',
                  color: '#64748B'
                }}
                onClick={() => setShowVitalsModal(false)}
              >
                取消
              </Button>
              <Button
                style={{
                  flex: 1,
                  height: '88rpx',
                  background: 'linear-gradient(135deg, #22C55E 0%, #4ADE80 100%)',
                  borderRadius: '48rpx',
                  fontSize: '30rpx',
                  fontWeight: '600',
                  color: '#FFFFFF'
                }}
                onClick={handleSaveVitals}
              >
                保存
              </Button>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default RecordPage;
