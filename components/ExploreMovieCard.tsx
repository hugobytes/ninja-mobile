import React from 'react';
import {StyleSheet, TouchableOpacity, Dimensions, View} from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Movie, TVShow } from '@/services/api';
import { CUSTOM_TAB_BAR_HEIGHT } from '@/constants/TabBar';

const { width, height } = Dimensions.get('window');

interface ExploreMovieCardProps {
  movie: Movie | TVShow;
  onPress?: (movie: Movie | TVShow) => void;
}

export function ExploreMovieCard({ movie, onPress }: ExploreMovieCardProps) {
  const insets = useSafeAreaInsets();

  return (
    <TouchableOpacity
      style={[styles.container, { height }]}
      onPress={() => onPress?.(movie)}
      activeOpacity={0.95}
    >
      {/* Full Screen Poster - FULL DEVICE HEIGHT */}
      <Image
        source={{ uri: movie.poster_url }}
        style={styles.poster}
        contentFit="cover"
        placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    position: 'relative',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    lineHeight: 32,
  },
  ratingsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  ratingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});