import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Debt } from '../models/types';
import { COLORS, formatCurrency } from '../utils/helpers';

interface Props {
  debts: Debt[];
  currentUserId: string;
}

export default function DebtSummary({ debts, currentUserId }: Props) {
  if (debts.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.settled}>✅ All settled up!</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Settlements</Text>
      {debts.map((debt, i) => {
        const isCurrentUserOwing = debt.fromUserId === currentUserId;
        const isCurrentUserOwed = debt.toUserId === currentUserId;
        return (
          <View key={i} style={styles.row}>
            <Text
              style={[
                styles.name,
                isCurrentUserOwing && { color: COLORS.danger, fontWeight: '700' },
              ]}
            >
              {debt.fromUserId === currentUserId ? 'You' : debt.fromName}
            </Text>
            <Text style={styles.arrow}>→</Text>
            <Text style={styles.amount}>{formatCurrency(debt.amount)}</Text>
            <Text style={styles.arrow}>→</Text>
            <Text
              style={[
                styles.name,
                isCurrentUserOwed && { color: COLORS.success, fontWeight: '700' },
              ]}
            >
              {debt.toUserId === currentUserId ? 'You' : debt.toName}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  settled: { textAlign: 'center', fontSize: 16, fontWeight: '600', color: COLORS.success },
  title: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: { fontSize: 14, color: COLORS.text, flex: 1 },
  arrow: { fontSize: 14, color: COLORS.textSecondary, marginHorizontal: 8 },
  amount: { fontSize: 14, fontWeight: '700', color: COLORS.text },
});
