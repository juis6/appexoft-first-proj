import { prisma } from "../config/database";
import { IHistoryEntry, IHistoryCreate, IAnalytics } from "../types/interfaces";

export class HistoryService {
  public async getHistory(userId: string): Promise<IHistoryEntry[]> {
    const history = await prisma.history.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return history;
  }

  public async addToHistory(
    userId: string,
    data: IHistoryCreate
  ): Promise<IHistoryEntry> {
    const existingEntry = await prisma.history.findFirst({
      where: {
        userId,
        videoId: data.videoId,
      },
    });

    if (existingEntry) {
      const updated = await prisma.history.update({
        where: { id: existingEntry.id },
        data: { createdAt: new Date() },
      });
      return updated;
    }

    const historyEntry = await prisma.history.create({
      data: {
        userId,
        ...data,
      },
    });

    return historyEntry;
  }

  public async getAnalytics(userId: string): Promise<IAnalytics> {
    const totalSearches = await prisma.history.count({
      where: { userId },
    });

    const recentSearches = await prisma.history.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return {
      totalSearches,
      recentSearches,
    };
  }
}
