import { Router } from "express";
import { VideoController } from "../controllers/video.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";

const router = Router();
const videoController = new VideoController();

router.use(AuthMiddleware.authenticate);

router.get("/search", videoController.search);
router.get("/:videoId", videoController.getDetails);

export default router;
