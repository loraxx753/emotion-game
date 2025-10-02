import { Card } from '../core/Card.mjs';
import { Deck } from '../core/Deck.mjs';
import { DeckFactory } from '../core/DeckFactory.mjs';
import emotions from '../utilities/emotions.mjs';
import coreEmotions, { hues as coreHue } from '../utilities/core-emotions.mjs';

/**
 * Emotion Card - specialized card for emotion-based games
 */
export class EmotionCard extends Card {
  constructor(data = {}) {
    super({
      type: 'emotion-card',
      ...data
    });
  }

  getDisplayText() {
    return this.get('name', 'Unknown Emotion');
  }

  getParent() {
    return this.get('parent', 'Unknown');
  }

  getCore() {
    return this.get('core', 'neutral');
  }

  // Get the color theme for this emotion
  getColorTheme() {
    const core = this.getCore();
    const hue = coreHue[core] ?? 210;
    
    return {
      hue,
      innerColor: `hsl(${hue} 100% 40%)`,
      outerColor: `hsl(${hue} 100% 50%)`,
      primaryColor: `hsl(${hue} 90% 45%)`,
      textColor: '#ffffff'
    };
  }

  // Check if this emotion represents needs being met
  hasNeedsMet() {
    const core = this.getCore();
    const coreInfo = coreEmotions[core];
    return coreInfo?.needsMet || false;
  }

  // Get the opposite emotion
  getOpposite() {
    const core = this.getCore();
    const coreInfo = coreEmotions[core];
    return coreInfo?.opposite || null;
  }
}

/**
 * Register emotion deck type with the factory
 */
DeckFactory.registerDeckType('emotions', (options = {}) => {
  const cards = [];
  
  // Convert emotion data to cards
  Object.entries(emotions).forEach(([emotionName, emotionData]) => {
    const colorTheme = (() => {
      const core = emotionData.core;
      const hue = coreHue[core] ?? 210;
      return {
        hue,
        innerColor: `hsl(${hue} 100% 40%)`,
        outerColor: `hsl(${hue} 100% 50%)`,
        primaryColor: `hsl(${hue} 90% 45%)`,
        textColor: '#ffffff'
      };
    })();

    cards.push(new EmotionCard({
      properties: {
        name: emotionName,
        parent: emotionData.parent,
        core: emotionData.core,
        needsMet: coreEmotions[emotionData.core]?.needsMet || false,
        meaning: coreEmotions[emotionData.core]?.meaning || 'unknown'
      },
      visual: colorTheme,
      metadata: {
        category: 'emotion',
        source: 'psychological-taxonomy'
      }
    }));
  });

  // Option to include only specific core emotions
  if (options.coreOnly) {
    const allowedCores = Array.isArray(options.coreOnly) ? options.coreOnly : Object.keys(coreEmotions);
    return new Deck(
      cards.filter(card => allowedCores.includes(card.getCore())),
      { shuffleOnCreate: options.shuffled !== false, ...options }
    );
  }

  // Option to include only needs-met or needs-not-met emotions
  if (options.needsFilter !== undefined) {
    return new Deck(
      cards.filter(card => card.hasNeedsMet() === options.needsFilter),
      { shuffleOnCreate: options.shuffled !== false, ...options }
    );
  }

  return new Deck(cards, { 
    shuffleOnCreate: options.shuffled !== false,
    ...options 
  });
});

/**
 * Utility functions for emotion-specific operations
 */
export const EmotionUtils = {
  // Get random emotion card
  getRandomEmotion() {
    const deck = DeckFactory.createDeck('emotions', { shuffled: true });
    return deck.draw();
  },

  // Get emotions by core type
  getEmotionsByCore(core) {
    const deck = DeckFactory.createDeck('emotions');
    return deck.getByProperty('core', core).toArray();
  },

  // Get complementary emotions (opposite cores)
  getComplementaryEmotions(emotionCard) {
    const opposite = emotionCard.getOpposite();
    if (!opposite) return [];
    
    return this.getEmotionsByCore(opposite);
  },

  // Create a balanced emotion deck (equal representation of cores)
  createBalancedDeck(cardsPerCore = 2) {
    const deck = DeckFactory.createDeck('emotions');
    const coreCards = {};
    
    // Group by core
    deck.toArray().forEach(card => {
      const core = card.getCore();
      if (!coreCards[core]) coreCards[core] = [];
      coreCards[core].push(card);
    });

    // Sample from each core
    const balancedCards = [];
    Object.values(coreCards).forEach(cards => {
      const shuffled = [...cards].sort(() => Math.random() - 0.5);
      balancedCards.push(...shuffled.slice(0, cardsPerCore));
    });

    return new Deck(balancedCards, { shuffleOnCreate: true });
  }
};

export default EmotionCard;