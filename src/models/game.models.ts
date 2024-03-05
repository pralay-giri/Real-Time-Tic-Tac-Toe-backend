import mongoose, { model, Schema } from "mongoose";

const playerSchema = new Schema({
    playerId: {
        type: String,
        required: true,
        unique: true,
    },
});

const gameSchema = new Schema({
    roomId: {
        type: String,
        required: [true, "room id is required to create a game"],
        unique: [true, "room id need to be unique"],
    },
    gameBord: {
        type: Array,
        default: Array(9).fill(-1),
    },
    turn: {
        type: String,
        enum: {
            values: ["X", "O"],
            message: "{VALUE} is not supported",
        },
        default: "X",
        required: [true, "turn is required"],
    },
    winner: {
        type: ["X", "O", "DRAW", "INCOMPLETE"],
    },
    players: [playerSchema],
});

export const GameModel = model("GameModel", gameSchema);
