import { create } from 'zustand';
import { storage } from '@/services/storage';
import { api, Tag, TagsResponse } from '@/services/api';

interface TagsState {
  // Data
  tags: Tag[];
  isLoading: boolean;
  isStale: boolean;
  lastFetched: number | null;
  error: string | null;

  // Actions
  fetchTags: () => Promise<void>;
  refreshTags: () => Promise<void>;
  hydrate: () => Promise<void>;
  reset: () => void;
}

const CACHE_KEY = 'availableTags';
const CACHE_TTL_MINUTES = 60; // 1 hour cache for tags

export const useTagsStore = create<TagsState>((set, get) => ({
  // Initial state
  tags: [],
  isLoading: false,
  isStale: false,
  lastFetched: null,
  error: null,

  // Load cached data on app start
  hydrate: async () => {
    try {
      const cached = await storage.getCached<Tag[]>(CACHE_KEY);
      
      if (cached.data) {
        set({
          tags: cached.data,
          isStale: cached.isStale,
          lastFetched: Date.now()
        });

        // If stale, fetch fresh data in background
        if (cached.isStale) {
          get().refreshTags();
        }
      } else {
        // No cached data, fetch fresh
        get().fetchTags();
      }
    } catch (error) {
      console.warn('Failed to hydrate tags from cache:', error);
      get().fetchTags();
    }
  },

  // Fetch tags (shows loading state)
  fetchTags: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.getTags();
      const tags = response.tags || [];
      
      // Update state
      set({
        tags,
        isLoading: false,
        isStale: false,
        lastFetched: Date.now(),
        error: null
      });

      // Cache the data
      await storage.set(CACHE_KEY, tags, CACHE_TTL_MINUTES);
    } catch (error) {
      console.error('Error fetching tags:', error);
      set({
        isLoading: false,
        error: 'Network error loading tags'
      });
    }
  },

  // Refresh in background (no loading state)
  refreshTags: async () => {
    try {
      const response = await api.getTags();
      const tags = response.tags || [];
      
      // Update state
      set({
        tags,
        isStale: false,
        lastFetched: Date.now(),
        error: null
      });

      // Update cache
      await storage.set(CACHE_KEY, tags, CACHE_TTL_MINUTES);
    } catch (error) {
      console.warn('Background refresh failed:', error);
      // Don't update error state for background refresh
    }
  },

  // Reset state
  reset: () => {
    set({
      tags: [],
      isLoading: false,
      isStale: false,
      lastFetched: null,
      error: null
    });
    storage.remove(CACHE_KEY);
  }
}));