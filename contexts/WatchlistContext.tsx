import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { Movie, TVShow } from '@/services/api';
import { useWatchlistStore } from '@/stores/watchlistStore';

type ContentItem = Movie | TVShow;

interface WatchlistContextType {
  savedMovies: Movie[];
  savedTVShows: TVShow[];
  loading: boolean;
  refreshWatchlist: () => Promise<void>;
  addToWatchlist: (item: ContentItem) => Promise<void>;
  removeFromWatchlist: (item: ContentItem) => Promise<void>;
  isInWatchlist: (item: ContentItem) => boolean;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

interface WatchlistProviderProps {
  children: ReactNode;
}

export function WatchlistProvider({ children }: WatchlistProviderProps) {
  const watchlistStore = useWatchlistStore();

  // Hydrate store on mount
  useEffect(() => {
    watchlistStore.hydrate();
  }, [watchlistStore.hydrate]);

  // Wrapper methods with error handling
  const handleAddToWatchlist = async (item: ContentItem) => {
    try {
      await watchlistStore.addToWatchlist(item);
    } catch (error) {
      Alert.alert('Error', 'Failed to add to watchlist. Please try again.');
      throw error;
    }
  };

  const handleRemoveFromWatchlist = async (item: ContentItem) => {
    try {
      await watchlistStore.removeFromWatchlist(item);
    } catch (error) {
      Alert.alert('Error', 'Failed to remove from watchlist. Please try again.');
      throw error;
    }
  };

  const value: WatchlistContextType = {
    savedMovies: watchlistStore.movies,
    savedTVShows: watchlistStore.tvShows,
    loading: watchlistStore.isLoading,
    refreshWatchlist: watchlistStore.fetchWatchlist,
    addToWatchlist: handleAddToWatchlist,
    removeFromWatchlist: handleRemoveFromWatchlist,
    isInWatchlist: watchlistStore.isInWatchlist,
  };

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist(): WatchlistContextType {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}