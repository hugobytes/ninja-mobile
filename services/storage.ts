import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  ACCESS_KEY: '@ninja_mobile_access_key',
} as const;

export const storage = {
  async getAccessKey(): Promise<string | null> {
    try {
      const accessKey = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_KEY);
      return accessKey;
    } catch (error) {
      console.error('Failed to get access key from storage:', error);
      return null;
    }
  },

  async setAccessKey(accessKey: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_KEY, accessKey);
    } catch (error) {
      console.error('Failed to save access key to storage:', error);
      throw error;
    }
  },

  async removeAccessKey(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_KEY);
    } catch (error) {
      console.error('Failed to remove access key from storage:', error);
      throw error;
    }
  }
};