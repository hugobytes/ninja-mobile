import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, StyleSheet, Dimensions, ActivityIndicator, RefreshControl, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ExploreMovieCard } from '@/components/ExploreMovieCard';
import { api, Movie, TVShow, RandomContentParams } from '@/services/api';
import { useThemeColor } from '@/hooks/useThemeColor';

const { height: screenHeight } = Dimensions.get('window');

interface ExploreListProps {
  type: 'movie' | 'tv';
  streamProviders?: string[];
  tags?: string[];
  onItemPress?: (item: Movie | TVShow) => void;
  onWatchlistPress?: (item: Movie | TVShow) => void;
  isItemInWatchlist?: (item: Movie | TVShow) => boolean;
}

export function ExploreList({ type, streamProviders, tags, onItemPress, onWatchlistPress, isItemInWatchlist }: ExploreListProps) {
  const [items, setItems] = useState<(Movie | TVShow)[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');

  const fetchItems = useCallback(async (isRefresh = false) => {
    try {
      setError(null);
      if (!isRefresh) setLoading(true);
      
      const params: RandomContentParams = {
        limit: 20,
      };
      
      if (streamProviders && streamProviders.length > 0) {
        params.stream_providers = streamProviders.join(',');
      }
      
      if (tags && tags.length > 0) {
        params.tags = tags.join(',');
      }

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
      console.error(`Error fetching ${type}s:`, err);
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, [type, streamProviders, tags]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchItems(true);
  }, [fetchItems]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const renderItem = ({ item }: { item: Movie | TVShow }) => (
    <View style={[styles.itemContainer, { height: screenHeight }]}>
      <ExploreMovieCard
        movie={item}
        onPress={onItemPress}
      />
    </View>
  );

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
      removeClippedSubviews={true}
      maxToRenderPerBatch={3}
      windowSize={3}
      initialNumToRender={2}
    />
  );
}

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
});