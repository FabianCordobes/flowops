import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { WorkOrderCard } from '../components/work-orders/WorkOrderCard';
import { EmptyState } from '../components/ui/EmptyState';
import { ScreenHeader } from '../components/ui/ScreenHeader';

import { useAuth } from '../providers/AuthProvider';
import { getWorkOrders } from '../services/work-orders.service';

import { colors, radius, spacing, typography } from '../theme';

import type {
  WorkOrder,
  WorkOrderFilters,
  WorkOrderPriorityFilter,
  WorkOrderSort,
  WorkOrderStatusFilter,
} from '../types/work-order';

import type { WorkOrdersScreenProps } from '../types/work-order-screen';
import { WorkOrdersFilters } from '../components/work-orders/WorkOrdersFilters';

export const WorkOrdersScreen = ({
  navigation,
}: WorkOrdersScreenProps) => {
  const { profile } = useAuth();

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [status, setStatus] =
    useState<WorkOrderStatusFilter | undefined>(undefined);

  const [priority, setPriority] =
    useState<WorkOrderPriorityFilter | undefined>(undefined);

  const [sort, setSort] = useState<WorkOrderSort>('newest');

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const requestID = useRef(0);

  const isAdmin = profile?.role === 'ADMIN';

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);

    return () => clearTimeout(timeout);
  }, [search]);

  const filters: WorkOrderFilters = {
    status,
    priority,
    search: debouncedSearch,
    sort,
  };

  const loadWorkOrders = useCallback(
    async (activeRequestID: number, activeFilters: WorkOrderFilters) => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const data = await getWorkOrders(activeFilters);

        if (requestID.current !== activeRequestID) {
          return;
        }

        setWorkOrders(data);
      } catch (error) {
        if (requestID.current !== activeRequestID) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Unable to load work orders.',
        );
      } finally {
        if (requestID.current === activeRequestID) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  useFocusEffect(
    useCallback(() => {
      const currentRequestID = ++requestID.current;

      void loadWorkOrders(currentRequestID, {
        status,
        priority,
        search: debouncedSearch,
        sort,
      });

      return () => {
        requestID.current += 1;
      };
    }, [loadWorkOrders, status, priority, debouncedSearch, sort]),
  );

  const clearFilters = () => {
    setStatus(undefined);
    setPriority(undefined);
    setSearch('');
    setDebouncedSearch('');
    setSort('newest');
  };

  const hasActiveFilters =
    status !== undefined ||
    priority !== undefined ||
    search.trim().length > 0 ||
    sort !== 'newest';

  const handleOpenWorkOrder = (workOrderID: string) => {
    navigation.navigate('WorkOrderDetail', {
      workOrderId: workOrderID,
    });
  };

  const handleCreateWorkOrder = () => {
    navigation.navigate('CreateWorkOrder');
  };

  const hasWorkOrders = workOrders.length > 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <ScreenHeader
          eyebrow="FlowOps workspace"
          title="Work orders"
          subtitle="Manage and track your team's operations."
        />

        <View style={styles.accountRow}>
          <Text style={styles.accountEmail} numberOfLines={1}>
            {profile?.email}
          </Text>

          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {profile?.role}
            </Text>
          </View>
        </View>
      </View>

      {/* FILTERS */}
      <WorkOrdersFilters
        status={status}
        priority={priority}
        sort={sort}
        search={search}
        hasActiveFilters={hasActiveFilters}
        onStatusChange={setStatus}
        onPriorityChange={setPriority}
        onSortChange={setSort}
        onSearchChange={setSearch}
        onClear={clearFilters}
      />

      {/* RESULTS */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />

          <Text style={styles.loadingText}>
            Loading work orders...
          </Text>
        </View>
      ) : null}

      {!isLoading && errorMessage ? (
        <EmptyState
          variant="error"
          title="Unable to load work orders"
          description={errorMessage}
          actionLabel="Try again"
          onAction={() => {
            const currentRequestID = ++requestID.current;
            void loadWorkOrders(currentRequestID, filters);
          }}
        />
      ) : null}

      {!isLoading && !errorMessage && !hasWorkOrders ? (
        <EmptyState
          variant="empty"
          title={
            hasActiveFilters
              ? 'No matching work orders'
              : 'No work orders yet'
          }
          description={
            hasActiveFilters
              ? 'Try changing or clearing your filters.'
              : isAdmin
                ? 'Create the first work order to start the workflow.'
                : 'There are no work orders assigned to you.'
          }
          actionLabel={
            hasActiveFilters
              ? 'Clear filters'
              : isAdmin
                ? 'Create work order'
                : undefined
          }
          onAction={
            hasActiveFilters
              ? clearFilters
              : isAdmin
                ? handleCreateWorkOrder
                : undefined
          }
        />
      ) : null}

      {!isLoading && !errorMessage && hasWorkOrders ? (
        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>
              {hasActiveFilters ? 'Results' : 'All work orders'}
            </Text>

            <Text style={styles.listCount}>
              {workOrders.length}{' '}
              {workOrders.length === 1 ? 'order' : 'orders'}
            </Text>
          </View>

          <View style={styles.list}>
            {workOrders.map((workOrder) => (
              <WorkOrderCard
                key={workOrder.id}
                workOrder={workOrder}
                onPress={() => handleOpenWorkOrder(workOrder.id)}
              />
            ))}
          </View>
        </View>
      ) : null}
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
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.section,
  },

  header: {
    marginBottom: spacing.xxl,
    gap: spacing.lg,
  },

  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },

  accountEmail: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },

  roleBadge: {
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  roleText: {
    color: colors.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.wide,
  },

  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 220,
    paddingVertical: spacing.section,
    gap: spacing.md,
  },

  loadingText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    textAlign: 'center',
  },

  listSection: {
    gap: spacing.lg,
  },

  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },

  listTitle: {
    flex: 1,
    color: colors.text,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },

  listCount: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },

  list: {
    gap: spacing.lg,
  },
});
