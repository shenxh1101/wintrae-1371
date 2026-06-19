import React, { useState } from 'react';
import { View, Text, Button, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { FamilyMember } from '@/types';

interface FamilyCardProps {
  member: FamilyMember;
  onToggleSync?: (id: string, enabled: boolean) => void;
  onShare?: (member: FamilyMember) => void;
  onEdit?: (member: FamilyMember) => void;
}

const FamilyCard: React.FC<FamilyCardProps> = ({ member, onToggleSync, onShare, onEdit }) => {
  const [isSyncEnabled, setIsSyncEnabled] = useState(member.isSyncEnabled);

  const handleToggleSync = () => {
    const newValue = !isSyncEnabled;
    setIsSyncEnabled(newValue);
    onToggleSync?.(member.id, newValue);
    Taro.showToast({
      title: newValue ? '已开启同步' : '已关闭同步',
      icon: 'success',
      duration: 1500
    });
    console.log('[FamilyCard] 同步状态:', { id: member.id, sync: newValue });
  };

  const handleCall = () => {
    Taro.makePhoneCall({
      phoneNumber: member.phone.replace(/\*/g, '0')
    }).catch((err) => {
      console.error('[FamilyCard] 拨号失败:', err);
      Taro.showToast({
        title: '拨号失败',
        icon: 'error'
      });
    });
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <View className={styles.avatar}>
          {member.avatar ? (
            <Image
              className={styles.avatarImage}
              src={member.avatar}
              mode="aspectFill"
            />
          ) : (
            <Text className={styles.avatarDefault}>👤</Text>
          )}
        </View>
        <View className={styles.userInfo}>
          <View className={styles.userName}>
            <Text>{member.name}</Text>
            <Text className={styles.relationshipTag}>{member.relationship}</Text>
          </View>
          <Text className={styles.userPhone}>📞 {member.phone}</Text>
        </View>
        <View className={styles.syncToggle}>
          <View
            className={classnames(styles.toggle, isSyncEnabled && styles.toggleActive)}
            onClick={handleToggleSync}
          />
        </View>
      </View>

      <View className={styles.permissions}>
        <Text className={styles.permTitle}>权限范围</Text>
        <View className={styles.permTags}>
          {member.permissions.map((perm, idx) => (
            <Text key={idx} className={styles.permTag}>{perm}</Text>
          ))}
        </View>
      </View>

      <View className={styles.syncStatus}>
        <Text className={styles.syncIcon}>
          {isSyncEnabled ? '✅' : '🔕'}
        </Text>
        <Text className={styles.syncText}>
          {isSyncEnabled
            ? member.name + '可实时接收服药提醒和记录同步'
            : '已暂停向' + member.name + '的同步提醒'}
        </Text>
      </View>

      <View className={styles.footer}>
        <Button
          className={classnames(styles.actionBtn, styles.btnSecondary)}
          onClick={handleCall}
        >
          拨打电话
        </Button>
        <Button
          className={classnames(styles.actionBtn, styles.btnSecondary)}
          onClick={() => onShare?.(member)}
        >
          分享报告
        </Button>
        <Button
          className={classnames(styles.actionBtn, styles.btnPrimary)}
          onClick={() => onEdit?.(member)}
        >
          编辑
        </Button>
      </View>
    </View>
  );
};

export default FamilyCard;
