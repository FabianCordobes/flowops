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

import type { RootStackParamList } from '../navigation/types';
import { useAuth } from '../providers/AuthProvider';
import { getWorkOrders } from '../services/work-orders.service';
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>FLOWOPS</Text>

          <Text style={styles.title}>Work orders</Text>

          <Text style={styles.subtitle}>
            {profile?.email}
          </Text>
        </View>

        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {profile?.role}
          </Text>
        </View>
      </View>

      {profile?.role === 'ADMIN' ? (
        <Pressable
          style={styles.createButton}
          onPress={() => {
            navigation.navigate('CreateWorkOrder');
          }}
        >
          <Text style={styles.createButtonText}>
            + New work order
          </Text>
        </Pressable>
      ) : null}


      {isLoading ? (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" />

          <Text style={styles.stateText}>
            Loading work orders...
          </Text>
        </View>
      ) : null}

      {!isLoading && errorMessage ? (
        <View style={styles.stateContainer}>
          <Text style={styles.errorTitle}>
            Unable to load work orders
          </Text>

          <Text style={styles.stateText}>
            {errorMessage}
          </Text>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => {
              void loadWorkOrders();
            }}
          >
            <Text style={styles.secondaryButtonText}>
              Try again
            </Text>
          </Pressable>
        </View>
      ) : null}

      {!isLoading &&
      !errorMessage &&
      workOrders.length === 0 ? (
        <View style={styles.stateContainer}>
          <Text style={styles.emptyTitle}>
            No work orders yet
          </Text>

          <Text style={styles.stateText}>
            {profile?.role === 'ADMIN'
              ? 'Create the first work order to start the workflow.'
              : 'There are no work orders assigned to you.'}
          </Text>
        </View>
      ) : null}

      {!isLoading && !errorMessage ? (
        <View style={styles.list}>
          {workOrders.map((workOrder) => (
            <Pressable
              key={workOrder.id}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
              onPress={() => {
                navigation.navigate('WorkOrderDetail', {
                  workOrderId: workOrder.id,
                });
              }}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>
                  {workOrder.title}
                </Text>

                <Text style={styles.priority}>
                  {workOrder.priority}
                </Text>
              </View>

              {workOrder.description ? (
                <Text style={styles.description}>
                  {workOrder.description}
                </Text>
              ) : null}

              <View style={styles.cardFooter}>
                <Text style={styles.status}>
                  {formatStatus(workOrder.status)}
                </Text>

                {workOrder.dueDate ? (
                  <Text style={styles.dueDate}>
                    Due {formatDate(workOrder.dueDate)}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          ))}
        </View>
      ) : null}

      <Pressable
        style={styles.signOutButton}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F8',
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    marginTop: 16,
    marginBottom: 32,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  title: {
    marginTop: 12,
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -1,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    opacity: 0.55,
  },
  roleBadge: {
    borderRadius: 999,
    backgroundColor: '#111111',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  createButton: {
    minHeight: 52,
    marginBottom: 24,
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
  stateContainer: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 24,
  },
  stateText: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.6,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
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
  list: {
    gap: 14,
  },
  card: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 18,
  },
  cardPressed: {
    opacity: 0.75,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
  },
  priority: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    opacity: 0.55,
  },
  description: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    opacity: 0.65,
  },
  cardFooter: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  status: {
    fontSize: 13,
    fontWeight: '700',
  },
  dueDate: {
    fontSize: 12,
    opacity: 0.5,
  },
  signOutButton: {
    marginTop: 32,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#111111',
  },
  signOutText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});