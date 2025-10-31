
import { GoogleGenAI, Type } from "@google/genai";
import type { BoardState, Difficulty } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    // This will not be shown to the user but is good for development.
    // The app will fail gracefully and fall back to random moves.
    console.error("API_KEY is not set. AI will not function.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const getSystemInstruction = (difficulty: Difficulty) => {
    switch(difficulty) {
        case 'easy':
            return `You are playing Tic-Tac-Toe. Sometimes you make random, non-optimal moves. Your goal is to provide a fun, easy-going game.`;
        case 'medium':
            return `You are a skilled Tic-Tac-Toe player. You should try to win, but you might occasionally make a mistake or miss an optimal move.`;
        case 'expert':
            return `You are an unbeatable Tic-Tac-Toe grandmaster. You must analyze the board and make the absolute best strategic move to win or draw. Never make a mistake. Prioritize winning moves, then blocking moves, then strategic positions like corners or center.`;
    }
}

export const getAIMove = async (board: BoardState, difficulty: Difficulty): Promise<number | null> => {
    if(!API_KEY) {
        console.warn("Attempted to get AI move without API key.");
        return null;
    }
    
    const boardString = board.map(p => p || '_').join('');
    const availableMoves = board
        .map((cell, index) => (cell === null ? index : null))
        .filter(index => index !== null)
        .join(', ');

    const prompt = `
        The Tic-Tac-Toe board is represented by a 9-character string. 'X' is a player, 'O' is another player, and '_' is an empty cell.
        The current board is: ${boardString}.
        Indices are 0-8 from top-left to bottom-right.
        You are player 'O'. The opponent is 'X'.
        The available moves are at indices: [${availableMoves}].
        Based on your difficulty level, choose the best possible move from the available options and return it as a JSON object with a single key "move".
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: getSystemInstruction(difficulty),
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        move: {
                            type: Type.INTEGER,
                            description: "The index of the cell to play, from 0 to 8."
                        }
                    }
                }
            }
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);

        if (typeof result.move === 'number' && result.move >= 0 && result.move <= 8) {
            return result.move;
        }

        return null;
    } catch (error) {
        console.error("Error fetching move from Gemini API:", error);
        return null;
    }
};
