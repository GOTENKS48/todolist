import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Colors } from '../theme/colors';
import { FilterStatus, SortOption } from '../types';
import { CustomIcon } from './CustomIcon';

interface Props {
  filterStatus: FilterStatus;
  onChangeFilterStatus: (status: FilterStatus) => void;
  sortBy: SortOption;
  onChangeSortBy: (sort: SortOption) => void;
  taskCount: number;
}

const SORT_OPTIONS: { id: SortOption; label: string; icon: string }[] = [
  { id: 'smartScore', label: 'Smart Mix (Urgency + Priority)', icon: '🔥' },
  { id: 'deadline', label: 'Earliest Deadline First', icon: '⏰' },
  { id: 'priority', label: 'Highest Priority First', icon: '⚡' },
  { id: 'dateTime', label: 'Task Scheduled Date', icon: '📅' },
  { id: 'createdAt', label: 'Recently Created', icon: '✨' },
];

export const SortBar: React.FC<Props> = ({
  filterStatus,
  onChangeFilterStatus,
  sortBy,
  onChangeSortBy,
  taskCount,
}) => {
  const [isSortModalVisible, setIsSortModalVisible] = useState(false);

  const activeSortLabel =
    SORT_OPTIONS.find((s) => s.id === sortBy)?.label.split(' ')[0] || 'Smart';

  return (
    <View style={styles.container}>
      {/* Status Segmented Tabs */}
      <View style={styles.tabsWrapper}>
        {(['ALL', 'PENDING', 'COMPLETED'] as FilterStatus[]).map((status) => {
          const isActive = filterStatus === status;
          return (
            <TouchableOpacity
              key={status}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => onChangeFilterStatus(status)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  isActive && styles.tabTextActive,
                ]}
              >
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Sort Trigger Button */}
      <TouchableOpacity
        style={styles.sortButton}
        onPress={() => setIsSortModalVisible(true)}
        activeOpacity={0.7}
      >
        <CustomIcon name="sort" size={14} color={Colors.primaryLight} />
        <Text style={styles.sortButtonText}>{activeSortLabel}</Text>
      </TouchableOpacity>

      {/* Sort Picker Modal */}
      <Modal
        visible={isSortModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSortModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsSortModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Sort Tasks By</Text>
                  <TouchableOpacity
                    onPress={() => setIsSortModalVisible(false)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <CustomIcon name="close" size={16} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>

                {SORT_OPTIONS.map((option) => {
                  const isSelected = sortBy === option.id;
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.sortOptionRow,
                        isSelected && styles.sortOptionSelected,
                      ]}
                      onPress={() => {
                        onChangeSortBy(option.id);
                        setIsSortModalVisible(false);
                      }}
                    >
                      <Text style={styles.optionEmoji}>{option.icon}</Text>
                      <Text
                        style={[
                          styles.optionLabel,
                          isSelected && styles.optionLabelSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                      {isSelected && (
                        <CustomIcon name="check" size={14} color={Colors.primary} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 10,
  },
  tabsWrapper: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.border,
    flex: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  sortButtonText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.bgOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Colors.bgSecondary,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sortOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sortOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.bgCardHover,
  },
  optionEmoji: {
    fontSize: 16,
    marginRight: 10,
  },
  optionLabel: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  optionLabelSelected: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
});
