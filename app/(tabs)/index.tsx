import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ExploreList, ExploreListRef } from '@/components/ExploreList';
import { FilterModal } from '@/components/FilterModal';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from "@/constants/Colors";
import { Movie, TVShow } from '@/services/api';
import { useMovieFilters } from '@/lib/filters';

export default function MoviesScreen() {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const router = useRouter();
  const exploreListRef = useRef<ExploreListRef>(null);
  
  const movieFilters = useMovieFilters();

  // Reset scroll position when filters change
  useEffect(() => {
    exploreListRef.current?.scrollToTop();
  }, [movieFilters?.streamProviders, movieFilters?.tags]);

  const handleGenreChange = () => {
    // This is handled automatically by FilterSelection component
  };

  const handleMoviePress = (item: Movie | TVShow) => {
    router.push({
      pathname: '/movie/[id]',
      params: {
        id: item.id.toString(),
        movieData: JSON.stringify(item),
        selectedTags: JSON.stringify(movieFilters?.tags || [])
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
      <View style={styles.headerOverlay}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
          activeOpacity={0.8}
        >
          <IconSymbol
            style={{opacity: 0.75}}
            name={hasActiveFilters ? "movieclapper.fill" : "movieclapper"} 
            size={28}
            color="white" 
          />
        </TouchableOpacity>
      </View>

      <ExploreList
        ref={exploreListRef}
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
    justifyContent: 'flex-end',
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