import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import { requestContextMiddleware } from "./shared/middlewares/request-context.middleware";
import {
  errorMiddleware,
  notFoundMiddleware,
} from "./shared/middlewares/error.middleware";
import { healthRouter } from "./modules/health/routes/health.routes";
import { authRouter } from "./modules/auth/routes/auth.routes";
import { userRouter } from "./modules/users/routes/user.routes";
import { raffleRouter } from "./modules/raffles/routes/raffle.routes";
import { participantRouter } from "./modules/participants/routes/participant.routes";
import { prizeRouter } from "./modules/prizes/routes/prize.routes";
import { executionRouter } from "./modules/executions/routes/execution.routes";
import { resultRouter } from "./modules/results/routes/result.routes";
import { billingRouter } from "./modules/billing/routes/billing.routes";
import { auditRouter } from "./modules/audit/routes/audit.routes";

const app = express();
app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin:
      env.corsOrigin === "*"
        ? true
        : env.corsOrigin.split(",").map((origin) => origin.trim()),
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(requestContextMiddleware);

app.use(env.apiPrefix, healthRouter);
app.use(env.apiPrefix, authRouter);
app.use(env.apiPrefix, userRouter);
app.use(env.apiPrefix, raffleRouter);
app.use(env.apiPrefix, participantRouter);
app.use(env.apiPrefix, prizeRouter);
app.use(env.apiPrefix, executionRouter);
app.use(env.apiPrefix, resultRouter);
app.use(env.apiPrefix, billingRouter);
app.use(env.apiPrefix, auditRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
