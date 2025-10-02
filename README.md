# Universal Card Game Engine

Your emotion card game has been generalized into a flexible card game framework! 

## 🎮 What's New

### Core Architecture
- **Generic Card System**: `Card` class that can represent any type of card
- **Flexible Deck Management**: `Deck` class with shuffle, draw, deal, and filter operations  
- **Deck Factory**: Easily create different types of card decks (emotions, playing cards, UNO, etc.)
- **Rule Engine**: Configurable game mechanics, turns, scoring, and win conditions
- **Responsive Design**: CSS system that adapts to different card types

### Supported Card Types

#### 1. **Emotion Cards** (your original)
```html
<card-game deck-type="emotions" game-mode="display" hand-size="4">
```
- Full psychological emotion taxonomy
- Color-coded by core emotions
- Hierarchical display (name → parent → core)

#### 2. **Standard Playing Cards**
```html
<card-game deck-type="standard" game-mode="display" hand-size="5">
```
- 52-card deck with suits and ranks
- Optional jokers
- Traditional card styling

#### 3. **UNO Cards**
```html
<card-game deck-type="uno" game-mode="display" hand-size="7">
```
- Number cards (0-9) in 4 colors
- Action cards (Skip, Reverse, Draw Two)
- Wild cards

## 🚀 Usage Examples

### Basic Display Mode
```html
<card-game deck-type="emotions" hand-size="4">
  <your-hand>
    <game-card></game-card>
    <game-card></game-card>
    <game-card></game-card>
    <game-card></game-card>
  </your-hand>
</card-game>
```

### Advanced Configuration
```html
<card-game 
  deck-type="emotions" 
  game-mode="solitaire"
  hand-size="5"
  shuffled="true"
  needs-filter="met"
  core-only="joyful,peaceful,loving">
```

### Multiplayer Setup
```html
<card-game 
  deck-type="standard" 
  game-mode="multiplayer"
  players="4"
  hand-size="7">
```

## 🎨 Styling System

The CSS now uses CSS custom properties for theming:

```css
--card-width: 240px;
--card-aspect-ratio: 5 / 7;
--card-border-radius: 10px;
--card-hover-lift: -2px;
--card-hover-rotate: -15deg;
--card-text-transform: uppercase;
```

Different card types get automatic styling:
- `data-card-type="playing-card"` - Traditional card proportions
- `data-card-type="uno-card"` - Rounded UNO-style cards  
- `data-card-type="emotion-card"` - Your original styling

## 🔧 Extending the System

### Adding New Card Types
```javascript
import { DeckFactory } from './scripts/core/DeckFactory.mjs';

DeckFactory.registerDeckType('tarot', (options = {}) => {
  // Create tarot cards...
  return new Deck(cards, options);
});
```

### Custom Game Rules
```javascript
import { RuleEngine } from './scripts/core/RuleEngine.mjs';

const customRules = {
  maxPlayers: 6,
  handSize: 10,
  winConditions: [
    {
      name: 'firstToMatch',
      check: (gameState) => {
        // Your win condition logic
      }
    }
  ]
};

const game = new RuleEngine(customRules);
```

## 🎯 What You Can Build Now

1. **Memory Games** - Match emotion pairs
2. **Card Battles** - Play cards with different strengths
3. **Storytelling Games** - Use emotion cards to build narratives
4. **Traditional Games** - Poker, Blackjack, Go Fish with the standard deck
5. **UNO Variants** - Classic UNO or custom rule variations
6. **Educational Tools** - Psychology learning games
7. **Therapy Games** - Emotion exploration and discussion

## 🧩 API Overview

```javascript
// Create any type of deck
const emotionDeck = DeckFactory.createDeck('emotions', { shuffled: true });
const playingCards = DeckFactory.createDeck('standard', { includeJokers: true });

// Deck operations
deck.shuffle();
const hand = deck.draw(5);
const [player1, player2] = deck.deal(2, 7);

// Game rules
const game = new RuleEngine(GameRules.matching);
game.setupGame(2);
game.executeAction('playCard', { cardIndex: 0 });
```

The system is now ready to support any card game you can imagine! 🎉