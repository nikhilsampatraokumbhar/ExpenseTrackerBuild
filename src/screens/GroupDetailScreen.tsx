import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useGroups } from '../store/GroupContext';
import { useTracker } from '../store/TrackerContext';
import { useAuth } from '../store/AuthContext';
import { getGroup } from '../services/StorageService';
import { Group } from '../models/types';
import TrackerToggle from '../components/TrackerToggle';
import DebtSummary from '../components/DebtSummary';
import GroupMemberCard from '../components/GroupMemberCard';
import { COLORS, formatCurrency, formatDate, getColorForId } from '../utils/helpers';

type Route = RouteProp<RootStackParamList, 'GroupDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function GroupDetailScreen() {
  const route = useRoute<Route>();
  const nav = useNavigation<Nav>();
  const { groupId } = route.params;
  const { user } = useAuth();
  const { activeGroupTransactions, activeGroupDebts, loadGroupTransactions, settleSplit, groups } = useGroups();
  const { trackerState, toggleGroup } = useTracker();

  const [group, setGroup] = useState<Group | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const g = await getGroup(groupId);
    setGroup(g);
    await loadGroupTransactions(groupId);
  }, [groupId, loadGroupTransactions]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  if (!group) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const isTracking = trackerState.activeGroupIds.includes(groupId);
  const totalSpent = activeGroupTransactions.reduce((s, t) => s + t.amount, 0);
  const groupColor = getColorForId(group.id);
  const userId = user?.id || '';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Group header */}
      <View style={[styles.header, { backgroundColor: `${groupColor}15` }]}>
        <View style={[styles.groupIcon, { backgroundColor: `${groupColor}30` }]}>
          <Text style={[styles.groupInitial, { color: groupColor }]}>
            {group.name[0].toUpperCase()}
          </Text>
        </View>
        <Text style={styles.groupName}>{group.name}</Text>
        <Text style={styles.groupMeta}>
          {group.members.length} members · {formatCurrency(totalSpent)} total
        </Text>
      </View>

      {/* Tracker toggle */}
      <TrackerToggle
        label="Track for this group"
        subtitle="Auto-detect payments and split"
        isActive={isTracking}
        onToggle={() => toggleGroup(groupId)}
        color={COLORS.groupColor}
      />

      {/* Debt summary */}
      <DebtSummary debts={activeGroupDebts} currentUserId={userId} />

      {/* Members */}
      <Text style={styles.sectionTitle}>Members</Text>
      {group.members.map(member => (
        <GroupMemberCard
          key={member.userId}
          member={member}
          debts={activeGroupDebts}
          currentUserId={userId}
        />
      ))}

      {/* Transactions */}
      <Text style={styles.sectionTitle}>Transactions</Text>
      {activeGroupTransactions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No group transactions yet</Text>
        </View>
      ) : (
        activeGroupTransactions.map(txn => (
          <View key={txn.id} style={styles.txnCard}>
            <View style={styles.txnHeader}>
              <Text style={styles.txnDesc} numberOfLines={1}>{txn.description}</Text>
              <Text style={styles.txnAmount}>{formatCurrency(txn.amount)}</Text>
            </View>
            <Text style={styles.txnDate}>{formatDate(txn.timestamp)}</Text>

            {/* Splits */}
            <View style={styles.splitsContainer}>
              {txn.splits.map(split => (
                <View key={split.userId} style={styles.splitRow}>
                  <Text style={styles.splitName}>
                    {split.userId === userId ? 'You' : split.displayName}
                  </Text>
                  <Text style={styles.splitAmount}>{formatCurrency(split.amount)}</Text>
                  {split.settled ? (
                    <Text style={styles.settled}>✓ Settled</Text>
                  ) : split.userId !== txn.addedBy && (
                    <TouchableOpacity
                      style={styles.settleBtn}
                      onPress={() => settleSplit(groupId, txn.id, split.userId)}
                    >
                      <Text style={styles.settleBtnText}>Settle</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  groupIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  groupInitial: { fontSize: 32, fontWeight: '800' },
  groupName: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  groupMeta: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  sectionTitle: {
    fontSize: 16, fontWeight: '700', color: COLORS.text,
    marginBottom: 10, marginTop: 16, paddingHorizontal: 16,
  },
  empty: { alignItems: 'center', padding: 24 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary },
  txnCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  txnHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  txnDesc: { fontSize: 15, fontWeight: '600', color: COLORS.text, flex: 1 },
  txnAmount: { fontSize: 15, fontWeight: '700', color: COLORS.danger },
  txnDate: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2, marginBottom: 10 },
  splitsContainer: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10 },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  splitName: { flex: 1, fontSize: 13, color: COLORS.text },
  splitAmount: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginRight: 10 },
  settled: { fontSize: 12, color: COLORS.success, fontWeight: '600' },
  settleBtn: {
    backgroundColor: `${COLORS.success}20`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  settleBtnText: { fontSize: 12, color: COLORS.success, fontWeight: '700' },
});
