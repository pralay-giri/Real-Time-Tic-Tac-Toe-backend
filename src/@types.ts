export interface initGameConfig {
    roomId: string;
    playerId: string;
    playerName: string;
}

export type GameStatus = "X" | "O" | "INCOMPLETE" | "DRAW";
