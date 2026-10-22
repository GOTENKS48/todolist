import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { Colors } from '../theme/colors';
import { User, TaskStats } from '../types';
import { CustomIcon } from './CustomIcon';

interface HeaderProps {
  user: User | null;
  stats: TaskStats;
  notificationCount?: number;
  onLogout: () => void;
  onPressProfile?: () => void;
  onOpenNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  stats,
  notificationCount = 0,
  onLogout,
  onPressProfile,
  onOpenNotifications,
}) => {
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleLogoutPress = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to log out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: onLogout },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {/* Interactive User Identity / Profile trigger */}
        <TouchableOpacity
          style={styles.userInfo}
          activeOpacity={0.7}
          onPress={onPressProfile}
        >
          <View style={styles.avatarWrap}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
              </View>
            )}
            <View style={styles.editIndicator}>
              <CustomIcon name="edit" size={8} color={Colors.white} />
            </View>
            <View style={styles.onlineDot} />
          </View>

          <View style={styles.welcomeContainer}>
            <Text style={styles.greeting} numberOfLines={1}>
              {user?.bio ? user.bio : 'Welcome back,'}
            </Text>
            <View style={styles.nameRow}>
              <Text style={styles.userName} numberOfLines={1}>
                {user?.name || 'Task Master'}
              </Text>
              <CustomIcon name="chevron-right" size={11} color={Colors.textMuted} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Right Actions: Notifications, Stats, Logout */}
        <View style={styles.actions}>
          {/* Notification Bell */}
          <TouchableOpacity
            style={styles.actionIconBtn}
            onPress={onOpenNotifications}
            activeOpacity={0.7}
            accessibilityLabel="Notifications"
          >
            <CustomIcon name="bell" size={16} color={notificationCount > 0 ? Colors.warning : Colors.textSecondary} />
            {notificationCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {stats.total > 0 && (
            <View style={styles.completionBadge}>
              <CustomIcon name="sparkles" size={13} color={Colors.success} />
              <Text style={styles.completionText}>{stats.completionRate}%</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.actionIconBtn}
            onPress={handleLogoutPress}
            activeOpacity={0.7}
            accessibilityLabel="Log out"
          >
            <CustomIcon name="logout" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  avatarWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    position: 'relative',
  },
  avatarImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  avatarFallback: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  avatarText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  editIndicator: {
    position: 'absolute',
    top: -2,
    left: -2,
    backgroundColor: Colors.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.bgPrimary,
  },
  onlineDot: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: Colors.success,
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: Colors.bgPrimary,
  },
  welcomeContainer: {
    marginLeft: 10,
    flex: 1,
  },
  greeting: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  userName: {
    fontSize: 17,
    color: Colors.textPrimary,
    fontWeight: '700',
    letterSpacing: 0.2,
    maxWidth: 140,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.danger,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.bgPrimary,
  },
  notifBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.white,
  },
  completionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.successGlow,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  completionText: {
    color: Colors.success,
    fontSize: 12,
    fontWeight: '800',
  },
});
