import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type {
  AppTabParamList,
  RootStackParamList,
} from '../navigation/types';

export type WorkOrdersScreenProps = CompositeScreenProps<
  BottomTabScreenProps<AppTabParamList, 'Orders'>,
  NativeStackScreenProps<RootStackParamList, 'AppTabs'>
>;