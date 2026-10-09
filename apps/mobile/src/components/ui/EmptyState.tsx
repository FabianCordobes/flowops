
import {
    StyleSheet,
    Text,
    View,
    type StyleProp,
    type ViewStyle,
  } from 'react-native';

  import {
    colors,
    radius,
    spacing,
    typography,
  } from '../../theme';

  import { AppButton } from './AppButton';

  type EmptyStateVariant = 'empty' | 'error' | 'search';

  interface EmptyStateProps {
    variant?: EmptyStateVariant;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    style?: StyleProp<ViewStyle>;
  }

  const variantConfig = {
    empty: {
      symbol: '+',
      color: colors.primary,
      background: colors.primarySoft,
    },
    error: {
      symbol: '!',
      color: colors.danger,
      background: colors.dangerSoft,
    },
    search: {
      symbol: '?',
      color: colors.info,
      background: colors.infoSoft,
    },
  } as const;

  export const EmptyState = ({
    variant = 'empty',
    title,
    description,
    actionLabel,
    onAction,
    style,
  }: EmptyStateProps) => {
    const config = variantConfig[variant];

    return (
      <View style={[styles.container, style]}>
        {/* Decorative icon */}
        <View
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          style={[
            styles.iconContainer,
            { backgroundColor: config.background },
          ]}
        >
          <Text
            style={[
              styles.icon,
              { color: config.color },
            ]}
          >
            {config.symbol}
          </Text>
        </View>

        {/* State information */}
        <View style={styles.textContainer}>
          <Text
            accessibilityRole="header"
            style={styles.title}
          >
            {title}
          </Text>

          <Text style={styles.description}>
            {description}
          </Text>
        </View>

        {/* Optional action */}
        {actionLabel && onAction ? (
          <View style={styles.actionContainer}>
            <AppButton
              label={actionLabel}
              onPress={onAction}
              variant={variant === 'error' ? 'outline' : 'primary'}
              fullWidth={false}
            />
          </View>
        ) : null}
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      minHeight: 240,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.xxxl,
      borderRadius: radius.xl,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },

    iconContainer: {
      width: 60,
      height: 60,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.full,
      marginBottom: spacing.lg,
    },

    icon: {
      fontSize: typography.fontSize.heading,
      lineHeight: typography.lineHeight.heading,
      fontWeight: typography.fontWeight.semibold,
      textAlign: 'center',
    },

    textContainer: {
      width: '100%',
      alignItems: 'center',
      gap: spacing.sm,
    },

    title: {
      color: colors.text,
      fontSize: typography.fontSize.xl,
      lineHeight: typography.lineHeight.xl,
      fontWeight: typography.fontWeight.bold,
      textAlign: 'center',
    },

    description: {
      color: colors.textSecondary,
      fontSize: typography.fontSize.sm,
      lineHeight: typography.lineHeight.sm,
      textAlign: 'center',
    },

    actionContainer: {
      width: '100%',
      marginTop: spacing.xl,
      alignItems: 'center',
    },
  });
