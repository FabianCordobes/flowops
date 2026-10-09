
import { useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  colors,
  radius,
  shadows,
  spacing,
  typography,
} from '../../theme';

import type { WorkOrder } from '../../types/work-order';

import { PriorityBadge } from '../ui/PriorityBadge';
import { StatusBadge } from '../ui/StatusBadge';

interface WorkOrderCardProps {
  workOrder: WorkOrder;
  onPress: () => void;
}

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const parseDueDate = (value: string): Date => {
  if (DATE_ONLY_PATTERN.test(value)) {
    return new Date(`${value}T23:59:59.999Z`);
  }

  return new Date(value);
};

const formatDueDate = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Invalid date';
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
};

const isWorkOrderOverdue = (workOrder: WorkOrder): boolean => {
  if (!workOrder.dueDate || workOrder.status === 'COMPLETED') {
    return false;
  }

  const dueDate = parseDueDate(workOrder.dueDate);

  if (Number.isNaN(dueDate.getTime())) {
    return false;
  }

  return dueDate.getTime() < Date.now();
};

export const WorkOrderCard = ({
  workOrder,
  onPress,
}: WorkOrderCardProps) => {
  const isOverdue = useMemo(
    () => isWorkOrderOverdue(workOrder),
    [workOrder],
  );

  const formattedDueDate = workOrder.dueDate
    ? formatDueDate(workOrder.dueDate)
    : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open work order: ${workOrder.title}`}
      accessibilityHint="Opens work order details"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isOverdue && styles.overdueCard,
        pressed && styles.pressed,
      ]}
    >
      {/* Priority and navigation indicator */}
      <View style={styles.topRow}>
        <PriorityBadge
          priority={workOrder.priority}
          size="sm"
        />

        <View
          style={styles.arrowContainer}
          accessible={false}
          importantForAccessibility="no-hide-descendants"
        >
          <Text style={styles.arrow}>
            ↗
          </Text>
        </View>
      </View>

      {/* Work order information */}
      <View style={styles.content}>
        <Text
          style={styles.title}
          numberOfLines={2}
        >
          {workOrder.title}
        </Text>

        {workOrder.description ? (
          <Text
            style={styles.description}
            numberOfLines={2}
          >
            {workOrder.description}
          </Text>
        ) : null}
      </View>

      <View style={styles.divider} />

      {/* Status and due date */}
      <View style={styles.footer}>
        <StatusBadge
          status={workOrder.status}
          size="sm"
        />

        {formattedDueDate ? (
          <View
            style={[
              styles.dueDateContainer,
              isOverdue && styles.overdueDateContainer,
            ]}
          >
            {isOverdue ? (
              <View style={styles.overdueDot} />
            ) : null}

            <Text
              style={[
                styles.dueDate,
                isOverdue && styles.overdueText,
              ]}
            >
              {isOverdue
                ? `Overdue · ${formattedDueDate}`
                : `Due ${formattedDueDate}`}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    boxShadow: shadows.sm,
    gap: spacing.md,
  },

  overdueCard: {
    borderColor: colors.dangerSoft,
  },

  pressed: {
    opacity: 0.82,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },

  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  arrow: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.lg,
  },

  content: {
    gap: spacing.xs,
  },

  title: {
    color: colors.text,
    fontSize: typography.fontSize.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.fontWeight.bold,
    flexShrink: 1,
  },

  description: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    flexShrink: 1,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    columnGap: spacing.md,
    rowGap: spacing.sm,
  },

  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexShrink: 1,
  },

  overdueDateContainer: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },

  overdueDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.danger,
  },

  dueDate: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    flexShrink: 1,
  },

  overdueText: {
    color: colors.danger,
    fontWeight: typography.fontWeight.semibold,
  },
});
