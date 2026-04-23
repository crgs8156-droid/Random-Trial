/* =====================================================
   VALENTINE'S DAY PROPOSAL PAGE — script.js
   ===================================================== */

// ── CHANGE THIS: your GIF URLs for each emotional stage ──────────────────────
// Index 0 = default/happy, 1 = confused, 2 = pleading, 3 = sad,
// 4 = sadder, 5 = devastated, 6 = crying/running away
const GIFS = [
  "https://media.tenor.com/EBV7OT7ACfwAAAAj/u-u-qua-qua-u-quaa.gif",          // 0 happy/normal
  "https://media.tenor.com/Oc4FMBqRsHIAAAAj/confused-cute.gif",               // 1 confused
  "https://media.tenor.com/s7MBv-5eXLQAAAAj/anime-please.gif",                // 2 pleading
  "https://media.tenor.com/MDRemzFhJLoAAAAj/sad-anime.gif",                   // 3 sad
  "https://media.tenor.com/J3VKLS14VGAAAAAC/crying-anime.gif",                // 4 sadder
  "https://media.tenor.com/3s7pLMuFNIcAAAAC/crying-cat.gif",                  // 5 devastated
  "https://media.tenor.com/JQFWpUhF6XUAAAAC/run-away-running.gif",            // 6 runaway
];

// ── CHANGE THIS: No-button guilt-trip text sequence ──────────────────────────
// First entry is the INITIAL label shown on the button (keep it "No").
// Subsequent entries appear in the button only as COMMENTS / internal reference;
// the button itself stays "No" at start and cycles through these on each click.
const NO_TEXTS = [
  "No",                                          // initial label — shown on button at load
  // ↓ these replace button text on each successive click:
  "Are you positive? 🤔",
  "Pookie please... 🥺",
  "If you say no, I will be really sad...",
  "I will be very sad... 😢",
  "Please??? 💔",
  "Don't do this to me...",
  "Last chance! 😭",
  "You can't catch me anyway 😜",
];

// ── CHANGE THIS: Tease messages when Yes is clicked too early ─────────────────
const YES_TEASE_MSGS = [
  "Try saying no first... I bet you want to know what happens 😏",
  "Curious, aren't you? Hit No a few times first 👀",
  "C'mon, explore a little before saying yes 😉",
  "The no button has feelings too... tease it a bit 🐾",
];

// ── CHANGE THIS: Guilt-trip toasts that appear when No is clicked ─────────────
const NO_TOASTS = [
  "",                                        // 0 → no toast on first click
  "Are you sure sure sure? 🤔",
  "My heart is breaking...",
  "I practiced this proposal for weeks 😔",
  "Even my teddy bear is crying right now 🧸💧",
  "FIVE nos?! My soul has left the body.",
  "I have become the sad clown 🤡",
  "Last warning. The button is gaining speed.",
  "I told you 😜",
];

// ─────────────────────────────────────────────────────────────────────────────

let noCount       = 0;
let yesTeasIdx    = 0;
let runawayMode   = false;   // enabled after 5th No click
let musicPlaying  = false;

const yesBtn     = document.getElementById("yes-btn");
const noBtn      = document.getElementById("no-btn");
const toast      = document.getElementById("toast");
const gifEl      = document.getElementById("character-gif");
const music      = document.getElementById("bg-music");

// ── Init ─────────────────────────────────────────────────────────────────────
(function init() {
  gifEl.src = GIFS[0];
  music.volume = 0.3;   // CHANGE THIS: background music volume (0.0–1.0)

  // Attempt autoplay (browsers often block it; user can tap the 🔊 button)
  music.play().then(() => {
    musicPlaying = true;
    document.getElementById("music-toggle").textContent = "🔊";
  }).catch(() => {
    musicPlaying = false;
    document.getElementById("music-toggle").textContent = "🔇";
  });

  spawnHearts();
})();

// ── Yes handler ───────────────────────────────────────────────────────────────
// Yes ALWAYS navigates to yes.html — no tease gate.
function handleYes() {
  window.location.href = "yes.html";
}

// ── No handler ────────────────────────────────────────────────────────────────
function handleNo() {
  noCount++;

  // 1. Update No button text (clamp to last entry)
  const noTextIdx = Math.min(noCount, NO_TEXTS.length - 1);
  noBtn.textContent = NO_TEXTS[noTextIdx];

  // 2. Grow Yes button (35% font-size increase per click, capped at 3.4rem)
  const currentYesFontSize = parseFloat(getComputedStyle(yesBtn).fontSize);
  const newYesFontSize = Math.min(currentYesFontSize * 1.35, 54); // px cap
  const newYesPadV = Math.min(16 + noCount * 4, 36);
  const newYesPadH = Math.min(40 + noCount * 8, 80);
  yesBtn.style.fontSize = newYesFontSize + "px";
  yesBtn.style.padding  = `${newYesPadV}px ${newYesPadH}px`;

  // 3. Shrink No button after 2nd click (min out at 0.65rem / 8px padding)
  if (noCount >= 2) {
    const currentNoFontSize = parseFloat(getComputedStyle(noBtn).fontSize);
    const newNoFontSize = Math.max(currentNoFontSize * 0.88, 10); // px floor
    const newNoPadV = Math.max(12 - (noCount - 2) * 1.5, 5);
    const newNoPadH = Math.max(28 - (noCount - 2) * 3,   10);
    noBtn.style.fontSize = newNoFontSize + "px";
    noBtn.style.padding  = `${newNoPadV}px ${newNoPadH}px`;
  }

  // 4. Swap GIF (fade transition)
  const gifIdx = Math.min(noCount, GIFS.length - 1);
  swapGif(GIFS[gifIdx]);

  // 5. Show guilt-trip toast
  const toastMsg = NO_TOASTS[Math.min(noCount, NO_TOASTS.length - 1)];
  if (toastMsg) showToast(toastMsg, 3000);

  // 6. Enable runaway mode after 5th click
  if (noCount >= 5 && !runawayMode) {
    enableRunawayMode();
  }

  // Prevent default runaway jump on the click itself
  if (runawayMode) {
    moveNoBtnRandom();
  }
}

