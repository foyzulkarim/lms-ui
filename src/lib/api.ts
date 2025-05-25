// API client service for communicating with the backend

// Use environment variables for API URLs with fallbacks for local development
const API_BASE_URL = typeof import.meta.env !== 'undefined' && import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL
  : 'http://localhost:4000';

// Move refreshToken above fetcher so it can be referenced
async function refreshToken() {
  return fetcher('/api/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

/**
 * Fetch wrapper with standardized error handling
 */
async function fetcher<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Include credentials to send cookies with requests
  const fetchOptions: RequestInit = {
    ...options,
    credentials: 'include', // Important for JWT cookie auth
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, fetchOptions);

    // If we get a 401 Unauthorized, the token might have expired
    // Try to refresh token and retry the request once
    if (response.status === 401 && endpoint !== '/api/auth/refresh' && endpoint !== '/api/auth/logout') {
      try {
        // Attempt to refresh the token
        await refreshToken();
        
        // Retry the original request with the new token
        const retryResponse = await fetch(url, fetchOptions);
        
        if (!retryResponse.ok) {
          const errorData = await retryResponse.json().catch(() => ({}));
          throw new Error(
            errorData.message || `API error: ${retryResponse.status} ${retryResponse.statusText}`
          );
        }
        
        // For 204 No Content responses
        if (retryResponse.status === 204) {
          return {} as T;
        }
        
        return await retryResponse.json();
      } catch (refreshError) {
        // If refresh fails, throw the original 401 error
        console.error('Token refresh failed:', refreshError);
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Authentication failed. Please login again.`
        );
      }
    }

    // Handle unsuccessful responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `API error: ${response.status} ${response.statusText}`
      );
    }

    // For 204 No Content responses
    if (response.status === 204) {
      return {} as T;
    }

    // Parse JSON response
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * API client with methods for specific endpoints
 */
export const api = {
  /**
   * Check if user is currently authenticated
   */
  checkAuth: async (): Promise<{ isAuthenticated: boolean }> => {
    return fetcher('/api/auth/me');
  },

  /**
   * Get the current authenticated user's profile
   */
  getUser: async () => {
    return fetcher('/api/auth/me');
  },

  /**
   * Logout the current user
   */
  logout: async () => {
    return fetcher('/api/auth/logout', { 
      method: 'POST',
      body: JSON.stringify({}) // Send empty object to avoid empty body error
    });
  },

  /**
   * Get Google auth URL for redirection
   */
  getGoogleAuthUrl: () => {
    return `${API_BASE_URL}/api/auth/google`;
  },
  
  /**
   * Refresh the authentication token
   */
  refreshToken: async () => {
    return fetcher('/api/auth/refresh', { 
      method: 'POST',
      body: JSON.stringify({}) // Send empty object to avoid empty body error
    });
  },
};

export { fetcher };
