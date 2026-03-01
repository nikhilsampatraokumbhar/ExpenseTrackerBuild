export interface User {
  id: string;
  displayName: string;
  phone: string;
  email?: string;
  createdAt: number;
}

export type TrackerType = 'personal' | 'group' | 'reimbursement';

export interface TrackerState {
  personal: boolean;
  reimbursement: boolean;
  activeGroupIds: string[];
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  description: string;
  merchant?: string;
  category?: string;
  source: string;
  rawMessage?: string;
  trackerType: TrackerType;
  groupId?: string;
  timestamp: number;
  createdAt: number;
}

export interface GroupMember {
  userId: string;
  displayName: string;
  phone: string;
}

export interface Group {
  id: string;
  name: string;
  members: GroupMember[];
  createdBy: string;
  createdAt: number;
}

export interface Split {
  userId: string;
  displayName: string;
  amount: number;
  settled: boolean;
}

export interface GroupTransaction {
  id: string;
  groupId: string;
  addedBy: string;
  amount: number;
  description: string;
  merchant?: string;
  timestamp: number;
  splits: Split[];
}

export interface Debt {
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toName: string;
  amount: number;
}

export interface ParsedTransaction {
  amount: number;
  type: 'debit' | 'credit';
  merchant?: string;
  bank?: string;
  cardLast4?: string;
  upiId?: string;
  rawMessage: string;
  timestamp: number;
}

export interface ActiveTracker {
  type: TrackerType;
  id: string;
  label: string;
}