// ── GIF swap with fade ────────────────────────────────────────────────────────
function swapGif(newSrc) {
  gifEl.classList.add("fading");
  setTimeout(() => {
    gifEl.src = newSrc;
    gifEl.classList.remove("fading");
  }, 400);
}

// ── Toast display ─────────────────────────────────────────────────────────────
let toastTimer = null;
function showToast(msg, duration = 3000) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), duration);
}

// ── Runaway mode ──────────────────────────────────────────────────────────────
function enableRunawayMode() {
  runawayMode = true;
  noBtn.classList.add("runaway");

  // Remove inline onclick so it doesn't double-fire
  noBtn.removeAttribute("onclick");

  // Click still triggers a jump (and bounce-away feeling)
  noBtn.addEventListener("click", moveNoBtnRandom);

  // KEY FIX: listen on the whole DOCUMENT for mousemove/touchmove.
  // This way the button escapes BEFORE the pointer can reach it,
  // because we calculate proximity and jump if the cursor gets close.
  document.addEventListener("mousemove",  handleProximity);
  document.addEventListener("touchmove",  handleTouchProximity, { passive: true });

  moveNoBtnRandom(); // jump immediately on activation
  showToast("Catch me if you can! 😜", 3500);
}

// Escape threshold in px — button jumps when cursor is within this distance
const ESCAPE_RADIUS = 80; // CHANGE THIS: px proximity that triggers escape

function handleProximity(e) {
  if (!runawayMode) return;
  const rect  = noBtn.getBoundingClientRect();
  const btnCX = rect.left + rect.width  / 2;
  const btnCY = rect.top  + rect.height / 2;
  const dx    = e.clientX - btnCX;
  const dy    = e.clientY - btnCY;
  const dist  = Math.sqrt(dx * dx + dy * dy);
  if (dist < ESCAPE_RADIUS) moveNoBtnRandom();
}

function handleTouchProximity(e) {
  if (!runawayMode || !e.touches.length) return;
  const touch = e.touches[0];
  // Reuse the same proximity logic
  handleProximity({ clientX: touch.clientX, clientY: touch.clientY });
}

function moveNoBtnRandom() {
  if (!runawayMode) return;
  const btnW = noBtn.offsetWidth  || 120;
  const btnH = noBtn.offsetHeight || 44;
  const maxX = window.innerWidth  - btnW - 16;
  const maxY = window.innerHeight - btnH - 16;
  const x = Math.max(8, Math.floor(Math.random() * maxX));
  const y = Math.max(8, Math.floor(Math.random() * maxY));
  noBtn.style.left = x + "px";
  noBtn.style.top  = y + "px";
}

// ── Music toggle ──────────────────────────────────────────────────────────────
function toggleMusic() {
  const btn = document.getElementById("music-toggle");
  if (musicPlaying) {
    music.pause();
    musicPlaying = false;
    btn.textContent = "🔇";
  } else {
    music.play();
    musicPlaying = true;
    btn.textContent = "🔊";
  }
}

// ── Floating hearts ───────────────────────────────────────────────────────────
// CHANGE THIS: heart characters to use
const HEART_CHARS = ["💕", "💖", "💗", "💓", "💘", "🩷", "❤️", "💝"];

function spawnHearts() {
  const container = document.getElementById("hearts-container");
  const HEART_COUNT = 22; // CHANGE THIS: number of simultaneous floating hearts

  for (let i = 0; i < HEART_COUNT; i++) {
    const h = document.createElement("span");
    h.className = "heart";
    h.textContent = HEART_CHARS[Math.floor(Math.random() * HEART_CHARS.length)];

    // Random horizontal position
    h.style.left = Math.random() * 100 + "vw";

    // Random size
    const size = 0.9 + Math.random() * 1.2;
    h.style.fontSize = size + "rem";
    h.style.opacity  = "0";

    // Staggered & varied duration so they don't all start together
    const duration = 7 + Math.random() * 10;  // 7–17 s
    const delay    = Math.random() * 12;       // 0–12 s offset
    h.style.animationDuration = duration + "s";
    h.style.animationDelay    = delay + "s";

    container.appendChild(h);
  }
}

// Reposition No button on resize if in runaway mode
window.addEventListener("resize", () => {
  if (runawayMode) moveNoBtnRandom();
});
