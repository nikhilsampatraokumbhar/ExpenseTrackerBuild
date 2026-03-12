import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../utils/helpers';

interface LogoProps {
  size?: number;
  showName?: boolean;
  showSlogan?: boolean;
}

export default function Logo({ size = 80, showName = false, showSlogan = false }: LogoProps) {
  const scale = size / 80;
  const borderRadius = 22 * scale;
  const innerRadius = 16 * scale;

  return (
    <View style={styles.wrapper}>
      {/* Main logo mark */}
      <View
        style={[
          styles.outerContainer,
          {
            width: size,
            height: size,
            borderRadius,
          },
        ]}
      >
        {/* Glow layer */}
        <View
          style={[
            styles.glowLayer,
            {
              width: size + 20 * scale,
              height: size + 20 * scale,
              borderRadius: borderRadius + 10 * scale,
            },
          ]}
        />

        {/* Outer border ring */}
        <View
          style={[
            styles.borderRing,
            {
              width: size,
              height: size,
              borderRadius,
            },
          ]}
        >
          {/* Inner filled square */}
          <View
            style={[
              styles.innerSquare,
              {
                width: size - 6 * scale,
                height: size - 6 * scale,
                borderRadius: innerRadius,
              },
            ]}
          >
            {/* Decorative accent bar at top */}
            <View
              style={[
                styles.accentBar,
                {
                  width: (size - 6 * scale) * 0.6,
                  height: 3 * scale,
                  borderRadius: 1.5 * scale,
                  top: 6 * scale,
                },
              ]}
            />

            {/* The T letter */}
            <Text
              style={[
                styles.letterT,
                {
                  fontSize: 42 * scale,
                  lineHeight: 48 * scale,
                },
              ]}
            >
              T
            </Text>

            {/* Decorative upward arrow / chart line at bottom-right */}
            <View
              style={[
                styles.chartAccent,
                {
                  bottom: 8 * scale,
                  right: 10 * scale,
                },
              ]}
            >
              <View
                style={[
                  styles.chartBar,
                  {
                    width: 3 * scale,
                    height: 8 * scale,
                    borderRadius: 1.5 * scale,
                    marginRight: 2 * scale,
                  },
                ]}
              />
              <View
                style={[
                  styles.chartBar,
                  {
                    width: 3 * scale,
                    height: 12 * scale,
                    borderRadius: 1.5 * scale,
                    marginRight: 2 * scale,
                  },
                ]}
              />
              <View
                style={[
                  styles.chartBarAccent,
                  {
                    width: 3 * scale,
                    height: 16 * scale,
                    borderRadius: 1.5 * scale,
                  },
                ]}
              />
            </View>
          </View>
        </View>
      </View>

      {/* App name */}
      {showName && (
        <Text style={[styles.appName, { fontSize: 28 * scale, marginTop: 14 * scale }]}>
          Trackk
        </Text>
      )}

      {/* Slogan */}
      {showSlogan && (
        <Text style={[styles.slogan, { fontSize: 13 * scale, marginTop: 4 * scale }]}>
          One Tap. Track.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  outerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowLayer: {
    position: 'absolute',
    backgroundColor: `${COLORS.primary}12`,
  },
  borderRing: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  innerSquare: {
    backgroundColor: '#0E0E14',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    backgroundColor: COLORS.primary,
    opacity: 0.6,
  },
  letterT: {
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -1,
  },
  chartAccent: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  chartBar: {
    backgroundColor: `${COLORS.primary}40`,
  },
  chartBarAccent: {
    backgroundColor: COLORS.primary,
  },
  appName: {
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 1,
  },
  slogan: {
    color: COLORS.textSecondary,
    fontWeight: '500',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
