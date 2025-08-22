import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, Tag } from '@/services/api';

export interface FilterState {
  // Available filters from API
  availableStreamProviders: string[];
  availableTags: Tag[];
  
  // User selected filters
  movieFilters: {
    streamProviders: string[];
    tags: string[];
  };
  tvFilters: {
    streamProviders: string[];
    tags: string[];
  };
  
  // Loading states
  isLoadingStreamProviders: boolean;
  isLoadingTags: boolean;
  
  // Actions
  fetchAvailableFilters: () => Promise<void>;
  setMovieStreamProviders: (streamProviders: string[]) => void;
  setMovieTags: (tags: string[]) => void;
  setTVStreamProviders: (streamProviders: string[]) => void;
  setTVTags: (tags: string[]) => void;
  clearMovieFilters: () => void;
  clearTVFilters: () => void;
  clearAllFilters: () => void;
}

export const useFiltersStore = create<FilterState>()(
  persist(
    (set, get) => ({
      // Initial state with stable references
      availableStreamProviders: ['Netflix', 'Apple TV', 'Amazon Prime', 'Disney+'],
      availableTags: [],
      movieFilters: {
        streamProviders: [],
        tags: [],
      },
      tvFilters: {
        streamProviders: [],
        tags: [],
      },
      isLoadingStreamProviders: false,
      isLoadingTags: false,

      // Actions
      fetchAvailableFilters: async () => {
        try {
          set({ isLoadingTags: true });
          
          // Fetch tags from API
          const tagsResponse = await api.getTags();
          set({ 
            availableTags: tagsResponse.tags,
            isLoadingTags: false 
          });

          // Stream providers are already set in initial state
          set({ 
            isLoadingStreamProviders: false 
          });

        } catch (error) {
          console.error('Failed to fetch available filters:', error);
          set({ 
            isLoadingStreamProviders: false,
            isLoadingTags: false 
          });
        }
      },

      setMovieStreamProviders: (streamProviders: string[]) => {
        set((state) => ({
          movieFilters: {
            ...state.movieFilters,
            streamProviders,
          },
        }));
      },

      setMovieTags: (tags: string[]) => {
        set((state) => ({
          movieFilters: {
            ...state.movieFilters,
            tags,
          },
        }));
      },

      setTVStreamProviders: (streamProviders: string[]) => {
        set((state) => ({
          tvFilters: {
            ...state.tvFilters,
            streamProviders,
          },
        }));
      },

      setTVTags: (tags: string[]) => {
        set((state) => ({
          tvFilters: {
            ...state.tvFilters,
            tags,
          },
        }));
      },

      clearMovieFilters: () => {
        set((state) => ({
          movieFilters: {
            streamProviders: [],
            tags: [],
          },
        }));
      },

      clearTVFilters: () => {
        set((state) => ({
          tvFilters: {
            streamProviders: [],
            tags: [],
          },
        }));
      },

      clearAllFilters: () => {
        set(() => ({
          movieFilters: {
            streamProviders: [],
            tags: [],
          },
          tvFilters: {
            streamProviders: [],
            tags: [],
          },
        }));
      },
    }),
    {
      name: 'filters-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the user's selected filters, not the available ones
      partialize: (state) => ({
        movieFilters: state.movieFilters,
        tvFilters: state.tvFilters,
      }),
      // Handle migration from old format
      migrate: (persistedState: any) => {
        if (persistedState && typeof persistedState === 'object') {
          // Migrate old genres to tags format
          if (persistedState.movieFilters && persistedState.movieFilters.genres) {
            persistedState.movieFilters.tags = persistedState.movieFilters.genres;
            delete persistedState.movieFilters.genres;
          }
          if (persistedState.tvFilters && persistedState.tvFilters.genres) {
            persistedState.tvFilters.tags = persistedState.tvFilters.genres;
            delete persistedState.tvFilters.genres;
          }
          
          // Ensure streamProviders exists
          if (persistedState.movieFilters && !persistedState.movieFilters.streamProviders) {
            persistedState.movieFilters.streamProviders = [];
          }
          if (persistedState.tvFilters && !persistedState.tvFilters.streamProviders) {
            persistedState.tvFilters.streamProviders = [];
          }
          
          // Ensure tags exists
          if (persistedState.movieFilters && !persistedState.movieFilters.tags) {
            persistedState.movieFilters.tags = [];
          }
          if (persistedState.tvFilters && !persistedState.tvFilters.tags) {
            persistedState.tvFilters.tags = [];
          }
        }
        return persistedState;
      },
      version: 2, // Increment version to force migration
    }
  )
);

// Selectors for easier use - returning direct references to avoid re-renders
export const useMovieFilters = () => useFiltersStore((state) => state.movieFilters);
export const useTVFilters = () => useFiltersStore((state) => state.tvFilters);

// Individual selectors 
export const useAvailableStreamProviders = () => useFiltersStore((state) => state.availableStreamProviders);
export const useAvailableTags = () => useFiltersStore((state) => state.availableTags);
export const useIsLoadingStreamProviders = () => useFiltersStore((state) => state.isLoadingStreamProviders);
export const useIsLoadingTags = () => useFiltersStore((state) => state.isLoadingTags);

// Composite selector with memoization
export const useAvailableFilters = () => {
  const streamProviders = useAvailableStreamProviders();
  const tags = useAvailableTags();
  const isLoadingStreamProviders = useIsLoadingStreamProviders();
  const isLoadingTags = useIsLoadingTags();
  
  return {
    streamProviders,
    tags,
    isLoadingStreamProviders,
    isLoadingTags,
  };
};