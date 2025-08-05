import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, Alert, Dimensions, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MovieCard } from '@/components/MovieCard';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { api, Movie, TVShow } from '@/services/api';
import { userService } from '@/services/userService';
import { useWatchlist } from '@/contexts/WatchlistContext';

type ContentItem = Movie | TVShow;

const { height } = Dimensions.get('window');

export default function ExploreScreen() {
  const { genres, tropes, moods, acclaims, origins, type } = useLocalSearchParams<{ 
    genres: string; 
    tropes: string; 
    moods: string; 
    acclaims: string; 
    origins: string; 
    type: string 
  }>();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');

  useEffect(() => {
    let isMounted = true;
    
    const loadInitialContent = async () => {
      if (loading || content.length > 0) return;
      setLoading(true);

      try {
        const accessKey = await userService.getAccessKey();
        
        const response = type === 'movie' 
          ? await api.getRandomMovies({
              limit: 20,
              genres,
              tropes,
              moods,
              acclaims,
              origins,
              country: 'GB'
            }, accessKey || undefined)
          : await api.getRandomTVShows({
              limit: 20,
              genres,
              tropes,
              moods,
              acclaims,
              origins,
              country: 'GB'
            }, accessKey || undefined);

        if (isMounted && response.success) {
          if (response.data && response.data.length > 0) {
            setContent(response.data);
            setHasMore(response.data.length === 20);
          } else {
            // No content found but API succeeded
            setContent([]);
            setHasMore(false);
          }
        } else if (isMounted) {
          // API returned success: false
          setContent([]);
          setHasMore(false);
          Alert.alert('Info', 'No content found matching your criteria.');
        }
      } catch (error) {
        console.error('Failed to load content:', error);
        if (isMounted) {
          Alert.alert('Error', `Failed to load ${type === 'movie' ? 'movies' : 'TV shows'}. Please try again.`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadInitialContent();

    return () => {
      isMounted = false;
    };
  }, [genres, tropes, moods, acclaims, origins]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMoreContent = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    try {
      const accessKey = await userService.getAccessKey();
      const excludeIds = content.map(item => item.imdbid).filter(id => id).join(',');
      
      const response = type === 'movie'
        ? await api.getRandomMovies({
            limit: 1,
            genres,
            tropes,
            moods,
            acclaims,
            origins,
            exclude_imdbids: excludeIds,
            country: 'GB'
          }, accessKey || undefined)
        : await api.getRandomTVShows({
            limit: 1,
            genres,
            tropes,
            moods,
            acclaims,
            origins,
            exclude_imdbids: excludeIds,
            country: 'GB'
          }, accessKey || undefined);

      if (response.success) {
        if (response.data && response.data.length > 0) {
          setContent(prev => [...prev, ...response.data]);
          setHasMore(true);
        } else {
          // No more content available
          setHasMore(false);
        }
      } else {
        // API returned success: false
        setHasMore(false);
        console.warn('API returned error when loading more content:', response);
      }
    } catch (error) {
      console.error('Failed to load more content:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [content, genres, loadingMore, hasMore, type]);

  const handleScroll = useCallback((event: any) => {
    const { contentOffset } = event.nativeEvent;
    const currentItemIndex = Math.round(contentOffset.y / (height * 0.8 + 20)); // card height + margin
    
    if (currentItemIndex !== currentIndex) {
      setCurrentIndex(currentItemIndex);
      
      // Load more when reaching near the end (2 items before the last)
      if (currentItemIndex >= content.length - 2 && hasMore && !loadingMore) {
        loadMoreContent();
      }
    }
  }, [currentIndex, content.length, hasMore, loadingMore, loadMoreContent]);

  const handleContentPress = (item: ContentItem) => {
    console.log('Content pressed:', item.title);
    // TODO: Navigate to content details
  };

  const handleWatchlistPress = async (item: ContentItem) => {
    try {
      const isCurrentlyInWatchlist = isInWatchlist(item);
      
      if (isCurrentlyInWatchlist) {
        await removeFromWatchlist(item);
        // Update the item's is_saved status locally
        setContent(prev => prev.map(contentItem => 
          contentItem.id === item.id ? { ...contentItem, is_saved: false } : contentItem
        ));
      } else {
        await addToWatchlist(item);
        // Update the item's is_saved status locally
        setContent(prev => prev.map(contentItem => 
          contentItem.id === item.id ? { ...contentItem, is_saved: true } : contentItem
        ));
      }
    } catch (error) {
      // Error handling is done in the context
    }
  };

  const renderContent = ({ item }: { item: ContentItem }) => (
    <MovieCard 
      movie={item} 
      onPress={handleContentPress} 
      variant="fullscreen"
      onWatchlistPress={handleWatchlistPress}
      isInWatchlist={isInWatchlist(item)}
    />
  );

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <ThemedView style={styles.loadingFooter}>
          <ActivityIndicator size="small" color={tintColor} />
          <ThemedText style={styles.loadingText}>Loading more {type === 'movie' ? 'movies' : 'TV shows'}...</ThemedText>
        </ThemedView>
      );
    }
    
    if (!hasMore && content.length > 0) {
      return (
        <ThemedView style={styles.endFooter}>
          <ThemedView style={[styles.endCard, { backgroundColor }]}>
            <IconSymbol name="checkmark.circle.fill" size={48} color={tintColor} style={styles.endIcon} />
            <ThemedText style={styles.endTitle}>You&apos;ve reached the end!</ThemedText>
            <ThemedText style={styles.endSubtitle}>
              No more {type === 'movie' ? 'movies' : 'TV shows'} for your selected genres.
            </ThemedText>
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: tintColor }]}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <IconSymbol name="arrow.left" size={20} color="white" style={styles.backButtonIcon} />
              <ThemedText style={styles.backButtonText}>Back to Genres</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      );
    }
    
    return null;
  };

  const renderEmpty = () => {
    if (loading) return null;
    
    return (
      <ThemedView style={styles.emptyContainer}>
        <IconSymbol name="film" size={64} color={tintColor} style={styles.emptyIcon} />
        <ThemedText style={styles.emptyText}>
          No {type === 'movie' ? 'movies' : 'TV shows'} found
        </ThemedText>
        <ThemedText style={styles.emptySubtext}>
          Try different criteria or check back later for new content.
        </ThemedText>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: tintColor }]}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <IconSymbol name="arrow.left" size={20} color="white" style={styles.backButtonIcon} />
          <ThemedText style={styles.backButtonText}>Back to Selection</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  };

  // Build selected criteria display
  const selectedCriteria: string[] = [];
  if (genres) selectedCriteria.push(...genres.split(','));
  if (tropes) selectedCriteria.push(...tropes.split(','));
  if (moods) selectedCriteria.push(...moods.split(','));
  if (acclaims) selectedCriteria.push(...acclaims.split(','));
  if (origins) selectedCriteria.push(...origins.split(','));
  
  const title = type === 'movie' ? 'Movies' : 'TV Shows';
  const criteriaDisplay = selectedCriteria.length > 0 
    ? selectedCriteria.slice(0, 2).join(', ') + (selectedCriteria.length > 2 ? ` +${selectedCriteria.length - 2}` : '')
    : 'All';

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: `${title} • ${criteriaDisplay}`,
          headerBackTitle: 'Back'
        }} 
      />
      
      <ThemedView style={[styles.container, { backgroundColor }]}>
        {loading && content.length === 0 ? (
          <ThemedView style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={tintColor} />
            <ThemedText style={styles.loadingText}>Discovering {title.toLowerCase()}...</ThemedText>
          </ThemedView>
        ) : (
          <FlatList
            data={content}
            renderItem={renderContent}
            keyExtractor={(item) => item.imdbid}
            showsVerticalScrollIndicator={false}
            snapToInterval={height * 0.8 + 20} // card height + margin
            snapToAlignment="start"
            decelerationRate="fast"
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={styles.snappingList}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmpty}
            getItemLayout={(data, index) => ({
              length: height * 0.8 + 20,
              offset: (height * 0.8 + 20) * index,
              index,
            })}
          />
        )}
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
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
  list: {
    padding: 16,
  },
  snappingList: {
    paddingVertical: 10,
  },
  row: {
    justifyContent: 'space-between',
  },
  loadingFooter: {
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  endFooter: {
    height: height * 0.8 + 20, // Same height as movie cards for proper snapping
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  endCard: {
    width: '100%',
    height: height * 0.6,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  endIcon: {
    marginBottom: 16,
  },
  endTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  endSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 32,
    lineHeight: 22,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButtonIcon: {
    marginRight: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  emptyIcon: {
    marginBottom: 8,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 16,
  },
});