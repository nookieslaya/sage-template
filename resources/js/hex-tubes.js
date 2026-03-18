const DEFAULTS = {
  colors: ['#f967fb', '#53bc28', '#6958d5'],
  lights: {
    intensity: 200,
    colors: ['#83f36e', '#fe8a2e', '#ff008a', '#60aed5'],
  },
  fadeAlpha: 0.14,
  blobScale: 0.62,
  hexSize: 14,
  chainCount: 3,
  chainLength: 28,
  pointStep: 3,
  orbitRadius: 78,
  gridHexSize: 32,
  gridBaseAlpha: 0,
  gridGlowAlpha: 0.5,
  gridDecay: 0.92,
  gridInfluenceRadius: 68,
  gridPointStep: 2,
  follow: 0.09,
  wobble: 40,
  sleepRadiusX: 300,
  sleepRadiusY: 150,
  sleepTimeScale1: 1,
  sleepTimeScale2: 2,
};

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const hexPath = (ctx, x, y, r, rot = 0) => {
  ctx.beginPath();
  for (let i = 0; i < 6; i += 1) {
    const a = rot + (Math.PI / 3) * i;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
};

class HexTubes {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) throw new Error('2D context unavailable for HexTubes');

    this.options = {
      ...DEFAULTS,
      ...options,
      lights: { ...DEFAULTS.lights, ...(options.lights || {}) },
    };
    this.interactionTarget =
      this.options.interactionTarget ||
      this.canvas.parentElement ||
      this.canvas;

    this.pointer = { x: 0.5, y: 0.5 };
    this.target = { x: 0.5, y: 0.5 };
    this.w = 1;
    this.h = 1;
    this.raf = 0;
    this.start = performance.now();
    this.last = this.start;
    this.hovering = false;
    this.gridCells = [];

    this.handlePointerMove = this.onPointerMove.bind(this);
    this.handleTouchMove = this.onTouchMove.bind(this);
    this.handlePointerLeave = this.onPointerLeave.bind(this);
    this.handleResize = this.resize.bind(this);
    this.animate = this.animate.bind(this);

    this.chains = this.createChains();
    this.bind();
    this.resize();
    this.raf = requestAnimationFrame(this.animate);
  }

  createChains() {
    const chains = [];
    for (let i = 0; i < this.options.chainCount; i += 1) {
      chains.push({
        color: this.options.colors[i % this.options.colors.length],
        phase: i * 1.8,
        speed: this.options.follow * (1 - i * 0.1),
        hoverSpeed: this.options.follow * (1.55 - i * 0.12),
        wobble: this.options.wobble * (1 - i * 0.08),
        orbit: this.options.orbitRadius * (0.82 + i * 0.12),
        x: this.w * 0.5,
        y: this.h * 0.5,
        points: new Array(this.options.chainLength)
          .fill(0)
          .map(() => ({ x: this.w * 0.5, y: this.h * 0.5 })),
      });
    }
    return chains;
  }

  bind() {
    this.interactionTarget.addEventListener(
      'pointermove',
      this.handlePointerMove,
      { passive: true },
    );
    this.interactionTarget.addEventListener(
      'pointerleave',
      this.handlePointerLeave,
      { passive: true },
    );
    this.interactionTarget.addEventListener('touchmove', this.handleTouchMove, {
      passive: true,
    });
    window.addEventListener('resize', this.handleResize);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.interactionTarget.removeEventListener(
      'pointermove',
      this.handlePointerMove,
    );
    this.interactionTarget.removeEventListener(
      'pointerleave',
      this.handlePointerLeave,
    );
    this.interactionTarget.removeEventListener(
      'touchmove',
      this.handleTouchMove,
    );
    window.removeEventListener('resize', this.handleResize);
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.w = Math.max(1, Math.round(rect.width || window.innerWidth));
    this.h = Math.max(1, Math.round(rect.height || window.innerHeight));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(this.w * dpr);
    this.canvas.height = Math.floor(this.h * dpr);
    this.canvas.style.width = `${this.w}px`;
    this.canvas.style.height = `${this.h}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.buildGrid();
  }

  buildGrid() {
    const size = this.options.gridHexSize;
    const hexW = Math.sqrt(3) * size;
    const hexH = size * 2;
    const rowStep = size * 1.5;
    const colStep = hexW;
    const cols = Math.ceil(this.w / colStep) + 2;
    const rows = Math.ceil(this.h / rowStep) + 2;

    this.gridCells = [];
    for (let row = 0; row < rows; row += 1) {
      const y = row * rowStep;
      const offsetX = row % 2 === 0 ? colStep * 0.5 : colStep;
      for (let col = 0; col < cols; col += 1) {
        const x = offsetX + col * colStep;
        if (x < -hexW || x > this.w + hexW || y < -hexH || y > this.h + hexH) {
          continue;
        }
        this.gridCells.push({
          x,
          y,
          energy: 0,
        });
      }
    }
  }

  onPointerMove(event) {
    const rect = this.interactionTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    this.target.x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    this.target.y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
    this.hovering = true;
  }

  onTouchMove(event) {
    if (event.touches.length > 0) {
      this.onPointerMove(event.touches[0]);
    }
  }

  onPointerLeave() {
    this.hovering = false;
  }

  drawLights(timeMs) {
    const ox = this.pointer.x * this.w;
    const oy = this.pointer.y * this.h;
    const colors = this.options.lights.colors;
    const intensity =
      (this.options.lights.intensity / 200) * this.options.blobScale;
    this.ctx.globalCompositeOperation = 'lighter';

    colors.forEach((color, i) => {
      const a = timeMs * 0.0006 + i * 1.35;
      const r = (46 + i * 11) * this.options.blobScale;
      const x = ox + Math.cos(a) * r;
      const y = oy + Math.sin(a * 1.12) * (r * 0.68);
      const g = this.ctx.createRadialGradient(x, y, 0, x, y, 132 * intensity);
      g.addColorStop(0, `${color}66`);
      g.addColorStop(0.5, `${color}26`);
      g.addColorStop(1, `${color}00`);
      this.ctx.fillStyle = g;
      this.ctx.fillRect(0, 0, this.w, this.h);
    });
  }

  updateGridEnergy() {
    const influenceR2 = this.options.gridInfluenceRadius * this.options.gridInfluenceRadius;
    this.gridCells.forEach((cell) => {
      cell.energy *= this.options.gridDecay;
    });

    this.chains.forEach((chain) => {
      for (let i = 0; i < chain.points.length; i += this.options.gridPointStep) {
        const p = chain.points[i];
        this.gridCells.forEach((cell) => {
          const dx = p.x - cell.x;
          const dy = p.y - cell.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < influenceR2) {
            const strength = 1 - d2 / influenceR2;
            cell.energy = Math.max(cell.energy, strength * 0.9);
          }
        });
      }
    });
  }

  drawGrid() {
    const size = this.options.gridHexSize;
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.shadowBlur = 0;

    this.gridCells.forEach((cell) => {
      const gradMix = ((cell.x / Math.max(this.w, 1)) + (cell.y / Math.max(this.h, 1))) * 0.5;
      const baseAlpha = this.options.gridBaseAlpha * (0.35 + gradMix * 0.3);
      this.ctx.strokeStyle = `rgba(170, 186, 220, ${baseAlpha})`;
      this.ctx.lineWidth = 0.6;
      hexPath(this.ctx, cell.x, cell.y, size, Math.PI / 6);
      this.ctx.stroke();

      if (cell.energy > 0.012) {
        const alpha = this.options.gridGlowAlpha * cell.energy;
        this.ctx.strokeStyle = `rgba(170, 196, 255, ${alpha})`;
        this.ctx.lineWidth = 1.05;
        hexPath(this.ctx, cell.x, cell.y, size + 0.4, Math.PI / 6);
        this.ctx.stroke();
      }
    });
  }

  drawChain(chain, timeMs, dtScale) {
    const tx = this.pointer.x * this.w;
    const ty = this.pointer.y * this.h;
    const idleMix = this.hovering ? 0.14 : 1;
    const orbitX =
      Math.cos(timeMs * 0.00055 + chain.phase * 1.3) * chain.orbit * idleMix;
    const orbitY =
      Math.sin(timeMs * 0.00045 + chain.phase * 1.1) *
      (chain.orbit * 0.62) *
      idleMix;
    const dx = Math.sin(timeMs * 0.0013 + chain.phase) * chain.wobble * idleMix;
    const dy =
      Math.cos(timeMs * 0.001 + chain.phase * 1.15) *
      (chain.wobble * 0.78) *
      idleMix;

    const speed = this.hovering ? chain.hoverSpeed : chain.speed;
    chain.x += (tx + orbitX + dx - chain.x) * speed * dtScale;
    chain.y += (ty + orbitY + dy - chain.y) * speed * dtScale;
    chain.points.unshift({ x: chain.x, y: chain.y });
    chain.points.pop();

    this.ctx.strokeStyle = `${chain.color}C0`;
    this.ctx.fillStyle = `${chain.color}3E`;
    this.ctx.shadowColor = chain.color;
    this.ctx.shadowBlur = 4;

    for (let i = 0; i < chain.points.length; i += this.options.pointStep) {
      const p = chain.points[i];
      const t = 1 - i / chain.points.length;
      const size = this.options.hexSize * (0.35 + t * 0.9);
      const rot = timeMs * 0.001 + i * 0.09 + chain.phase;
      this.ctx.lineWidth = Math.max(0.8, t * 1.5);
      hexPath(this.ctx, p.x, p.y, size, rot);
      this.ctx.stroke();
      if (i % 2 === 0) {
        this.ctx.globalAlpha = 0.28 * t;
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
      }
    }
  }

  animate(ms) {
    const elapsed = ms - this.start;
    const dt = Math.min(48, ms - this.last || 16.67);
    this.last = ms;
    const dtScale = dt / 16.67;

    if (!this.hovering) {
      this.target.x =
        0.5 +
        Math.cos(elapsed * 0.00045 * this.options.sleepTimeScale1) *
          (this.options.sleepRadiusX / this.w);
      this.target.y =
        0.5 +
        Math.sin(elapsed * 0.00035 * this.options.sleepTimeScale2) *
          (this.options.sleepRadiusY / this.h);
    }

    this.pointer.x += (this.target.x - this.pointer.x) * 0.1 * dtScale;
    this.pointer.y += (this.target.y - this.pointer.y) * 0.1 * dtScale;

    // Clean frame every tick to avoid persistent trails / background brightening.
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.fillStyle = '#04060f';
    this.ctx.fillRect(0, 0, this.w, this.h);

    this.updateGridEnergy();
    this.drawGrid();
    this.drawLights(elapsed);
    this.chains.forEach((chain) => this.drawChain(chain, elapsed, dtScale));
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.shadowBlur = 0;

    this.raf = requestAnimationFrame(this.animate);
  }
}

const createHexTubes = (canvas, options = {}) => {
  const app = new HexTubes(canvas, options);
  return {
    dispose: () => app.destroy(),
  };
};

export default createHexTubes;
