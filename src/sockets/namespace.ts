import { Server, Socket } from "socket.io";
import { initGameConfig } from "../@types";
import { GameModel } from "../models/game.models";
import { Document } from "mongoose";

export const namespace = (io: Server) => {
    io.on("conection", (socket: Socket) => {
        console.log("socket conected to the client");
        socket.on("initializ-game", (data: initGameConfig) => {
            try {
                const gameDoc: Document = new GameModel({
                    roomId: data.roomId,
                    turn: "x",
                    players: [socket.id],
                });
                console.log(gameDoc);
                socket.emit("game-initialized", { data: "ok" });
            } catch (error) {
                console.log(error);
            }
        });
    });
};
