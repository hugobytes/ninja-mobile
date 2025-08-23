import React from 'react';
import {StyleSheet, TouchableOpacity, Dimensions, View} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Movie, TVShow } from '@/services/api';
import { CUSTOM_TAB_BAR_HEIGHT } from '@/constants/TabBar';

const { width, height } = Dimensions.get('window');

interface ExploreMovieCardProps {
  movie: Movie | TVShow;
  onPress?: (movie: Movie | TVShow) => void;
}

const SMALL_MOVIE_POSTER_PADDING = 16;

export function ExploreMovieCard({ movie, onPress }: ExploreMovieCardProps) {
  const insets = useSafeAreaInsets();

  return (
    <TouchableOpacity
      style={[styles.container, { height }]}
      onPress={() => onPress?.(movie)}
      activeOpacity={0.95}
    >
      <View>
          <Image
            source={{ uri: movie.poster_url }}
            style={styles.poster}
            contentFit="cover"
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          />
        <BlurView intensity={60} tint="dark" style={styles.blurView} />
      </View>
      <Image
          source={{ uri: movie.poster_url }}
          style={[styles.smallPoster, { 
            top: '50%',
            marginTop: -(((width - (SMALL_MOVIE_POSTER_PADDING * 2)) * 3/2) / 2) + (insets.top - CUSTOM_TAB_BAR_HEIGHT) / 2,
          }]}
          contentFit="cover"
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    height,
    position: 'relative',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  smallPoster: {
    position: 'absolute',
    width: width - (SMALL_MOVIE_POSTER_PADDING * 2),
    aspectRatio: 2/3, // Standard movie poster ratio
    alignSelf: 'center',
    left: SMALL_MOVIE_POSTER_PADDING,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1,
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.60)',
  },
});