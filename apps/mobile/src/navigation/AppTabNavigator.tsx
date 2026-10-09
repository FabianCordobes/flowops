
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View } from 'react-native';

import { HomeScreen } from '../screens/HomeScreen';
import { WorkOrdersScreen } from '../screens/WorkOrdersScreen';
import { AppTabBar } from './AppTabBar';

import { colors, typography } from '../theme';
import type { AppTabParamList } from './types';
import { AccountScreen } from '../screens/AccountScreen';

const Tab = createBottomTabNavigator<AppTabParamList>();

const AccountPlaceholder = () => (
  <View style={styles.placeholder}>
    <Text style={styles.title}>Account</Text>
    <Text style={styles.subtitle}>
      Account information will appear here.
    </Text>
  </View>
);

export const AppTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Orders"
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
        }}
      />

      <Tab.Screen
        name="Orders"
        component={WorkOrdersScreen}
        options={{
          title: 'Orders',
        }}
      />

      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{ title: 'Account' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: 24,
  },

  title: {
    color: colors.text,
    fontSize: typography.fontSize.heading,
    fontWeight: typography.fontWeight.bold,
  },

  subtitle: {
    marginTop: 12,
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    textAlign: 'center',
  },
});
