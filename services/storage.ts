import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

const STORAGE_KEYS = {
  ACCESS_KEY: '@ninja_mobile_access_key',
  WATCHLIST: '@ninja_mobile_watchlist',
  TAGS: '@ninja_mobile_tags',
} as const;

class StorageService {
  private prefix = '@BingerNinja:';

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async set<T>(key: string, value: T, ttlMinutes = 60): Promise<void> {
    try {
      const now = Date.now();
      const cacheEntry: CacheEntry<T> = {
        data: value,
        timestamp: now,
        expiresAt: now + (ttlMinutes * 60 * 1000)
      };
      
      const serialized = JSON.stringify(cacheEntry);
      await AsyncStorage.setItem(this.getKey(key), serialized);
    } catch (error) {
      console.warn('Failed to save to storage:', error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const serialized = await AsyncStorage.getItem(this.getKey(key));
      if (!serialized) return null;

      const cacheEntry: CacheEntry<T> = JSON.parse(serialized);
      
      // Check if expired
      if (Date.now() > cacheEntry.expiresAt) {
        await this.remove(key);
        return null;
      }

      return cacheEntry.data;
    } catch (error) {
      console.warn('Failed to read from storage:', error);
      return null;
    }
  }

  async getCached<T>(key: string): Promise<{ data: T | null; isStale: boolean }> {
    try {
      const serialized = await AsyncStorage.getItem(this.getKey(key));
      if (!serialized) return { data: null, isStale: false };

      const cacheEntry: CacheEntry<T> = JSON.parse(serialized);
      const now = Date.now();
      const isExpired = now > cacheEntry.expiresAt;
      
      if (isExpired) {
        return { data: cacheEntry.data, isStale: true };
      }

      return { data: cacheEntry.data, isStale: false };
    } catch (error) {
      console.warn('Failed to read from storage:', error);
      return { data: null, isStale: false };
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.getKey(key));
    } catch (error) {
      console.warn('Failed to remove from storage:', error);
    }
  }

  // Legacy access key methods (maintain compatibility)
  async getAccessKey(): Promise<string | null> {
    try {
      const accessKey = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_KEY);
      return accessKey;
    } catch (error) {
      console.error('Failed to get access key from storage:', error);
      return null;
    }
  }

  async setAccessKey(accessKey: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_KEY, accessKey);
    } catch (error) {
      console.error('Failed to save access key to storage:', error);
      throw error;
    }
  }

  async removeAccessKey(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_KEY);
    } catch (error) {
      console.error('Failed to remove access key from storage:', error);
      throw error;
    }
  }
}

export const storage = new StorageService();