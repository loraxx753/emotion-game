/**
 * Dice System - Comprehensive dice rolling for tabletop games
 */

/**
 * Single Die class
 */
export class Die {
  constructor(sides = 6, type = 'standard') {
    this.sides = sides;
    this.type = type; // 'standard', 'fudge', 'custom'
    this.faces = this.generateFaces();
    this.lastRoll = null;
    this.rollHistory = [];
  }

  generateFaces() {
    switch (this.type) {
      case 'fudge':
        return ['-', '-', ' ', ' ', '+', '+']; // FATE/Fudge dice
      case 'custom':
        return Array.from({ length: this.sides }, (_, i) => i + 1);
      default:
        return Array.from({ length: this.sides }, (_, i) => i + 1);
    }
  }

  roll() {
    const index = Math.floor(Math.random() * this.faces.length);
    this.lastRoll = {
      face: this.faces[index],
      value: this.getValue(this.faces[index]),
      timestamp: Date.now()
    };
    
    this.rollHistory.push(this.lastRoll);
    return this.lastRoll;
  }

  getValue(face) {
    if (this.type === 'fudge') {
      return face === '+' ? 1 : face === '-' ? -1 : 0;
    }
    return typeof face === 'number' ? face : parseInt(face) || 0;
  }

  // Get standard die notation (e.g., "d6", "d20", "dF")
  getNotation() {
    if (this.type === 'fudge') return 'dF';
    return `d${this.sides}`;
  }

  // Get last N rolls
  getHistory(count = 10) {
    return this.rollHistory.slice(-count);
  }

  // Statistical methods
  getAverage() {
    if (this.type === 'fudge') return 0;
    return (this.sides + 1) / 2;
  }

  getRange() {
    if (this.type === 'fudge') return { min: -1, max: 1 };
    return { min: 1, max: this.sides };
  }
}

/**
 * Dice Pool - Multiple dice rolled together
 */
export class DicePool {
  constructor(dice = []) {
    this.dice = dice;
    this.lastRoll = null;
    this.rollHistory = [];
    this.modifiers = [];
  }

  // Add dice to the pool
  add(die) {
    if (die instanceof Die) {
      this.dice.push(die);
    } else if (typeof die === 'object') {
      this.dice.push(new Die(die.sides, die.type));
    }
    return this;
  }

  // Add multiple dice of same type
  addMultiple(count, sides, type = 'standard') {
    for (let i = 0; i < count; i++) {
      this.add(new Die(sides, type));
    }
    return this;
  }

  // Add modifiers (flat bonuses/penalties)
  addModifier(value, description = 'modifier') {
    this.modifiers.push({ value, description });
    return this;
  }

  // Roll all dice in the pool
  roll() {
    const rolls = this.dice.map(die => die.roll());
    const modifierTotal = this.modifiers.reduce((sum, mod) => sum + mod.value, 0);
    
    const total = rolls.reduce((sum, roll) => sum + roll.value, 0) + modifierTotal;
    
    this.lastRoll = {
      rolls,
      modifiers: [...this.modifiers],
      total,
      timestamp: Date.now()
    };
    
    this.rollHistory.push(this.lastRoll);
    return this.lastRoll;
  }

  // Get dice notation (e.g., "2d6+1d4+3")
  getNotation() {
    const diceGroups = {};
    
    // Group dice by type
    this.dice.forEach(die => {
      const notation = die.getNotation();
      diceGroups[notation] = (diceGroups[notation] || 0) + 1;
    });

    // Build notation string
    let notation = Object.entries(diceGroups)
      .map(([die, count]) => count > 1 ? `${count}${die}` : die)
      .join('+');

    // Add modifiers
    const modifierTotal = this.modifiers.reduce((sum, mod) => sum + mod.value, 0);
    if (modifierTotal > 0) notation += `+${modifierTotal}`;
    if (modifierTotal < 0) notation += `${modifierTotal}`;

    return notation;
  }

  // Clear all dice and modifiers
  clear() {
    this.dice = [];
    this.modifiers = [];
    return this;
  }

  // Get statistical info
  getStats() {
    const range = this.dice.reduce((acc, die) => {
      const dieRange = die.getRange();
      return {
        min: acc.min + dieRange.min,
        max: acc.max + dieRange.max
      };
    }, { min: 0, max: 0 });

    const modifierTotal = this.modifiers.reduce((sum, mod) => sum + mod.value, 0);
    
    return {
      min: range.min + modifierTotal,
      max: range.max + modifierTotal,
      average: this.dice.reduce((sum, die) => sum + die.getAverage(), 0) + modifierTotal,
      diceCount: this.dice.length,
      notation: this.getNotation()
    };
  }
}

