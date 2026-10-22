import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
} from 'react-native';
import { Colors, CategoryColors } from '../theme/colors';
import { TaskCategory } from '../types';

interface Props {
  selectedCategory: TaskCategory | 'ALL';
  onSelectCategory: (category: TaskCategory | 'ALL') => void;
  categoryCounts?: Record<string, number>;
}

const CATEGORIES: (TaskCategory | 'ALL')[] = [
  'ALL',
  'WORK',
  'PERSONAL',
  'STUDY',
  'URGENT',
  'HEALTH',
  'FINANCE',
  'OTHER',
];

export const CategoryFilters: React.FC<Props> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts = {},
}) => {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          const count = cat === 'ALL' ? undefined : categoryCounts[cat];
          const colorConfig = cat === 'ALL' ? null : CategoryColors[cat];

          return (
            <TouchableOpacity
              key={cat}
              style={[
                styles.pill,
                isSelected && styles.pillSelected,
                isSelected && colorConfig && { borderColor: colorConfig.dot },
              ]}
              onPress={() => onSelectCategory(cat)}
              activeOpacity={0.7}
            >
              {colorConfig && (
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: colorConfig.dot },
                  ]}
                />
              )}
              <Text
                style={[
                  styles.pillText,
                  isSelected && styles.pillTextSelected,
                  isSelected && colorConfig && { color: colorConfig.text },
                ]}
              >
                {cat === 'ALL' ? 'All Tasks' : cat.charAt(0) + cat.slice(1).toLowerCase()}
              </Text>
              {count !== undefined && count > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillSelected: {
    backgroundColor: Colors.bgCardHover,
    borderColor: Colors.primary,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  pillText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  pillTextSelected: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  countBadge: {
    marginLeft: 6,
    backgroundColor: Colors.bgInput,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  countText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '700',
  },
});
