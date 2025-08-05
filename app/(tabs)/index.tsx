import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { GenreChecklist } from '@/components/GenreChecklist';

export default function MoviesScreen() {
  const handleGenreChange = (selectedGenres: string[]) => {
    console.log('Selected movie genres:', selectedGenres);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Movies</ThemedText>
        <ThemedText type="subtitle">Discover by Genre</ThemedText>
      </ThemedView>
      <GenreChecklist type="movie" onGenreChange={handleGenreChange} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 4,
  },
});