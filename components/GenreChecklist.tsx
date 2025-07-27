import { useState } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';

const MOVIE_GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music',
  'Mystery', 'Romance', 'Science Fiction', 'Thriller', 'War', 'Western'
];

const TV_GENRES = [
  'Action & Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama',
  'Family', 'Fantasy', 'Kids', 'Mystery', 'News', 'Reality',
  'Sci-Fi & Fantasy', 'Soap', 'Talk', 'War & Politics', 'Western'
];

interface GenreChecklistProps {
  type: 'movie' | 'tv';
  onGenreChange?: (selectedGenres: string[]) => void;
}

export function GenreChecklist({ type, onGenreChange }: GenreChecklistProps) {
  const genres = type === 'movie' ? MOVIE_GENRES : TV_GENRES;
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');

  const toggleGenre = (genre: string) => {
    const newSelection = selectedGenres.includes(genre)
      ? selectedGenres.filter(g => g !== genre)
      : [...selectedGenres, genre];
    
    setSelectedGenres(newSelection);
    onGenreChange?.(newSelection);
  };

  const handleExplore = () => {
    const genresParam = selectedGenres.join(',');
    router.push({
      pathname: '/explore',
      params: { genres: genresParam, type }
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Select Genres
      </ThemedText>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.genreGrid}>
          {genres.map((genre) => {
            const isSelected = selectedGenres.includes(genre);
            return (
              <TouchableOpacity
                key={genre}
                style={[
                  styles.genreItem,
                  { borderColor },
                  isSelected && { backgroundColor: tintColor + '20', borderColor: tintColor }
                ]}
                onPress={() => toggleGenre(genre)}
                activeOpacity={0.7}
              >
                <IconSymbol
                  name={isSelected ? 'checkmark.circle.fill' : 'circle'}
                  size={20}
                  color={isSelected ? tintColor : borderColor}
                  style={styles.checkIcon}
                />
                <ThemedText
                  style={[
                    styles.genreText,
                    isSelected && { color: tintColor }
                  ]}
                >
                  {genre}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </ThemedView>
      </ScrollView>
      {selectedGenres.length > 0 && (
        <TouchableOpacity
          style={[styles.exploreButton, { backgroundColor: tintColor }]}
          onPress={handleExplore}
          activeOpacity={0.8}
        >
          <IconSymbol name="play.fill" size={20} color="white" style={styles.buttonIcon} />
          <ThemedText style={styles.exploreButtonText}>
            Explore {selectedGenres.length} {selectedGenres.length === 1 ? 'Genre' : 'Genres'}
          </ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  genreGrid: {
    gap: 8,
  },
  genreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  checkIcon: {
    marginRight: 12,
  },
  genreText: {
    flex: 1,
    fontSize: 16,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonIcon: {
    marginRight: 8,
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});