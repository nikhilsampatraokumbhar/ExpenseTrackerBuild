import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useGroups } from '../store/GroupContext';
import { useAuth } from '../store/AuthContext';
import { COLORS } from '../utils/helpers';

export default function CreateGroupScreen() {
  const nav = useNavigation();
  const { createGroup } = useGroups();
  const { user } = useAuth();
  const [groupName, setGroupName] = useState('');
  const [members, setMembers] = useState([{ name: '', phone: '' }]);
  const [loading, setLoading] = useState(false);

  const addMember = () => setMembers(prev => [...prev, { name: '', phone: '' }]);

  const updateMember = (i: number, field: 'name' | 'phone', value: string) => {
    setMembers(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m));
  };

  const removeMember = (i: number) => {
    if (members.length > 1) {
      setMembers(prev => prev.filter((_, idx) => idx !== i));
    }
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    const validMembers = members.filter(m => m.name.trim());
    if (validMembers.length === 0) {
      Alert.alert('Error', 'Please add at least one member');
      return;
    }

    setLoading(true);
    try {
      await createGroup(
        groupName.trim(),
        validMembers.map(m => ({ displayName: m.name.trim(), phone: m.phone.trim() })),
        user?.id || 'local_user',
      );
      nav.goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Group Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Goa Trip, Office Lunch"
        value={groupName}
        onChangeText={setGroupName}
        placeholderTextColor={COLORS.textLight}
      />

      <Text style={styles.label}>Members</Text>
      <Text style={styles.hint}>You are automatically included</Text>

      {members.map((m, i) => (
        <View key={i} style={styles.memberRow}>
          <TextInput
            style={[styles.input, styles.nameInput]}
            placeholder={`Member ${i + 1} name`}
            value={m.name}
            onChangeText={v => updateMember(i, 'name', v)}
            placeholderTextColor={COLORS.textLight}
          />
          <TextInput
            style={[styles.input, styles.phoneInput]}
            placeholder="Phone (optional)"
            value={m.phone}
            onChangeText={v => updateMember(i, 'phone', v)}
            keyboardType="phone-pad"
            placeholderTextColor={COLORS.textLight}
          />
          {members.length > 1 && (
            <TouchableOpacity style={styles.removeBtn} onPress={() => removeMember(i)}>
              <Text style={styles.removeBtnText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      <TouchableOpacity style={styles.addMemberBtn} onPress={addMember}>
        <Text style={styles.addMemberText}>+ Add another member</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.createBtn, loading && styles.disabledBtn]}
        onPress={handleCreate}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.createBtnText}>Create Group</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 6, marginTop: 16 },
  hint: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 10 },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 10,
  },
  memberRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  nameInput: { flex: 2, marginBottom: 0 },
  phoneInput: { flex: 1.5, marginBottom: 0 },
  removeBtn: {
    width: 36,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: { fontSize: 18, color: COLORS.danger },
  addMemberBtn: { marginTop: 8, padding: 12, alignItems: 'center' },
  addMemberText: { color: COLORS.primary, fontWeight: '600', fontSize: 15 },
  createBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  disabledBtn: { opacity: 0.6 },
  createBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
