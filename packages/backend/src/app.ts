import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { routes } from "./routes/index.js";
import { errorHandler } from "./middleware/error-handler.js";

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/api", routes);
app.use(errorHandler);

export default app;
