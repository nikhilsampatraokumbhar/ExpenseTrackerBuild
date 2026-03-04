import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Group, GroupTransaction, Debt, Split } from '../models/types';
import {
  subscribeToGroups,
  subscribeToGroupTransactions,
  createGroup as fbCreateGroup,
  settleSplit as fbSettleSplit,
  settleDebt as fbSettleDebt,
  updateGroupTransaction as fbUpdateGroupTransaction,
} from '../services/FirebaseService';
import { calculateDebts } from '../services/DebtCalculator';

interface GroupContextValue {
  groups: Group[];
  loading: boolean;
  createGroup: (name: string, members: { displayName: string; phone: string }[]) => Promise<string>;
  // For the currently viewed group
  activeGroupTransactions: GroupTransaction[];
  activeGroupDebts: Debt[];
  loadGroupTransactions: (groupId: string) => void;
  settleSplit: (groupId: string, transactionId: string, userId: string) => Promise<void>;
  settleDebt: (groupId: string, fromUserId: string, toUserId: string, amount: number) => Promise<void>;
  updateGroupTransaction: (groupId: string, transactionId: string, splits: Split[]) => Promise<void>;
}

const GroupContext = createContext<GroupContextValue>({} as GroupContextValue);

export function GroupProvider({ children }: { children: ReactNode }) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGroupTransactions, setActiveGroupTransactions] = useState<GroupTransaction[]>([]);
  const [activeGroupDebts, setActiveGroupDebts] = useState<Debt[]>([]);

  // Subscribe to user's groups
  useEffect(() => {
    const unsubscribe = subscribeToGroups(fetchedGroups => {
      setGroups(fetchedGroups);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const createGroup = async (
    name: string,
    members: { displayName: string; phone: string }[],
  ) => {
    return fbCreateGroup(name, members);
  };

  // Subscribe to a specific group's transactions and recalculate debts
  let groupTxnUnsubscribe: (() => void) | null = null;

  const loadGroupTransactions = (groupId: string) => {
    // Cleanup previous subscription
    groupTxnUnsubscribe?.();

    groupTxnUnsubscribe = subscribeToGroupTransactions(groupId, txns => {
      setActiveGroupTransactions(txns);
      setActiveGroupDebts(calculateDebts(txns));
    });
  };

  const settleSplit = async (
    groupId: string,
    transactionId: string,
    userId: string,
  ) => {
    await fbSettleSplit(groupId, transactionId, userId);
  };

  const settleDebt = async (
    groupId: string,
    fromUserId: string,
    toUserId: string,
    amount: number,
  ) => {
    await fbSettleDebt(groupId, fromUserId, toUserId, amount);
  };

  const updateGroupTransaction = async (
    groupId: string,
    transactionId: string,
    splits: Split[],
  ) => {
    await fbUpdateGroupTransaction(groupId, transactionId, splits);
  };

  return (
    <GroupContext.Provider
      value={{
        groups,
        loading,
        createGroup,
        activeGroupTransactions,
        activeGroupDebts,
        loadGroupTransactions,
        settleSplit,
        settleDebt,
        updateGroupTransaction,
      }}>
      {children}
    </GroupContext.Provider>
  );
}

export function useGroups() {
  return useContext(GroupContext);
}
