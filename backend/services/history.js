import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class HistoryService {
    async getHistory(limit = 20) {
        try {
            const history = await prisma.searchHistory.findMany({
                orderBy: { timestamp: "desc" },
                take: limit,
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
}

export const historyService = new HistoryService()