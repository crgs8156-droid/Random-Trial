/* =====================================================
   VALENTINE'S DAY PROPOSAL PAGE — script.js
   ===================================================== */

// ── CHANGE THIS: your GIF URLs for each emotional stage ──────────────────────
// Index 0 = default/happy, 1 = confused, 2 = pleading, 3 = sad,
// 4 = sadder, 5 = devastated, 6 = crying/running away
const GIFS = [
  "https://media.tenor.com/EBV7OT7ACfwAAAAj/u-u-qua-qua-u-quaa.gif",   // 0 happy/normal
  "https://media.tenor.com/Oc4FMBqRsHIAAAAj/confused-cute.gif",        // 1 confused
  "https://media.tenor.com/s7MBv-5eXLQAAAAj/anime-please.gif",         // 2 pleading
  "https://media.tenor.com/MDRemzFhJLoAAAAj/sad-anime.gif",            // 3 sad
  "https://media.tenor.com/J3VKLS14VGAAAAAC/crying-anime.gif",         // 4 sadder
  "https://media.tenor.com/3s7pLMuFNIcAAAAC/crying-cat.gif",           // 5 devastated
  "https://media.tenor.com/JQFWpUhF6XUAAAAC/run-away-running.gif",     // 6 runaway
];

// ── The red No button label — this NEVER changes, always stays "No" ──────────
// CHANGE THIS: edit if you want a different static label (e.g. "Nope", "No!")
const NO_BUTTON_LABEL = "No";

// ── CHANGE THIS: Guilt-trip TOAST messages shown BELOW the buttons ────────────
// These appear in the pink bubble ONLY. The red button itself always stays "No".
// Edit / add / remove lines freely.
const NO_TOASTS = [
  "Are you positive? 🤔",                        // click 1
  "Pookie please... 🥺",                         // click 2
  "If you say no, I will be really sad...",      // click 3  ← runaway starts here
  "I will be very sad... 😢",                    // click 4
  "Please??? 💔",                                // click 5
  "Don't do this to me...",                      // click 6
  "Last chance! 😭",                             // click 7
  "I told you I'd run away 😜",                  // click 8+
];

// ── CHANGE THIS: after how many No clicks does the button start running away? ─
// Default is 3 — change to any number you like.
const RUNAWAY_AFTER_CLICKS = 10;

// ─────────────────────────────────────────────────────────────────────────────

let noCount      = 0;
let runawayMode  = false;
let musicPlaying = false;

const yesBtn = document.getElementById("yes-btn");
const noBtn  = document.getElementById("no-btn");
const toast  = document.getElementById("toast");
const gifEl  = document.getElementById("character-gif");
const music  = document.getElementById("bg-music");

// ── Init ─────────────────────────────────────────────────────────────────────
(function init() {
  gifEl.src         = GIFS[0];
  noBtn.textContent = NO_BUTTON_LABEL;   // set button label once, never touch it again
  music.volume      = 0.3;              // CHANGE THIS: volume 0.0 – 1.0

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
// Always navigates straight to yes.html — no tease gate.
function handleYes() {
  window.location.href = "yes.html";
}

// ── No handler ────────────────────────────────────────────────────────────────
function handleNo() {
  noCount++;

  // 1. Red button text: NEVER changes — it always shows NO_BUTTON_LABEL ("No").
  //    The guilt-trip lines live only in the toast bubble below, not the button.

  // 2. Grow Yes button (35% per click, hard cap at 54px font-size)
  const curYesFS  = parseFloat(getComputedStyle(yesBtn).fontSize);
  const newYesFS  = Math.min(curYesFS * 1.35, 54);
  const newYesPadV = Math.min(16 + noCount * 4, 36);
  const newYesPadH = Math.min(40 + noCount * 8, 80);
  yesBtn.style.fontSize = newYesFS + "px";
  yesBtn.style.padding  = newYesPadV + "px " + newYesPadH + "px";

  // 3. Shrink No button after 2nd click (floors so it stays tap-able)
  if (noCount >= 2) {
    const curNoFS   = parseFloat(getComputedStyle(noBtn).fontSize);
    const newNoFS   = Math.max(curNoFS * 0.88, 10);
    const newNoPadV = Math.max(12 - (noCount - 2) * 1.5, 5);
    const newNoPadH = Math.max(28 - (noCount - 2) * 3,   10);
    noBtn.style.fontSize = newNoFS + "px";
    noBtn.style.padding  = newNoPadV + "px " + newNoPadH + "px";
  }

  // 4. Swap GIF to next sadder stage (with fade)
  swapGif(GIFS[Math.min(noCount, GIFS.length - 1)]);

  // 5. Show guilt-trip toast (index starts at 0 on first click)
  const msg = NO_TOASTS[Math.min(noCount - 1, NO_TOASTS.length - 1)];
  if (msg) showToast(msg, 3000);

  // 6. Enable runaway mode after RUNAWAY_AFTER_CLICKS clicks
  if (noCount >= RUNAWAY_AFTER_CLICKS && !runawayMode) {
    enableRunawayMode();
  }
}

// ── GIF swap with opacity fade ────────────────────────────────────────────────
function swapGif(newSrc) {
  gifEl.classList.add("fading");
  setTimeout(() => {
    gifEl.src = newSrc;
    gifEl.classList.remove("fading");
  }, 400);
}

// ── Toast display ─────────────────────────────────────────────────────────────
let toastTimer = null;
function showToast(msg, duration) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), duration || 3000);
}

