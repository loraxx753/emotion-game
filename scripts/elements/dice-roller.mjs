import { DiceRoller, DiceParser, DicePresets } from '../core/Dice.mjs';

/**
 * Dice Roller Web Component
 */
customElements.define('dice-roller', class extends HTMLElement {
  static observedAttributes = ['notation', 'preset', 'auto-roll'];

  constructor() {
    super();
    this.roller = new DiceRoller(this);
    this.currentPool = null;
    this.setupEventListeners();
  }

  connectedCallback() {
    this.render();
    this.setupDice();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.setupDice();
      this.render();
    }
  }

  setupDice() {
    const notation = this.getAttribute('notation');
    const preset = this.getAttribute('preset');
    
    if (preset && DicePresets[preset]) {
      // Handle preset dice (e.g., "dnd.d20", "fate.roll")
      const [system, type] = preset.split('.');
      if (DicePresets[system] && DicePresets[system][type]) {
        this.currentPool = DicePresets[system][type]();
      }
    } else if (notation) {
      // Parse notation string
      this.currentPool = DiceParser.parse(notation);
    } else {
      // Default to d6
      this.currentPool = DiceParser.parse('1d6');
    }

    if (this.getAttribute('auto-roll') === 'true') {
      this.roll();
    }
  }

  setupEventListeners() {
    this.addEventListener('click', (e) => {
      if (e.target.matches('.roll-button, .die-face')) {
        this.roll();
      }
    });
  }

  roll() {
    if (!this.currentPool) return;
    
    const result = this.currentPool.roll();
    this.dispatchEvent(new CustomEvent('dice-rolled', {
      detail: {
        result,
        notation: this.currentPool.getNotation(),
        pool: this.currentPool
      },
      bubbles: true
    }));
    
    this.updateDisplay(result);
    return result;
  }

  updateDisplay(result) {
    const container = this.querySelector('.dice-result');
    if (!container) return;

    // Animate the roll
    container.classList.add('rolling');
    
    setTimeout(() => {
      container.innerHTML = this.renderResult(result);
      container.classList.remove('rolling');
      container.classList.add('rolled');
      
      setTimeout(() => container.classList.remove('rolled'), 300);
    }, 200);
  }

  renderResult(result) {
    const diceHTML = result.rolls.map(roll => 
      `<div class="die-result" data-value="${roll.value}">
        <span class="die-face">${roll.face}</span>
      </div>`
    ).join('');
    
    const modifiersHTML = result.modifiers.length > 0 
      ? `<div class="modifiers">${result.modifiers.map(m => 
          `<span class="modifier ${m.value >= 0 ? 'positive' : 'negative'}">
            ${m.value >= 0 ? '+' : ''}${m.value}
          </span>`
        ).join('')}</div>`
      : '';
    
    return `
      <div class="dice-rolls">${diceHTML}</div>
      ${modifiersHTML}
      <div class="total-result">
        <span class="total-label">Total:</span>
        <span class="total-value">${result.total}</span>
      </div>
    `;
  }

  render() {
    if (!this.currentPool) return;
    
    const notation = this.currentPool.getNotation();
    const stats = this.currentPool.getStats();
    
    this.innerHTML = `
      <div class="dice-roller-container">
        <div class="dice-info">
          <div class="notation">${notation}</div>
          <div class="range">Range: ${stats.min}-${stats.max} (avg: ${stats.average.toFixed(1)})</div>
        </div>
        
        <div class="dice-result">
          <div class="roll-prompt">
            <button class="roll-button">🎲 Roll ${notation}</button>
          </div>
        </div>
        
        <div class="dice-history"></div>
      </div>
      
      <style>
        :host {
          display: block;
          font-family: var(--font-family, sans-serif);
          margin: 1rem 0;
        }
        
        .dice-roller-container {
          border: 2px solid #334155;
          border-radius: 8px;
          padding: 1rem;
          background: #1e293b;
          color: white;
        }
        
        .dice-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          font-size: 0.9em;
          opacity: 0.8;
        }
        
        .notation {
          font-weight: bold;
          font-family: monospace;
          font-size: 1.1em;
        }
        
        .dice-result {
          min-height: 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        
        .dice-result.rolling {
          transform: scale(0.9);
          opacity: 0.5;
        }
        
        .dice-result.rolled {
          transform: scale(1.05);
        }
        
        .roll-button {
          background: #dc2626;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          font-size: 1.1em;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .roll-button:hover {
          background: #b91c1c;
        }
        
        .dice-rolls {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          flex-wrap: wrap;
          justify-content: center;
        }
        
        .die-result {
          width: 40px;
          height: 40px;
          background: white;
          color: #1e293b;
          border: 2px solid #334155;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.2em;
          cursor: pointer;
          transition: transform 0.2s;
        }
        
        .die-result:hover {
          transform: scale(1.1);
        }
        
        .modifiers {
          display: flex;
          gap: 0.25rem;
          margin-bottom: 0.5rem;
        }
        
        .modifier {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.9em;
          font-weight: bold;
        }
        
        .modifier.positive {
          background: #16a34a;
          color: white;
        }
        
        .modifier.negative {
          background: #dc2626;
          color: white;
        }
        
        .total-result {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.3em;
          font-weight: bold;
        }
        
        .total-value {
          background: #fbbf24;
          color: #1e293b;
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          min-width: 2em;
          text-align: center;
        }
      </style>
    `;
  }

  // Public API
  getDicePool() {
    return this.currentPool;
  }

  getLastResult() {
    return this.currentPool?.lastRoll || null;
  }

  setNotation(notation) {
    this.setAttribute('notation', notation);
  }

  setPreset(preset) {
    this.setAttribute('preset', preset);
  }
});

