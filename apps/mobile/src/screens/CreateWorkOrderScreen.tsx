import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { RootStackParamList } from '../navigation/types';
import { createWorkOrder } from '../services/work-orders.service';
import type { WorkOrderPriority } from '../types/work-order';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'CreateWorkOrder'
>;

const priorities: WorkOrderPriority[] = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT',
];

export const CreateWorkOrderScreen = ({
  navigation,
}: Props) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] =
    useState<WorkOrderPriority>('MEDIUM');
  const [dueDate, setDueDate] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const handleCreate = async () => {
    const normalizedTitle = title.trim();

    if (!normalizedTitle) {
      setErrorMessage('Title is required.');
      return;
    }

    let normalizedDueDate: string | undefined;

    if (dueDate.trim()) {
      const parsedDate = new Date(dueDate.trim());

      if (Number.isNaN(parsedDate.getTime())) {
        setErrorMessage(
          'Due date must use a valid format such as 2026-10-20.',
        );
        return;
      }

      normalizedDueDate = parsedDate.toISOString();
    }

    setIsSubmitting(true);
    setErrorMessage(null);

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
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to create work order.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable
        disabled={isSubmitting}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.back}>
          ← Work orders
        </Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.eyebrow}>
          ADMIN
        </Text>

        <Text style={styles.title}>
          New work order
        </Text>

        <Text style={styles.subtitle}>
          Create a new item for the operations workflow.
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>
            Title
          </Text>

          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Customer onboarding"
            editable={!isSubmitting}
            maxLength={200}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            Description
          </Text>

          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the work to be completed"
            multiline
            textAlignVertical="top"
            editable={!isSubmitting}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            Priority
          </Text>

          <View style={styles.priorityOptions}>
            {priorities.map((option) => {
              const isSelected = option === priority;

              return (
                <Pressable
                  key={option}
                  disabled={isSubmitting}
                  style={[
                    styles.priorityButton,
                    isSelected &&
                      styles.priorityButtonSelected,
                  ]}
                  onPress={() => setPriority(option)}
                >
                  <Text
                    style={[
                      styles.priorityButtonText,
                      isSelected &&
                        styles.priorityButtonTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            Due date
          </Text>

          <TextInput
            style={styles.input}
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="2026-10-20"
            autoCapitalize="none"
            editable={!isSubmitting}
          />

          <Text style={styles.hint}>
            Optional · YYYY-MM-DD
          </Text>
        </View>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              {errorMessage}
            </Text>
          </View>
        ) : null}

        <Pressable
          disabled={isSubmitting}
          style={[
            styles.createButton,
            isSubmitting && styles.buttonDisabled,
          ]}
          onPress={() => {
            void handleCreate();
          }}
        >
          {isSubmitting ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.createButtonText}>
              Create work order
            </Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F8',
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  back: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
  },
  header: {
    marginTop: 40,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    opacity: 0.5,
  },
  title: {
    marginTop: 12,
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -1,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 23,
    opacity: 0.6,
  },
  form: {
    marginTop: 32,
    gap: 22,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#D9D9DE',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 14,
  },
  hint: {
    fontSize: 12,
    opacity: 0.5,
  },
  priorityOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityButton: {
    borderWidth: 1,
    borderColor: '#D9D9DE',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  priorityButtonSelected: {
    borderColor: '#111111',
    backgroundColor: '#111111',
  },
  priorityButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  priorityButtonTextSelected: {
    color: '#FFFFFF',
  },
  errorBox: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
  },
  createButton: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#111111',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});