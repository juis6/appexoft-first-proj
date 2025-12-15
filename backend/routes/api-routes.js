import { Router } from "express"
import { youtubeControllers } from "../controllers/api-controllers.js"

const apiRoutes = Router()

apiRoutes.get("/search", youtubeControllers.searchController)
apiRoutes.get("/video/:videoId", youtubeControllers.videoDetailsController)
apiRoutes.get("/history", youtubeControllers.historyController)
apiRoutes.post("/history", youtubeControllers.addToHistoryController)
apiRoutes.get("/analytics", youtubeControllers.analyticsController)

export { apiRoutes }