/**
 * Dice Set Component - Multiple dice rollers
 */
customElements.define('dice-set', class extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    const preset = this.getAttribute('preset') || 'basic';
    
    let diceHTML = '';
    
    if (preset === 'dnd') {
      diceHTML = `
        <h3>D&D Dice Set</h3>
        <div class="dice-grid">
          <dice-roller notation="1d4" title="d4"></dice-roller>
          <dice-roller notation="1d6" title="d6"></dice-roller>
          <dice-roller notation="1d8" title="d8"></dice-roller>
          <dice-roller notation="1d10" title="d10"></dice-roller>
          <dice-roller notation="1d12" title="d12"></dice-roller>
          <dice-roller notation="1d20" title="d20"></dice-roller>
          <dice-roller notation="1d100" title="d100"></dice-roller>
        </div>
        
        <h4>Common Rolls</h4>
        <div class="common-rolls">
          <dice-roller notation="2d6" title="2d6"></dice-roller>
          <dice-roller notation="3d6" title="3d6"></dice-roller>
          <dice-roller notation="4d6" title="4d6"></dice-roller>
          <dice-roller notation="1d20+5" title="Attack (+5)"></dice-roller>
        </div>
      `;
    } else if (preset === 'fate') {
      diceHTML = `
        <h3>FATE Dice</h3>
        <dice-roller preset="fate.roll" title="4dF"></dice-roller>
      `;
    } else {
      diceHTML = `
        <h3>Basic Dice</h3>
        <div class="dice-grid">
          <dice-roller notation="1d6" title="d6"></dice-roller>
          <dice-roller notation="2d6" title="2d6"></dice-roller>
        </div>
      `;
    }
    
    this.innerHTML = `
      <div class="dice-set-container">
        ${diceHTML}
      </div>
      
      <style>
        :host {
          display: block;
          padding: 1rem;
        }
        
        .dice-set-container h3, .dice-set-container h4 {
          margin: 1rem 0 0.5rem 0;
          color: #334155;
        }
        
        .dice-grid, .common-rolls {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }
      </style>
    `;
  }
});