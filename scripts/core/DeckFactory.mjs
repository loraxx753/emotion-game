import { Deck } from './Deck.mjs';
import { Card } from './Card.mjs';
import { DicePool, DiceParser, DicePresets } from './Dice.mjs';

/**
 * DeckFactory - Creates different types of card decks
 */
export class DeckFactory {
  static deckTypes = new Map();

  // Register a new deck type
  static registerDeckType(name, creator) {
    this.deckTypes.set(name, creator);
  }

  // Create a deck of specified type
  static createDeck(type, options = {}) {
    const creator = this.deckTypes.get(type);
    if (!creator) {
      throw new Error(`Unknown deck type: ${type}`);
    }
    return creator(options);
  }

  // Get available deck types
  static getAvailableTypes() {
    return Array.from(this.deckTypes.keys());
  }

  // Check if deck type exists
  static hasType(type) {
    return this.deckTypes.has(type);
  }
}

/**
 * Standard playing card deck
 */
DeckFactory.registerDeckType('standard', (options = {}) => {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const cards = [];

  suits.forEach(suit => {
    ranks.forEach((rank, index) => {
      cards.push(new Card({
        type: 'playing-card',
        properties: {
          suit,
          rank,
          value: index + 1,
          name: `${rank} of ${suit}`,
          color: suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black'
        },
        visual: {
          primaryColor: suit === 'hearts' || suit === 'diamonds' ? '#dc2626' : '#1f2937',
          symbol: suit === 'hearts' ? '♥' : suit === 'diamonds' ? '♦' : 
                  suit === 'clubs' ? '♣' : '♠'
        }
      }));
    });
  });

  // Add jokers if requested
  if (options.includeJokers) {
    cards.push(
      new Card({
        type: 'playing-card',
        properties: { rank: 'Joker', suit: 'red', value: 0, name: 'Red Joker', color: 'red' },
        visual: { primaryColor: '#dc2626', symbol: '🃏' }
      }),
      new Card({
        type: 'playing-card',
        properties: { rank: 'Joker', suit: 'black', value: 0, name: 'Black Joker', color: 'black' },
        visual: { primaryColor: '#1f2937', symbol: '🃏' }
      })
    );
  }

  return new Deck(cards, { 
    shuffleOnCreate: options.shuffled !== false,
    ...options 
  });
});

/**
 * UNO deck
 */
DeckFactory.registerDeckType('uno', (options = {}) => {
  const colors = ['red', 'yellow', 'green', 'blue'];
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const actionCards = ['Skip', 'Reverse', 'Draw Two'];
  const wildCards = ['Wild', 'Wild Draw Four'];
  const cards = [];

  // Number cards (0 has 1 copy, 1-9 have 2 copies per color)
  colors.forEach(color => {
    numbers.forEach(number => {
      const copies = number === 0 ? 1 : 2;
      for (let i = 0; i < copies; i++) {
        cards.push(new Card({
          type: 'uno-card',
          properties: {
            color,
            value: number,
            name: `${color} ${number}`,
            cardType: 'number'
          },
          visual: {
            primaryColor: color === 'red' ? '#dc2626' : 
                         color === 'yellow' ? '#facc15' :
                         color === 'green' ? '#16a34a' : '#2563eb',
            textColor: '#ffffff'
          }
        }));
      }
    });

    // Action cards (2 copies per color)
    actionCards.forEach(action => {
      for (let i = 0; i < 2; i++) {
        cards.push(new Card({
          type: 'uno-card',
          properties: {
            color,
            name: `${color} ${action}`,
            cardType: 'action',
            action: action.toLowerCase().replace(' ', '_')
          },
          visual: {
            primaryColor: color === 'red' ? '#dc2626' : 
                         color === 'yellow' ? '#facc15' :
                         color === 'green' ? '#16a34a' : '#2563eb',
            textColor: '#ffffff'
          }
        }));
      }
    });
  });

  // Wild cards (4 copies each)
  wildCards.forEach(wild => {
    for (let i = 0; i < 4; i++) {
      cards.push(new Card({
        type: 'uno-card',
        properties: {
          color: 'wild',
          name: wild,
          cardType: 'wild',
          action: wild.toLowerCase().replace(' ', '_')
        },
        visual: {
          primaryColor: '#000000',
          secondaryColor: '#ffffff',
          textColor: '#ffffff'
        }
      }));
    }
  });

  return new Deck(cards, { 
    shuffleOnCreate: options.shuffled !== false,
    ...options 
  });
});

