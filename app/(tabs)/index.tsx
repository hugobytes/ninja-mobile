import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ExploreList } from '@/components/ExploreList';
import { FilterModal } from '@/components/FilterModal';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from "@/constants/Colors";
import { Movie, TVShow } from '@/services/api';
import { useFiltersStore, useMovieFilters } from '@/lib/filters';
import {BlurView} from "expo-blur";

export default function MoviesScreen() {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const router = useRouter();
  
  const movieFilters = useMovieFilters();
  const { fetchAvailableFilters, setMovieStreamProviders, setMovieTags } = useFiltersStore();

  useEffect(() => {
    // Fetch available filters when component mounts
    fetchAvailableFilters();
  }, [fetchAvailableFilters]);

  const handleGenreChange = (tags: string[]) => {
    setMovieTags(tags);
  };

  const handleMoviePress = (item: Movie | TVShow) => {
    router.push({
      pathname: '/movie/[id]',
      params: {
        id: item.id.toString(),
        movieData: JSON.stringify(item)
      }
    });
  };

  const handleWatchlistPress = (item: Movie | TVShow) => {
    console.log('Add to watchlist:', item.title);
  };

  const isMovieInWatchlist = (item: Movie | TVShow) => {
    return false; // TODO: Implement watchlist logic
  };

  const hasActiveFilters = (movieFilters?.streamProviders?.length > 0) || (movieFilters?.tags?.length > 0);

  return (
    <View style={styles.container}>
      <BlurView intensity={100} tint="light" style={styles.headerOverlay}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
          activeOpacity={0.7}
        >
          <ThemedText>Any genre</ThemedText>
          <IconSymbol 
            name={hasActiveFilters ? "line.horizontal.3.decrease.circle.fill" : "line.horizontal.3.decrease.circle"} 
            size={28} 
            color="white" 
          />
        </TouchableOpacity>
      </BlurView>

      <ExploreList
        type="movie"
        streamProviders={movieFilters?.streamProviders || []}
        tags={movieFilters?.tags || []}
        onItemPress={handleMoviePress}
        onWatchlistPress={handleWatchlistPress}
        isItemInWatchlist={isMovieInWatchlist}
      />

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        type="movie"
        onGenreChange={handleGenreChange}
        selectedGenres={movieFilters?.tags || []}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
  },
  headerOverlay: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backgroundColor: 'transparent',
  },
  headerLeft: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});