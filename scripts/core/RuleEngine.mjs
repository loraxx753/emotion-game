/**
 * Game Rule Engine - Handles game mechanics, turns, and win conditions
 */
export class RuleEngine {
  constructor(rules = {}) {
    this.rules = {
      // Default rules
      maxPlayers: 4,
      minPlayers: 1,
      handSize: 7,
      turnOrder: 'clockwise', // 'clockwise', 'counterclockwise', 'random'
      winConditions: [], // Array of win condition functions
      turnActions: [], // Array of available actions per turn
      gamePhases: ['setup', 'playing', 'ended'],
      ...rules
    };
    
    this.gameState = {
      phase: 'setup',
      currentPlayer: 0,
      turn: 1,
      players: [],
      history: [],
      customData: {}
    };

    this.eventListeners = new Map();
  }

  // Event system
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  emit(event, data = {}) {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(callback => callback(data));
  }

  // Game setup
  setupGame(playerCount, options = {}) {
    if (playerCount < this.rules.minPlayers || playerCount > this.rules.maxPlayers) {
      throw new Error(`Invalid player count. Must be between ${this.rules.minPlayers} and ${this.rules.maxPlayers}`);
    }

    this.gameState.players = Array.from({ length: playerCount }, (_, i) => ({
      id: i,
      name: options.playerNames?.[i] || `Player ${i + 1}`,
      score: 0,
      hand: [],
      customData: {}
    }));

    this.gameState.phase = 'playing';
    this.gameState.currentPlayer = 0;
    this.gameState.turn = 1;
    
    this.emit('gameSetup', { players: this.gameState.players });
    return this;
  }

  // Turn management
  nextTurn() {
    const previousPlayer = this.gameState.currentPlayer;
    
    if (this.rules.turnOrder === 'clockwise') {
      this.gameState.currentPlayer = (this.gameState.currentPlayer + 1) % this.gameState.players.length;
    } else if (this.rules.turnOrder === 'counterclockwise') {
      this.gameState.currentPlayer = this.gameState.currentPlayer - 1;
      if (this.gameState.currentPlayer < 0) {
        this.gameState.currentPlayer = this.gameState.players.length - 1;
      }
    } else if (this.rules.turnOrder === 'random') {
      const availablePlayers = this.gameState.players.map((_, i) => i).filter(i => i !== this.gameState.currentPlayer);
      this.gameState.currentPlayer = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
    }

    if (this.gameState.currentPlayer === 0) {
      this.gameState.turn++;
    }

    this.emit('turnChange', {
      previousPlayer,
      currentPlayer: this.gameState.currentPlayer,
      turn: this.gameState.turn
    });

    this.checkWinConditions();
    return this;
  }

  getCurrentPlayer() {
    return this.gameState.players[this.gameState.currentPlayer];
  }

  // Action system
  executeAction(actionName, params = {}) {
    const action = this.rules.turnActions.find(a => a.name === actionName);
    if (!action) {
      throw new Error(`Unknown action: ${actionName}`);
    }

    if (!this.canExecuteAction(actionName, params)) {
      throw new Error(`Cannot execute action: ${actionName}`);
    }

    const result = action.execute(this.gameState, params);
    
    this.gameState.history.push({
      turn: this.gameState.turn,
      player: this.gameState.currentPlayer,
      action: actionName,
      params,
      result,
      timestamp: Date.now()
    });

    this.emit('actionExecuted', {
      action: actionName,
      params,
      result,
      player: this.getCurrentPlayer()
    });

    return result;
  }

  canExecuteAction(actionName, params = {}) {
    const action = this.rules.turnActions.find(a => a.name === actionName);
    if (!action || !action.canExecute) return true;
    
    return action.canExecute(this.gameState, params);
  }

  getAvailableActions() {
    return this.rules.turnActions
      .filter(action => this.canExecuteAction(action.name))
      .map(action => ({
        name: action.name,
        description: action.description || action.name,
        params: action.params || []
      }));
  }

  // Win condition checking
  checkWinConditions() {
    for (const condition of this.rules.winConditions) {
      const winner = condition.check(this.gameState);
      if (winner !== null) {
        this.endGame(winner, condition.name);
        return true;
      }
    }
    return false;
  }

  endGame(winner, reason = 'unknown') {
    this.gameState.phase = 'ended';
    this.gameState.winner = winner;
    this.gameState.endReason = reason;
    
    this.emit('gameEnd', {
      winner,
      reason,
      finalState: { ...this.gameState }
    });
  }

  // Scoring
  updateScore(playerId, points) {
    const player = this.gameState.players[playerId];
    if (player) {
      player.score += points;
      this.emit('scoreUpdate', { playerId, newScore: player.score, pointsAdded: points });
    }
  }

  getScores() {
    return this.gameState.players.map(p => ({ id: p.id, name: p.name, score: p.score }));
  }

  // Game state queries
  isGameActive() {
    return this.gameState.phase === 'playing';
  }

  isGameEnded() {
    return this.gameState.phase === 'ended';
  }

  getGameState() {
    return { ...this.gameState };
  }

  // Save/Load game state
  saveState() {
    return JSON.stringify({
      rules: this.rules,
      gameState: this.gameState
    });
  }

  loadState(savedState) {
    const data = JSON.parse(savedState);
    this.rules = data.rules;
    this.gameState = data.gameState;
    return this;
  }
}

/**
 * Pre-defined rule sets for common games
 */
export const GameRules = {
  // Simple card matching game
  matching: {
    maxPlayers: 4,
    minPlayers: 1,
    handSize: 5,
    turnActions: [
      {
        name: 'playCard',
        description: 'Play a card from your hand',
        params: ['cardIndex'],
        canExecute: (gameState, params) => {
          const player = gameState.players[gameState.currentPlayer];
          return params.cardIndex >= 0 && params.cardIndex < player.hand.length;
        },
        execute: (gameState, params) => {
          const player = gameState.players[gameState.currentPlayer];
          const card = player.hand.splice(params.cardIndex, 1)[0];
          return { playedCard: card };
        }
      }
    ],
    winConditions: [
      {
        name: 'emptyHand',
        check: (gameState) => {
          return gameState.players.find(p => p.hand.length === 0)?.id ?? null;
        }
      }
    ]
  },

  // Turn-based exploration
  exploration: {
    maxPlayers: 1,
    minPlayers: 1,
    handSize: 3,
    turnActions: [
      {
        name: 'explore',
        description: 'Draw and reveal a new card',
        execute: (gameState, params) => {
          // Implementation would depend on deck integration
          return { discovered: 'new area' };
        }
      }
    ],
    winConditions: [
      {
        name: 'scoreThreshold',
        check: (gameState) => {
          const winner = gameState.players.find(p => p.score >= 100);
          return winner?.id ?? null;
        }
      }
    ]
  }
};

export default RuleEngine;