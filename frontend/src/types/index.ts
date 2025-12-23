export interface Video {
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

export interface VideoDetails extends Video {
  viewCount: string;
  likeCount: string;
  commentCount: string;
}

export interface SearchResult {
  results: Video[];
  totalResults: number;
  nextPageToken?: string;
  prevPageToken?: string;
}

export interface ApiSearchResponse {
  result: Video[];
  totalResults: number;
  nextPageToken?: string;
  prevPageToken?: string;
}

export interface SearchHistoryItem {
  query: string;
  timestamp: string;
}

export interface SearchAnalyticsItem {
  query: string;
  count: number;
}

export interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  initialValue?: string;
}

export interface SearchHistoryProps {
  history: SearchHistoryItem[];
  onSelectQuery: (query: string) => void;
}

export interface VideoCardProps {
  video: Video;
  onClick?: () => void;
}

export interface VideoDetailsProps {
  video: VideoDetails;
}
