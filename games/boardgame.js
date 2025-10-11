// Board Game Module for Universal Game Host
// Generic board game with dice, tokens, and turn management

export default class BoardGame {
  constructor(host) {
    this.host = host;
    this.gameState = {
      currentPlayer: null,
      turnNumber: 0,
      players: [],
      board: this.createBoard(8, 8), // 8x8 grid by default
      dice: []
    };
  }
  
  onRoomCreated(roomCode) {
    console.log('Board game module: room created', roomCode);
    this.initializeBoardGameUI();
  }
  
  onPlayerJoined(data) {
    const { playerId } = data;
    console.log('Board game: player joined', playerId);
    
    if (!this.gameState.players.find(p => p.id === playerId)) {
      const colors = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠'];
      const playerColor = colors[this.gameState.players.length % colors.length];
      
      this.gameState.players.push({
        id: playerId,
        color: playerColor,
        position: { x: 0, y: 0 }, // Starting position
        score: 0
      });
      
      this.updateBoardDisplay();
      this.refreshPlayerSelect();
      
      // Send welcome to new player
      this.host.sendToPlayer(playerId, {
        type: 'BOARD_STATE',
        state: this.getPublicGameState(),
        yourColor: playerColor
      });
    }
  }
  
  onPlayerLeft(data) {
    const { playerId } = data;
    console.log('Board game: player left', playerId);
    
    this.gameState.players = this.gameState.players.filter(p => p.id !== playerId);
    this.updateBoardDisplay();
    this.refreshPlayerSelect();
  }
  
  onMessage(msg) {
    if (msg.type === 'MOVE_TOKEN') {
      this.handleTokenMove(msg);
    } else if (msg.type === 'DICE_ROLL') {
      this.handleDiceRoll(msg);
    }
  }
  
  handleTokenMove(msg) {
    const { player, x, y } = msg;
    const playerObj = this.gameState.players.find(p => p.id === player);
    
    if (playerObj && this.isValidMove(x, y)) {
      playerObj.position = { x, y };
      this.updateBoardDisplay();
      this.broadcastGameState();
    }
  }
  
  handleDiceRoll(msg) {
    const { player, sides = 6 } = msg;
    const roll = Math.floor(Math.random() * sides) + 1;
    
    this.host.broadcast({
      type: 'DICE_RESULT',
      player: player,
      roll: roll,
      sides: sides
    });
  }
  
  initializeBoardGameUI() {
    const boardHTML = `
      <div style="display: grid; gap: 1rem; grid-template-columns: 2fr 1fr;">
        
        <!-- Game Board -->
        <div>
          <h3>🎲 Game Board</h3>
          <div id="gameBoard" style="display: grid; grid-template-columns: repeat(8, 1fr); gap: 2px; background: #333; padding: 10px; border-radius: 8px; max-width: 400px;">
            <!-- Board squares will be generated here -->
          </div>
        </div>
        
        <!-- Game Controls -->
        <div>
          <h3>Game Controls</h3>
          
          <h4>Turn Management</h4>
          <div style="display: flex; gap: .5rem; align-items: center; margin-bottom: 1rem;">
            <select id="playerSelect">
              <option value="">Select player...</option>
            </select>
            <button id="btnNextTurn">Next Turn</button>
          </div>
          
          <h4>Dice</h4>
          <div style="display: flex; gap: .5rem; align-items: center; margin-bottom: 1rem;">
            <select id="diceType">
              <option value="6">D6</option>
              <option value="20">D20</option>
              <option value="100">D100</option>
            </select>
            <button id="btnRollDice">🎲 Roll</button>
            <span id="diceResult" style="font-weight: bold;"></span>
          </div>
          
          <h4>Players</h4>
          <div id="playersStatus">
            <!-- Player status will appear here -->
          </div>
          
          <h4>Quick Actions</h4>
          <div style="display: grid; gap: .5rem;">
            <button id="btnResetBoard">🔄 Reset Board</button>
            <button id="btnScoreRound">📊 Score Round</button>
          </div>
        </div>
        
      </div>
    `;
    
    this.host.setGameUI(boardHTML);
    this.setupBoardEventListeners();
    this.renderBoard();
  }
  
  setupBoardEventListeners() {
    document.getElementById('btnNextTurn').addEventListener('click', () => this.nextTurn());
    document.getElementById('btnRollDice').addEventListener('click', () => this.rollDice());
    document.getElementById('btnResetBoard').addEventListener('click', () => this.resetBoard());
    document.getElementById('btnScoreRound').addEventListener('click', () => this.scoreRound());
    
    // Board click handling
    document.getElementById('gameBoard').addEventListener('click', (e) => {
      if (e.target.classList.contains('board-square')) {
        const x = parseInt(e.target.dataset.x);
        const y = parseInt(e.target.dataset.y);
        this.handleHostTokenPlace(x, y);
      }
    });
  }
  
