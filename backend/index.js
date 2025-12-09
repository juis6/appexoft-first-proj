import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import morgan from "morgan"
import { historyService } from "./services/history.js"
import { prisma, pool } from "./lib/prisma.js"
import { youtubeService } from "./services/youtube.js"
import { cacheService } from "./services/cache.js"

dotenv.config()

const PORT = process.env.PORT || 3000
const app = express()

app.use(cors())
app.use(express.json())
app.use(morgan("tiny"))

app.get("/", (req, res) => {
    res.json({ msg: "YouTube Video Search API" })
})

app.get("/health", async (req, res) => {
    try {
        await prisma.$connect()
        res.json({
            status: 'ok',
            database: 'connected',
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        res.status(503).json({
            status: 'error',
            database: 'disconnected',
            message: error.message
        })
    }
})

app.get("/api/history", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20
        const history = await historyService.getHistory(limit);
        res.json({ history })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.post('/api/history', async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }
        await historyService.addToHistory(query);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/search', async (req, res) => {
    try {
        const { q, pageToken, maxResults = 12 } = req.query;

        if (!q) {
            return res.status(400).json({ error: 'Query parameter "q" is required' });
        }

        const cache = await cacheService.getSearchCache(q, pageToken)
        if (cache) {
            console.log("Cache HIT for query:", q)
            return res.json(cache)
        }
        console.log("Cache MISS for query:", q)

        await historyService.addToHistory(q);

        const result = await youtubeService.searchVideos(q, pageToken, parseInt(maxResults));

        await cacheService.setSearchCache(q, pageToken, result)

        res.json(result);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/video/:videoId', async (req, res) => {
    try {
        const { videoId } = req.params;

        if (!videoId) {
            return res.status(400).json({ error: 'Video ID is required' });
        }

        const cached = await cacheService.getVideoCache(videoId);
        if (cached) {
            console.log('Cache HIT for video:', videoId);
            return res.json(cached);
        }

        console.log('Cache MISS for video:', videoId);

        const details = await youtubeService.getVideoDetails(videoId);

        await cacheService.setVideoCache(details);

        res.json(details);
    } catch (error) {
        console.error('Video details error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/cache/clear', async (req, res) => {
    try {
        await cacheService.clearExpiredCache();
        res.json({ message: 'Expired cache cleared successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/analytics', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const analytics = await historyService.getAnalytics(limit);
        res.json(analytics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.use((req, res) => {
    res.status(404).json({ error: "Endoint not found" })
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})

process.on("SIGINT", async () => {
    await prisma.$disconnect()
    await pool.end()
    process.exit(0)
})