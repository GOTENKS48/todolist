import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { Colors } from '../theme/colors';
import { DeadlineNotification } from '../types';
import { CustomIcon } from './CustomIcon';

interface Props {
  visible: boolean;
  notifications: DeadlineNotification[];
  onClose: () => void;
  onClearAll: () => void;
  onSelectTask?: (taskId: string) => void;
}

export const NotificationCenterModal: React.FC<Props> = ({
  visible,
  notifications,
  onClose,
  onClearAll,
  onSelectTask,
}) => {
  const getUrgencyBadge = (urgency: DeadlineNotification['urgency']) => {
    switch (urgency) {
      case 'OVERDUE':
        return {
          label: 'OVERDUE',
          color: Colors.danger,
          bg: 'rgba(239, 68, 68, 0.14)',
          icon: 'flame' as const,
        };
      case 'CRITICAL':
        return {
          label: 'DUE SOON',
          color: Colors.warning,
          bg: 'rgba(245, 158, 11, 0.14)',
          icon: 'alert' as const,
        };
      case 'UPCOMING':
      default:
        return {
          label: 'UPCOMING',
          color: Colors.primaryLight,
          bg: 'rgba(99, 102, 241, 0.14)',
          icon: 'clock' as const,
        };
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheetCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.bellBadge}>
                <CustomIcon name="bell" size={16} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.title}>Deadline Alerts</Text>
                <Text style={styles.subtitle}>
                  {notifications.length} active deadline notice{notifications.length === 1 ? '' : 's'}
                </Text>
              </View>
            </View>

            <View style={styles.headerRight}>
              {notifications.length > 0 && (
                <TouchableOpacity
                  onPress={onClearAll}
                  style={styles.clearBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.clearBtnText}>Clear</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <CustomIcon name="close" size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Notifications List */}
          <ScrollView
            style={styles.scrollList}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {notifications.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconBadge}>
                  <CustomIcon name="check" size={28} color={Colors.success} />
                </View>
                <Text style={styles.emptyTitle}>All Deadlines On Track!</Text>
                <Text style={styles.emptySub}>
                  No urgent or overdue tasks at this moment. You are staying ahead of schedule.
                </Text>
              </View>
            ) : (
              notifications.map((item) => {
                const badge = getUrgencyBadge(item.urgency);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.notificationCard}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (onSelectTask && item.taskId) {
                        onSelectTask(item.taskId);
                        onClose();
                      }
                    }}
                  >
                    <View style={styles.cardHeader}>
                      <View style={[styles.badgePill, { backgroundColor: badge.bg }]}>
                        <CustomIcon name={badge.icon} size={11} color={badge.color} />
                        <Text style={[styles.badgePillText, { color: badge.color }]}>
                          {badge.label}
                        </Text>
                      </View>
                      <Text style={styles.timeMeta}>
                        {new Date(item.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>

                    <Text style={styles.cardTaskTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.cardTaskMessage}>{item.message}</Text>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          {/* Footer close */}
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.doneBtnText}>Close Alerts</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetCard: {
    backgroundColor: Colors.bgSecondary,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 22,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scrollList: {
    maxHeight: 380,
  },
  scrollContent: {
    paddingVertical: 6,
    gap: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
  },
  emptyIconBadge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  notificationCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timeMeta: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  cardTaskTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  cardTaskMessage: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  doneBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 14,
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
});
