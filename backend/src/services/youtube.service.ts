import { IYouTubeVideo } from "../types/interfaces";
import {
  YouTubeSearchResponse,
  YouTubeVideosResponse,
  YouTubeVideoItem,
} from "../types/youtube.types";

export class YouTubeService {
  private readonly apiKey: string;
  private readonly apiHost: string;
  private readonly baseUrl = "https://youtube-v31.p.rapidapi.com";

  constructor() {
    this.apiKey = process.env.X_RAPIDAPI_KEY!;
    this.apiHost = process.env.X_RAPIDAPI_HOST!;

    if (!this.apiKey || !this.apiHost) {
      throw new Error(
        "X_RAPIDAPI_KEY and X_RAPIDAPI_HOST must be defined in environment variables"
      );
    }
  }

  public async search(
    query: string,
    maxResults: number = 10
  ): Promise<IYouTubeVideo[]> {
    const url = `${this.baseUrl}/search?part=snippet&q=${encodeURIComponent(
      query
    )}&maxResults=${maxResults}&type=video`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": this.apiKey,
        "x-rapidapi-host": this.apiHost,
      },
    });

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.statusText}`);
    }

    const data = (await response.json()) as YouTubeSearchResponse;

    if (!data.items || data.items.length === 0) {
      return [];
    }

    const videoIds = data.items.map((item) => item.id.videoId).join(",");
    const videos = await this.getVideoDetails(videoIds);

    return videos;
  }

  public async getVideoDetails(videoIds: string): Promise<IYouTubeVideo[]> {
    const url = `${this.baseUrl}/videos?part=snippet,contentDetails,statistics&id=${videoIds}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": this.apiKey,
        "x-rapidapi-host": this.apiHost,
      },
    });

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.statusText}`);
    }

    const data = (await response.json()) as YouTubeVideosResponse;

    if (!data.items || data.items.length === 0) {
      return [];
    }

    return data.items.map((item) => this.formatVideo(item));
  }

  private formatVideo(item: YouTubeVideoItem): IYouTubeVideo {
    return {
      videoId: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail:
        item.snippet.thumbnails?.high?.url ||
        item.snippet.thumbnails?.default?.url ||
        "",
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      duration: item.contentDetails?.duration || "",
      viewCount: item.statistics?.viewCount || "0",
      likeCount: item.statistics?.likeCount || "0",
      commentCount: item.statistics?.commentCount || "0",
    };
  }
}
