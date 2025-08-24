import React from 'react';
import { StyleSheet, TouchableOpacity, View, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Pill } from '@/components/ui/Pill';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Movie, TVShow } from '@/services/api';
import { useWatchlist } from '@/contexts/WatchlistContext';
import {Colors} from "@/constants/Colors";

export default function MovieDetailsScreen() {
  const { movieData, selectedTags } = useLocalSearchParams();
  
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const { addToWatchlist, removeFromWatchlist, isInWatchlist, loading } = useWatchlist();
  
  // Parse the movie data from params
  const movie: Movie | TVShow = movieData ? JSON.parse(movieData as string) : null;
  const selectedTagsList: string[] = selectedTags ? JSON.parse(selectedTags as string) : [];

  if (!movie) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.errorContainer}>
          <ThemedText>Movie not found</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const handleWatchlistPress = async () => {
    if (!movie) return;
    
    try {
      if (isInWatchlist(movie)) {
        await removeFromWatchlist(movie);
      } else {
        await addToWatchlist(movie);
      }
    } catch (error) {
      console.error('Watchlist operation failed:', error);
    }
  };

  const openInGoogle = () => {
    const releaseYear = 'release_year' in movie ? movie.release_year : movie.first_air_year;
    const searchQuery = `${movie.title} ${releaseYear}`;
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    
    Linking.openURL(googleUrl).catch(err => {
      console.error('Failed to open Google search:', err);
    });
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <ParallaxScrollView
        headerBackgroundColor={backgroundColor}
        contentBackgroundColor={backgroundColor}
        headerImage={
          <Image
            source={{ uri: movie.poster_url }}
            style={styles.headerPoster}
            contentFit="cover"
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          />
        }
      >
        <View style={styles.heroContent}>
          <View style={styles.titleRow}>
            <View style={{flex: 1}}>
              <ThemedText type="title" style={{flex: 1}}>{movie.title}</ThemedText>
              <View style={styles.heroMetadata}>
                <ThemedText style={styles.heroYear}>
                  {'release_year' in movie ? movie.release_year : movie.first_air_year}
                </ThemedText>
                {movie.runtime && (
                    <>
                      <ThemedText style={styles.heroDot}>•</ThemedText>
                      <ThemedText style={styles.heroRuntime}>
                        {movie.runtime} min
                      </ThemedText>
                    </>
                )}
              </View>

              <View style={styles.heroRatings}>
                {movie.imdb_rating && (
                    <View style={styles.heroRatingItem}>
                      <IconSymbol name="star.fill" size={28} color="#FFD700" />
                      <ThemedText  type="subtitle">
                        {typeof movie.imdb_rating === 'number'
                            ? movie.imdb_rating.toFixed(1)
                            : parseFloat(movie.imdb_rating as string).toFixed(1)}
                      </ThemedText>
                    </View>
                )}
                {movie.rotten_tomatoes_rating && (
                    <View style={styles.heroRatingItem}>
                      <IconSymbol name="circle.fill" size={28} color="#FF6347" />
                      <ThemedText type="subtitle">
                        {typeof movie.rotten_tomatoes_rating === 'number'
                            ? movie.rotten_tomatoes_rating
                            : parseInt(movie.rotten_tomatoes_rating as string)}%
                      </ThemedText>
                    </View>
                )}
              </View>
            </View>
            <TouchableOpacity
                style={styles.watchlistButton}
                onPress={handleWatchlistPress}
                activeOpacity={0.7}
                disabled={loading}
            >
              <IconSymbol
                  name={isInWatchlist(movie) ? "heart.fill" : "heart"}
                  size={32}
                  color={isInWatchlist(movie) ? "#FF3B30" : "white"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Overview */}
          {movie.overview && (
            <View style={styles.section}>
              <ThemedText style={styles.overview}>{movie.overview}</ThemedText>
            </View>
          )}

          {/* Tags */}
          {movie.tags && movie.tags.length > 0 && (
            <View style={styles.section}>
              <View style={styles.genreContainer}>
                {movie.tags.map((tag) => {
                  const isHighlighted = selectedTagsList.includes(tag);
                  return (
                    <Pill
                      key={tag}
                      label={tag}
                      selected={isHighlighted}
                      onPress={() => {}}
                    />
                  );
                })}
              </View>
            </View>
          )}

          {/* Streaming */}
          {movie.watch_providers?.stream && movie.watch_providers.stream.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Where to watch</ThemedText>
              <View style={styles.streamingRow}>
                <ThemedText style={[styles.streamingText]}>
                  {movie.watch_providers.stream.slice(0, 3).join(', ')}
                </ThemedText>
              </View>
            </View>
          )}

          {/*Google this*/}
          <TouchableOpacity
              style={[styles.searchButton, { backgroundColor: Colors.redRed }]}
              onPress={openInGoogle}
              activeOpacity={0.8}
          >
            <IconSymbol name="magnifyingglass" size={20} color="white" style={styles.buttonIcon} />
            <ThemedText style={styles.searchButtonText}>Search the web</ThemedText>
          </TouchableOpacity>
        </View>
      </ParallaxScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  watchlistButton: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerPoster: {
    width: '100%',
    height: 250,
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  heroContent: {
    paddingHorizontal: 16,
  },
  heroMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroYear: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  heroDot: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    marginHorizontal: 8,
  },
  heroRuntime: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  heroRatings: {
    flexDirection: 'row',
    gap: 16,
  },
  heroRatingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroRatingText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  content: {
    paddingHorizontal: 16
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  overview: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
  },
  creditRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  creditLabel: {
    fontSize: 16,
    fontWeight: '600',
    width: 80,
    opacity: 0.7,
  },
  creditValue: {
    flex: 1,
    fontSize: 16,
    opacity: 0.9,
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreTag: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.surface,
  },
  genreText: {
    fontSize: 16,
    fontWeight: '600',
  },
  streamingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streamingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  titleRow: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    gap: 16,
    alignItems: 'flex-start',
  },
  searchButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    // marginHorizontal: 20,
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