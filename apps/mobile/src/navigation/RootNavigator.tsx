
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';

import { useAuth } from '../providers/AuthProvider';
import { LoginScreen } from '../screens/LoginScreen';
import { WorkOrdersScreen } from '../screens/WorkOrdersScreen';
import { WorkOrderDetailScreen } from '../screens/WorkOrderDetailScreen';
import { CreateWorkOrderScreen } from '../screens/CreateWorkOrderScreen';
import { colors } from '../theme';

import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { session, profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </View>
    );
  }

  const isAuthenticated = Boolean(session && profile);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      {isAuthenticated ? (
        <Stack.Group navigationKey="authenticated">
          <Stack.Screen
            name="WorkOrders"
            component={WorkOrdersScreen}
          />

          <Stack.Screen
            name="WorkOrderDetail"
            component={WorkOrderDetailScreen}
          />

          <Stack.Screen
            name="CreateWorkOrder"
            component={CreateWorkOrderScreen}
          />
        </Stack.Group>
      ) : (
        <Stack.Group navigationKey="guest">
          <Stack.Screen
            name="Login"
            component={LoginScreen}
          />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
