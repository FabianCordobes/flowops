import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';

import { useAuth } from '../providers/AuthProvider';
import { LoginScreen } from '../screens/LoginScreen';
import { WorkOrdersScreen } from '../screens/WorkOrdersScreen';
import type { RootStackParamList } from './types';
import { WorkOrderDetailScreen } from '../screens/WorkOrderDetailScreen';
import { CreateWorkOrderScreen } from '../screens/CreateWorkOrderScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { session, profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const isAuthenticated = Boolean(session && profile);

  return (
    <Stack.Navigator>
      {isAuthenticated ? (
        <>
        <Stack.Screen
          name="WorkOrders"
          component={WorkOrdersScreen}
          options={{
            headerShown: false,
          }}
        />
    
        <Stack.Screen
          name="WorkOrderDetail"
          component={WorkOrderDetailScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
        name="CreateWorkOrder"
        component={CreateWorkOrderScreen}
        options={{
            headerShown: false,
        }}
        />
      </>
      ) : (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerShown: false,
          }}
        />
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F7F8',
  },
});