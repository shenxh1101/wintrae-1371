import React, { useState, useMemo } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import useAppStore from '@/store';
import { Reminder, ReminderStatus } from '@/types';
import ReminderCard from '@/components/ReminderCard';
import StatCard from '@/components/StatCard';

type FilterType = 'all' | 'pending' | 'taken' | 'abnormal';

const ReminderPage: React.FC = () => {
  const reminders = useAppStore((s) => s.reminders);
  const medicines = useAppStore((s) => s.medicines);
  const takeReminder = useAppStore((s) => s.takeReminder);
  const delayReminder = useAppStore((s) => s.delayReminder);
  const missReminder = useAppStore((s) => s.missReminder);
  const getTodayStats = useAppStore((s) => s.getTodayStats);

  const [filter, setFilter] = useState<FilterType>('all');

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const todayReminders = useMemo(
    () => reminders.filter((r) => r.date === todayStr),
    [reminders, todayStr]
  );

  const stats = useMemo(() => getTodayStats(), [getTodayStats, todayReminders]);

  const lowStockMedicines = useMemo(() => {
    return medicines.filter((m) => m.stock <= m.stockThreshold * 1.5);
  }, [medicines]);

  const filteredReminders = useMemo(() => {
    let list = [...todayReminders];
    switch (filter) {
      case 'pending':
        list = list.filter((r) => r.status === 'pending');
        break;
      case 'taken':
        list = list.filter((r) => r.status === 'taken');
        break;
      case 'abnormal':
        list = list.filter((r) => r.status === 'missed' || r.status === 'delayed');
        break;
    }
    return list.sort((a, b) => a.time.localeCompare(b.time));
  }, [todayReminders, filter]);

  const groupedByTime = useMemo(() => {
    const groups: Record<string, Reminder[]> = {};
    filteredReminders.forEach((r) => {
      if (!groups[r.time]) groups[r.time] = [];
      groups[r.time].push(r);
    });
    return groups;
  }, [filteredReminders]);

  const handleTake = (id: string) => {
    takeReminder(id);
    Taro.showToast({ title: '已确认服用', icon: 'success' });
  };

  const handleDelay = (id: string) => {
    delayReminder(id, 30);
    Taro.showToast({ title: '已延后30分钟', icon: 'none' });
  };

  const handleMiss = (id: string) => {
    Taro.showModal({
      title: '标记漏服',
      editable: true,
      placeholderText: '请输入漏服原因（选填）',
      success: (res) => {
        if (res.confirm) {
          missReminder(id, res.content);
          Taro.showToast({ title: '已标记漏服', icon: 'none' });
        }
      }
    });
  };

  const handleStatusChange = (id: string, status: ReminderStatus) => {
    switch (status) {
      case 'taken':
        handleTake(id);
        break;
      case 'delayed':
        handleDelay(id);
        break;
      case 'missed':
        handleMiss(id);
        break;
    }
  };

  const handleQuickAction = (text: string) => {
    switch (text) {
      case '添加药品':
        Taro.switchTab({ url: '/pages/medicine/index' });
        break;
      case '记录体征':
        Taro.switchTab({ url: '/pages/record/index' });
        break;
      case '预约复诊':
        Taro.switchTab({ url: '/pages/appointment/index' });
        break;
      case '查看报告':
        Taro.switchTab({ url: '/pages/family/index' });
        break;
    }
  };

  const filterTabs: { key: FilterType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待服用' },
    { key: 'taken', label: '已服用' },
    { key: 'abnormal', label: '异常' }
  ];

  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const dateStr = `${today.getMonth() + 1}月${today.getDate()}日 ${weekDays[today.getDay()]}`;

  const quickActions = [
    { icon: '💊', text: '添加药品', bg: '#DCFCE7', color: '#22C55E' },
    { icon: '📝', text: '记录体征', bg: '#DBEAFE', color: '#3B82F6' },
    { icon: '🏥', text: '预约复诊', bg: '#FFEDD5', color: '#F97316' },
    { icon: '📊', text: '查看报告', bg: '#FEF3C7', color: '#F59E0B' }
  ];

  return (
    <ScrollView scrollY style={{ minHeight: '100vh' }}>
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
              value={`${stats.adherenceRate}%`}
              sub="今日完成情况"
              iconBg="#DCFCE7"
              iconColor="#22C55E"
              trend={stats.adherenceRate >= 80 ? 'up' : 'down'}
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
            <View
              key={idx}
              className={styles.quickAction}
              onClick={() => handleQuickAction(action.text)}
            >
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
          {filterTabs.map((tab) => (
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
              {items.map((reminder) => (
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

      <View
        className="fabButton"
        onClick={() => Taro.switchTab({ url: '/pages/medicine/index' })}
      >
        <Text className="fabButtonText">+</Text>
      </View>
    </ScrollView>
  );
};

export default ReminderPage;
