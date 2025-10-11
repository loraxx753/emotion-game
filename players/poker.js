// Poker Player Interface Module
// Handles the player-side poker UI and interactions

export default class PokerPlayerInterface {
  constructor(player) {
    this.player = player;
    this.hand = [];
    this.chips = 1500;
    this.bet = 0;
    this.isMyTurn = false;
    this.isFolded = false;
    this.tableState = null;
    
    this.setupPokerInterface();
  }
  
  setupPokerInterface() {
    this.player.setGameContent(`
      <div style="display: grid; gap: 1rem;">
        
        <!-- Player Status -->
        <div style="background: #1f2937; color: white; padding: 1rem; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0;">🃏 ${this.player.playerId}</h3>
            <div id="turnIndicator" style="padding: .25rem .5rem; border-radius: 4px; font-weight: bold; display: none;">
              Your Turn!
            </div>
          </div>
          <div style="display: flex; gap: 2rem; margin-top: .5rem;">
            <span>💰 Chips: $<span id="playerChips">${this.chips}</span></span>
            <span>🎯 Bet: $<span id="playerBet">${this.bet}</span></span>
            <span id="foldedStatus" style="display: none; color: #ef4444;">❌ Folded</span>
          </div>
        </div>
        
        <!-- Player Hand -->
        <div>
          <h4>Your Cards</h4>
          <div id="playerHand" style="display: flex; gap: .5rem; min-height: 60px; align-items: center;">
            <em style="color: #6b7280;">Waiting for cards...</em>
          </div>
        </div>
        
        <!-- Community Cards -->
        <div>
          <h4>Community Cards</h4>
          <div id="communityCards" style="display: flex; gap: .5rem; min-height: 60px; align-items: center;">
            <em style="color: #6b7280;">No community cards yet...</em>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div id="actionButtons" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: .5rem;">
          <button id="btnFold" style="background: #ef4444;" disabled>
            ✋ Fold
          </button>
          <button id="btnCall" style="background: #059669;" disabled>
            📞 Call $<span id="callAmount">0</span>
          </button>
          <button id="btnRaise" style="background: #dc2626;" disabled>
            📈 Raise
          </button>
        </div>
        
        <!-- Raise Controls -->
        <div id="raiseControls" style="display: none; background: #f9fafb; padding: 1rem; border-radius: 8px;">
          <h4 style="margin: 0 0 .5rem;">Raise Amount</h4>
          <div style="display: flex; gap: .5rem; align-items: center;">
            <input type="range" id="raiseSlider" min="50" max="500" value="100" style="flex: 1;">
            <input type="number" id="raiseAmount" value="100" min="50" style="width: 80px;">
            <button id="btnConfirmRaise" style="background: #dc2626;">Raise $<span id="raiseDisplay">100</span></button>
            <button id="btnCancelRaise" style="background: #6b7280;">Cancel</button>
          </div>
        </div>
        
        <!-- Game Info -->
        <div style="background: #f3f4f6; padding: 1rem; border-radius: 8px;">
          <h4 style="margin: 0 0 .5rem;">Table Info</h4>
          <div style="display: flex; gap: 2rem;">
            <span>Hand #<span id="handNumber">0</span></span>
            <span>💰 Pot: $<span id="potAmount">0</span></span>
            <span>👥 Players: <span id="playerCount">0</span></span>
          </div>
        </div>
        
      </div>
    `);
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // Action buttons
    document.getElementById('btnFold').addEventListener('click', () => this.fold());
    document.getElementById('btnCall').addEventListener('click', () => this.call());
    document.getElementById('btnRaise').addEventListener('click', () => this.showRaiseControls());
    
    // Raise controls
    const raiseSlider = document.getElementById('raiseSlider');
    const raiseAmount = document.getElementById('raiseAmount');
    const raiseDisplay = document.getElementById('raiseDisplay');
    
    raiseSlider.addEventListener('input', (e) => {
      raiseAmount.value = e.target.value;
      raiseDisplay.textContent = e.target.value;
    });
    
    raiseAmount.addEventListener('input', (e) => {
      raiseSlider.value = e.target.value;
      raiseDisplay.textContent = e.target.value;
    });
    
    document.getElementById('btnConfirmRaise').addEventListener('click', () => this.raise());
    document.getElementById('btnCancelRaise').addEventListener('click', () => this.hideRaiseControls());
  }
  
  onMessage(msg) {
    console.log('Poker player received:', msg);
    
    switch (msg.type) {
      case 'ACCEPT':
        this.showMessage('✅ Joined poker game successfully!', 'success');
        break;
        
      case 'HOLE':
        this.hand = msg.cards;
        this.updateHandDisplay();
        this.showMessage('🃏 Hole cards dealt!', 'info');
        break;
        
      case 'TABLE':
        this.updateTableState(msg.state);
        break;
        
      case 'TURN':
        this.updateTurnStatus(msg.player);
        break;
        
      default:
        console.log('Unhandled poker message:', msg);
    }
  }
  
  updateHandDisplay() {
    const handEl = document.getElementById('playerHand');
    if (this.hand.length === 0) {
      handEl.innerHTML = '<em style="color: #6b7280;">No cards</em>';
    } else {
      handEl.innerHTML = this.hand.map(card => 
        `<div style="background: white; border: 2px solid #333; border-radius: 8px; padding: .5rem 1rem; font-weight: bold; font-size: 1.2em; min-width: 60px; text-align: center;">
          ${card.r}${card.s}
        </div>`
      ).join('');
    }
  }
  
