
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppButton } from '../components/ui/AppButton';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { colors, radius, spacing, typography } from '../theme';

import type { RootStackParamList } from '../navigation/types';
import { createWorkOrder } from '../services/work-orders.service';
import type { WorkOrderPriority } from '../types/work-order';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'CreateWorkOrder'
>;

type FormErrors = {
  title?: string;
  dueDate?: string;
  general?: string;
};

const priorities: WorkOrderPriority[] = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT',
];

const MAX_TITLE_LENGTH = 200;

const priorityDescriptions: Record<WorkOrderPriority, string> = {
  LOW: 'Can be scheduled with flexibility.',
  MEDIUM: 'Standard operational priority.',
  HIGH: 'Requires attention soon.',
  URGENT: 'Requires immediate attention.',
};

const parseDueDate = (value: string): string | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date.toISOString();
};

export const CreateWorkOrderScreen = ({
  navigation,
}: Props) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] =
    useState<WorkOrderPriority>('MEDIUM');
  const [dueDate, setDueDate] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const normalizedTitle = title.trim();
  const titleLength = title.length;

  const clearError = (field: keyof FormErrors) => {
    setErrors((current) => ({
      ...current,
      [field]: undefined,
      general: undefined,
    }));
  };

  const handleCreate = async () => {
    if (isSubmitting) {
      return;
    }

    const nextErrors: FormErrors = {};
    let normalizedDueDate: string | undefined;

    if (!normalizedTitle) {
      nextErrors.title = 'Title is required.';
    }

    if (dueDate.trim()) {
      const parsedDate = parseDueDate(dueDate.trim());

      if (!parsedDate) {
        nextErrors.dueDate =
          'Enter a valid date using YYYY-MM-DD.';
      } else {
        normalizedDueDate = parsedDate;
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const workOrder = await createWorkOrder({
        title: normalizedTitle,
        description: description.trim() || undefined,
        priority,
        dueDate: normalizedDueDate,
      });

      navigation.replace('WorkOrderDetail', {
        workOrderId: workOrder.id,
      });
    } catch (error) {
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : 'Unable to create work order.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      {/* NAVIGATION */}
      <View style={styles.navigationRow}>
        <AppButton
          label="← Work orders"
          variant="outline"
          size="sm"
          fullWidth={false}
          disabled={isSubmitting}
          onPress={() => navigation.goBack()}
        />
      </View>

      {/* HEADER */}
      <View style={styles.header}>
        <ScreenHeader
          eyebrow="WORK ORDER MANAGEMENT"
          title="New work order"
          subtitle="Create and prioritize work for your operations team."
        />
      </View>

      {/* FORM */}
      <View style={styles.formCard}>
        <View style={styles.formHeading}>
          <Text style={styles.formTitle}>
            Work order details
          </Text>

          <Text style={styles.formDescription}>
            Add the information your team needs to get started.
          </Text>
        </View>

        {/* TITLE */}
        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>
              Title <Text style={styles.required}>*</Text>
            </Text>

            <Text style={styles.counter}>
              {titleLength}/{MAX_TITLE_LENGTH}
            </Text>
          </View>

          <TextInput
            style={[
              styles.input,
              errors.title ? styles.inputError : null,
            ]}
            value={title}
            onChangeText={(value) => {
              setTitle(value);
              clearError('title');
            }}
            placeholder="e.g. Customer onboarding"
            placeholderTextColor={colors.textMuted}
            editable={!isSubmitting}
            maxLength={MAX_TITLE_LENGTH}
            autoCapitalize="sentences"
            returnKeyType="next"
            accessibilityLabel="Work order title"
          />

          {errors.title ? (
            <Text style={styles.fieldError}>
              {errors.title}
            </Text>
          ) : (
            <Text style={styles.fieldHint}>
              Use a short, descriptive title.
            </Text>
          )}
        </View>

        {/* DESCRIPTION */}
        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>
              Description
            </Text>

            <Text style={styles.optional}>
              Optional
            </Text>
          </View>

          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the work to be completed..."
            placeholderTextColor={colors.textMuted}
            multiline
            textAlignVertical="top"
            editable={!isSubmitting}
            accessibilityLabel="Work order description"
          />

          <Text style={styles.fieldHint}>
            Include context, requirements, or expected results.
          </Text>
        </View>

        {/* PRIORITY */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Priority
          </Text>

          <Text style={styles.fieldHint}>
            Choose how quickly this work should be addressed.
          </Text>

          <View style={styles.priorityOptions}>
            {priorities.map((option) => {
              const isSelected = option === priority;

              return (
                <Pressable
                  key={option}
                  accessibilityRole="radio"
                  accessibilityLabel={`${option.toLowerCase()} priority`}
                  accessibilityState={{
                    checked: isSelected,
                    disabled: isSubmitting,
                  }}
                  disabled={isSubmitting}
                  style={({ pressed }) => [
                    styles.priorityOption,
                    isSelected && styles.priorityOptionSelected,
                    pressed && styles.priorityOptionPressed,
                  ]}
                  onPress={() => setPriority(option)}
                >
                  <View style={styles.priorityOptionContent}>
                    <PriorityBadge
                      priority={option}
                      size="sm"
                    />

                    <View
                      style={[
                        styles.radioOuter,
                        isSelected && styles.radioOuterSelected,
                      ]}
                    >
                      {isSelected ? (
                        <View style={styles.radioInner} />
                      ) : null}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.priorityHelp}>
            <Text style={styles.priorityHelpLabel}>
              {priority.charAt(0) +
                priority.slice(1).toLowerCase()} priority
            </Text>

            <Text style={styles.priorityHelpText}>
              {priorityDescriptions[priority]}
            </Text>
          </View>
        </View>

        {/* DUE DATE */}
        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>
              Due date
            </Text>

            <Text style={styles.optional}>
              Optional
            </Text>
          </View>

          <TextInput
            style={[
              styles.input,
              errors.dueDate ? styles.inputError : null,
            ]}
            value={dueDate}
            onChangeText={(value) => {
              setDueDate(value);
              clearError('dueDate');
            }}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="numbers-and-punctuation"
            editable={!isSubmitting}
            maxLength={10}
            accessibilityLabel="Work order due date"
          />

          {errors.dueDate ? (
            <Text style={styles.fieldError}>
              {errors.dueDate}
            </Text>
          ) : (
            <Text style={styles.fieldHint}>
              Enter a date such as 2026-10-20.
            </Text>
          )}
        </View>
      </View>

      {/* FORM ACTIONS */}
      <View style={styles.formActions}>
        {errors.general ? (
          <View style={styles.errorBox} accessibilityRole="alert">
            <Text style={styles.errorText}>
              {errors.general}
            </Text>
          </View>
        ) : null}

        <AppButton
          label="Create work order"
          variant="primary"
          size="lg"
          loading={isSubmitting}
          disabled={isSubmitting}
          onPress={() => {
            void handleCreate();
          }}
        />

        <AppButton
          label="Cancel"
          variant="outline"
          size="md"
          disabled={isSubmitting}
          onPress={() => navigation.goBack()}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.section,
  },

  navigationRow: {
    alignItems: 'flex-start',
    marginBottom: spacing.xxxl,
  },

  header: {
    marginBottom: spacing.xxl,
  },

  formCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.xxl,
  },

  formHeading: {
    gap: spacing.sm,
  },

  formTitle: {
    color: colors.text,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },

  formDescription: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: 21,
  },

  field: {
    gap: spacing.sm,
  },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },

  label: {
    color: colors.text,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },

  required: {
    color: '#DC2626',
  },

  optional: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
  },

  counter: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
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

  textArea: {
    minHeight: 132,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    lineHeight: 22,
  },

  fieldHint: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    lineHeight: 18,
  },

  fieldError: {
    color: '#B91C1C',
    fontSize: typography.fontSize.xs,
    lineHeight: 18,
  },

  priorityOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },

  priorityOption: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },

  priorityOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },

  priorityOptionPressed: {
    opacity: 0.75,
  },

  priorityOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  radioOuter: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioOuterSelected: {
    borderColor: colors.primary,
  },

  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },

  priorityHelp: {
    marginTop: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    padding: spacing.md,
    gap: spacing.xs,
  },

  priorityHelpLabel: {
    color: colors.text,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },

  priorityHelpText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },

  formActions: {
    marginTop: spacing.xxl,
    gap: spacing.md,
  },

  errorBox: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    padding: spacing.lg,
  },

  errorText: {
    color: '#991B1B',
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
});
