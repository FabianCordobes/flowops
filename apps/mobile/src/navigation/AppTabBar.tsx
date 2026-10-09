
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../providers/AuthProvider';
import { colors, radius, spacing, typography } from '../theme';
import type { RootStackParamList } from './types';

type RootNavigation = NativeStackNavigationProp<RootStackParamList>;

const tabIcons = {
  Home: {
    active: 'home',
    inactive: 'home-outline',
  },
  Orders: {
    active: 'clipboard',
    inactive: 'clipboard-outline',
  },
  Account: {
    active: 'person',
    inactive: 'person-outline',
  },
} as const;

export const AppTabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const rootNavigation = useNavigation<RootNavigation>();
  const { profile } = useAuth();

  const isAdmin = profile?.role === 'ADMIN';

  const handleCreate = () => {
    rootNavigation.navigate('CreateWorkOrder');
  };

  return (
    <View style={styles.wrapper}>
      {isAdmin ? (
        <View
          style={[
            styles.fabContainer,
            {
              bottom: 76 + Math.max(insets.bottom, 8),
            },
          ]}
          pointerEvents="box-none"
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create work order"
            style={({ pressed }) => [
              styles.fab,
              pressed && styles.fabPressed,
            ]}
            onPress={handleCreate}
          >
            <Ionicons
              name="add"
              size={30}
              color={colors.textInverse}
            />
          </Pressable>
        </View>
      ) : null}

      <View
        style={[
          styles.tabBar,
          {
            paddingBottom: Math.max(insets.bottom, 8),
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const descriptor = descriptors[route.key];
          const options = descriptor.options;
          const isFocused = state.index === index;

          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : typeof options.title === 'string'
                ? options.title
                : route.name;

          const iconConfig =
            tabIcons[route.name as keyof typeof tabIcons];

          const iconName = iconConfig
            ? isFocused
              ? iconConfig.active
              : iconConfig.inactive
            : 'ellipse-outline';

          const color = isFocused
            ? colors.primary
            : colors.textMuted;

          const handlePress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const handleLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{
                selected: isFocused,
              }}
              accessibilityLabel={
                options.tabBarAccessibilityLabel ?? label
              }
              onPress={handlePress}
              onLongPress={handleLongPress}
              style={({ pressed }) => [
                styles.tab,
                pressed && styles.tabPressed,
              ]}
            >
              <View
                style={[
                  styles.iconContainer,
                  isFocused && styles.iconContainerActive,
                ]}
              >
                <Ionicons
                  name={iconName}
                  size={22}
                  color={color}
                />
              </View>

              <Text
                style={[
                  styles.tabLabel,
                  {
                    color,
                  },
                  isFocused && styles.tabLabelActive,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.surface,
  },

  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },

  tab: {
    flex: 1,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radius.lg,
  },

  tabPressed: {
    opacity: 0.7,
  },

  iconContainer: {
    minWidth: 56,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },

  iconContainerActive: {
    backgroundColor: colors.primarySoft,
  },

  tabLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },

  tabLabelActive: {
    fontWeight: typography.fontWeight.bold,
  },

  fabContainer: {
    position: 'absolute',
    right: spacing.xl,
    zIndex: 10,
    elevation: 10,
  },

  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
  },

  fabPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
});
