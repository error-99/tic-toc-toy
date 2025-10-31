import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import type { User, GameState, IncomingRequest } from './types';

// Components
import { Board } from './components/Board';
import { GameOverModal } from './components/GameOverModal';

// App component
const App: React.FC = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string>('');
    const [players, setPlayers] = useState<User[]>([]);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [incomingRequest, setIncomingRequest] = useState<IncomingRequest | null>(null);
    
    useEffect(() => {
        // Force websocket transport and use default path to fix connection issues
        const newSocket = io({ transports: ['websocket'] });
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to server!');
            setError(''); // Clear error on successful connection
        });
        
        newSocket.on('connect_error', (err) => {
            console.error('Connection failed:', err.message);
            setError('Failed to connect to the server. Please try again later.');
        });

        newSocket.on('loginSuccess', (loggedInUser: User) => {
            setUser(loggedInUser);
            setError('');
        });
        newSocket.on('loginError', setError);
        newSocket.on('playerList', setPlayers);
        newSocket.on('incomingRequest', setIncomingRequest);
        newSocket.on('gameStart', (initialGameState: GameState) => {
            setGameState(initialGameState);
            setIncomingRequest(null);
        });
        newSocket.on('gameState', setGameState);

        return () => { newSocket.disconnect(); };
    }, []);

    const handleLogin = (pin: string) => {
        setError('');
        socket?.emit('login', pin);
    };

    const handleRequestGame = (targetId: string) => socket?.emit('requestGame', targetId);
    
    const handleAcceptGame = () => {
        if (incomingRequest) socket?.emit('acceptGame', incomingRequest.fromId);
    };

    const handleDeclineGame = () => setIncomingRequest(null);

    const handleCellClick = (index: number) => {
        if (gameState && gameState.board[index] === null && !gameState.winner) {
            socket?.emit('makeMove', { index });
        }
    };
    
    const resetGame = () => socket?.emit('newGameRequest');

    const mySymbol = useMemo(() => {
        if (!gameState || !user) return null;
        if (gameState.players.X === user.name) return 'X';
        if (gameState.players.O === user.name) return 'O';
        return null;
    }, [gameState, user]);

    if (!user) {
        return <LoginScreen onLogin={handleLogin} error={error} />;
    }

    if (!gameState) {
        return (
            <LobbyScreen
                currentUser={user}
                players={players}
                onRequestGame={handleRequestGame}
                incomingRequest={incomingRequest}
                onAccept={handleAcceptGame}
                onDecline={handleDeclineGame}
            />
        );
    }
    
    const opponentName = user.name === gameState.players.X ? gameState.players.O : gameState.players.X;
    const isMyTurn = mySymbol === gameState.turn && !gameState.winner;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-slate-800 flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md mx-auto">
                 <header className="text-center mb-6">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-2">
                        Tic-Tac-Toe
                    </h1>
                    <div className="h-8 flex items-center justify-center">
                        <p className="text-xl font-semibold text-gray-300 transition-opacity duration-300">
                             {gameState.winner ? `Game Over!` : isMyTurn ? "Your Turn" : `${opponentName}'s Turn`}
                        </p>
                    </div>
                </header>

                <main className="mb-6">
                    <Board board={gameState.board} onCellClick={handleCellClick} winnerInfo={{ winner: gameState.winner, mySymbol }} />
                </main>

                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-cyan-500/20 text-cyan-300 p-3 rounded-lg">
                        <p className="font-bold">{user.name} (You)</p>
                        <p className="font-mono text-2xl">{mySymbol}</p>
                    </div>
                    <div className="bg-yellow-500/20 text-yellow-300 p-3 rounded-lg">
                        <p className="font-bold">{opponentName}</p>
                        <p className="font-mono text-2xl">{mySymbol === 'X' ? 'O' : 'X'}</p>
                    </div>
                </div>
            </div>

            {gameState.winner && (
                <GameOverModal
                    winner={gameState.winner}
                    onReset={resetGame}
                    players={gameState.players}
                    mySymbol={mySymbol}
                />
            )}
             <footer className="absolute bottom-4 text-center text-gray-500 text-sm">
                <p>Multiplayer Tic-Tac-Toe</p>
            </footer>
        </div>
    );
};

const LoginScreen: React.FC<{ onLogin: (pin: string) => void; error: string }> = ({ onLogin, error }) => {
    const [pin, setPin] = useState('');
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onLogin(pin); };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-sm">
                 <h1 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-6">
                    Enter Your PIN
                </h1>
                <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full bg-gray-900 text-white p-3 rounded-lg border-2 border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-center text-lg"
                    placeholder="****"
                />
                {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                <button type="submit" className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold text-lg hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105 active:scale-95 shadow-lg">
                    Login
                </button>
            </form>
        </div>
    );
};

const LobbyScreen: React.FC<{
    currentUser: User,
    players: User[],
    onRequestGame: (id: string) => void,
    incomingRequest: IncomingRequest | null,
    onAccept: () => void,
    onDecline: () => void
}> = ({ currentUser, players, onRequestGame, incomingRequest, onAccept, onDecline }) => {
    const availablePlayers = players.filter(p => p.id !== currentUser.id);
    
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
             {incomingRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-2xl p-8 text-center w-full max-w-sm">
                        <h2 className="text-2xl font-bold mb-4">Game Request</h2>
                        <p className="text-gray-300 mb-6">{incomingRequest.fromName} wants to play with you!</p>
                        <div className="flex gap-4">
                            <button onClick={onAccept} className="flex-1 px-6 py-3 bg-green-500 text-white rounded-xl font-bold">Accept</button>
                            <button onClick={onDecline} className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-bold">Decline</button>
                        </div>
                    </div>
                </div>
            )}
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">
                 <h1 className="text-3xl font-extrabold text-center mb-2">Lobby</h1>
                 <p className="text-center text-gray-400 mb-6">Welcome, {currentUser.name}!</p>
                <h2 className="text-xl font-bold mb-4 text-cyan-400">Online Players</h2>
                 {availablePlayers.length > 0 ? (
                    <ul className="space-y-3 max-h-60 overflow-y-auto">
                        {availablePlayers.map(player => (
                            <li key={player.id} className="flex items-center justify-between bg-gray-900 p-3 rounded-lg">
                                <span className="font-semibold">{player.name}</span>
                                <button onClick={() => onRequestGame(player.id)} className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
                                    Challenge
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-gray-500 py-8">No other players online...</p>
                )}
            </div>
        </div>
    );
};

export default App;