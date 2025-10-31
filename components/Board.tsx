import React from 'react';
import { Cell } from './Cell';
import type { BoardState, PlayerSymbol } from '../types';
import { WINNING_COMBINATIONS } from '../constants';

interface BoardProps {
    board: BoardState;
    onCellClick: (index: number) => void;
    winnerInfo: { winner: PlayerSymbol | 'draw' | 'opponent_left' | null, mySymbol: PlayerSymbol | null };
}

const StrikeLine: React.FC<{ combination: number[] | undefined }> = ({ combination }) => {
    if (!combination) return null;

    const [a, , c] = combination;
    const rowA = Math.floor(a / 3);
    const colA = a % 3;
    const rowC = Math.floor(c / 3);
    const colC = c % 3;

    const isDiagonal = Math.abs(colA - colC) === 2 && Math.abs(rowA - rowC) === 2;
    const isRevDiagonal = a === 2 && c === 6;
    const isHorizontal = rowA === rowC;
    const isVertical = colA === colC;

    let style: React.CSSProperties = {
        position: 'absolute',
        backgroundColor: '#f87171',
        height: '6px',
        borderRadius: '3px',
        transformOrigin: 'top left',
        transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
    };
    
    if (isHorizontal) {
        style = {
            ...style,
            width: '90%',
            top: `${16.66 * (rowA * 2 + 1) - 1}%`,
            left: '5%',
            transform: 'scaleX(1)',
        };
    } else if (isVertical) {
        style = {
            ...style,
            height: '90%',
            width: '6px',
            left: `${16.66 * (colA * 2 + 1) - 1}%`,
            top: '5%',
            transform: 'scaleY(1)',
        };
    } else if (isDiagonal) {
        style = {
            ...style,
            width: '115%',
            top: '10%',
            left: '8%',
            transform: 'rotate(45deg) scaleX(1)',
        };
    } else if (isRevDiagonal) {
        style = {
            ...style,
            width: '115%',
            top: '10%',
            left: '92%',
            transform: 'rotate(-45deg) scaleX(1)',
        };
    }

    return <div style={style} className="shadow-lg shadow-red-500/50"></div>;
};


export const Board: React.FC<BoardProps> = ({ board, onCellClick, winnerInfo }) => {
    
    const getWinningCombination = () => {
        if (!winnerInfo.winner || winnerInfo.winner === 'draw' || winnerInfo.winner === 'opponent_left') return undefined;
        return WINNING_COMBINATIONS.find(combo => {
            const [a, b, c] = combo;
            return board[a] && board[a] === board[b] && board[a] === board[c];
        });
    };

    const winningCombination = getWinningCombination();

    return (
        <div className="relative grid grid-cols-3 gap-3 p-3 bg-gray-800/50 rounded-2xl shadow-2xl backdrop-blur-sm">
            {board.map((player, index) => (
                <Cell
                    key={index}
                    player={player}
                    onClick={() => onCellClick(index)}
                    isWinningCell={winningCombination?.includes(index) ?? false}
                />
            ))}
            {winnerInfo.winner && winnerInfo.winner !== 'draw' && winnerInfo.winner !== 'opponent_left' && <StrikeLine combination={winningCombination} />}
        </div>
    );
};
