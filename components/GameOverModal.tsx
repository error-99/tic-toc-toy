import React from 'react';
import type { PlayerSymbol } from '../types';

interface GameOverModalProps {
    winner: PlayerSymbol | 'draw' | 'opponent_left' | null;
    onReset: () => void;
    players: { X: string; O: string };
    mySymbol: PlayerSymbol | null;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ winner, onReset, players, mySymbol }) => {
    if (!winner) return null;
    
    let message = '';
    let subMessage = '';
    const winnerName = winner === 'X' ? players.X : players.O;
    
    if (winner === 'draw') {
        message = "It's a Draw!";
        subMessage = "A worthy opponent. Care for a rematch?";
    } else if (winner === 'opponent_left') {
        message = 'Opponent Left';
        subMessage = 'You win by default!';
    } else if (winner === mySymbol) {
        message = 'You Won!';
        subMessage = `Victory is sweet, ${winnerName}!`;
    } else {
        message = 'You Lost!';
        subMessage = `${winnerName} wins this round.`;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out">
            <div className="bg-gray-800 rounded-2xl shadow-xl p-8 text-center w-full max-w-sm mx-4 transform transition-all scale-95 opacity-0 animate-fade-in-scale">
                <h2 className="text-3xl font-extrabold text-white mb-2">{message}</h2>
                <p className="text-gray-400 mb-6">{subMessage}</p>
                <button
                    onClick={onReset}
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                >
                    New Game
                </button>
            </div>
            <style>{`
                @keyframes fade-in-scale {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-fade-in-scale { animation: fade-in-scale 0.3s forwards cubic-bezier(0.25, 0.46, 0.45, 0.94); }
            `}</style>
        </div>
    );
};
