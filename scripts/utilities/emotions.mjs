// --- sad (loss) ---
const sad = {
  isolated:     { parent: "lonely",     core: "sad" },
  abandoned:    { parent: "lonely",     core: "sad" },
  victimized:   { parent: "vulnerable", core: "sad" },
  fragile:      { parent: "vulnerable", core: "sad" },
  grief:        { parent: "despair",    core: "sad" },
  powerless:    { parent: "despair",    core: "sad" },
  remorseful:   { parent: "guilty",     core: "sad" },
  ashamed:      { parent: "guilty",     core: "sad" },
  inferior:     { parent: "depressed",  core: "sad" },
  empty:        { parent: "depressed",  core: "sad" },
  embarrassed:  { parent: "hurt",       core: "sad" },
  disappointed: { parent: "hurt",       core: "sad" }
};

// --- angry (boundaries violated) ---
const angry = {
  skeptical:  { parent: "critical",    core: "angry" },
  dismissive: { parent: "critical",    core: "angry" },
  withdrawn:  { parent: "distant",     core: "angry" },
  numb:       { parent: "distant",     core: "angry" },
  infuriated: { parent: "frustrated",  core: "angry" },
  annoyed:    { parent: "frustrated",  core: "angry" },
  provoked:   { parent: "aggressive",  core: "angry" },
  hostile:    { parent: "aggressive",  core: "angry" },
  violated:   { parent: "resentful",   core: "angry" },
  jealous:    { parent: "resentful",   core: "angry" },
  furious:    { parent: "mad",         core: "angry" },
  irritated:  { parent: "mad",         core: "angry" }
};

// --- joyful (gain) ---
const joyful = {
  playful:     { parent: "excited",    core: "joyful" },
  energetic:   { parent: "excited",    core: "joyful" },
  proud:       { parent: "proud",      core: "joyful" },
  successful:  { parent: "proud",      core: "joyful" },
  confident:   { parent: "optimistic", core: "joyful" },
  hopeful:     { parent: "optimistic", core: "joyful" },
  content:     { parent: "happy",      core: "joyful" },
  free:        { parent: "happy",      core: "joyful" },
  interested:  { parent: "curious",    core: "joyful" },
  inquisitive: { parent: "curious",    core: "joyful" },
  creative:    { parent: "accepting",  core: "joyful" },
  loving:      { parent: "accepting",  core: "joyful" }
};

// --- afraid (threat) ---
const afraid = {
  overwhelmed:   { parent: "inferior",    core: "afraid" },
  insecure:      { parent: "inferior",    core: "afraid" },
  worried:       { parent: "anxious",     core: "afraid" },
  inadequate:    { parent: "anxious",     core: "afraid" },
  insignificant: { parent: "helpless",    core: "afraid" },
  weak:          { parent: "helpless",    core: "afraid" },
  foolish:       { parent: "embarrassed", core: "afraid" },
  ridiculous:    { parent: "embarrassed", core: "afraid" },
  rejected:      { parent: "discouraged", core: "afraid" },
  worthless:     { parent: "discouraged", core: "afraid" },
  ignored:       { parent: "ignored",     core: "afraid" },
  neglected:     { parent: "ignored",     core: "afraid" }
};

// --- peaceful (harmony) ---
const peaceful = {
  intimate:     { parent: "loving",      core: "peaceful" },
  affectionate: { parent: "loving",      core: "peaceful" },
  thoughtful:   { parent: "thankful",    core: "peaceful" },
  grateful:     { parent: "thankful",    core: "peaceful" },
  trusting:     { parent: "faithful",    core: "peaceful" },
  nurturing:    { parent: "faithful",    core: "peaceful" },
  serene:       { parent: "content",     core: "peaceful" },
  fulfilled:    { parent: "content",     core: "peaceful" },
  balanced:     { parent: "joyful",      core: "peaceful" },
  hopeful:      { parent: "joyful",      core: "peaceful" },
  relaxed:      { parent: "playful",     core: "peaceful" },
  patient:      { parent: "playful",     core: "peaceful" }
};

// --- ashamed (failure/inadequacy) ---
const ashamed = {
  inferior:      { parent: "inadequate",  core: "ashamed" },
  worthless:     { parent: "inadequate",  core: "ashamed" },
  embarrassed:   { parent: "exposed",     core: "ashamed" },
  ridiculed:     { parent: "exposed",     core: "ashamed" },
  guilty:        { parent: "self-blame",  core: "ashamed" },
  remorseful:    { parent: "self-blame",  core: "ashamed" },
  humiliated:    { parent: "disgraced",   core: "ashamed" },
  disgraced:     { parent: "disgraced",   core: "ashamed" },
  rejected:      { parent: "unworthy",    core: "ashamed" },
  unwanted:      { parent: "unworthy",    core: "ashamed" },
  selfconscious: { parent: "awkward",     core: "ashamed" },
  awkward:       { parent: "awkward",     core: "ashamed" }
};

