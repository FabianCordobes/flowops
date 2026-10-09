
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, radius, spacing, typography } from '../../theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';

type ButtonSize = 'sm' | 'md' | 'lg';

interface AppButtonProps {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const variantStyles = {
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    textColor: colors.textInverse,
    indicatorColor: colors.textInverse,
  },
  secondary: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.surfaceSecondary,
    textColor: colors.text,
    indicatorColor: colors.text,
  },
  outline: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    textColor: colors.text,
    indicatorColor: colors.text,
  },
  danger: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
    textColor: colors.textInverse,
    indicatorColor: colors.textInverse,
  },
} as const;

const sizeStyles = {
  sm: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.sm,
  },
  md: {
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    fontSize: typography.fontSize.md,
  },
  lg: {
    minHeight: 54,
    paddingHorizontal: spacing.xl,
    fontSize: typography.fontSize.md,
  },
} as const;

export const AppButton = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = true,
  leftIcon,
  style,
  testID,
}: AppButtonProps) => {
  const isDisabled = disabled || loading;
  const variantConfig = variantStyles[variant];
  const sizeConfig = sizeStyles[size];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      testID={testID}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          minHeight: sizeConfig.minHeight,
          paddingHorizontal: sizeConfig.paddingHorizontal,
          backgroundColor: variantConfig.backgroundColor,
          borderColor: variantConfig.borderColor,
        },
        fullWidth ? styles.fullWidth : styles.autoWidth,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variantConfig.indicatorColor}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
        ) : leftIcon ? (
          <View
            style={styles.icon}
            accessible={false}
            importantForAccessibility="no-hide-descendants"
          >
            {leftIcon}
          </View>
        ) : null}

        <Text
          style={[
            styles.label,
            {
              color: variantConfig.textColor,
              fontSize: sizeConfig.fontSize,
            },
          ]}
          numberOfLines={2}
          accessible={false}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },

  fullWidth: {
    alignSelf: 'stretch',
  },

  autoWidth: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    maxWidth: '100%',
  },

  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  label: {
    flexShrink: 1,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
  },

  pressed: {
    opacity: 0.85,
  },

  disabled: {
    opacity: 0.5,
  },
});
