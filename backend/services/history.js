import { prisma } from "../lib/prisma.js"

class HistoryService {
    async getHistory(limit = 20) {
        try {
            const history = await prisma.searchHistory.findMany({
                take: limit,
                orderBy: { timestamp: "desc" },
                select: { query: true, timestamp: true }
            })

            return history
        } catch (error) {
            console.log('Error fetching history:', error)
            return []
        }
    }

    async addToHistory(query) {
        try {
            await prisma.searchHistory.create({
                data: { query: query.trim(), timestamp: new Date() }
            })
        } catch (error) {
            console.log("Error adding to history:", error)
        }
    }

    async getAnalytics(limit = 10) {
        try {
            const analytics = await prisma.$queryRaw`
                SELECT 
                    query,
                    COUNT(*)::int as count
                FROM search_history
                GROUP BY query
                ORDER BY count DESC
                LIMIT ${limit}
                `;

            return analytics;
        } catch (error) {
            console.error('Error fetching analytics:', error);
            return [];
        }
    }
}

export const historyService = new HistoryService()