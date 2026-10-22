import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type IconName =
  | 'check'
  | 'clock'
  | 'calendar'
  | 'flame'
  | 'trash'
  | 'edit'
  | 'plus'
  | 'search'
  | 'close'
  | 'x'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-up'
  | 'chevron-down'
  | 'bell'
  | 'camera'
  | 'user'
  | 'lock'
  | 'mail'
  | 'logout'
  | 'filter'
  | 'sort'
  | 'alert'
  | 'tag'
  | 'sparkles';

interface Props {
  name: IconName;
  size?: number;
  color?: string;
}

/**
 * Universal Lightweight Icon Component
 * Rendered using vector symbols and styled glyphs, guaranteeing 100% Android/iOS cross-platform
 * reliability without native font linking dependencies.
 */
export const CustomIcon: React.FC<Props> = ({ name, size = 18, color = '#FFFFFF' }) => {
  const getSymbol = () => {
    switch (name) {
      case 'check':
        return '✓';
      case 'clock':
        return '◷';
      case 'calendar':
        return '📅';
      case 'flame':
        return '🔥';
      case 'trash':
        return '🗑';
      case 'edit':
        return '✎';
      case 'plus':
        return '+';
      case 'search':
        return '🔍';
      case 'close':
      case 'x':
        return '✕';
      case 'chevron-left':
        return '‹';
      case 'chevron-right':
        return '›';
      case 'chevron-up':
        return '▲';
      case 'chevron-down':
        return '▼';
      case 'bell':
        return '🔔';
      case 'camera':
        return '📷';
      case 'user':
        return '👤';
      case 'lock':
        return '🔒';
      case 'mail':
        return '✉';
      case 'logout':
        return '⏻';
      case 'filter':
        return '⚡';
      case 'sort':
        return '⇅';
      case 'alert':
        return '⚠️';
      case 'tag':
        return '🏷';
      case 'sparkles':
        return '✨';
      default:
        return '•';
    }
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Text style={[styles.glyph, { fontSize: size * 0.85, color }]}>
        {getSymbol()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    textAlign: 'center',
    fontWeight: '700',
  },
});
