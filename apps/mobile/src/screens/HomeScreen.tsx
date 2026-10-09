
import { useFocusEffect } from '@react-navigation/native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
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

import { Ionicons } from '@expo/vector-icons';

import { WorkOrderCard } from '../components/work-orders/WorkOrderCard';
import { EmptyState } from '../components/ui/EmptyState';
import { ScreenHeader } from '../components/ui/ScreenHeader';

import type {
  AppTabParamList,
  RootStackParamList,
} from '../navigation/types';

import { useAuth } from '../providers/AuthProvider';
import { getWorkOrdersDashboard } from '../services/work-orders.service';
import { colors, radius, spacing, typography } from '../theme';
import type { WorkOrdersDashboard } from '../types/work-order';

type Props = CompositeScreenProps<
  BottomTabScreenProps<AppTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList, 'AppTabs'>
>;

type StatCardProps = {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
};

const StatCard = ({
  label,
  value,
  icon,
  color = colors.primary,
}: StatCardProps) => (
  <View style={styles.statCard}>
    <View style={styles.statIcon}>
      <Ionicons name={icon} size={21} color={color} />
    </View>

    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export const HomeScreen = ({ navigation }: Props) => {
  const { profile } = useAuth();

  const [dashboard, setDashboard] =
  useState<WorkOrdersDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await getWorkOrdersDashboard();
      setDashboard(data);
    } catch (error) {
      setDashboard(null);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to load dashboard.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadDashboard();
    }, [loadDashboard]),
  );

  const recentOrders = dashboard?.recentOrders ?? [];

  const handleViewAll = () => {
    navigation.navigate('Orders');
  };

  const handleOpenWorkOrder = (workOrderID: string) => {
    navigation.navigate('WorkOrderDetail', {
      workOrderId: workOrderID,
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <ScreenHeader
          eyebrow="FlowOps workspace"
          title="Dashboard"
          subtitle="Your operations at a glance."
        />

        <View style={styles.userRow}>
          <Text style={styles.userEmail} numberOfLines={1}>
            {profile?.email}
          </Text>

          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {profile?.role}
            </Text>
          </View>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />
          <Text style={styles.loadingText}>
            Loading dashboard...
          </Text>
        </View>
      ) : null}

      {!isLoading && errorMessage ? (
        <EmptyState
          variant="error"
          title="Unable to load dashboard"
          description={errorMessage}
          actionLabel="Try again"
          onAction={() => {
            void loadDashboard();
          }}
        />
      ) : null}

      {!isLoading && !errorMessage ? (
        <>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Overview
              </Text>
              <Text style={styles.sectionSubtitle}>
                Current work orders
              </Text>
            </View>

            <View style={styles.statsGrid}>
             <StatCard
  label="Total orders"
  value={dashboard?.total ?? 0}
  icon="layers-outline"
/>

<StatCard
  label="In progress"
  value={dashboard?.inProgress ?? 0}
  icon="time-outline"
/>

<StatCard
  label="In review"
  value={dashboard?.inReview ?? 0}
  icon="eye-outline"
/>

<StatCard
  label="Completed"
  value={dashboard?.completed ?? 0}
  icon="checkmark-circle-outline"
/>
<StatCard
  label="Pending"
  value={(dashboard?.new ?? 0) + (dashboard?.assigned ?? 0)}
  icon="clipboard-outline"
/>

<StatCard
  label="Overdue"
  value={dashboard?.overdue ?? 0}
  icon="alert-circle-outline"
  color={colors.danger}
/>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.recentHeader}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Recent work orders
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Recently updated work orders
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="View all work orders"
                onPress={handleViewAll}
                style={styles.viewAllButton}
              >
                <Text style={styles.viewAllText}>
                  View all
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color={colors.primary}
                />
              </Pressable>
            </View>

            {recentOrders.length === 0 ? (
              <EmptyState
                variant="empty"
                title="No work orders yet"
                description="Your recent work orders will appear here."
              />
            ) : (
              <View style={styles.recentList}>
                {recentOrders.map((order) => (
                  <WorkOrderCard
                    key={order.id}
                    workOrder={order}
                    onPress={() => {
                      handleOpenWorkOrder(order.id);
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        </>
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

  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },

  userEmail: {
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
    minHeight: 240,
    gap: spacing.md,
  },

  loadingText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },

  section: {
    marginBottom: spacing.section,
    gap: spacing.lg,
  },

  sectionHeader: {
    gap: spacing.xs,
  },

  sectionTitle: {
    color: colors.text,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },

  sectionSubtitle: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },

  statCard: {
    width: '47%',
    minHeight: 136,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'space-between',
    gap: spacing.sm,
  },

  statIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statValue: {
    color: colors.text,
    fontSize: typography.fontSize.heading,
    fontWeight: typography.fontWeight.bold,
  },

  statLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },

  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },

  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },

  viewAllText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },

  recentList: {
    gap: spacing.lg,
  },
});
