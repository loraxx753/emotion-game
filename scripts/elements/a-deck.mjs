import { DeckFactory } from '../core/DeckFactory.mjs';
import '../decks/EmotionDeck.mjs';

/**
 * A-Deck Component - Contains and manages a collection of cards
 */
customElements.define('a-deck', class extends HTMLElement {
  static observedAttributes = ['deck-type', 'shuffled'];

  constructor() {
    super();
    this.deck = null;
    this.currentCardIndex = 0;
  }

  connectedCallback() {
    this.initializeDeck();
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.initializeDeck();
      this.render();
    }
  }

  initializeDeck() {
    const deckType = this.getAttribute('deck-type') || 'emotions';
    const shuffled = this.getAttribute('shuffled') !== 'false';

    try {
      this.deck = DeckFactory.createDeck(deckType, { shuffled });
      this.currentCardIndex = 0;
      
      // Emit deck ready event
      this.dispatchEvent(new CustomEvent('deck-ready', {
        detail: { deck: this.deck, size: this.deck.size },
        bubbles: true
      }));
    } catch (error) {
      console.error('Failed to initialize deck:', error);
      this.showError(`Unable to create ${deckType} deck`);
    }
  }

  render() {
    if (!this.deck) return;

    const cards = this.querySelectorAll('a-card');
    if (cards.length > 0) {
      // Show current card to first a-card element
      const currentCard = this.getCurrentCard();
      if (currentCard) {
        this.renderCardToElement(cards[0], currentCard);
      }
    }
  }

  getCurrentCard() {
    if (!this.deck || this.deck.isEmpty) return null;
    const cards = this.deck.toArray();
    return cards[this.currentCardIndex % cards.length];
  }

  nextCard() {
    if (!this.deck || this.deck.isEmpty) return null;
    
    this.currentCardIndex = (this.currentCardIndex + 1) % this.deck.size;
    const card = this.getCurrentCard();
    this.render();
    
    this.dispatchEvent(new CustomEvent('card-changed', {
      detail: { card, index: this.currentCardIndex },
      bubbles: true
    }));
    
    return card;
  }

  previousCard() {
    if (!this.deck || this.deck.isEmpty) return null;
    
    this.currentCardIndex = this.currentCardIndex - 1;
    if (this.currentCardIndex < 0) {
      this.currentCardIndex = this.deck.size - 1;
    }
    
    const card = this.getCurrentCard();
    this.render();
    
    this.dispatchEvent(new CustomEvent('card-changed', {
      detail: { card, index: this.currentCardIndex },
      bubbles: true
    }));
    
    return card;
  }

  shuffle() {
    if (this.deck) {
      this.deck.shuffle();
      this.currentCardIndex = 0;
      this.render();
      
      this.dispatchEvent(new CustomEvent('deck-shuffled', {
        detail: { deck: this.deck },
        bubbles: true
      }));
    }
  }

  renderCardToElement(element, card) {
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
    element.setAttribute('data-card-type', 'emotion-card');
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
    element.setAttribute('data-card-type', 'playing-card');
  }

  renderUnoCard(element, card) {
    const name = card.get('name');
    
    element.innerHTML = `
      <card-content>${name}</card-content>
    `;
    
    element.style.setProperty('--inner-color', card.visual.primaryColor);
    element.style.setProperty('--outer-color', card.visual.primaryColor);
    element.setAttribute('data-card-type', 'uno-card');
  }

  renderGenericCard(element, card) {
    element.innerHTML = `
      <card-content>${card.getDisplayText()}</card-content>
    `;
    
    const primaryColor = card.visual.primaryColor || '#6366f1';
    element.style.setProperty('--inner-color', primaryColor);
    element.style.setProperty('--outer-color', primaryColor);
    element.setAttribute('data-card-type', 'generic-card');
  }

  showError(message) {
    const cards = this.querySelectorAll('a-card');
    if (cards.length > 0) {
      cards[0].innerHTML = `
        <div class="error-message">
          <h3>Deck Error</h3>
          <p>${message}</p>
        </div>
      `;
    }
  }

  // Public API
  getDeck() {
    return this.deck;
  }

  getCardCount() {
    return this.deck ? this.deck.size : 0;
  }

  getCurrentIndex() {
    return this.currentCardIndex;
  }
});

/**
 * A-Card Component - Individual card display
 */
customElements.define('a-card', class extends HTMLElement {
  constructor() {
    super();
    this.isFlipped = false;
  }

  connectedCallback() {
    this.setupEventListeners();
    this.render();
  }

  setupEventListeners() {
    this.addEventListener('click', (e) => {
      if (e.target.matches('.flip-button')) {
        this.flip();
      } else {
        // Emit card clicked event
        this.dispatchEvent(new CustomEvent('card-clicked', {
          detail: { card: this },
          bubbles: true
        }));
      }
    });
  }

  flip() {
    this.isFlipped = !this.isFlipped;
    this.setAttribute('data-flipped', this.isFlipped);
    
    this.dispatchEvent(new CustomEvent('card-flipped', {
      detail: { card: this, flipped: this.isFlipped },
      bubbles: true
    }));
  }

  render() {
    // Base structure - content will be filled by parent deck
    if (!this.innerHTML.trim()) {
      this.innerHTML = `
        <card-placeholder>Loading...</card-placeholder>
      `;
    }
  }
});