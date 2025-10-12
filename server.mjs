import { createServer } from 'http';
import { Server } from 'socket.io';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Create HTTP server that serves our HTML files
const server = createServer((req, res) => {
  let filePath = req.url === '/' ? '/index.html' : req.url;
  
  // Remove query parameters
  filePath = filePath.split('?')[0];
  
  try {
    const fullPath = join(__dirname, filePath);
    const content = readFileSync(fullPath);
    
    // Set appropriate content type
    const ext = filePath.split('.').pop();
    const contentTypes = {
      'html': 'text/html; charset=utf-8',
      'js': 'text/javascript',
      'mjs': 'text/javascript',
      'css': 'text/css',
      'json': 'application/json'
    };
    
    const contentType = contentTypes[ext] || 'text/plain';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
    
  } catch (error) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('File not found');
  }
});

// Setup Socket.IO for WebSocket communication
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store active rooms: roomCode -> { host: socketId, players: [socketIds] }
const rooms = new Map();

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  
  // Host creates a new room
  socket.on('create-room', (callback) => {
    // Generate simple 6-character room code
    const roomCode = Math.random().toString(36).slice(2, 8).toUpperCase();
    
    rooms.set(roomCode, {
      host: socket.id,
      players: new Set(),
      gameType: 'poker' // Default game type
    });
    
    socket.join(roomCode);
    socket.roomCode = roomCode;
    socket.isHost = true;
    
    console.log(`🏠 Room created: ${roomCode} by ${socket.id}`);
    
    if (callback) {
      callback({ success: true, roomCode });
    }
  });
  
  // Player joins an existing room
  socket.on('join-room', (data, callback) => {
    const { roomCode, playerId, chips } = data;
    const room = rooms.get(roomCode);
    
    if (!room) {
      if (callback) callback({ success: false, error: 'Room not found' });
      return;
    }
    
    // Join the room
    socket.join(roomCode);
    room.players.add(playerId);
    socket.roomCode = roomCode;
    socket.playerId = playerId;
    socket.isHost = false;
    
    console.log(`👤 Player ${playerId} joined room ${roomCode}`);
    
    // Send room info to player (including game type)
    socket.emit('room-info', { 
      roomCode, 
      gameType: room.gameType || 'basic',
      playerCount: room.players.size 
    });
    
    // Notify host about new player
    socket.to(roomCode).emit('player-joined', { playerId, chips });
    
    if (callback) {
      callback({ success: true, roomCode });
    }
  });
  
  // Relay any message to all other clients in the room
  socket.on('relay-message', (message) => {
    if (!socket.roomCode) {
      console.warn(`⚠️  Client ${socket.id} tried to send message without being in a room`);
      return;
    }

    // Add sender info
    const messageWithSender = {
      from: socket.id,
      ...message
    };

    // Check if this is a targeted message
    if (message.targetPlayer) {
      // Find the target player's socket
      const room = rooms.get(socket.roomCode);
      if (room && room.players.has(message.targetPlayer)) {
        // Send to specific player only
        const targetSocket = Array.from(io.sockets.sockets.values())
          .find(s => s.roomCode === socket.roomCode && s.playerId === message.targetPlayer);
        
        if (targetSocket) {
          targetSocket.emit('message', messageWithSender);
          console.log(`📨 Sent targeted message to ${message.targetPlayer} in room ${socket.roomCode}: ${message.type || 'unknown'}`);
        }
      }
    } else {
      // Broadcast to all in room (including sender for confirmation)
      io.to(socket.roomCode).emit('message', messageWithSender);
      console.log(`📨 Relayed message from ${socket.id} in room ${socket.roomCode}: ${message.type || 'unknown'}`);
    }
  });

  // Handle messages from players (using send-message instead of relay-message)
  socket.on('send-message', (message) => {
    if (!socket.roomCode) {
      console.warn(`⚠️  Client ${socket.id} tried to send message without being in a room`);
      return;
    }

    // Add sender info and broadcast to room
    const messageWithSender = {
      from: socket.id,
      fromPlayerId: socket.playerId,
      ...message
    };

    // Send to everyone in the room (including back to sender as confirmation)
    io.to(socket.roomCode).emit('message', messageWithSender);
    console.log(`📨 Sent message from ${socket.playerId || socket.id} in room ${socket.roomCode}: ${message.type || 'unknown'}`);
  });  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
    
    if (socket.roomCode && rooms.has(socket.roomCode)) {
      const room = rooms.get(socket.roomCode);
      
      if (socket.isHost) {
        // Host left, notify players and cleanup
        socket.to(socket.roomCode).emit('host-disconnected');
        rooms.delete(socket.roomCode);
        console.log(`🏠 Room ${socket.roomCode} closed (host left)`);
      } else {
        // Player left, remove from room
        room.players.delete(socket.playerId);
        socket.to(socket.roomCode).emit('relay-message', {
          from: socket.id,
          type: 'player-left'
        });
        console.log(`👤 Player ${socket.playerId} left room ${socket.roomCode}`);
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Poker server running on port ${PORT}`);
  console.log(`📱 Open http://localhost:${PORT} to play!`);
});