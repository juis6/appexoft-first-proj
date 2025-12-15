import "dotenv/config"
import express from "express"
import morgan from "morgan"
import cors from "cors"

import { prisma } from "./lib/prisma.js"
import { apiRoutes } from "./routes/api-routes.js"

const PORT = process.env.PORT

const app = express()

app.use(morgan("tiny"))
app.use(express.json())
app.use(cors())

app.get("/", (req, res) => {
    res.status(200).json({
        message: "YouTube Video Search API"
    })
})

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
