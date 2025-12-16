import { Router } from "express"
import { authController } from "../controllers/auth-controllers.js"
import { authenticateToken } from "../middleware/auth.js"

const authRoutes = Router()

authRoutes.post("/register", authController.register)
authRoutes.post("/login", authController.login)
authRoutes.post("/logout", authController.logout)
authRoutes.post("/refresh", authController.refresh)

authRoutes.get("/me", authenticateToken, authController.me)

export { authRoutes }