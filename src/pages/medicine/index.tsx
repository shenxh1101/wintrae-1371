import React, { useState, useMemo } from 'react';
import { View, Text, Button, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { medicines as initialMedicines } from '@/data/medicines';
import { Medicine } from '@/types';
import MedicineCard from '@/components/MedicineCard';

const MedicinePage: React.FC = () => {
  const [medList] = useState<Medicine[]>(initialMedicines);
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [searchText, setSearchText] = useState('');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(medList.map(m => m.category)));
    return ['全部', ...cats];
  }, [medList]);

  const summary = useMemo(() => {
    const total = medList.length;
    const lowStock = medList.filter(m => m.stock <= m.stockThreshold).length;
    const longTerm = medList.filter(m => m.duration === '长期服用').length;
    const totalStock = medList.reduce((sum, m) => sum + m.stock, 0);
    return { total, lowStock, longTerm, totalStock };
  }, [medList]);

  const lowStockList = useMemo(() => {
    return medList.filter(m => m.stock <= m.stockThreshold * 1.5);
  }, [medList]);

  const filteredMedicines = useMemo(() => {
    return medList.filter(m => {
      const matchCategory = activeCategory === '全部' || m.category === activeCategory;
      const matchSearch = !searchText ||
        m.name.includes(searchText) ||
        m.category.includes(searchText);
      return matchCategory && matchSearch;
    });
  }, [medList, activeCategory, searchText]);

  const handleEdit = (medicine: Medicine) => {
    Taro.showToast({ title: `编辑: ${medicine.name}`, icon: 'none' });
    console.log('[Medicine] 编辑药品:', medicine);
  };

  const handleShowDetail = (medicine: Medicine) => {
    Taro.showModal({
      title: medicine.name,
      content: `分类: ${medicine.category}\n剂量: ${medicine.dose}\n频次: ${medicine.frequencyDetail}\n疗程: ${medicine.duration}\n库存: ${medicine.stock}份\n\n注意事项:\n${medicine.precautions}`,
      showCancel: false,
      confirmText: '知道了'
    });
  };

  const handleAddPrescription = () => {
    Taro.chooseImage({
      count: 1,
      success: (res) => {
        console.log('[Medicine] 处方照片:', res.tempFilePaths);
        Taro.showToast({ title: '处方已保存', icon: 'success' });
      },
      fail: (err) => {
        console.error('[Medicine] 选择图片失败:', err);
      }
    });
  };

  const handleAddMedicine = () => {
    Taro.showToast({ title: '添加药品', icon: 'none' });
  };

  const summaryItems = [
    { value: summary.total, label: '药品总数', icon: '💊' },
    { value: summary.longTerm, label: '长期用药', icon: '📅' },
    { value: summary.lowStock, label: '库存不足', icon: '⚠️' },
    { value: summary.totalStock, label: '总库存份', icon: '📦' }
  ];

  return (
    <ScrollView scrollY style={{ minHeight: '100vh' }}>
      <View className="pageContainer">
        <View className="pageHeader">
          <Text className="pageTitle">家庭药品柜</Text>
          <Text className="pageSubtitle">管理您和家人的所有药品信息</Text>
        </View>

        <View className={styles.searchBar}>
          <View className={styles.searchInput}>
            <Text className={styles.searchIcon}>🔍</Text>
            <Input
              className={styles.searchText}
              placeholder="搜索药品名称或分类"
              value={searchText}
              onInput={(e) => setSearchText(e.detail.value)}
            />
          </View>
        </View>

        <ScrollView
          scrollX
          className={styles.categoryTabs}
          style={{ width: '100%' }}
        >
          {categories.map(cat => (
            <Button
              key={cat}
              className={classnames(
                styles.categoryTab,
                activeCategory === cat && styles.categoryTabActive
              )}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </ScrollView>

        <View className={styles.summaryCard}>
          <View className={styles.summaryStats}>
            {summaryItems.map((item, idx) => (
              <View key={idx} className={styles.summaryItem}>
                <Text style={{ fontSize: '36rpx', marginBottom: '8rpx' }}>{item.icon}</Text>
                <Text className={styles.summaryValue}>{item.value}</Text>
                <Text className={styles.summaryLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {lowStockList.length > 0 && (
          <View className={styles.lowStockCard}>
            <Text className={styles.lowStockIcon}>⚠️</Text>
            <View className={styles.lowStockContent}>
              <Text className={styles.lowStockTitle}>
                {lowStockList.length}种药品库存不足
              </Text>
              <Text className={styles.lowStockText}>
                {lowStockList.map(m => m.name).join('、')}
              </Text>
            </View>
          </View>
        )}

        <View className={styles.addPrescription} onClick={handleAddPrescription}>
          <Text className={styles.addPrescriptionIcon}>📷</Text>
          <Text className={styles.addPrescriptionText}>拍照保存处方/药盒</Text>
        </View>

        <View className={styles.listContainer}>
          <View className="sectionTitle" style={{ marginBottom: '24rpx' }}>
            <View className="sectionTitleText">
              <View className="sectionTitleDot" />
              <Text>{activeCategory}</Text>
            </View>
            <Text style={{ fontSize: '24rpx', color: '#94A3B8' }}>
              共{filteredMedicines.length}种
            </Text>
          </View>

          {filteredMedicines.length === 0 ? (
            <View className="emptyState">
              <View className="emptyIcon">💊</View>
              <Text className="emptyText">暂无该分类药品</Text>
              <Text className="emptyDesc">点击右下角按钮添加新药品</Text>
            </View>
          ) : (
            filteredMedicines.map(med => (
              <MedicineCard
                key={med.id}
                medicine={med}
                onEdit={handleEdit}
                onShowDetail={handleShowDetail}
              />
            ))
          )}
        </View>
      </View>

      <View className="fabButton" onClick={handleAddMedicine}>
        <Text className="fabButtonText">+</Text>
      </View>
    </ScrollView>
  );
};

export default MedicinePage;
