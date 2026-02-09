// Reveal plugin entrypoint 
const Chrono = {
  id: "Chrono",

  init: function (deck) {
    function initAllIn(slide) {
      // initialise seulement les chronos présents dans la slide (ou tout le doc si tu préfères)
      (slide || document).querySelectorAll(".chrono").forEach((root) => {
        // éviter double init
        if (root.__chrono_inited) return;
        root.__chrono_inited = true;

        chrono(root); // <- ta fonction existante
      });
    }

    // init au démarrage
    deck.on("ready", (e) => {
      initAllIn(e.currentSlide);
    });

    // init quand on arrive sur une slide qui contient un chrono
    deck.on("slidechanged", (e) => {
      initAllIn(e.currentSlide);
    });
  },
};

function chrono(root) {
  // parameters
  //-----------------
  const canvas = root.querySelector('.chrono_canvas');
  const ctx = canvas.getContext('2d');

  const button_play = root.querySelector('.chrono_play');
  const button_reset = root.querySelector('.chrono_reset');
  const input_min = root.querySelector('.chrono_min');
  const input_sec = root.querySelector('.chrono_sec');

  let durationMs = Number(input_min.value) * 60 * 1000 + Number(input_sec.value) * 1000;
  let elapsedMs = 0;
  let running = false;
  let lastT = performance.now();

  // utils
  //-----------------
  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }
  function fmt(ms) {
    const s = Math.ceil(ms / 1000);
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }
  function get_center(){
    //-----------------

    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const cx = w * 0.5;
    const cy = h * 0.5;
    const r = Math.min(w, h) * 0.32;

    //-----------------
    return { cx, cy, r };
  }
  function compute_duration() {
    //-----------------

    // minutes: 0+
    let min = Math.max(0, Math.floor(Number(input_min.value) || 0));

    // secondes: 0..59
    let sec = Math.floor(Number(input_sec.value) || 0);
    sec = Math.min(59, Math.max(0, sec));

    // interdit 0:00
    if (min === 0 && sec === 0) sec = 1;

    input_min.value = String(min);
    input_sec.value = String(sec);

    durationMs = min * 60 * 1000 + sec * 1000;
    elapsedMs = clamp(elapsedMs, 0, durationMs);

    //-----------------
  }

  // Fonction
  //-----------------
  function reset(){
    //-----------------

    elapsedMs = 0;
    running = false;
    button_play.textContent = '▶';
    lastT = performance.now();

    //-----------------
  }
  function draw(progress) {
    //-----------------

    const { cx, cy, r } = get_center();
    draw_circle(cx, cy, r, progress);
    draw_bar(cx, cy, r, progress);
    draw_text(cx, cy, r);

    //-----------------
  }
  function draw_circle(cx, cy, r, progress){
    //-----------------

    // Cercle fond
    ctx.lineWidth = 25;
    ctx.strokeStyle = 'rgba(255,255,255)';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Cercle progression
    const start = -Math.PI / 2;
    const end = start + Math.PI * 2 * progress;
    ctx.strokeStyle = 'rgba(62,138,152)';
    ctx.lineCap = 'butt';
    ctx.beginPath();
    ctx.arc(cx, cy, r, start, end);
    ctx.stroke();

    //-----------------
  }
  function draw_bar(cx, cy, r, progress){
    //-----------------

    // Barre/aiguille centrale (verticale + rotation comme une montre)
    const angle = (Math.PI * 2 * progress); // départ en haut

    const handThickness = 10;      // épaisseur de l'aiguille
    const handLength = r * 0.80;   // longueur (un peu moins que le rayon)

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // Rectangle vertical : base au centre, pointe vers le haut (coins carrés)
    ctx.fillStyle = 'rgba(255,255,255, 0.8)';
    ctx.fillRect(-handThickness / 2, -handLength, handThickness, handLength);

    ctx.restore();

    //-----------------
  }
  function draw_text(cx, cy, r){
    //-----------------

    const remaining = clamp(durationMs - elapsedMs, 0, durationMs);

    ctx.fillStyle = "white";
    ctx.font = "bold 48px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(fmt(remaining), cx, cy + r + 75);

    //-----------------
  }
  function tick(now) {
    //-----------------

    const dt = now - lastT;
    lastT = now;

    if (running) {
      elapsedMs += dt;
      if (elapsedMs >= durationMs) {
        elapsedMs = durationMs;
        running = false;
        button_play.textContent = '▶';
      }
    }

    const progress = durationMs > 0 ? clamp(elapsedMs / durationMs, 0, 1) : 0;
    draw(progress);

    requestAnimationFrame(tick);

    //-----------------
  }

  // Events listeners
  //-----------------
  button_play.addEventListener('click', () => {
    //-----------------

    running = !running;
    button_play.textContent = running ? '⏸' : '▶';
    lastT = performance.now();

    //-----------------
  });
  button_reset.addEventListener('click', reset);
  input_min.addEventListener('change', () => {
    //-----------------

    reset();
    compute_duration();

    //-----------------
  });
  input_sec.addEventListener('change', () => {
    //-----------------

    reset();
    compute_duration();

    //-----------------
  });
  requestAnimationFrame((t) => {
    //-----------------

    lastT = t;
    requestAnimationFrame(tick);

    //-----------------
  });
}
