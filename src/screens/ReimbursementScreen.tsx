import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTracker } from '../store/TrackerContext';
import { getTransactions } from '../services/StorageService';
import { Transaction } from '../models/types';
import TrackerToggle from '../components/TrackerToggle';
import TransactionCard from '../components/TransactionCard';
import { COLORS, formatCurrency } from '../utils/helpers';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ReimbursementScreen() {
  const nav = useNavigation<Nav>();
  const { trackerState, toggleReimbursement } = useTracker();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const txns = await getTransactions('reimbursement');
    setTransactions(txns.sort((a, b) => b.timestamp - a.timestamp));
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const total = transactions.reduce((s, t) => s + t.amount, 0);

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={() => (
        <>
          <TrackerToggle
            label="Reimbursement"
            subtitle="Track office/business expenses"
            isActive={trackerState.reimbursement}
            onToggle={toggleReimbursement}
            color={COLORS.reimbursementColor}
          />
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total Reimbursable</Text>
            <Text style={styles.totalAmount}>{formatCurrency(total)}</Text>
            <Text style={styles.totalCount}>{transactions.length} expenses</Text>
          </View>
          <Text style={styles.sectionTitle}>All Expenses</Text>
          {transactions.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🧾</Text>
              <Text style={styles.emptyText}>
                {trackerState.reimbursement
                  ? 'No reimbursement expenses yet.'
                  : 'Enable the tracker to start logging office expenses.'}
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
  totalCard: {
    backgroundColor: COLORS.reimbursementColor,
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
  },
  totalLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  totalAmount: { color: '#fff', fontSize: 28, fontWeight: '800', marginTop: 4 },
  totalCount: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  empty: { alignItems: 'center', padding: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
});
