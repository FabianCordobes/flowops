
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

import { AppButton } from '../components/ui/AppButton';
import { EmptyState } from '../components/ui/EmptyState';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { colors, radius, spacing, typography } from '../theme';

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
import { WorkOrderComments } from '../components/work-orders/WorkOrderComments';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'WorkOrderDetail'
>;

const MAX_REASON_LENGTH = 1000;

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export const WorkOrderDetailScreen = ({
  route,
  navigation,
}: Props) => {
  const { workOrderId } = route.params;
  const { profile } = useAuth();

  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [operators, setOperators] = useState<Profile[]>([]);
  const [showOperators, setShowOperators] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const [selectedAction, setSelectedAction] =
    useState<AvailableWorkOrderAction | null>(null);
  const [pendingAction, setPendingAction] =
    useState<WorkOrderAction | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [reason, setReason] = useState('');

  const [history, setHistory] = useState<WorkOrderStatusHistory[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const isBusy = isAssigning || isTransitioning;
  const normalizedReason = reason.trim();
  const isReasonValid = normalizedReason.length > 0;

  const sortedHistory = useMemo(
    () =>
      [...history].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime(),
      ),
    [history],
  );

  const loadHistory = useCallback(async () => {
    setIsHistoryLoading(true);
    setHistoryError(null);

    try {
      const data = await getWorkOrderHistory(workOrderId);
      setHistory(data);
    } catch (error) {
      setHistoryError(
        getErrorMessage(error, 'Unable to load work order history.'),
      );
    } finally {
      setIsHistoryLoading(false);
    }
  }, [workOrderId]);

  const loadWorkOrder = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await getWorkOrder(workOrderId);
      setWorkOrder(data);
    } catch (error) {
      setWorkOrder(null);
      setErrorMessage(
        getErrorMessage(error, 'Unable to load work order.'),
      );
    } finally {
      setIsLoading(false);
    }
  }, [workOrderId]);

  useEffect(() => {
    void loadWorkOrder();
    void loadHistory();
  }, [loadWorkOrder, loadHistory]);

  const availableActions = useMemo(() => {
    if (!profile || !workOrder) {
      return [];
    }

    return getAvailableWorkOrderActions(
      profile.role,
      workOrder.status,
    );
  }, [profile, workOrder]);

  const canAssign =
    profile?.role === 'ADMIN' &&
    workOrder?.status === 'NEW' &&
    !workOrder.assignedTo;

  const handleShowOperators = async () => {
    if (isBusy || !canAssign) {
      return;
    }

    setIsAssigning(true);
    setErrorMessage(null);

    try {
      const data = await getOperators();
      setOperators(data);
      setShowOperators(true);
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, 'Unable to load operators.'),
      );
    } finally {
      setIsAssigning(false);
    }
  };

  const handleAssignOperator = async (operatorId: string) => {
    if (isBusy || !canAssign) {
      return;
    }

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
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, 'Unable to assign operator.'),
      );
      setIsAssigning(false);
      return;
    }

    // The assignment has succeeded. History refresh is independent.
    await loadHistory();
    setIsAssigning(false);
  };

  const executeTransition = async (
    action: WorkOrderAction,
    transitionReason?: string,
  ) => {
    if (isBusy) {
      return;
    }

    setIsTransitioning(true);
    setPendingAction(action);
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
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, 'Unable to update work order.'),
      );
      setIsTransitioning(false);
      setPendingAction(null);
      return;
    }

    // The transition has succeeded. Do not repeat it if history fails.
    await loadHistory();
    setIsTransitioning(false);
    setPendingAction(null);
  };

  const handleAction = (
    actionDefinition: AvailableWorkOrderAction,
  ) => {
    if (isBusy || selectedAction) {
      return;
    }

    if (actionDefinition.requiresReason) {
      setSelectedAction(actionDefinition);
      setReason('');
      setErrorMessage(null);
      return;
    }

    void executeTransition(actionDefinition.action);
  };

  const handleReasonTransition = () => {
    if (!selectedAction || isBusy || !isReasonValid) {
      return;
    }

    void executeTransition(
      selectedAction.action,
      normalizedReason,
    );
  };

  const handleCancelOperators = () => {
    if (isBusy) {
      return;
    }

    setShowOperators(false);
    setOperators([]);
  };

  const handleCancelReason = () => {
    if (isBusy) {
      return;
    }

    setSelectedAction(null);
    setReason('');
    setErrorMessage(null);
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading work order...</Text>
      </View>
    );
  }

  if (!workOrder) {
    return (
      <View style={styles.centered}>
        <EmptyState
          variant="error"
          title="Unable to load work order"
          description={errorMessage ?? 'Work order not found.'}
          actionLabel="Try again"
          onAction={() => {
            void loadWorkOrder();
            void loadHistory();
          }}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* NAVIGATION */}
      <View style={styles.navigationRow}>
        <AppButton
          label="← Work orders"
          variant="outline"
          size="sm"
          fullWidth={false}
          disabled={isBusy}
          onPress={() => navigation.goBack()}
        />
      </View>

      {/* HEADER */}
      <View style={styles.header}>
        <ScreenHeader
          eyebrow="WORK ORDER DETAILS"
          title={workOrder.title}
          subtitle={workOrder.description || undefined}
        />

        <View style={styles.headerBadges}>
          <StatusBadge status={workOrder.status} size="md" />
          <PriorityBadge priority={workOrder.priority} size="md" />
        </View>
      </View>

      {/* OVERVIEW */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Overview</Text>

        <DetailRow
          label="Due date"
          value={
            workOrder.dueDate
              ? formatDate(workOrder.dueDate)
              : 'No due date'
          }
        />

        <DetailRow
          label="Assignment"
          value={
            workOrder.assignedTo ? 'Assigned' : 'Not assigned'
          }
        />
      </View>

      {/* ASSIGNMENT */}
      {canAssign ? (
        <View style={styles.actionsSection}>
          <Text style={styles.sectionLabel}>ASSIGNMENT</Text>

          {!showOperators ? (
            <AppButton
              label="Assign operator"
              variant="primary"
              loading={isAssigning}
              disabled={isBusy}
              onPress={() => {
                void handleShowOperators();
              }}
            />
          ) : null}
        </View>
      ) : null}

      {/* OPERATOR SELECTOR */}
      {canAssign && showOperators ? (
        <View style={styles.operatorCard}>
          <Text style={styles.operatorTitle}>Select operator</Text>
          <Text style={styles.operatorDescription}>
            Choose who will be responsible for this work order.
          </Text>

          {operators.length === 0 ? (
            <Text style={styles.emptyOperators}>
              No operators available.
            </Text>
          ) : (
            <View style={styles.operatorList}>
              {operators.map((operator) => (
                <Pressable
                  key={operator.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Assign to ${
                    operator.fullName ?? operator.email
                  }`}
                  accessibilityState={{ disabled: isBusy }}
                  disabled={isBusy}
                  style={({ pressed }) => [
                    styles.operatorOption,
                    pressed && styles.buttonPressed,
                    isBusy && styles.buttonDisabled,
                  ]}
                  onPress={() => {
                    void handleAssignOperator(operator.id);
                  }}
                >
                  <View style={styles.operatorInfo}>
                    <Text style={styles.operatorName} numberOfLines={1}>
                      {operator.fullName ?? 'Operator'}
                    </Text>

                    <Text style={styles.operatorEmail} numberOfLines={1}>
                      {operator.email}
                    </Text>
                  </View>

                  <Text style={styles.assignLabel}>Assign →</Text>
                </Pressable>
              ))}
            </View>
          )}

          <View style={styles.operatorCancel}>
            <AppButton
              label="Cancel"
              variant="outline"
              size="sm"
              fullWidth={false}
              disabled={isBusy}
              onPress={handleCancelOperators}
            />
          </View>
        </View>
      ) : null}

      {/* OPERATION ERRORS */}
      {errorMessage ? (
        <View style={styles.errorBox} accessibilityRole="alert">
          <Text style={styles.errorBoxText}>{errorMessage}</Text>
        </View>
      ) : null}

      {/* AVAILABLE ACTIONS */}
      {availableActions.length > 0 ? (
        <View style={styles.actionsSection}>
          <Text style={styles.sectionLabel}>AVAILABLE ACTIONS</Text>

          <View style={styles.actions}>
            {availableActions.map((actionDefinition) => (
              <AppButton
                key={actionDefinition.action}
                label={actionDefinition.label}
                variant={
                  actionDefinition.action === 'REQUEST_CHANGES'
                    ? 'outline'
                    : 'primary'
                }
                loading={
                  isTransitioning &&
                  pendingAction === actionDefinition.action
                }
                disabled={isBusy || selectedAction !== null}
                onPress={() => handleAction(actionDefinition)}
              />
            ))}
          </View>
        </View>
      ) : null}

      {/* REASON FORM */}
      {selectedAction?.requiresReason ? (
        <View style={styles.reasonCard}>
          <Text style={styles.reasonTitle}>Request changes</Text>

          <Text style={styles.reasonDescription}>
            Explain what needs to be updated before this work order
            can be reviewed again.
          </Text>

          <Text style={styles.reasonLabel}>
            Reason <Text style={styles.requiredMark}>*</Text>
          </Text>

          <TextInput
            style={styles.reasonInput}
            value={reason}
            onChangeText={(value) => {
              setReason(value);

              if (errorMessage === 'A reason is required.') {
                setErrorMessage(null);
              }
            }}
            placeholder="Describe the required changes..."
            placeholderTextColor={colors.textMuted}
            multiline
            editable={!isBusy}
            maxLength={MAX_REASON_LENGTH}
            textAlignVertical="top"
            accessibilityLabel="Reason for requesting changes"
          />

          <View style={styles.reasonFooter}>
            <Text style={styles.reasonHint}>
              Provide clear, actionable feedback.
            </Text>

            <Text style={styles.characterCount}>
              {reason.length}/{MAX_REASON_LENGTH}
            </Text>
          </View>

          <View style={styles.reasonActions}>
            <View style={styles.reasonActionItem}>
              <AppButton
                label="Cancel"
                variant="outline"
                disabled={isBusy}
                onPress={handleCancelReason}
              />
            </View>

            <View style={styles.reasonActionItem}>
              <AppButton
                label="Confirm changes"
                variant="primary"
                loading={isTransitioning}
                disabled={isBusy || !isReasonValid}
                onPress={handleReasonTransition}
              />
            </View>
          </View>
        </View>
      ) : null}

      {/* HISTORY */}
      <View style={styles.historySection}>
        <View style={styles.historyHeading}>
          <Text style={styles.sectionLabel}>HISTORY</Text>

          {!isHistoryLoading && !historyError ? (
            <Text style={styles.historyCount}>
              {history.length} {history.length === 1 ? 'event' : 'events'}
            </Text>
          ) : null}
        </View>

        {isHistoryLoading ? (
          <View style={styles.historyLoading}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.historyLoadingText}>
              Loading activity...
            </Text>
          </View>
        ) : historyError ? (
          <View style={styles.historyErrorCard}>
            <Text style={styles.historyErrorTitle}>
              Unable to load history
            </Text>

            <Text style={styles.historyErrorText}>
              {historyError}
            </Text>

            <View style={styles.historyRetry}>
              <AppButton
                label="Retry history"
                variant="outline"
                size="sm"
                fullWidth={false}
                disabled={isBusy}
                onPress={() => {
                  void loadHistory();
                }}
              />
            </View>
          </View>
        ) : history.length === 0 ? (
          <View style={styles.historyEmptyCard}>
            <Text style={styles.emptyHistory}>
              No activity recorded yet.
            </Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            {sortedHistory.map((entry, index) => (
              <View key={entry.id} style={styles.historyEntry}>
                <View style={styles.timelineIndicator}>
                  <View
                    style={[
                      styles.timelineDot,
                      index === 0 && styles.timelineDotLatest,
                    ]}
                  />

                  {index < sortedHistory.length - 1 ? (
                    <View style={styles.timelineLine} />
                  ) : null}
                </View>

                <View style={styles.historyContent}>
                  <View style={styles.historyStatusRow}>
                    <StatusBadge
                      status={entry.toStatus}
                      size="sm"
                    />

                    {index === 0 ? (
                      <Text style={styles.latestLabel}>
                        LATEST
                      </Text>
                    ) : null}
                  </View>

                  <Text style={styles.historyMeta}>
                    {formatHistoryDate(entry.createdAt)}
                  </Text>

                  <Text style={styles.historyActor}>
                    {entry.changedByProfile.fullName ??
                      entry.changedByProfile.email}
                  </Text>

                  <Text style={styles.historyTransition}>
                    {entry.fromStatus
                      ? `${formatStatus(entry.fromStatus)} → ${formatStatus(
                          entry.toStatus,
                        )}`
                      : 'Work order created'}
                  </Text>

                  {entry.reason ? (
                    <View style={styles.historyReasonBox}>
                      <Text style={styles.historyReasonLabel}>
                        REASON
                      </Text>

                      <Text style={styles.historyReason}>
                        {entry.reason}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* COMMENTS */}
      <WorkOrderComments workOrderId={workOrder.id} />

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

const DetailRow = ({ label, value }: DetailRowProps) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const formatStatus = (status: WorkOrder['status']) =>
  status
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));

const formatHistoryDate = (date: string) =>
  new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));

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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.screen,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  navigationRow: {
    alignItems: 'flex-start',
    marginBottom: spacing.xxxl,
  },
  header: {
    gap: spacing.lg,
    marginBottom: spacing.xxl,
  },
  headerBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  cardTitle: {
    color: colors.text,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  label: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
  },
  value: {
    flex: 1,
    color: colors.text,
    textAlign: 'right',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  actionsSection: {
    marginTop: spacing.xxl,
  },
  sectionLabel: {
    marginBottom: spacing.md,
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1.5,
  },
  actions: {
    gap: spacing.md,
  },
  errorBox: {
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    padding: spacing.lg,
  },
  errorBoxText: {
    color: '#991B1B',
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  buttonPressed: {
    opacity: 0.75,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  operatorCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.xl,
  },
  operatorTitle: {
    color: colors.text,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  operatorDescription: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  operatorList: {
    gap: spacing.sm,
  },
  operatorOption: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  operatorInfo: {
    flex: 1,
  },
  operatorName: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  operatorEmail: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  assignLabel: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  emptyOperators: {
    paddingVertical: spacing.lg,
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  operatorCancel: {
    marginTop: spacing.lg,
    alignItems: 'flex-start',
  },
  reasonCard: {
    marginTop: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.xl,
  },
  reasonTitle: {
    color: colors.text,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  reasonDescription: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: 21,
  },
  reasonLabel: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    color: colors.text,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  requiredMark: {
    color: '#DC2626',
  },
  reasonInput: {
    minHeight: 128,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: typography.fontSize.md,
    lineHeight: 22,
  },
  reasonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  reasonHint: {
    flex: 1,
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
  },
  characterCount: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
  },
  reasonActions: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    gap: spacing.md,
  },
  reasonActionItem: {
    flex: 1,
    minWidth: 0,
  },
  historySection: {
    marginTop: spacing.xxxl,
  },
  historyHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyCount: {
    marginBottom: spacing.md,
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
  },
  historyLoading: {
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  historyLoadingText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  historyErrorCard: {
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
  },
  historyErrorTitle: {
    color: colors.text,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  historyErrorText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  historyRetry: {
    marginTop: spacing.lg,
    alignItems: 'flex-start',
  },
  historyEmptyCard: {
    padding: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  emptyHistory: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  timeline: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.xl,
  },
  historyEntry: {
    flexDirection: 'row',
    minHeight: 88,
  },
  timelineIndicator: {
    width: 22,
    alignItems: 'center',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.textMuted,
    marginTop: spacing.sm,
  },
  timelineDotLatest: {
    backgroundColor: colors.primary,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    marginVertical: spacing.sm,
    backgroundColor: colors.border,
  },
  historyContent: {
    flex: 1,
    paddingLeft: spacing.md,
    paddingBottom: spacing.xxl,
  },
  historyStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  latestLabel: {
    color: colors.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1,
  },
  historyMeta: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
  },
  historyActor: {
    marginTop: spacing.xs,
    color: colors.text,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  historyTransition: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  historyReasonBox: {
    marginTop: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  historyReasonLabel: {
    marginBottom: spacing.xs,
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1,
  },
  historyReason: {
    color: colors.text,
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  identifier: {
    marginTop: spacing.xxl,
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
  },
});
