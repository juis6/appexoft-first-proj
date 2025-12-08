import express from "express"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import dotenv from "dotenv"
import cors from "cors"
import { historyService } from "./services/history.js"

dotenv.config()

const PORT = process.env.PORT || 3000
const app = express()

// Створити PostgreSQL connection pool
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

// Створити adapter
const adapter = new PrismaPg(pool)

// Ініціалізувати Prisma з adapter
const prisma = new PrismaClient({ adapter })

app.use(cors())
app.use(express.json())

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
        const limit = parseInt(req.query.limit)
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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})

process.on("SIGINT", async () => {
    await prisma.$disconnect()
    await pool.end()
    process.exit(0)
})