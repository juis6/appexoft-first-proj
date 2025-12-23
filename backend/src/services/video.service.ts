import { YouTubeService } from "./youtube.service";
import { HistoryService } from "./history.service";
import { IYouTubeVideo, IHistoryCreate } from "../types/interfaces";

export class VideoService {
  private readonly youtubeService: YouTubeService;
  private readonly historyService: HistoryService;

  constructor() {
    this.youtubeService = new YouTubeService();
    this.historyService = new HistoryService();
  }

  public async searchVideos(
    _userId: string,
    query: string,
    maxResults?: number
  ): Promise<IYouTubeVideo[]> {
    const videos = await this.youtubeService.search(query, maxResults);
    return videos;
  }

  public async getVideoDetails(
    userId: string,
    videoId: string
  ): Promise<IYouTubeVideo> {
    const videos = await this.youtubeService.getVideoDetails(videoId);

    if (videos.length === 0) {
      throw new Error("Video not found");
    }

    const video = videos[0];

    const historyData: IHistoryCreate = {
      videoId: video.videoId,
      title: video.title,
      thumbnail: video.thumbnail,
      channelTitle: video.channelTitle,
      duration: video.duration || "",
      viewCount: video.viewCount || "",
    };

    await this.historyService.addToHistory(userId, historyData);

    return video;
  }
}
