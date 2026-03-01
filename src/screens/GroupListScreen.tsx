import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useGroups } from '../store/GroupContext';
import { useTracker } from '../store/TrackerContext';
import TrackerToggle from '../components/TrackerToggle';
import { COLORS, getColorForId } from '../utils/helpers';
import { useCallback, useState } from 'react';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function GroupListScreen() {
  const nav = useNavigation<Nav>();
  const { groups, loading, refreshGroups } = useGroups();
  const { trackerState, toggleGroup } = useTracker();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => { refreshGroups(); }, [refreshGroups]));

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshGroups();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={() => (
          <Text style={styles.sectionTitle}>Your Groups</Text>
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyText}>No groups yet</Text>
            <Text style={styles.emptySubtext}>
              Create a group to split expenses with friends and family
            </Text>
          </View>
        )}
        data={groups}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const color = getColorForId(item.id);
          const isActive = trackerState.activeGroupIds.includes(item.id);
          return (
            <View style={styles.groupCard}>
              <TouchableOpacity
                style={styles.groupInfo}
                onPress={() => nav.navigate('GroupDetail', { groupId: item.id })}
              >
                <View style={[styles.groupIcon, { backgroundColor: `${color}20` }]}>
                  <Text style={[styles.groupInitial, { color }]}>
                    {item.name[0].toUpperCase()}
                  </Text>
                </View>
                <View style={styles.groupText}>
                  <Text style={styles.groupName}>{item.name}</Text>
                  <View style={styles.membersRow}>
                    {item.members.slice(0, 5).map((m, i) => (
                      <View
                        key={m.userId}
                        style={[styles.memberDot, {
                          backgroundColor: getColorForId(m.userId),
                          marginLeft: i > 0 ? -6 : 0,
                        }]}
                      >
                        <Text style={styles.memberInitial}>
                          {m.displayName[0].toUpperCase()}
                        </Text>
                      </View>
                    ))}
                    {item.members.length > 5 && (
                      <Text style={styles.moreMembers}>
                        +{item.members.length - 5}
                      </Text>
                    )}
                    <Text style={styles.memberCount}>
                      {item.members.length} members
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
              <TrackerToggle
                label=""
                isActive={isActive}
                onToggle={() => toggleGroup(item.id)}
                color={COLORS.groupColor}
              />
            </View>
          );
        }}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => nav.navigate('CreateGroup')}
      >
        <Text style={styles.fabText}>+ Group</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 80 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  empty: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  emptySubtext: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginTop: 8 },
  groupCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  groupIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  groupInitial: { fontSize: 22, fontWeight: '800' },
  groupText: { flex: 1 },
  groupName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  membersRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  memberDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.surface,
  },
  memberInitial: { fontSize: 10, fontWeight: '700', color: COLORS.surface },
  moreMembers: { fontSize: 11, color: COLORS.textSecondary, marginLeft: 4 },
  memberCount: { fontSize: 12, color: COLORS.textSecondary, marginLeft: 8 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
