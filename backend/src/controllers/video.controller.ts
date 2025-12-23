import { Request, Response } from "express";
import { VideoService } from "../services/video.service";
import { IApiResponse } from "../types/interfaces";

export class VideoController {
  private readonly videoService: VideoService;

  constructor() {
    this.videoService = new VideoService();
  }

  public search = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "User not authenticated",
        } as IApiResponse);
        return;
      }

      const query = req.query.q as string;
      const maxResults = req.query.maxResults
        ? parseInt(req.query.maxResults as string)
        : 10;

      if (!query) {
        res.status(400).json({
          success: false,
          error: "Search query is required",
        } as IApiResponse);
        return;
      }

      const videos = await this.videoService.searchVideos(
        userId,
        query,
        maxResults
      );

      res.status(200).json({
        success: true,
        data: { videos },
      } as IApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Search failed",
      } as IApiResponse);
    }
  };

  public getDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "User not authenticated",
        } as IApiResponse);
        return;
      }

      const videoId = req.params.videoId;

      if (!videoId) {
        res.status(400).json({
          success: false,
          error: "Video ID is required",
        } as IApiResponse);
        return;
      }

      const video = await this.videoService.getVideoDetails(userId, videoId);

      res.status(200).json({
        success: true,
        data: { video },
      } as IApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get video details",
      } as IApiResponse);
    }
  };
}
