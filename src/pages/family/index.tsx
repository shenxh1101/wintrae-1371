import React, { useState, useMemo } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { familyMembers as initialMembers } from '@/data/families';
import { FamilyMember } from '@/types';
import FamilyCard from '@/components/FamilyCard';

const FamilyPage: React.FC = () => {
  const [members] = useState<FamilyMember[]>(initialMembers);

  const summary = useMemo(() => {
    const total = members.length;
    const syncEnabled = members.filter(m => m.isSyncEnabled).length;
    const canEdit = members.filter(m => m.permissions.includes('编辑药品')).length;
    return { total, syncEnabled, canEdit };
  }, [members]);

  const handleToggleSync = (id: string, enabled: boolean) => {
    console.log('[Family] 同步状态:', { id, enabled });
  };

  const handleShare = (member: FamilyMember) => {
    Taro.showActionSheet({
      itemList: ['发送健康周报', '发送月度报告', '发送就诊记录', '发送全部数据'],
      success: (res) => {
        const actions = ['健康周报', '月度报告', '就诊记录', '全部数据'];
        Taro.showToast({
          title: `已发送${actions[res.tapIndex]}给${member.name}`,
          icon: 'success'
        });
        console.log('[Family] 分享报告:', { member: member.name, type: actions[res.tapIndex] });
      },
      fail: (err) => {
        console.error('[Family] 分享失败:', err);
      }
    });
  };

  const handleEdit = (member: FamilyMember) => {
    Taro.showToast({ title: `编辑: ${member.name}`, icon: 'none' });
  };

  const handleAddMember = () => {
    Taro.showToast({ title: '添加家属成员', icon: 'none' });
  };

  const handleGenerateReport = (type: string) => {
    Taro.showLoading({ title: '生成报告中...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showModal({
        title: '报告生成成功',
        content: `${type}已准备好，可以发送给医生或家属`,
        confirmText: '立即发送',
        cancelText: '稍后再说',
        success: (res) => {
          if (res.confirm) {
            Taro.showToast({ title: '已生成分享链接', icon: 'success' });
          }
        }
      });
      console.log('[Family] 生成报告:', type);
    }, 1200);
  };

  const handleInviteMember = () => {
    Taro.showModal({
      title: '邀请家属加入',
      content: '通过手机号或微信邀请您的家人，共同关注健康管理',
      confirmText: '立即邀请',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '邀请链接已复制', icon: 'success' });
        }
      }
    });
  };

  const reportOptions = [
    {
      icon: '📋',
      title: '就诊摘要',
      desc: '药品清单+复诊记录',
      bg: '#DCFCE7',
      color: '#22C55E',
      action: '就诊摘要'
    },
    {
      icon: '📊',
      title: '服药报告',
      desc: '连续服药率+异常记录',
      bg: '#DBEAFE',
      color: '#3B82F6',
      action: '服药报告'
    },
    {
      icon: '🩺',
      title: '体征趋势',
      desc: '血压/血糖/心率数据',
      bg: '#FEF3C7',
      color: '#F59E0B',
      action: '体征趋势'
    },
    {
      icon: '📄',
      title: '完整报告',
      desc: '含全部健康数据',
      bg: '#FFEDD5',
      color: '#F97316',
      action: '完整报告'
    }
  ];

  const tips = [
    '开启同步后，家属会在您漏服或异常时收到提醒通知',
    '就诊报告可以帮助医生快速了解您的用药和健康情况',
    '建议定期(每月)导出完整报告存档备份'
  ];

  return (
    <ScrollView scrollY style={{ minHeight: '100vh' }}>
      <View className="pageContainer">
        <View className="pageHeader">
          <Text className="pageTitle">家人共享</Text>
          <Text className="pageSubtitle">家人共同守护，健康不再孤单</Text>
        </View>

        <View className={styles.summaryCard}>
          <View className={styles.summaryBg} />
          <View className={styles.summaryHeader}>
            <Text className={styles.summaryBadge}>👨‍👩‍👧 家庭成员</Text>
          </View>
          <Text className={styles.summaryTitle}>{summary.total}位成员已加入</Text>
          <Text className={styles.summaryDesc}>
            您已与家人建立健康连接，共同关注用药安全
          </Text>
          <View className={styles.summaryStats}>
            <View className={styles.summaryItem}>
              <Text className={styles.summaryValue}>{summary.total}</Text>
              <Text className={styles.summaryLabel}>总成员</Text>
            </View>
            <View className={styles.summaryItem}>
              <Text className={styles.summaryValue}>{summary.syncEnabled}</Text>
              <Text className={styles.summaryLabel}>同步中</Text>
            </View>
            <View className={styles.summaryItem}>
              <Text className={styles.summaryValue}>{summary.canEdit}</Text>
              <Text className={styles.summaryLabel}>可编辑</Text>
            </View>
          </View>
        </View>

        <View className={styles.reportSection}>
          <View className={styles.reportHeader}>
            <View className={styles.reportTitle}>
              <Text>📊</Text>
              <Text>医生报告导出</Text>
            </View>
          </View>
          <Text className={styles.reportDesc}>
            一键生成简洁明了的健康报告，就诊时出示给医生，高效沟通病情
          </Text>
          <View className={styles.reportOptions}>
            {reportOptions.map((opt, idx) => (
              <View
                key={idx}
                className={styles.reportOption}
                onClick={() => handleGenerateReport(opt.action)}
              >
                <View
                  className={styles.optionIcon}
                  style={{ background: opt.bg, color: opt.color }}
                >
                  <Text>{opt.icon}</Text>
                </View>
                <Text className={styles.optionTitle}>{opt.title}</Text>
                <Text className={styles.optionDesc}>{opt.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.inviteCard} onClick={handleInviteMember}>
          <View className={styles.inviteIcon}>
            <Text>+</Text>
          </View>
          <View className={styles.inviteContent}>
            <Text className={styles.inviteTitle}>邀请家属加入</Text>
            <Text className={styles.inviteDesc}>让更多家人关心您的健康</Text>
          </View>
        </View>

        <View className={styles.listSection}>
          <View className={styles.sectionHeader}>
            <View className="sectionTitleText" style={{ display: 'flex', alignItems: 'center', gap: '16rpx' }}>
              <View className="sectionTitleDot" />
              <Text style={{ fontSize: '32rpx', fontWeight: '600', color: '#0F172A' }}>
                家属管理
              </Text>
            </View>
            <Button
              className={styles.addMemberBtn}
              onClick={handleAddMember}
            >
              + 添加
            </Button>
          </View>

          {members.length === 0 ? (
            <View className="emptyState">
              <View className="emptyIcon">👨‍👩‍👧</View>
              <Text className="emptyText">暂无家属成员</Text>
              <Text className="emptyDesc">点击上方邀请按钮添加家人</Text>
            </View>
          ) : (
            members.map(member => (
              <FamilyCard
                key={member.id}
                member={member}
                onToggleSync={handleToggleSync}
                onShare={handleShare}
                onEdit={handleEdit}
              />
            ))
          )}
        </View>

        <View className={styles.tipsSection}>
          <View className={styles.tipsHeader}>
            <Text>💡</Text>
            <Text>使用小贴士</Text>
          </View>
          <View className={styles.tipsList}>
            {tips.map((tip, idx) => (
              <View key={idx} className={styles.tipItem}>
                <View className={styles.tipDot} />
                <Text className={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View
        className="fabButton"
        onClick={handleAddMember}
        style={{ background: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)', boxShadow: '0 8rpx 32rpx rgba(249, 115, 22, 0.4)' }}
      >
        <Text className="fabButtonText">+</Text>
      </View>
    </ScrollView>
  );
};

export default FamilyPage;
