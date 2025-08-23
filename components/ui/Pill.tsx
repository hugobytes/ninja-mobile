import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import {Colors} from "@/constants/Colors";

interface PillProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function Pill({ label, selected, onPress }: PillProps) {
  const tintColor = useThemeColor({}, 'tint');
  
  return (
    <TouchableOpacity
      style={[
        styles.pill,
        selected && { 
          backgroundColor: tintColor, 
          borderColor: tintColor 
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <ThemedText style={[
        styles.pillText,
        selected && { color: 'black' }
      ]}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#666',
    backgroundColor: Colors.surface,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '500',
  },
});