// ── Runaway mode ──────────────────────────────────────────────────────────────
// The button jumps whenever the cursor comes within ESCAPE_RADIUS px of it.
// We listen on document so the button escapes BEFORE the pointer reaches it.

const ESCAPE_RADIUS = 90; // CHANGE THIS: px proximity that triggers escape jump

function enableRunawayMode() {
  runawayMode = true;
  noBtn.classList.add("runaway");
  noBtn.removeAttribute("onclick");              // remove inline handler
  noBtn.addEventListener("click", moveNoBtnRandom);  // click still jumps it

  document.addEventListener("mousemove", handleProximity);
  document.addEventListener("touchmove", handleTouchProximity, { passive: true });

  moveNoBtnRandom();  // jump immediately
  showToast("Catch me if you can! 😜", 3500);
}

function handleProximity(e) {
  if (!runawayMode) return;
  const r    = noBtn.getBoundingClientRect();
  const cx   = r.left + r.width  / 2;
  const cy   = r.top  + r.height / 2;
  const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
  if (dist < ESCAPE_RADIUS) moveNoBtnRandom();
}

function handleTouchProximity(e) {
  if (!runawayMode || !e.touches.length) return;
  handleProximity({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
}

function moveNoBtnRandom() {
  if (!runawayMode) return;
  const btnW = noBtn.offsetWidth  || 80;
  const btnH = noBtn.offsetHeight || 40;
  const maxX = window.innerWidth  - btnW - 16;
  const maxY = window.innerHeight - btnH - 16;
  noBtn.style.left = Math.max(8, Math.floor(Math.random() * maxX)) + "px";
  noBtn.style.top  = Math.max(8, Math.floor(Math.random() * maxY)) + "px";
}

window.addEventListener("resize", () => { if (runawayMode) moveNoBtnRandom(); });

// ── Music toggle ──────────────────────────────────────────────────────────────
function toggleMusic() {
  const btn = document.getElementById("music-toggle");
  if (musicPlaying) {
    music.pause(); musicPlaying = false; btn.textContent = "🔇";
  } else {
    music.play();  musicPlaying = true;  btn.textContent = "🔊";
  }
}

// ── Floating hearts ───────────────────────────────────────────────────────────
// CHANGE THIS: emoji hearts to randomly pick from
const HEART_CHARS = ["💕","💖","💗","💓","💘","🩷","❤️","💝"];

function spawnHearts() {
  const container  = document.getElementById("hearts-container");
  const HEART_COUNT = 22; // CHANGE THIS: total floating hearts on screen

  for (let i = 0; i < HEART_COUNT; i++) {
    const h       = document.createElement("span");
    h.className   = "heart";
    h.textContent = HEART_CHARS[Math.floor(Math.random() * HEART_CHARS.length)];
    h.style.left  = Math.random() * 100 + "vw";
    h.style.fontSize         = (0.9 + Math.random() * 1.2) + "rem";
    h.style.opacity          = "0";
    h.style.animationDuration = (7  + Math.random() * 10) + "s";
    h.style.animationDelay    = (Math.random() * 12) + "s";
    container.appendChild(h);
  }
}
