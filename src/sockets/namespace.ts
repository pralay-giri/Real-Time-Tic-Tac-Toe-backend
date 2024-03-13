import { Server } from "socket.io";
import { GameModel } from "../models/game.models";
import { generateId } from "../utils/generateRoomId";
import { GameStatus } from "../@types";

const namespace = (io: Server) => {
    io.on("connection", (socket) => {
        socket.on("create-game", async (data) => {
            const { roomId, playerName } = data.payload;
            const confirmationId = generateId(5);

            const turn: string =
                Math.floor(Math.random() * 100) % 2 === 0 ? "X" : "O";

            try {
                const newGame = new GameModel({
                    roomId,
                    lastTurn: "X",
                    confirmationId,
                    players: [
                        {
                            playerName,
                            turn,
                        },
                    ],
                });
                const reponse = await newGame.save();
                socket.join(roomId);
                if (!reponse) throw new Error("error in creating new game");
                socket.emit("game-created", {
                    turn,
                    status: "ok",
                    confirmationId,
                });
            } catch (error) {
                console.log(error);
                socket.emit("game-creation-error", error);
            }
        });

        socket.on("join-game", async (data) => {
            const { roomId, confirmationId, playerName } = data.payload;

            try {
                const game = await GameModel.findOne({
                    roomId,
                    confirmationId,
                });

                if (!game) throw new Error("not found");

                // join the socket id to room if it also in the room

                const ifPlayerAlreadyInGame = game?.players.find((player) => {
                    return player.playerName === playerName;
                });

                if (!ifPlayerAlreadyInGame && game.players.length >= 2) {
                    throw new Error("maximum number of player reach");
                }

                const oponentTurn = game.players[0].turn;
                const playerInfo = {
                    playerName,
                    turn: oponentTurn === "X" ? "O" : "X",
                };

                game.players.push(playerInfo);
                const response = await game.save();
                socket.join(response.roomId);
                io.to(response.roomId).emit("start-game", response);
            } catch (error) {
                socket.emit("error-join-game");
            }
        });

        socket.on("move", async (data) => {
            try {
                const {
                    turn,
                    playerInfo,
                    oponentInfo,
                    clickedIndex,
                    gameStat,
                    roomId,
                } = data.payload;
                const game = await GameModel.findOne({
                    roomId,
                });

                if (!game) throw new Error("game not found");

                // rechecking if the index is valid
                if (game?.gameBord[clickedIndex] !== -1 && clickedIndex <= 9)
                    throw new Error("clicked index is not empty");

                // updating the game state
                game.gameBord[clickedIndex] = playerInfo.turn === "X" ? 0 : 1;
                game.lastTurn = oponentInfo.turn;
                game.winner = gameStat;

                const updatedGame = await game.save();
                if (!updatedGame) throw new Error("error in updating");

                // checking game status and emit event repect to gamestatus
                switch (gameStat as GameStatus) {
                    case "INCOMPLETE": {
                        // finding the oponent socketId for emiting event
                        const socketIds = await io.to(roomId).fetchSockets();
                        const oponentSocketId = socketIds.find(
                            (socketId) => socketId.id !== socket.id
                        );

                        oponentSocketId?.emit("move", updatedGame);
                        break;
                    }
                    case "DRAW": {
                        io.to(roomId).emit("game-draw", updatedGame);
                        break;
                    }
                    case "X" || "O": {
                        io.to(roomId).emit("game-win", updatedGame);
                        break;
                    }
                    default: {
                        throw new Error("invalid move");
                    }
                }
            } catch (error) {
                console.log(error);
                socket.emit("move-error", { error });
            }
        });

        socket.on("restart-game", async (data) => {
            try {
                const { gameInfo } = data;

                // 1. find the oponent socket form the socket list on a gameRoom
                const sockets = await io.to(gameInfo.roomId).fetchSockets();
                const oponentSocketId = sockets.find(
                    (socketId) => socketId.id !== socket.id
                );
                if (!oponentSocketId) throw new Error("player already leave");

                oponentSocketId?.emit("confirm-restart");
            } catch (error) {
                console.log(error);
            }
        });

        socket.on("confirm-restart", async (gameInfo) => {
            try {
                const { roomId } = gameInfo;

                const game = await GameModel.findOne({ roomId });
                if (!game) throw new Error("game not found");

                // modify to default
                game.gameBord = new Array(9).fill(-1);
                game.lastTurn = gameInfo.lastTurn === "X" ? "O" : "X";
                game.players.map((player) => {
                    player.turn = player.turn === "X" ? "O" : "X";
                });
                game.winner = "INCOMPLETE";
                const updatedGame = await game.save();

                // sent game init request
                io.to(updatedGame.roomId).emit("start-game", updatedGame);
            } catch (error) {}
        });

        socket.on("handle-reload", async (gameInfo) => {
            try {
                //find the list of socket id if id exist return or join the game room
                const sockets = await io.to(gameInfo?.roomId).fetchSockets();
                const isPlayerInTheRoom = sockets.find(
                    (socketId) => socketId.id === socket.id
                );
                if (!isPlayerInTheRoom) {
                    socket.join(gameInfo?.roomId);
                }
            } catch (error) {
                console.log(error);
            }
        });

        socket.on("end-game", async (gameInfo) => {
            const { roomId } = gameInfo;
            try {
                await GameModel.deleteOne({ roomId });
                io.to(roomId).emit("end-game");
                const socketIds = await io.to(roomId).fetchSockets();
                socketIds.forEach((socketId) => {
                    socketId.leave(roomId);
                });
            } catch (error) {}
        });
    });
};
export default namespace;
