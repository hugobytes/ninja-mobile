import React, { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { FlatList, StyleSheet, Dimensions, ActivityIndicator, RefreshControl, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ExploreMovieCard } from '@/components/ExploreMovieCard';
import { api, Movie, TVShow, RandomContentParams } from '@/services/api';
import { useThemeColor } from '@/hooks/useThemeColor';
import { IconSymbol } from '@/components/ui/IconSymbol';

const { height: screenHeight } = Dimensions.get('window');

interface ExploreListProps {
  type: 'movie' | 'tv';
  streamProviders?: string[];
  tags?: string[];
  onItemPress?: (item: Movie | TVShow) => void;
  onWatchlistPress?: (item: Movie | TVShow) => void;
  isItemInWatchlist?: (item: Movie | TVShow) => boolean;
}

export interface ExploreListRef {
  scrollToTop: () => void;
}

export const ExploreList = forwardRef<ExploreListRef, ExploreListProps>(({ type, streamProviders, tags, onItemPress, onWatchlistPress, isItemInWatchlist }, ref) => {
  const [items, setItems] = useState<(Movie | TVShow)[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const flatListRef = useRef<FlatList>(null);
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');

  useImperativeHandle(ref, () => ({
    scrollToTop: () => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
  }));

  // Simple initial fetch - no dependencies on items
  const loadInitialItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params: RandomContentParams = { limit: 5 };
      
      if (streamProviders?.length) params.stream_providers = streamProviders.join(',');
      if (tags?.length) params.tags = tags.join(',');

      const response = type === 'movie' 
        ? await api.getRandomMovies(params)
        : await api.getRandomTVShows(params);
      
      if (response.success) {
        setItems(response.data);
      } else {
        setError(`Failed to load ${type === 'movie' ? 'movies' : 'TV shows'}`);
      }
    } catch (err) {
      setError(`Failed to load ${type === 'movie' ? 'movies' : 'TV shows'}`);
    } finally {
      setLoading(false);
    }
  }, [type, streamProviders, tags]);

  // Simple load more with client-side deduplication
  const loadMoreItems = useCallback(async () => {
    if (loading || items.length === 0) return;
    
    try {
      const params: RandomContentParams = { limit: 5 }; // Request more to account for duplicates
      
      if (streamProviders?.length) params.stream_providers = streamProviders.join(',');
      if (tags?.length) params.tags = tags.join(',');
      
      // Use existing item IDs for exclusion
      const existingIds = items.map(item => item.id).join(',');
      params.exclude_imdbids = existingIds;

      const response = type === 'movie' 
        ? await api.getRandomMovies(params)
        : await api.getRandomTVShows(params);
      
      if (response.success) {
        // Client-side deduplication
        const existingIdSet = new Set(items.map(item => item.id));
        const newItems = response.data.filter(item => !existingIdSet.has(item.id));
        
        if (newItems.length > 0) {
          setItems(prev => [...prev, ...newItems]);
        } else {
          // No new items = end of content, add end indicator
          setItems(prev => [...prev, { 
            id: 'end-of-list', 
            title: 'End of Content',
            type: 'end-indicator'
          } as any]);
        }
      }
    } catch (err) {
      console.error(`Error loading more ${type}s:`, err);
    }
  }, [type, streamProviders, tags, items, loading]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInitialItems();
    setRefreshing(false);
  }, [loadInitialItems]);

  const onEndReached = useCallback(() => {
    // Don't load more if we've reached the end indicator
    const hasEndIndicator = items.some(item => (item as any).type === 'end-indicator');
    if (!hasEndIndicator) {
      console.log('End reached, loading more...');
      loadMoreItems();
    }
  }, [loadMoreItems, items]);

  // Load initial items only when filters change
  useEffect(() => {
    loadInitialItems();
  }, [loadInitialItems]);

  const renderItem = ({ item }: { item: Movie | TVShow }) => {
    // Check if this is the end-of-list indicator
    if ((item as any).type === 'end-indicator') {
      return (
        <View style={[styles.itemContainer, { height: screenHeight }]}>
          <View style={styles.endOfListContainer}>
            <IconSymbol name="checkmark.circle" size={80} color={tintColor} />
            <ThemedText style={styles.endOfListTitle}>That's all for now!</ThemedText>
            <ThemedText style={styles.endOfListText}>
              You've seen all available {type === 'movie' ? 'movies' : 'TV shows'} with your current filters.
            </ThemedText>
            <ThemedText style={styles.endOfListText}>
              Try adjusting your filters or pull to refresh for new content.
            </ThemedText>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.itemContainer, { height: screenHeight }]}>
        <ExploreMovieCard
          movie={item}
          onPress={onItemPress}
          selectedTags={tags || []}
        />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={tintColor} />
          <ThemedText style={styles.loadingText}>
            Loading {type === 'movie' ? 'movies' : 'TV shows'}...
          </ThemedText>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      );
    }

    const hasFilters = (streamProviders && streamProviders.length > 0) || (tags && tags.length > 0);
    
    return (
      <View style={styles.centerContainer}>
        <ThemedText style={styles.emptyTitleText}>
          🙁
        </ThemedText>
        <ThemedText style={styles.emptyTitleText}>
          No {type === 'movie' ? 'movies' : 'TV shows'} found
        </ThemedText>
        {hasFilters ? (
          <ThemedText style={styles.emptyText}>
            Play with filters to see more results
          </ThemedText>
        ) : (
          <ThemedText style={styles.emptyText}>
            No content available at the moment
          </ThemedText>
        )}
      </View>
    );
  };

  const getItemLayout = (_: any, index: number) => ({
    length: screenHeight,
    offset: screenHeight * index,
    index,
  });

  return (
    <FlatList
      ref={flatListRef}
      data={items}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      snapToInterval={screenHeight}
      snapToAlignment="start"
      decelerationRate="fast"
      getItemLayout={getItemLayout}
      contentContainerStyle={[styles.container, { backgroundColor }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={tintColor}
          colors={[tintColor]}
        />
      }
      ListEmptyComponent={renderEmpty}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      removeClippedSubviews={true}
      maxToRenderPerBatch={3}
      windowSize={3}
      initialNumToRender={2}
    />
  );
});

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  itemContainer: {
    // Height will be set dynamically in component
  },
  centerContainer: {
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  emptyTitleText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  endOfListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  endOfListTitle: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  endOfListText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 22,
  },
});