import { Request } from "express";

export interface IUser {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserCredentials {
  email: string;
  password: string;
  username?: string;
}

export interface ITokenPayload {
  userId: string;
  email: string;
}

export interface ITokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthRequest extends Request {
  user?: ITokenPayload;
}

export interface IHistoryEntry {
  id: string;
  userId: string;
  videoId: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  duration: string;
  viewCount: string;
  createdAt: Date;
}

export interface IHistoryCreate {
  videoId: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  duration: string;
  viewCount: string;
}

export interface IVideoSearchQuery {
  query: string;
  maxResults?: number;
}

export interface IVideoDetails {
  videoId: string;
}

export interface IYouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  duration?: string;
  viewCount?: string;
  likeCount?: string;
  commentCount?: string;
}

export interface IAnalytics {
  totalSearches: number;
  recentSearches: IHistoryEntry[];
}

export interface ICookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "strict" | "lax" | "none";
  maxAge: number;
  path: string;
}

export interface IApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface IApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}
