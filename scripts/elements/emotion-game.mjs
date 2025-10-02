import { DeckFactory } from '../core/DeckFactory.mjs';
import '../decks/EmotionDeck.mjs'; // Register emotion deck type

/**
 * Generic Card Game Component
 * Supports multiple game types and deck configurations
 */
customElements.define('card-game', class extends HTMLElement {
  static observedAttributes = ['deck-type', 'game-mode', 'hand-size'];

  constructor() {
    super();
    this.deck = null;
    this.playerHands = [];
    this.gameState = {
      currentPlayer: 0,
      turn: 1,
      phase: 'setup'
    };
  }

  connectedCallback() {
    this.initializeGame();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.initializeGame();
    }
  }

  initializeGame() {
    const deckType = this.getAttribute('deck-type') || 'emotions';
    const gameMode = this.getAttribute('game-mode') || 'display';
    const handSize = parseInt(this.getAttribute('hand-size')) || 4;

    try {
      // Create deck based on type
      this.deck = DeckFactory.createDeck(deckType, this.getDeckOptions());
      
      // Initialize based on game mode
      switch (gameMode) {
        case 'display':
          this.setupDisplayMode(handSize);
          break;
        case 'solitaire':
          this.setupSolitaireMode(handSize);
          break;
        case 'multiplayer':
          this.setupMultiplayerMode();
          break;
        default:
          this.setupDisplayMode(handSize);
      }
      
      this.gameState.phase = 'ready';
      this.render();
    } catch (error) {
      console.error('Failed to initialize game:', error);
      this.showError(`Unable to create ${deckType} deck`);
    }
  }

  getDeckOptions() {
    // Parse additional deck options from attributes
    const options = {};
    
    if (this.hasAttribute('shuffled')) {
      options.shuffled = this.getAttribute('shuffled') !== 'false';
    }
    
    if (this.hasAttribute('balanced')) {
      options.balanced = this.getAttribute('balanced') === 'true';
    }

    // Emotion-specific options
    if (this.hasAttribute('needs-filter')) {
      const filter = this.getAttribute('needs-filter');
      if (filter === 'met') options.needsFilter = true;
      if (filter === 'not-met') options.needsFilter = false;
    }

    if (this.hasAttribute('core-only')) {
      const cores = this.getAttribute('core-only').split(',').map(s => s.trim());
      options.coreOnly = cores;
    }

    return options;
  }

  setupDisplayMode(handSize) {
    this.playerHands = [this.deck.draw(handSize)];
  }

  setupSolitaireMode(handSize) {
    this.playerHands = [this.deck.draw(handSize)];
    // Could add more solitaire-specific setup here
  }

  setupMultiplayerMode() {
    const playerCount = parseInt(this.getAttribute('players')) || 2;
    const handSize = parseInt(this.getAttribute('hand-size')) || 7;
    this.playerHands = this.deck.deal(playerCount, handSize);
  }

  render() {
    // Find or create card containers
    const cardElements = this.querySelectorAll('game-card, emotion-card');
    const hand = this.playerHands[0] || [];

    cardElements.forEach((el, index) => {
      if (index < hand.length) {
        this.renderCard(el, hand[index]);
      } else {
        this.clearCard(el);
      }
    });

    // Update game info
    this.updateGameInfo();
  }

  renderCard(element, card) {
    const deckType = this.getAttribute('deck-type') || 'emotions';
    
    switch (deckType) {
      case 'emotions':
        this.renderEmotionCard(element, card);
        break;
      case 'standard':
        this.renderPlayingCard(element, card);
        break;
      case 'uno':
        this.renderUnoCard(element, card);
        break;
      case 'dice':
        this.renderDiceCard(element, card);
        break;
      case 'dnd-stats':
        this.renderAbilityScore(element, card);
        break;
      default:
        this.renderGenericCard(element, card);
    }
  }

  renderEmotionCard(element, card) {
    element.innerHTML = `
      <emotion-name>${card.getDisplayText()}</emotion-name>
      <emotion-parent>${card.getParent()}</emotion-parent>
      <emotional-core>${card.getCore()}</emotional-core>
    `;
    
    const theme = card.getColorTheme();
    element.style.setProperty('--inner-color', theme.innerColor);
    element.style.setProperty('--outer-color', theme.outerColor);
  }

  renderPlayingCard(element, card) {
    const suit = card.get('suit');
    const rank = card.get('rank');
    const symbol = card.visual.symbol;
    
    element.innerHTML = `
      <card-rank>${rank}</card-rank>
      <card-suit>${symbol}</card-suit>
      <card-name>${suit}</card-name>
    `;
    
    element.style.setProperty('--inner-color', card.visual.primaryColor);
    element.style.setProperty('--outer-color', card.visual.primaryColor);
  }

  renderUnoCard(element, card) {
    const name = card.get('name');
    const color = card.get('color');
    
    element.innerHTML = `
      <card-content>${name}</card-content>
    `;
    
    element.style.setProperty('--inner-color', card.visual.primaryColor);
    element.style.setProperty('--outer-color', card.visual.primaryColor);
  }

  renderDiceCard(element, card) {
    const total = card.get('total');
    const notation = card.get('notation');
    const rolls = card.get('rolls') || [];
    
    element.innerHTML = `
      <dice-notation>${notation}</dice-notation>
      <dice-rolls>${rolls.join(', ')}</dice-rolls>
      <dice-total>${total}</dice-total>
    `;
    
    element.style.setProperty('--inner-color', card.visual.primaryColor);
    element.style.setProperty('--outer-color', card.visual.primaryColor);
  }

  renderAbilityScore(element, card) {
    const name = card.get('name');
    const value = card.get('value');
    const modifier = card.get('modifier');
    
    element.innerHTML = `
      <ability-name>${name}</ability-name>
      <ability-score>${value}</ability-score>
      <ability-modifier>${modifier >= 0 ? '+' : ''}${modifier}</ability-modifier>
    `;
    
    element.style.setProperty('--inner-color', card.visual.primaryColor);
    element.style.setProperty('--outer-color', card.visual.primaryColor);
  }

  renderGenericCard(element, card) {
    element.innerHTML = `
      <card-content>${card.getDisplayText()}</card-content>
    `;
    
    const primaryColor = card.visual.primaryColor || '#6366f1';
    element.style.setProperty('--inner-color', primaryColor);
    element.style.setProperty('--outer-color', primaryColor);
  }

  clearCard(element) {
    element.innerHTML = '<card-placeholder>Empty</card-placeholder>';
    element.style.removeProperty('--inner-color');
    element.style.removeProperty('--outer-color');
  }

  updateGameInfo() {
    // Update deck count, game state, etc.
    const deckInfo = this.querySelector('.deck-info');
    if (deckInfo) {
      deckInfo.textContent = `Cards remaining: ${this.deck.size}`;
    }
  }

  showError(message) {
    this.innerHTML = `
      <div class="error-message">
        <h3>Game Error</h3>
        <p>${message}</p>
        <p>Available deck types: ${DeckFactory.getAvailableTypes().join(', ')}</p>
      </div>
    `;
  }

  // Public API methods
  drawCard() {
    if (this.deck.isEmpty) return null;
    const card = this.deck.draw();
    this.playerHands[0].push(card);
    this.render();
    return card;
  }

  shuffle() {
    this.deck.shuffle();
    return this;
  }

  reset() {
    this.initializeGame();
    return this;
  }
});

// Keep the old emotion-game element for backwards compatibility
customElements.define('emotion-game', class extends HTMLElement {
  connectedCallback() {
    // Create a card-game element with emotion settings
    const cardGame = document.createElement('card-game');
    cardGame.setAttribute('deck-type', 'emotions');
    cardGame.setAttribute('game-mode', 'display');
    cardGame.setAttribute('hand-size', '4');
    
    // Copy over any attributes
    Array.from(this.attributes).forEach(attr => {
      cardGame.setAttribute(attr.name, attr.value);
    });
    
    // Move children to the new element
    while (this.firstChild) {
      cardGame.appendChild(this.firstChild);
    }
    
    // Replace this element
    this.parentNode.replaceChild(cardGame, this);
  }
});