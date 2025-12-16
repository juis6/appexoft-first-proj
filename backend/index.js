import "dotenv/config"
import express from "express"
import morgan from "morgan"
import cors from "cors"
import cookieParser from "cookie-parser"

import { prisma } from "./utils/prisma.js"
import { apiRoutes } from "./routes/api-routes.js"
import { authRoutes } from "./routes/auth-routes.js"

const PORT = process.env.PORT
const FRONTEND_URL = process.env.FRONTEND_URL

const app = express()

app.use(morgan("tiny"))
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true
}))

app.get("/", (req, res) => {
    res.status(200).json({
        message: "YouTube Video Search API with Authentication"
    })
})

app.use("/auth", authRoutes)
app.use("/api", apiRoutes)

app.use((req, res) => {
    res.status(404).json({
        error: "Endpoint not found"
    })
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})

process.on("SIGINT", async () => {
    await prisma.$disconnect()
    process.exit(0)
})