import React from 'react';
import { Modal, TouchableOpacity, StyleSheet, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { GenreChecklist } from '@/components/GenreChecklist';
import { useThemeColor } from '@/hooks/useThemeColor';
import {Colors} from "@/constants/Colors";

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'movie' | 'tv';
  onGenreChange: (selectedGenres: string[]) => void;
  selectedGenres?: string[];
}

export function FilterModal({ visible, onClose, type, onGenreChange, selectedGenres }: FilterModalProps) {
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'text');

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container]}>
        <View style={styles.header}>
          <ThemedText style={styles.headerLeft}>Filters</ThemedText>
          <TouchableOpacity
            style={[styles.closeButton, { borderColor: borderColor + '40' }]}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <IconSymbol name="xmark" size={20} color={tintColor} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <GenreChecklist 
            type={type} 
            onGenreChange={onGenreChange}
            selectedGenres={selectedGenres}
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  headerLeft: {
    flex: 1,
    gap: 4,
    fontSize: 32
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
});