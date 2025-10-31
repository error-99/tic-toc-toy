
import React from 'react';
import type { GameMode, Difficulty, Player } from '../types';

interface ControlsProps {
    gameMode: GameMode;
    setGameMode: (mode: GameMode) => void;
    difficulty: Difficulty;
    setDifficulty: (difficulty: Difficulty) => void;
    resetGame: () => void;
    scores: { X: number; O: number; draw: number };
    playerSymbol: Player;
}

export const Controls: React.FC<ControlsProps> = ({ gameMode, setGameMode, difficulty, setDifficulty, resetGame, scores, playerSymbol }) => {
    const aiSymbol = playerSymbol === 'X' ? 'O' : 'X';

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-center bg-gray-800 p-1 rounded-xl shadow-inner">
                <button
                    onClick={() => setGameMode('pva')}
                    className={`flex-1 px-4 py-2 text-sm font-bold rounded-lg transition-colors ${gameMode === 'pva' ? 'bg-cyan-500 text-white shadow-md' : 'text-gray-400 hover:bg-gray-700'}`}
                >
                    VS AI
                </button>
                <button
                    onClick={() => setGameMode('pvp')}
                    className={`flex-1 px-4 py-2 text-sm font-bold rounded-lg transition-colors ${gameMode === 'pvp' ? 'bg-yellow-500 text-white shadow-md' : 'text-gray-400 hover:bg-gray-700'}`}
                >
                    VS Player
                </button>
            </div>
            
            {gameMode === 'pva' && (
                 <div className="flex flex-col items-center">
                    <label htmlFor="difficulty" className="text-sm font-medium text-gray-400 mb-1">AI Difficulty</label>
                    <select
                        id="difficulty"
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                        className="bg-gray-800 text-white border-gray-700 border-2 rounded-lg px-3 py-1.5 text-center appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="expert">Expert</option>
                    </select>
                </div>
            )}
            
            <div className="grid grid-cols-3 gap-2 text-center text-sm font-semibold">
                <div className="bg-cyan-500/20 text-cyan-300 p-2 rounded-lg">
                    <p>{playerSymbol} (YOU)</p>
                    <p className="text-2xl">{scores.X}</p>
                </div>
                 <div className="bg-gray-400/20 text-gray-300 p-2 rounded-lg">
                    <p>DRAWS</p>
                    <p className="text-2xl">{scores.draw}</p>
                </div>
                <div className="bg-yellow-500/20 text-yellow-300 p-2 rounded-lg">
                    <p>{aiSymbol} ({gameMode === 'pva' ? 'AI' : 'P2'})</p>
                    <p className="text-2xl">{scores.O}</p>
                </div>
            </div>

            <button
                onClick={resetGame}
                className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-bold text-lg hover:from-red-600 hover:to-orange-600 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
            >
                New Game
            </button>
        </div>
    );
};
