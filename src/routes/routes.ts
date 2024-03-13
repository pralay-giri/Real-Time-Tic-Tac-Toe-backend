import { NextFunction, Request, Response, Router } from "express";

export const router = Router();

router.route("/").get((req: Request, res: Response, next: NextFunction) => {
    res.send("hello from tic-tac-toe backend");
});
