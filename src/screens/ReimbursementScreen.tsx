import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primary}
          colors={[COLORS.primary]}
        />
      }
      ListHeaderComponent={() => (
        <>
          <TrackerToggle
            label="Reimbursement"
            subtitle="Track office / business expenses"
            isActive={trackerState.reimbursement}
            onToggle={toggleReimbursement}
            color={COLORS.reimbursementColor}
          />

          <LinearGradient
            colors={['#200E12', '#0A0A0F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={[styles.heroAccent, { backgroundColor: COLORS.reimbursementColor }]} />
            <View style={styles.heroBody}>
              <View>
                <Text style={styles.heroLabel}>TOTAL REIMBURSABLE</Text>
                <Text style={[styles.heroAmount, { color: COLORS.reimbursementColor }]}>
                  {formatCurrency(total)}
                </Text>
              </View>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{transactions.length}</Text>
                <Text style={styles.countLabel}>expenses</Text>
              </View>
            </View>
          </LinearGradient>

          <Text style={styles.sectionTitle}>ALL EXPENSES</Text>

          {transactions.length === 0 && (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Text style={styles.emptyEmoji}>🧾</Text>
              </View>
              <Text style={styles.emptyText}>
                {trackerState.reimbursement
                  ? 'No reimbursement expenses yet'
                  : 'Enable the tracker to log office expenses'}
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

  heroCard: {
    borderRadius: 18,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  heroAccent: { height: 2 },
  heroBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  heroLabel: {
    fontSize: 9,
    color: COLORS.textSecondary,
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: 8,
  },
  heroAmount: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  countBadge: {
    alignItems: 'center',
    backgroundColor: COLORS.surfaceHigher,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  countText: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  countLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    marginTop: 2,
  },

  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyEmoji: { fontSize: 26 },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
