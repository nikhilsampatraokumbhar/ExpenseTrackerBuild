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
      style={[styles.container, isActive && { borderColor: `${activeColor}60`, backgroundColor: `${activeColor}10` }]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      {/* Left accent bar */}
      {isActive && <View style={[styles.accentBar, { backgroundColor: activeColor }]} />}

      <View style={styles.left}>
        {/* Icon dot */}
        <View style={[
          styles.iconWrap,
          { backgroundColor: isActive ? `${activeColor}25` : `${COLORS.border}80` },
        ]}>
          <View style={[
            styles.dot,
            { backgroundColor: isActive ? activeColor : COLORS.textLight },
          ]} />
        </View>

        <View style={styles.textWrap}>
          {label ? (
            <Text style={[styles.label, isActive && { color: COLORS.text }]}>{label}</Text>
          ) : null}
          {subtitle ? (
            <Text style={styles.subtitle}>{subtitle}</Text>
          ) : null}
        </View>
      </View>

      {/* Right status pill */}
      <View style={[
        styles.statusPill,
        isActive
          ? { backgroundColor: `${activeColor}25`, borderColor: `${activeColor}50` }
          : { backgroundColor: COLORS.surfaceHigher, borderColor: COLORS.border },
      ]}>
        <Text style={[
          styles.statusText,
          { color: isActive ? activeColor : COLORS.textSecondary },
        ]}>
          {isActive ? 'ON' : 'OFF'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingRight: 14,
    paddingLeft: 0,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    marginBottom: 10,
    overflow: 'hidden',
  },
  accentBar: {
    width: 4,
    alignSelf: 'stretch',
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
    marginRight: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingLeft: 14,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  textWrap: { flex: 1 },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
