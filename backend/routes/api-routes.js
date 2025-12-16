import { Router } from "express"
import { youtubeControllers } from "../controllers/api-controllers.js"
import { optionalAuth } from "../middleware/auth.js"

const apiRoutes = Router()

apiRoutes.get("/search", optionalAuth, youtubeControllers.searchController)
apiRoutes.get("/video/:videoId", optionalAuth, youtubeControllers.videoDetailsController)
apiRoutes.get("/history", optionalAuth, youtubeControllers.historyController)
apiRoutes.post("/history", optionalAuth, youtubeControllers.addToHistoryController)
apiRoutes.get("/analytics", optionalAuth, youtubeControllers.analyticsController)

export { apiRoutes }