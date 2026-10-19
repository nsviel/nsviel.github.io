const canvas = document.getElementById("canv");
const ctx = canvas.getContext("2d");

let w, h, cols, ypos;

function resizeCanvas() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
  cols = Math.floor(w / 20) + 1;
  ypos = Array(cols).fill(0);
}

function matrix() {
  ctx.fillStyle = "#0001";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "rgba(0, 255, 140, 0.6)";
  ctx.font = "15pt monospace";

  ypos.forEach((y, ind) => {
    const text = String.fromCharCode(Math.floor(Math.random() * 128));
    const x = ind * 20;
    ctx.fillText(text, x, y);

    if (y > 100 + Math.random() * 10000) {
      ypos[ind] = 0;
    } else {
      ypos[ind] = y + 20;
    }
  });
}
 
resizeCanvas();
ctx.fillStyle = "#000";
ctx.fillRect(0, 0, w, h);

window.addEventListener("resize", resizeCanvas);
setInterval(matrix, 100);
