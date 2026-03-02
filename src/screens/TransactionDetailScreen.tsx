import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getTransaction, deleteTransaction } from '../services/StorageService';
import { Transaction } from '../models/types';
import { COLORS, formatCurrency, formatDate } from '../utils/helpers';

type Route = RouteProp<RootStackParamList, 'TransactionDetail'>;

const TRACKER_COLORS: Record<string, string> = {
  personal: COLORS.personalColor,
  reimbursement: COLORS.reimbursementColor,
  group: COLORS.groupColor,
};

export default function TransactionDetailScreen() {
  const route = useRoute<Route>();
  const nav = useNavigation();
  const { transactionId } = route.params;
  const [txn, setTxn] = useState<Transaction | null>(null);

  useEffect(() => {
    (async () => {
      const t = await getTransaction(transactionId);
      setTxn(t);
    })();
  }, [transactionId]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteTransaction(transactionId);
            nav.goBack();
          },
        },
      ],
    );
  };

  if (!txn) return null;

  const accentColor = TRACKER_COLORS[txn.trackerType] || COLORS.primary;

  const fields = [
    { label: 'Description', value: txn.description },
    txn.merchant ? { label: 'Merchant', value: txn.merchant } : null,
    { label: 'Date', value: formatDate(txn.timestamp) },
    { label: 'Source', value: txn.source },
    { label: 'Tracker', value: txn.trackerType.charAt(0).toUpperCase() + txn.trackerType.slice(1) },
  ].filter(Boolean);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Amount hero */}
      <LinearGradient
        colors={['#1A0A0C', COLORS.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.amountCard}
      >
        <View style={[styles.amountAccent, { backgroundColor: COLORS.danger }]} />
        <Text style={styles.amountLabel}>DEBITED</Text>
        <Text style={styles.amount}>{formatCurrency(txn.amount)}</Text>
        <View style={[styles.trackerBadge, { backgroundColor: `${accentColor}20`, borderColor: `${accentColor}40` }]}>
          <Text style={[styles.trackerBadgeText, { color: accentColor }]}>
            {txn.trackerType.toUpperCase()}
          </Text>
        </View>
      </LinearGradient>

      {/* Detail rows */}
      <View style={styles.detailCard}>
        {fields.map((field, idx) => (
          <View
            key={field!.label}
            style={[
              styles.detailRow,
              idx === fields.length - 1 && styles.detailRowLast,
            ]}
          >
            <Text style={styles.detailLabel}>{field!.label}</Text>
            <Text style={styles.detailValue} numberOfLines={2}>{field!.value}</Text>
          </View>
        ))}
      </View>

      {/* Raw SMS */}
      {txn.rawMessage && (
        <View style={styles.smsCard}>
          <Text style={styles.smsLabel}>ORIGINAL SMS</Text>
          <Text style={styles.smsText}>{txn.rawMessage}</Text>
        </View>
      )}

      {/* Delete button */}
      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.7}>
        <Text style={styles.deleteBtnText}>Delete Transaction</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },

  amountCard: {
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    alignItems: 'center',
    paddingBottom: 24,
  },
  amountAccent: {
    alignSelf: 'stretch',
    height: 2,
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: 8,
  },
  amount: {
    fontSize: 42,
    fontWeight: '800',
    color: COLORS.danger,
    letterSpacing: -1,
    marginBottom: 14,
  },
  trackerBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  trackerBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  detailCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailRowLast: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },

  smsCard: {
    backgroundColor: COLORS.surfaceHigh,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  smsLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  smsText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
    fontFamily: 'monospace',
  },

  deleteBtn: {
    borderWidth: 1,
    borderColor: `${COLORS.danger}40`,
    backgroundColor: `${COLORS.danger}10`,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: COLORS.danger,
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3,
  },
});
