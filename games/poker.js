// Poker Game Module for Universal Game Host
// This is completely self-contained - all poker logic, UI, and state management

export default class PokerGame {
  constructor(host) {
    this.host = host;
    this.deck = [];
    this.tableState = {
      hand: 0,
      pot: 0,
      community: [],
      seats: []
    };
    this.blinds = { small: 25, big: 50 };
  }
  
  onRoomCreated(roomCode) {
    console.log('Poker module: room created', roomCode);
    this.initializePokerUI();
    this.deck = this.newDeck();
  }
  
  onPlayerJoined(data) {
    const { playerId, chips = 1500 } = data;
    console.log('Poker: player joined', playerId, 'chips:', chips);
    
    // Add to seats if not already there
    if (!this.tableState.seats.find(s => s.id === playerId)) {
      this.tableState.seats.push({
        id: playerId,
        chips: chips,
        bet: 0,
        folded: false,
        active: false,
        hand: []
      });
      
      this.updateTableDisplay();
      this.refreshTurnSelect();
      
      // Send welcome and table state to new player
      this.host.sendToPlayer(playerId, {
        type: 'ACCEPT',
        ruleset_version: 'poker-min@0.1.0'
      });
      
      this.host.sendToPlayer(playerId, {
        type: 'TABLE',
        state: this.getPublicTableState()
      });
    }
  }
  
  onPlayerLeft(data) {
    const { playerId } = data;
    console.log('Poker: player left', playerId);
    
    // Remove from seats
    this.tableState.seats = this.tableState.seats.filter(s => s.id !== playerId);
    this.updateTableDisplay();
    this.refreshTurnSelect();
  }
  
  onMessage(msg) {
    if (msg.type === 'INTENT') {
      this.handlePlayerIntent(msg);
    }
    // Handle other poker-specific messages
  }
  
  handlePlayerIntent(msg) {
    const { player, action, amount } = msg;
    const seat = this.tableState.seats.find(s => s.id === player);
    if (!seat) return;
    
    switch (action) {
      case 'FOLD':
        seat.folded = true;
        seat.active = false;
        break;
        
      case 'CALL':
        const toCall = Math.max(...this.tableState.seats.map(s => s.bet || 0)) - (seat.bet || 0);
        const callAmount = Math.min(seat.chips || 0, toCall);
        seat.chips -= callAmount;
        seat.bet += callAmount;
        this.tableState.pot += callAmount;
        break;
        
      case 'RAISE':
        const minRaise = 50;
        const raiseTo = Math.max(...this.tableState.seats.map(s => s.bet || 0)) + (amount || minRaise);
        const need = raiseTo - (seat.bet || 0);
        const raiseAmount = Math.min(seat.chips || 0, need);
        seat.chips -= raiseAmount;
        seat.bet += raiseAmount;
        this.tableState.pot += raiseAmount;
        break;
    }
    
    this.updateTableDisplay();
    this.broadcastTableState();
  }
  
  initializePokerUI() {
    const pokerHTML = `
      <div style="display: grid; gap: 1rem; grid-template-columns: 1fr 1fr;">
        
        <!-- Table Display -->
        <div>
          <h3>🃏 Poker Table</h3>
          <div id="pokerTable" style="border: 2px solid #8b5a00; border-radius: 50px; padding: 1rem; background: #0a5d1a; color: white; min-height: 200px;">
            <div style="text-align: center; margin-bottom: 1rem;">
              <strong>Hand #<span id="handNumber">0</span> | Pot: $<span id="potAmount">0</span></strong>
            </div>
            <div id="communityCards" style="text-align: center; margin: 1rem 0;">
              <!-- Community cards will appear here -->
            </div>
            <div id="seatsDisplay">
              <!-- Player seats will appear here -->
            </div>
          </div>
        </div>
        
        <!-- Dealer Controls -->
        <div>
          <h3>Dealer Controls</h3>
          <div style="display: grid; gap: .5rem;">
            <button id="btnNewHand">🆕 New Hand</button>
            <button id="btnFlop">🃏 Flop</button>
            <button id="btnTurn">🃏 Turn</button>
            <button id="btnRiver">🃏 River</button>
            <button id="btnResetBets">💰 Collect Bets</button>
          </div>
          
          <h4>Turn Management</h4>
          <div style="display: flex; gap: .5rem; align-items: center;">
            <select id="turnSelect">
              <option value="">Select player...</option>
            </select>
            <button id="btnSetTurn">👆 Set Turn</button>
          </div>
          
          <h4>Blinds</h4>
          <div style="display: flex; gap: .5rem; align-items: center;">
            <label>Small: $<input type="number" id="smallBlind" value="25" style="width: 60px;"></label>
            <label>Big: $<input type="number" id="bigBlind" value="50" style="width: 60px;"></label>
            <button id="btnPostBlinds">Post Blinds</button>
          </div>
        </div>
        
      </div>
    `;
    
    this.host.setGameUI(pokerHTML);
    this.setupPokerEventListeners();
  }
  
