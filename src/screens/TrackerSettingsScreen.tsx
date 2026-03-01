import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useGroups } from '../store/GroupContext';
import { useTracker } from '../store/TrackerContext';
import TrackerToggle from '../components/TrackerToggle';
import { COLORS } from '../utils/helpers';

export default function TrackerSettingsScreen() {
  const { groups } = useGroups();
  const { trackerState, isListening, togglePersonal, toggleReimbursement, toggleGroup } = useTracker();

  const activeCount =
    (trackerState.personal ? 1 : 0) +
    (trackerState.reimbursement ? 1 : 0) +
    trackerState.activeGroupIds.length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Status */}
      <View style={[styles.statusBanner, isListening ? styles.statusActive : styles.statusInactive]}>
        <View style={[styles.statusDot, { backgroundColor: isListening ? COLORS.success : COLORS.textLight }]} />
        <Text style={[styles.statusText, { color: isListening ? COLORS.success : COLORS.textSecondary }]}>
          {isListening ? `SMS Tracking Active (${activeCount} tracker${activeCount !== 1 ? 's' : ''})` : 'SMS Tracking Inactive'}
        </Text>
      </View>

      {/* How it works */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>How It Works</Text>
        <Text style={styles.infoText}>
          When a tracker is enabled, the app reads incoming SMS messages for bank transactions.
          {'\n\n'}
          • 1 tracker active → notification with "Add" button{'\n'}
          • 2+ trackers active → notification with "Choose Tracker" button
          {'\n\n'}
          Tap the notification action to instantly save the transaction.
        </Text>
      </View>

      {/* Personal */}
      <Text style={styles.sectionTitle}>Personal Trackers</Text>
      <TrackerToggle
        label="Personal Expenses"
        subtitle="Daily spending"
        isActive={trackerState.personal}
        onToggle={togglePersonal}
        color={COLORS.personalColor}
      />
      <TrackerToggle
        label="Reimbursement"
        subtitle="Office/business expenses"
        isActive={trackerState.reimbursement}
        onToggle={toggleReimbursement}
        color={COLORS.reimbursementColor}
      />

      {/* Groups */}
      {groups.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Group Trackers</Text>
          {groups.map(group => (
            <TrackerToggle
              key={group.id}
              label={group.name}
              subtitle={`${group.members.length} members · auto-split`}
              isActive={trackerState.activeGroupIds.includes(group.id)}
              onToggle={() => toggleGroup(group.id)}
              color={COLORS.groupColor}
            />
          ))}
        </>
      )}

      {activeCount > 0 && (
        <View style={styles.activeInfo}>
          <Text style={styles.activeInfoText}>
            {activeCount} tracker{activeCount !== 1 ? 's' : ''} active — {'\n'}
            The next SMS-based bank transaction will trigger a notification.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusActive: { backgroundColor: `${COLORS.success}15`, borderWidth: 1, borderColor: `${COLORS.success}30` },
  statusInactive: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  statusText: { fontSize: 14, fontWeight: '600' },
  infoCard: {
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: `${COLORS.primary}20`,
  },
  infoTitle: { fontSize: 14, fontWeight: '700', color: COLORS.primary, marginBottom: 8 },
  infoText: { fontSize: 13, color: COLORS.text, lineHeight: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 10, marginTop: 4 },
  activeInfo: {
    backgroundColor: `${COLORS.success}10`,
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: `${COLORS.success}20`,
  },
  activeInfoText: { fontSize: 13, color: COLORS.success, textAlign: 'center', lineHeight: 20 },
});
