import type {
  VideoDetails,
  ApiSearchResponse,
  SearchHistoryItem,
  SearchAnalyticsItem,
} from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

class ApiClient {
  private baseUrl: string;
  private isRefreshing: boolean = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private subscribeTokenRefresh(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  private onRefreshFailed() {
    this.refreshSubscribers = [];
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

      if (response.status === 401 && !endpoint.includes("/auth/")) {
        if (this.isRefreshing) {
          return new Promise((resolve, reject) => {
            this.subscribeTokenRefresh(() => {
              this.request<T>(endpoint, options).then(resolve).catch(reject);
            });
          });
        }

        this.isRefreshing = true;

        try {
          const refreshResponse = await fetch(`${this.baseUrl}/auth/refresh`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (refreshResponse.ok) {
            this.isRefreshing = false;
            this.onRefreshed("success");
            return this.request<T>(endpoint, options);
          } else {
            this.isRefreshing = false;
            this.onRefreshFailed();
            console.error("Refresh token expired or invalid. Logging out...");
            window.location.href = "/login";
            throw new Error("Session expired. Please login again.");
          }
        } catch (refreshError) {
          this.isRefreshing = false;
          this.onRefreshFailed();
          console.error("Failed to refresh token:", refreshError);
          window.location.href = "/login";
          throw new Error("Session expired. Please login again.");
        }
      }

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));

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
    try {
      return await this.request<{ success: boolean; data: { user: any } }>(
        "/auth/profile"
      );
    } catch (error) {
      throw error;
    }
  }

  async searchVideos(
    query: string,
    pageToken?: string
  ): Promise<ApiSearchResponse> {
    const params = new URLSearchParams({ q: query });
    if (pageToken) {
      params.append("pageToken", pageToken);
    }

    return this.request<ApiSearchResponse>(`/api/search?${params.toString()}`);
  }

  async getVideoDetails(videoId: string): Promise<VideoDetails> {
    return this.request<VideoDetails>(`/api/video/${videoId}`);
  }

  async getSearchHistory(): Promise<SearchHistoryItem[]> {
    return this.request<SearchHistoryItem[]>("/api/history");
  }

  async getAnalytics(): Promise<SearchAnalyticsItem[]> {
    return this.request<SearchAnalyticsItem[]>("/api/analytics");
  }
}

export const apiClient = new ApiClient(API_URL);
