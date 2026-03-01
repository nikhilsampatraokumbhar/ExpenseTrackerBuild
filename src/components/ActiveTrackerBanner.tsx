import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ActiveTracker } from '../models/types';
import { COLORS } from '../utils/helpers';

interface Props {
  activeTrackers: ActiveTracker[];
  onManage: () => void;
}

export default function ActiveTrackerBanner({ activeTrackers, onManage }: Props) {
  if (activeTrackers.length === 0) return null;

  const names = activeTrackers.map(t => t.label).join(', ');
  return (
    <View style={styles.banner}>
      <View style={styles.left}>
        <View style={styles.pulse} />
        <Text style={styles.text} numberOfLines={1}>
          Tracking: <Text style={styles.names}>{names}</Text>
        </Text>
      </View>
      <TouchableOpacity onPress={onManage}>
        <Text style={styles.manage}>Manage</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: `${COLORS.success}20`,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.success}30`,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  pulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: 8,
  },
  text: { fontSize: 13, color: COLORS.text, flex: 1 },
  names: { fontWeight: '600', color: COLORS.success },
  manage: { fontSize: 13, fontWeight: '600', color: COLORS.primary, marginLeft: 12 },
});
