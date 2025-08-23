import { useEffect } from 'react';
import { StyleSheet, ScrollView, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { Pill } from '@/components/ui/Pill';

import { useThemeColor } from '@/hooks/useThemeColor';
import { useFiltersStore, useAvailableFilters, useMovieFilters, useTVFilters } from '@/lib/filters';
import {Colors} from "@/constants/Colors";

interface TagsSelectionProps {
  type: 'movie' | 'tv';
  onGenreChange?: (selectedGenres: string[]) => void;
  selectedGenres?: string[];
}

export function FilterSelection({ type, onGenreChange }: TagsSelectionProps) {
  const { streamProviders, tags, isLoadingTags } = useAvailableFilters();
  const { 
    fetchAvailableFilters,
    setMovieStreamProviders, 
    setTVStreamProviders, 
    setMovieTags, 
    setTVTags 
  } = useFiltersStore();

  useEffect(() => {
    // Fetch available filters when component mounts
    fetchAvailableFilters();
  }, [fetchAvailableFilters]);
  
  // Get current filters using the selector hooks instead of getState()
  const movieFilters = useMovieFilters();
  const tvFilters = useTVFilters();
  const currentFilters = type === 'movie' ? movieFilters : tvFilters;
  
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');

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

  if (isLoadingTags || !tags) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
          <ThemedText style={styles.loadingText}>Loading filters...</ThemedText>
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
                  <Pill
                    key={provider}
                    label={provider}
                    selected={isSelected}
                    onPress={() => toggleStreamProvider(provider)}
                  />
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
              {tags.map((tag) => {
                const isSelected = currentFilters?.tags?.includes(tag.name) || false;
                return (
                  <Pill
                    key={tag.id}
                    label={tag.name}
                    selected={isSelected}
                    onPress={() => toggleTag(tag.name)}
                  />
                );
              })}
            </View>
          </View>
        </ScrollView>
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
  genreTag: {

  },
  genreText: {

  },
  tagPill: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.surface,
  },
  pillText: {
    fontSize: 16,
    fontWeight: '600',
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
    marginBottom: 16,
  },
  infoContainer: {
    backgroundColor: '#e3f2fd',
    borderColor: '#90caf9',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#0277bd',
    textAlign: 'center',
    fontWeight: '500',
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