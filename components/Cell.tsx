
import React from 'react';
import type { Player } from '../types';
import { XIcon, OIcon } from './Icons';

interface CellProps {
    player: Player;
    onClick: () => void;
    isWinningCell: boolean;
}

export const Cell: React.FC<CellProps> = ({ player, onClick, isWinningCell }) => {
    const playerClass = player ? (player === 'X' ? 'text-cyan-400' : 'text-yellow-400') : '';
    const winningClass = isWinningCell ? 'scale-110' : '';

    return (
        <div
            className="aspect-square bg-gray-900 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 ease-in-out transform hover:bg-gray-700/80 active:scale-95 shadow-md"
            onClick={onClick}
        >
            <div className={`transition-transform duration-300 ease-in-out ${player ? 'scale-100' : 'scale-0'} ${winningClass}`}>
                {player === 'X' && <XIcon className={`w-1/2 h-1/2 ${playerClass}`} />}
                {player === 'O' && <OIcon className={`w-1/2 h-1/2 ${playerClass}`} />}
            </div>
        </div>
    );
};
