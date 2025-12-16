import type {
  VideoDetails,
  SearchResult,
  ApiSearchResponse,
  SearchHistoryItem,
  SearchAnalyticsItem,
} from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));

        if (error.code === "TOKEN_EXPIRED") {
          await this.refreshToken();
          return this.request<T>(endpoint, options);
        }

        throw new Error(
          error.error || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async register(
    email: string,
    password: string,
    name?: string
  ): Promise<{ message: string; user: any }> {
    return this.request<{ message: string; user: any }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(
    email: string,
    password: string
  ): Promise<{ message: string; user: any }> {
    return this.request<{ message: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async logout(): Promise<{ message: string }> {
    return this.request<{ message: string }>("/auth/logout", {
      method: "POST",
    });
  }

  async refreshToken(): Promise<{ message: string }> {
    return this.request<{ message: string }>("/auth/refresh", {
      method: "POST",
    });
  }

  async getMe(): Promise<{ user: any }> {
    return this.request<{ user: any }>("/auth/me");
  }

  async searchVideos(
    query: string,
    pageToken?: string,
    maxResults: number = 12
  ): Promise<SearchResult> {
    const params = new URLSearchParams({
      q: query,
      maxResults: maxResults.toString(),
    });

    if (pageToken) {
      params.append("pageToken", pageToken);
    }

    const response = await this.request<ApiSearchResponse>(
      `/api/search?${params}`
    );

    const normalizedResponse: SearchResult = {
      results: response.result || [],
      totalResults: response.totalResults || 0,
      nextPageToken: response.nextPageToken,
      prevPageToken: response.prevPageToken,
    };

    return normalizedResponse;
  }

  async getVideoDetails(videoId: string): Promise<VideoDetails> {
    return this.request<VideoDetails>(`/api/video/${videoId}`);
  }

  async getSearchHistory(
    limit: number = 20
  ): Promise<{ history: SearchHistoryItem[] }> {
    return this.request<{ history: SearchHistoryItem[] }>(
      `/api/history?limit=${limit}`
    );
  }

  async addToHistory(query: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>("/api/history", {
      method: "POST",
      body: JSON.stringify({ query }),
    });
  }

  async getAnalytics(limit: number = 10): Promise<SearchAnalyticsItem[]> {
    return this.request<SearchAnalyticsItem[]>(`/api/analytics?limit=${limit}`);
  }

  async healthCheck(): Promise<{
    status: string;
    database: string;
    timestamp: string;
  }> {
    return this.request<{
      status: string;
      database: string;
      timestamp: string;
    }>("/health");
  }
}

export const apiClient = new ApiClient(API_URL);
