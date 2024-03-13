import { Document } from "mongoose";
import { initGameConfig } from "../@types";
import { GameModel } from "../models/game.models";
import { Socket } from "socket.io";

export const initGame = async (data: initGameConfig, socket: Socket) => {
    try {
        // first find if there are any game that request to

        const response: any = await GameModel.findOne({ roomId: data.roomId });
        if (response) {
            console.log(response);
            response.players.push({
                playerId: socket.id,
                playerName: data.playerName,
                turn: "O",
            });
            await response.save();
            socket.join(data.roomId);
            socket.to(data.roomId).emit("player2-joined", response);
            return;
        }

        const gameDoc: Document = new GameModel({
            roomId: data.roomId,
            turn: "X",
            players: [
                { playerId: socket.id, playerName: data.playerName, turn: "X" },
            ],
        });
        const game = await gameDoc.save();
        console.log(game);
        socket.join(data.roomId);
        socket.emit("game-initialized", { data: game });
    } catch (error) {
        console.log(error);
    }
};