  updateTableState(state) {
    this.tableState = state;
    
    // Update basic info
    document.getElementById('handNumber').textContent = state.hand;
    document.getElementById('potAmount').textContent = state.pot;
    document.getElementById('playerCount').textContent = state.seats.length;
    
    // Update community cards
    const communityEl = document.getElementById('communityCards');
    if (state.community.length === 0) {
      communityEl.innerHTML = '<em style="color: #6b7280;">No community cards yet...</em>';
    } else {
      communityEl.innerHTML = state.community.map(card => 
        `<div style="background: white; border: 2px solid #333; border-radius: 8px; padding: .5rem 1rem; font-weight: bold; font-size: 1.2em; min-width: 60px; text-align: center;">
          ${card.r}${card.s}
        </div>`
      ).join('');
    }
    
    // Update my status from seats
    const mySeat = state.seats.find(s => s.id === this.player.playerId);
    if (mySeat) {
      this.chips = mySeat.chips;
      this.bet = mySeat.bet;
      this.isFolded = mySeat.folded;
      this.isMyTurn = mySeat.active;
      
      document.getElementById('playerChips').textContent = this.chips;
      document.getElementById('playerBet').textContent = this.bet;
      
      // Update folded status
      const foldedEl = document.getElementById('foldedStatus');
      foldedEl.style.display = this.isFolded ? 'inline' : 'none';
      
      // Update turn indicator
      const turnEl = document.getElementById('turnIndicator');
      turnEl.style.display = this.isMyTurn ? 'block' : 'none';
      turnEl.style.background = this.isMyTurn ? '#059669' : 'transparent';
      
      this.updateActionButtons();
    }
  }
  
  updateTurnStatus(currentPlayer) {
    this.isMyTurn = (currentPlayer === this.player.playerId);
    
    const turnEl = document.getElementById('turnIndicator');
    turnEl.style.display = this.isMyTurn ? 'block' : 'none';
    
    this.updateActionButtons();
    
    if (this.isMyTurn) {
      this.showMessage('👆 It\'s your turn!', 'info');
    }
  }
  
  updateActionButtons() {
    const canAct = this.isMyTurn && !this.isFolded;
    
    document.getElementById('btnFold').disabled = !canAct;
    document.getElementById('btnCall').disabled = !canAct;
    document.getElementById('btnRaise').disabled = !canAct;
    
    // Update call amount
    if (this.tableState) {
      const maxBet = Math.max(...this.tableState.seats.map(s => s.bet || 0));
      const callAmount = Math.max(0, maxBet - this.bet);
      document.getElementById('callAmount').textContent = callAmount;
      
      // Update button text
      const callBtn = document.getElementById('btnCall');
      if (callAmount === 0) {
        callBtn.innerHTML = '✅ Check';
      } else {
        callBtn.innerHTML = `📞 Call $${callAmount}`;
      }
    }
  }
  
  fold() {
    this.player.sendMessage({
      type: 'INTENT',
      player: this.player.playerId,
      action: 'FOLD'
    });
    
    this.showMessage('✋ You folded', 'warning');
    this.hideRaiseControls();
  }
  
  call() {
    this.player.sendMessage({
      type: 'INTENT',
      player: this.player.playerId,
      action: 'CALL'
    });
    
    const maxBet = Math.max(...this.tableState.seats.map(s => s.bet || 0));
    const callAmount = Math.max(0, maxBet - this.bet);
    
    if (callAmount === 0) {
      this.showMessage('✅ You checked', 'success');
    } else {
      this.showMessage(`📞 You called $${callAmount}`, 'success');
    }
    
    this.hideRaiseControls();
  }
  
  showRaiseControls() {
    document.getElementById('raiseControls').style.display = 'block';
    
    // Set reasonable min/max for raise
    const maxBet = Math.max(...this.tableState.seats.map(s => s.bet || 0));
    const minRaise = Math.max(50, maxBet - this.bet + 50);
    const maxRaise = Math.min(this.chips, 500);
    
    const slider = document.getElementById('raiseSlider');
    const input = document.getElementById('raiseAmount');
    
    slider.min = minRaise;
    slider.max = maxRaise;
    slider.value = Math.min(100, maxRaise);
    
    input.min = minRaise;
    input.max = maxRaise;
    input.value = slider.value;
    
    document.getElementById('raiseDisplay').textContent = slider.value;
  }
  
  hideRaiseControls() {
    document.getElementById('raiseControls').style.display = 'none';
  }
  
  raise() {
    const amount = parseInt(document.getElementById('raiseAmount').value);
    
    this.player.sendMessage({
      type: 'INTENT',
      player: this.player.playerId,
      action: 'RAISE',
      amount: amount
    });
    
    this.showMessage(`📈 You raised $${amount}`, 'success');
    this.hideRaiseControls();
  }
  
  showMessage(text, type = 'info') {
    // Create a temporary message overlay
    const message = document.createElement('div');
    message.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      color: white;
      font-weight: bold;
      z-index: 1000;
      background: ${type === 'success' ? '#059669' : type === 'warning' ? '#d97706' : type === 'error' ? '#dc2626' : '#2563eb'};
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    message.textContent = text;
    
    document.body.appendChild(message);
    
    // Slide in
    setTimeout(() => {
      message.style.transform = 'translateX(0)';
    }, 100);
    
    // Slide out and remove
    setTimeout(() => {
      message.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(message);
      }, 300);
    }, 3000);
  }
}