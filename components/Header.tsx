
import React from 'react';
import type { Player, GameMode } from '../types';
import { XIcon, OIcon } from './Icons';

interface HeaderProps {
    currentPlayer: Player;
    winner: Player | 'draw' | null;
    gameMode: GameMode;
    playerSymbol: Player;
    isAITurn: boolean;
}

export const Header: React.FC<HeaderProps> = ({ currentPlayer, winner, gameMode, playerSymbol, isAITurn }) => {
    const getStatusMessage = () => {
        if (winner) return ``; // Winner message handled by modal
        if (isAITurn) return "AI is thinking...";

        if (gameMode === 'pva') {
            return currentPlayer === playerSymbol ? "Your Turn" : "Opponent's Turn";
        }
        return `Player ${currentPlayer}'s Turn`;
    };

    return (
        <header className="text-center mb-6">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
                Gemini Tic-Tac-Toe
            </h1>
            <div className="h-8 flex items-center justify-center">
                <p className="text-xl font-semibold text-gray-300 transition-opacity duration-300">
                    {getStatusMessage()}
                </p>
            </div>
        </header>
    );
};
