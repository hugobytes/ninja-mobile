import { Platform } from 'react-native';

const isDevelopment = __DEV__;
const API_BASE_URL = isDevelopment 
  ? Platform.OS === 'ios' 
    ? 'http://localhost:3000' 
    : 'http://10.0.2.2:3000'  // Android emulator localhost
  : 'https://www.bingerninja.com';

let API_BASE_URL_OVERRIDE = null;
API_BASE_URL_OVERRIDE = 'https://www.bingerninja.com';

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
  runtime: number;
  directors: string[];
  cast: string[];
  genres: string[];
  tags: string[]; // New unified tags field
  // Legacy fields for backward compatibility
  tropes?: string[];
  moods?: string[];
  acclaims?: string[];
  origins?: string[];
  imdb_rating: number;
  rotten_tomatoes_rating: number;
  overview: string;
  poster_url: string;
  type: string;
  last_synced_at: string;
  is_saved: boolean;
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
  runtime: number;
  creators: string[];
  cast: string[];
  genres: string[];
  tags: string[]; // New unified tags field
  // Legacy fields for backward compatibility
  tropes?: string[];
  moods?: string[];
  acclaims?: string[];
  origins?: string[];
  imdb_rating: number;
  rotten_tomatoes_rating: number;
  overview: string;
  poster_url: string;
  type: string;
  last_synced_at: string;
  is_saved: boolean;
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
  tags?: string; // New unified tags parameter
  stream_providers?: string; // New stream providers parameter
  // Legacy parameters for backward compatibility
  tropes?: string;
  moods?: string;
  acclaims?: string;
  origins?: string;
  exclude_imdbids?: string;
  country?: string;
}

export interface SaveContentParams {
  movie_id?: number;
  tv_show_id?: number;
  imdbid?: string;
}

export interface SaveContentResponse {
  success: boolean;
  message: string;
  data: Movie | TVShow;
}

export interface GetSavedContentResponse {
  success: boolean;
  data: Movie[] | TVShow[];
  meta: {
    total_count: number;
  };
}

export interface Tag {
  id: number;
  name: string;
}

export interface TagsResponse {
  tags: Tag[];
}

export const api = {
  async createUser(): Promise<CreateUserResponse> {
    try {
      const baseUrl = API_BASE_URL_OVERRIDE ? API_BASE_URL_OVERRIDE : API_BASE_URL;
      const response = await fetch(`${baseUrl}/api/v1/users`, {
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

  async getTags(): Promise<TagsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/tags`, {
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
      console.error('Failed to fetch tags:', error);
      throw error;
    }
  },

  async getRandomMovies(params: RandomContentParams = {}, accessKey?: string): Promise<RandomMoviesResponse> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.genres) searchParams.append('genres', params.genres);
      if (params.tags) searchParams.append('tags', params.tags);
      if (params.stream_providers) searchParams.append('stream_providers', params.stream_providers);
      if (params.exclude_imdbids) searchParams.append('exclude_imdbids', params.exclude_imdbids);
      if (params.country) searchParams.append('country', params.country);

      const url = `${API_BASE_URL}/api/v1/movies/random${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      
      if (accessKey) {
        headers['Authorization'] = `Bearer ${accessKey}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
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

  async getRandomTVShows(params: RandomContentParams = {}, accessKey?: string): Promise<RandomTVShowsResponse> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.genres) searchParams.append('genres', params.genres);
      if (params.tags) searchParams.append('tags', params.tags);
      if (params.stream_providers) searchParams.append('stream_providers', params.stream_providers);
      if (params.exclude_imdbids) searchParams.append('exclude_imdbids', params.exclude_imdbids);
      if (params.country) searchParams.append('country', params.country);

      const url = `${API_BASE_URL}/api/v1/tv_shows/random${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      
      if (accessKey) {
        headers['Authorization'] = `Bearer ${accessKey}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch random TV shows:', error);
      throw error;
    }
  },

  async saveMovie(params: SaveContentParams, accessKey: string): Promise<SaveContentResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/user_movies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessKey}`,
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to save movie:', error);
      throw error;
    }
  },

  async getSavedMovies(accessKey: string): Promise<GetSavedContentResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/user_movies`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get saved movies:', error);
      throw error;
    }
  },

  async removeSavedMovie(movieId: number, accessKey: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/user_movies/${movieId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to remove saved movie:', error);
      throw error;
    }
  },

  async saveTVShow(params: SaveContentParams, accessKey: string): Promise<SaveContentResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/user_tv_shows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessKey}`,
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to save TV show:', error);
      throw error;
    }
  },

  async getSavedTVShows(accessKey: string): Promise<GetSavedContentResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/user_tv_shows`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get saved TV shows:', error);
      throw error;
    }
  },

  async removeSavedTVShow(tvShowId: number, accessKey: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/user_tv_shows/${tvShowId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to remove saved TV show:', error);
      throw error;
    }
  }
};