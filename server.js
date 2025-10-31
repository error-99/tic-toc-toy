const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow connections from any origin
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '')));

const usersFilePath = path.join(__dirname, 'users.json');
let usersData = {};
try {
    usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
    console.log("Loaded users.json successfully.");
} catch (err) {
    console.error(`Could not read ${usersFilePath}, creating a default one. Please populate it.`);
    usersData = { "1234": "Player1", "5678": "Player2" };
    fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2));
}

const pinsInUse = new Set();
const socketToPin = new Map();
const players = {}; // socket.id -> { id, name, room }
const games = {}; // room -> { board, turn, players: {X, O}, winner }

const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

function checkWinner(board) {
    for (const combination of WINNING_COMBINATIONS) {
        const [a, b, c] = combination;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a]; // 'X' or 'O'
        }
    }
    return board.includes(null) ? null : 'draw';
}

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    function getLobbyPlayers() {
        return Object.values(players).filter(p => !p.room);
    }

    function broadcastLobbyUpdate() {
        io.emit('playerList', getLobbyPlayers());
    }

    socket.on('login', (pin) => {
        pin = pin.trim();
        if (!usersData[pin]) {
            return socket.emit('loginError', 'Invalid PIN.');
        }
        if (pinsInUse.has(pin)) {
             return socket.emit('loginError', 'This PIN is already in use.');
        }

        const name = usersData[pin];
        pinsInUse.add(pin);
        socketToPin.set(socket.id, pin);
        players[socket.id] = { id: socket.id, name, room: null };

        socket.emit('loginSuccess', { id: socket.id, name });
        broadcastLobbyUpdate();
    });

    socket.on('requestGame', (targetId) => {
        const challenger = players[socket.id];
        const target = players[targetId];

        if (!challenger || !target || challenger.room || target.room) {
             return socket.emit('gameRequestError', 'Player is not available.');
        }
        
        io.to(targetId).emit('incomingRequest', { fromId: socket.id, fromName: challenger.name });
    });
    
    socket.on('acceptGame', (challengerId) => {
        const challenger = players[challengerId];
        const acceptor = players[socket.id];

        if (!challenger || !acceptor || challenger.room || acceptor.room) return;

        const room = `game_${socket.id}_${challengerId}`;
        challenger.room = room;
        acceptor.room = room;

        const challengerSocket = io.sockets.sockets.get(challengerId);
        challengerSocket?.join(room);
        socket.join(room);

        const board = Array(9).fill(null);
        const turn = 'X';
        
        const playersMap = Math.random() < 0.5 
            ? { X: challenger.name, O: acceptor.name } 
            : { X: acceptor.name, O: challenger.name };

        games[room] = { room, board, turn, players: playersMap, winner: null };

        io.to(room).emit('gameStart', games[room]);
        broadcastLobbyUpdate();
    });
    
    socket.on('makeMove', ({ index }) => {
        const player = players[socket.id];
        if (!player || !player.room) return;

        const room = player.room;
        const game = games[room];
        if (!game || game.winner) return;

        const currentSymbol = game.turn;
        const playerNameForSymbol = game.players[currentSymbol];

        if (player.name !== playerNameForSymbol) return;
        if (game.board[index] !== null) return;

        game.board[index] = currentSymbol;
        game.winner = checkWinner(game.board);
        game.turn = currentSymbol === 'X' ? 'O' : 'X';

        io.to(room).emit('gameState', game);
    });

    socket.on('newGameRequest', () => {
        const player = players[socket.id];
        if (!player || !player.room) return;
        const room = player.room;
        const game = games[room];
        if (!game) return;

        game.board = Array(9).fill(null);
        game.winner = null;
        game.turn = 'X';

        io.to(room).emit('gameStart', game);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        const player = players[socket.id];
        
        if (player) {
            if (player.room) {
                const room = player.room;
                const game = games[room];
                if (game) {
                    game.winner = 'opponent_left';
                    io.to(room).emit('gameState', game);
                    // Clean up players in the room so they can play again
                    Object.values(players).forEach(p => {
                        if (p.room === room) p.room = null;
                    });
                    delete games[room];
                }
            }
        }
        
        const pin = socketToPin.get(socket.id);
        if (pin) {
            pinsInUse.delete(pin);
            socketToPin.delete(socket.id);
        }

        delete players[socket.id];
        broadcastLobbyUpdate();
    });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});