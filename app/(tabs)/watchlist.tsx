import { useState, useCallback } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, RefreshControl, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';

import { MovieCard } from '@/components/MovieCard';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Movie, TVShow } from '@/services/api';
import { useWatchlist } from '@/contexts/WatchlistContext';

type ContentItem = Movie | TVShow;

export default function WatchlistScreen() {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  const { savedMovies, savedTVShows, loading, refreshWatchlist, removeFromWatchlist } = useWatchlist();
  const tintColor = useThemeColor({}, 'tint');

  const allSavedContent = [...savedMovies, ...savedTVShows].sort((a, b) => 
    new Date(b.last_synced_at).getTime() - new Date(a.last_synced_at).getTime()
  );

  // Get all unique genres from saved content
  const availableGenres = Array.from(
    new Set(allSavedContent.flatMap(item => item.genres || []))
  ).sort();

  // Filter content by selected genres
  const filteredContent = selectedGenres.length === 0 
    ? allSavedContent 
    : allSavedContent.filter(item => 
        item.genres?.some(genre => selectedGenres.includes(genre))
      );

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

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };


  const handleRemoveFromWatchlist = async (item: ContentItem) => {
    try {
      await removeFromWatchlist(item);
    } catch (error) {
      // Error handling is done in the context
    }
  };

  const handleContentPress = (item: ContentItem) => {
    console.log('Content pressed:', item.title);
    // TODO: Navigate to content details
  };

  const renderContent = ({ item }: { item: ContentItem }) => (
    <View style={styles.cardContainer}>
      <MovieCard 
        movie={item} 
        onPress={handleContentPress} 
        variant="grid"
        onWatchlistPress={handleRemoveFromWatchlist}
        isInWatchlist={true}
      />
    </View>
  );

  const renderGenreFilter = () => (
    <View style={styles.genreFilterContainer}>
      <ThemedText style={styles.genreFilterTitle}>Filter by Genre</ThemedText>
      <View style={styles.genreGrid}>
        {availableGenres.map((genre) => {
          const isSelected = selectedGenres.includes(genre);
          return (
            <View
              key={genre}
              style={[
                styles.genreChip,
                isSelected && { backgroundColor: tintColor + '20', borderColor: tintColor }
              ]}
              onTouchEnd={() => toggleGenre(genre)}
            >
              <IconSymbol
                name={isSelected ? 'checkmark.circle.fill' : 'circle'}
                size={16}
                color={isSelected ? tintColor : '#666'}
                style={styles.genreIcon}
              />
              <ThemedText
                style={[
                  styles.genreText,
                  isSelected && { color: tintColor }
                ]}
              >
                {genre}
              </ThemedText>
            </View>
          );
        })}
      </View>
      {selectedGenres.length > 0 && (
        <View style={styles.clearFilterContainer}>
          <View
            style={[styles.clearButton, { backgroundColor: tintColor }]}
            onTouchEnd={() => setSelectedGenres([])}
          >
            <ThemedText style={styles.clearButtonText}>
              Clear Filters ({selectedGenres.length})
            </ThemedText>
          </View>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
        headerImage={
          <IconSymbol
            size={310}
            color="#808080"
            name="bookmark.fill"
            style={styles.headerImage}
          />
        }>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
          <ThemedText style={styles.loadingText}>Loading your watchlist...</ThemedText>
        </View>
      </ParallaxScrollView>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="bookmark.fill"
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
        <>
          <View style={styles.stepContainer}>
            <ThemedText type="subtitle">Your Saved Content</ThemedText>
            <ThemedText style={styles.description}>
              {selectedGenres.length === 0 
                ? `Browse your ${allSavedContent.length} saved movies and TV shows`
                : `Showing ${filteredContent.length} items matching selected genres`
              }
            </ThemedText>
          </View>
          
          {availableGenres.length > 0 && renderGenreFilter()}
          
          <View style={styles.contentContainer}>
            <FlatList
              data={filteredContent}
              renderItem={renderContent}
              keyExtractor={(item) => `${item.type}-${item.id}`}
              numColumns={2}
              columnWrapperStyle={styles.row}
              contentContainerStyle={styles.list}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
              showsVerticalScrollIndicator={false}
              scrollEnabled={false} // Let ParallaxScrollView handle scrolling
            />
          </View>
        </>
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'baseline',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 16,
  },
  description: {
    marginBottom: 8,
    opacity: 0.8,
  },
  contentContainer: {
    flex: 1,
    minHeight: 400,
  },
  genreFilterContainer: {
    marginBottom: 24,
  },
  genreFilterTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#666',
    marginBottom: 8,
  },
  genreIcon: {
    marginRight: 6,
  },
  genreText: {
    fontSize: 14,
  },
  clearFilterContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    gap: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardContainer: {
    width: '48%',
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