import { api } from './api';
import { storage } from './storage';

export const userService = {
  async initializeUser(): Promise<string> {
    try {
      // Check if we already have an access key
      const existingAccessKey = await storage.getAccessKey();
      
      if (existingAccessKey) {
        console.log('User already exists, using existing access key');
        return existingAccessKey;
      }

      // Create new user if no access key exists
      console.log('Creating new user...');
      const response = await api.createUser();
      
      if (response.success && response.access_key) {
        // Save the access key securely
        await storage.setAccessKey(response.access_key);
        console.log('User created successfully:', response.message);
        return response.access_key;
      } else {
        throw new Error('Failed to create user: Invalid response');
      }
    } catch (error) {
      console.error('Error initializing user:', error);
      throw error;
    }
  },

  async getAccessKey(): Promise<string | null> {
    return await storage.getAccessKey();
  },

  async clearUser(): Promise<void> {
    await storage.removeAccessKey();
  }
};