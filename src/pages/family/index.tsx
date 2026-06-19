import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Button, ScrollView, Input, Picker, Switch } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import useAppStore from '@/store';
import { FamilyMember } from '@/types';
import FamilyCard from '@/components/FamilyCard';

const RELATIONSHIP_OPTIONS = ['父亲', '母亲', '配偶', '子女', '兄弟姐妹', '家庭医生', '其他'];
const PERMISSION_OPTIONS = ['查看记录', '接收提醒', '编辑药品', '管理家属', '导出报告'];

const modalMaskStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'flex-end',
  zIndex: 1000
};

const modalContentStyle: React.CSSProperties = {
  width: '100%',
  maxHeight: '85vh',
  background: '#fff',
  borderRadius: '24rpx 24rpx 0 0',
  display: 'flex',
  flexDirection: 'column'
};

const modalTitleStyle: React.CSSProperties = {
  padding: '32rpx 32rpx 24rpx',
  fontSize: '36rpx',
  fontWeight: '700',
  color: '#0F172A',
  textAlign: 'center',
  borderBottom: '1rpx solid #F1F5F9'
};

const modalScrollStyle: React.CSSProperties = {
  flex: 1,
  padding: '24rpx 32rpx 32rpx',
  maxHeight: '60vh'
};

const formItemStyle: React.CSSProperties = {
  marginBottom: '24rpx'
};

const formLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '28rpx',
  fontWeight: '500',
  color: '#0F172A',
  marginBottom: '16rpx'
};

const formInputStyle: React.CSSProperties = {
  width: '100%',
  height: '80rpx',
  padding: '0 32rpx',
  background: '#F8FAFC',
  borderRadius: '16rpx',
  fontSize: '28rpx',
  color: '#0F172A',
  boxSizing: 'border-box'
};

const formPickerStyle: React.CSSProperties = {
  width: '100%',
  height: '80rpx',
  padding: '0 32rpx',
  background: '#F8FAFC',
  borderRadius: '16rpx',
  fontSize: '28rpx',
  color: '#0F172A',
  display: 'flex',
  alignItems: 'center',
  boxSizing: 'border-box'
};

const optionScrollStyle: React.CSSProperties = {
  display: 'flex',
  gap: '16rpx',
  whiteSpace: 'nowrap'
};

const optionBtnStyle: React.CSSProperties = {
  height: '64rpx',
  padding: '0 32rpx',
  background: '#F8FAFC',
  border: '1rpx solid #E2E8F0',
  borderRadius: '40rpx',
  fontSize: '24rpx',
  color: '#64748B',
  flexShrink: 0
};

const optionBtnActiveStyle: React.CSSProperties = {
  height: '64rpx',
  padding: '0 32rpx',
  background: 'linear-gradient(135deg, #22C55E 0%, #4ADE80 100%)',
  border: 'none',
  borderRadius: '40rpx',
  fontSize: '24rpx',
  color: '#fff',
  flexShrink: 0
};

const switchRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 32rpx',
  height: '80rpx',
  background: '#F8FAFC',
  borderRadius: '16rpx'
};

const modalFooterStyle: React.CSSProperties = {
  display: 'flex',
  gap: '24rpx',
  padding: '24rpx 32rpx',
  paddingBottom: 'calc(24rpx + env(safe-area-inset-bottom))',
  borderTop: '1rpx solid #F1F5F9',
  background: '#fff'
};

const modalCancelStyle: React.CSSProperties = {
  flex: 1,
  height: '88rpx',
  background: '#F8FAFC',
  borderRadius: '40rpx',
  fontSize: '32rpx',
  fontWeight: '600',
  color: '#64748B'
};

const modalConfirmStyle: React.CSSProperties = {
  flex: 1,
  height: '88rpx',
  background: 'linear-gradient(135deg, #22C55E 0%, #4ADE80 100%)',
  borderRadius: '40rpx',
  fontSize: '32rpx',
  fontWeight: '600',
  color: '#fff',
  boxShadow: '0 8rpx 20rpx rgba(34, 197, 94, 0.3)'
};

const permTagWrapStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '16rpx'
};

const permTagStyle: React.CSSProperties = {
  padding: '12rpx 24rpx',
  background: '#F8FAFC',
  border: '1rpx solid #E2E8F0',
  borderRadius: '32rpx',
  fontSize: '24rpx',
  color: '#64748B'
};

const permTagActiveStyle: React.CSSProperties = {
  padding: '12rpx 24rpx',
  background: 'linear-gradient(135deg, #22C55E 0%, #4ADE80 100%)',
  border: 'none',
  borderRadius: '32rpx',
  fontSize: '24rpx',
  color: '#fff'
};

