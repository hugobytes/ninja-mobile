import { StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Movie, TVShow } from '@/services/api';

type ContentItem = Movie | TVShow;

const { width, height } = Dimensions.get('window');

interface MovieCardProps {
  movie: ContentItem;
  onPress?: (movie: ContentItem) => void;
  variant?: 'grid' | 'fullscreen';
}

interface FullscreenMovieCardProps {
  movie: ContentItem;
  onPress?: (movie: ContentItem) => void;
}

export function MovieCard({ movie, onPress, variant = 'grid' }: MovieCardProps) {
  const borderColor = useThemeColor({}, 'border');
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  
  if (variant === 'fullscreen') {
    return <FullscreenMovieCard movie={movie} onPress={onPress} />;
  }

  const cardWidth = (width - 48) / 2; // 2 cards per row with margins

  return (
    <TouchableOpacity
      style={[styles.card, { borderColor, backgroundColor, width: cardWidth }]}
      onPress={() => onPress?.(movie)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: movie.poster_url }}
        style={[styles.poster, { height: cardWidth * 1.5 }]}
        contentFit="cover"
        placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
      />
      
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title} numberOfLines={2}>
          {movie.title}
        </ThemedText>
        
        <ThemedText style={styles.year}>
          {'release_year' in movie ? movie.release_year : movie.first_air_year}
        </ThemedText>
        
        <ThemedView style={styles.ratingsContainer}>
          {movie.imdb_rating && (
            <ThemedView style={styles.ratingContainer}>
              <IconSymbol name="star.fill" size={12} color="#FFD700" />
              <ThemedText style={styles.rating}>
                {typeof movie.imdb_rating === 'number' 
                  ? movie.imdb_rating.toFixed(1) 
                  : parseFloat(movie.imdb_rating as string).toFixed(1)}
              </ThemedText>
            </ThemedView>
          )}
          {movie.rotten_tomatoes_rating && (
            <ThemedView style={styles.ratingContainer}>
              <IconSymbol name="circle.fill" size={12} color="#FF6347" />
              <ThemedText style={styles.rating}>
                {typeof movie.rotten_tomatoes_rating === 'number' 
                  ? movie.rotten_tomatoes_rating 
                  : parseInt(movie.rotten_tomatoes_rating as string)}%
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
        
        <ThemedView style={styles.genresContainer}>
          {movie.genres?.slice(0, 2).map((genre, index) => (
            <ThemedView 
              key={genre}
              style={[styles.genreTag, { borderColor: tintColor + '40' }]}
            >
              <ThemedText style={[styles.genreText, { color: tintColor }]}>
                {genre}
              </ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
        
        {movie.watch_providers?.stream?.length > 0 && (
          <ThemedView style={styles.streamingContainer}>
            <IconSymbol name="play.circle" size={14} color={tintColor} />
            <ThemedText style={[styles.streamingText, { color: tintColor }]}>
              {movie.watch_providers.stream[0]}
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    </TouchableOpacity>
  );
}

function FullscreenMovieCard({ movie, onPress }: FullscreenMovieCardProps) {
  const borderColor = useThemeColor({}, 'border');
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  
  const cardHeight = height * 0.8; // 80% of screen height
  const posterWidth = 150; // Fixed poster width

  return (
    <TouchableOpacity
      style={[styles.fullscreenCard, { borderColor, backgroundColor, height: cardHeight }]}
      onPress={() => onPress?.(movie)}
      activeOpacity={0.9}
    >
      <ThemedView style={styles.fullscreenTopSection}>
        <Image
          source={{ uri: movie.poster_url }}
          style={[styles.fullscreenPosterSmall, { width: posterWidth, height: posterWidth * 1.5 }]}
          contentFit="cover"
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        />
        
        <ThemedView style={styles.fullscreenTopContent}>
          <ThemedText style={styles.fullscreenYear}>
            {'release_year' in movie ? movie.release_year : movie.first_air_year}
          </ThemedText>
          
          <ThemedView style={styles.fullscreenRatingsContainer}>
            {movie.imdb_rating && (
              <ThemedView style={styles.fullscreenRatingContainer}>
                <IconSymbol name="star.fill" size={18} color="#FFD700" />
                <ThemedText style={styles.fullscreenRating}>
                  {typeof movie.imdb_rating === 'number' 
                    ? movie.imdb_rating.toFixed(1) 
                    : parseFloat(movie.imdb_rating as string).toFixed(1)}
                </ThemedText>
              </ThemedView>
            )}
            {movie.rotten_tomatoes_rating && (
              <ThemedView style={styles.fullscreenRatingContainer}>
                <IconSymbol name="circle.fill" size={18} color="#FF6347" />
                <ThemedText style={styles.fullscreenRating}>
                  {typeof movie.rotten_tomatoes_rating === 'number' 
                    ? movie.rotten_tomatoes_rating 
                    : parseInt(movie.rotten_tomatoes_rating as string)}%
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>
        </ThemedView>
      </ThemedView>
      
      <ThemedView style={styles.fullscreenTitleSection}>
        <ThemedText style={styles.fullscreenTitle}>
          {movie.title}
        </ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.fullscreenBottomContent}>
        <ThemedText style={styles.overview} numberOfLines={4}>
          {movie.overview}
        </ThemedText>
        
        <ThemedView style={styles.fullscreenGenresContainer}>
          {movie.genres?.slice(0, 4).map((genre) => (
            <ThemedView 
              key={genre}
              style={[styles.fullscreenGenreTag, { borderColor: tintColor + '40' }]}
            >
              <ThemedText style={[styles.fullscreenGenreText, { color: tintColor }]}>
                {genre}
              </ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
        
        {movie.watch_providers?.stream?.length > 0 && (
          <ThemedView style={styles.fullscreenStreamingContainer}>
            <IconSymbol name="play.circle.fill" size={18} color={tintColor} />
            <ThemedText style={[styles.fullscreenStreamingText, { color: tintColor }]}>
              Stream on {movie.watch_providers.stream.slice(0, 2).join(', ')}
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  poster: {
    width: '100%',
  },
  fullscreenCard: {
    width: width - 32,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginVertical: 10,
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  fullscreenTopSection: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
  },
  fullscreenTitleSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  fullscreenPosterSmall: {
    borderRadius: 12,
  },
  fullscreenTopContent: {
    flex: 1,
    justifyContent: 'flex-start',
    gap: 12,
  },
  fullscreenBottomContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flex: 1,
    justifyContent: 'space-between',
  },
  fullscreenTitle: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28,
    textAlign: 'left',
  },
  fullscreenYear: {
    fontSize: 16,
    opacity: 0.7,
    fontWeight: '500',
  },
  fullscreenRatingsContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  fullscreenRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullscreenRating: {
    fontSize: 16,
    marginLeft: 6,
    fontWeight: '600',
  },
  overview: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
    marginBottom: 16,
  },
  fullscreenGenresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  fullscreenGenreTag: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  fullscreenGenreText: {
    fontSize: 12,
    fontWeight: '600',
  },
  fullscreenStreamingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullscreenStreamingText: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '600',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 18,
  },
  year: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 6,
  },
  ratingsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
  },
  genreTag: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  genreText: {
    fontSize: 10,
    fontWeight: '500',
  },
  streamingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streamingText: {
    fontSize: 10,
    marginLeft: 4,
    fontWeight: '500',
  },
});