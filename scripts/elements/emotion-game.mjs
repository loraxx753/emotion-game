import emotions from '../utilities/emotions.mjs';
import coreEmotions, { hues as coreHue } from '../utilities/core-emotions.mjs';

/* Optional: derive a readable foreground (white/black) from hue if you later vary lightness */
function readableTextOn(h = 0, s = 90, l = 45) {
  // WCAG-ish heuristic: convert HSL→approx perceived luminance
  // Here we just keep white text as in your CSS; hook available if you need it.
  return '#fff';
}

/* ---------- Utility to pick/resolve emotions ---------- */
function pickRandomEmotion() {
  const all = Object.keys(emotions); // `emotions` is your merged {...sad, ...angry, ...}
  const k = all[Math.floor(Math.random() * all.length)];
  return { name: k, ...emotions[k] }; // { name, parent, core }
}

function setCoreColor(el, core) {
  const hue = coreHue[core] ?? 210; // default to blue if missing
  el.style.setProperty('--inner-color', `hsl( ${hue} 100% 40%)`);
  el.style.setProperty('--outer-color', `hsl( ${hue} 100% 50%)`);
  // If you want full HSL triplet as a single var, you can also set:
  // el.style.setProperty('--emotional-color', `hsl(${hue} 90% 45%)`);
}

customElements.define('emotion-game', class extends HTMLElement {
  connectedCallback() {
    const emotionEls = this.querySelectorAll('emotion-card');
    emotionEls.forEach(el => {
      const e = pickRandomEmotion();
      el.innerHTML = `
        <emotion-name>${e.name}</emotion-name>
        <emotion-parent>${e.parent}</emotion-parent>
        <emotional-core>${e.core}</emotional-core>
      `;
      setCoreColor(el, e.core);
    });
  }
});