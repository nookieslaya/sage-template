const DEFAULTS = {
  palette: ['#f967fb', '#53bc28', '#6958d5'],
  glowPalette: ['#ff5adf', '#7eff52', '#7a66ff'],
  trailsPerColor: 2,
  segmentCount: 24,
  followStrength: 0.085,
  wobbleAmplitude: 54,
  wobbleSpeed: 0.0012,
  fadeAlpha: 0.14,
  lineWidth: 2.2,
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const createPoint = (x, y) => ({ x, y });

const createTrail = (x, y, count) => new Array(count).fill(0).map(() => createPoint(x, y));

const hexAlpha = (hex, alphaHex) => `${hex}${alphaHex}`;

class OrganicTubes {
  constructor(canvas, options = {}) {
    if (!canvas || !canvas.getContext) {
      throw new Error('OrganicTubes requires a canvas element');
    }

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) {
      throw new Error('Unable to get 2D context for OrganicTubes');
    }

    this.options = { ...DEFAULTS, ...options };
    this.pointer = { x: 0.5, y: 0.5 };
    this.target = { x: 0.5, y: 0.5 };
    this.lastPointerMs = 0;
    this.frameId = 0;
    this.time0 = performance.now();
    this.width = 1;
    this.height = 1;

    this.trails = [];
    this.handlePointerMove = this.onPointerMove.bind(this);
    this.handleTouchMove = this.onTouchMove.bind(this);
    this.handleResize = this.resize.bind(this);

    this.buildTrails();
    this.bind();
    this.resize();
    this.animate = this.animate.bind(this);
    this.frameId = requestAnimationFrame(this.animate);
  }

  buildTrails() {
    this.trails = [];
    const baseX = this.width * 0.5;
    const baseY = this.height * 0.5;
    const count = Math.max(1, this.options.trailsPerColor);

    this.options.palette.forEach((color, colorIndex) => {
      for (let i = 0; i < count; i += 1) {
        this.trails.push({
          color,
          glow: this.options.glowPalette[colorIndex % this.options.glowPalette.length] || color,
          width: this.options.lineWidth + (i % 2 === 0 ? 0.6 : 0),
          phase: colorIndex * 1.4 + i * 0.75,
          speed: this.options.followStrength * (1 - i * 0.08),
          wobble: this.options.wobbleAmplitude * (1 + i * 0.08),
          points: createTrail(baseX, baseY, this.options.segmentCount),
          x: baseX,
          y: baseY,
        });
      }
    });
  }

  bind() {
    this.canvas.addEventListener('pointermove', this.handlePointerMove, { passive: true });
    this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: true });
    window.addEventListener('resize', this.handleResize);
  }

  unbind() {
    this.canvas.removeEventListener('pointermove', this.handlePointerMove);
    this.canvas.removeEventListener('touchmove', this.handleTouchMove);
    window.removeEventListener('resize', this.handleResize);
  }

  onPointerMove(event) {
    const rect = this.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    this.target.x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    this.target.y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
    this.lastPointerMs = performance.now();
  }

  onTouchMove(event) {
    if (!event.touches.length) return;
    this.onPointerMove(event.touches[0]);
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = Math.max(1, Math.round(rect.width || window.innerWidth));
    this.height = Math.max(1, Math.round(rect.height || window.innerHeight));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = Math.floor(this.width * dpr);
    this.canvas.height = Math.floor(this.height * dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.buildTrails();
  }

  getIdleTarget(ms) {
    return {
      x: 0.5 + Math.sin(ms * 0.00037) * 0.16,
      y: 0.5 + Math.cos(ms * 0.00029) * 0.12,
    };
  }

  updateTrails(ms, deltaScale) {
    const idleMs = ms - this.lastPointerMs;
    if (idleMs > 120) {
      const idle = this.getIdleTarget(ms);
      this.target.x = idle.x;
      this.target.y = idle.y;
    }

    this.pointer.x += (this.target.x - this.pointer.x) * 0.13 * deltaScale;
    this.pointer.y += (this.target.y - this.pointer.y) * 0.13 * deltaScale;

    const baseX = this.pointer.x * this.width;
    const baseY = this.pointer.y * this.height;

    this.trails.forEach((trail) => {
      const driftX = Math.sin(ms * this.options.wobbleSpeed + trail.phase) * trail.wobble;
      const driftY = Math.cos(ms * (this.options.wobbleSpeed * 0.85) + trail.phase * 1.1) * trail.wobble * 0.78;
      const targetX = baseX + driftX;
      const targetY = baseY + driftY;

      trail.x += (targetX - trail.x) * trail.speed * deltaScale;
      trail.y += (targetY - trail.y) * trail.speed * deltaScale;
      trail.points.unshift(createPoint(trail.x, trail.y));
      trail.points.pop();
    });
  }

  drawAmbientGlow(ms) {
    this.ctx.globalCompositeOperation = 'lighter';
    const gx = this.pointer.x * this.width;
    const gy = this.pointer.y * this.height;

    this.options.glowPalette.forEach((color, index) => {
      const angle = ms * 0.0004 + index * 2.1;
      const radius = 74 + index * 20;
      const px = gx + Math.cos(angle) * radius;
      const py = gy + Math.sin(angle * 1.2) * (radius * 0.68);
      const gradient = this.ctx.createRadialGradient(px, py, 0, px, py, 160 + index * 12);
      gradient.addColorStop(0, hexAlpha(color, '4A'));
      gradient.addColorStop(0.5, hexAlpha(color, '18'));
      gradient.addColorStop(1, hexAlpha(color, '00'));
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.width, this.height);
    });
  }

  drawTrail(trail) {
    const points = trail.points;
    const gradient = this.ctx.createLinearGradient(0, 0, this.width, this.height);
    gradient.addColorStop(0, hexAlpha(trail.color, '00'));
    gradient.addColorStop(0.35, hexAlpha(trail.color, '88'));
    gradient.addColorStop(0.72, hexAlpha(trail.color, '55'));
    gradient.addColorStop(1, hexAlpha(trail.color, '00'));

    this.ctx.beginPath();
    for (let i = 0; i < points.length; i += 1) {
      const point = points[i];
      if (i === 0) {
        this.ctx.moveTo(point.x, point.y);
      } else {
        const prev = points[i - 1];
        const cx = (prev.x + point.x) * 0.5;
        const cy = (prev.y + point.y) * 0.5;
        this.ctx.quadraticCurveTo(prev.x, prev.y, cx, cy);
      }
    }

    this.ctx.strokeStyle = gradient;
    this.ctx.lineWidth = trail.width;
    this.ctx.shadowColor = trail.glow;
    this.ctx.shadowBlur = 19;
    this.ctx.stroke();
  }

  animate(ms) {
    const elapsed = ms - this.time0;
    const delta = this.prevMs ? Math.min(ms - this.prevMs, 50) : 16.67;
    this.prevMs = ms;
    const deltaScale = delta / 16.67;

    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.fillStyle = `rgba(4, 6, 15, ${this.options.fadeAlpha})`;
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.updateTrails(elapsed, deltaScale);
    this.drawAmbientGlow(elapsed);
    this.trails.forEach((trail) => this.drawTrail(trail));
    this.ctx.globalCompositeOperation = 'source-over';

    this.frameId = requestAnimationFrame(this.animate);
  }

  destroy() {
    if (this.frameId) cancelAnimationFrame(this.frameId);
    this.unbind();
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
}

const createOrganicTubes = (canvas, options = {}) => new OrganicTubes(canvas, options);

export default createOrganicTubes;
