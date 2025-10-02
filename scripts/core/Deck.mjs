import { Card } from './Card.mjs';

/**
 * Base Deck class - represents a collection of cards
 */
export class Deck {
  constructor(cards = [], options = {}) {
    this.cards = cards.map(card => card instanceof Card ? card : new Card(card));
    this.originalCards = [...this.cards]; // Keep track of original state
    this.options = {
      shuffleOnCreate: false,
      allowDuplicates: true,
      ...options
    };

    if (this.options.shuffleOnCreate) {
      this.shuffle();
    }
  }

  // Get deck size
  get size() {
    return this.cards.length;
  }

  // Check if deck is empty
  get isEmpty() {
    return this.cards.length === 0;
  }

  // Add card(s) to deck
  add(card) {
    if (Array.isArray(card)) {
      card.forEach(c => this.add(c));
      return this;
    }

    const cardInstance = card instanceof Card ? card : new Card(card);
    
    if (!this.options.allowDuplicates && this.hasCard(cardInstance)) {
      return this;
    }

    this.cards.push(cardInstance);
    return this;
  }

  // Remove card from deck
  remove(cardOrId) {
    const id = cardOrId instanceof Card ? cardOrId.id : cardOrId;
    const index = this.cards.findIndex(card => card.id === id);
    
    if (index !== -1) {
      return this.cards.splice(index, 1)[0];
    }
    return null;
  }

  // Check if deck contains a card
  hasCard(cardOrId) {
    const id = cardOrId instanceof Card ? cardOrId.id : cardOrId;
    return this.cards.some(card => card.id === id);
  }

  // Draw cards from the top
  draw(count = 1) {
    const drawn = this.cards.splice(0, Math.min(count, this.cards.length));
    return count === 1 ? drawn[0] || null : drawn;
  }

  // Peek at top cards without removing
  peek(count = 1) {
    const peeked = this.cards.slice(0, Math.min(count, this.cards.length));
    return count === 1 ? peeked[0] || null : peeked;
  }

  // Shuffle the deck
  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
    return this;
  }

  // Reset deck to original state
  reset() {
    this.cards = this.originalCards.map(card => card.clone());
    return this;
  }

  // Filter cards by criteria
  filter(predicate) {
    return new Deck(this.cards.filter(predicate), this.options);
  }

  // Find cards matching criteria
  find(predicate) {
    return this.cards.find(predicate);
  }

  // Get all cards of a specific type
  getByType(type) {
    return this.filter(card => card.type === type);
  }

  // Get cards with specific property
  getByProperty(property, value) {
    return this.filter(card => card.get(property) === value);
  }

  // Deal cards to multiple hands
  deal(handCount, cardsPerHand) {
    const hands = Array.from({ length: handCount }, () => []);
    
    for (let round = 0; round < cardsPerHand; round++) {
      for (let hand = 0; hand < handCount && !this.isEmpty; hand++) {
        const card = this.draw();
        if (card) hands[hand].push(card);
      }
    }
    
    return hands.map(hand => new Deck(hand, this.options));
  }

  // Convert to array
  toArray() {
    return [...this.cards];
  }

  // Serialize deck
  toJSON() {
    return {
      cards: this.cards.map(card => card.toJSON()),
      options: this.options
    };
  }

  // Create deck from serialized data
  static fromJSON(data) {
    const cards = data.cards.map(cardData => Card.fromJSON(cardData));
    return new Deck(cards, data.options);
  }
}