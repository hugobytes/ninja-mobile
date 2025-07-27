import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function WatchlistScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#F5DEB3', dark: '#8B4513' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="bookmark.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Watchlist</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Your Saved Content</ThemedText>
        <ThemedText>
          Keep track of movies and TV shows you want to watch. Add items from Movies and TV Shows tabs.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Watch Later</ThemedText>
        <ThemedText>
          Your personal collection of content to watch when you have time.
        </ThemedText>
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
    marginBottom: 8,
  },
});