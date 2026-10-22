import React, { useEffect, useRef } from 'react';
import {
  Animated,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Colors } from '../theme/colors';
import { DeadlineNotification } from '../types';
import { CustomIcon } from './CustomIcon';

interface Props {
  notification: DeadlineNotification | null;
  onDismiss: () => void;
  onPressTask?: (taskId: string) => void;
}

export const NotificationBanner: React.FC<Props> = ({
  notification,
  onDismiss,
  onPressTask,
}) => {
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (notification) {
      // Slide down entrance
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: Platform.OS === 'ios' ? 44 : 20,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after 7 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 7000);

      return () => clearTimeout(timer);
    } else {
      handleDismiss();
    }
  }, [notification]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -120,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!notification) return null;

  const getUrgencyConfig = () => {
    switch (notification.urgency) {
      case 'OVERDUE':
        return {
          icon: 'flame' as const,
          color: Colors.danger,
          bg: 'rgba(239, 68, 68, 0.12)',
          borderColor: 'rgba(239, 68, 68, 0.45)',
          label: 'OVERDUE DEADLINE',
        };
      case 'CRITICAL':
        return {
          icon: 'alert' as const,
          color: Colors.warning,
          bg: 'rgba(245, 158, 11, 0.12)',
          borderColor: 'rgba(245, 158, 11, 0.45)',
          label: 'DUE SOON',
        };
      case 'UPCOMING':
      default:
        return {
          icon: 'clock' as const,
          color: Colors.primaryLight,
          bg: 'rgba(99, 102, 241, 0.12)',
          borderColor: 'rgba(99, 102, 241, 0.4)',
          label: 'UPCOMING DEADLINE',
        };
    }
  };

  const config = getUrgencyConfig();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.card,
          {
            borderColor: config.borderColor,
            backgroundColor: Colors.bgSecondary,
          },
        ]}
        activeOpacity={0.9}
        onPress={() => {
          if (onPressTask && notification.taskId) {
            onPressTask(notification.taskId);
          }
          handleDismiss();
        }}
      >
        {/* Urgency indicator strip */}
        <View style={[styles.indicatorStrip, { backgroundColor: config.color }]} />

        <View style={styles.contentWrap}>
          {/* Header Row */}
          <View style={styles.topRow}>
            <View style={[styles.badge, { backgroundColor: config.bg, borderColor: config.borderColor }]}>
              <CustomIcon name={config.icon} size={11} color={config.color} />
              <Text style={[styles.badgeText, { color: config.color }]}>
                {config.label}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleDismiss}
              style={styles.closeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <CustomIcon name="x" size={14} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Title & Message */}
          <Text style={styles.taskTitle} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={styles.taskMessage} numberOfLines={2}>
            {notification.message}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 18,
    borderWidth: 1.5,
    overflow: 'hidden',
    backgroundColor: Colors.bgSecondary,
  },
  indicatorStrip: {
    width: 5,
  },
  contentWrap: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  closeBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  taskMessage: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
});
