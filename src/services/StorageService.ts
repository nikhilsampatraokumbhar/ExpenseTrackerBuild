import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User, Transaction, Group, GroupTransaction, Split,
  TrackerType, ParsedTransaction,
} from '../models/types';
import { generateId } from '../utils/helpers';
import { buildDescription } from './TransactionParser';

const KEYS = {
  USER: '@et_user',
  TRANSACTIONS: '@et_transactions',
  GROUPS: '@et_groups',
  GROUP_TRANSACTIONS: (groupId: string) => `@et_group_txns_${groupId}`,
};

// ─── User ────────────────────────────────────────────────────────────────────

export async function getOrCreateUser(): Promise<User> {
  const raw = await AsyncStorage.getItem(KEYS.USER);
  if (raw) return JSON.parse(raw);

  const user: User = {
    id: generateId(),
    displayName: 'User',
    phone: '',
    createdAt: Date.now(),
  };
  await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
  return user;
}

export async function updateUserProfile(data: Partial<User>): Promise<User> {
  const user = await getOrCreateUser();
  const updated = { ...user, ...data };
  await AsyncStorage.setItem(KEYS.USER, JSON.stringify(updated));
  return updated;
}

// ─── Transactions ────────────────────────────────────────────────────────────

async function getAllTransactions(): Promise<Transaction[]> {
  const raw = await AsyncStorage.getItem(KEYS.TRANSACTIONS);
  return raw ? JSON.parse(raw) : [];
}

async function saveAllTransactions(txns: Transaction[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(txns));
}

export async function saveTransaction(
  parsed: ParsedTransaction,
  trackerType: TrackerType,
  userId: string,
  groupId?: string,
): Promise<Transaction> {
  const txn: Transaction = {
    id: generateId(),
    userId,
    amount: parsed.amount,
    description: buildDescription(parsed),
    merchant: parsed.merchant,
    source: parsed.bank || 'Bank',
    rawMessage: parsed.rawMessage,
    trackerType,
    groupId,
    timestamp: parsed.timestamp,
    createdAt: Date.now(),
  };

  const all = await getAllTransactions();
  all.unshift(txn);
  await saveAllTransactions(all);
  return txn;
}

export async function getTransactions(
  trackerType?: TrackerType,
  groupId?: string,
): Promise<Transaction[]> {
  const all = await getAllTransactions();
  return all.filter(t => {
    if (groupId) return t.groupId === groupId;
    if (trackerType) return t.trackerType === trackerType && !t.groupId;
    return true;
  });
}

export async function deleteTransaction(transactionId: string): Promise<void> {
  const all = await getAllTransactions();
  await saveAllTransactions(all.filter(t => t.id !== transactionId));
}

export async function getTransaction(transactionId: string): Promise<Transaction | null> {
  const all = await getAllTransactions();
  return all.find(t => t.id === transactionId) || null;
}

// ─── Groups ──────────────────────────────────────────────────────────────────

export async function getGroups(): Promise<Group[]> {
  const raw = await AsyncStorage.getItem(KEYS.GROUPS);
  return raw ? JSON.parse(raw) : [];
}

async function saveGroups(groups: Group[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.GROUPS, JSON.stringify(groups));
}

export async function createGroup(
  name: string,
  members: Array<{ displayName: string; phone: string }>,
  userId: string,
): Promise<Group> {
  const group: Group = {
    id: generateId(),
    name,
    members: [
      { userId, displayName: 'You', phone: '' },
      ...members.map(m => ({ userId: generateId(), ...m })),
    ],
    createdBy: userId,
    createdAt: Date.now(),
  };

  const groups = await getGroups();
  groups.push(group);
  await saveGroups(groups);
  return group;
}

export async function getGroup(groupId: string): Promise<Group | null> {
  const groups = await getGroups();
  return groups.find(g => g.id === groupId) || null;
}

// ─── Group Transactions ──────────────────────────────────────────────────────

export async function getGroupTransactions(groupId: string): Promise<GroupTransaction[]> {
  const raw = await AsyncStorage.getItem(KEYS.GROUP_TRANSACTIONS(groupId));
  return raw ? JSON.parse(raw) : [];
}

async function saveGroupTransactions(groupId: string, txns: GroupTransaction[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.GROUP_TRANSACTIONS(groupId), JSON.stringify(txns));
}

export async function addGroupTransaction(
  parsed: ParsedTransaction,
  groupId: string,
  userId: string,
): Promise<GroupTransaction> {
  const group = await getGroup(groupId);
  if (!group) throw new Error('Group not found');

  const splitAmount = Math.round((parsed.amount / group.members.length) * 100) / 100;

  const splits: Split[] = group.members.map(member => ({
    userId: member.userId,
    displayName: member.userId === userId ? 'You' : member.displayName,
    amount: splitAmount,
    settled: member.userId === userId, // payer is auto-settled
  }));

  const txn: GroupTransaction = {
    id: generateId(),
    groupId,
    addedBy: userId,
    amount: parsed.amount,
    description: buildDescription(parsed),
    merchant: parsed.merchant,
    timestamp: parsed.timestamp,
    splits,
  };

  const all = await getGroupTransactions(groupId);
  all.unshift(txn);
  await saveGroupTransactions(groupId, all);

  // Save only user's split amount to main transactions list (not the full group amount)
  const splitParsed = { ...parsed, amount: splitAmount };
  await saveTransaction(splitParsed, 'group', userId, groupId);

  return txn;
}

export async function settleSplit(
  groupId: string,
  transactionId: string,
  userId: string,
): Promise<void> {
  const all = await getGroupTransactions(groupId);
  const idx = all.findIndex(t => t.id === transactionId);
  if (idx === -1) return;

  const txn = { ...all[idx] };
  txn.splits = txn.splits.map(s =>
    s.userId === userId ? { ...s, settled: true } : s,
  );
  all[idx] = txn;
  await saveGroupTransactions(groupId, all);
}

// ─── Clear all data (for testing) ────────────────────────────────────────────

export async function clearAllData(): Promise<void> {
  const groups = await getGroups();
  const keys = [
    KEYS.USER,
    KEYS.TRANSACTIONS,
    KEYS.GROUPS,
    ...groups.map(g => KEYS.GROUP_TRANSACTIONS(g.id)),
  ];
  for (const key of keys) {
    await AsyncStorage.removeItem(key);
  }
}