const FamilyPage: React.FC = () => {
  const familyMembers = useAppStore((s) => s.familyMembers);
  const addFamilyMember = useAppStore((s) => s.addFamilyMember);
  const updateFamilyMember = useAppStore((s) => s.updateFamilyMember);
  const deleteFamilyMember = useAppStore((s) => s.deleteFamilyMember);
  const toggleFamilySync = useAppStore((s) => s.toggleFamilySync);
  const generateDoctorReport = useAppStore((s) => s.generateDoctorReport);
  const hydrate = useAppStore((s) => s.hydrate);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formRelationship, setFormRelationship] = useState(RELATIONSHIP_OPTIONS[0]);
  const [formPhone, setFormPhone] = useState('');
  const [formAvatar, setFormAvatar] = useState('');
  const [formIsSyncEnabled, setFormIsSyncEnabled] = useState(true);
  const [formPermissions, setFormPermissions] = useState<string[]>(['查看记录', '接收提醒']);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const summary = useMemo(() => {
    const total = familyMembers.length;
    const syncEnabled = familyMembers.filter(m => m.isSyncEnabled).length;
    const canEdit = familyMembers.filter(m => m.permissions.includes('编辑药品')).length;
    return { total, syncEnabled, canEdit };
  }, [familyMembers]);

  const resetForm = () => {
    setFormName('');
    setFormRelationship(RELATIONSHIP_OPTIONS[0]);
    setFormPhone('');
    setFormAvatar('');
    setFormIsSyncEnabled(true);
    setFormPermissions(['查看记录', '接收提醒']);
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (member: FamilyMember) => {
    setEditingId(member.id);
    setFormName(member.name);
    setFormRelationship(member.relationship);
    setFormPhone(member.phone);
    setFormAvatar(member.avatar);
    setFormIsSyncEnabled(member.isSyncEnabled);
    setFormPermissions([...member.permissions]);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formName.trim()) {
      Taro.showToast({ title: '请输入姓名', icon: 'none' });
      return;
    }
    if (!formRelationship.trim()) {
      Taro.showToast({ title: '请选择关系', icon: 'none' });
      return;
    }

    const data = {
      name: formName.trim(),
      relationship: formRelationship.trim(),
      phone: formPhone.trim() || '未填写',
      avatar: formAvatar.trim() || '',
      isSyncEnabled: formIsSyncEnabled,
      permissions: formPermissions.length > 0 ? formPermissions : ['查看记录']
    };

    if (editingId) {
      updateFamilyMember(editingId, data);
      Taro.showToast({ title: '已更新', icon: 'success' });
    } else {
      addFamilyMember(data);
      Taro.showToast({ title: '已添加', icon: 'success' });
    }
    setShowModal(false);
    resetForm();
  };

  const handleToggleSync = (id: string) => {
    toggleFamilySync(id);
  };

  const handleShare = (member: FamilyMember) => {
    Taro.showActionSheet({
      itemList: ['发送健康周报', '发送月度报告', '发送就诊记录', '发送全部数据'],
      success: () => {
        const reportText = generateDoctorReport();
        Taro.setClipboardData({
          data: reportText,
          success: () => {
            Taro.showToast({
              title: '已复制到剪贴板',
              icon: 'success'
            });
          }
        });
      },
      fail: (err) => {
        console.error('[Family] 分享失败:', err);
      }
    });
  };

  const handleGenerateReport = () => {
    Taro.showLoading({ title: '生成报告中...' });
    setTimeout(() => {
      Taro.hideLoading();
      const reportText = generateDoctorReport();
      Taro.showModal({
        title: '健康报告',
        content: reportText,
        confirmText: '复制内容',
        cancelText: '关闭',
        success: (res) => {
          if (res.confirm) {
            Taro.setClipboardData({
              data: reportText,
              success: () => {
                Taro.showToast({
                  title: '已复制到剪贴板',
                  icon: 'success'
                });
              }
            });
          }
        }
      });
    }, 500);
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

  const handleDelete = (member: FamilyMember) => {
    Taro.showModal({
      title: '确认删除',
      content: `确定删除"${member.name}"吗？`,
      success: (res) => {
        if (res.confirm) {
          deleteFamilyMember(member.id);
          Taro.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  };

  const togglePermission = (perm: string) => {
    if (formPermissions.includes(perm)) {
      setFormPermissions(formPermissions.filter(p => p !== perm));
    } else {
      setFormPermissions([...formPermissions, perm]);
    }
  };

  const reportOptions = [
    {
      icon: '📋',
      title: '就诊摘要',
      desc: '药品清单+复诊记录',
      bg: '#DCFCE7',
      color: '#22C55E'
    },
    {
      icon: '📊',
      title: '服药报告',
      desc: '连续服药率+异常记录',
      bg: '#DBEAFE',
      color: '#3B82F6'
    },
    {
      icon: '🩺',
      title: '体征趋势',
      desc: '血压/血糖/心率数据',
      bg: '#FEF3C7',
      color: '#F59E0B'
    },
    {
      icon: '📄',
      title: '完整报告',
      desc: '含全部健康数据',
      bg: '#FFEDD5',
      color: '#F97316'
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
                onClick={handleGenerateReport}
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
              onClick={openAddModal}
            >
              + 添加
            </Button>
          </View>

          {familyMembers.length === 0 ? (
            <View className="emptyState">
              <View className="emptyIcon">👨‍👩‍👧</View>
              <Text className="emptyText">暂无家属成员</Text>
              <Text className="emptyDesc">点击上方邀请按钮添加家人</Text>
            </View>
          ) : (
            familyMembers.map(member => (
              <FamilyCard
                key={member.id}
                member={member}
                onToggleSync={(id) => handleToggleSync(id)}
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

      {showModal && (
        <View style={modalMaskStyle} onClick={() => setShowModal(false)}>
          <View style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <Text style={modalTitleStyle}>
              {editingId ? '编辑家属成员' : '添加家属成员'}
            </Text>
            <ScrollView scrollY style={modalScrollStyle}>
              <View style={formItemStyle}>
                <Text style={formLabelStyle}>姓名 *</Text>
                <Input
                  style={formInputStyle}
                  placeholder="请输入姓名"
                  value={formName}
                  onInput={(e) => setFormName(e.detail.value)}
                />
              </View>
              <View style={formItemStyle}>
                <Text style={formLabelStyle}>关系</Text>
                <ScrollView scrollX style={optionScrollStyle}>
                  {RELATIONSHIP_OPTIONS.map((rel) => (
                    <Button
                      key={rel}
                      style={formRelationship === rel ? optionBtnActiveStyle : optionBtnStyle}
                      onClick={() => setFormRelationship(rel)}
                    >
                      {rel}
                    </Button>
                  ))}
                </ScrollView>
              </View>
              <View style={formItemStyle}>
                <Text style={formLabelStyle}>手机号</Text>
                <Input
                  style={formInputStyle}
                  type="number"
                  placeholder="请输入手机号"
                  value={formPhone}
                  onInput={(e) => setFormPhone(e.detail.value)}
                />
              </View>
              <View style={formItemStyle}>
                <Text style={formLabelStyle}>头像链接</Text>
                <Input
                  style={formInputStyle}
                  placeholder="请输入头像URL（可选）"
                  value={formAvatar}
                  onInput={(e) => setFormAvatar(e.detail.value)}
                />
              </View>
              <View style={formItemStyle}>
                <Text style={formLabelStyle}>同步开关</Text>
                <View style={switchRowStyle}>
                  <Text style={{ fontSize: '28rpx', color: '#0F172A' }}>
                    {formIsSyncEnabled ? '已开启实时同步' : '已关闭同步'}
                  </Text>
                  <Switch
                    checked={formIsSyncEnabled}
                    onChange={(e) => setFormIsSyncEnabled(e.detail.value)}
                    color="#22C55E"
                  />
                </View>
              </View>
              <View style={formItemStyle}>
                <Text style={formLabelStyle}>权限设置</Text>
                <View style={permTagWrapStyle}>
                  {PERMISSION_OPTIONS.map((perm) => (
                    <View
                      key={perm}
                      style={formPermissions.includes(perm) ? permTagActiveStyle : permTagStyle}
                      onClick={() => togglePermission(perm)}
                    >
                      <Text>{perm}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
            <View style={modalFooterStyle}>
              <Button style={modalCancelStyle} onClick={() => setShowModal(false)}>
                取消
              </Button>
              <Button style={modalConfirmStyle} onClick={handleSave}>
                保存
              </Button>
            </View>
          </View>
        </View>
      )}

      <View
        className="fabButton"
        onClick={openAddModal}
        style={{ background: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)', boxShadow: '0 8rpx 32rpx rgba(249, 115, 22, 0.4)' }}
      >
        <Text className="fabButtonText">+</Text>
      </View>
    </ScrollView>
  );
};

export default FamilyPage;
