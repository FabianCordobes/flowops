
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { WorkOrderCard } from '../components/work-orders/WorkOrderCard';
import { AppButton } from '../components/ui/AppButton';
import { EmptyState } from '../components/ui/EmptyState';
import { ScreenHeader } from '../components/ui/ScreenHeader';

import type { RootStackParamList } from '../navigation/types';
import { useAuth } from '../providers/AuthProvider';
import { getWorkOrders } from '../services/work-orders.service';

import {
  colors,
  radius,
  spacing,
  typography,
} from '../theme';

import type { WorkOrder } from '../types/work-order';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'WorkOrders'
>;

export const WorkOrdersScreen = ({ navigation }: Props) => {
  const { profile, signOut } = useAuth();

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isAdmin = profile?.role === 'ADMIN';

  const loadWorkOrders = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await getWorkOrders();
      setWorkOrders(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to load work orders.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadWorkOrders();
    }, [loadWorkOrders]),
  );

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out', error);
    }
  };

  const handleCreateWorkOrder = () => {
    navigation.navigate('CreateWorkOrder');
  };

  const handleOpenWorkOrder = (workOrderID: string) => {
    navigation.navigate('WorkOrderDetail', {
      workOrderId: workOrderID,
    });
  };

  const hasWorkOrders = workOrders.length > 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <ScreenHeader
          eyebrow="FlowOps workspace"
          title="Work orders"
          subtitle="Manage and track your team's operations."
        />

        <View style={styles.accountRow}>
          <Text
            style={styles.accountEmail}
            numberOfLines={1}
          >
            {profile?.email}
          </Text>

          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {profile?.role}
            </Text>
          </View>
        </View>
      </View>

      {/* Create work order - ADMIN only */}
      {isAdmin ? (
        <View style={styles.createAction}>
          <AppButton
            label="+ New work order"
            onPress={handleCreateWorkOrder}
          />
        </View>
      ) : null}

      {/* Loading state */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />

          <Text style={styles.loadingText}>
            Loading work orders...
          </Text>
        </View>
      ) : null}

      {/* Error state */}
      {!isLoading && errorMessage ? (
        <EmptyState
          variant="error"
          title="Unable to load work orders"
          description={errorMessage}
          actionLabel="Try again"
          onAction={() => {
            void loadWorkOrders();
          }}
        />
      ) : null}

      {/* Empty state */}
      {!isLoading && !errorMessage && !hasWorkOrders ? (
        <EmptyState
          variant="empty"
          title="No work orders yet"
          description={
            isAdmin
              ? 'Create the first work order to start the workflow.'
              : 'There are no work orders assigned to you.'
          }
          actionLabel={isAdmin ? 'Create work order' : undefined}
          onAction={isAdmin ? handleCreateWorkOrder : undefined}
        />
      ) : null}

      {/* Work orders list */}
      {!isLoading && !errorMessage && hasWorkOrders ? (
        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>
              All work orders
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
                onPress={() => {
                  handleOpenWorkOrder(workOrder.id);
                }}
              />
            ))}
          </View>
        </View>
      ) : null}

      {/* Sign out */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Sign out"
        style={({ pressed }) => [
          styles.signOutButton,
          pressed && styles.signOutPressed,
        ]}
        onPress={() => {
          void handleSignOut();
        }}
      >
        <Text style={styles.signOutText}>
          Sign out
        </Text>
      </Pressable>
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

  createAction: {
    marginBottom: spacing.xxl,
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

  signOutButton: {
    marginTop: spacing.section,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.text,
  },

  signOutPressed: {
    opacity: 0.8,
  },

  signOutText: {
    color: colors.textInverse,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
});
