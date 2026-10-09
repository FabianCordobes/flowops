
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

import { AppButton } from '../components/ui/AppButton';
import { colors, radius, spacing, typography } from '../theme';
import { useAuth } from '../providers/AuthProvider';

type LoginErrors = {
  email?: string;
  password?: string;
  general?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LoginScreen = () => {
  const { signIn, isLoading } = useAuth();
  const { width } = useWindowDimensions();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});

  const isBusy = isLoading || isSubmitting;
  const isWideScreen = width >= 768;

  const clearError = (field: keyof LoginErrors) => {
    setErrors((current) => ({
      ...current,
      [field]: undefined,
      general: undefined,
    }));
  };

  const handleSignIn = async () => {
    if (isBusy) {
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const nextErrors: LoginErrors = {};

    if (!normalizedEmail) {
      nextErrors.email = 'Email is required.';
    } else if (!EMAIL_PATTERN.test(normalizedEmail)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!password) {
      nextErrors.password = 'Password is required.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await signIn(normalizedEmail, password);
    } catch (error) {
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : 'Unable to sign in. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View
          style={[
            styles.layout,
            isWideScreen && styles.layoutWide,
          ]}
        >
          {/* BRAND */}
          <View style={styles.brand}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>F</Text>
            </View>

            <View>
              <Text style={styles.brandName}>FLOWOPS</Text>
              <Text style={styles.brandCaption}>
                OPERATIONS PLATFORM
              </Text>
            </View>
          </View>

          {/* LOGIN CARD */}
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.eyebrow}>
                ACCOUNT ACCESS
              </Text>

              <Text style={styles.title}>
                Welcome back
              </Text>

              <Text style={styles.subtitle}>
                Sign in to manage your work orders and
                stay connected with your team.
              </Text>
            </View>

            <View style={styles.form}>
              {/* EMAIL */}
              <View style={styles.field}>
                <Text style={styles.label}>
                  Email address
                </Text>

                <TextInput
                  style={[
                    styles.input,
                    errors.email ? styles.inputError : null,
                  ]}
                  value={email}
                  onChangeText={(value) => {
                    setEmail(value);
                    clearError('email');
                  }}
                  placeholder="you@company.com"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  returnKeyType="next"
                  editable={!isBusy}
                  accessibilityLabel="Email address"
                />

                {errors.email ? (
                  <Text style={styles.fieldError}>
                    {errors.email}
                  </Text>
                ) : null}
              </View>

              {/* PASSWORD */}
              <View style={styles.field}>
                <Text style={styles.label}>
                  Password
                </Text>

                <View
                  style={[
                    styles.passwordContainer,
                    errors.password
                      ? styles.inputError
                      : null,
                  ]}
                >
                  <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={(value) => {
                      setPassword(value);
                      clearError('password');
                    }}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="password"
                    textContentType="password"
                    returnKeyType="go"
                    editable={!isBusy}
                    accessibilityLabel="Password"
                    onSubmitEditing={() => {
                      void handleSignIn();
                    }}
                  />

                  <Pressable
                    style={styles.passwordToggle}
                    onPress={() =>
                      setShowPassword((current) => !current)
                    }
                    disabled={isBusy}
                    accessibilityRole="button"
                    accessibilityLabel={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >
                    <Text style={styles.passwordToggleText}>
                      {showPassword ? 'Hide' : 'Show'}
                    </Text>
                  </Pressable>
                </View>

                {errors.password ? (
                  <Text style={styles.fieldError}>
                    {errors.password}
                  </Text>
                ) : null}
              </View>

              {/* AUTH ERROR */}
              {errors.general ? (
                <View
                  style={styles.errorBox}
                  accessibilityRole="alert"
                >
                  <Text style={styles.errorText}>
                    {errors.general}
                  </Text>
                </View>
              ) : null}

              {/* SUBMIT */}
              <AppButton
                label="Sign in"
                variant="primary"
                size="lg"
                loading={isBusy}
                disabled={isBusy}
                onPress={() => {
                  void handleSignIn();
                }}
              />
            </View>
          </View>

          {/* FOOTER */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              FlowOps · Work order management
            </Text>

            <Text style={styles.footerCaption}>
              Secure access for your operations team
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.screen,
    paddingVertical: spacing.section,
  },

  layout: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },

  layoutWide: {
    maxWidth: 520,
  },

  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xxxl,
  },

  brandMark: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
  },

  brandMarkText: {
    color: colors.surface,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },

  brandName: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 2,
  },

  brandCaption: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    letterSpacing: 1,
  },

  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    padding: spacing.xl,
  },

  header: {
    marginBottom: spacing.xxxl,
  },

  eyebrow: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1.5,
    marginBottom: spacing.md,
  },

  title: {
    color: colors.text,
    fontSize: typography.fontSize.heading,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: -1,
  },

  subtitle: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    lineHeight: 24,
  },

  form: {
    gap: spacing.xl,
  },

  field: {
    gap: spacing.sm,
  },

  label: {
    color: colors.text,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },

  input: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.md,
  },

  inputError: {
    borderColor: '#DC2626',
  },

  passwordContainer: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  passwordInput: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text,
  },

  passwordToggle: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  passwordToggleText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },

  fieldError: {
    color: '#B91C1C',
    fontSize: typography.fontSize.xs,
    lineHeight: 18,
  },

  errorBox: {
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: radius.lg,
    backgroundColor: '#FEF2F2',
    padding: spacing.md,
  },

  errorText: {
    color: '#991B1B',
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },

  footer: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xxxl,
  },

  footerText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },

  footerCaption: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
  },
});
