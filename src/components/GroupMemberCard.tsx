import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GroupMember, Debt } from '../models/types';
import { COLORS, formatCurrency, getColorForId } from '../utils/helpers';

interface Props {
  member: GroupMember;
  debts: Debt[];
  currentUserId: string;
}

export default function GroupMemberCard({ member, debts, currentUserId }: Props) {
  const isCurrentUser = member.userId === currentUserId;

  const owesMe = debts
    .filter(d => d.fromUserId === member.userId && d.toUserId === currentUserId)
    .reduce((sum, d) => sum + d.amount, 0);

  const iOwe = debts
    .filter(d => d.fromUserId === currentUserId && d.toUserId === member.userId)
    .reduce((sum, d) => sum + d.amount, 0);

  const avatarColor = getColorForId(member.userId);

  return (
    <View style={styles.card}>
      <View style={[styles.avatar, { backgroundColor: `${avatarColor}30` }]}>
        <Text style={[styles.avatarText, { color: avatarColor }]}>
          {member.displayName[0].toUpperCase()}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>
          {isCurrentUser ? 'You' : member.displayName}
        </Text>
        {owesMe > 0 && (
          <Text style={[styles.status, { color: COLORS.success }]}>
            Owes you {formatCurrency(owesMe)}
          </Text>
        )}
        {iOwe > 0 && (
          <Text style={[styles.status, { color: COLORS.danger }]}>
            You owe {formatCurrency(iOwe)}
          </Text>
        )}
        {owesMe === 0 && iOwe === 0 && (
          <Text style={[styles.status, { color: COLORS.textSecondary }]}>Settled up</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: '700' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  status: { fontSize: 13, marginTop: 2 },
});
