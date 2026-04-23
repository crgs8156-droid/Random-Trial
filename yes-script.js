/* =====================================================
   CELEBRATION PAGE — yes-script.js
   Renders a canvas-based confetti + hearts shower
   ===================================================== */

// CHANGE THIS: confetti colours
const CONFETTI_COLORS = [
  "#FF6B8A", "#FFB3C1", "#FF4D6D",
  "#FF9EBB", "#FFC2D0", "#FF3366",
  "#fff",    "#FFE4E8",
];

// CHANGE THIS: mix of confetti shapes (emojis rendered as text)
const SHAPES = ["❤️", "💕", "💖", "✨", "🌸", "⭐", "💗"];

const canvas  = document.getElementById("confetti-canvas");
const ctx     = canvas.getContext("2d");
let particles = [];
let raf;

function resize() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

// ── Particle factory ──────────────────────────────────────────────────────────
function makeParticle() {
  const useEmoji = Math.random() < 0.45;
  return {
    x:      Math.random() * canvas.width,
    y:      -20,
    vx:     (Math.random() - 0.5) * 2.4,
    vy:     1.5 + Math.random() * 3.5,
    angle:  Math.random() * Math.PI * 2,
    spin:   (Math.random() - 0.5) * 0.18,
    size:   useEmoji ? 18 + Math.random() * 14
                     : 7  + Math.random() * 10,
    color:  CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    shape:  useEmoji ? SHAPES[Math.floor(Math.random() * SHAPES.length)] : "rect",
    alpha:  1,
    decay:  0.0025 + Math.random() * 0.004,
    wobble: Math.random() * Math.PI * 2,
    wobbleSpeed: 0.05 + Math.random() * 0.08,
  };
}

// ── Spawn burst then trickle ──────────────────────────────────────────────────
// Initial burst
for (let i = 0; i < 120; i++) {
  const p = makeParticle();
  p.y  = Math.random() * canvas.height * 0.5; // spread vertically for instant fill
  p.vy = 1 + Math.random() * 3;
  particles.push(p);
}

// Continuous trickle
let trickleInterval = setInterval(() => {
  for (let i = 0; i < 4; i++) particles.push(makeParticle());
}, 120); // CHANGE THIS: ms between new particle spawns

// ── Render loop ───────────────────────────────────────────────────────────────
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);

    if (p.shape === "rect") {
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    } else {
      // Emoji confetti
      ctx.font = `${p.size}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(p.shape, 0, 0);
    }

    ctx.restore();

    // Update
    p.wobble += p.wobbleSpeed;
    p.vx     += Math.sin(p.wobble) * 0.08;
    p.x      += p.vx;
    p.y      += p.vy;
    p.angle  += p.spin;
    p.alpha  -= p.decay;
  });

  // Cull off-screen or transparent particles
  particles = particles.filter(p =>
    p.alpha > 0.01 && p.y < canvas.height + 40
  );

  raf = requestAnimationFrame(draw);
}

draw();

// Stop trickle after 12 s, let existing ones fall out
setTimeout(() => {
  clearInterval(trickleInterval);
  // Let the animation run until canvas is empty, then cancel
  function checkEmpty() {
    if (particles.length === 0) cancelAnimationFrame(raf);
    else requestAnimationFrame(checkEmpty);
  }
  checkEmpty();
}, 12000); // CHANGE THIS: ms to keep spawning new particles

// ── Music volume ──────────────────────────────────────────────────────────────
const yesMu = document.getElementById("yes-music");
if (yesMu) {
  yesMu.volume = 0.35; // CHANGE THIS: celebration music volume
  yesMu.play().catch(() => {}); // browsers may block; that's okay
}
