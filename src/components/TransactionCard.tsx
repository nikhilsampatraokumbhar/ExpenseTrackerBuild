import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Transaction } from '../models/types';
import { formatCurrency, formatDate, COLORS } from '../utils/helpers';

interface Props {
  transaction: Transaction;
  onPress?: () => void;
  showBadge?: boolean;
}

const TRACKER_COLORS: Record<string, string> = {
  personal: COLORS.personalColor,
  reimbursement: COLORS.reimbursementColor,
  group: COLORS.groupColor,
};

export default function TransactionCard({ transaction, onPress, showBadge }: Props) {
  const color = TRACKER_COLORS[transaction.trackerType] || COLORS.primary;
  const initial = (transaction.merchant || transaction.description)[0].toUpperCase();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.icon, { backgroundColor: `${color}20` }]}>
        <Text style={[styles.iconText, { color }]}>{initial}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.desc} numberOfLines={1}>{transaction.description}</Text>
        <Text style={styles.date}>{formatDate(transaction.timestamp)}</Text>
      </View>
      <View style={styles.right}>
        {showBadge && (
          <View style={[styles.badge, { backgroundColor: `${color}20` }]}>
            <Text style={[styles.badgeText, { color }]}>{transaction.trackerType}</Text>
          </View>
        )}
        <Text style={styles.amount}>{formatCurrency(transaction.amount)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: { fontSize: 18, fontWeight: '700' },
  info: { flex: 1 },
  desc: { fontSize: 14, fontWeight: '500', color: COLORS.text },
  date: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  amount: { fontSize: 15, fontWeight: '700', color: COLORS.danger },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
  },
  badgeText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
});
