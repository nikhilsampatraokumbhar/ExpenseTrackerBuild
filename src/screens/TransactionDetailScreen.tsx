import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getTransaction, deleteTransaction } from '../services/StorageService';
import { Transaction } from '../models/types';
import { COLORS, formatCurrency, formatDate } from '../utils/helpers';

type Route = RouteProp<RootStackParamList, 'TransactionDetail'>;

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
      'Are you sure you want to delete this transaction?',
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

  const fields = [
    { label: 'Description', value: txn.description },
    txn.merchant ? { label: 'Merchant', value: txn.merchant } : null,
    { label: 'Date', value: formatDate(txn.timestamp) },
    { label: 'Source', value: txn.source },
    { label: 'Type', value: txn.trackerType },
  ].filter(Boolean);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Amount */}
      <View style={styles.amountCard}>
        <Text style={styles.amountLabel}>Amount</Text>
        <Text style={styles.amount}>{formatCurrency(txn.amount)}</Text>
      </View>

      {/* Details */}
      <View style={styles.detailCard}>
        {fields.map(field => (
          <View key={field!.label} style={styles.detailRow}>
            <Text style={styles.detailLabel}>{field!.label}</Text>
            <Text style={styles.detailValue}>{field!.value}</Text>
          </View>
        ))}
      </View>

      {/* Raw SMS */}
      {txn.rawMessage && (
        <View style={styles.smsCard}>
          <Text style={styles.smsLabel}>Original SMS</Text>
          <Text style={styles.smsText}>{txn.rawMessage}</Text>
        </View>
      )}

      {/* Delete button */}
      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Text style={styles.deleteBtnText}>🗑 Delete Transaction</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },
  amountCard: {
    backgroundColor: COLORS.danger,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  amountLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  amount: { color: '#fff', fontSize: 40, fontWeight: '800', marginTop: 4 },
  detailCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailLabel: { fontSize: 14, color: COLORS.textSecondary },
  detailValue: { fontSize: 14, fontWeight: '500', color: COLORS.text, flex: 1, textAlign: 'right' },
  smsCard: {
    backgroundColor: `${COLORS.warning}20`,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: `${COLORS.warning}40`,
  },
  smsLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 6 },
  smsText: { fontSize: 13, color: COLORS.text, lineHeight: 18 },
  deleteBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.danger,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  deleteBtnText: { color: COLORS.danger, fontWeight: '600', fontSize: 15 },
});
