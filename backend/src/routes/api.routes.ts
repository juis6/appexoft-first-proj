import { Router } from "express";
import historyRoutes from "./history.routes";
import videoRoutes from "./video.routes";

const router = Router();

router.use("/history", historyRoutes);
router.use("/video", videoRoutes);

export default router;
