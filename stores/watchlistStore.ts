import { create } from 'zustand';
import { storage } from '@/services/storage';
import { api, Movie, TVShow } from '@/services/api';
import { userService } from '@/services/userService';

type ContentItem = Movie | TVShow;

interface WatchlistState {
  // Data
  movies: Movie[];
  tvShows: TVShow[];
  isLoading: boolean;
  isStale: boolean;
  lastFetched: number | null;
  error: string | null;

  // Actions
  fetchWatchlist: () => Promise<void>;
  refreshWatchlist: () => Promise<void>;
  addToWatchlist: (item: ContentItem) => Promise<void>;
  removeFromWatchlist: (item: ContentItem) => Promise<void>;
  isInWatchlist: (item: ContentItem) => boolean;
  hydrate: () => Promise<void>;
  reset: () => void;
}

const MOVIES_CACHE_KEY = 'watchlistMovies';
const TV_SHOWS_CACHE_KEY = 'watchlistTVShows';
const CACHE_TTL_MINUTES = 5; // 5 minute cache for watchlist

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  // Initial state
  movies: [],
  tvShows: [],
  isLoading: false,
  isStale: false,
  lastFetched: null,
  error: null,

  // Load cached data on app start
  hydrate: async () => {
    try {
      const [moviesCached, tvShowsCached] = await Promise.all([
        storage.getCached<Movie[]>(MOVIES_CACHE_KEY),
        storage.getCached<TVShow[]>(TV_SHOWS_CACHE_KEY)
      ]);
      
      const hasData = moviesCached.data || tvShowsCached.data;
      const isStale = moviesCached.isStale || tvShowsCached.isStale;
      
      if (hasData) {
        set({
          movies: moviesCached.data || [],
          tvShows: tvShowsCached.data || [],
          isStale,
          lastFetched: Date.now()
        });

        // If stale, refresh in background
        if (isStale) {
          get().refreshWatchlist();
        }
      } else {
        // No cached data, fetch fresh
        get().fetchWatchlist();
      }
    } catch (error) {
      console.warn('Failed to hydrate watchlist from cache:', error);
      get().fetchWatchlist();
    }
  },

  // Fetch watchlist (shows loading state)
  fetchWatchlist: async () => {
    set({ isLoading: true, error: null });

    try {
      const accessKey = await userService.getAccessKey();
      if (!accessKey) {
        set({
          isLoading: false,
          error: 'Authentication required'
        });
        return;
      }

      const [moviesResponse, tvShowsResponse] = await Promise.all([
        api.getSavedMovies(accessKey),
        api.getSavedTVShows(accessKey)
      ]);

      const movies = moviesResponse.success ? moviesResponse.data : [];
      const tvShows = tvShowsResponse.success ? tvShowsResponse.data : [];

      // Update state
      set({
        movies,
        tvShows,
        isLoading: false,
        isStale: false,
        lastFetched: Date.now(),
        error: null
      });

      // Cache the data
      await Promise.all([
        storage.set(MOVIES_CACHE_KEY, movies, CACHE_TTL_MINUTES),
        storage.set(TV_SHOWS_CACHE_KEY, tvShows, CACHE_TTL_MINUTES)
      ]);

    } catch (error) {
      console.error('Error fetching watchlist:', error);
      set({
        isLoading: false,
        error: 'Failed to load watchlist'
      });
    }
  },

  // Refresh in background (no loading state)
  refreshWatchlist: async () => {
    try {
      const accessKey = await userService.getAccessKey();
      if (!accessKey) return;

      const [moviesResponse, tvShowsResponse] = await Promise.all([
        api.getSavedMovies(accessKey),
        api.getSavedTVShows(accessKey)
      ]);

      const movies = moviesResponse.success ? moviesResponse.data : [];
      const tvShows = tvShowsResponse.success ? tvShowsResponse.data : [];

      // Update state
      set({
        movies,
        tvShows,
        isStale: false,
        lastFetched: Date.now(),
        error: null
      });

      // Update cache
      await Promise.all([
        storage.set(MOVIES_CACHE_KEY, movies, CACHE_TTL_MINUTES),
        storage.set(TV_SHOWS_CACHE_KEY, tvShows, CACHE_TTL_MINUTES)
      ]);

    } catch (error) {
      console.warn('Background refresh failed:', error);
      // Don't update error state for background refresh
    }
  },

  // Add to watchlist with optimistic update
  addToWatchlist: async (item: ContentItem) => {
    // Optimistic update
    const currentState = get();
    if (item.type === 'movie') {
      set({ movies: [...currentState.movies, item as Movie] });
    } else {
      set({ tvShows: [...currentState.tvShows, item as TVShow] });
    }

    try {
      const accessKey = await userService.getAccessKey();
      if (!accessKey) throw new Error('Authentication required');

      if (item.type === 'movie') {
        await api.saveMovie({ movie_id: item.id, imdbid: item.imdbid }, accessKey);
      } else {
        await api.saveTVShow({ tv_show_id: item.id, imdbid: item.imdbid }, accessKey);
      }

      // Update cache after successful API call
      const newState = get();
      await Promise.all([
        storage.set(MOVIES_CACHE_KEY, newState.movies, CACHE_TTL_MINUTES),
        storage.set(TV_SHOWS_CACHE_KEY, newState.tvShows, CACHE_TTL_MINUTES)
      ]);

    } catch (error) {
      // Revert optimistic update on error
      if (item.type === 'movie') {
        set({ movies: currentState.movies });
      } else {
        set({ tvShows: currentState.tvShows });
      }
      console.error('Failed to add to watchlist:', error);
      throw error;
    }
  },

  // Remove from watchlist with optimistic update
  removeFromWatchlist: async (item: ContentItem) => {
    // Optimistic update
    const currentState = get();
    if (item.type === 'movie') {
      set({ movies: currentState.movies.filter(m => m.id !== item.id) });
    } else {
      set({ tvShows: currentState.tvShows.filter(tv => tv.id !== item.id) });
    }

    try {
      const accessKey = await userService.getAccessKey();
      if (!accessKey) throw new Error('Authentication required');

      if (item.type === 'movie') {
        await api.removeSavedMovie(item.id, accessKey);
      } else {
        await api.removeSavedTVShow(item.id, accessKey);
      }

      // Update cache after successful API call
      const newState = get();
      await Promise.all([
        storage.set(MOVIES_CACHE_KEY, newState.movies, CACHE_TTL_MINUTES),
        storage.set(TV_SHOWS_CACHE_KEY, newState.tvShows, CACHE_TTL_MINUTES)
      ]);

    } catch (error) {
      // Revert optimistic update on error
      if (item.type === 'movie') {
        set({ movies: currentState.movies });
      } else {
        set({ tvShows: currentState.tvShows });
      }
      console.error('Failed to remove from watchlist:', error);
      throw error;
    }
  },

  // Check if item is in watchlist
  isInWatchlist: (item: ContentItem): boolean => {
    const state = get();
    if (item.type === 'movie') {
      return state.movies.some(movie => movie.id === item.id);
    } else {
      return state.tvShows.some(show => show.id === item.id);
    }
  },

  // Reset state
  reset: () => {
    set({
      movies: [],
      tvShows: [],
      isLoading: false,
      isStale: false,
      lastFetched: null,
      error: null
    });
    Promise.all([
      storage.remove(MOVIES_CACHE_KEY),
      storage.remove(TV_SHOWS_CACHE_KEY)
    ]);
  }
}));