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
        <View style={styles.settledRow}>
          <View style={styles.settledDot} />
          <Text style={styles.settled}>All settled up</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>SETTLEMENTS</Text>
      {debts.map((debt, i) => {
        const isUserOwing = debt.fromUserId === currentUserId;
        const isUserOwed = debt.toUserId === currentUserId;
        const color = isUserOwing ? COLORS.danger : isUserOwed ? COLORS.success : COLORS.textSecondary;

        return (
          <View key={i} style={styles.row}>
            <View style={styles.nameWrap}>
              <Text style={[styles.name, isUserOwing && { color: COLORS.danger }]}>
                {debt.fromUserId === currentUserId ? 'You' : debt.fromName}
              </Text>
              <Text style={styles.owes}>owes</Text>
              <Text style={[styles.name, isUserOwed && { color: COLORS.success }]}>
                {debt.toUserId === currentUserId ? 'You' : debt.toName}
              </Text>
            </View>
            <Text style={[styles.amount, { color }]}>{formatCurrency(debt.amount)}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  settledRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  settledDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: 8,
  },
  settled: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.success,
  },
  title: {
    fontSize: 10,
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
    fontWeight: '700',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  nameWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  owes: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  amount: {
    fontSize: 14,
    fontWeight: '800',
  },
});
