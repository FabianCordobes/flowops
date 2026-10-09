
import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing, statusColors, typography } from '../../theme';
import type { WorkOrder } from '../../types/work-order';

type WorkOrderStatus = WorkOrder['status'];

interface StatusBadgeProps {
  status: WorkOrderStatus;
  size?: 'sm' | 'md';
}

const statusLabels: Record<WorkOrderStatus, string> = {
  NEW: 'New',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In progress',
  IN_REVIEW: 'In review',
  COMPLETED: 'Completed',
};

export const StatusBadge = ({
  status,
  size = 'md',
}: StatusBadgeProps) => {
  const palette = statusColors[status];
  const isSmall = size === 'sm';

  return (
    <View
      accessible
      accessibilityLabel={`Status: ${statusLabels[status]}`}
      style={[
        styles.container,
        {
          backgroundColor: palette.background,
          paddingHorizontal: isSmall ? spacing.sm : spacing.md,
          paddingVertical: isSmall ? spacing.xs : spacing.sm,
        },
      ]}
    >
      <View
        style={[
          styles.dot,
          { backgroundColor: palette.dot },
        ]}
      />

      <Text
        style={[
          styles.label,
          {
            color: palette.text,
            fontSize: isSmall
              ? typography.fontSize.xs
              : typography.fontSize.sm,
          },
        ]}
      >
        {statusLabels[status]}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.sm,
    borderRadius: radius.full,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: radius.full,
  },
  label: {
    fontWeight: typography.fontWeight.semibold,
  },
});