// --- disgusted (rejection) ---
const disgusted = {
  disapproving: { parent: "judgmental", core: "disgusted" },
  contemptuous: { parent: "judgmental", core: "disgusted" },
  revolted:     { parent: "repelled",   core: "disgusted" },
  nauseated:    { parent: "repelled",   core: "disgusted" },
  detestable:   { parent: "awful",      core: "disgusted" },
  repugnant:    { parent: "awful",      core: "disgusted" },
  loathing:     { parent: "horrified",  core: "disgusted" },
  horrified:    { parent: "horrified",  core: "disgusted" },
  withdrawn:    { parent: "distant",    core: "disgusted" },
  numb:         { parent: "distant",    core: "disgusted" },
  critical:     { parent: "judging",    core: "disgusted" },
  blaming:      { parent: "judging",    core: "disgusted" }
};

// --- proud (achievement) ---
const proud = {
  confident:    { parent: "successful", core: "proud" },
  accomplished: { parent: "successful", core: "proud" },
  capable:      { parent: "worthy",     core: "proud" },
  worthy:       { parent: "worthy",     core: "proud" },
  valuable:     { parent: "respected",  core: "proud" },
  respected:    { parent: "respected",  core: "proud" },
  honored:      { parent: "appreciated",core: "proud" },
  appreciated:  { parent: "appreciated",core: "proud" },
  secure:       { parent: "accepted",   core: "proud" },
  accepted:     { parent: "accepted",   core: "proud" },
  strong:       { parent: "recognized", core: "proud" },
  recognized:   { parent: "recognized", core: "proud" }
};

// --- surprised (unexpected) ---
const surprised = {
  startled:     { parent: "shocked",       core: "surprised" },
  dismayed:     { parent: "shocked",       core: "surprised" },
  confused:     { parent: "disillusioned", core: "surprised" },
  disillusioned:{ parent: "disillusioned", core: "surprised" },
  amazed:       { parent: "perplexed",     core: "surprised" },
  perplexed:    { parent: "perplexed",     core: "surprised" },
  astonished:   { parent: "astonished",    core: "surprised" },
  awe:          { parent: "astonished",    core: "surprised" },
  moved:        { parent: "moved",         core: "surprised" },
  touched:      { parent: "moved",         core: "surprised" },
  stimulated:   { parent: "stirred",       core: "surprised" },
  stirred:      { parent: "stirred",       core: "surprised" }
};

// --- loving (connection) ---
const loving = {
  caring:        { parent: "affectionate", core: "loving" },
  compassionate: { parent: "affectionate", core: "loving" },
  tender:        { parent: "devoted",      core: "loving" },
  devoted:       { parent: "devoted",      core: "loving" },
  passionate:    { parent: "romantic",     core: "loving" },
  romantic:      { parent: "romantic",     core: "loving" },
  affectionate:  { parent: "compassionate",core: "loving" },
  warm:          { parent: "compassionate",core: "loving" },
  admiring:      { parent: "adoring",      core: "loving" },
  adoring:       { parent: "adoring",      core: "loving" },
  appreciative:  { parent: "thankful",     core: "loving" },
  grateful:      { parent: "thankful",     core: "loving" }
};

// --- trusting (safety) ---
const trusting = {
  secure:      { parent: "safe",       core: "trusting" },
  safe:        { parent: "safe",       core: "trusting" },
  protected:   { parent: "supported",  core: "trusting" },
  supported:   { parent: "supported",  core: "trusting" },
  reassured:   { parent: "comforted",  core: "trusting" },
  comforted:   { parent: "comforted",  core: "trusting" },
  accepted:    { parent: "included",   core: "trusting" },
  included:    { parent: "included",   core: "trusting" },
  valued:      { parent: "respected",  core: "trusting" },
  respected:   { parent: "respected",  core: "trusting" },
  understood:  { parent: "known",      core: "trusting" },
  known:       { parent: "known",      core: "trusting" }
};

// --- powerful (capable/strong) ---
const powerful = {
  courageous:   { parent: "proud",        core: "powerful" },
  valuable:     { parent: "proud",        core: "powerful" },
  creative:     { parent: "faithful",     core: "powerful" },
  hopeful:      { parent: "faithful",     core: "powerful" },
  important:    { parent: "aware",        core: "powerful" },
  aware:        { parent: "aware",        core: "powerful" },
  appreciated:  { parent: "respected",    core: "powerful" },
  respected:    { parent: "respected",    core: "powerful" },
  proud:        { parent: "confident",    core: "powerful" },
  confident:    { parent: "confident",    core: "powerful" },
  successful:   { parent: "accomplished", core: "powerful" },
  accomplished: { parent: "accomplished", core: "powerful" }
};

// --- merged ---
export default {
  ...sad,
  ...angry,
  ...joyful,
  ...afraid,
  ...peaceful,
  ...ashamed,
  ...disgusted,
  ...proud,
  ...surprised,
  ...loving,
  ...trusting,
  ...powerful
};