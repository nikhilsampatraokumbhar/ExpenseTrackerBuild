import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS } from '../utils/helpers';

interface Props {
  label: string;
  subtitle?: string;
  isActive: boolean;
  onToggle: () => void;
  color?: string;
}

export default function TrackerToggle({ label, subtitle, isActive, onToggle, color }: Props) {
  const activeColor = color || COLORS.primary;
  return (
    <TouchableOpacity
      style={[styles.container, isActive && { borderColor: activeColor, backgroundColor: `${activeColor}15` }]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.left}>
        <View style={[styles.dot, { backgroundColor: isActive ? activeColor : COLORS.textLight }]} />
        <View>
          <Text style={[styles.label, isActive && { color: activeColor }]}>{label}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      <Text style={[styles.status, { color: isActive ? activeColor : COLORS.textLight }]}>
        {isActive ? 'TRACKING' : 'TAP TO START'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    marginBottom: 10,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  label: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  subtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  status: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
});
