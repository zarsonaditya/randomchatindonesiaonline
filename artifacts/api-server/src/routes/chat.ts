import { Router, type IRouter } from "express";
import { getStats } from "../lib/socket";

const router: IRouter = Router();

router.get("/chat/stats", (_req, res): void => {
  const stats = getStats();
  res.json(stats);
});

export default router;
