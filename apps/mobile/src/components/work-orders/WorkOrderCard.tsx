
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

  const dueDate = new Date(workOrder.dueDate);

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
      <View style={styles.topRow}>
        <PriorityBadge
          priority={workOrder.priority}
          size="sm"
        />

        <Text style={styles.arrow} accessible={false}>
          ↗
        </Text>
      </View>

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

      <View style={styles.footer}>
        <StatusBadge
          status={workOrder.status}
          size="sm"
        />

        {workOrder.dueDate ? (
          <View style={styles.dueDateContainer}>
            <Text
              style={[
                styles.dueDate,
                isOverdue && styles.overdueText,
              ]}
              numberOfLines={1}
            >
              {isOverdue
                ? 'Overdue'
                : `Due ${formatDueDate(workOrder.dueDate)}`}
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
    padding: spacing.xl,
    boxShadow: shadows.sm,
    gap: spacing.lg,
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
  arrow: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.medium,
  },
  content: {
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: typography.fontSize.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.fontWeight.bold,
  },
  description: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
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
    gap: spacing.sm,
  },
  dueDateContainer: {
    flexShrink: 1,
  },
  dueDate: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  overdueText: {
    color: colors.danger,
    fontWeight: typography.fontWeight.semibold,
  },
});
