import express, { Application, Request, Response, NextFunction } from "express";
import { router } from "./routes/routes";
export const app: Application = express();
import cors, { CorsOptions } from "cors";
const corsOptions: CorsOptions = {
    origin: process.env.CLIENT_ORIGIN,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api", router);
