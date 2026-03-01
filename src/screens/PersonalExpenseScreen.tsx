import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTracker } from '../store/TrackerContext';
import { getTransactions } from '../services/StorageService';
import { Transaction } from '../models/types';
import TrackerToggle from '../components/TrackerToggle';
import TransactionCard from '../components/TransactionCard';
import { COLORS, formatCurrency } from '../utils/helpers';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function PersonalExpenseScreen() {
  const nav = useNavigation<Nav>();
  const { trackerState, togglePersonal } = useTracker();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const txns = await getTransactions('personal');
    setTransactions(txns.sort((a, b) => b.timestamp - a.timestamp));
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const thisMonth = (() => {
    const now = new Date();
    return transactions.filter(t => {
      const d = new Date(t.timestamp);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  })();

  const totalMonthly = thisMonth.reduce((s, t) => s + t.amount, 0);
  const totalAll = transactions.reduce((s, t) => s + t.amount, 0);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={() => (
        <>
          <TrackerToggle
            label="Personal Expenses"
            subtitle="Track daily spending from SMS"
            isActive={trackerState.personal}
            onToggle={togglePersonal}
            color={COLORS.personalColor}
          />
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{formatCurrency(totalMonthly)}</Text>
              <Text style={styles.statLabel}>This Month</Text>
              <Text style={styles.statCount}>{thisMonth.length} transactions</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{formatCurrency(totalAll)}</Text>
              <Text style={styles.statLabel}>All Time</Text>
              <Text style={styles.statCount}>{transactions.length} transactions</Text>
            </View>
          </View>
          <Text style={styles.sectionTitle}>All Transactions</Text>
          {transactions.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>💳</Text>
              <Text style={styles.emptyText}>
                {trackerState.personal
                  ? 'No personal expenses tracked yet.\nMake a payment to see it here.'
                  : 'Enable the tracker above to start tracking expenses.'}
              </Text>
            </View>
          )}
        </>
      )}
      data={transactions}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <TransactionCard
          transaction={item}
          onPress={() => nav.navigate('TransactionDetail', { transactionId: item.id })}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statsRow: { flexDirection: 'row', gap: 10, marginVertical: 16 },
  statCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 16, borderWidth: 1, borderColor: COLORS.border,
  },
  statValue: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  statCount: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  empty: { alignItems: 'center', padding: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
});
