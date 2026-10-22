import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Colors, CategoryColors } from '../theme/colors';
import { Task, PriorityLevel } from '../types';
import { CustomIcon } from './CustomIcon';
import { formatDateTime, getDeadlineRelativeStatus } from '../utils/date';

interface Props {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const PRIORITY_CONFIG: Record<
  PriorityLevel,
  { label: string; color: string; bg: string }
> = {
  URGENT: { label: 'URGENT', color: Colors.priorityUrgent, bg: Colors.priorityUrgentBg },
  HIGH: { label: 'HIGH', color: Colors.priorityHigh, bg: Colors.priorityHighBg },
  MEDIUM: { label: 'MEDIUM', color: Colors.priorityMedium, bg: Colors.priorityMediumBg },
  LOW: { label: 'LOW', color: Colors.priorityLow, bg: Colors.priorityLowBg },
};

export const TaskCard: React.FC<Props> = ({
  task,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const priorityInfo = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;
  const categoryConfig = CategoryColors[task.category] || CategoryColors.WORK;
  const deadlineStatus = getDeadlineRelativeStatus(task.deadline, task.isCompleted);

  const handleDeletePress = () => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(task._id),
        },
      ]
    );
  };

  return (
    <View
      style={[
        styles.itemRow,
        task.isCompleted && styles.itemRowCompleted,
        deadlineStatus.isOverdue && !task.isCompleted && styles.itemRowOverdue,
      ]}
    >
      {/* Interactive Circular Checkbox */}
      <TouchableOpacity
        style={[
          styles.checkbox,
          task.isCompleted && styles.checkboxCompleted,
        ]}
        onPress={() => onToggle(task._id)}
        activeOpacity={0.7}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.isCompleted }}
      >
        {task.isCompleted && (
          <CustomIcon name="check" size={14} color="#FFFDF9" />
        )}
      </TouchableOpacity>

      {/* Main Task Content (Title, Description, Meta) */}
      <TouchableOpacity
        style={styles.textContainer}
        onPress={() => onEdit(task)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.title,
            task.isCompleted && styles.titleCompleted,
          ]}
          numberOfLines={2}
        >
          {task.title}
        </Text>

        {task.description ? (
          <Text
            style={[
              styles.description,
              task.isCompleted && styles.descriptionCompleted,
            ]}
            numberOfLines={2}
          >
            {task.description}
          </Text>
        ) : null}

        {/* Minimalist Meta Line: Deadline & Priority Pill */}
        <View style={styles.metaRow}>
          {task.deadline ? (
            <View
              style={[
                styles.deadlineTag,
                deadlineStatus.isOverdue && !task.isCompleted && styles.deadlineTagOverdue,
                deadlineStatus.isSoon && !deadlineStatus.isOverdue && !task.isCompleted && styles.deadlineTagSoon,
              ]}
            >
              <CustomIcon
                name={deadlineStatus.isOverdue ? 'alert' : 'clock'}
                size={11}
                color={
                  deadlineStatus.isOverdue && !task.isCompleted
                    ? Colors.danger
                    : Colors.textMuted
                }
              />
              <Text
                style={[
                  styles.deadlineText,
                  deadlineStatus.isOverdue && !task.isCompleted && { color: Colors.danger },
                ]}
              >
                {deadlineStatus.text}
              </Text>
            </View>
          ) : null}

          {task.priority && task.priority !== 'MEDIUM' && (
            <View style={[styles.priorityPill, { backgroundColor: priorityInfo.bg }]}>
              <Text style={[styles.priorityText, { color: priorityInfo.color }]}>
                {priorityInfo.label}
              </Text>
            </View>
          )}

          {task.category && task.category !== 'WORK' && (
            <View style={[styles.categoryPill, { backgroundColor: categoryConfig.bg }]}>
              <Text style={[styles.categoryText, { color: categoryConfig.text }]}>
                {task.category}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Quick Action Icons: Edit & Delete */}
      <View style={styles.actionColumn}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onEdit(task)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <CustomIcon name="edit" size={13} color="#C59158" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleDeletePress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <CustomIcon name="trash" size={13} color="#C48E7C" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(197, 145, 88, 0.12)',
  },
  itemRowCompleted: {
    opacity: 0.6,
  },
  itemRowOverdue: {
    backgroundColor: 'rgba(217, 83, 79, 0.04)',
    borderRadius: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#C59158',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    marginRight: 14,
    backgroundColor: '#FAF5EE',
  },
  checkboxCompleted: {
    backgroundColor: '#C59158',
    borderColor: '#C59158',
  },
  textContainer: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2B2521',
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#8D8173',
  },
  description: {
    fontSize: 13,
    color: '#7A6E61',
    marginTop: 3,
    lineHeight: 18,
  },
  descriptionCompleted: {
    textDecorationLine: 'line-through',
    color: '#9C9082',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  deadlineTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(197, 145, 88, 0.1)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  deadlineTagOverdue: {
    backgroundColor: 'rgba(217, 83, 79, 0.12)',
  },
  deadlineTagSoon: {
    backgroundColor: 'rgba(224, 159, 62, 0.15)',
  },
  deadlineText: {
    fontSize: 11,
    color: '#7A6E61',
    fontWeight: '500',
  },
  priorityPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  categoryPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: '600',
  },
  actionColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  actionBtn: {
    padding: 4,
  },
});
