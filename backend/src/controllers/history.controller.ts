import { Request, Response } from "express";
import { HistoryService } from "../services/history.service";
import { IApiResponse } from "../types/interfaces";

export class HistoryController {
  private readonly historyService: HistoryService;

  constructor() {
    this.historyService = new HistoryService();
  }

  public getHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "User not authenticated",
        } as IApiResponse);
        return;
      }

      const history = await this.historyService.getHistory(userId);

      res.status(200).json({
        success: true,
        data: { history },
      } as IApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to get history",
      } as IApiResponse);
    }
  };

  public addToHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "User not authenticated",
        } as IApiResponse);
        return;
      }

      const { videoId, title, thumbnail, channelTitle, duration, viewCount } =
        req.body;

      if (!videoId || !title || !thumbnail || !channelTitle) {
        res.status(400).json({
          success: false,
          error: "Missing required fields",
        } as IApiResponse);
        return;
      }

      const historyEntry = await this.historyService.addToHistory(userId, {
        videoId,
        title,
        thumbnail,
        channelTitle,
        duration: duration || "",
        viewCount: viewCount || "",
      });

      res.status(201).json({
        success: true,
        message: "Added to history",
        data: { historyEntry },
      } as IApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to add to history",
      } as IApiResponse);
    }
  };

  public getAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "User not authenticated",
        } as IApiResponse);
        return;
      }

      const analytics = await this.historyService.getAnalytics(userId);

      res.status(200).json({
        success: true,
        data: { analytics },
      } as IApiResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get analytics",
      } as IApiResponse);
    }
  };
}
