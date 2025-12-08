import express from "express"
import { PrismaClient } from "@prisma/client"

import dotenv from "dotenv"
import cors from "cors"

dotenv.config()

const PORT = process.env.PORT || 3000

const app = express()

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
})

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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})

process.on("SIGINT", async () => {
    await prisma.$disconnect()
    process.exit(0)
})

