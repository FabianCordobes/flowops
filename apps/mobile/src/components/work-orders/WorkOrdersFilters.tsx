
import { Ionicons } from '@expo/vector-icons';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  WORK_ORDER_PRIORITY_OPTIONS,
  WORK_ORDER_STATUS_OPTIONS,
} from '../../constants/work-order-filters';

import { colors, radius, spacing, typography } from '../../theme';

import type { WorkOrdersFiltersProps } from '../../types/work-order-filters';

export const WorkOrdersFilters = ({
  status,
  priority,
  sort,
  search,
  hasActiveFilters,
  onStatusChange,
  onPriorityChange,
  onSortChange,
  onSearchChange,
  onClear,
}: WorkOrdersFiltersProps) => {
  const selectedPriority =
    WORK_ORDER_PRIORITY_OPTIONS.find(
      (option) => option.value === priority,
    )?.label ?? 'All priorities';

  const cyclePriority = () => {
    const index = WORK_ORDER_PRIORITY_OPTIONS.findIndex(
      (option) => option.value === priority,
    );

    const next =
      WORK_ORDER_PRIORITY_OPTIONS[
        (index + 1) % WORK_ORDER_PRIORITY_OPTIONS.length
      ];

    onPriorityChange(next.value);
  };

  const toggleSort = () => {
    onSortChange(sort === 'newest' ? 'oldest' : 'newest');
  };

  return (
    <View style={styles.filtersSection}>
      <View style={styles.filtersHeading}>
        <Text style={styles.filtersTitle}>Filters</Text>

        {hasActiveFilters ? (
          <Pressable onPress={onClear}>
            <Text style={styles.clearText}>Clear all</Text>
          </Pressable>
        ) : null}
      </View>

      {/* SEARCH */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color={colors.textMuted}
        />

        <TextInput
          value={search}
          onChangeText={onSearchChange}
          maxLength={100}
          placeholder="Search work orders..."
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />

        {search.length > 0 ? (
          <Pressable
            onPress={() => onSearchChange('')}
            accessibilityLabel="Clear search"
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        ) : null}
      </View>

      {/* STATUS */}
      <Text style={styles.filterLabel}>STATUS</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statusRow}
      >
        {WORK_ORDER_STATUS_OPTIONS.map((option) => {
          const selected = status === option.value;

          return (
            <Pressable
              key={option.label}
              onPress={() => onStatusChange(option.value)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={[
                styles.statusChip,
                selected && styles.statusChipSelected,
              ]}
            >
              <Text
                style={[
                  styles.statusChipText,
                  selected && styles.statusChipTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* PRIORITY AND SORT */}
      <View style={styles.selectorRow}>
        <Pressable
          style={styles.selector}
          onPress={cyclePriority}
          accessibilityRole="button"
          accessibilityLabel={`Priority: ${selectedPriority}. Tap to change`}
        >
          <Text style={styles.selectorLabel}>PRIORITY</Text>

          <View style={styles.selectorValueRow}>
            <Text style={styles.selectorValue} numberOfLines={1}>
              {selectedPriority}
            </Text>

            <Ionicons
              name="chevron-down"
              size={16}
              color={colors.textSecondary}
            />
          </View>
        </Pressable>

        <Pressable
          style={styles.selector}
          onPress={toggleSort}
          accessibilityRole="button"
          accessibilityLabel={`Sort: ${
            sort === 'newest' ? 'Newest first' : 'Oldest first'
          }. Tap to change`}
        >
          <Text style={styles.selectorLabel}>SORT BY</Text>

          <View style={styles.selectorValueRow}>
            <Text style={styles.selectorValue} numberOfLines={1}>
              {sort === 'newest' ? 'Newest first' : 'Oldest first'}
            </Text>

            <Ionicons
              name="swap-vertical-outline"
              size={16}
              color={colors.textSecondary}
            />
          </View>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  filtersSection: {
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },

  filtersHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  filtersTitle: {
    color: colors.text,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },

  clearText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    minHeight: 50,
  },

  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: typography.fontSize.md,
    paddingVertical: spacing.md,
  },

  filterLabel: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.wide,
  },

  statusRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },

  statusChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },

  statusChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  statusChipText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },

  statusChipTextSelected: {
    color: colors.textInverse,
    fontWeight: typography.fontWeight.semibold,
  },

  selectorRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },

  selector: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm,
  },

  selectorLabel: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },

  selectorValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },

  selectorValue: {
    flex: 1,
    color: colors.text,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
});
