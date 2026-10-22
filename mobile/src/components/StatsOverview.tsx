import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { TaskStats } from '../types';

interface Props {
  stats: TaskStats;
}

export const StatsOverview: React.FC<Props> = ({ stats }) => {
  const percentage = Math.min(100, Math.max(0, stats.completionRate || 0));

  return (
    <View style={styles.container}>
      {/* Progress Track Header */}
      <View style={styles.progressHeader}>
        <Text style={styles.progressTitle}>Overall Progress</Text>
        <Text style={styles.progressPercent}>{percentage}% Completed</Text>
      </View>

      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
      </View>

      {/* 4 Metrics Grid */}
      <View style={styles.grid}>
        <View style={[styles.card, { borderLeftColor: Colors.primary }]}>
          <Text style={styles.cardValue}>{stats.total}</Text>
          <Text style={styles.cardLabel}>Total</Text>
        </View>

        <View style={[styles.card, { borderLeftColor: Colors.warning }]}>
          <Text style={[styles.cardValue, { color: Colors.warning }]}>{stats.pending}</Text>
          <Text style={styles.cardLabel}>Pending</Text>
        </View>

        <View style={[styles.card, { borderLeftColor: Colors.success }]}>
          <Text style={[styles.cardValue, { color: Colors.success }]}>{stats.completed}</Text>
          <Text style={styles.cardLabel}>Done</Text>
        </View>

        <View style={[styles.card, { borderLeftColor: Colors.danger }]}>
          <Text style={[styles.cardValue, { color: Colors.danger }]}>{stats.overdue}</Text>
          <Text style={styles.cardLabel}>Overdue</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 16,
    padding: 16,
    backgroundColor: Colors.bgCard,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 13,
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: Colors.bgInput,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  grid: {
    flexDirection: 'row',
    gap: 8,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.bgInput,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderLeftWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  cardLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
});
