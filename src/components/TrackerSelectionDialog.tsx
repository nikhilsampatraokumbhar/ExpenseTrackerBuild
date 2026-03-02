import React from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ActiveTracker, ParsedTransaction } from '../models/types';
import { COLORS, formatCurrency } from '../utils/helpers';

interface Props {
  visible: boolean;
  transaction: ParsedTransaction | null;
  trackers: ActiveTracker[];
  onSelect: (tracker: ActiveTracker) => void;
  onIgnore: () => void;
}

const TRACKER_META: Record<string, { color: string; icon: string; desc: string }> = {
  personal:      { color: COLORS.personalColor,      icon: '💳', desc: 'Your personal expenses' },
  reimbursement: { color: COLORS.reimbursementColor, icon: '🧾', desc: 'Office / business' },
  group:         { color: COLORS.groupColor,         icon: '👥', desc: 'Split with group' },
};

export default function TrackerSelectionDialog({
  visible, transaction, trackers, onSelect, onIgnore,
}: Props) {
  if (!transaction) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Handle bar */}
          <View style={styles.handle} />

          {/* Amount display */}
          <LinearGradient
            colors={['#1E1A0A', COLORS.surface]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.amountCard}
          >
            <Text style={styles.amountLabel}>Amount Debited</Text>
            <Text style={styles.amount}>{formatCurrency(transaction.amount)}</Text>
            <Text style={styles.merchant} numberOfLines={1}>
              {transaction.merchant || transaction.bank || 'Bank transaction'}
            </Text>
          </LinearGradient>

          <Text style={styles.question}>Where should this go?</Text>

          {/* Tracker options */}
          {trackers.map(tracker => {
            const meta = TRACKER_META[tracker.type] || TRACKER_META.personal;
            return (
              <TouchableOpacity
                key={tracker.id}
                style={styles.option}
                onPress={() => onSelect(tracker)}
                activeOpacity={0.7}
              >
                <View style={[styles.optionAccent, { backgroundColor: meta.color }]} />
                <View style={[styles.optionIconWrap, { backgroundColor: `${meta.color}20` }]}>
                  <Text style={styles.optionIcon}>{meta.icon}</Text>
                </View>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionLabel}>{tracker.label}</Text>
                  <Text style={styles.optionDesc}>{meta.desc}</Text>
                </View>
                <View style={[styles.optionArrow, { borderColor: meta.color }]}>
                  <Text style={[styles.optionArrowText, { color: meta.color }]}>→</Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Ignore */}
          <TouchableOpacity style={styles.ignoreBtn} onPress={onIgnore} activeOpacity={0.6}>
            <Text style={styles.ignoreText}>Ignore this transaction</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 44,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginBottom: 20,
  },
  amountCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${COLORS.primary}30`,
  },
  amountLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  amount: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  merchant: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  question: {
    fontSize: 13,
    color: COLORS.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceHigh,
    borderRadius: 14,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionAccent: {
    width: 4,
    alignSelf: 'stretch',
  },
  optionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 12,
  },
  optionIcon: { fontSize: 20 },
  optionInfo: { flex: 1, paddingVertical: 14 },
  optionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  optionDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  optionArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionArrowText: { fontSize: 16, fontWeight: '700' },
  ignoreBtn: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 4,
  },
  ignoreText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
