
import { StyleSheet, Text, View } from 'react-native';

import {
  priorityColors,
  radius,
  spacing,
  typography,
} from '../../theme';

import type { WorkOrderPriority } from '../../types/work-order';

interface PriorityBadgeProps {
  priority: WorkOrderPriority;
  size?: 'sm' | 'md';
}

const priorityLabels: Record<WorkOrderPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

export const PriorityBadge = ({
  priority,
  size = 'md',
}: PriorityBadgeProps) => {
  const palette = priorityColors[priority];
  const isSmall = size === 'sm';

  return (
    <View
      accessible
      accessibilityLabel={`Priority: ${priorityLabels[priority]}`}
      style={[
        styles.container,
        {
          backgroundColor: palette.background,
          paddingHorizontal: isSmall
            ? spacing.sm
            : spacing.md,
          paddingVertical: isSmall
            ? spacing.xs
            : spacing.sm,
        },
      ]}
    >
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
        {priorityLabels[priority]}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  label: {
    fontWeight: typography.fontWeight.semibold,
  },
});
