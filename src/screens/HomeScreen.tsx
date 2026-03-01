import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../store/AuthContext';
import { useGroups } from '../store/GroupContext';
import { useTracker } from '../store/TrackerContext';
import { getTransactions } from '../services/StorageService';
import { Transaction } from '../models/types';
import TransactionCard from '../components/TransactionCard';
import ActiveTrackerBanner from '../components/ActiveTrackerBanner';
import TrackerSelectionDialog from '../components/TrackerSelectionDialog';
import TrackerToggle from '../components/TrackerToggle';
import { COLORS, formatCurrency } from '../utils/helpers';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const nav = useNavigation<Nav>();
  const { user } = useAuth();
  const { groups } = useGroups();
  const {
    trackerState, togglePersonal, toggleReimbursement, toggleGroup,
    getActiveTrackers, pendingTransaction, clearPendingTransaction, addTransactionToTracker,
  } = useTracker();

  const [recentTxns, setRecentTxns] = useState<Transaction[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const activeTrackers = getActiveTrackers(groups);

  const loadTransactions = useCallback(async () => {
    const all = await getTransactions();
    const sorted = all.sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);
    setRecentTxns(sorted);
    setTotalSpent(all.reduce((s, t) => s + t.amount, 0));
  }, []);

  useFocusEffect(useCallback(() => {
    loadTransactions();
  }, [loadTransactions]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={styles.container}>
      <ActiveTrackerBanner
        activeTrackers={activeTrackers}
        onManage={() => nav.navigate('TrackerSettings')}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting()},</Text>
          <Text style={styles.name}>{user?.displayName || 'User'}</Text>
        </View>

        {/* Total card */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Spent</Text>
          <Text style={styles.totalAmount}>{formatCurrency(totalSpent)}</Text>
        </View>

        {/* Quick toggles */}
        <Text style={styles.sectionTitle}>Quick Trackers</Text>
        <TrackerToggle
          label="Personal Expenses"
          subtitle="Daily spending"
          isActive={trackerState.personal}
          onToggle={togglePersonal}
          color={COLORS.personalColor}
        />
        <TrackerToggle
          label="Reimbursement"
          subtitle="Office expenses"
          isActive={trackerState.reimbursement}
          onToggle={toggleReimbursement}
          color={COLORS.reimbursementColor}
        />
        {groups.slice(0, 3).map(group => (
          <TrackerToggle
            key={group.id}
            label={group.name}
            subtitle={`${group.members.length} members`}
            isActive={trackerState.activeGroupIds.includes(group.id)}
            onToggle={() => toggleGroup(group.id)}
            color={COLORS.groupColor}
          />
        ))}

        {/* Recent transactions */}
        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
        </View>
        {recentTxns.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No transactions yet</Text>
            <Text style={styles.emptySubtext}>Enable a tracker and make a payment</Text>
          </View>
        ) : (
          recentTxns.map(t => (
            <TransactionCard
              key={t.id}
              transaction={t}
              showBadge
              onPress={() => nav.navigate('TransactionDetail', { transactionId: t.id })}
            />
          ))
        )}
      </ScrollView>

      {/* Tracker selection dialog */}
      <TrackerSelectionDialog
        visible={!!pendingTransaction}
        transaction={pendingTransaction}
        trackers={activeTrackers}
        onSelect={async tracker => {
          if (pendingTransaction) {
            await addTransactionToTracker(pendingTransaction, tracker.type, tracker.id);
            clearPendingTransaction();
            await loadTransactions();
          }
        }}
        onIgnore={clearPendingTransaction}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 16, paddingBottom: 32 },
  header: { marginBottom: 20 },
  greeting: { fontSize: 14, color: COLORS.textSecondary },
  name: { fontSize: 28, fontWeight: '700', color: COLORS.text },
  totalCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  totalLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  totalAmount: { color: '#fff', fontSize: 32, fontWeight: '800', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12, marginTop: 4 },
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  empty: { alignItems: 'center', padding: 32 },
  emptyText: { fontSize: 16, fontWeight: '600', color: COLORS.textSecondary },
  emptySubtext: { fontSize: 13, color: COLORS.textLight, marginTop: 6, textAlign: 'center' },
});
