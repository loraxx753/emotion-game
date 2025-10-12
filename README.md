# � Game Night

> **Universal multiplayer game platform that brings friends together**

A modern, server-based game platform built with Node.js and Socket.IO. Play poker, dice games, card games and more with friends using just a web browser - no downloads, no accounts, just pure gaming fun!

![Game Night Demo](https://img.shields.io/badge/Status-Live%20Demo-brightgreen) ![Node.js](https://img.shields.io/badge/Node.js-22+-green) ![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7-blue)

## ✨ Features

### 🎮 **Real-Time Multiplayer**
- Instant WebSocket communication
- No lag, no refresh needed
- Up to 8 players per table
- Cross-platform: desktop, mobile, tablet

### 🃏 **Complete Poker Experience**
- **Texas Hold'em rules**: 2 hole cards + 5 community cards
- **All betting rounds**: Preflop → Flop → Turn → River → Showdown
- **Smart hand evaluation**: Royal flush down to high card
- **Professional dealing**: Burn cards, proper shuffle, turn management

### 🏆 **Advanced Game Features**
- **Automatic winner determination** with detailed hand rankings
- **Split pot handling** for tied hands
- **Chip tracking** with starting stacks and bet management
- **Turn indicators** showing whose action it is
- **Fold/Call/Raise controls** with smart bet sizing

### 📱 **Modern Interface**
- **Mobile-optimized** responsive design
- **Real-time updates** for all game states
- **Visual celebrations** for winners with animations
- **Color-coded cards** (red hearts/diamonds, black clubs/spades)
- **Game message history** with timestamps

## 🚀 Quick Start (30 seconds)

### Local Development
```bash
git clone https://github.com/YOUR-USERNAME/game-night.git
cd game-night
npm install
npm start
```
Open `http://localhost:3000` and start playing!

### GitHub Codespaces (Recommended)
1. Click **"Code" → "Codespaces" → "Create codespace"**
2. Wait for auto-setup (2 minutes)
3. Run `npm start`
4. Share the public URL with friends!

**👉 [Full Deployment Guide](DEPLOYMENT.md)**

## 🎯 How to Play

### For the Host/Dealer
1. **Create Room**: Click "Host/Dealer" → Select Poker → Get room code
2. **Manage Players**: See who joins, track chip counts
3. **Deal Cards**: 
   - "Deal New Hand" → Players get hole cards
   - "Deal Flop" → 3 community cards
   - "Deal Turn" → 4th community card  
   - "Deal River" → 5th community card
   - "Showdown" → Determine winner automatically
4. **Control Betting**: Advance between rounds, reset game

### For Players
1. **Join Game**: Click "Join as Player" → Enter room code and name
2. **Play Poker**: 
   - View your hole cards (private)
   - See community cards (shared)
   - **Fold** when you have bad cards
   - **Call** to match the current bet
   - **Raise** to increase the bet
3. **Win Big**: Watch for winner celebrations and chip updates!

## 🏗 Technical Architecture

### Backend (`server.mjs`)
```javascript
// Real-time WebSocket server
const io = new Server(server);

// Room management
const rooms = new Map(); // roomCode → {host, players, gameType}

// Message routing: host ↔ players
socket.on('send-message', handlePlayerMessage);
socket.on('relay-message', handleHostMessage);
```

### Frontend Stack
- **Vanilla JavaScript** - No frameworks, pure performance
- **Socket.IO Client** - Real-time bidirectional communication  
- **CSS3 Animations** - Smooth winner celebrations
- **Responsive Design** - Mobile-first approach

### Game Logic (`PokerGameModule`)
```javascript
// Complete poker implementation
class PokerGameModule {
  dealNewHand()     // Shuffle, deal hole cards
  dealFlop()        // Burn + 3 community cards
  dealTurn()        // Burn + 1 community card  
  dealRiver()       // Burn + 1 community card
  showdown()        // Evaluate hands, determine winner
  evaluateHand()    // 7-card hand evaluation
}
```

## 🛠 Development

### Project Structure
```
game-night/
├── server.mjs              # WebSocket server + file serving
├── index.html              # Modern landing page
├── host.html               # Host interface with game controls
├── player.html             # Player interface with game actions
├── package.json            # Dependencies (socket.io)
├── .devcontainer/          # GitHub Codespaces config
│   └── devcontainer.json   # Node.js 22, auto port forwarding
└── README.md               # This file
```

### Key Dependencies
```json
{
  "dependencies": {
    "socket.io": "^4.7.0"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

## 🚀 Deployment to GitHub Codespaces

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Complete poker party implementation"
git push origin main
```

### Step 2: Create Codespace
1. Go to your GitHub repo
2. Click **"Code" → "Codespaces" → "Create codespace on main"**
3. Wait 2-3 minutes for setup
4. Run `npm start`
5. Share the public URL!

### Step 3: Play with Friends
- Codespace gives you a public URL like: `https://username-game-night-abc123.github.dev`
- **For production**: Deploy to custom domain like `https://game-night.online`
- Share URL with friends
- Host creates room, friends join with room code
- Play real-time games!

**👉 See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions**

## 🤝 Contributing

### Adding Features
- **Blinds system**: Small/big blind rotation
- **Tournament mode**: Elimination brackets
- **Hand history**: Save and replay games
- **Chat system**: Player communication

### Bug Reports
Open an issue with:
- Steps to reproduce
- Expected vs actual behavior
- Browser/device info

## 📄 License

MIT License - Use this for your own poker nights!

---

**🎉 Ready to play? Deploy to Codespaces and start your game night!**