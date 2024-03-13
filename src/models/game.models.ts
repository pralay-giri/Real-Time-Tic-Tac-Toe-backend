import { model, Schema } from "mongoose";

const playerSchema = new Schema({
    playerName: {
        type: String,
        required: true,
    },
    turn: {
        type: String,
        enum: {
            values: ["X", "O"],
            message: "{VALUE} is not supported",
        },
        required: true,
    },
});

const gameSchema = new Schema({
    roomId: {
        type: String,
        required: [true, "room id is required to create a game"],
        unique: [true, "room id need to be unique"],
    },
    confirmationId: {
        type: String,
        required: true,
        unique: true,
    },
    gameBord: {
        type: Array,
        default: Array(9).fill(-1),
    },
    lastTurn: {
        type: String,
        enum: {
            values: ["X", "O"],
            message: "{VALUE} is not supported",
        },
        default: "X",
        required: [true, "turn is required"],
    },
    winner: {
        type: String,
        enum: {
            values: ["X", "O", "DRAW", "INCOMPLETE"],
            message: "{VALUE} is not supported",
        },
        default: "INCOMPLETE",
    },
    players: [playerSchema],
});

export const GameModel = model("GameModel", gameSchema);
