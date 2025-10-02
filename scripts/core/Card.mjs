/**
 * Base Card class - represents a single card in any card game
 */
export class Card {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.type = data.type || 'generic';
    this.properties = data.properties || {};
    this.metadata = data.metadata || {};
    this.visual = data.visual || {};
  }

  generateId() {
    return `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get a property value with optional default
  get(property, defaultValue = null) {
    return this.properties[property] ?? defaultValue;
  }

  // Set a property value
  set(property, value) {
    this.properties[property] = value;
    return this;
  }

  // Check if card has a property
  has(property) {
    return property in this.properties;
  }

  // Get display text for card (overrideable by card types)
  getDisplayText() {
    return this.get('name', 'Unnamed Card');
  }

  // Get visual properties (colors, images, etc.)
  getVisual() {
    return this.visual;
  }

  // Clone this card
  clone() {
    return new this.constructor({
      type: this.type,
      properties: { ...this.properties },
      metadata: { ...this.metadata },
      visual: { ...this.visual }
    });
  }

  // Serialize card data
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      properties: this.properties,
      metadata: this.metadata,
      visual: this.visual
    };
  }

  // Create card from serialized data
  static fromJSON(data) {
    return new Card(data);
  }
}