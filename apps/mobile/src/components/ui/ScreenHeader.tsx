
import type { ReactNode } from 'react';

import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import {
  colors,
  spacing,
  typography,
} from '../../theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  rightAction?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const ScreenHeader = ({
  title,
  subtitle,
  eyebrow,
  rightAction,
  style,
}: ScreenHeaderProps) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        {eyebrow ? (
          <Text style={styles.eyebrow}>
            {eyebrow}
          </Text>
        ) : null}

        <Text
          accessibilityRole="header"
          style={styles.title}
        >
          {title}
        </Text>

        {subtitle ? (
          <Text style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {rightAction ? (
        <View style={styles.action}>
          {rightAction}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  eyebrow: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.wide,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: typography.fontSize.heading,
    lineHeight: typography.lineHeight.heading,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.tight,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
  },
  action: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingTop: spacing.sm,
  },
});
