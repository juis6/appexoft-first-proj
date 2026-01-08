import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import { prisma } from "./config/database";
import authRoutes from "./routes/auth.routes";
import apiRoutes from "./routes/api.routes";
import { ErrorMiddleware } from "./middleware/error.middleware";

const PORT = parseInt(process.env.PORT || "3000", 10);
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const app = express();

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "YouTube Video Search API with Authentication",
    status: "running",
  });
});

app.use("/auth", authRoutes);
app.use("/api", apiRoutes);

app.use(ErrorMiddleware.notFound);
app.use(ErrorMiddleware.handle);

app.listen(PORT, () => {
  console.log(`✓ Server is running on http://localhost:${PORT}`);
  console.log(`✓ Frontend URL: ${FRONTEND_URL}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
});

process.on("SIGINT", async () => {
  console.log("\n⚠ Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n⚠ Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});
