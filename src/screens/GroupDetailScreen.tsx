import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primary}
          colors={[COLORS.primary]}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Group header */}
      <LinearGradient
        colors={[`${groupColor}25`, COLORS.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}
      >
        <View style={[styles.groupIcon, { backgroundColor: `${groupColor}30` }]}>
          <Text style={[styles.groupInitial, { color: groupColor }]}>
            {group.name[0].toUpperCase()}
          </Text>
        </View>
        <Text style={styles.groupName}>{group.name}</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Text style={styles.metaChipText}>
              {group.members.length} members
            </Text>
          </View>
          <View style={[styles.metaChip, { backgroundColor: `${groupColor}20` }]}>
            <Text style={[styles.metaChipText, { color: groupColor }]}>
              {formatCurrency(totalSpent)} total
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Tracker toggle */}
      <TrackerToggle
        label="Track for this group"
        subtitle="Auto-detect payments and split equally"
        isActive={isTracking}
        onToggle={() => toggleGroup(groupId)}
        color={COLORS.groupColor}
      />

      {/* Debt summary */}
      <DebtSummary debts={activeGroupDebts} currentUserId={userId} />

      {/* Members */}
      <Text style={styles.sectionTitle}>MEMBERS</Text>
      {group.members.map(member => (
        <GroupMemberCard
          key={member.userId}
          member={member}
          debts={activeGroupDebts}
          currentUserId={userId}
        />
      ))}

      {/* Transactions */}
      <Text style={styles.sectionTitle}>
        EXPENSES ({activeGroupTransactions.length})
      </Text>

      {activeGroupTransactions.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyEmoji}>💸</Text>
          </View>
          <Text style={styles.emptyText}>No group expenses yet</Text>
          <Text style={styles.emptySubtext}>
            Enable tracking above and make a payment to see it here
          </Text>
        </View>
      ) : (
        activeGroupTransactions.map(txn => (
          <View key={txn.id} style={styles.txnCard}>
            {/* Transaction header */}
            <View style={styles.txnHeader}>
              <View style={[styles.txnIcon, { backgroundColor: `${groupColor}20` }]}>
                <Text style={[styles.txnIconText, { color: groupColor }]}>
                  {(txn.merchant || txn.description)[0].toUpperCase()}
                </Text>
              </View>
              <View style={styles.txnInfo}>
                <Text style={styles.txnDesc} numberOfLines={1}>{txn.description}</Text>
                <Text style={styles.txnDate}>{formatDate(txn.timestamp)}</Text>
              </View>
              <Text style={styles.txnAmount}>{formatCurrency(txn.amount)}</Text>
            </View>

            {/* Split label */}
            <View style={styles.splitHeader}>
              <Text style={styles.splitHeaderText}>
                Split {txn.splits.length} ways · {formatCurrency(txn.splits[0]?.amount || 0)} each
              </Text>
            </View>

            {/* Splits */}
            {txn.splits.map(split => (
              <View key={split.userId} style={styles.splitRow}>
                <View style={styles.splitLeft}>
                  <View style={[
                    styles.splitAvatar,
                    { backgroundColor: `${getColorForId(split.userId)}25` },
                  ]}>
                    <Text style={[styles.splitAvatarText, { color: getColorForId(split.userId) }]}>
                      {split.displayName[0].toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.splitName}>
                      {split.userId === userId ? 'You' : split.displayName}
                    </Text>
                    <Text style={styles.splitAmt}>{formatCurrency(split.amount)}</Text>
                  </View>
                </View>
                {split.settled ? (
                  <View style={styles.settledBadge}>
                    <Text style={styles.settledText}>Settled</Text>
                  </View>
                ) : split.userId !== txn.addedBy ? (
                  <TouchableOpacity
                    style={styles.settleBtn}
                    onPress={() => settleSplit(groupId, txn.id, split.userId)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.settleBtnText}>Mark Settled</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.payerBadge}>
                    <Text style={styles.payerText}>Paid</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        ))
      )}

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },

  header: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 4,
  },
  groupIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  groupInitial: { fontSize: 32, fontWeight: '800' },
  groupName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  metaRow: { flexDirection: 'row', gap: 8 },
  metaChip: {
    backgroundColor: COLORS.surfaceHigh,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metaChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 10,
    marginTop: 16,
    paddingHorizontal: 16,
  },

  empty: { alignItems: 'center', padding: 40 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyEmoji: { fontSize: 28 },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  emptySubtext: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },

  txnCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  txnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  txnIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txnIconText: { fontSize: 16, fontWeight: '800' },
  txnInfo: { flex: 1 },
  txnDesc: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  txnDate: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  txnAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.danger,
  },
  splitHeader: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: COLORS.surfaceHigh,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  splitHeaderText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  splitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  splitAvatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  splitAvatarText: { fontSize: 13, fontWeight: '800' },
  splitName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  splitAmt: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  settledBadge: {
    backgroundColor: `${COLORS.success}18`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: `${COLORS.success}30`,
  },
  settledText: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: '700',
  },
  settleBtn: {
    backgroundColor: COLORS.surfaceHigher,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${COLORS.primary}40`,
  },
  settleBtnText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
  },
  payerBadge: {
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: `${COLORS.primary}30`,
  },
  payerText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
  },
});
