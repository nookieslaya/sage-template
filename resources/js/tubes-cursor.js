/*
 * TWST Tubes Cursor (clean-room implementation)
 * Standalone file: no external dependencies.
 * API inspired by common tubes cursor demos.
 */

(function (globalFactory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = globalFactory();
  } else if (typeof define === 'function' && define.amd) {
    define([], globalFactory);
  } else {
    var api = globalFactory();
    window.TubesCursor = api;
  }
})(function () {
  var DEFAULTS = {
    tubes: {
      colors: ['#f967fb', '#53bc28', '#6958d5'],
      count: 3,
      width: 3,
      trailLength: 40,
      follow: 0.085,
      wobble: 64,
      speed: 0.06,
      lights: {
        intensity: 180,
        colors: ['#83f36e', '#fe8a2e', '#ff008a', '#60aed5'],
      },
    },
    fadeAlpha: 0.16,
    autoplay: true,
    dprMax: 2,
    idleMotion: true,
  };

  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  function merge(target, source) {
    if (!source || typeof source !== 'object') return target;
    Object.keys(source).forEach(function (key) {
      var value = source[key];
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if (!target[key] || typeof target[key] !== 'object') {
          target[key] = {};
        }
        merge(target[key], value);
      } else {
        target[key] = value;
      }
    });
    return target;
  }

  function copy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function createTrail(x, y, len) {
    var out = [];
    for (var i = 0; i < len; i += 1) out.push({ x: x, y: y });
    return out;
  }

  function TubesCursor(canvas, options) {
    if (!canvas || !canvas.getContext) {
      throw new Error('TubesCursor: canvas element is required.');
    }

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) {
      throw new Error('TubesCursor: 2d context unavailable.');
    }

    this.options = merge(copy(DEFAULTS), options || {});
    this.pointer = { x: 0.5, y: 0.5 };
    this.target = { x: 0.5, y: 0.5 };
    this.inside = false;
    this.raf = 0;
    this.lastTime = 0;
    this.running = false;

    this.width = 1;
    this.height = 1;
    this.dpr = 1;

    this._onPointerMove = this.onPointerMove.bind(this);
    this._onPointerLeave = this.onPointerLeave.bind(this);
    this._onResize = this.resize.bind(this);

    this.initTubes();
    this.bind();
    this.resize();

    if (this.options.autoplay !== false) {
      this.play();
    }
  }

  TubesCursor.prototype.initTubes = function () {
    var opts = this.options.tubes;
    var colors = Array.isArray(opts.colors) && opts.colors.length
      ? opts.colors.slice(0)
      : DEFAULTS.tubes.colors.slice(0);

    this.tubes = [];
    for (var i = 0; i < (opts.count || colors.length || 3); i += 1) {
      var color = colors[i % colors.length];
      this.tubes.push({
        color: color,
        width: (opts.width || 3) * (0.8 + (i % 3) * 0.18),
        phase: i * 1.35,
        speed: (opts.speed || 0.06) * (1 - i * 0.06),
        wobble: (opts.wobble || 64) * (0.86 + (i % 2) * 0.18),
        x: this.width * 0.5,
        y: this.height * 0.5,
        trail: createTrail(this.width * 0.5, this.height * 0.5, opts.trailLength || 40),
      });
    }
  };

  TubesCursor.prototype.bind = function () {
    var owner = this.canvas;
    owner.addEventListener('pointermove', this._onPointerMove, { passive: true });
    owner.addEventListener('pointerenter', this._onPointerMove, { passive: true });
    owner.addEventListener('pointerleave', this._onPointerLeave, { passive: true });
    window.addEventListener('resize', this._onResize);
  };

  TubesCursor.prototype.unbind = function () {
    var owner = this.canvas;
    owner.removeEventListener('pointermove', this._onPointerMove);
    owner.removeEventListener('pointerenter', this._onPointerMove);
    owner.removeEventListener('pointerleave', this._onPointerLeave);
    window.removeEventListener('resize', this._onResize);
  };

  TubesCursor.prototype.onPointerMove = function (event) {
    var rect = this.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    this.target.x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    this.target.y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
    this.inside = true;
  };

  TubesCursor.prototype.onPointerLeave = function () {
    this.inside = false;
  };

  TubesCursor.prototype.resize = function () {
    var rect = this.canvas.getBoundingClientRect();
    this.width = Math.max(1, Math.round(rect.width || this.canvas.clientWidth || window.innerWidth));
    this.height = Math.max(1, Math.round(rect.height || this.canvas.clientHeight || window.innerHeight));
    this.dpr = Math.min(window.devicePixelRatio || 1, this.options.dprMax || 2);

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    var trailLength = this.options.tubes.trailLength || 40;
    for (var i = 0; i < this.tubes.length; i += 1) {
      var tube = this.tubes[i];
      if (tube.x <= 1 && tube.y <= 1) {
        tube.x = this.width * 0.5;
        tube.y = this.height * 0.5;
      }
      tube.trail = createTrail(tube.x, tube.y, trailLength);
    }
  };

  TubesCursor.prototype.drawLights = function (time) {
    var colors = this.options.tubes.lights.colors || DEFAULTS.tubes.lights.colors;
    var intensity = clamp((this.options.tubes.lights.intensity || 180) / 200, 0.2, 2.5);
    var ox = this.pointer.x * this.width;
    var oy = this.pointer.y * this.height;

    for (var i = 0; i < colors.length; i += 1) {
      var a = time * 0.00065 + i * 1.4;
      var r = 56 + i * 14;
      var x = ox + Math.cos(a) * r;
      var y = oy + Math.sin(a * 1.2) * r * 0.72;
      var grad = this.ctx.createRadialGradient(x, y, 0, x, y, 170 * intensity);
      grad.addColorStop(0, colors[i] + '66');
      grad.addColorStop(0.5, colors[i] + '22');
      grad.addColorStop(1, colors[i] + '00');
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, 0, this.width, this.height);
    }
  };

  TubesCursor.prototype.drawTube = function (tube, time, deltaScale) {
    var tx = this.pointer.x * this.width;
    var ty = this.pointer.y * this.height;
    var driftX = Math.sin(time * 0.0014 + tube.phase) * tube.wobble;
    var driftY = Math.cos(time * 0.0012 + tube.phase * 1.18) * (tube.wobble * 0.82);

    tube.x += (tx + driftX - tube.x) * tube.speed * deltaScale;
    tube.y += (ty + driftY - tube.y) * tube.speed * deltaScale;

    tube.trail.unshift({ x: tube.x, y: tube.y });
    tube.trail.pop();

    var grad = this.ctx.createLinearGradient(0, 0, this.width, this.height);
    grad.addColorStop(0, tube.color + '00');
    grad.addColorStop(0.35, tube.color + '66');
    grad.addColorStop(0.7, tube.color + '44');
    grad.addColorStop(1, tube.color + '00');

    this.ctx.beginPath();
    for (var i = 0; i < tube.trail.length; i += 1) {
      var p = tube.trail[i];
      if (i === 0) {
        this.ctx.moveTo(p.x, p.y);
      } else {
        var prev = tube.trail[i - 1];
        this.ctx.quadraticCurveTo(prev.x, prev.y, (prev.x + p.x) * 0.5, (prev.y + p.y) * 0.5);
      }
    }

    this.ctx.lineWidth = tube.width;
    this.ctx.strokeStyle = grad;
    this.ctx.shadowColor = tube.color;
    this.ctx.shadowBlur = 20;
    this.ctx.stroke();
  };

  TubesCursor.prototype.frame = function (time) {
    if (!this.running) return;

    var delta = this.lastTime > 0 ? Math.min(time - this.lastTime, 48) : 16;
    this.lastTime = time;
    var scale = delta / 16.67;

    if (!this.inside && this.options.idleMotion !== false) {
      this.target.x = 0.5 + Math.sin(time * 0.00052) * 0.15;
      this.target.y = 0.5 + Math.cos(time * 0.00041) * 0.13;
    }

    this.pointer.x += (this.target.x - this.pointer.x) * this.options.tubes.follow * scale;
    this.pointer.y += (this.target.y - this.pointer.y) * this.options.tubes.follow * scale;

    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.fillStyle = 'rgba(4, 6, 15, ' + this.options.fadeAlpha + ')';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.globalCompositeOperation = 'lighter';
    this.drawLights(time);
    for (var i = 0; i < this.tubes.length; i += 1) {
      this.drawTube(this.tubes[i], time, scale);
    }
    this.ctx.globalCompositeOperation = 'source-over';

    this.raf = requestAnimationFrame(this.frame.bind(this));
  };

  TubesCursor.prototype.play = function () {
    if (this.running) return;
    this.running = true;
    this.raf = requestAnimationFrame(this.frame.bind(this));
  };

  TubesCursor.prototype.pause = function () {
    if (!this.running) return;
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  };

  TubesCursor.prototype.destroy = function () {
    this.pause();
    this.unbind();
    this.ctx.clearRect(0, 0, this.width, this.height);
  };

  TubesCursor.prototype.setColors = function (colors) {
    if (!Array.isArray(colors) || colors.length === 0) return;
    for (var i = 0; i < this.tubes.length; i += 1) {
      this.tubes[i].color = colors[i % colors.length];
    }
    this.options.tubes.colors = colors.slice(0);
  };

  TubesCursor.prototype.setLightsColors = function (colors) {
    if (!Array.isArray(colors) || colors.length === 0) return;
    this.options.tubes.lights.colors = colors.slice(0);
  };

  function createTubesCursor(canvas, options) {
    var instance = new TubesCursor(canvas, options);
    return {
      tubes: {
        setColors: instance.setColors.bind(instance),
        setLightsColors: instance.setLightsColors.bind(instance),
      },
      play: instance.play.bind(instance),
      pause: instance.pause.bind(instance),
      resize: instance.resize.bind(instance),
      destroy: instance.destroy.bind(instance),
      _instance: instance,
    };
  }

  return createTubesCursor;
});
