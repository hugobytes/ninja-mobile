import React from 'react';
import { Modal, TouchableOpacity, StyleSheet, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { FilterSelection } from '@/components/FilterSelection';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useFiltersStore } from '@/lib/filters';
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
  const { 
    setMovieStreamProviders, 
    setTVStreamProviders, 
    setMovieTags, 
    setTVTags 
  } = useFiltersStore();

  const clearAllFilters = () => {
    if (type === 'movie') {
      setMovieStreamProviders([]);
      setMovieTags([]);
    } else {
      setTVStreamProviders([]);
      setTVTags([]);
    }
    onGenreChange?.([]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container]}>
        <View style={styles.header}>
          <ThemedText type="title">Filters</ThemedText>
          <TouchableOpacity
            style={[styles.closeButton, { borderColor: borderColor + '40' }]}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <IconSymbol name="xmark" size={20} color={tintColor} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

          <FilterSelection 
            type={type} 
            onGenreChange={onGenreChange}
            selectedGenres={selectedGenres}
          />
        </ScrollView>

        {/* Bottom action buttons */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
              style={[styles.clearAllButton]}
              onPress={clearAllFilters}
          >
            <ThemedText style={styles.clearAllButtonText}>Clear All</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
              style={[styles.searchButton, { backgroundColor: Colors.redRed }]}
              onPress={onClose}
          >
            <IconSymbol name="magnifyingglass" size={20} color="white" style={styles.buttonIcon} />
            <ThemedText style={styles.searchButtonText}>Search</ThemedText>
          </TouchableOpacity>
        </View>

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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
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
  bottomActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  clearAllButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearAllButtonText: {
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.7,
  },
  searchButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 0,
  },
});