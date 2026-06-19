import React, { useState, useMemo } from 'react';
import { View, Text, Button, ScrollView, Input, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import useAppStore from '@/store';
import { Medicine, ReminderTime, FrequencyType } from '@/types';
import MedicineCard from '@/components/MedicineCard';

const CATEGORY_OPTIONS = ['抗生素', '降糖药', '降压药', '调脂药', '胃药', '抗过敏药', '营养补充', '其他'];
const FREQUENCY_OPTIONS: { value: FrequencyType; label: string; detail: string }[] = [
  { value: 'daily', label: '每日', detail: '每日3次' },
  { value: 'daily', label: '每日', detail: '每日2次' },
  { value: 'daily', label: '每日', detail: '每日1次' },
  { value: 'weekly', label: '每周', detail: '每周1次' },
  { value: 'interval', label: '按需', detail: '需要时服用' }
];
const REMINDER_TYPE_OPTIONS: { value: ReminderTime; label: string }[] = [
  { value: 'before_meal', label: '饭前' },
  { value: 'after_meal', label: '饭后' },
  { value: 'before_sleep', label: '睡前' },
  { value: 'custom', label: '自定义' }
];

const MedicinePage: React.FC = () => {
  const medicines = useAppStore((s) => s.medicines);
  const addMedicine = useAppStore((s) => s.addMedicine);
  const updateMedicine = useAppStore((s) => s.updateMedicine);
  const deleteMedicine = useAppStore((s) => s.deleteMedicine);
  const savePrescriptionToMedicine = useAppStore((s) => s.savePrescriptionToMedicine);

  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [searchText, setSearchText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formDose, setFormDose] = useState('');
  const [formFreqIdx, setFormFreqIdx] = useState(0);
  const [formDuration, setFormDuration] = useState('');
  const [formPrecautions, setFormPrecautions] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formThreshold, setFormThreshold] = useState('');
  const [formCategory, setFormCategory] = useState(CATEGORY_OPTIONS[0]);
  const [formReminderTime, setFormReminderTime] = useState('08:00');
  const [formReminderTypeIdx, setFormReminderTypeIdx] = useState(1);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(medicines.map(m => m.category)));
    return ['全部', ...cats];
  }, [medicines]);

  const summary = useMemo(() => {
    const total = medicines.length;
    const lowStock = medicines.filter(m => m.stock <= m.stockThreshold).length;
    const longTerm = medicines.filter(m => m.duration === '长期服用').length;
    const totalStock = medicines.reduce((sum, m) => sum + m.stock, 0);
    return { total, lowStock, longTerm, totalStock };
  }, [medicines]);

  const lowStockList = useMemo(() => {
    return medicines.filter(m => m.stock <= m.stockThreshold * 1.5);
  }, [medicines]);

  const filteredMedicines = useMemo(() => {
    return medicines.filter(m => {
      const matchCategory = activeCategory === '全部' || m.category === activeCategory;
      const matchSearch = !searchText ||
        m.name.includes(searchText) ||
        m.category.includes(searchText);
      return matchCategory && matchSearch;
    });
  }, [medicines, activeCategory, searchText]);

  const resetForm = () => {
    setFormName('');
    setFormDose('');
    setFormFreqIdx(0);
    setFormDuration('');
    setFormPrecautions('');
    setFormStock('');
    setFormThreshold('');
    setFormCategory(CATEGORY_OPTIONS[0]);
    setFormReminderTime('08:00');
    setFormReminderTypeIdx(1);
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEdit = (medicine: Medicine) => {
    setEditingId(medicine.id);
    setFormName(medicine.name);
    setFormDose(medicine.dose);
    const freqMatch = FREQUENCY_OPTIONS.findIndex(f => f.detail === medicine.frequencyDetail);
    setFormFreqIdx(freqMatch >= 0 ? freqMatch : 0);
    setFormDuration(medicine.duration);
    setFormPrecautions(medicine.precautions);
    setFormStock(String(medicine.stock));
    setFormThreshold(String(medicine.stockThreshold));
    setFormCategory(medicine.category);
    setFormReminderTime(medicine.reminderTimes[0] || '08:00');
    const rtIdx = REMINDER_TYPE_OPTIONS.findIndex(r => r.value === (medicine.reminderType[0] || 'after_meal'));
    setFormReminderTypeIdx(rtIdx >= 0 ? rtIdx : 1);
    setShowAddModal(true);
  };

  const handleSaveMedicine = () => {
    if (!formName.trim()) {
      Taro.showToast({ title: '请输入药品名称', icon: 'none' });
      return;
    }
    if (!formDose.trim()) {
      Taro.showToast({ title: '请输入剂量', icon: 'none' });
      return;
    }

    const freq = FREQUENCY_OPTIONS[formFreqIdx];
    const reminderType = REMINDER_TYPE_OPTIONS[formReminderTypeIdx].value;

    const reminderTimes = formReminderTime ? [formReminderTime] : [];
    const reminderTypes: ReminderTime[] = formReminderTime ? [reminderType] : [];

    const data = {
      name: formName.trim(),
      dose: formDose.trim(),
      frequency: freq.value,
      frequencyDetail: freq.detail,
      duration: formDuration.trim() || '按需',
      precautions: formPrecautions.trim() || '无特殊注意事项',
      reminderTimes,
      reminderType: reminderTypes,
      stock: parseInt(formStock) || 0,
      stockThreshold: parseInt(formThreshold) || 5,
      category: formCategory
    };

    if (editingId) {
      updateMedicine(editingId, data);
      Taro.showToast({ title: '药品已更新', icon: 'success' });
    } else {
      addMedicine(data);
      Taro.showToast({ title: '药品已添加', icon: 'success' });
    }
    setShowAddModal(false);
    resetForm();
  };

  const handleDelete = (medicine: Medicine) => {
    Taro.showModal({
      title: '确认删除',
      content: `确定删除"${medicine.name}"吗？相关提醒也会被移除。`,
      success: (res) => {
        if (res.confirm) {
          deleteMedicine(medicine.id);
          Taro.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  };

  const handleShowDetail = (medicine: Medicine) => {
    const hasPrescription = !!medicine.prescriptionImage;
    Taro.showActionSheet({
      itemList: [
        '查看详细信息',
        hasPrescription ? '查看处方照片' : '上传处方照片',
        '编辑药品',
        '删除药品'
      ],
      success: (res) => {
        if (res.tapIndex === 0) {
          Taro.showModal({
            title: medicine.name,
            content: `分类: ${medicine.category}\n剂量: ${medicine.dose}\n频次: ${medicine.frequencyDetail}\n疗程: ${medicine.duration}\n库存: ${medicine.stock}份\n提醒阈值: ${medicine.stockThreshold}份\n\n注意事项:\n${medicine.precautions}`,
            showCancel: false,
            confirmText: '知道了'
          });
        } else if (res.tapIndex === 1) {
          if (hasPrescription && medicine.prescriptionImage) {
            Taro.previewImage({
              urls: [medicine.prescriptionImage],
              current: medicine.prescriptionImage
            });
          } else {
            handleUploadPrescription(medicine.id);
          }
        } else if (res.tapIndex === 2) {
          handleEdit(medicine);
        } else if (res.tapIndex === 3) {
          handleDelete(medicine);
        }
      }
    });
  };

  const handleUploadPrescription = (medicineId?: string) => {
    Taro.chooseImage({
      count: 1,
      success: (res) => {
        const path = res.tempFilePaths[0];
        if (medicineId) {
          savePrescriptionToMedicine(medicineId, path);
          Taro.showToast({ title: '处方已保存', icon: 'success' });
        } else {
          Taro.showToast({ title: '请先选择药品', icon: 'none' });
        }
      },
      fail: (err) => {
        console.error('选择图片失败:', err);
        Taro.showToast({ title: '选择图片失败', icon: 'none' });
      }
    });
  };

  const handleAddPrescription = () => {
    if (medicines.length === 0) {
      Taro.showToast({ title: '请先添加药品', icon: 'none' });
      return;
    }
    Taro.showActionSheet({
      itemList: medicines.map(m => m.name),
      success: (res) => {
        const med = medicines[res.tapIndex];
        handleUploadPrescription(med.id);
      }
    });
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

      {showAddModal && (
        <View className={styles.modalMask} onClick={() => setShowAddModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>
              {editingId ? '编辑药品' : '添加新药品'}
            </Text>
            <ScrollView scrollY className={styles.modalScroll}>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>药品名称 *</Text>
                <Input
                  className={styles.formInput}
                  placeholder="如：阿莫西林胶囊"
                  value={formName}
                  onInput={(e) => setFormName(e.detail.value)}
                />
              </View>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>单次剂量 *</Text>
                <Input
                  className={styles.formInput}
                  placeholder="如：0.5g/次"
                  value={formDose}
                  onInput={(e) => setFormDose(e.detail.value)}
                />
              </View>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>服用频次</Text>
                <ScrollView scrollX className={styles.optionScroll}>
                  {FREQUENCY_OPTIONS.map((f, idx) => (
                    <Button
                      key={idx}
                      className={classnames(
                        styles.optionBtn,
                        formFreqIdx === idx && styles.optionBtnActive
                      )}
                      onClick={() => setFormFreqIdx(idx)}
                    >
                      {f.detail}
                    </Button>
                  ))}
                </ScrollView>
              </View>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>疗程</Text>
                <Input
                  className={styles.formInput}
                  placeholder="如：7天 / 长期服用"
                  value={formDuration}
                  onInput={(e) => setFormDuration(e.detail.value)}
                />
              </View>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>注意事项</Text>
                <Input
                  className={styles.formInput}
                  placeholder="如：饭后服用，避免饮酒"
                  value={formPrecautions}
                  onInput={(e) => setFormPrecautions(e.detail.value)}
                />
              </View>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>当前库存（份）</Text>
                <Input
                  className={styles.formInput}
                  type="number"
                  placeholder="如：30"
                  value={formStock}
                  onInput={(e) => setFormStock(e.detail.value)}
                />
              </View>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>低库存提醒阈值</Text>
                <Input
                  className={styles.formInput}
                  type="number"
                  placeholder="如：10"
                  value={formThreshold}
                  onInput={(e) => setFormThreshold(e.detail.value)}
                />
              </View>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>药品分类</Text>
                <ScrollView scrollX className={styles.optionScroll}>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <Button
                      key={cat}
                      className={classnames(
                        styles.optionBtn,
                        formCategory === cat && styles.optionBtnActive
                      )}
                      onClick={() => setFormCategory(cat)}
                    >
                      {cat}
                    </Button>
                  ))}
                </ScrollView>
              </View>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>提醒时间</Text>
                <Picker
                  mode="time"
                  value={formReminderTime}
                  onChange={(e: any) => setFormReminderTime(e.detail.value)}
                >
                  <View className={styles.formPicker}>{formReminderTime || '请选择'}</View>
                </Picker>
              </View>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>提醒方式</Text>
                <ScrollView scrollX className={styles.optionScroll}>
                  {REMINDER_TYPE_OPTIONS.map((r, idx) => (
                    <Button
                      key={r.value}
                      className={classnames(
                        styles.optionBtn,
                        formReminderTypeIdx === idx && styles.optionBtnActive
                      )}
                      onClick={() => setFormReminderTypeIdx(idx)}
                    >
                      {r.label}
                    </Button>
                  ))}
                </ScrollView>
              </View>
            </ScrollView>
            <View className={styles.modalFooter}>
              <Button className={styles.modalCancel} onClick={() => setShowAddModal(false)}>
                取消
              </Button>
              <Button className={styles.modalConfirm} onClick={handleSaveMedicine}>
                保存
              </Button>
            </View>
          </View>
        </View>
      )}

      <View className="fabButton" onClick={openAddModal}>
        <Text className="fabButtonText">+</Text>
      </View>
    </ScrollView>
  );
};

export default MedicinePage;
