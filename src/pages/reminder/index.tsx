import React, { useState, useMemo } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { reminders as initialReminders } from '@/data/reminders';
import { medicines } from '@/data/medicines';
import { Reminder, ReminderStatus } from '@/types';
import ReminderCard from '@/components/ReminderCard';
import StatCard from '@/components/StatCard';

type FilterType = 'all' | 'pending' | 'taken' | 'abnormal';

const ReminderPage: React.FC = () => {
  const [reminderList, setReminderList] = useState<Reminder[]>(initialReminders);
  const [filter, setFilter] = useState<FilterType>('all');

  const stats = useMemo(() => {
    const total = reminderList.length;
    const taken = reminderList.filter(r => r.status === 'taken').length;
    const pending = reminderList.filter(r => r.status === 'pending').length;
    const abnormal = reminderList.filter(r => r.status === 'missed' || r.status === 'delayed').length;
    const rate = total > 0 ? Math.round((taken / total) * 100) : 0;
    return { total, taken, pending, abnormal, rate };
  }, [reminderList]);

  const lowStockMedicines = useMemo(() => {
    return medicines.filter(m => m.stock <= m.stockThreshold * 1.5);
  }, []);

  const filteredReminders = useMemo(() => {
    let list = [...reminderList];
    switch (filter) {
      case 'pending':
        list = list.filter(r => r.status === 'pending');
        break;
      case 'taken':
        list = list.filter(r => r.status === 'taken');
        break;
      case 'abnormal':
        list = list.filter(r => r.status === 'missed' || r.status === 'delayed');
        break;
    }
    return list.sort((a, b) => a.time.localeCompare(b.time));
  }, [reminderList, filter]);

  const groupedByTime = useMemo(() => {
    const groups: Record<string, Reminder[]> = {};
    filteredReminders.forEach(r => {
      if (!groups[r.time]) groups[r.time] = [];
      groups[r.time].push(r);
    });
    return groups;
  }, [filteredReminders]);

  const handleStatusChange = (id: string, status: ReminderStatus) => {
    setReminderList(prev =>
      prev.map(r =>
        r.id === id
          ? { ...r, status, actualTime: status !== 'pending' ? new Date().toTimeString().slice(0, 5) : undefined }
          : r
      )
    );
  };

  const handlePullDownRefresh = () => {
    Taro.showLoading({ title: '刷新中...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 800);
  };

  React.useEffect(() => {
    Taro.eventCenter.on('onPullDownRefresh', handlePullDownRefresh);
    return () => Taro.eventCenter.off('onPullDownRefresh', handlePullDownRefresh);
  }, []);

  const filterTabs: { key: FilterType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待服用' },
    { key: 'taken', label: '已服用' },
    { key: 'abnormal', label: '异常' }
  ];

  const today = new Date('2026-06-20');
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const dateStr = `${today.getMonth() + 1}月${today.getDate()}日 ${weekDays[today.getDay()]}`;

  const quickActions = [
    { icon: '💊', text: '添加药品', bg: '#DCFCE7', color: '#22C55E' },
    { icon: '📝', text: '记录体征', bg: '#DBEAFE', color: '#3B82F6' },
    { icon: '🏥', text: '预约复诊', bg: '#FFEDD5', color: '#F97316' },
    { icon: '📊', text: '查看报告', bg: '#FEF3C7', color: '#F59E0B' }
  ];

  return (
    <ScrollView scrollY className={styles.listContainer ? '' : ''} style={{ minHeight: '100vh' }}>
      <View className="pageContainer">
        <View className="pageHeader">
          <Text className="pageTitle">今日用药提醒</Text>
          <Text className="pageSubtitle">{dateStr} · 共{stats.total}次服药计划</Text>
        </View>

        <View className="section" style={{ marginTop: 0 }}>
          <View className={styles.statsRow}>
            <StatCard
              icon="✅"
              label="服药率"
              value={`${stats.rate}%`}
              sub="今日完成情况"
              iconBg="#DCFCE7"
              iconColor="#22C55E"
              trend={stats.rate >= 80 ? 'up' : 'down'}
            />
            <StatCard
              icon="⏰"
              label="待服用"
              value={stats.pending}
              sub={`已完成 ${stats.taken}/${stats.total}`}
              iconBg="#DBEAFE"
              iconColor="#3B82F6"
            />
          </View>
        </View>

        {lowStockMedicines.length > 0 && (
          <View className={styles.warningCard}>
            <Text className={styles.warningIcon}>⚠️</Text>
            <Text className={styles.warningText}>
              {lowStockMedicines.length}种药品库存不足，请及时补充
            </Text>
          </View>
        )}

        <View className={styles.quickActions}>
          {quickActions.map((action, idx) => (
            <View key={idx} className={styles.quickAction}>
              <View
                className={styles.quickActionIcon}
                style={{ background: action.bg, color: action.color }}
              >
                <Text>{action.icon}</Text>
              </View>
              <Text className={styles.quickActionText}>{action.text}</Text>
            </View>
          ))}
        </View>

        <View className={styles.filterTabs}>
          {filterTabs.map(tab => (
            <Button
              key={tab.key}
              className={classnames(
                styles.filterTab,
                filter === tab.key && styles.filterTabActive
              )}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label}
            </Button>
          ))}
        </View>

        {Object.keys(groupedByTime).length === 0 ? (
          <View className="emptyState">
            <View className="emptyIcon">💊</View>
            <Text className="emptyText">暂无服药提醒</Text>
            <Text className="emptyDesc">点击右下角按钮添加药品和提醒</Text>
          </View>
        ) : (
          Object.entries(groupedByTime).map(([time, items]) => (
            <View key={time} className={styles.timeGroup}>
              <View className={styles.timeGroupHeader}>
                <Text className={styles.timeGroupTime}>{time}</Text>
                <Text className={styles.timeGroupCount}>{items.length}种</Text>
              </View>
              {items.map(reminder => (
                <View key={reminder.id} style={{ padding: '0 32rpx' }}>
                  <ReminderCard
                    reminder={reminder}
                    onStatusChange={handleStatusChange}
                  />
                </View>
              ))}
            </View>
          ))
        )}
      </View>

      <View className="fabButton" onClick={() => Taro.showToast({ title: '添加提醒', icon: 'none' })}>
        <Text className="fabButtonText">+</Text>
      </View>
    </ScrollView>
  );
};

export default ReminderPage;
