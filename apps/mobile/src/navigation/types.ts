
import type { NavigatorScreenParams } from '@react-navigation/native';

export type AppTabParamList = {
  Home: undefined;
  Orders: undefined;
  Account: undefined;
};

export type RootStackParamList = {
  Login: undefined;

  AppTabs: NavigatorScreenParams<AppTabParamList>;

  WorkOrderDetail: {
    workOrderId: string;
  };

  CreateWorkOrder: undefined;
};
