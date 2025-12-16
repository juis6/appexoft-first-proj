import { youtubeService } from "../services/api-service.js"
import { youtubeSerializer } from "../serializers/api-serializer.js"
import { prisma } from "../utils/prisma.js"

class YoutubeControllers {
    async searchController(req, res) {
        try {
            const response = await youtubeService.search(req.query)
            const data = await response.json()
            const serialized = youtubeSerializer.serializeSearchResult(data)

            await prisma.searchHistory.create({
                data: {
                    query: req.query.q,
                    userId: req.user?.userId || null
                }
            })

            res.status(200).json(serialized)
        } catch (err) {
            console.error("Search Controller error:", err.message)
            res.status(500).json({ error: err.message })
        }
    }

    async videoDetailsController(req, res) {
        try {
            const { videoId } = req.params

            const response = await youtubeService.videoDetails({ id: videoId })
            const data = await response.json()
            const serialized = youtubeSerializer.serializeVideoDetails(data.items[0])

            res.status(200).json(serialized)
        } catch (err) {
            console.error("VideoDetails Controller error:", err.message)
            res.status(500).json({ error: err.message })
        }
    }

    async historyController(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 12

            const whereClause = req.user
                ? { userId: req.user.userId }
                : { userId: null }

            const data = await prisma.searchHistory.findMany({
                where: whereClause,
                orderBy: { timestamp: 'desc' },
                take: limit
            })
            const serialized = youtubeSerializer.serializeHistory(data)

            res.status(200).json(serialized)
        } catch (err) {
            console.error('History Controller error:', err.message)
            res.status(500).json({ error: err.message })
        }
    }

    async addToHistoryController(req, res) {
        try {
            await prisma.searchHistory.create({
                data: {
                    query: req.body.query,
                    userId: req.user?.userId || null
                }
            })

            res.status(201).json({ success: true })
        } catch (err) {
            console.error('AddToHistory Controller error:', err.message)
            res.status(500).json({ error: err.message })
        }
    }

    async analyticsController(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 12

            const whereClause = req.user
                ? { userId: req.user.userId }
                : { userId: null }

            const data = await prisma.searchHistory.groupBy({
                by: ["query"],
                where: whereClause,
                _count: { query: true },
                orderBy: { _count: { query: "desc" } },
                take: limit
            })
            const serialized = youtubeSerializer.serializeAnalytics(data)

            res.status(200).json(serialized)
        } catch (err) {
            console.error('Analytics error:', err.message)
            res.status(500).json({ error: err.message })
        }
    }
}

export const youtubeControllers = new YoutubeControllers()