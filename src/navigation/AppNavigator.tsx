import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import PersonalExpenseScreen from '../screens/PersonalExpenseScreen';
import ReimbursementScreen from '../screens/ReimbursementScreen';
import GroupListScreen from '../screens/GroupListScreen';
import GroupDetailScreen from '../screens/GroupDetailScreen';
import CreateGroupScreen from '../screens/CreateGroupScreen';
import TransactionDetailScreen from '../screens/TransactionDetailScreen';
import TrackerSettingsScreen from '../screens/TrackerSettingsScreen';

import { COLORS } from '../utils/helpers';

export type RootStackParamList = {
  MainTabs: undefined;
  GroupDetail: { groupId: string };
  CreateGroup: undefined;
  TransactionDetail: { transactionId: string };
  TrackerSettings: undefined;
};

export type TabParamList = {
  Home: undefined;
  Personal: undefined;
  Groups: undefined;
  Reimbursement: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: '🏠',
    Personal: '💳',
    Groups: '👥',
    Reimbursement: '🧾',
  };
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
      {icons[name] || '•'}
    </Text>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: { paddingBottom: 4 },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Personal" component={PersonalExpenseScreen} />
      <Tab.Screen name="Groups" component={GroupListScreen} />
      <Tab.Screen name="Reimbursement" component={ReimbursementScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="GroupDetail"
          component={GroupDetailScreen}
          options={{ title: 'Group', headerBackTitle: 'Back' }}
        />
        <Stack.Screen
          name="CreateGroup"
          component={CreateGroupScreen}
          options={{ title: 'New Group', presentation: 'modal' }}
        />
        <Stack.Screen
          name="TransactionDetail"
          component={TransactionDetailScreen}
          options={{ title: 'Transaction', presentation: 'modal' }}
        />
        <Stack.Screen
          name="TrackerSettings"
          component={TrackerSettingsScreen}
          options={{ title: 'Tracker Settings', presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
