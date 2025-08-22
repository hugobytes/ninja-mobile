import { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { api, Tag } from '@/services/api';
import { useFiltersStore, useAvailableFilters, useMovieFilters, useTVFilters } from '@/lib/filters';

interface TagsSelectionProps {
  type: 'movie' | 'tv';
  onGenreChange?: (selectedGenres: string[]) => void;
  selectedGenres?: string[];
}

export function GenreChecklist({ type, onGenreChange, selectedGenres = [] }: TagsSelectionProps) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [displayedTags, setDisplayedTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { streamProviders, tags, isLoadingTags } = useAvailableFilters();
  const { 
    setMovieStreamProviders, 
    setTVStreamProviders, 
    setMovieTags, 
    setTVTags 
  } = useFiltersStore();
  
  // Get current filters using the selector hooks instead of getState()
  const movieFilters = useMovieFilters();
  const tvFilters = useTVFilters();
  const currentFilters = type === 'movie' ? movieFilters : tvFilters;
  
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');

  // Use tags from store
  useEffect(() => {
    if (tags && tags.length > 0) {
      setAllTags(tags);
      setDisplayedTags(tags);
      setLoading(false);
    } else {
      setLoading(isLoadingTags);
    }
  }, [tags, isLoadingTags]);

  const toggleStreamProvider = (provider: string) => {
    const currentStreamProviders = currentFilters?.streamProviders || [];
    const newSelection = currentStreamProviders.includes(provider)
      ? currentStreamProviders.filter(p => p !== provider)
      : [...currentStreamProviders, provider];
    
    if (type === 'movie') {
      setMovieStreamProviders(newSelection);
    } else {
      setTVStreamProviders(newSelection);
    }
  };

  const toggleTag = (tagName: string) => {
    const currentTags = currentFilters?.tags || [];
    const newSelection = currentTags.includes(tagName)
      ? currentTags.filter(tag => tag !== tagName)
      : [...currentTags, tagName];
    
    if (type === 'movie') {
      setMovieTags(newSelection);
    } else {
      setTVTags(newSelection);
    }
    
    onGenreChange?.(newSelection);
  };

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


  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
          <ThemedText style={styles.loadingText}>Loading tags...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: tintColor }]} 
            onPress={() => window.location.reload()}
          >
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <View style={styles.content}>
        <ScrollView style={styles.tagsContainer} contentContainerStyle={styles.tagsContent}>
          {/* Stream Providers Section */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: tintColor }]}>
              Stream Providers
            </ThemedText>
            <View style={styles.tagsGrid}>
              {streamProviders.map((provider) => {
                const isSelected = currentFilters?.streamProviders?.includes(provider) || false;
                return (
                  <TouchableOpacity
                    key={provider}
                    style={[
                      styles.tagPill,
                      { borderColor: textColor + '30' },
                      isSelected && { backgroundColor: tintColor, borderColor: tintColor }
                    ]}
                    onPress={() => toggleStreamProvider(provider)}
                    activeOpacity={0.7}
                  >
                    <ThemedText
                      style={[
                        styles.pillText,
                        isSelected && styles.selectedPillText
                      ]}
                    >
                      {provider}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Tags Section */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: tintColor }]}>
              Genres & Tags
            </ThemedText>
            <View style={styles.tagsGrid}>
              {displayedTags.map((tag) => {
                const isSelected = currentFilters?.tags?.includes(tag.name) || false;
                return (
                  <TouchableOpacity
                    key={tag.id}
                    style={[
                      styles.tagPill,
                      { borderColor: textColor + '30' },
                      isSelected && { backgroundColor: tintColor, borderColor: tintColor }
                    ]}
                    onPress={() => toggleTag(tag.name)}
                    activeOpacity={0.7}
                  >
                    <ThemedText
                      style={[
                        styles.pillText,
                        isSelected && styles.selectedPillText
                      ]}
                    >
                      {tag.name}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
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
            style={[styles.searchButton, { backgroundColor: '#FF3B30' }]} 
            onPress={() => {/* Navigation handled by parent component */}}
          >
            <IconSymbol name="magnifyingglass" size={20} color="white" style={styles.buttonIcon} />
            <ThemedText style={styles.searchButtonText}>Search</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  shuffleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 16,
    gap: 4,
  },
  shuffleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  clearText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tagsContainer: {
    flex: 1,
  },
  tagsContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedPillText: {
    color: 'black',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  clearAllButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    margin: 16,
    marginBottom: 100,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 56,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  exploreButtonTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  exploreButtonSubtitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: '400',
    opacity: 0.9,
    marginTop: 2,
  },
});