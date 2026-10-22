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
        styles.card,
        task.isCompleted && styles.cardCompleted,
        deadlineStatus.isOverdue && !task.isCompleted && styles.cardOverdue,
      ]}
    >
      {/* Top Meta Header: Priority, Category, Deadline Urgency Badge */}
      <View style={styles.headerRow}>
        <View style={styles.tagsContainer}>
          {/* Priority Pill */}
          <View style={[styles.priorityPill, { backgroundColor: priorityInfo.bg }]}>
            <View style={[styles.priorityDot, { backgroundColor: priorityInfo.color }]} />
            <Text style={[styles.priorityText, { color: priorityInfo.color }]}>
              {priorityInfo.label}
            </Text>
          </View>

          {/* Category Pill */}
          <View style={[styles.categoryPill, { backgroundColor: categoryConfig.bg }]}>
            <Text style={[styles.categoryText, { color: categoryConfig.text }]}>
              {task.category}
            </Text>
          </View>
        </View>

        {/* Deadline Status Tag */}
        <View
          style={[
            styles.deadlineBadge,
            deadlineStatus.isOverdue && styles.deadlineBadgeOverdue,
            deadlineStatus.isSoon && !deadlineStatus.isOverdue && styles.deadlineBadgeSoon,
            task.isCompleted && styles.deadlineBadgeCompleted,
          ]}
        >
          <CustomIcon
            name={deadlineStatus.isOverdue ? 'alert' : 'clock'}
            size={12}
            color={
              deadlineStatus.isOverdue
                ? Colors.danger
                : deadlineStatus.isSoon
                ? Colors.warning
                : Colors.textMuted
            }
          />
          <Text
            style={[
              styles.deadlineText,
              deadlineStatus.isOverdue && { color: Colors.danger },
              deadlineStatus.isSoon && !deadlineStatus.isOverdue && { color: Colors.warning },
              task.isCompleted && { color: Colors.success },
            ]}
          >
            {deadlineStatus.text}
          </Text>
        </View>
      </View>

      {/* Main Body: Checkbox + Title & Description */}
      <View style={styles.bodyRow}>
        {/* Interactive Checkbox */}
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
            <CustomIcon name="check" size={13} color={Colors.white} />
          )}
        </TouchableOpacity>

        {/* Task Details */}
        <TouchableOpacity
          style={styles.contentContainer}
          onPress={() => onEdit(task)}
          activeOpacity={0.8}
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
        </TouchableOpacity>
      </View>

      {/* Footer Info: Schedule Date, Deadline, and Action Icons */}
      <View style={styles.footerRow}>
        <View style={styles.dateTimeColumn}>
          <View style={styles.dateTimeRow}>
            <CustomIcon name="calendar" size={11} color={Colors.textMuted} />
            <Text style={styles.dateLabel}>Scheduled:</Text>
            <Text style={styles.dateValue}>{formatDateTime(task.dateTime)}</Text>
          </View>
          <View style={[styles.dateTimeRow, { marginTop: 3 }]}>
            <CustomIcon name="clock" size={11} color={Colors.textMuted} />
            <Text style={styles.dateLabel}>Deadline:</Text>
            <Text style={[styles.dateValue, deadlineStatus.isOverdue && !task.isCompleted && { color: Colors.danger }]}>
              {formatDateTime(task.deadline)}
            </Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          {/* Edit Button */}
          <TouchableOpacity
            style={styles.actionIconBtn}
            onPress={() => onEdit(task)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <CustomIcon name="edit" size={14} color={Colors.textSecondary} />
          </TouchableOpacity>

          {/* Delete Button */}
          <TouchableOpacity
            style={[styles.actionIconBtn, styles.deleteBtn]}
            onPress={handleDeletePress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <CustomIcon name="trash" size={14} color={Colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    shadowColor: 'rgba(197, 145, 88, 0.12)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  cardCompleted: {
    opacity: 0.72,
    backgroundColor: '#F7F1E6',
    borderColor: Colors.border,
  },
  cardOverdue: {
    borderColor: 'rgba(200, 90, 72, 0.45)',
    backgroundColor: 'rgba(200, 90, 72, 0.05)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priorityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
  },
  deadlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.bgInput,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  deadlineBadgeOverdue: {
    backgroundColor: Colors.dangerGlow,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  deadlineBadgeSoon: {
    backgroundColor: Colors.warningGlow,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  deadlineBadgeCompleted: {
    backgroundColor: Colors.successGlow,
  },
  deadlineText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginRight: 12,
    backgroundColor: '#F5ECE0',
  },
  checkboxCompleted: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  descriptionCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(35, 46, 72, 0.4)',
  },
  dateTimeColumn: {
    flex: 1,
    marginRight: 12,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  dateValue: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIconBtn: {
    padding: 4,
  },
  deleteBtn: {
    marginLeft: 2,
  },
});
