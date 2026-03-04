import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGroups } from '../store/GroupContext';
import { useTracker } from '../store/TrackerContext';
import { useAuth } from '../store/AuthContext';
import { TrackerToggle } from '../components/TrackerToggle';
import { DebtSummaryCard } from '../components/DebtSummary';
import { GroupMemberCard } from '../components/GroupMemberCard';
import { GroupTransaction, Split, RootStackParamList } from '../models/types';
import { formatCurrency, formatDate, COLORS, getColorForId } from '../utils/helpers';

type RouteProps = RouteProp<RootStackParamList, 'GroupDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export function GroupDetailScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<Nav>();
  const { groupId } = route.params;
  const {
    groups,
    activeGroupTransactions,
    activeGroupDebts,
    loadGroupTransactions,
    settleSplit,
    updateGroupTransaction,
  } = useGroups();
  const { trackerState, toggleGroup } = useTracker();
  const { user } = useAuth();

  const group = groups.find(g => g.id === groupId);

  // Edit modal state
  const [editingTxn, setEditingTxn] = useState<GroupTransaction | null>(null);
  const [editSplits, setEditSplits] = useState<Split[]>([]);

  useEffect(() => {
    loadGroupTransactions(groupId);
  }, [groupId]);

  if (!group) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Group not found</Text>
      </View>
    );
  }

  const totalGroupSpent = activeGroupTransactions.reduce((sum, t) => sum + t.amount, 0);
  const isTracking = trackerState.activeGroupIds.includes(groupId);

  // ── Settle with confirmation ──────────────────────────────────────────────

  const handleSettlePress = (txn: GroupTransaction, split: Split) => {
    Alert.alert(
      'Confirm Settlement',
      `Mark ${split.displayName}'s share of ${formatCurrency(split.amount)} as paid?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => settleSplit(groupId, txn.id, split.userId),
        },
      ],
    );
  };

  // ── Edit transaction helpers ──────────────────────────────────────────────

  const openEdit = (txn: GroupTransaction) => {
    setEditingTxn(txn);
    setEditSplits(txn.splits.map(s => ({ ...s })));
  };

  const closeEdit = () => {
    setEditingTxn(null);
    setEditSplits([]);
  };

  const handleRemoveMember = (index: number) => {
    const remaining = editSplits.filter((_, i) => i !== index);
    if (remaining.length === 0) return; // must keep at least one
    // Redistribute evenly
    const totalAmount = editingTxn!.amount;
    const share = Math.round((totalAmount / remaining.length) * 100) / 100;
    const adjusted = remaining.map((s, i) => ({
      ...s,
      amount: i === remaining.length - 1
        ? Math.round((totalAmount - share * (remaining.length - 1)) * 100) / 100
        : share,
    }));
    setEditSplits(adjusted);
  };

  const handleSplitAmountChange = (index: number, value: string) => {
    const parsed = parseFloat(value);
    const updated = editSplits.map((s, i) =>
      i === index ? { ...s, amount: isNaN(parsed) ? 0 : parsed } : s,
    );
    setEditSplits(updated);
  };

  const handleSaveEdit = async () => {
    if (!editingTxn) return;
    const total = editSplits.reduce((sum, s) => sum + s.amount, 0);
    const diff = Math.abs(total - editingTxn.amount);
    if (diff > 1) {
      Alert.alert(
        'Amount Mismatch',
        `Split total (${formatCurrency(total)}) doesn't match expense (${formatCurrency(editingTxn.amount)}). Adjust amounts or remove members to re-split.`,
      );
      return;
    }
    await updateGroupTransaction(groupId, editingTxn.id, editSplits);
    closeEdit();
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const renderTransaction = ({ item }: { item: GroupTransaction }) => {
    const payer = group.members.find(m => m.userId === item.addedBy);
    return (
      <View style={styles.txnCard}>
        <View style={styles.txnHeader}>
          <View style={[styles.txnIcon, { backgroundColor: getColorForId(item.addedBy) }]}>
            <Text style={styles.txnIconText}>
              {payer?.displayName?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
          <View style={styles.txnInfo}>
            <Text style={styles.txnDesc}>{item.description}</Text>
            <Text style={styles.txnMeta}>
              Paid by {payer?.displayName || 'Unknown'} · {formatDate(item.timestamp)}
            </Text>
          </View>
          <Text style={styles.txnAmount}>{formatCurrency(item.amount)}</Text>
          <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Splits */}
        <View style={styles.splitsContainer}>
          {item.splits.map((split, idx) => (
            <View key={idx} style={styles.splitRow}>
              <Text style={styles.splitName}>{split.displayName}</Text>
              <View style={styles.splitRight}>
                <Text style={styles.splitAmount}>
                  {formatCurrency(split.amount)}
                </Text>
                {split.settled ? (
                  <View style={styles.settledBadge}>
                    <Text style={styles.settledText}>Paid</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.settleButton}
                    onPress={() => handleSettlePress(item, split)}>
                    <Text style={styles.settleButtonText}>Settle</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={activeGroupTransactions}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <View>
            {/* Group info header */}
            <View style={styles.header}>
              <View
                style={[
                  styles.groupIcon,
                  { backgroundColor: getColorForId(groupId) },
                ]}>
                <Text style={styles.groupIconText}>
                  {group.name[0].toUpperCase()}
                </Text>
              </View>
              <Text style={styles.groupName}>{group.name}</Text>
              <Text style={styles.groupMeta}>
                {group.members.length} members · Total: {formatCurrency(totalGroupSpent)}
              </Text>
              <TouchableOpacity
                style={styles.summaryButton}
                onPress={() => navigation.navigate('GroupSummary', { groupId })}>
                <Text style={styles.summaryButtonText}>View Summary</Text>
              </TouchableOpacity>
            </View>

            {/* Tracker toggle */}
            <TrackerToggle
              label={`Track ${group.name}`}
              subtitle="Auto-detect & split new transactions"
              isActive={isTracking}
              color={COLORS.groupColor}
              onToggle={() => toggleGroup(groupId)}
            />

            {/* Debt summary */}
            <DebtSummaryCard
              debts={activeGroupDebts}
              currentUserId={user?.id || ''}
              groupId={groupId}
            />

            {/* Members */}
            <Text style={styles.sectionTitle}>Members</Text>
            {group.members.map((member, idx) => (
              <GroupMemberCard
                key={idx}
                member={member}
                debts={activeGroupDebts}
                currentUserId={user?.id || ''}
              />
            ))}

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
              Transactions
            </Text>
          </View>
        }
        renderItem={renderTransaction}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptySubtitle}>
              {isTracking
                ? 'Waiting for bank SMS to auto-add...'
                : 'Enable tracking to auto-detect expenses'}
            </Text>
          </View>
        }
      />

      {/* Edit Transaction Modal */}
      <Modal
        visible={!!editingTxn}
        animationType="slide"
        transparent
        onRequestClose={closeEdit}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Split</Text>
              <Text style={styles.modalSubtitle}>
                Total: {editingTxn ? formatCurrency(editingTxn.amount) : ''}
              </Text>
            </View>

            <ScrollView style={styles.modalBody}>
              {editSplits.map((split, idx) => (
                <View key={idx} style={styles.editRow}>
                  <View style={[styles.editAvatar, { backgroundColor: getColorForId(split.userId || split.displayName) }]}>
                    <Text style={styles.editAvatarText}>
                      {split.displayName[0].toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.editName}>{split.displayName}</Text>
                  <TextInput
                    style={styles.editAmountInput}
                    keyboardType="decimal-pad"
                    value={split.amount.toString()}
                    onChangeText={v => handleSplitAmountChange(idx, v)}
                  />
                  {editSplits.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => handleRemoveMember(idx)}>
                      <Text style={styles.removeBtnText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <Text style={styles.editNote}>
                Removing a member re-splits equally among remaining members.
              </Text>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={closeEdit}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveEdit}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.danger,
    textAlign: 'center',
    marginTop: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  groupIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  groupIconText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  groupName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  groupMeta: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  txnCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 10,
    padding: 14,
    elevation: 1,
  },
  txnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txnIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  txnIconText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  txnInfo: {
    flex: 1,
  },
  txnDesc: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  txnMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  txnAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.danger,
    marginRight: 8,
  },
  editBtn: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  splitsContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  splitName: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  splitRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  splitAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: 8,
  },
  settledBadge: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  settledText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.success,
  },
  settleButton: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  settleButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  summaryButton: {
    marginTop: 10,
    backgroundColor: COLORS.primary + '15',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  summaryButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 6,
  },
  // ── Edit Modal ──────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  modalSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  modalBody: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  editAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  editAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  editName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  editAmountInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    width: 80,
    textAlign: 'right',
    backgroundColor: COLORS.background,
  },
  removeBtn: {
    marginLeft: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.danger + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.danger,
  },
  editNote: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