  createBoard(width, height) {
    const board = [];
    for (let y = 0; y < height; y++) {
      board[y] = [];
      for (let x = 0; x < width; x++) {
        board[y][x] = {
          x, y,
          type: 'normal', // normal, special, blocked, etc.
          occupant: null
        };
      }
    }
    return board;
  }
  
  renderBoard() {
    const boardEl = document.getElementById('gameBoard');
    boardEl.innerHTML = '';
    
    for (let y = 0; y < this.gameState.board.length; y++) {
      for (let x = 0; x < this.gameState.board[y].length; x++) {
        const square = document.createElement('div');
        square.className = 'board-square';
        square.dataset.x = x;
        square.dataset.y = y;
        square.style.cssText = `
          aspect-ratio: 1;
          background: ${(x + y) % 2 === 0 ? '#f0f0f0' : '#d0d0d0'};
          border: 1px solid #999;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.2em;
        `;
        
        // Show player tokens
        const playerHere = this.gameState.players.find(p => p.position.x === x && p.position.y === y);
        if (playerHere) {
          square.textContent = playerHere.color;
          square.title = playerHere.id;
        }
        
        boardEl.appendChild(square);
      }
    }
  }
  
  handleHostTokenPlace(x, y) {
    // Host can place/move the current player's token
    const currentPlayer = this.gameState.players.find(p => p.id === this.gameState.currentPlayer);
    if (currentPlayer) {
      currentPlayer.position = { x, y };
      this.updateBoardDisplay();
      this.broadcastGameState();
    }
  }
  
  nextTurn() {
    if (this.gameState.players.length === 0) return;
    
    const currentIndex = this.gameState.players.findIndex(p => p.id === this.gameState.currentPlayer);
    const nextIndex = (currentIndex + 1) % this.gameState.players.length;
    
    this.gameState.currentPlayer = this.gameState.players[nextIndex].id;
    this.gameState.turnNumber++;
    
    this.updateBoardDisplay();
    this.host.broadcast({
      type: 'TURN_CHANGE',
      currentPlayer: this.gameState.currentPlayer,
      turnNumber: this.gameState.turnNumber
    });
  }
  
  rollDice() {
    const sides = parseInt(document.getElementById('diceType').value);
    const roll = Math.floor(Math.random() * sides) + 1;
    
    document.getElementById('diceResult').textContent = `Rolled: ${roll}`;
    
    this.host.broadcast({
      type: 'DICE_RESULT',
      player: 'Host',
      roll: roll,
      sides: sides
    });
  }
  
  resetBoard() {
    this.gameState.players.forEach(player => {
      player.position = { x: 0, y: 0 };
      player.score = 0;
    });
    
    this.gameState.turnNumber = 0;
    this.gameState.currentPlayer = this.gameState.players[0]?.id || null;
    
    this.updateBoardDisplay();
    this.broadcastGameState();
  }
  
  scoreRound() {
    // Simple scoring: each player gets points based on their distance from origin
    this.gameState.players.forEach(player => {
      const distance = Math.abs(player.position.x) + Math.abs(player.position.y);
      player.score += distance;
    });
    
    this.updateBoardDisplay();
    this.broadcastGameState();
  }
  
  updateBoardDisplay() {
    this.renderBoard();
    this.updatePlayersStatus();
  }
  
  updatePlayersStatus() {
    const statusEl = document.getElementById('playersStatus');
    statusEl.innerHTML = this.gameState.players.map(player => `
      <div style="display: flex; justify-content: space-between; padding: .5rem; margin: .25rem 0; background: ${player.id === this.gameState.currentPlayer ? '#e0f2fe' : '#f9fafb'}; border-radius: 4px;">
        <span>${player.color} <strong>${player.id}</strong></span>
        <span>Score: ${player.score}</span>
      </div>
    `).join('');
  }
  
  refreshPlayerSelect() {
    const select = document.getElementById('playerSelect');
    select.innerHTML = '<option value="">Select player...</option>';
    this.gameState.players.forEach(player => {
      const option = document.createElement('option');
      option.value = player.id;
      option.textContent = `${player.color} ${player.id}`;
      if (player.id === this.gameState.currentPlayer) {
        option.selected = true;
      }
      select.appendChild(option);
    });
  }
  
  broadcastGameState() {
    this.host.broadcast({
      type: 'BOARD_STATE',
      state: this.getPublicGameState()
    });
  }
  
  getPublicGameState() {
    return {
      currentPlayer: this.gameState.currentPlayer,
      turnNumber: this.gameState.turnNumber,
      players: this.gameState.players,
      board: this.gameState.board
    };
  }
  
  isValidMove(x, y) {
    return x >= 0 && x < 8 && y >= 0 && y < 8;
  }
}