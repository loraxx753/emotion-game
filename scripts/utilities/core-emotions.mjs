// cores where needs are being met (right side of the wheel)
export const needsMet = {
  proud:    { meaning: "achievement",        needsMet: true,  opposite: "ashamed" },
  joyful:   { meaning: "gain",               needsMet: true,  opposite: "sad" },
  trusting: { meaning: "safety",             needsMet: true,  opposite: "afraid" },
  loving:   { meaning: "connection",         needsMet: true,  opposite: "disgusted" },
  peaceful: { meaning: "harmony",            needsMet: true,  opposite: "angry" },
  powerful: { meaning: "capable/strong",     needsMet: true,  opposite: "sad" } // opposite at core-level is contextual; leave if you prefer null
};

// cores where needs are not being met (left side of the wheel)
export const needsNotMet = {
  angry:     { meaning: "boundaries violated", needsMet: false, opposite: "peaceful" },
  disgusted: { meaning: "rejection",           needsMet: false, opposite: "loving" },
  afraid:    { meaning: "threat",              needsMet: false, opposite: "trusting" },
  surprised: { meaning: "unexpected",          needsMet: false, opposite: "joyful" }, // opposite per your across-the-wheel rule
  sad:       { meaning: "loss",                needsMet: false, opposite: "joyful" },
  ashamed:   { meaning: "failure/inadequacy",  needsMet: false, opposite: "proud" }
};

export const hues = {
  angry: 0,          // red
  disgusted: 110,    // green
  afraid: 260,       // indigo-violet
  surprised: 285,    // violet-magenta
  sad: 210,          // blue
  ashamed: 330,      // magenta
  proud: 25,         // orange
  joyful: 48,        // golden yellow
  trusting: 200,     // blue-cyan
  loving: 320,       // pink-magenta
  peaceful: 175,     // teal
  powerful: 12       // red-orange
};

export default { ...needsMet, ...needsNotMet };