  setupPokerEventListeners() {
    document.getElementById('btnNewHand').addEventListener('click', () => this.dealNewHand());
    document.getElementById('btnFlop').addEventListener('click', () => this.dealFlop());
    document.getElementById('btnTurn').addEventListener('click', () => this.dealTurn());
    document.getElementById('btnRiver').addEventListener('click', () => this.dealRiver());
    document.getElementById('btnResetBets').addEventListener('click', () => this.collectBets());
    document.getElementById('btnSetTurn').addEventListener('click', () => this.setTurn());
    document.getElementById('btnPostBlinds').addEventListener('click', () => this.postBlinds());
  }
  
  dealNewHand() {
    this.deck = this.newDeck();
    this.tableState.hand++;
    this.tableState.community = [];
    
    // Reset all seats
    this.tableState.seats.forEach(seat => {
      seat.bet = 0;
      seat.folded = false;
      seat.active = false;
      seat.hand = [];
    });
    
    // Deal hole cards to each player
    this.tableState.seats.forEach(seat => {
      const cards = this.dealCards(2);
      seat.hand = cards;
      
      // Send private cards to player
      this.host.sendToPlayer(seat.id, {
        type: 'HOLE',
        cards: cards
      });
    });
    
    this.updateTableDisplay();
    this.broadcastTableState();
  }
  
  dealFlop() {
    if (this.tableState.community.length === 0) {
      this.tableState.community = this.dealCards(3);
      this.updateTableDisplay();
      this.broadcastTableState();
    }
  }
  
  dealTurn() {
    if (this.tableState.community.length === 3) {
      this.tableState.community.push(...this.dealCards(1));
      this.updateTableDisplay();
      this.broadcastTableState();
    }
  }
  
  dealRiver() {
    if (this.tableState.community.length === 4) {
      this.tableState.community.push(...this.dealCards(1));
      this.updateTableDisplay();
      this.broadcastTableState();
    }
  }
  
  collectBets() {
    let totalBets = 0;
    this.tableState.seats.forEach(seat => {
      totalBets += seat.bet || 0;
      seat.bet = 0;
    });
    this.tableState.pot += totalBets;
    this.updateTableDisplay();
    this.broadcastTableState();
  }
  
  setTurn() {
    const playerId = document.getElementById('turnSelect').value;
    if (!playerId) return;
    
    // Clear all turns, set new turn
    this.tableState.seats.forEach(seat => {
      seat.active = (seat.id === playerId);
    });
    
    this.updateTableDisplay();
    this.host.broadcast({ type: 'TURN', player: playerId });
  }
  
  postBlinds() {
    const smallBlind = +document.getElementById('smallBlind').value;
    const bigBlind = +document.getElementById('bigBlind').value;
    
    if (this.tableState.seats.length >= 2) {
      // Simple: first two players post blinds
      const smallBlindSeat = this.tableState.seats[0];
      const bigBlindSeat = this.tableState.seats[1];
      
      smallBlindSeat.chips -= smallBlind;
      smallBlindSeat.bet = smallBlind;
      this.tableState.pot += smallBlind;
      
      bigBlindSeat.chips -= bigBlind;
      bigBlindSeat.bet = bigBlind;
      this.tableState.pot += bigBlind;
      
      this.updateTableDisplay();
      this.broadcastTableState();
    }
  }
  
  updateTableDisplay() {
    document.getElementById('handNumber').textContent = this.tableState.hand;
    document.getElementById('potAmount').textContent = this.tableState.pot;
    
    // Update community cards
    const communityEl = document.getElementById('communityCards');
    communityEl.innerHTML = this.tableState.community.map(card => 
      `<span style="background: white; color: black; padding: .2rem .4rem; margin: .1rem; border-radius: 4px; font-weight: bold;">${card.r}${card.s}</span>`
    ).join('');
    
    // Update seats
    const seatsEl = document.getElementById('seatsDisplay');
    seatsEl.innerHTML = this.tableState.seats.map(seat => `
      <div style="display: flex; justify-content: space-between; padding: .5rem; margin: .25rem 0; background: rgba(255,255,255,0.1); border-radius: 4px; ${seat.active ? 'border: 2px solid yellow;' : ''}">
        <span><strong>${seat.id}</strong> ${seat.folded ? '(folded)' : ''}</span>
        <span>$${seat.chips} | Bet: $${seat.bet}</span>
      </div>
    `).join('');
  }
  
  refreshTurnSelect() {
    const select = document.getElementById('turnSelect');
    select.innerHTML = '<option value="">Select player...</option>';
    this.tableState.seats.forEach(seat => {
      const option = document.createElement('option');
      option.value = seat.id;
      option.textContent = seat.id;
      select.appendChild(option);
    });
  }
  
  broadcastTableState() {
    this.host.broadcast({
      type: 'TABLE',
      state: this.getPublicTableState()
    });
  }
  
  getPublicTableState() {
    return {
      hand: this.tableState.hand,
      pot: this.tableState.pot,
      community: this.tableState.community,
      seats: this.tableState.seats.map(s => ({
        id: s.id,
        chips: s.chips,
        bet: s.bet,
        folded: s.folded,
        active: s.active
        // Don't include private hand cards
      }))
    };
  }
  
  newDeck() {
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck = [];
    
    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({ r: rank, s: suit });
      }
    }
    
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    
    return deck;
  }
  
  dealCards(count) {
    return this.deck.splice(0, count);
  }
}