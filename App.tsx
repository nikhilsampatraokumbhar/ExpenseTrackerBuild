import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

import { AuthProvider, useAuth } from './src/store/AuthContext';
import { GroupProvider, useGroups } from './src/store/GroupContext';
import { TrackerProvider } from './src/store/TrackerContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { registerBackgroundHandler } from './src/services/NotificationService';
import { COLORS } from './src/utils/helpers';

// Must be called at top level for background notifications
registerBackgroundHandler();

function AppContent() {
  const { user, loading } = useAuth();
  const { groups } = useGroups();

  if (loading || !user) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <TrackerProvider groups={groups} userId={user.id}>
      <AppNavigator />
    </TrackerProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <GroupProvider>
        <AppContent />
      </GroupProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
