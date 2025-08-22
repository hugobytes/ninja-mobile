import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Dimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Movie, TVShow } from '@/services/api';
import { useWatchlist } from '@/contexts/WatchlistContext';

const { height } = Dimensions.get('window');

export default function MovieDetailsScreen() {
  const { movieData } = useLocalSearchParams();
  const router = useRouter();
  
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const { addToWatchlist, removeFromWatchlist, isInWatchlist, loading } = useWatchlist();
  
  // Parse the movie data from params
  const movie: Movie | TVShow = movieData ? JSON.parse(movieData as string) : null;

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <IconSymbol name="chevron.left" size={24} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.watchlistButton}
          onPress={handleWatchlistPress}
          activeOpacity={0.7}
          disabled={loading}
        >
          <IconSymbol 
            name={isInWatchlist(movie) ? "heart.fill" : "heart"} 
            size={24} 
            color={isInWatchlist(movie) ? "#FF3B30" : "white"} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Hero Poster */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: movie.poster_url }}
            style={styles.heroPoster}
            contentFit="cover"
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          />
          
          {/* Overlay gradient */}
          <View style={styles.heroOverlay}>
            <View style={styles.heroContent}>
              <ThemedText style={styles.heroTitle}>{movie.title}</ThemedText>
              
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
                    <IconSymbol name="star.fill" size={16} color="#FFD700" />
                    <ThemedText style={styles.heroRatingText}>
                      {typeof movie.imdb_rating === 'number' 
                        ? movie.imdb_rating.toFixed(1) 
                        : parseFloat(movie.imdb_rating as string).toFixed(1)}
                    </ThemedText>
                  </View>
                )}
                {movie.rotten_tomatoes_rating && (
                  <View style={styles.heroRatingItem}>
                    <IconSymbol name="circle.fill" size={16} color="#FF6347" />
                    <ThemedText style={styles.heroRatingText}>
                      {typeof movie.rotten_tomatoes_rating === 'number' 
                        ? movie.rotten_tomatoes_rating 
                        : parseInt(movie.rotten_tomatoes_rating as string)}%
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Overview */}
          {movie.overview && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Overview</ThemedText>
              <ThemedText style={styles.overview}>{movie.overview}</ThemedText>
            </View>
          )}

          {/* Cast & Crew */}
          <View style={styles.section}>
            {movie.type === 'movie' ? (
              <>
                {(movie as Movie).directors && (movie as Movie).directors.length > 0 && (
                  <View style={styles.creditRow}>
                    <ThemedText style={styles.creditLabel}>Director</ThemedText>
                    <ThemedText style={styles.creditValue}>
                      {(movie as Movie).directors.slice(0, 2).join(', ')}
                    </ThemedText>
                  </View>
                )}
              </>
            ) : (
              <>
                {(movie as TVShow).creators && (movie as TVShow).creators.length > 0 && (
                  <View style={styles.creditRow}>
                    <ThemedText style={styles.creditLabel}>Creator</ThemedText>
                    <ThemedText style={styles.creditValue}>
                      {(movie as TVShow).creators.slice(0, 2).join(', ')}
                    </ThemedText>
                  </View>
                )}
              </>
            )}

            {movie.cast && movie.cast.length > 0 && (
              <View style={styles.creditRow}>
                <ThemedText style={styles.creditLabel}>Cast</ThemedText>
                <ThemedText style={styles.creditValue}>
                  {movie.cast.slice(0, 4).join(', ')}
                </ThemedText>
              </View>
            )}
          </View>

          {/* Genres */}
          {movie.genres && movie.genres.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Genres</ThemedText>
              <View style={styles.genreContainer}>
                {movie.genres.map((genre) => (
                  <View key={genre} style={[styles.genreTag, { borderColor: tintColor + '40' }]}>
                    <ThemedText style={[styles.genreText, { color: tintColor }]}>
                      {genre}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Streaming */}
          {movie.watch_providers?.stream && movie.watch_providers.stream.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Where to Watch</ThemedText>
              <View style={styles.streamingRow}>
                <IconSymbol name="play.circle.fill" size={20} color={tintColor} />
                <ThemedText style={[styles.streamingText, { color: tintColor }]}>
                  {movie.watch_providers.stream.slice(0, 3).join(', ')}
                </ThemedText>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    height: height * 0.7,
    position: 'relative',
  },
  heroPoster: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
    justifyContent: 'flex-end',
  },
  heroContent: {
    padding: 20,
    paddingBottom: 40,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
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
    padding: 20,
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
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  genreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  streamingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streamingText: {
    fontSize: 16,
    fontWeight: '600',
  },
});