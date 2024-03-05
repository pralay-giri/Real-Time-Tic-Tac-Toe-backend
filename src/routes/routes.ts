import { Router } from "express";
import { initGame } from "../controlers/initGame.controler";

export const router = Router();

router.route("/").get(initGame);
