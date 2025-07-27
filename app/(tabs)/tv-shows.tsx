import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { GenreChecklist } from '@/components/GenreChecklist';

export default function TVShowsScreen() {
  const handleGenreChange = (selectedGenres: string[]) => {
    console.log('Selected TV show genres:', selectedGenres);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="tv"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">TV Shows</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Discover by Genre</ThemedText>
        <ThemedText style={styles.description}>
          Select your favorite TV show genres to get personalized recommendations.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.genreContainer}>
        <GenreChecklist type="tv" onGenreChange={handleGenreChange} />
      </ThemedView>
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
  },
  stepContainer: {
    gap: 8,
    marginBottom: 16,
  },
  description: {
    marginBottom: 8,
  },
  genreContainer: {
    flex: 1,
    minHeight: 400,
  },
});