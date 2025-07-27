import { Platform } from 'react-native';

const isDevelopment = __DEV__;
const API_BASE_URL = isDevelopment 
  ? Platform.OS === 'ios' 
    ? 'http://localhost:3000' 
    : 'http://10.0.2.2:3000'  // Android emulator localhost
  : 'https://bingerninja.com';

export interface CreateUserResponse {
  success: boolean;
  access_key: string;
  message: string;
}

export interface Movie {
  id: number;
  imdbid: string;
  title: string;
  release_year: number;
  genres: string[];
  imdb_rating: number;
  rotten_tomatoes_rating: number;
  overview: string;
  poster_url: string;
  type: string;
  last_synced_at: string;
  watch_providers: {
    country: string;
    stream: string[];
    rent: string[];
    buy: string[];
  };
}

export interface TVShow {
  id: number;
  imdbid: string;
  title: string;
  first_air_year: number;
  genres: string[];
  imdb_rating: number;
  rotten_tomatoes_rating: number;
  overview: string;
  poster_url: string;
  type: string;
  last_synced_at: string;
  watch_providers: {
    country: string;
    stream: string[];
    rent: string[];
    buy: string[];
  };
}

export interface RandomMoviesResponse {
  success: boolean;
  data: Movie[];
  meta: {
    total_returned: number;
    limit: number;
    country: string;
    filters_applied: {
      genres: string[];
      excluded_imdbids: number;
    };
  };
}

export interface RandomTVShowsResponse {
  success: boolean;
  data: TVShow[];
  meta: {
    total_returned: number;
    limit: number;
    country: string;
    filters_applied: {
      genres: string[];
      excluded_imdbids: number;
    };
  };
}

export interface RandomContentParams {
  limit?: number;
  genres?: string;
  exclude_imdbids?: string;
  country?: string;
}

export const api = {
  async createUser(): Promise<CreateUserResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  },

  async getRandomMovies(params: RandomContentParams = {}): Promise<RandomMoviesResponse> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.genres) searchParams.append('genres', params.genres);
      if (params.exclude_imdbids) searchParams.append('exclude_imdbids', params.exclude_imdbids);
      if (params.country) searchParams.append('country', params.country);

      const url = `${API_BASE_URL}/api/v1/movies/random${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch random movies:', error);
      throw error;
    }
  },

  async getRandomTVShows(params: RandomContentParams = {}): Promise<RandomTVShowsResponse> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.genres) searchParams.append('genres', params.genres);
      if (params.exclude_imdbids) searchParams.append('exclude_imdbids', params.exclude_imdbids);
      if (params.country) searchParams.append('country', params.country);

      const url = `${API_BASE_URL}/api/v1/tv_shows/random${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch random TV shows:', error);
      throw error;
    }
  }
};