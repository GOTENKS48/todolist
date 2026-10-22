import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';
import { CustomIcon } from './CustomIcon';

interface Props {
  hasFilters: boolean;
  onClearFilters?: () => void;
  onAddTask?: () => void;
}

export const EmptyState: React.FC<Props> = ({
  hasFilters,
  onClearFilters,
  onAddTask,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <CustomIcon
          name={hasFilters ? 'search' : 'sparkles'}
          size={32}
          color={Colors.primaryLight}
        />
      </View>

      <Text style={styles.title}>
        {hasFilters ? 'No Matching Tasks Found' : 'All Clear for Now!'}
      </Text>

      <Text style={styles.subtitle}>
        {hasFilters
          ? 'Try adjusting your search query, priority, or category filter.'
          : 'You currently have no tasks in your queue. Create one to get started!'}
      </Text>

      {hasFilters && onClearFilters ? (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onClearFilters}
          activeOpacity={0.8}
        >
          <Text style={styles.actionBtnText}>Reset All Filters</Text>
        </TouchableOpacity>
      ) : onAddTask ? (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onAddTask}
          activeOpacity={0.8}
        >
          <Text style={styles.actionBtnText}>+ Create Your First Task</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 50,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    maxWidth: 280,
  },
  actionBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  actionBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
});
