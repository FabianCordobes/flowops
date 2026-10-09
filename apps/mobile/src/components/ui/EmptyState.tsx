
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
      symbol: '＋',
      color: colors.primary,
      background: colors.primarySoft,
    },
    error: {
      symbol: '!',
      color: colors.danger,
      background: colors.dangerSoft,
    },
    search: {
      symbol: '⌕',
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
    const showAction = Boolean(actionLabel && onAction);
  
    return (
      <View
        style={[styles.container, style]}
        accessibilityRole="summary"
      >
        <View
          accessible={false}
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
  
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {title}
          </Text>
  
          <Text style={styles.description}>
            {description}
          </Text>
        </View>
  
        {showAction ? (
          <View style={styles.actionContainer}>
            <AppButton
              label={actionLabel!}
              onPress={onAction!}
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
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xxl,
      paddingVertical: spacing.section,
      borderRadius: radius.xl,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    iconContainer: {
      width: 64,
      height: 64,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.xl,
      marginBottom: spacing.xl,
    },
    icon: {
      fontSize: 30,
      fontWeight: typography.fontWeight.semibold,
    },
    textContainer: {
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
      marginTop: spacing.xxl,
      alignItems: 'center',
    },
  });
  