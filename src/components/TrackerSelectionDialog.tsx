import React from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet, FlatList,
} from 'react-native';
import { ActiveTracker, ParsedTransaction } from '../models/types';
import { COLORS, formatCurrency } from '../utils/helpers';

interface Props {
  visible: boolean;
  transaction: ParsedTransaction | null;
  trackers: ActiveTracker[];
  onSelect: (tracker: ActiveTracker) => void;
  onIgnore: () => void;
}

const TRACKER_COLORS: Record<string, string> = {
  personal: COLORS.personalColor,
  reimbursement: COLORS.reimbursementColor,
  group: COLORS.groupColor,
};

export default function TrackerSelectionDialog({
  visible, transaction, trackers, onSelect, onIgnore,
}: Props) {
  if (!transaction) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>💰 {formatCurrency(transaction.amount)} debited</Text>
          <Text style={styles.subtitle}>
            {transaction.merchant || transaction.bank || 'Bank transaction'}
          </Text>
          <Text style={styles.question}>Add to which tracker?</Text>

          {trackers.map(tracker => {
            const color = TRACKER_COLORS[tracker.type] || COLORS.primary;
            return (
              <TouchableOpacity
                key={tracker.id}
                style={[styles.option, { borderColor: color }]}
                onPress={() => onSelect(tracker)}
              >
                <View style={[styles.optionDot, { backgroundColor: color }]} />
                <Text style={[styles.optionText, { color }]}>{tracker.label}</Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity style={styles.ignoreBtn} onPress={onIgnore}>
            <Text style={styles.ignoreText}>❌ Ignore this transaction</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: 4 },
  question: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginVertical: 16 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  optionDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  optionText: { fontSize: 16, fontWeight: '600' },
  ignoreBtn: { marginTop: 8, alignItems: 'center', padding: 12 },
  ignoreText: { fontSize: 15, color: COLORS.textSecondary },
});
