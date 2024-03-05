import express, { Application, Request, Response, NextFunction } from "express";
import cors, { CorsOptions } from "cors";
import { router } from "./routes/routes";
export const app: Application = express();

const corsOptions: CorsOptions = {
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
    methods: ["GET", "POST"],
};

app.use(express.json());
app.use(cors(corsOptions));

app.use("/api", router);
