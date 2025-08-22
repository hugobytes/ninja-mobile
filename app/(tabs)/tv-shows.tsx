import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ExploreList } from '@/components/ExploreList';
import { FilterModal } from '@/components/FilterModal';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from "@/constants/Colors";
import { TVShow } from '@/services/api';
import { useFiltersStore, useTVFilters } from '@/lib/filters';

export default function TVShowsScreen() {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const router = useRouter();
  
  const tvFilters = useTVFilters();
  const { fetchAvailableFilters, setTVStreamProviders, setTVTags } = useFiltersStore();
  
  const tintColor = useThemeColor({}, 'tint');

  useEffect(() => {
    // Fetch available filters when component mounts
    fetchAvailableFilters();
  }, [fetchAvailableFilters]);

  const handleGenreChange = (tags: string[]) => {
    setTVTags(tags);
  };

  const handleTVShowPress = (tvShow: TVShow) => {
    router.push({
      pathname: '/movie/[id]',
      params: {
        id: tvShow.id.toString(),
        movieData: JSON.stringify(tvShow)
      }
    });
  };

  const handleWatchlistPress = (tvShow: TVShow) => {
    console.log('Add to watchlist:', tvShow.title);
  };

  const isTVShowInWatchlist = (tvShow: TVShow) => {
    return false; // TODO: Implement watchlist logic
  };

  const hasActiveFilters = (tvFilters?.streamProviders?.length > 0) || (tvFilters?.tags?.length > 0);

  return (
    <View style={styles.container}>
      <View style={styles.headerOverlay}>
        <View style={styles.headerLeft}>
          <ThemedText style={styles.title}>TV Shows</ThemedText>
          {hasActiveFilters && (
            <ThemedText style={styles.subtitle}>
              {[
                ...((tvFilters?.streamProviders?.length > 0) ? [`${tvFilters.streamProviders.length} providers`] : []),
                ...((tvFilters?.tags?.length > 0) ? [`${tvFilters.tags.length} tags`] : [])
              ].join(' • ')}
            </ThemedText>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
          activeOpacity={0.7}
        >
          <IconSymbol 
            name={hasActiveFilters ? "line.horizontal.3.decrease.circle.fill" : "line.horizontal.3.decrease.circle"} 
            size={28} 
            color="white" 
          />
        </TouchableOpacity>
      </View>

      <ExploreList
        type="tv"
        streamProviders={tvFilters?.streamProviders || []}
        tags={tvFilters?.tags || []}
        onItemPress={handleTVShowPress}
        onWatchlistPress={handleWatchlistPress}
        isItemInWatchlist={isTVShowInWatchlist}
      />

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        type="tv"
        onGenreChange={handleGenreChange}
        selectedGenres={tvFilters?.tags || []}
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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