/**
 * Dice Parser - Parse dice notation strings
 */
export class DiceParser {
  // Parse strings like "2d6+1d4+3", "d20+5", "4dF", etc.
  static parse(notation) {
    const pool = new DicePool();
    
    // Clean and normalize the notation
    const clean = notation.replace(/\s/g, '').toLowerCase();
    
    // Split by + and - while keeping the operators
    const parts = clean.split(/([+-])/).filter(part => part !== '');
    
    let currentSign = 1;
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      if (part === '+') {
        currentSign = 1;
        continue;
      } else if (part === '-') {
        currentSign = -1;
        continue;
      }
      
      // Parse dice notation (e.g., "2d6", "d20", "3df")
      const diceMatch = part.match(/^(\d*)(d)(\d+|f)$/);
      if (diceMatch) {
        const count = parseInt(diceMatch[1]) || 1;
        const sides = diceMatch[3] === 'f' ? 6 : parseInt(diceMatch[3]);
        const type = diceMatch[3] === 'f' ? 'fudge' : 'standard';
        
        for (let j = 0; j < count; j++) {
          pool.add(new Die(sides, type));
        }
      } else {
        // Parse flat modifier
        const modifier = parseInt(part);
        if (!isNaN(modifier)) {
          pool.addModifier(modifier * currentSign, `${currentSign > 0 ? '+' : ''}${modifier * currentSign}`);
        }
      }
      
      currentSign = 1; // Reset sign
    }
    
    return pool;
  }
}

/**
 * Dice Presets for common game systems
 */
export const DicePresets = {
  // D&D 5e
  dnd: {
    ability: () => DiceParser.parse('4d6'), // Roll 4d6, drop lowest (would need additional logic)
    advantage: () => DiceParser.parse('2d20'), // Roll twice, take higher
    d20: () => new DicePool([new Die(20)]),
    damage: {
      sword: () => DiceParser.parse('1d8'),
      greatsword: () => DiceParser.parse('2d6'),
      fireball: () => DiceParser.parse('8d6')
    }
  },
  
  // World of Darkness
  wod: {
    pool: (count) => new DicePool(Array.from({ length: count }, () => new Die(10)))
  },
  
  // FATE/Fudge
  fate: {
    roll: () => new DicePool([
      new Die(6, 'fudge'),
      new Die(6, 'fudge'),
      new Die(6, 'fudge'),
      new Die(6, 'fudge')
    ])
  },
  
  // Common dice
  basic: {
    d4: () => new DicePool([new Die(4)]),
    d6: () => new DicePool([new Die(6)]),
    d8: () => new DicePool([new Die(8)]),
    d10: () => new DicePool([new Die(10)]),
    d12: () => new DicePool([new Die(12)]),
    d20: () => new DicePool([new Die(20)]),
    d100: () => new DicePool([new Die(100)]),
    
    // Common combinations
    '2d6': () => DiceParser.parse('2d6'),
    '3d6': () => DiceParser.parse('3d6'),
    '4d6': () => DiceParser.parse('4d6')
  }
};

/**
 * Dice Roller Component - UI integration
 */
export class DiceRoller {
  constructor(container) {
    this.container = container;
    this.pools = new Map();
    this.history = [];
    this.maxHistory = 100;
  }

  // Add a named dice pool
  addPool(name, pool) {
    this.pools.set(name, pool);
    return this;
  }

  // Roll a pool by name
  roll(poolName) {
    const pool = this.pools.get(poolName);
    if (!pool) throw new Error(`Pool '${poolName}' not found`);
    
    const result = pool.roll();
    this.history.unshift({
      poolName,
      notation: pool.getNotation(),
      result,
      timestamp: Date.now()
    });
    
    // Limit history size
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(0, this.maxHistory);
    }
    
    this.updateUI();
    return result;
  }

  // Quick roll from notation
  quickRoll(notation, name = 'Quick Roll') {
    const pool = DiceParser.parse(notation);
    const result = pool.roll();
    
    this.history.unshift({
      poolName: name,
      notation: pool.getNotation(),
      result,
      timestamp: Date.now()
    });
    
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(0, this.maxHistory);
    }
    
    this.updateUI();
    return result;
  }

  // Update UI (placeholder - would be implemented based on UI framework)
  updateUI() {
    if (this.container && typeof this.onUpdate === 'function') {
      this.onUpdate(this.history);
    }
  }

  // Get roll history
  getHistory(count = 10) {
    return this.history.slice(0, count);
  }

  // Clear history
  clearHistory() {
    this.history = [];
    this.updateUI();
    return this;
  }
}

export default { Die, DicePool, DiceParser, DicePresets, DiceRoller };