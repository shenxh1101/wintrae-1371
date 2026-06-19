import React, { useState, useMemo } from 'react';
import { View, Text, Button, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { appointments as initialAppointments } from '@/data/appointments';
import { Appointment } from '@/types';
import AppointmentCard from '@/components/AppointmentCard';
import StatCard from '@/components/StatCard';

type FilterType = 'all' | 'upcoming' | 'completed';

const AppointmentPage: React.FC = () => {
  const [apptList, setApptList] = useState<Appointment[]>(initialAppointments);
  const [filter, setFilter] = useState<FilterType>('all');

  const summary = useMemo(() => {
    const upcoming = apptList.filter(a => a.status === 'upcoming');
    const completed = apptList.filter(a => a.status === 'completed');
    const cancelled = apptList.filter(a => a.status === 'cancelled');
    const nextDate = upcoming.length > 0
      ? Math.ceil(
          (new Date(upcoming[0].date).getTime() - new Date('2026-06-20').getTime())
          / (1000 * 60 * 60 * 24)
        )
      : 0;
    return { upcoming: upcoming.length, completed: completed.length, cancelled: cancelled.length, nextDate };
  }, [apptList]);

  const nextAppointment = useMemo(() => {
    const upcoming = apptList
      .filter(a => a.status === 'upcoming')
      .sort((a, b) => a.date.localeCompare(b.date));
    return upcoming[0] || null;
  }, [apptList]);

  const filteredAppointments = useMemo(() => {
    let list = [...apptList];
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
  }, [apptList, filter]);

  const handleAddAppointment = () => {
    Taro.showToast({ title: '添加复诊预约', icon: 'none' });
  };

  const handleUploadPrescription = () => {
    Taro.chooseImage({
      count: 9,
      success: (res) => {
        console.log('[Appointment] 处方照片:', res.tempFilePaths);
        Taro.showToast({ title: '处方已保存', icon: 'success' });
      },
      fail: (err) => {
        console.error('[Appointment] 选择图片失败:', err);
      }
    });
  };

  const handleToggleReminder = (id: string, enabled: boolean) => {
    setApptList(prev =>
      prev.map(a => a.id === id ? { ...a, isReminder: enabled } : a)
    );
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
          setApptList(prev =>
            prev.map(a => a.id === id ? { ...a, status: 'completed' } : a)
          );
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
          setApptList(prev =>
            prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a)
          );
          Taro.showToast({ title: '已取消预约', icon: 'none' });
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
                />
              ))}
            </View>
          </View>
        )}
      </View>

      <View className="fabButton" onClick={handleAddAppointment}>
        <Text className="fabButtonText">+</Text>
      </View>
    </ScrollView>
  );
};

export default AppointmentPage;
