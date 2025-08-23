import React, { useState, useCallback } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, RefreshControl, View, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { Image as ExpoImage } from 'expo-image';

import { Pill } from '@/components/ui/Pill';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Movie, TVShow } from '@/services/api';
import { useWatchlist } from '@/contexts/WatchlistContext';
import { Colors } from '@/constants/Colors';

type ContentItem = Movie | TVShow;

export default function WatchlistScreen() {
  const [contentTypeFilter, setContentTypeFilter] = useState<'all' | 'movie' | 'tv'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  
  const { savedMovies, savedTVShows, loading, refreshWatchlist } = useWatchlist();
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');

  const allSavedContent = [...savedMovies, ...savedTVShows].sort((a, b) => 
    new Date(b.last_synced_at).getTime() - new Date(a.last_synced_at).getTime()
  );

  // Filter content by type
  const filteredByType = contentTypeFilter === 'all' 
    ? allSavedContent
    : allSavedContent.filter(item => {
        if (contentTypeFilter === 'tv') {
          return item.type === 'tv_show' || item.type === 'tv';
        }
        return item.type === contentTypeFilter;
      });

  // Get recently saved (first 6 items)
  const recentlySaved = filteredByType.slice(0, 6);

  // Calculate tag collections (4+ items, max 20 collections)
  const tagCounts = filteredByType.reduce((acc, item) => {
    item.tags?.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  console.log('Tag counts:', tagCounts);
  console.log('Filtered content:', filteredByType.length, 'items');
  
  // Get up to 20 collections with 4+ items each, sorted by popularity
  const tagCollections = Object.entries(tagCounts)
    .filter(([,count]) => count >= 4)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20)
    .map(([tagName, count]) => ({
      tagName,
      count,
      items: filteredByType.filter(item => item.tags?.includes(tagName))
    }));

  console.log('Tag collections:', tagCollections.length, 'collections found');
  tagCollections.forEach(collection => {
    console.log(`- ${collection.tagName}: ${collection.count} items`);
  });

  // Refresh watchlist when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshWatchlist().catch();
    }, [refreshWatchlist])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshWatchlist();
    setRefreshing(false);
  };

  const handleContentPress = (item: ContentItem) => {
    router.push({
      pathname: '/movie/[id]',
      params: {
        id: item.id.toString(),
        movieData: JSON.stringify(item),
        selectedTags: JSON.stringify([])
      }
    });
  };

  const renderPosterCard = ({ item }: { item: ContentItem }) => (
    <TouchableOpacity
      style={styles.posterCard}
      onPress={() => handleContentPress(item)}
      activeOpacity={0.7}
    >
      <ExpoImage
        source={{ uri: item.poster_url }}
        style={styles.posterImage}
        contentFit="cover"
        placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
      />
    </TouchableOpacity>
  );

  const renderContentTypeFilters = () => (
    <View style={styles.filterContainer}>
      <Pill
        label="All"
        selected={contentTypeFilter === 'all'}
        onPress={() => setContentTypeFilter('all')}
      />
      <Pill
        label="Movies"
        selected={contentTypeFilter === 'movie'}
        onPress={() => setContentTypeFilter('movie')}
      />
      <Pill
        label="TV Shows"
        selected={contentTypeFilter === 'tv'}
        onPress={() => setContentTypeFilter('tv')}
      />
    </View>
  );

  const renderSection = (title: string, data: ContentItem[]) => {
    if (data.length === 0) return null;
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionTitleContainer}>
          <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
        </View>
        <FlatList
          data={data}
          renderItem={renderPosterCard}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          ItemSeparatorComponent={() => <View style={styles.posterSeparator} />}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: Colors.background }]}>
        <ParallaxScrollView
          headerBackgroundColor={backgroundColor}
          contentBackgroundColor={Colors.background}
          headerImage={
            <Image
              source={require('@/assets/images/popcorn.avif')}
              style={styles.headerImage}
            />
          }>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={tintColor} />
            <ThemedText style={styles.loadingText}>Loading your watchlist...</ThemedText>
          </View>
        </ParallaxScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <ParallaxScrollView
        headerBackgroundColor={backgroundColor}
        contentBackgroundColor={Colors.background}
        headerImage={
          <Image
            source={require('@/assets/images/popcorn.avif')}
            style={styles.headerImage}
          />
        }>
        <View style={styles.titleContainer}>
          <ThemedText type="title">Watchlist</ThemedText>
          <ThemedText style={styles.subtitle}>
            {allSavedContent.length} {allSavedContent.length === 1 ? 'item' : 'items'}
          </ThemedText>
        </View>
        
        {allSavedContent.length === 0 ? (
          <View style={styles.stepContainer}>
            <ThemedText style={styles.emptyTitle}>Your watchlist is empty</ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Add movies and TV shows from the Movies and TV Shows tabs to build your watchlist.
            </ThemedText>
          </View>
        ) : (
          <ScrollView 
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            scrollEnabled={false} // Let ParallaxScrollView handle scrolling
          >
            {renderContentTypeFilters()}
            {renderSection('Recently Saved', recentlySaved)}
            {tagCollections.map(collection => 
              <React.Fragment key={collection.tagName}>
                {renderSection(`${collection.tagName}`, collection.items)}
              </React.Fragment>
            )}
          </ScrollView>
        )}
      </ParallaxScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerImage: {
    width: '100%',
    height: 250,
    bottom: 0,
    left: 0,
    position: 'absolute',
    opacity: 0.6,
    resizeMode: 'cover',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'baseline',
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitleContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  horizontalList: {
    paddingHorizontal: 16,
  },
  posterCard: {
    width: 120,
    height: 180,
    borderRadius: 8,
    overflow: 'hidden',
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  posterSeparator: {
    width: 12,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 22,
  },
});