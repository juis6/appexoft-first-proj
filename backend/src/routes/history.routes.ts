import { Router } from "express";
import { HistoryController } from "../controllers/history.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";

const router = Router();
const historyController = new HistoryController();

router.use(AuthMiddleware.authenticate);

router.get("/", historyController.getHistory);
router.post("/", historyController.addToHistory);
router.get("/analytics", historyController.getAnalytics);

export default router;
