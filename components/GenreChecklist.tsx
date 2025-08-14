import { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { api, Tag } from '@/services/api';

interface TagsSelectionProps {
  type: 'movie' | 'tv';
  onTagsChange?: (selectedTags: string[]) => void;
}

export function GenreChecklist({ type, onTagsChange }: TagsSelectionProps) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [displayedTags, setDisplayedTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');

  // Fetch tags on component mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        const response = await api.getTags();
        setAllTags(response.tags);
        setDisplayedTags(response.tags);
        setError(null);
      } catch (err) {
        setError('Failed to load tags');
        console.error('Error fetching tags:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  // Shuffle the displayed tags
  const shuffleTags = () => {
    const shuffled = [...allTags].sort(() => Math.random() - 0.5);
    setDisplayedTags(shuffled);
  };

  const toggleTag = (tagName: string) => {
    const newSelection = selectedTags.includes(tagName)
      ? selectedTags.filter(tag => tag !== tagName)
      : [...selectedTags, tagName];
    
    setSelectedTags(newSelection);
    onTagsChange?.(newSelection);
  };

  const clearAllTags = () => {
    setSelectedTags([]);
    onTagsChange?.([]);
  };

  const handleExplore = () => {
    const params: any = { type };
    if (selectedTags.length > 0) {
      params.tags = selectedTags.join(',');
    }

    router.push({
      pathname: '/explore',
      params
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
          <ThemedText style={styles.loadingText}>Loading tags...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <ThemedView style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: tintColor }]} 
            onPress={() => window.location.reload()}
          >
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ThemedView style={styles.content}>
        {/* Header with shuffle button */}
        <ThemedView style={styles.header}>
          <ThemedText style={[styles.title, { color: tintColor }]}>
            All Tags ({selectedTags.length})
          </ThemedText>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={[styles.shuffleButton, { borderColor: tintColor }]} 
              onPress={shuffleTags}
            >
              <IconSymbol name="shuffle" size={16} color={tintColor} />
              <ThemedText style={[styles.shuffleText, { color: tintColor }]}>Shuffle</ThemedText>
            </TouchableOpacity>
            {selectedTags.length > 0 && (
              <TouchableOpacity 
                style={[styles.clearButton, { backgroundColor: tintColor + '20' }]} 
                onPress={clearAllTags}
              >
                <ThemedText style={[styles.clearText, { color: tintColor }]}>Clear All</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </ThemedView>

        {/* Tags grid */}
        <ScrollView style={styles.tagsContainer} contentContainerStyle={styles.tagsContent}>
          <ThemedView style={styles.tagsGrid}>
            {displayedTags.map((tag) => {
              const isSelected = selectedTags.includes(tag.name);
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
                      isSelected && { color: 'white' }
                    ]}
                  >
                    {tag.name}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </ThemedView>
        </ScrollView>

        {/* Explore button */}
        <TouchableOpacity
          style={[styles.exploreButton, { backgroundColor: tintColor }]}
          onPress={handleExplore}
          activeOpacity={0.8}
        >
          <IconSymbol name="play.fill" size={20} color="white" style={styles.buttonIcon} />
          <View style={styles.buttonTextContainer}>
            <ThemedText style={styles.exploreButtonTitle}>
              Explore {type === 'movie' ? 'Movies' : 'TV Shows'}
            </ThemedText>
            <ThemedText style={styles.exploreButtonSubtitle} numberOfLines={1}>
              {selectedTags.length > 0 ? (() => {
                const maxLength = 40;
                const itemsText = selectedTags.join(', ');
                if (itemsText.length <= maxLength) {
                  return itemsText;
                }
                
                let truncatedText = '';
                let itemCount = 0;
                
                for (const tag of selectedTags) {
                  const testText = truncatedText ? `${truncatedText}, ${tag}` : tag;
                  if (testText.length > maxLength - 15) {
                    break;
                  }
                  truncatedText = testText;
                  itemCount++;
                }
                
                const remainingCount = selectedTags.length - itemCount;
                return remainingCount > 0 
                  ? `${truncatedText}... +${remainingCount} more`
                  : truncatedText;
              })() : 'Any'}
            </ThemedText>
          </View>
        </TouchableOpacity>
      </ThemedView>
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
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    fontSize: 14,
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