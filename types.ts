export type PlayerSymbol = 'X' | 'O';
export type Player = PlayerSymbol | null;
export type BoardState = Player[];

// Fix: Add missing type definitions for GameMode and Difficulty.
export type GameMode = 'pvp' | 'pva';
export type Difficulty = 'easy' | 'medium' | 'expert';

export interface User {
    id: string;
    name: string;
}

export interface GameState {
    board: BoardState;
    turn: PlayerSymbol;
    players: { X: string; O: string };
    winner: PlayerSymbol | 'draw' | 'opponent_left' | null;
}

export interface IncomingRequest {
    fromId: string;
    fromName: string;
}
