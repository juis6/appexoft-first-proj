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
  ): Promise<{ success: boolean; message: string; data: { user: any } }> {
    return this.request<{
      success: boolean;
      message: string;
      data: { user: any };
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, username: name }),
    });
  }

  async login(
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string; data: { user: any } }> {
    return this.request<{
      success: boolean;
      message: string;
      data: { user: any };
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>("/auth/logout", {
      method: "POST",
    });
  }

  async refreshToken(): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(
      "/auth/refresh",
      {
        method: "POST",
      }
    );
  }

  async getMe(): Promise<{ success: boolean; data: { user: any } }> {
    return this.request<{ success: boolean; data: { user: any } }>(
      "/auth/profile"
    );
  }

  async searchVideos(
    query: string,
    pageToken?: string,
    maxResults: number = 12
  ): Promise<ApiSearchResponse> {
    const params = new URLSearchParams({
      q: query,
      maxResults: maxResults.toString(),
    });
    if (pageToken) {
      params.append("pageToken", pageToken);
    }

    const response = await this.request<{
      success: boolean;
      data: { videos: any[] };
    }>(`/api/video/search?${params}`);

    return {
      result: response.data.videos || [],
      totalResults: response.data.videos?.length || 0,
      nextPageToken: undefined,
      prevPageToken: undefined,
    };
  }

  async getVideoDetails(videoId: string): Promise<VideoDetails> {
    const response = await this.request<{
      success: boolean;
      data: { video: any };
    }>(`/api/video/${videoId}`);

    return response.data.video;
  }

  async getSearchHistory(): Promise<SearchHistoryItem[]> {
    const response = await this.request<{
      success: boolean;
      data: { history: any[] };
    }>("/api/history");

    return response.data.history.map((item: any) => ({
      query: item.title || item.videoId,
      timestamp: item.createdAt,
    }));
  }

  async addToHistory(
    videoId: string,
    title: string,
    thumbnail: string,
    channelTitle: string,
    duration?: string,
    viewCount?: string
  ): Promise<void> {
    await this.request("/api/history", {
      method: "POST",
      body: JSON.stringify({
        videoId,
        title,
        thumbnail,
        channelTitle,
        duration,
        viewCount,
      }),
    });
  }

  async getAnalytics(limit: number = 20): Promise<SearchAnalyticsItem[]> {
    const response = await this.request<{
      success: boolean;
      data: { analytics: any[] };
    }>("/api/history/analytics");

    const countMap = new Map<string, { query: string; count: number }>();

    response.data.analytics.forEach((item: any) => {
      const query = item.title || item.videoId;
      const existing = countMap.get(query);
      if (existing) {
        existing.count++;
      } else {
        countMap.set(query, { query, count: 1 });
      }
    });

    return Array.from(countMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}

export const apiClient = new ApiClient(API_URL);
