import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Alert } from 'react-native';
import { api, Movie, TVShow } from '@/services/api';
import { userService } from '@/services/userService';

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
  const [savedMovies, setSavedMovies] = useState<Movie[]>([]);
  const [savedTVShows, setSavedTVShows] = useState<TVShow[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshWatchlist = useCallback(async () => {
    setLoading(true);
    try {
      const accessKey = await userService.getAccessKey();
      if (!accessKey) {
        console.warn('Failed to get access key');
        return;
      }

      const [moviesResponse, tvShowsResponse] = await Promise.all([
        api.getSavedMovies(accessKey),
        api.getSavedTVShows(accessKey)
      ]);

      if (moviesResponse.success) {
        setSavedMovies(moviesResponse.data as Movie[]);
      }
      if (tvShowsResponse.success) {
        setSavedTVShows(tvShowsResponse.data as TVShow[]);
      }
    } catch (error) {
      console.error('Failed to refresh watchlist:', error);
      // Reset watchlist on error to avoid stale data
      setSavedMovies([]);
      setSavedTVShows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addToWatchlist = useCallback(async (item: ContentItem) => {
    try {
      const accessKey = await userService.getAccessKey();
      if (!accessKey) {
        Alert.alert('Error', 'Unable to authenticate. Please try again.');
        return;
      }

      if (item.type === 'movie') {
        await api.saveMovie({ movie_id: item.id }, accessKey);
        setSavedMovies(prev => [...prev, item as Movie]);
      } else {
        await api.saveTVShow({ tv_show_id: item.id }, accessKey);
        setSavedTVShows(prev => [...prev, item as TVShow]);
      }
      
      console.log(`Successfully added ${item.type} to watchlist:`, item.title);
    } catch (error) {
      console.error('Failed to add to watchlist:', error);
      Alert.alert('Error', 'Failed to add to watchlist. Please try again.');
      throw error;
    }
  }, []);

  const removeFromWatchlist = useCallback(async (item: ContentItem) => {
    try {
      const accessKey = await userService.getAccessKey();
      if (!accessKey) {
        Alert.alert('Error', 'Please try again later.');
        return;
      }

      if (item.type === 'movie') {
        await api.removeSavedMovie(item.id, accessKey);
        setSavedMovies(prev => prev.filter(movie => movie.id !== item.id));
      } else {
        await api.removeSavedTVShow(item.id, accessKey);
        setSavedTVShows(prev => prev.filter(show => show.id !== item.id));
      }
    } catch (error) {
      console.error('Failed to remove from watchlist:', error);
      Alert.alert('Error', 'Failed to remove from watchlist. Please try again.');
      throw error;
    }
  }, []);

  const isInWatchlist = useCallback((item: ContentItem): boolean => {
    if (item.type === 'movie') {
      return savedMovies.some(movie => movie.id === item.id);
    } else {
      return savedTVShows.some(show => show.id === item.id);
    }
  }, [savedMovies, savedTVShows]);

  const value: WatchlistContextType = {
    savedMovies,
    savedTVShows,
    loading,
    refreshWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
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