/**
 * Dice Pool "deck" - treat dice pools like decks for unified interface
 */
DeckFactory.registerDeckType('dice', (options = {}) => {
  const notation = options.notation || '1d6';
  const pool = DiceParser.parse(notation);
  
  // Create a special "deck" that represents dice results
  // Each "draw" rolls the dice and returns the result as a card
  const diceDeck = new Deck([], options);
  
  // Override draw method to roll dice instead
  diceDeck.originalDraw = diceDeck.draw;
  diceDeck.draw = function(count = 1) {
    const results = [];
    for (let i = 0; i < count; i++) {
      const roll = pool.roll();
      const card = new Card({
        type: 'dice-result',
        properties: {
          name: `${roll.total}`,
          notation: pool.getNotation(),
          rolls: roll.rolls.map(r => r.face),
          total: roll.total,
          timestamp: roll.timestamp
        },
        visual: {
          primaryColor: '#dc2626',
          textColor: '#ffffff'
        }
      });
      results.push(card);
    }
    return count === 1 ? results[0] : results;
  };
  
  // Override size to always return "infinite"
  Object.defineProperty(diceDeck, 'size', {
    get: () => Infinity
  });
  
  Object.defineProperty(diceDeck, 'isEmpty', {
    get: () => false
  });
  
  // Add dice-specific methods
  diceDeck.getDicePool = () => pool;
  diceDeck.getNotation = () => pool.getNotation();
  diceDeck.getStats = () => pool.getStats();
  
  return diceDeck;
});

/**
 * D&D character stats "deck" - rolls 6 ability scores
 */
DeckFactory.registerDeckType('dnd-stats', (options = {}) => {
  const method = options.method || '4d6-drop-lowest'; // or '3d6', 'point-buy', 'array'
  
  const deck = new Deck([], options);
  
  deck.originalDraw = deck.draw;
  deck.draw = function(count = 6) {
    const stats = [];
    const statNames = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'];
    
    for (let i = 0; i < Math.min(count, 6); i++) {
      let roll;
      let value;
      
      if (method === '4d6-drop-lowest') {
        const pool = DiceParser.parse('4d6');
        roll = pool.roll();
        // Sort rolls and drop the lowest
        const sorted = roll.rolls.map(r => r.value).sort((a, b) => b - a);
        value = sorted.slice(0, 3).reduce((sum, val) => sum + val, 0);
      } else if (method === '3d6') {
        const pool = DiceParser.parse('3d6');
        roll = pool.roll();
        value = roll.total;
      } else if (method === 'array') {
        const standardArray = [15, 14, 13, 12, 10, 8];
        value = standardArray[i];
        roll = { total: value, rolls: [{ face: value, value }] };
      }
      
      const card = new Card({
        type: 'ability-score',
        properties: {
          name: statNames[i],
          value,
          modifier: Math.floor((value - 10) / 2),
          method,
          rolls: roll.rolls?.map(r => r.face) || [value]
        },
        visual: {
          primaryColor: value >= 15 ? '#16a34a' : value >= 13 ? '#eab308' : value >= 10 ? '#6366f1' : '#dc2626',
          textColor: '#ffffff'
        }
      });
      
      stats.push(card);
    }
    
    return count === 1 ? stats[0] : stats;
  };
  
  return deck;
});

export default DeckFactory;