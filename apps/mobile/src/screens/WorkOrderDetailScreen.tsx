import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { useAuth } from '../providers/AuthProvider';
import { getOperators } from '../services/profiles.service';
import {
  assignWorkOrder,
  getWorkOrder,
  getWorkOrderHistory,
  transitionWorkOrder,
} from '../services/work-orders.service';
import type { Profile } from '../types/auth';
import type {
  WorkOrder,
  WorkOrderAction,
  WorkOrderStatusHistory,
} from '../types/work-order';
import {
  getAvailableWorkOrderActions,
  type AvailableWorkOrderAction,
} from '../utils/work-order-actions';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'WorkOrderDetail'
>;

export const WorkOrderDetailScreen = ({
  route,
  navigation,
}: Props) => {
  const { workOrderId } = route.params;
  const { profile } = useAuth();

  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedAction, setSelectedAction] =
    useState<AvailableWorkOrderAction | null>(null);

  const [reason, setReason] = useState('');

  const [operators, setOperators] = useState<Profile[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [showOperators, setShowOperators] = useState(false);
  const [history, setHistory] = useState<WorkOrderStatusHistory[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  const loadWorkOrder = useCallback(async () => {
    setIsLoading(true);
    setIsHistoryLoading(true);
    setErrorMessage(null);
  
    try {
      const [workOrderData, historyData] = await Promise.all([
        getWorkOrder(workOrderId),
        getWorkOrderHistory(workOrderId),
      ]);
  
      setWorkOrder(workOrderData);
      setHistory(historyData);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to load work order.',
      );
    } finally {
      setIsLoading(false);
      setIsHistoryLoading(false);
    }
  }, [workOrderId]);

  useEffect(() => {
    void loadWorkOrder();
  }, [loadWorkOrder]);

  const availableActions = useMemo(() => {
    if (!profile || !workOrder) {
      return [];
    }

    return getAvailableWorkOrderActions(
      profile.role,
      workOrder.status,
    );
  }, [profile, workOrder]);

  const handleShowOperators = async () => {
    setIsAssigning(true);
    setErrorMessage(null);

    try {
      const data = await getOperators();

      setOperators(data);
      setShowOperators(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to load operators.',
      );
    } finally {
      setIsAssigning(false);
    }
  };

  const handleAssignOperator = async (operatorId: string) => {
    setIsAssigning(true);
    setErrorMessage(null);

    try {
      const updatedWorkOrder = await assignWorkOrder(
        workOrderId,
        operatorId,
      );

      setWorkOrder(updatedWorkOrder);
      setShowOperators(false);
      setOperators([]);

      const updatedHistory = await getWorkOrderHistory(workOrderId);
      setHistory(updatedHistory);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to assign operator.',
      );
    } finally {
      setIsAssigning(false);
    }
  };

  const executeTransition = async (
    action: WorkOrderAction,
    transitionReason?: string,
  ) => {
    setIsTransitioning(true);
    setErrorMessage(null);

    try {
      const updatedWorkOrder = await transitionWorkOrder(
        workOrderId,
        action,
        transitionReason,
      );

      setWorkOrder(updatedWorkOrder);
      setSelectedAction(null);
      setReason('');

      const updatedHistory = await getWorkOrderHistory(workOrderId);
      setHistory(updatedHistory);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to update work order.',
      );
    } finally {
      setIsTransitioning(false);
    }
  };

  const handleAction = (
    actionDefinition: AvailableWorkOrderAction,
  ) => {
    if (actionDefinition.requiresReason) {
      setSelectedAction(actionDefinition);
      setReason('');
      setErrorMessage(null);
      return;
    }

    void executeTransition(actionDefinition.action);
  };

  const handleReasonTransition = () => {
    if (!selectedAction) {
      return;
    }

    const normalizedReason = reason.trim();

    if (!normalizedReason) {
      setErrorMessage('A reason is required.');
      return;
    }

    void executeTransition(
      selectedAction.action,
      normalizedReason,
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Loading work order...
        </Text>
      </View>
    );
  }

  if (!workOrder) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>
          Unable to load work order
        </Text>

        <Text style={styles.errorText}>
          {errorMessage ?? 'Work order not found.'}
        </Text>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => {
            void loadWorkOrder();
          }}
        >
          <Text style={styles.secondaryButtonText}>
            Try again
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable
        disabled={isTransitioning || isAssigning}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.back}>
          ← Work orders
        </Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.eyebrow}>
          WORK ORDER
        </Text>

        <Text style={styles.title}>
          {workOrder.title}
        </Text>

        {workOrder.description ? (
          <Text style={styles.description}>
            {workOrder.description}
          </Text>
        ) : null}
      </View>

      <View style={styles.card}>
        <DetailRow
          label="Status"
          value={formatStatus(workOrder.status)}
        />

        <DetailRow
          label="Priority"
          value={workOrder.priority}
        />

        <DetailRow
          label="Due date"
          value={
            workOrder.dueDate
              ? formatDate(workOrder.dueDate)
              : 'No due date'
          }
        />

        <DetailRow
          label="Assigned"
          value={workOrder.assignedTo ? 'Yes' : 'Not assigned'}
        />
      </View>

      {profile?.role === 'ADMIN' &&
      workOrder.status === 'NEW' &&
      !workOrder.assignedTo ? (
        <View style={styles.actionsSection}>
          <Text style={styles.sectionLabel}>
            ASSIGNMENT
          </Text>

          <Pressable
            disabled={isAssigning}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.buttonPressed,
              isAssigning && styles.buttonDisabled,
            ]}
            onPress={() => {
              void handleShowOperators();
            }}
          >
            {isAssigning && !showOperators ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.actionButtonText}>
                Assign operator
              </Text>
            )}
          </Pressable>
        </View>
      ) : null}

      {showOperators ? (
        <View style={styles.operatorCard}>
          <Text style={styles.operatorTitle}>
            Select operator
          </Text>

          {operators.length === 0 ? (
            <Text style={styles.emptyOperators}>
              No operators available.
            </Text>
          ) : (
            operators.map((operator) => (
              <Pressable
                key={operator.id}
                disabled={isAssigning}
                style={({ pressed }) => [
                  styles.operatorOption,
                  pressed && styles.buttonPressed,
                  isAssigning && styles.buttonDisabled,
                ]}
                onPress={() => {
                  void handleAssignOperator(operator.id);
                }}
              >
                <View style={styles.operatorInfo}>
                  <Text style={styles.operatorName}>
                    {operator.fullName ?? 'Operator'}
                  </Text>

                  <Text style={styles.operatorEmail}>
                    {operator.email}
                  </Text>
                </View>

                <Text style={styles.assignLabel}>
                  Assign
                </Text>
              </Pressable>
            ))
          )}

          <Pressable
            disabled={isAssigning}
            style={styles.cancelOperatorButton}
            onPress={() => {
              setShowOperators(false);
            }}
          >
            <Text style={styles.cancelButtonText}>
              Cancel
            </Text>
          </Pressable>
        </View>
      ) : null}

      {errorMessage ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorBoxText}>
            {errorMessage}
          </Text>
        </View>
      ) : null}

      {availableActions.length > 0 ? (
        <View style={styles.actionsSection}>
          <Text style={styles.sectionLabel}>
            AVAILABLE ACTIONS
          </Text>

          <View style={styles.actions}>
            {availableActions.map((actionDefinition) => (
              <Pressable
                key={actionDefinition.action}
                disabled={isTransitioning}
                style={({ pressed }) => [
                  styles.actionButton,
                  actionDefinition.action === 'REQUEST_CHANGES' &&
                    styles.secondaryActionButton,
                  pressed && styles.buttonPressed,
                  isTransitioning && styles.buttonDisabled,
                ]}
                onPress={() => {
                  handleAction(actionDefinition);
                }}
              >
                {isTransitioning ? (
                  <ActivityIndicator />
                ) : (
                  <Text
                    style={[
                      styles.actionButtonText,
                      actionDefinition.action ===
                        'REQUEST_CHANGES' &&
                        styles.secondaryActionButtonText,
                    ]}
                  >
                    {actionDefinition.label}
                  </Text>
                )}
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {selectedAction?.requiresReason ? (
        <View style={styles.reasonCard}>
          <Text style={styles.reasonTitle}>
            Request changes
          </Text>

          <Text style={styles.reasonDescription}>
            Explain what needs to be updated before this work
            order can be reviewed again.
          </Text>

          <TextInput
            style={styles.reasonInput}
            value={reason}
            onChangeText={setReason}
            placeholder="Describe the required changes"
            multiline
            editable={!isTransitioning}
            maxLength={1000}
            textAlignVertical="top"
          />

          <View style={styles.reasonActions}>
            <Pressable
              disabled={isTransitioning}
              style={styles.cancelButton}
              onPress={() => {
                setSelectedAction(null);
                setReason('');
                setErrorMessage(null);
              }}
            >
              <Text style={styles.cancelButtonText}>
                Cancel
              </Text>
            </Pressable>

            <Pressable
              disabled={isTransitioning}
              style={[
                styles.confirmButton,
                isTransitioning && styles.buttonDisabled,
              ]}
              onPress={handleReasonTransition}
            >
              {isTransitioning ? (
                <ActivityIndicator />
              ) : (
                <Text style={styles.confirmButtonText}>
                  Confirm changes
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      ) : null}
      
      <View style={styles.historySection}>
  <Text style={styles.sectionLabel}>
    HISTORY
  </Text>

  {isHistoryLoading ? (
    <ActivityIndicator />
  ) : history.length === 0 ? (
    <Text style={styles.emptyHistory}>
      No history available.
    </Text>
  ) : (
    <View style={styles.timeline}>
      {history.map((entry, index) => (
        <View
          key={entry.id}
          style={styles.historyEntry}
        >
          <View style={styles.timelineIndicator}>
            <View style={styles.timelineDot} />

            {index < history.length - 1 ? (
              <View style={styles.timelineLine} />
            ) : null}
          </View>

          <View style={styles.historyContent}>
            <Text style={styles.historyStatus}>
              {formatStatus(entry.toStatus)}
            </Text>

            <Text style={styles.historyMeta}>
              {formatHistoryDate(entry.createdAt)}
              {' · '}
              {entry.changedByProfile.fullName ??
                entry.changedByProfile.email}
            </Text>

            {entry.fromStatus ? (
              <Text style={styles.historyTransition}>
                {formatStatus(entry.fromStatus)}
                {' → '}
                {formatStatus(entry.toStatus)}
              </Text>
            ) : (
              <Text style={styles.historyTransition}>
                Work order created
              </Text>
            )}

            {entry.reason ? (
              <Text style={styles.historyReason}>
                {entry.reason}
              </Text>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  )}
</View>
      <Text style={styles.identifier}>
        ID {workOrder.id}
      </Text>
    </ScrollView>
  );
};

type DetailRowProps = {
  label: string;
  value: string;
};

const DetailRow = ({
  label,
  value,
}: DetailRowProps) => (
  <View style={styles.row}>
    <Text style={styles.label}>
      {label}
    </Text>

    <Text style={styles.value}>
      {value}
    </Text>
  </View>
);

const formatStatus = (status: WorkOrder['status']) => {
  return status
    .toLowerCase()
    .split('_')
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(' ');
};

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
};

const formatHistoryDate = (date: string) => {
    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F7F8',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    opacity: 0.6,
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
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -1,
  },
  description: {
    marginTop: 14,
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.6,
  },
  card: {
    marginTop: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#DDDDDD',
  },
  label: {
    fontSize: 14,
    opacity: 0.55,
  },
  value: {
    flex: 1,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '700',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  errorText: {
    marginTop: 10,
    textAlign: 'center',
    opacity: 0.6,
  },
  errorBox: {
    marginTop: 20,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  errorBoxText: {
    fontSize: 14,
    lineHeight: 20,
  },
  secondaryButton: {
    marginTop: 20,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    fontWeight: '600',
  },
  actionsSection: {
    marginTop: 32,
  },
  sectionLabel: {
    marginBottom: 12,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    opacity: 0.5,
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#111111',
    paddingHorizontal: 18,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryActionButton: {
    borderWidth: 1,
    borderColor: '#111111',
    backgroundColor: 'transparent',
  },
  secondaryActionButtonText: {
    color: '#111111',
  },
  buttonPressed: {
    opacity: 0.75,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  operatorCard: {
    marginTop: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  operatorTitle: {
    marginBottom: 14,
    fontSize: 18,
    fontWeight: '700',
  },
  operatorOption: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#DDDDDD',
  },
  operatorInfo: {
    flex: 1,
  },
  operatorName: {
    fontSize: 15,
    fontWeight: '700',
  },
  operatorEmail: {
    marginTop: 4,
    fontSize: 13,
    opacity: 0.55,
  },
  assignLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyOperators: {
    fontSize: 14,
    opacity: 0.55,
  },
  cancelOperatorButton: {
    alignSelf: 'flex-start',
    marginTop: 18,
    paddingVertical: 8,
  },
  reasonCard: {
    marginTop: 20,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  reasonTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  reasonDescription: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.6,
  },
  reasonInput: {
    minHeight: 120,
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#D9D9DE',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
  },
  reasonActions: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
  },
  cancelButtonText: {
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#111111',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  historySection: {
    marginTop: 40,
  },
  timeline: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  historyEntry: {
    flexDirection: 'row',
    minHeight: 88,
  },
  timelineIndicator: {
    width: 24,
    alignItems: 'center',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#111111',
    marginTop: 5,
  },
  timelineLine: {
    flex: 1,
    width: 1,
    marginVertical: 5,
    backgroundColor: '#D9D9DE',
  },
  historyContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 22,
  },
  historyStatus: {
    fontSize: 15,
    fontWeight: '700',
  },
  historyMeta: {
    marginTop: 4,
    fontSize: 12,
    opacity: 0.5,
  },
  historyTransition: {
    marginTop: 7,
    fontSize: 13,
    opacity: 0.65,
  },
  historyReason: {
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: '#F7F7F8',
    padding: 10,
    fontSize: 13,
    lineHeight: 18,
  },
  emptyHistory: {
    fontSize: 14,
    opacity: 0.55,
  },
  identifier: {
    marginTop: 24,
    fontSize: 11,
    opacity: 0.35,
  },
});