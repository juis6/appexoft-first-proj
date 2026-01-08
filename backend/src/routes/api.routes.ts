import { Router } from "express";
import historyRoutes from "./history.routes";
import videoRoutes from "./video.routes";
import { HistoryController } from "../controllers/history.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";

const router = Router();
const historyController = new HistoryController();

router.use("/history", historyRoutes);
router.use("/video", videoRoutes);

router.get(
  "/analytics",
  AuthMiddleware.authenticate,
  historyController.getAnalytics
);

export default router;
