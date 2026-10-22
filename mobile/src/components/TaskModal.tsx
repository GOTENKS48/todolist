import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Colors, CategoryColors } from '../theme/colors';
import { Task, PriorityLevel, TaskCategory } from '../types';
import { CustomIcon } from './CustomIcon';
import { formatDateTime } from '../utils/date';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (taskData: {
    title: string;
    description: string;
    dateTime: string;
    deadline: string;
    priority: PriorityLevel;
    category: TaskCategory;
  }) => Promise<void>;
  initialTask?: Task | null;
  isLoading?: boolean;
}

const PRIORITIES: PriorityLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const CATEGORIES: TaskCategory[] = [
  'WORK',
  'PERSONAL',
  'STUDY',
  'URGENT',
  'HEALTH',
  'FINANCE',
  'OTHER',
];

export const TaskModal: React.FC<Props> = ({
  visible,
  onClose,
  onSubmit,
  initialTask,
  isLoading = false,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('MEDIUM');
  const [category, setCategory] = useState<TaskCategory>('WORK');
  const [deadline, setDeadline] = useState<Date>(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [dateTime, setDateTime] = useState<Date>(new Date());

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setPriority(initialTask.priority);
      setCategory(initialTask.category);
      setDeadline(new Date(initialTask.deadline));
      setDateTime(new Date(initialTask.dateTime));
    } else {
      // Defaults for new task
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setCategory('WORK');
      setDeadline(new Date(Date.now() + 24 * 60 * 60 * 1000));
      setDateTime(new Date());
    }
  }, [initialTask, visible]);

  const handleDateTimePreset = (preset: 'now' | 'evening' | 'tomorrow' | 'dayAfter') => {
    const d = new Date();
    if (preset === 'now') {
      setDateTime(new Date());
    } else if (preset === 'evening') {
      d.setHours(18, 0, 0, 0);
      setDateTime(d);
    } else if (preset === 'tomorrow') {
      d.setDate(d.getDate() + 1);
      d.setHours(9, 0, 0, 0);
      setDateTime(d);
    } else if (preset === 'dayAfter') {
      d.setDate(d.getDate() + 2);
      d.setHours(9, 0, 0, 0);
      setDateTime(d);
    }
  };

  const adjustDateTimeHours = (deltaHours: number) => {
    setDateTime(new Date(dateTime.getTime() + deltaHours * 60 * 60 * 1000));
  };

  const handleDeadlinePreset = (hoursFromNow: number) => {
    setDeadline(new Date(Date.now() + hoursFromNow * 60 * 60 * 1000));
  };

  const adjustDeadlineHours = (deltaHours: number) => {
    setDeadline(new Date(deadline.getTime() + deltaHours * 60 * 60 * 1000));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Required Field', 'Please enter a task title.');
      return;
    }

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        dateTime: dateTime.toISOString(),
        deadline: deadline.toISOString(),
        priority,
        category,
      });
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save task.');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.sheetContainer}>
          {/* Sheet Header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>
                {initialTask ? 'Edit Task' : 'Create New Task'}
              </Text>
              <Text style={styles.sheetSubtitle}>
                {initialTask ? 'Update task requirements' : 'Add a task to your priority queue'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <CustomIcon name="close" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.formScroll}
            showsVerticalScrollIndicator={false}
          >
            {/* Task Title */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Task Title *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="What needs to get done?"
                placeholderTextColor={Colors.textMuted}
                value={title}
                onChangeText={setTitle}
                maxLength={120}
              />
            </View>

            {/* Description */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Add extra context, notes, or sub-points..."
                placeholderTextColor={Colors.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                maxLength={1000}
              />
            </View>

            {/* Priority Selector */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Priority Level</Text>
              <View style={styles.pillRow}>
                {PRIORITIES.map((p) => {
                  const isSelected = priority === p;
                  return (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.prioritySelectPill,
                        isSelected && styles.prioritySelectPillActive,
                        isSelected && p === 'URGENT' && { borderColor: Colors.danger },
                        isSelected && p === 'HIGH' && { borderColor: Colors.warning },
                      ]}
                      onPress={() => setPriority(p)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.prioritySelectText,
                          isSelected && styles.prioritySelectTextActive,
                          isSelected && p === 'URGENT' && { color: Colors.danger },
                          isSelected && p === 'HIGH' && { color: Colors.warning },
                        ]}
                      >
                        {p}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Category Selector */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Category / Tag</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.pillRow}>
                  {CATEGORIES.map((c) => {
                    const isSelected = category === c;
                    const col = CategoryColors[c];
                    return (
                      <TouchableOpacity
                        key={c}
                        style={[
                          styles.categorySelectPill,
                          isSelected && {
                            backgroundColor: col.bg,
                            borderColor: col.dot,
                          },
                        ]}
                        onPress={() => setCategory(c)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.catDot, { backgroundColor: col.dot }]} />
                        <Text
                          style={[
                            styles.categorySelectText,
                            isSelected && { color: col.text, fontWeight: '700' },
                          ]}
                        >
                          {c}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            {/* Scheduled Date-Time Selection */}
            <View style={styles.fieldGroup}>
              <View style={styles.deadlineHeader}>
                <View style={styles.labelWithIcon}>
                  <CustomIcon name="calendar" size={14} color={Colors.primaryLight} />
                  <Text style={[styles.fieldLabel, { marginBottom: 0, marginLeft: 6 }]}>
                    Date & Time (Scheduled) *
                  </Text>
                </View>
                <Text style={styles.currentDeadline}>{formatDateTime(dateTime)}</Text>
              </View>

              <Text style={styles.presetLabel}>Quick Presets:</Text>
              <View style={styles.presetRow}>
                <TouchableOpacity
                  style={styles.presetButton}
                  onPress={() => handleDateTimePreset('now')}
                >
                  <Text style={styles.presetText}>Now</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.presetButton}
                  onPress={() => handleDateTimePreset('evening')}
                >
                  <Text style={styles.presetText}>Today 6 PM</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.presetButton}
                  onPress={() => handleDateTimePreset('tomorrow')}
                >
                  <Text style={styles.presetText}>Tomorrow 9 AM</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.presetButton}
                  onPress={() => handleDateTimePreset('dayAfter')}
                >
                  <Text style={styles.presetText}>+2 Days</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.adjusterRow, { marginTop: 6 }]}>
                <TouchableOpacity
                  style={styles.adjusterBtn}
                  onPress={() => adjustDateTimeHours(-1)}
                >
                  <Text style={styles.adjusterText}>-1 Hour</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.adjusterBtn}
                  onPress={() => adjustDateTimeHours(1)}
                >
                  <Text style={styles.adjusterText}>+1 Hour</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.adjusterBtn}
                  onPress={() => adjustDateTimeHours(24)}
                >
                  <Text style={styles.adjusterText}>+1 Day</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Deadline Selection */}
            <View style={styles.fieldGroup}>
              <View style={styles.deadlineHeader}>
                <View style={styles.labelWithIcon}>
                  <CustomIcon name="clock" size={14} color={Colors.warning} />
                  <Text style={[styles.fieldLabel, { marginBottom: 0, marginLeft: 6 }]}>
                    Deadline *
                  </Text>
                </View>
                <Text style={[styles.currentDeadline, { color: Colors.warning }]}>
                  {formatDateTime(deadline)}
                </Text>
              </View>

              <Text style={styles.presetLabel}>Quick Presets:</Text>
              <View style={styles.presetRow}>
                <TouchableOpacity
                  style={styles.presetButton}
                  onPress={() => handleDeadlinePreset(4)}
                >
                  <Text style={styles.presetText}>+4 Hours</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.presetButton}
                  onPress={() => handleDeadlinePreset(24)}
                >
                  <Text style={styles.presetText}>Tomorrow</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.presetButton}
                  onPress={() => handleDeadlinePreset(72)}
                >
                  <Text style={styles.presetText}>+3 Days</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.presetButton}
                  onPress={() => handleDeadlinePreset(168)}
                >
                  <Text style={styles.presetText}>1 Week</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.adjusterRow, { marginTop: 6 }]}>
                <TouchableOpacity
                  style={styles.adjusterBtn}
                  onPress={() => adjustDeadlineHours(-1)}
                >
                  <Text style={styles.adjusterText}>-1 Hour</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.adjusterBtn}
                  onPress={() => adjustDeadlineHours(1)}
                >
                  <Text style={styles.adjusterText}>+1 Hour</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.adjusterBtn}
                  onPress={() => adjustDeadlineHours(24)}
                >
                  <Text style={styles.adjusterText}>+1 Day</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
                onPress={handleSave}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <Text style={styles.submitBtnText}>
                  {isLoading
                    ? 'Saving...'
                    : initialTask
                    ? 'Update Task'
                    : 'Create Task'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.bgOverlay,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Colors.bgSecondary,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '90%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sheetSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formScroll: {
    marginBottom: 10,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.textPrimary,
    fontSize: 15,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  prioritySelectPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  prioritySelectPillActive: {
    backgroundColor: Colors.bgCardHover,
    borderColor: Colors.primary,
  },
  prioritySelectText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  prioritySelectTextActive: {
    color: Colors.textPrimary,
  },
  categorySelectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  categorySelectText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  deadlineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentDeadline: {
    fontSize: 13,
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  presetLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: 6,
    fontWeight: '600',
  },
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetButton: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  presetText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  adjusterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  adjusterBtn: {
    flex: 1,
    backgroundColor: Colors.bgCardHover,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  adjusterText: {
    fontSize: 10,
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    marginBottom: 16,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '700',
  },
  submitBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
