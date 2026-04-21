import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/rates", async (_req, res): Promise<void> => {
  res.json({
    usdgToInr: 83.52,
    usdgToUsd: 1.0,
    usdgToAed: 3.67,
    usdgToGbp: 0.79,
    updatedAt: new Date().toISOString(),
  });
});

export default router;
