import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import dashboardRouter from "./dashboard";
import walletRouter from "./wallet";
import payrollRouter from "./payroll";
import remittancesRouter from "./remittances";
import escrowsRouter from "./escrows";
import creatorRouter from "./creator";
import agentsRouter from "./agents";
import ratesRouter from "./rates";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(dashboardRouter);
router.use(walletRouter);
router.use(payrollRouter);
router.use(remittancesRouter);
router.use(escrowsRouter);
router.use(creatorRouter);
router.use(agentsRouter);
router.use(ratesRouter);

export default router;
