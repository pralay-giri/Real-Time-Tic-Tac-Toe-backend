import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";

export const initGame = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        res.send("hello from server");
    }
);
